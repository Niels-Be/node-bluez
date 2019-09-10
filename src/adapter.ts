import { OrgBluezAdapter1 } from "./dbus/adapter";
import { Device } from "./device";
import { DBusError } from "dbus-next";


export class Adapter extends OrgBluezAdapter1 {


    public async getDevice(name: string): Promise<Device> {
        const node = this.dbusObject.nodes.find(objPath => {
            const path = objPath.split("/");
            return path[path.length - 1] === name;
        });
        if(node === undefined) throw new DBusError("org.bluez.Error.DoesNotExist", "Device not found");
        const obj = await this.dbusObject.bus.getProxyObject("org.bluez", node);
        return new Device(obj);
    }

    public listDevices(): Promise<Device[]> {
        return Promise.all(this.dbusObject.nodes.map(async (node) => {
            const obj = await this.dbusObject.bus.getProxyObject("org.bluez", node);
            return new Device(obj);
        }));
    }

    // TODO: add events for: DeviceAdded and DeviceRemoved
}