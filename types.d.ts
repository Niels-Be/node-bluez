
import * as stream from 'stream';
import * as DBus from 'dbus';

declare class Bluez extends NodeJS.EventEmitter {
    constructor(options?: {
        bus?: DBus.DBusConnection,
        service?: DBus.DBusService | string | null,
        objectPath?: string
    });
    getAdapter(dev?: string): Promise<Bluez.Adapter>;
    findAdapter(filterFn: (props: any) => boolean): Promise<Bluez.Adapter | null>;
    getDevice(address: string): Promise<Bluez.Device>;
    findDevice(filterFn: (props: Bluez.DeviceProps) => boolean): Promise<Bluez.Device | null>;
    getAllDevicesProps(): Bluez.DeviceProps[];

    getUserService(): any;
    getUserServiceObject(): any;
    init(): Promise<void>;
    registerAgent(agent: Bluez.Agent, capabilities: "DisplayOnly" | "DisplayYesNo" | "KeyboardOnly" | "NoInputNoOutput" | "KeyboardDisplay", requestAsDefault?: boolean): Promise<void>;
    registerStaticKeyAgent(pin: number | string, requestAsDefault?: boolean): Promise<void>;
    registerSimplePairingAgent(requestAsDefault?: boolean): Promise<void>;
    registerProfile(profile: Bluez.Profile, options: any): Promise<void>;
    registerSerialProfile(listener: (device: Bluez.Device, socket: Bluez.BluetoothSocket) => void, mode?: string, options?: stream.DuplexOptions): Promise<void>;

    on(event: "device", listener: (address: string, props: Bluez.DeviceProps) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
}
declare namespace Bluez {
    class DbusInterfaceBase extends NodeJS.EventEmitter {
        constructor(dbusInterface: DBus.DBusInterface, bluez: Bluez);

        getProperties(): Promise<any>;
        getProperty(name: string): Promise<any>;
        setProperty(name: string, value: any): Promise<void>;

        on(event: "PropertiesChanged", listener: (properties: { [key: string]: any }, invalidated: string[]) => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;
    }
    class Adapter extends DbusInterfaceBase {
        RemoveDevice(devicePath: string | Device): Promise<void>;
        SetDiscoveryFilter(filter: any): Promise<void>;
        GetDiscoveryFilters(): Promise<string[]>;
        StartDiscovery(): Promise<void>;
        StopDiscovery(): Promise<void>;

        Address(): Promise<string>;
        Alias(): Promise<string>;
        Alias(value: string): Promise<void>;
        Class(): Promise<number>;
        Discoverable(): Promise<boolean>;
        Discoverable(value: boolean): Promise<void>;
        DiscoverableTimeout(): Promise<number>;
        DiscoverableTimeout(value: number): Promise<void>;
        Discovering(): Promise<boolean>;
        Modalias(): Promise<string>;
        Name(): Promise<string>;
        Pairable(): Promise<boolean>;
        Pairable(value: boolean): Promise<void>;
        PairableTimeout(): Promise<void>;
        PairableTimeout(value: number): Promise<number>;
        Powered(): Promise<boolean>;
        Powered(value: boolean): Promise<void>;
        UUIDs(): Promise<string[]>;
    }
    class Agent {
        constructor(bluez: Bluez, dbusObject: DBus.DBusServiceObject);
        Unregister(): Promise<void>;
        AuthorizeService(callback: (err?: Error | null) => void): void;
        Cancel(callback: (err?: Error | null) => void): void;
        DisplayPasskey(device: string, pincode: number, callback: (err?: Error | null) => void): void;
        DisplayPinCode(device: string, pincode: string, callback: (err?: Error | null) => void): void;
        Release(callback: (err?: Error | null) => void): void;
        RequestAuthorization(device: string, callback: (err?: Error | null) => void): void;
        RequestConfirmation(device: string, pincode: string, callback: (err?: Error | null) => void): void;
        RequestPasskey(device: string, callback: (err?: Error | null, pin?: number) => void): void;
        RequestPinCode(device: string, callback: (err?: Error | null, pin?: string) => void): void;
    }
    class StaticKeyAgent extends Agent { }
    class SimplePairingAgent extends Agent { }
    interface DeviceProps {
        Adapter: any;
        Address: string;
        AdvertisingFlags?: any;
        Alias: string;
        Appearance?: number;
        Blocked: boolean;
        Class?: number;
        Connected: boolean;
        Icon?: string;
        LegacyPairing: boolean;
        ManufacturerData?: any;
        Modalias?: string;
        Name?: string;
        Paired: boolean;
        RSSI?: number;
        ServiceData?: any;
        ServicesResolved: boolean;
        Trusted: boolean;
        TxPower?: number;
        UUIDs?: string[];
    }
    class Device extends DbusInterfaceBase {
        getService(uuid: string): Promise<Service | null>;

