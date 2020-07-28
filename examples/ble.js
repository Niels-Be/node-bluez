const Bluez = require('..');

function delay(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const bluetooth = new Bluez();
let adapter;

class BluezAgent extends Bluez.Agent {
    constructor(bluez, DbusObject, pin) {
        super(bluez, DbusObject);
        this.pin = pin;
    }

    Release(callback) {
        console.log("Agent Disconnected");
        callback();
    }

    RequestPinCode(device, callback) {
        console.log("Send pass");
        callback(null, this.pin.toString());
    }

    RequestPasskey(device, callback) {
        console.log("Send pin");
        callback(null, parseInt(this.pin, 10));
    }
}

let deviceFound = false;
// Register callback for new devices
bluetooth.on('device', (address, props) => {
    // apply some filtering
    if (props.Name !== "HM10") return;
    deviceFound = true;
    handleDevice(address, props).catch(console.error);
});

bluetooth.init().then(async () => {

    // Register Agent that accepts everything and uses key 1234
    await bluetooth.registerAgent(
        new BluezAgent(bluetooth, bluetooth.getUserServiceObject(), "1234"),
        "KeyboardOnly",
    );
    console.log("Agent registered");

    // listen on first bluetooth adapter
    adapter = await bluetooth.getAdapter('hci0');
    if(!deviceFound) {
        await adapter.StartDiscovery();
        console.log("Discovering");
    }
});

process.on("SIGINT", () => {
    bluetooth.bus.disconnect();
    process.removeAllListeners("SIGINT");
});


async function handleDevice(address, props) {
    console.log("Found new Device " + address + " " + props.Name);

    // Get the device interface
    const device = await bluetooth.getDevice(address);
    if (!props.Connected) {
        console.log("Connecting");
        // try normal connecting first. This might fail, so provide some backup methods
        await device.Connect().catch(() => {
            // also directly connecting to the GATT profile fails for an unknown reason. Maybe a Bluez bug?
            return device.ConnectProfile("0000ffe0-0000-1000-8000-00805f9b34fb");
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

    // on old Bluez versions < 5.48 AcquireNotify and AcquireWrite are not available
    // if thats the case use handleComOld
    await handleCom(device, characteristic);
    //await handleComOld(device, characteristic);

    if (adapter)
        await adapter.StopDiscovery().catch(() => { });

    await device.Disconnect();
    bluetooth.bus.disconnect();
}

async function handleCom(device, characteristic) {
    let hasRead = false;
    // get a notification socket
    const not = await characteristic.AcquireNotify();
    not.on("data", async (data) => {
        console.log("Read: ", data.toString());
        hasRead = true;
    });

    // get a write socket
    const writer = await characteristic.AcquireWrite();
    console.log("Send: Test123");
    writer.write("Test123");
    writer.end();
    while(!hasRead) await delay(100);
    not.end();
}

async function handleComOld(device, characteristic) {
    let hasRead = false;
    // get a notification socket
    await characteristic.StartNotify();
    characteristic.on("notify", (data) => {
        console.log("Read: ", data.toString());
        hasRead = true;
    });

    // get a write socket
    console.log("Send: Test123");
    await characteristic.WriteValue([...Buffer.from("Test123")]);
    while(!hasRead) await delay(100);
    await characteristic.StopNotify();
}
