import { DBusError, ProxyObject } from "dbus-next";
import { Bluez } from "./bluez";
import { OrgBluezGattCharacteristic1 } from "./dbus/GattCharacteristic1";
import { OrgBluezGattDescriptor1Props } from "./dbus/GattDescriptor1";
import { GattDescriptor } from "./gattDescriptor";

export class GattCharacteristic extends OrgBluezGattCharacteristic1 {
    constructor(dbusObject: ProxyObject, private bluez: Bluez) {
        super(dbusObject);
    }

    /**
     * Find a Gatt Descriptor by UUID
     * @param uuid
     * @throws {DBusError} org.bluez.Error.DoesNotExist
     */
    public async getDescriptor(uuid: string): Promise<GattDescriptor> {
        const chars = await this.listDescriptors();
        for (const path in chars) {
            if (chars[path].UUID === uuid) {
                return this.bluez.getDbusObjectInterface(GattDescriptor, path);
            }
        }
        throw new DBusError("org.bluez.Error.DoesNotExist", "Descriptor not found");
    }

    /**
     * Returns a list of known Gatt descriptors of this characteristic
     * It returns key value pairs for each descriptor.
     * The key is the object path and the value is a snapshot of the properties of the descriptor.
     * To get the full descriptor interface use `Bluez.getDbusObjectInterface(GattDescriptor, key)`
     */
    public async listDescriptors(): Promise<{ [key: string]: Partial<OrgBluezGattDescriptor1Props> }> {
        const objs = await this.bluez.getObjectManager().GetManagedObjects();
        return Object.fromEntries(
            Object.entries(objs)
                .filter(
                    ([path, ifs]) => path.startsWith(this.dbusObject.path) && GattDescriptor.DbusInterfaceName in ifs,
                )
                .map(([path, ifs]) => [path, ifs[GattDescriptor.DbusInterfaceName]]),
        );
    }
}
