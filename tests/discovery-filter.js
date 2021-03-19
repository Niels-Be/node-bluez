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
        RSSI: new Variant("n", 5), // need to use variant to set correct data type
        DuplicateData: true,
    });

    a.on("DeviceAdded", (address) => {
        console.log("Found device: ", address);
    });

    console.log("Start discovery");
    await a.StartDiscovery();
    await delay(3000);
    await a.StopDiscovery();

    b.getBus().disconnect();
}
run()
    .then(() => console.log("DONE"))
    .catch(console.error);
