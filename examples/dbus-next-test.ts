import { Bluez } from "../src/bluez";
import * as DBus from 'dbus-next';

const bus = DBus.systemBus();

function delay(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

async function run() {
    const bluez = new Bluez({bus: bus});
    await bluez.init();

    const adapter = await bluez.getAdapter();
    const devs = await adapter.listDevices();
    await adapter.StartDiscovery();
    await delay(3000);
    console.log("Found: " + devs.length + " devices");
    console.log(await devs[0].getProperties());
    await adapter.StopDiscovery();
}

async function run2() {
    const bluezRootObject = await bus.getProxyObject("org.bluez", "/org/bluez");
    console.log(bluezRootObject);
}

run().catch(console.error).then(()=>bus.disconnect());