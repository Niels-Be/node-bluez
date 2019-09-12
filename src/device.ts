import { OrgBluezDevice1 } from "./dbus/device";
import { Service } from "./gattService";
import { DBusError } from "dbus-next";


export class Device extends OrgBluezDevice1 {

    public async getService(uuid: string): Promise<Service> {
        const services = await this.listServices();
        for(let s of services) {
            const serviceUUID = await s.UUID();
            if(serviceUUID === uuid) {
                return s;
            }
        }
        throw new DBusError("org.bluez.Error.DoesNotExist", "Service not found");
    }

    public listServices(): Promise<Service[]> {
        return Promise.all(this.dbusObject.nodes.map(async (node) => {
            const obj = await this.dbusObject.bus.getProxyObject("org.bluez", node);
            return new Service(obj);
        }));
    }
}