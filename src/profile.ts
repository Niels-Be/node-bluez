import { Device } from "./device";

export interface ProfileOptions {
    /**
        string Name
            Human readable name for the profile
    */
    Name: string;
    /**
        string Service
            The primary service class UUID
            (if different from the actual
                profile UUID)
    */
    Service: string;
    /**
        string Role
            For asymmetric profiles that do not
            have UUIDs available to uniquely
            identify each side this
            parameter allows specifying the
            precise local role.
            Possible values: "client", "server"
    */
    Role: string;
    /**
        uint16 Channel
            RFCOMM channel number that is used
            for client and server UUIDs.
            If applicable it will be used in the
            SDP record as well.
    */
    Channel: number;
    /**
        uint16 PSM
            PSM number that is used for client
            and server UUIDs.
            If applicable it will be used in the
            SDP record as well.
    */
    PSM: number;
    /**
        boolean RequireAuthentication
            Pairing is required before connections
            will be established. No devices will
            be connected if not paired.
    */
    RequireAuthentication: boolean;
    /**
        boolean RequireAuthorization
            Request authorization before any
            connection will be established.
    */
    RequireAuthorization: boolean;
    /**
        boolean AutoConnect
            In case of a client UUID this will
            force connection of the RFCOMM or
            L2CAP channels when a remote device
            is connected.
    */
    AutoConnect: boolean;
    /**
        string ServiceRecord
            Provide a manual SDP record.
    */
    ServiceRecord: string;
    /**
        uint16 Version
            Profile version (for SDP record)
    */
    Version: number;
    /**
        uint16 Features
            Profile features (for SDP record)
    */
    Features: number;
}

export interface Profile {
    readonly ProfileOptions: Partial<ProfileOptions>;
    readonly UUID: string;

    /**
    void Release() [noreply]
    
        This method gets called when the service daemon
        unregisters the profile. A profile can use it to do
        cleanup tasks. There is no need to unregister the
        profile, because when this method gets called it has
        already been unregistered.
    */
    Release?(): Promise<void>;

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
    NewConnection(device: Device, fd: number, options: { [name: string]: any }): Promise<void> | void;
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
    RequestDisconnection?(device: Device): Promise<void> | void;
}
