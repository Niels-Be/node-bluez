class Service {

    constructor(interface_) {
        this._interface = interface_;

        this.characteristics = {};
    }

    getCharacteristic(uuid) {
        return this.characteristics[uuid];
    }

    /****** Properties ******/

    getProperties() {
        return new Promise((resolve, reject) => {
            this._interface.getProperties((err, props) => {
                if (err) return reject(err);
                resolve(props);
            })
        });
    }

    getProperty(name) {
        return new Promise((resolve, reject) => {
            this._interface.getProperty(name, (err, val) => {
                if (err) return reject(err);
                resolve(val);
            })
        });
    }

    setProperty(name, value) {
        return new Promise((resolve, reject) => {
            this._interface.setProperty(name, value, (err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

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

module.exports = Service;
