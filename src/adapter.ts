import { OrgBluezAdapter1 } from "./dbus/adapter";
import { Device } from "./device";
import { DBusError, ProxyObject } from "dbus-next";
import { Bluez } from "./bluez";


export class Adapter extends OrgBluezAdapter1 {

    constructor(dbusObject: ProxyObject, private bluez: Bluez) {
        super(dbusObject);

        this.bluez.getObjectManager().on("InterfacesAdded", (objPath, interfaces) => {
            if(objPath.startsWith(dbusObject.path) && "org.bluez.Device1" in interfaces) {
                const props = interfaces['org.bluez.Device1'];
                // TODO: discuss if we should provided the device interface directly or only provide props
                this.emit("DeviceAdded", props.Address, props);
            }
        });
        this.bluez.getObjectManager().on("InterfacesRemoved", (objPath, interfaces) => {
            if(objPath.startsWith(dbusObject.path) && "org.bluez.Device1" in interfaces) {
                // get address from dbus node
                const path = objPath.split("/");
                const address = path[path.length - 1].replace(/^dev_/,"").replace(/_/g, ":");
                this.emit("DeviceRemoved", address);
            }
        });
    }

    public getDevice(address: string): Promise<Device> {
        // use dbus node name for faster search
        const nodeName = "dev_" + address.toUpperCase().replace(/:/g, "_");
        const node = this.dbusObject.nodes.find(objPath => {
            const path = objPath.split("/");
            return path[path.length - 1] === nodeName;
        });
        if(node === undefined) throw new DBusError("org.bluez.Error.DoesNotExist", "Device not found");
        return this.bluez.getDeviceFromObject(node);
    }

    public listDevices(): Promise<Device[]> {
        return Promise.all(this.dbusObject.nodes.map((node) => {
            return this.bluez.getDeviceFromObject(node);
        }));
    }

}
export declare interface Adapter {
    on(event: "DeviceAdded", listener: (address: string, props: any)=>void): this;
    on(event: "DeviceRemoved", listener: (address: string)=>void): this;
    on(event: string, listener: Function): this;
}