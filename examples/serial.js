const Bluez = require("../dist/");
let BluetoothSocket;
try {
    BluetoothSocket = require("bluetooth-socket");
} catch (err) {
    if (err.message === "Cannot find module 'bluetooth-socket'") {
        console.error("ERROR: " + err.message);
        console.error("This example requires 'bluetooth-socket' module.");
        console.error("Please install it via 'npm install bluetooth-socket");
        process.exit(1);
    } else throw err;
}

const bluetooth = new Bluez.Bluez();
/** @type {Bluez.Adapter} */
let adapter;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const SerialProfile = {
    ProfileOptions: {
        Name: "Node Serial Port",
        Role: "client",
        PSM: 0x0003,
    },
    // Bluetooth SSP uuid
    UUID: "00001101-0000-1000-8000-00805f9b34fb",

    NewConnection: async function (device, fd, options) {
        try {
            const name = await device.Name();
            console.log("Serial Connection from " + name);
            // Get a socket from the RFCOMM FD
            const socket = new BluetoothSocket(3);
            // The socket is a standard nodejs duplex stream.
            // Now you can communicate with the device like it was a network socket
            socket.on("data", (data) => console.log(data));
            socket.write("Hello World!\n");
            (async function () {
                await delay(60000);
                console.log("end");
                socket.end();
                await device.Disconnect();
                console.log("dev disconnected");
                await bluetooth.getBus().disconnect();
                console.log("bus disconnected");
            })().catch(console.error);
        } catch (err) {
            console.error(err);
        }
    },
};

// callback for discovered devices
async function discoverDevice(address, props) {
    console.log("Found new Device " + address + " " + props.Name);
    // apply some filtering
    if (props.Name !== "HC-05") return false;

    // Get the device interface
    const device = await adapter.getDevice(address);

    // Pair with the device if not already done
    // Not pairing twice will throw an error
    if (!props.Paired) {
        console.log("Pairing ...");
        await device.Pair().catch((err) => {
            console.error("Error while pairing to device " + address + ": " + err.message);
            throw err;
        });
        await delay(1000);
    }
    // Connect to the Serial Service
    console.log("Connecting ...");
    await device.ConnectProfile(SerialProfile.UUID).catch((err) => {
        console.error("Error while connecting to device " + address + ": " + err.message);
        // during development devices might get suck in a invalid state.
        // if thats the case remove the device and try again
        if (err.message === "Operation not supported") {
            console.log("Removing device");
            return adapter.RemoveDevice(device.dbusObject.path).then(() => {
                throw err;
            });
        }
        throw err;
    });
    console.log("Success");
    return true;
}
async function run() {
    await bluetooth.init();

    // Register Agent that accepts everything and uses key 1234
    await bluetooth.registerAgent(new Bluez.SimpleAgent("1234"), true);
    //console.log("Agent registered");

    // Register the Serial Client Service
    await bluetooth.registerProfile(SerialProfile);
    console.log("SerialProfile registered");

    // listen on first bluetooth adapter
    adapter = await bluetooth.getAdapter();
    // check if we are already paired with the device we are looking for
    const devices = await adapter.listDevices();
    for (dev of devices) {
        const props = await dev.getProperties();
        if (await discoverDevice(props.Address, props).catch(() => false)) return;
    }

    // otherwise start discovery
    adapter.on("DeviceAdded", discoverDevice);
    await adapter.StartDiscovery();
    console.log("Discovering");
    await delay(10000);
    console.log("Nothing found in time");
    await bluetooth.getBus().disconnect();
}
run().catch(console.error);
