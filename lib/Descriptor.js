class Descriptor {
    constructor(interface_) {
        this._interface = interface_;
    }

    /*
    array{byte} ReadValue(dict flags)

        Issues a request to read the value of the
        characteristic and returns the value if the
        operation was successful.

        Possible options: "offset": Start offset
                    "device": Device path (Server only)
                    "link": Link type (Server only)

        Possible Errors: org.bluez.Error.Failed
                    org.bluez.Error.InProgress
                    org.bluez.Error.NotPermitted
                    org.bluez.Error.NotAuthorized
                    org.bluez.Error.NotSupported
    */
    ReadValue(flags) {
        return new Promise((resolve, reject) => {
            this._interface.ReadValue(flags, (err, arr) => {
                if (err) return reject(err);
                resolve(arr);
            })
        });
    }

    /*
    void WriteValue(array{byte} value, dict flags)

        Issues a request to write the value of the
        characteristic.

        Possible options: "offset": Start offset
                    "device": Device path (Server only)
                    "link": Link type (Server only)
                    "prepare-authorize": boolean Is prepare
                                authorization
                                request

        Possible Errors: org.bluez.Error.Failed
                    org.bluez.Error.InProgress
                    org.bluez.Error.NotPermitted
                    org.bluez.Error.InvalidValueLength
                    org.bluez.Error.NotAuthorized
                    org.bluez.Error.NotSupported
    */
    WriteValue(value, flags) {
        return new Promise((resolve, reject) => {
            this._interface.StopDiscovery(value, flags, (err) => {
                if (err) return reject(err);
                resolve();
            })
        });
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

        128-bit descriptor UUID.
    */
    get UUID() {
        return this.getProperty("UUID");
    }

    /*
    object Characteristic [read-only]

        Object path of the GATT characteristic the descriptor
        belongs to.
    */
    get Characteristic() {
        return this.getProperty("Characteristic");
    }

    /*
    array{byte} Value [read-only, optional]

        The cached value of the descriptor. This property
        gets updated only after a successful read request, upon
        which a PropertiesChanged signal will be emitted.
    */
    get Value() {
        return this.getProperty("Value");
    }

    /*
    array{string} Flags [read-only]

        Defines how the descriptor value can be used.

        Possible values:

        "read"
        "write"
        "encrypt-read"
        "encrypt-write"
        "encrypt-authenticated-read"
        "encrypt-authenticated-write"
        "secure-read" (Server Only)
        "secure-write" (Server Only)
        "authorize"
    */
    get Flags() {
        return this.getProperty("Flags");
    }
}

module.exports = Descriptor;
