const Bluez = require("../dist");
const BluetoothSocket = require("bluetooth-socket");

async function run() {
    const b = new Bluez.Bluez();
    await b.init();
    const a = await b.getAdapter();
    const d = await a.getDevice("80:E1:26:08:94:85");
    const s = await d.getGattService("0000ffe0-0000-1000-8000-00805f9b34fb");
    const c = await s.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");

    console.log("Connecting to dev");
    await d.Connect();

    // get a notification socket
    const [notifierFd] = await c.AcquireNotify();
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
    const [writerFd] = await c.AcquireWrite();
    const writer = new BluetoothSocket(writerFd);
    console.log("Send: Test123");
    writer.write("Test123");
    writer.end();
}
run()
    .then(() => console.log("DONE"))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
