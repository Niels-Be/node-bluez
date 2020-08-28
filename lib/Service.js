const DbusInterfaceBase = require("./DbusInterfaceBase");
const Characteristic = require("./Characteristic");

class Service extends DbusInterfaceBase {

    getCharacteristic(uuid) {
        return this._bluez.getInterfaceInstance(Characteristic.INTERFACE_NAME, Characteristic, this._interface.objectPath, (d) => d.UUID === uuid);
    }

    /****** Properties ******/

    /*
    string UUID [read-only]

        128-bit service UUID.
    */
    UUID() {
        return this.getProperty("UUID");
    }

    /*
    boolean Primary [read-only]

        Indicates whether or not this GATT service is a
        primary service. If false, the service is secondary.
    */
    Primary() {
        return this.getProperty("Primary");
    }

    /*
    object Device [read-only, optional]

        Object path of the Bluetooth device the service
        belongs to. Only present on services from remote
        devices.
    */
    Device() {
        return this.getProperty("Device");
    }

    /*
    array{object} Includes [read-only, optional]

        Array of object paths representing the included
        services of this service.
    */
    Includes() {
        return this.getProperty("Includes");
    }
}

Service.INTERFACE_NAME = "org.bluez.GattService1";

module.exports = Service;
