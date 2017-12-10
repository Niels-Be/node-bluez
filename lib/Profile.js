class Profile {

    constructor(bluez, DbusObject) {
        this.bluez = bluez;
        this._DBusObject = DbusObject;
        this._DBusInterface = DbusObject.createInterface('org.bluez.Profile1');

        this._DBusInterface.addMethod('Release', {}, (callback) => {
            this.Release(callback);
        });

        this._DBusInterface.addMethod('NewConnection', { in: [{
                type: 'o',
                name: 'device'
            }, {
                type: 'h',
                name: 'fd'
            }, {
                type: 'a{sv}',
                name: 'fd_properties'
            }]
        }, (device, fd, options, callback) => {
            this.NewConnection(device, fd, options, callback);
        });

        this._DBusInterface.addMethod('RequestDisconnection', { in: [{
                type: 'o',
                name: 'device'
            }]
        }, (device, callback) => {
            this.RequestDisconnection(device, callback);
        });

        this._DBusInterface.update();
    }

    get uuid() {
        return "";
    }


    /*
    void Release() [noreply]
    
        This method gets called when the service daemon
        unregisters the profile. A profile can use it to do
        cleanup tasks. There is no need to unregister the
        profile, because when this method gets called it has
        already been unregistered.
    */
    Release(callback) {
        callback();
    }
    /*
    void NewConnection(object device, fd, dict fd_properties)
    
        This method gets called when a new service level
        connection has been made and authorized.
    
        Common fd_properties:
    
        uint16 Version		Profile version (optional)
        uint16 Features		Profile features (optional)
    
        Possible errors: org.bluez.Error.Rejected
                            org.bluez.Error.Canceled
    */
    NewConnection(device, fd, options, callback) {
        callback();
    }
    /*
    void RequestDisconnection(object device)
    
        This method gets called when a profile gets
        disconnected.
    
        The file descriptor is no longer owned by the service
        daemon and the profile implementation needs to take
        care of cleaning up all connections.
    
        If multiple file descriptors are indicated via
        NewConnection, it is expected that all of them
        are disconnected before returning from this
        method call.
    
        Possible errors: org.bluez.Error.Rejected
                            org.bluez.Error.Canceled
    */
    RequestDisconnection(device, callback) {
        callback();
    }

}

module.exports = Profile;
