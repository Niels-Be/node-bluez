import * as DBus from "dbus-next";
import { Bluez } from "./bluez";
import { Profile } from "./profile";
import Debug from "debug";
const debug = Debug("bluez:ProfileWrapper");

export class ProfileWrapper extends DBus.interface.Interface {
    private impl: Profile;
    private bluez: Bluez;

    constructor(profile: Profile, bluez: Bluez) {
        super("org.bluez.Profile1");
        this.impl = profile;
        this.bluez = bluez;
    }

    /**
    void Release() [noreply]
    
        This method gets called when the service daemon
        unregisters the profile. A profile can use it to do
        cleanup tasks. There is no need to unregister the
        profile, because when this method gets called it has
        already been unregistered.
    */
    Release() {
        debug("Release");
        if (this.impl.Release) return this.impl.Release();
    }

    /**
    void NewConnection(object device, fd, dict fd_properties)

        This method gets called when a new service level
        connection has been made and authorized.

        Common fd_properties:

        uint16 Version		Profile version (optional)
        uint16 Features		Profile features (optional)

        Possible errors: org.bluez.Error.Rejected
                         org.bluez.Error.Canceled
    */
    async NewConnection(device: DBus.ObjectPath, fd: number, options: { [name: string]: any }) {
        debug("NewConnection", device);
        const dev = await this.bluez.getDeviceFromObject(device);
        return this.impl.NewConnection(dev, fd, options);
    }
    /**
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
    async RequestDisconnection(device: DBus.ObjectPath) {
        debug("RequestDisconnection", device);
        if (this.impl.RequestDisconnection) {
            const dev = await this.bluez.getDeviceFromObject(device);
            return this.impl.RequestDisconnection(dev);
        }
    }
}
ProfileWrapper.configureMembers({
    methods: {
        Release: {},
        NewConnection: { inSignature: "oha{sv}" },
        RequestDisconnection: { inSignature: "o" },
    },
});
