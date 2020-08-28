const Bluez = require('..');

const bluetooth = new Bluez();

// Register callback for new devices
bluetooth.on('device', async (address, props) => {
    console.log("[NEW] Device:", address, props.Name);
    const dev = await bluetooth.getDevice(address).catch(console.error);
    if (!dev) return;
    dev.on("PropertiesChanged", (props, invalidated) => {
        console.log("[CHG] Device:", address, props, invalidated);
    });
});

bluetooth.init().then(async () => {
    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter();
    await adapter.StartDiscovery();
    console.log("Discovering");
}).catch(console.error);
