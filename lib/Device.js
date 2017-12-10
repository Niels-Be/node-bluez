class Device {

    constructor(_interface) {
        this._interface = _interface;
    }

    /*
    This is a generic method to connect any profiles
    the remote device supports that can be connected
    to and have been flagged as auto-connectable on
    our side. If only subset of profiles is already
    connected it will try to connect currently disconnected
    ones.

    If at least one profile was connected successfully this
    method will indicate success.

    For dual-mode devices only one bearer is connected at
    time, the conditions are in the following order:

        1. Connect the disconnected bearer if already
        connected.

        2. Connect first the bonded bearer. If no
        bearers are bonded or both are skip and check
        latest seen bearer.

        3. Connect last seen bearer, in case the
        timestamps are the same BR/EDR takes
        precedence.

    Possible errors: org.bluez.Error.NotReady
                org.bluez.Error.Failed
                org.bluez.Error.InProgress
                org.bluez.Error.AlreadyConnected
    */
    Connect() {
        return new Promise((resolve, reject)=>{
            this._interface.Connect((err)=>{
                if(err) return reject(err);
                resolve();
            })
        });
    }

    /*
    This method gracefully disconnects all connected
    profiles and then terminates low-level ACL connection.

    ACL connection will be terminated even if some profiles
    were not disconnected properly e.g. due to misbehaving
    device.

    This method can be also used to cancel a preceding
    Connect call before a reply to it has been received.

    For non-trusted devices connected over LE bearer calling
    this method will disable incoming connections until
    Connect method is called again.

    Possible errors: org.bluez.Error.NotConnected
    */
    Disconnect() {
        return new Promise((resolve, reject)=>{
            this._interface.Disconnect((err)=>{
                if(err) return reject(err);
                resolve();
            })
        });
    }

    /*
    This method connects a specific profile of this
    device. The UUID provided is the remote service
    UUID for the profile.

    Possible errors: org.bluez.Error.Failed
                org.bluez.Error.InProgress
                org.bluez.Error.InvalidArguments
                org.bluez.Error.NotAvailable
                org.bluez.Error.NotReady
    */
    ConnectProfile(uuid) {
        return new Promise((resolve, reject)=>{
            this._interface.ConnectProfile(uuid, (err)=>{
                if(err) return reject(err);
                resolve();
            })
        });
    }

    /*
    This method disconnects a specific profile of
    this device. The profile needs to be registered
    client profile.

    There is no connection tracking for a profile, so
    as long as the profile is registered this will always
    succeed.

    Possible errors: org.bluez.Error.Failed
                org.bluez.Error.InProgress
                org.bluez.Error.InvalidArguments
                org.bluez.Error.NotSupported
    */
    DisconnectProfile(uuid) {
        return new Promise((resolve, reject)=>{
            this._interface.DisconnectProfile(uuid, (err)=>{
                if(err) return reject(err);
                resolve();
            })
        });
    }


    /*
    This method will connect to the remote device,
    initiate pairing and then retrieve all SDP records
    (or GATT primary services).

    If the application has registered its own agent,
    then that specific agent will be used. Otherwise
    it will use the default agent.

    Only for applications like a pairing wizard it
    would make sense to have its own agent. In almost
    all other cases the default agent will handle
    this just fine.

    In case there is no application agent and also
    no default agent present, this method will fail.

    Possible errors: org.bluez.Error.InvalidArguments
                org.bluez.Error.Failed
                org.bluez.Error.AlreadyExists
                org.bluez.Error.AuthenticationCanceled
                org.bluez.Error.AuthenticationFailed
                org.bluez.Error.AuthenticationRejected
                org.bluez.Error.AuthenticationTimeout
                org.bluez.Error.ConnectionAttemptFailed
    */
    Pair() {
        return new Promise((resolve, reject)=>{
            this._interface.Pair((err)=>{
                if(err) return reject(err);
                resolve();
            })
        });
    }

    /*
    This method can be used to cancel a pairing
    operation initiated by the Pair method.

    Possible errors: org.bluez.Error.DoesNotExist
                org.bluez.Error.Failed
    */
    CancelPairing() {
        return new Promise((resolve, reject)=>{
            this._interface.CancelPairing((err)=>{
                if(err) return reject(err);
                resolve();
            })
        });
    }

    /****** Properties ******/

    getProperties() {
        return new Promise((resolve, reject)=>{
            this._interface.getProperties((err, props)=>{
                if(err) return reject(err);
                resolve(props);
            })
        });
    }

    getProperty(name) {
        return new Promise((resolve, reject)=>{
            this._interface.getProperty(name, (err, val)=>{
                if(err) return reject(err);
                resolve(val);
            })
        });
    }

    setProperty(name, value) {
        return new Promise((resolve, reject)=>{
            this._interface.setProperty(name, value, (err)=>{
                if(err) return reject(err);
                resolve();
            })
        });
    }


    /*
    string Address [readonly]
    
        The Bluetooth device address of the remote device.
    */
    Address() {
        return this.getProperty("Address");
    }

    /*
    string Name [readonly, optional]

        The Bluetooth remote name. This value can not be
        changed. Use the Alias property instead.

        This value is only present for completeness. It is
        better to always use the Alias property when
        displaying the devices name.

        If the Alias property is unset, it will reflect
        this value which makes it more convenient.
    */
    Name() {
        return this.getProperty("Name");
    }

    /*
    string Icon [readonly, optional]

        Proposed icon name according to the freedesktop.org
        icon naming specification.
    */
    Icon() {
        return this.getProperty("Icon");
    }

    /*
    uint32 Class [readonly, optional]

        The Bluetooth class of device of the remote device.
    */
    Class() {
        return this.getProperty("Class");
    }

    /*
    uint16 Appearance [readonly, optional]

        External appearance of device, as found on GAP service.
    */
    Appearance() {
        return this.getProperty("Appearance");
    }

    /*
    array{string} UUIDs [readonly, optional]

        List of 128-bit UUIDs that represents the available
        remote services.
    */
    UUIDs() {
        return this.getProperty("UUIDs");
    }

    /*
    boolean Paired [readonly]

        Indicates if the remote device is paired.
    */
    Paired() {
        return this.getProperty("Paired");
    }

    /*
    boolean Connected [readonly]

        Indicates if the remote device is currently connected.
        A PropertiesChanged signal indicate changes to this
        status.
    */
    Connected() {
        return this.getProperty("Connected");
    }

    /*
    boolean Trusted [readwrite]

        Indicates if the remote is seen as trusted. This
        setting can be changed by the application.
    */
    Trusted(value) {
        if(value !== undefined) {
            return this.setProperty("Trusted", value);
        }
        return this.getProperty("Trusted");
    }

    /*
    boolean Blocked [readwrite]

        If set to true any incoming connections from the
        device will be immediately rejected. Any device
        drivers will also be removed and no new ones will
        be probed as long as the device is blocked.
    */
    Blocked(value) {
        if(value !== undefined) {
            return this.setProperty("Blocked", value);
        }
        return this.getProperty("Blocked");
    }

    /*
    string Alias [readwrite]

        The name alias for the remote device. The alias can
        be used to have a different friendly name for the
        remote device.

        In case no alias is set, it will return the remote
        device name. Setting an empty string as alias will
        convert it back to the remote device name.

        When resetting the alias with an empty string, the
        property will default back to the remote name.
    */
    Alias(value) {
        if(value !== undefined) {
            return this.setProperty("Alias", value);
        }
        return this.getProperty("Alias");
    }

    /*
    object Adapter [readonly]

        The object path of the adapter the device belongs to.
    */
    Adapter() {
        return this.getProperty("Adapter");
    }

    /*
    boolean LegacyPairing [readonly]

        Set to true if the device only supports the pre-2.1
        pairing mechanism. This property is useful during
        device discovery to anticipate whether legacy or
        simple pairing will occur if pairing is initiated.

        Note that this property can exhibit false-positives
        in the case of Bluetooth 2.1 (or newer) devices that
        have disabled Extended Inquiry Response support.
    */
    LegacyPairing() {
        return this.getProperty("LegacyPairing");
    }

    /*
    string Modalias [readonly, optional]

        Remote Device ID information in modalias format
        used by the kernel and udev.
    */
    Modalias() {
        return this.getProperty("Modalias");
    }

    /*
    int16 RSSI [readonly, optional]

        Received Signal Strength Indicator of the remote
        device (inquiry or advertising).
    */
    RSSI() {
        return this.getProperty("RSSI");
    }

    /*
    int16 TxPower [readonly, optional]

        Advertised transmitted power level (inquiry or
        advertising).
    */
    TxPower() {
        return this.getProperty("TxPower");
    }

    /*
    dict ManufacturerData [readonly, optional]

        Manufacturer specific advertisement data. Keys are
        16 bits Manufacturer ID followed by its byte array
        value.
    */
    ManufacturerData() {
        return this.getProperty("ManufacturerData");
    }

    /*
    dict ServiceData [readonly, optional]

        Service advertisement data. Keys are the UUIDs in
        string format followed by its byte array value.
    */
    ServiceData() {
        return this.getProperty("ServiceData");
    }

    /*
    bool ServicesResolved [readonly]

        Indicate whether or not service discovery has been
        resolved.
    */
    ServicesResolved() {
        return this.getProperty("ServicesResolved");
    }

    /*
    array{byte} AdvertisingFlags [readonly, experimental]

        The Advertising Data Flags of the remote device.
    */
    AdvertisingFlags() {
        return this.getProperty("AdvertisingFlags");
    }

}

module.exports = Device;