const Bluez = require("../dist");

async function run() {
    const b = new Bluez.Bluez();
    await b.init();
    const a = await b.getAdapter();
    const d = await a.getDevice("80:E1:26:08:94:85");
    const s = await d.getGattService("0000ffe0-0000-1000-8000-00805f9b34fb");
    const c = await s.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");

    console.log("Connecting to dev");
    await d.Connect();

    let val = await c.Value();
    console.log(typeof val, val);
    await c.WriteValue(Buffer.from("Test123"));
    val = await c.ReadValue();
    console.log(typeof val, val);

    await d.Disconnect();

    b.getBus().disconnect();
}
run()
    .then(() => console.log("DONE"))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
