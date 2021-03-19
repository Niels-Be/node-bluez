const Bluez = require("../dist/");

const DEVICE_NAME = "SH-A11";
const DEVICE_ADDRESS = "80:E1:26:08:94:85";

function delay(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const bluetooth = new Bluez.Bluez();

async function run() {
    await bluetooth.init();
    // Register Agent that accepts everything and uses key 1234
    await bluetooth.registerAgent(new Bluez.SimpleAgent("1234"), true);
    console.log("Agent registered");

    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter();

    // try finding the device directly by its address
    if (DEVICE_ADDRESS) {
        const dev = await adapter.getDevice(DEVICE_ADDRESS).catch((err) => null);
        if (dev) {
            await handleDevice(dev);
            return;
        }
    }

    // check if we are already paired with the device we are looking for
    const devices = await adapter.listDevices();
    for (const [obj, props] of Object.entries(devices)) {
        if (props.Name === DEVICE_NAME) {
            const dev = await bluetooth.getDeviceFromObject(obj);
            await handleDevice(dev, props);
            return;
        }
    }

    // otherwise start discovery
    adapter.on("DeviceAdded", (address, props) => {
        if (props.Name !== DEVICE_NAME) return;
        adapter.getDevice(address).then(handleDevice).then(adapter.StopDiscovery()).catch(console.error);
    });
    await adapter.StartDiscovery();
    console.log("Discovering");
}

process.on("SIGINT", () => {
    bluetooth.bus.disconnect();
    process.removeAllListeners("SIGINT");
});
run().catch(console.error);

/**
 *
 * @param {Bluez.Device} device
 */
async function handleDevice(device, props) {
    if (!props) {
        props = await device.getProperties();
    }
    console.log("Found new Device " + props.Address + " " + props.Name);

    if (!props.Connected) {
        console.log("Connecting");
        // try normal connecting first. This might fail, so provide some backup methods
        await device.Connect().catch((err) => {
            // also directly connecting to the GATT profile fails for an unknown reason. Maybe a Bluez bug?
            //return device.ConnectProfile("0000ffe0-0000-1000-8000-00805f9b34fb");
            //return device.ConnectProfile("00001101-0000-1000-8000-00805f9b34fb");
            throw err;
        });
    }

    // wait until services are resolved
    console.log("Looking up services");
    for (let i = 0; !(await device.ServicesResolved()); i++) {
        if (i > 100) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const props = await device.getProperties();
            throw new Error("No Services Resolved");
        }
        await delay(100);
    }
    await delay(100);

    // get the Service
    const service = await device.getGattService("0000ffe0-0000-1000-8000-00805f9b34fb");
    if (!service) return console.log("No Service");
    // get the Characteristic from the Service
    const characteristic = await service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");
    if (!characteristic) return console.log("No Characteristic");

    // on new Bluez versions > 5.48 the more efficient AcquireNotify and AcquireWrite are available
    // if thats the case use handleComSocket
    //await handleComSocket(device, characteristic);
    await handleCom(device, characteristic);
}

// Handle Communication for Bluez > 5.48
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleComSocket(device, characteristic) {
    const BluetoothSocket = require("bluetooth-socket");
    // get a notification socket
    const [notifierFd] = await characteristic.AcquireNotify();
    const notifier = new BluetoothSocket(notifierFd);
    notifier.on("data", async (data) => {
        console.log("Read: " + data.toString());

        // end program on recv
        notifier.end();
        await device.Disconnect();
        bluetooth.bus.disconnect();
    });
    notifier.on("close", () => console.log("Notifier closed"));
    notifier.on("error", console.error);

    // End the program after 10sec
    setTimeout(async () => {
        console.log("End by timeout");
        notifier.end();
        await device.Disconnect();
        bluetooth.bus.disconnect();
    }, 10000).unref();

    // get a write socket
    const [writerFd] = await characteristic.AcquireWrite();
    const writer = new BluetoothSocket(writerFd);
    console.log("Send: Test123");
    writer.write("Test123");
    writer.end();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleCom(device, characteristic) {
    // get a notification socket
    await characteristic.StartNotify();
    characteristic.on("PropertiesChanged", async (intf, props, opts) => {
        console.log("Read: " + props.Value.toString("binary"));

        await characteristic.StopNotify();
        // end program on recv
        await device.Disconnect();
        bluetooth.bus.disconnect();
    });
    //const props = await characteristic.getProperties();
    //check for props.Notifying

    // get a write socket
    console.log("Send: Test123");
    await characteristic.WriteValue(Buffer.from("Test123"));
}
