import { OrgBluezGattService1 } from "./dbus/GattService1";
import { DBusError, ProxyObject } from "dbus-next";
import { GattCharacteristic } from "./gattCharacteristic";
import { Bluez } from "./bluez";
import { OrgBluezGattCharacteristic1Props } from "./dbus";

export class GattService extends OrgBluezGattService1 {
    constructor(dbusObject: ProxyObject, private bluez: Bluez) {
        super(dbusObject);
    }

    /**
     * Find a Gatt Characteristic by UUID
     * @param uuid
     * @throws {DBusError} org.bluez.Error.DoesNotExist
     */
    public async getCharacteristic(uuid: string): Promise<GattCharacteristic> {
        const chars = await this.listCharacteristics();
        for (const path in chars) {
            if (chars[path].UUID === uuid) {
                return this.bluez.getDbusObjectInterface(GattCharacteristic, path);
            }
        }
        throw new DBusError("org.bluez.Error.DoesNotExist", "Service not found");
    }

    /**
     * Returns a list of known Gatt characteristics of this service
     * It returns key value pairs for each characteristic.
     * The key is the object path and the value is a snapshot of the properties of the characteristic.
     * To get the full characteristic interface use `Bluez.getDbusObjectInterface(GattCharacteristic, key)`
     */
    public async listCharacteristics(): Promise<{ [key: string]: Partial<OrgBluezGattCharacteristic1Props> }> {
        const objs = await this.bluez.getObjectManager().GetManagedObjects();
        return Object.fromEntries(
            Object.entries(objs)
                .filter(
                    ([path, ifs]) =>
                        path.startsWith(this.dbusObject.path) && GattCharacteristic.DbusInterfaceName in ifs,
                )
                .map(([path, ifs]) => [path, ifs[GattCharacteristic.DbusInterfaceName]]),
        );
    }
}
