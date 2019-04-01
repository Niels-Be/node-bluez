
import * as stream from 'stream';
import * as DBus from 'dbus';

declare class Bluez extends NodeJS.EventEmitter {
    constructor(options?: {
        bus?: DBus,
        service?: DBus.Service | string | null,
        objectPath?: string
    });
    getAdapter(dev: string): Promise<Bluez.Adapter>;
    getDevice(address: string): Promise<Bluez.Device>;
    getUserService(): any;
    getUserServiceObject(): any;
    init(): Promise<void>;
    registerAgent(agent: Bluez.Agent, capabilities: "DisplayOnly" | "DisplayYesNo" | "KeyboardOnly" | "NoInputNoOutput" | "KeyboardDisplay", requestAsDefault?: boolean): Promise<void>;
    registerDummyAgent(requestAsDefault?: boolean): Promise<void>;
    registerProfile(profile: Bluez.Profile, options: any): Promise<void>;
    registerSerialProfile(listener: (device: Bluez.Device, socket: Bluez.RawFdSocket) => void, mode?: string, options?: stream.DuplexOptions): Promise<void>;

    on(event: "device", listener: (address: string, props: any) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
}
declare namespace Bluez {
    class Adapter {
        constructor(...args: any[]);
        RemoveDevice(devicePath: string | Device): Promise<void>;
        SetDiscoveryFilter(filter: any): Promise<void>;
        GetDiscoveryFilters(): Promise<string[]>;
        StartDiscovery(): Promise<void>;
        StopDiscovery(): Promise<void>;

        getProperties(): Promise<any>;
        getProperty(name: string): Promise<any>;
        setProperty(name: string, value: any): Promise<void>;

        Address(): Promise<any>;
        Alias(): Promise<any>;
        Class(): Promise<any>;
        Discoverable(): Promise<any>;
        DiscoverableTimeout(): Promise<any>;
        Discovering(): Promise<any>;
        Modalias(): Promise<any>;
        Name(): Promise<any>;
        Pairable(): Promise<any>;
        PairableTimeout(): Promise<any>;
        Powered(value?: boolean): Promise<void | boolean>;
        UUIDs(): Promise<any>;
    }
    class Agent {
        constructor(...args: any[]);
        Unregister(): Promise<void>;
        AuthorizeService(...args: any[]): void;
        Cancel(...args: any[]): void;
        DisplayPasskey(...args: any[]): void;
        DisplayPinCode(...args: any[]): void;
        Release(...args: any[]): void;
        RequestAuthorization(...args: any[]): void;
        RequestConfirmation(...args: any[]): void;
        RequestPasskey(...args: any[]): void;
        RequestPinCode(...args: any[]): void;
    }
    class Device {
        constructor(...args: any[]);
        Connect(): Promise<void>;
        ConnectProfile(uuid: string): Promise<void>;
        Disconnect(): Promise<void>;
        DisconnectProfile(uuid: string): Promise<void>;
        Pair(): Promise<void>;
        CancelPairing(): Promise<void>;
        
        getProperties(): Promise<any>;
        getProperty(name: string): Promise<any>;
        setProperty(name: string, value: any): Promise<void>;
        
        Adapter(): Promise<any>;
        Address(): Promise<string>;
        AdvertisingFlags(): Promise<any>;
        Alias(): Promise<string>;
        Appearance(): Promise<any>;
        Blocked(): Promise<boolean>;
        Class(): Promise<any>;
        Connected(): Promise<boolean>;
        Icon(): Promise<any>;
        LegacyPairing(): Promise<boolean>;
        ManufacturerData(): Promise<any>;
        Modalias(): Promise<any>;
        Name(): Promise<string>;
        Paired(): Promise<boolean>;
        RSSI(): Promise<any>;
        ServiceData(): Promise<any>;
        ServicesResolved(): Promise<boolean>;
        Trusted(): Promise<boolean>;
        TxPower(): Promise<any>;
        UUIDs(): Promise<string[]>;

        getService(uuid: string): Service | undefined;
    }
    class Service {
        getCharacteristic(uuid: string): Characteristic | undefined;
        //TODO: properties
        getProperties(): Promise<any>;
        getProperty(name: string): Promise<any>;
        setProperty(name: string, value: any): Promise<void>;
    }
    class Characteristic extends NodeJS.EventEmitter {
        getDescriptor(uuid: string): Descriptor | undefined;
        ReadValue(options?: any): Promise<Buffer>;
        WriteValue(value: number[], options?: any): Promise<void>;
        AcquireWrite(options?: any): Promise<RawFdSocket>;
        AcquireNotify(options?: any): Promise<RawFdSocket>;
        StartNotify(): Promise<void>;
        StopNotify(): Promise<void>;

        on(event: "notify", listener: (value: string) => void): this;

        getProperties(): Promise<any>;
        getProperty(name: string): Promise<any>;
        setProperty(name: string, value: any): Promise<void>;

        readonly UUID: Promise<string>;
        readonly Service: Promise<string>;
        readonly Value: Promise<number[]>;
        readonly WriteAcquired: Promise<boolean>;
        readonly NotifyAcquired: Promise<boolean>;
        readonly Notifying: Promise<boolean>;
        readonly Flags: Promise<string[]>;
    }
    class Descriptor {
        //TODO: properties
        getProperties(): Promise<any>;
        getProperty(name: string): Promise<any>;
        setProperty(name: string, value: any): Promise<void>;
    }
    class Profile {
        public readonly uuid: string;
        protected bluez: Bluez;
        protected _DBusObject: any;
        protected _DBusInterface: any;

        public constructor(bluez: Bluez, dbusObject: any);
        public NewConnection(device: string, fd: number, options: any, callback: Function): void;
        public Release(callback: Function): void;
        public RequestDisconnection(device: string, callback: Function): void;
    }
    class RawFdSocket extends stream.Duplex {
        constructor(fd: number, options?: stream.DuplexOptions);
    }
    class SerialProfile extends Profile {
        public static uuid: string;
        protected listener: Function;

        public constructor(...args: any[]);
        public NewConnection(device: string, fd: number, options: any, callback: Function): void;
    }
}

export = Bluez;