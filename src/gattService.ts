import { OrgBluezGattService1 } from "./dbus/service";
import { DBusError } from "dbus-next";
import { Characteristic } from "./gattCharacteristic";

export class Service extends OrgBluezGattService1 {
    
    public async getCharacteristic(uuid: string): Promise<Characteristic> {
        const services = await this.listCharacteristics();
        for(let s of services) {
            const serviceUUID = await s.UUID();
            if(serviceUUID === uuid) {
                return s;
            }
        }
        throw new DBusError("org.bluez.Error.DoesNotExist", "Characteristic not found");
    }

    public listCharacteristics(): Promise<Characteristic[]> {
        return Promise.all(this.dbusObject.nodes.map(async (node) => {
            const obj = await this.dbusObject.bus.getProxyObject("org.bluez", node);
            return new Characteristic(obj);
        }));
    }
}