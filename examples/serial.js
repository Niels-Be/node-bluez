const Bluez = require('..');
let BluetoothSocket;
try {
    BluetoothSocket = require('bluetooth-socket');
} catch (err) {
    if (err.message === "Cannot find module 'bluetooth-socket'") {
        console.error("ERROR: " + err.message);
        console.error("This example requires 'bluetooth-socket' module.");
        console.error("Please install it via 'npm install bluetooth-socket");
        process.exit(1);
    } else throw err;
}

const bluetooth = new Bluez();

const SerialProfile = {
    ProfileOptions: {
        Name: "Node Serial Port",
        Role: "client",
        PSM: 0x0003
    },
    // Bluetooth SSP uuid
    UUID: "00001101-0000-1000-8000-00805f9b34fb",

    NewConnection: async function (device, fd, options) {
        const name = await device.Name();
        console.log("Serial Connection from " + name);
        // Get a socket from the RFCOMM FD
        const socket = new BluetoothSocket(fd);
        // The socket is a standard nodejs duplex stream.
        // Now you can communicate with the device like it was a network socket
        socket.on("data", (data) => console.log(data));
        socket.write("Hello World!\n");
    }
}

// callback for discovered devices
async function discoverDevice(address, props) {
    console.log("Found new Device " + address + " " + props.Name);
    // apply some filtering
    if (props.Name !== "HC05") return false;

    // Get the device interface
    const device = await bluetooth.getDevice(address);

    // Pair with the device if not already done
    // Not pairing twice will throw an error
    if (!props.Paired) {
        await device.Pair().catch((err) => {
            console.error("Error while pairing to device " + address + ": " + err.message);
        });
    }
    // Connect to the Serial Service
    await device.ConnectProfile(SerialProfile.uuid).catch((err) => {
        console.error("Error while connection to device " + address + ": " + err.message);
    });
    return true;
};

bluetooth.init().then(async () => {

    // Register Agent that accepts everything and uses key 1234
    await bluetooth.registerAgent(new SimpleAgent("1234"), true);
    console.log("Agent registered");

    // Register the Serial Client Service
    await bluetooth.registerProfile(SerialProfile);
    console.log("SerialProfile registered");

    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter();
    // check if we are already paired with the device we are looking for
    const devices = await adapter.listDevices();
    for (dev of devices) {
        const props = await dev.getProperties();
        if (await discoverDevice(props.Address, props))
            return;
    }

    // otherwise start discovery
    adapter.on("DeviceAdded", discoverDevice);
    await adapter.StartDiscovery();
    console.log("Discovering");
}).catch(console.error);
