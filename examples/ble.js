const Bluez = require('../index');
const child_process = require("child_process");
const { promisify } = require('util');

const exec = promisify(child_process.exec);

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

    RequestPinCode(device, callback) {
        console.log("Send pass");
        callback(null, this.pin);
    }

    RequestPasskey(device, callback) {
        console.log("Send pin");
        callback(null, parseInt(this.pin));
    }
}

// Register callback for new devices
bluetooth.on('device', (address, props) => {
    // apply some filtering
    if (props.Name !== "HM10") return;
    handleDevice(address, props).catch(console.error);
});

bluetooth.init().then(async () => {

    // Register Agent that accepts everything and uses key 1234
    await bluetooth.registerAgent(
        new BluezAgent(bluetooth, bluetooth.getUserServiceObject(), "123456"),
        "KeyboardDisplay"
    );
    console.log("Agent registered");

    // listen on first bluetooth adapter
    adapter = await bluetooth.getAdapter('hci0');
    await adapter.StartDiscovery();
    console.log("Discovering");
});

process.on("SIGINT", () => {
    bluetooth.bus.disconnect();
})


async function handleDevice(address, props) {
    console.log("Found new Device " + address + " " + props.Name);

    // Get the device interface
    const device = await bluetooth.getDevice(address);

    if (!props.Connected) {
        console.log("Connecting");
        // if its a pure BLE device normal device.Connect() will fail
        //await device.Connect();
        await exec("hcitool lecc " + address);
    }

    // wait until services are resolved
    for (let i = 0; !await device.ServicesResolved(); i++) {
        if (i > 100) {
            const props = await device.getProperties();
            throw new Error("No Services found");
        }
        await delay(100);
    }
    await delay(10);

    // get the Service
    const service = device.getService("0000ffe0-0000-1000-8000-00805f9b34fb");
    if (!service) return console.log("No Service");
    // get the Characteristic from the Service
    const characteristic = service.getCharacteristic("00004141-0000-1000-8000-00805f9b34fb");
    if (!characteristic) return console.log("No Characteristic");

    // on old Bluez versions < 5.48 AcquireNotify and AcquireWrite are not available
    // if thats the case use handleComOld
    await handleCom(device, characteristic);
    //await handleComOld(device, characteristic);

    if (adapter)
        await adapter.StopDiscovery().catch(() => { });
}

async function handleCom(device, characteristic) {
    // get a notification socket
    const not = await characteristic.AcquireNotify();
    not.on("data", async (data) => {
        console.log("Read: " + data.toString());

        // end program on recv
        not.end();
        await device.Disconnect();
        bluetooth.bus.disconnect();
    });

    // get a write socket
    const writer = await characteristic.AcquireWrite();
    console.log("Send: Test");
    writer.write("Test");
    writer.end();
}

async function handleComOld(device, characteristic) {
    // get a notification socket
    await characteristic.StartNotify();
    characteristic.changed.on("PropertiesChanged", async (intf, props, opts) => {
        if(intf !== "org.bluez.GattCharacteristic1") return;
        if(!props.Value) return;
        console.log("Read: " + Buffer.from(props.Value).toString());

        await characteristic.StopNotify();
        // end program on recv
        await device.Disconnect();
        bluetooth.bus.disconnect();
    });
    //const props = await characteristic.getProperties();
    //check for props.Notifying

    // get a write socket
    console.log("Send: Test");
    await characteristic.WriteValue([...Buffer.from("Test")]);
}