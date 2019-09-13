const Bluez = require('..');
const child_process = require("child_process");
const { promisify } = require('util');

const exec = promisify(child_process.exec);

function delay(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const bluetooth = new Bluez();

// Register callback for new devices
bluetooth.on('device', (address, props) => {
    // apply some filtering
    if (props.Name !== "HM10") return;
    handleDevice(address, props).catch(console.error);
});

bluetooth.init().then(async () => {

    // Register Agent that accepts everything and uses key 1234
    await bluetooth.registerAgent(new Bluez.SimpleAgent("1234"), true);
    console.log("Agent registered");

    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter();
    // check if we are already paired with the device we are looking for
    const devices = await adapter.listDevices();
    for (dev of devices) {
        if (await dev.Name() === "HM10") {
            await handleDevice(dev);
            return;
        }
    }

    // otherwise start discovery
    adapter.on("DeviceAdded", (address, props) => {
        if (props.Name !== "HM10") return;
        adapter.getDevice(address)
            .then(handleDevice)
            .then(adapter.StopDiscovery())
            .catch(console.error);
    });
    await adapter.StartDiscovery();
    console.log("Discovering");
});

process.on("SIGINT", () => {
    bluetooth.bus.disconnect();
    process.removeAllListeners("SIGINT");
});


async function handleDevice(device) {
    const props = await device.getProperties();
    console.log("Found new Device " + props.Address + " " + props.Name);

    if (!props.Connected) {
        console.log("Connecting");
        // try normal connecting first. This might fail, so provide some backup methods
        await device.Connect().catch(() => {
            // also directly connecting to the GATT profile fails for an unknown reason. Maybe a Bluez bug?
            return device.ConnectProfile("0000ffe0-0000-1000-8000-00805f9b34fb");
        }).catch(() => {
            // connect manually to the device
            return exec("hcitool lecc " + address);
        });
    }

    // wait until services are resolved
    for (let i = 0; !await device.ServicesResolved(); i++) {
        if (i > 100) {
            const props = await device.getProperties();
            throw new Error("No Services Resolved");
        }
        await delay(100);
    }
    await delay(10);

    // get the Service
    const service = device.getService("0000ffe0-0000-1000-8000-00805f9b34fb");
    if (!service) return console.log("No Service");
    // get the Characteristic from the Service
    const characteristic = service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");
    if (!characteristic) return console.log("No Characteristic");

    // on new Bluez versions > 5.48 the more efficient AcquireNotify and AcquireWrite are available
    // if thats the case use handleCom
    //await handleCom(device, characteristic);
    await handleComOld(device, characteristic);
}

// Handle Communication for Bluez > 5.48
async function handleCom(device, characteristic) {
    const BluetoothSocket = require('bluetooth-socket');
    // get a notification socket
    const notifierFd, _1 = await characteristic.AcquireNotify();
    const notifier = new BluetoothSocket(notifierFd);
    notifier.on("data", async (data) => {
        console.log("Read: " + data.toString());

        // end program on recv
        notifier.end();
        await device.Disconnect();
        bluetooth.bus.disconnect();
    });

    // get a write socket
    const writerFd, _2 = await characteristic.AcquireWrite();
    const writer = new BluetoothSocket(writerFd);
    console.log("Send: Test123");
    writer.write("Test123");
    writer.end();
}


async function handleComOld(device, characteristic) {
    // get a notification socket
    await characteristic.StartNotify();
    characteristic.on("PropertiesChanged", async (intf, props, opts) => {
        console.log("Read: " + props.Value.value.toString('binary'));

        await characteristic.StopNotify();
        // end program on recv
        await device.Disconnect();
        bluetooth.bus.disconnect();
    });
    //const props = await characteristic.getProperties();
    //check for props.Notifying

    // get a write socket
    console.log("Send: Test123");
    await characteristic.WriteValue([...Buffer.from("Test123")]);
}