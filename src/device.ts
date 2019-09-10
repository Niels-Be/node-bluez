import { OrgBluezDevice1 } from "./dbus/device";
import { Service } from "./service";
import { DBusError } from "dbus-next";


export class Device extends OrgBluezDevice1 {

    public async getService(name: string): Promise<Service> {
        const node = this.dbusObject.nodes.find(objPath => {
            const path = objPath.split("/");
            return path[path.length - 1] === name;
        });
        if(node === undefined) throw new DBusError("org.bluez.Error.DoesNotExist", "Service not found");
        const obj = await this.dbusObject.bus.getProxyObject("org.bluez", node);
        return new Device(obj);
    }

    public listServices(): Promise<Service[]> {
        return Promise.all(this.dbusObject.nodes.map(async (node) => {
            const obj = await this.dbusObject.bus.getProxyObject("org.bluez", node);
            return new Device(obj);
        }));
    }
}