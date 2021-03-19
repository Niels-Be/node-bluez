import { GattService } from "./gattService";
import { DBusError, ProxyObject } from "dbus-next";
import { OrgBluezDevice1 } from "./dbus/Device1";
import { MediaControl } from "./mediaControl";
import { OrgBluezGattService1Props } from "./dbus/GattService1";
import { Bluez } from "./bluez";

export class Device extends OrgBluezDevice1 {
    constructor(dbusObject: ProxyObject, private bluez: Bluez) {
        super(dbusObject);
    }

    /**
     * Find a Gatt Service by UUID
     * @param uuid
     * @throws {DBusError} org.bluez.Error.DoesNotExist
     */
    public async getGattService(uuid: string): Promise<GattService> {
        const services = await this.listGattServices();
        for (const path in services) {
            if (services[path].UUID === uuid) {
                return this.bluez.getDbusObjectInterface(GattService, path);
            }
        }
        throw new DBusError("org.bluez.Error.DoesNotExist", "Service not found");
    }

    /**
     * Returns a list of known Gatt services
     * It returns key value pairs for each service.
     * The key is the object path and the value is a snapshot of the properties of the service.
     * To get the full service interface use `Bluez.getDbusObjectInterface(GattService, key)`
     */
    public async listGattServices(): Promise<{ [key: string]: Partial<OrgBluezGattService1Props> }> {
        const objs = await this.bluez.getObjectManager().GetManagedObjects();
        return Object.fromEntries(
            Object.entries(objs)
                .filter(([path, ifs]) => path.startsWith(this.dbusObject.path) && GattService.DbusInterfaceName in ifs)
                .map(([path, ifs]) => [path, ifs[GattService.DbusInterfaceName]]),
        );
    }

    /**
     * Returns the MediaControl interface if available
     */
    public getMediaControl(): MediaControl | null {
        // TODO: interfaces is a fixed snapshot at time of object creation,
        //       we might need to just try to create the interface
        if (this.dbusObject.interfaces[MediaControl.DbusInterfaceName]) {
            return new MediaControl(this.dbusObject);
        }
        return null;
    }
}
