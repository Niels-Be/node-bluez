const { Variant } = require("dbus-next");
const Bluez = require("../dist");

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
    const b = new Bluez.Bluez();
    await b.init();
    const a = await b.getAdapter();

    await a.SetDiscoveryFilter({
        RSSI: new Variant("n", -100), // need to use variant to set correct data type
        DuplicateData: true,
    });

    a.on("DeviceAdded", (address, props) => {
        console.log("Found device:", address, props);
    });

    console.log("Start discovery");
    await a.StartDiscovery();
    await delay(10000);
    await a.StopDiscovery();

    b.getBus().disconnect();
}
run()
    .then(() => console.log("DONE"))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
