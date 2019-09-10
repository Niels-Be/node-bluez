import { Bluez } from "../src/bluez";
import * as DBus from 'dbus-next';

const bus = DBus.systemBus();

async function run() {
    const bluez = new Bluez({bus: bus});
    await bluez.init();

    const adapter = await bluez.getAdapter();
    const devs = await adapter.listDevices();
    console.log(devs.length);
    console.log(await devs[0].getProperties());
}

async function run2() {
    const bluezRootObject = await bus.getProxyObject("org.bluez", "/org/bluez");
    console.log(bluezRootObject);
}

run().catch(console.error).then(()=>bus.disconnect());