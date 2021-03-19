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

// set the target device, either name or address is required
const DEVICE_NAME = "HC05";
const DEVICE_ADDRESS = "98:D3:71:F5:E6:08";

const bluetooth = new Bluez.Bluez();
/** @type {Bluez.Adapter} */
let adapter;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class SerialProfile extends Bluez.SerialProfile {
    async NewConnection(device, fd, options) {
        try {
            const name = await device.Name();
            console.log("Serial Connection from " + name);
            // Get a socket from the RFCOMM FD
            const socket = new BluetoothSocket(fd);
            // The socket is a standard nodejs duplex stream.
            // Now you can communicate with the device like it was a network socket
            socket.on("data", (data) => console.log("DATA:", data));

            // error handling
            socket.on("close", () => console.log("Socket was closed"));
            socket.on("error", console.error);

            // send some data
            socket.write("Hello World!\n");

            // end the connection after 10sec
            setTimeout(async function () {
                console.log("end");
                socket.end();
                await device.Disconnect().catch(console.error);
                console.log("dev disconnected");
                bluetooth.getBus().disconnect();
                console.log("bus disconnected");
            }, 10000);
        } catch (err) {
            console.error(err);
        }
    }
}

// callback for discovered devices
async function discoverDevice(address, props) {
    console.log("Found new Device " + address + " " + props.Name);
    // apply some filtering
    if (address !== DEVICE_ADDRESS && props.Name !== DEVICE_NAME) return false;

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
    await device.ConnectProfile(new SerialProfile().UUID).catch((err) => {
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
    await bluetooth.registerProfile(new SerialProfile());
    console.log("SerialProfile registered");

    // listen on first bluetooth adapter
    adapter = await bluetooth.getAdapter();
    // check if we are already paired with the device we are looking for
    const devices = await adapter.listDevices();
    for (const path in devices) {
        const props = devices[path];
        const deviceFound = await discoverDevice(props.Address, props).catch(() => false);
        if (deviceFound) return;
    }

    // otherwise start discovery
    adapter.on("DeviceAdded", discoverDevice);
    await adapter.StartDiscovery();
    console.log("Discovering");
    await delay(10000);
    await adapter.StopDiscovery();
    console.log("Nothing found in time");
    await bluetooth.getBus().disconnect();
}
run().catch(console.error);
