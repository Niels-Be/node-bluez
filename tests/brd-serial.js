const { Device } = require("../dist/");
const Bluez = require("../dist/");
const BluetoothSocket = require("bluetooth-socket");

const bluez = new Bluez.Bluez();

class TestSerialProfile extends Bluez.SerialProfile {
    async NewConnection(device, fd) {
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
                bluez.getBus().disconnect();
                console.log("DONE");
            }, 10000);
        } catch (err) {
            console.error(err);
        }
    }
}

async function run() {
    await bluez.init();

    const profile = new TestSerialProfile();
    await bluez.registerProfile(profile);

    const adapter = await bluez.getAdapter();

    const device = await adapter.getDevice("98:D3:71:F5:E6:08");
    console.log("Connecting ...");
    await device.ConnectProfile(profile.UUID);
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
