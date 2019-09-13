const Bluez = require(".."); // require('bluez')
const DBus = require('dbus-next');

const bus = DBus.systemBus();

function delay(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

async function run() {
    const bluez = new Bluez({ bus: bus });
    await bluez.init();

    const adapter = await bluez.getAdapter();
    const devs = await adapter.listDevices();
    await adapter.StartDiscovery();
    await delay(3000);
    console.log("Found: " + devs.length + " devices");
    console.log(await devs[0].getProperties());
    await adapter.StopDiscovery();
}

run().catch(console.error).then(() => bus.disconnect());