        Connect(timeout?: number): Promise<void>;
        ConnectProfile(uuid: string, timeout?: number): Promise<void>;
        Disconnect(): Promise<void>;
        DisconnectProfile(uuid: string): Promise<void>;
        Pair(): Promise<void>;
        CancelPairing(): Promise<void>;

        getProperties(): Promise<DeviceProps>;
        getProperty<T extends keyof DeviceProps>(name: T): Promise<DeviceProps[T]>;
        getProperty(name: string): Promise<any>;
        setProperty<T extends keyof DeviceProps>(name: T, value: DeviceProps[T]): Promise<void>;
        setProperty(name: string, value: any): Promise<void>;

        Adapter(): Promise<any>;
        Address(): Promise<string>;
        AdvertisingFlags(): Promise<any>;
        Alias(): Promise<string>;
        Alias(value: string): Promise<void>;
        Appearance(): Promise<number>;
        Blocked(): Promise<boolean>;
        Blocked(value: boolean): Promise<void>;
        Class(): Promise<number>;
        Connected(): Promise<boolean>;
        Icon(): Promise<string>;
        LegacyPairing(): Promise<boolean>;
        ManufacturerData(): Promise<any>;
        Modalias(): Promise<string>;
        Name(): Promise<string>;
        Paired(): Promise<boolean>;
        RSSI(): Promise<number>;
        ServiceData(): Promise<any>;
        ServicesResolved(): Promise<boolean>;
        Trusted(): Promise<boolean>;
        Trusted(value: boolean): Promise<void>;
        TxPower(): Promise<number>;
        UUIDs(): Promise<string[]>;
    }
    class Service extends DbusInterfaceBase {
        getCharacteristic(uuid: string): Promise<Characteristic | null>;

        UUID(): Promise<string>;
        Primary(): Promise<boolean>;
        Device(): Promise<any>;
        Includes(): Promise<any[]>;
    }
    class Characteristic extends DbusInterfaceBase {
        getDescriptor(uuid: string): Promise<Descriptor | null>;

        ReadValue(options?: any): Promise<Buffer>;
        WriteValue(value: Buffer | number[], options?: any): Promise<void>;
        AcquireWrite(options?: any): Promise<BluetoothSocket>;
        AcquireNotify(options?: any): Promise<BluetoothSocket>;
        StartNotify(): Promise<void>;
        StopNotify(): Promise<void>;

        on(event: "notify", listener: (value: Buffer) => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;

        UUID(): Promise<string>;
        Service(): Promise<string>;
        Value(): Promise<Buffer>;
        WriteAcquired(): Promise<boolean>;
        NotifyAcquired(): Promise<boolean>;
        Notifying(): Promise<boolean>;
        Flags(): Promise<string[]>;
    }
    class Descriptor extends DbusInterfaceBase {
        UUID(): Promise<string>;
        Characteristic(): Promise<any>;
        Value(): Promise<number[]>;
        Flags(): Promise<string>;
    }
    class Profile {
        public readonly uuid: string;
        protected bluez: Bluez;
        protected _DBusObject: any;
        protected _DBusInterface: any;

        public constructor(bluez: Bluez, dbusObject: DBus.DBusServiceObject);
        public NewConnection(device: string, fd: number, options: any, callback: Function): void;
        public Release(callback: Function): void;
        public RequestDisconnection(device: string, callback: Function): void;
    }
    class SerialProfile extends Profile {
        public static uuid: string;
        protected listener: Function;

        public constructor(...args: any[]);
        public NewConnection(device: string, fd: number, options: any, callback: Function): void;
    }
    class BluetoothSocket extends stream.Duplex { }
}

export = Bluez;