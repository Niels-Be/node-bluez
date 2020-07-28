const { EventEmitter } = require('events');

class Characteristic extends EventEmitter {
    constructor(interface_, changed_) {
        super();
        this._interface = interface_;

        this.descriptors = {};
        this.changed = changed_;


        this.onPropertyChanged = (intf, props, opts) => {
            if (intf !== "org.bluez.GattCharacteristic1") return;
            if (!props.Value) return;
            this.emit("notify", Buffer.from(props.Value));
        }
    }

    getDescriptor(uuid) {
        return this.descriptors[uuid];
    }

    /*
    array{byte} ReadValue(dict options)

        Issues a request to read the value of the
        characteristic and returns the value if the
        operation was successful.

        Possible options: "offset": uint16 offset
                    "device": Object Device (Server only)

        Possible Errors: org.bluez.Error.Failed
                    org.bluez.Error.InProgress
                    org.bluez.Error.NotPermitted
                    org.bluez.Error.NotAuthorized
                    org.bluez.Error.InvalidOffset
                    org.bluez.Error.NotSupported
    */
    ReadValue(options = {}) {
        return new Promise((resolve, reject) => {
            this._interface.ReadValue(options, (err, arr) => {
                if (err) return reject(err);
                resolve(Buffer.from(arr));
            })
        });
    }

    /*
    void WriteValue(array{byte} value, dict options)

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
    WriteValue(value = [], options = {}) {
        if (Buffer.isBuffer(value)) {
            value = [...value];
        }
        return new Promise((resolve, reject) => {
            this._interface.WriteValue(value, options, (err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }


    /*
    fd, uint16 AcquireWrite(dict options) [optional]

        Acquire file descriptor and MTU for writing. Usage of
        WriteValue will be locked causing it to return
        NotPermitted error.

        For server the MTU returned shall be equal or smaller
        than the negotiated MTU.

        For client it only works with characteristic that has
        WriteAcquired property which relies on
        write-without-response Flag.

        To release the lock the client shall close the file
        descriptor, a HUP is generated in case the device
        is disconnected.

        Note: the MTU can only be negotiated once and is
        symmetric therefore this method may be delayed in
        order to have the exchange MTU completed, because of
        that the file descriptor is closed during
        reconnections as the MTU has to be renegotiated.

        Possible options: "device": Object Device (Server only)
                    "mtu": Exchanged MTU (Server only)
                    "link": Link type (Server only)

        Possible Errors: org.bluez.Error.Failed
                    org.bluez.Error.NotSupported
    */
    AcquireWrite(options = {}) {
        return new Promise((resolve, reject) => {
            this._interface.AcquireWrite(options, (err, res) => {
                if (err) return reject(err);
                const BluetoothSocket = require("bluetooth-socket");
                resolve(new BluetoothSocket(res[0]));
            })
        });
    }

    /*
    fd, uint16 AcquireNotify(dict options) [optional]

        Acquire file descriptor and MTU for notify. Usage of
        StartNotify will be locked causing it to return
        NotPermitted error.

        For server the MTU returned shall be equal or smaller
        than the negotiated MTU.

        Only works with characteristic that has NotifyAcquired
        which relies on notify Flag and no other client have
        called StartNotify.

        Notification are enabled during this procedure so
        StartNotify shall not be called, any notification
        will be dispatched via file descriptor therefore the
        Value property is not affected during the time where
        notify has been acquired.

        To release the lock the client shall close the file
        descriptor, a HUP is generated in case the device
        is disconnected.

        Note: the MTU can only be negotiated once and is
        symmetric therefore this method may be delayed in
        order to have the exchange MTU completed, because of
        that the file descriptor is closed during
        reconnections as the MTU has to be renegotiated.

        Possible options: "device": Object Device (Server only)
                    "mtu": Exchanged MTU (Server only)
                    "link": Link type (Server only)

        Possible Errors: org.bluez.Error.Failed
                    org.bluez.Error.NotSupported
    */
    AcquireNotify(options = {}) {
        return new Promise((resolve, reject) => {
            this._interface.AcquireNotify(options, (err, res) => {
                if (err) return reject(err);
                const BluetoothSocket = require("bluetooth-socket");
                resolve(new BluetoothSocket(res[0]));
            })
        });
    }

    /*
    void StartNotify()

        Starts a notification session from this characteristic
        if it supports value notifications or indications.

        Possible Errors: org.bluez.Error.Failed
                    org.bluez.Error.NotPermitted
                    org.bluez.Error.InProgress
                    org.bluez.Error.NotSupported
    */
    StartNotify() {
        return new Promise((resolve, reject) => {
            this._interface.StartNotify((err) => {
                if (err) return reject(err);
                this.changed.on('PropertiesChanged', this.onPropertyChanged)
                resolve();
            })
        });
    }

    /*
    void StopNotify()

        This method will cancel any previous StartNotify
        transaction. Note that notifications from a
        characteristic are shared between sessions thus
        calling StopNotify will release a single session.

        Possible Errors: org.bluez.Error.Failed
    */
    StopNotify() {
        return new Promise((resolve, reject) => {
            this._interface.StopNotify((err) => {
                if (err) return reject(err);
                this.changed.removeListener('PropertiesChanged', this.onPropertyChanged);
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

        128-bit characteristic UUID.
    */
    UUID() {
        return this.getProperty("UUID");
    }

    /*
    object Service [read-only]

        Object path of the GATT service the characteristic
        belongs to.
    */
    Service() {
        return this.getProperty("Service");
    }

    /*
    array{byte} Value [read-only, optional]

        The cached value of the characteristic. This property
        gets updated only after a successful read request and
        when a notification or indication is received, upon
        which a PropertiesChanged signal will be emitted.
    */
    Value() {
        return this.getProperty("Value").then(arr => Buffer.from(arr));
    }

    /*
    boolean WriteAcquired [read-only, optional]

        True, if this characteristic has been acquired by any
        client using AcquireWrite.

        For client properties is ommited in case
        'write-without-response' flag is not set.

        For server the presence of this property indicates
        that AcquireWrite is supported.
    */
    WriteAcquired() {
        return this.getProperty("WriteAcquired");
    }

    /*
    boolean NotifyAcquired [read-only, optional]

        True, if this characteristic has been acquired by any
        client using AcquireNotify.

        For client this properties is ommited in case 'notify'
        flag is not set.

        For server the presence of this property indicates
        that AcquireNotify is supported.
    */
    NotifyAcquired() {
        return this.getProperty("NotifyAcquired");
    }

    /*
    boolean Notifying [read-only, optional]

        True, if notifications or indications on this
        characteristic are currently enabled.
    */
    Notifying() {
        return this.getProperty("Notifying");
    }

    /*
    array{string} Flags [read-only]

        Defines how the characteristic value can be used. See
        Core spec "Table 3.5: Characteristic Properties bit
        field", and "Table 3.8: Characteristic Extended
        Properties bit field". Allowed values:

            "broadcast"
            "read"
            "write-without-response"
            "write"
            "notify"
            "indicate"
            "authenticated-signed-writes"
            "reliable-write"
            "writable-auxiliaries"
            "encrypt-read"
            "encrypt-write"
            "encrypt-authenticated-read"
            "encrypt-authenticated-write"
            "secure-read" (Server only)
            "secure-write" (Server only)
            "authorize"
    */
    Flags() {
        return this.getProperty("Flags");
    }
}

module.exports = Characteristic;
