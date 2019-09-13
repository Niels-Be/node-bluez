import { DBusError } from "dbus-next";
import { OrgBluezGattCharacteristic1 } from "./dbus/characteristic";
import { Descriptor } from "./gattDescriptor";

export class Characteristic extends OrgBluezGattCharacteristic1 {

    public async getDescriptor(uuid: string): Promise<Descriptor> {
        const services = await this.listDescriptors();
        for (let s of services) {
            const serviceUUID = await s.UUID();
            if (serviceUUID === uuid) {
                return s;
            }
        }
        throw new DBusError("org.bluez.Error.DoesNotExist", "Descriptor not found");
    }

    public listDescriptors(): Promise<Descriptor[]> {
        return Promise.all(this.dbusObject.nodes.map(async (node) => {
            const obj = await this.dbusObject.bus.getProxyObject("org.bluez", node);
            return new Descriptor(obj);
        }));
    }
}