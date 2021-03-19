import { OrgBluezAdapter1 } from "./dbus/Adapter1";
import { Device } from "./device";
import { DBusError, ProxyObject } from "dbus-next";
import { Bluez } from "./bluez";
import { OrgBluezDevice1Props } from "./dbus/Device1";
import Debug from "debug";
const debug = Debug("bluez:Adapter");

interface AdapterEvents {
    DeviceAdded: (address: string, props: Partial<OrgBluezDevice1Props>) => void;
    DeviceRemoved: (address: string) => void;
}
export class Adapter extends OrgBluezAdapter1<AdapterEvents> {
    constructor(dbusObject: ProxyObject, private bluez: Bluez) {
        super(dbusObject);

        this.bluez.getObjectManager().on("InterfacesAdded", (objPath, interfaces) => {
            if (objPath.startsWith(dbusObject.path) && "org.bluez.Device1" in interfaces) {
                debug("Device Added", objPath);
                // keep subnodes array up to date
                this.dbusObject.nodes.push(objPath);

                const props = interfaces["org.bluez.Device1"];
                this.emit("DeviceAdded", props.Address, props);
            }
        });
        this.bluez.getObjectManager().on("InterfacesRemoved", (objPath, interfaces) => {
            if (objPath.startsWith(dbusObject.path) && "org.bluez.Device1" in interfaces) {
                debug("Device Removed", objPath);
                // keep subnodes array up to date
                this.dbusObject.nodes = this.dbusObject.nodes.filter((p) => p !== objPath);

                // get address from dbus node
                const path = objPath.split("/");
                const address = path[path.length - 1].replace(/^dev_/, "").replace(/_/g, ":");
                this.emit("DeviceRemoved", address);
            }
        });
    }

    /**
     * Find a Device by its address
     * @param address
     * @throws {DBusError} org.bluez.Error.DoesNotExist
     */
    public async getDevice(address: string): Promise<Device> {
        // use dbus node name for faster search
        const nodeName = "dev_" + address.toUpperCase().replace(/:/g, "_");
        const node = this.dbusObject.nodes.find((objPath) => {
            const path = objPath.split("/");
            return path[path.length - 1] === nodeName;
        });
        if (node) {
            return this.bluez.getDeviceFromObject(node);
        }

        // node names are only a cache, load fresh list
        const devs = await this.listDevices();
        for (const [path, dev] of Object.entries(devs)) {
            if (dev.Address === address) {
                return this.bluez.getDeviceFromObject(path);
            }
        }
        throw new DBusError("org.bluez.Error.DoesNotExist", "Device not found");
    }

    /**
     * Returns a list of known devices
     * It returns key value pairs for each device.
     * The key is the object path and the value is a snapshot of the properties of the device.
     * To get the full device interface use `Bluez.getDeviceFromObject(key)`
     */
    public async listDevices(): Promise<{ [key: string]: Partial<OrgBluezDevice1Props> }> {
        const objs = await this.bluez.getObjectManager().GetManagedObjects();
        const res = Object.fromEntries(
            Object.entries(objs)
                .filter(([path, ifs]) => path.startsWith(this.dbusObject.path) && Device.DbusInterfaceName in ifs)
                .map(([path, ifs]) => [path, ifs[Device.DbusInterfaceName]]),
        );
        // update node cache
        this.dbusObject.nodes = Object.keys(res);
        return res;
    }
}
