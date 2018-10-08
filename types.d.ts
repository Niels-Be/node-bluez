
import * as stream from 'stream';
import * as DBus from 'dbus';

export class Bluez extends NodeJS.EventEmitter {
    constructor(options?: {
        bus?: DBus,
        service?: DBus.Service | string | null,
        objectPath?: string
    });
    getAdapter(dev: string): Promise<Adapter>;
    getDevice(address: string): Promise<Device>;
    getUserService(): any;
    getUserServiceObject(): any;
    init(): Promise<void>;
    registerAgent(agent: Agent, capabilities: "DisplayOnly" | "DisplayYesNo" | "KeyboardOnly" | "NoInputNoOutput" | "KeyboardDisplay"): Promise<void>;
    registerDefaultAgent(): Promise<void>;
    registerProfile(profile: Profile, options: any): Promise<void>;
    registerSerialProfile(listener: (device: Device, socket: RawFdSocket) => void, mode?: string): Promise<void>;
}
export namespace Bluez {
    export class Adapter {
        constructor(...args: any[]);
        RemoveDevice(devicePath: string | Device): Promise<void>;
        SetDiscoveryFilter(filter: any): Promise<void>;
        GetDiscoveryFilters(): Promise<string[]>;
        StartDiscovery(): Promise<void>;
        StopDiscovery(): Promise<void>;

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
    export class Agent {
        constructor();
        AuthorizeService(...args: any[]): Promise<any>;
        Cancel(...args: any[]): Promise<any>;
        DisplayPasskey(...args: any[]): Promise<any>;
        DisplayPinCode(...args: any[]): Promise<any>;
        Release(...args: any[]): Promise<any>;
        RequestAuthorization(...args: any[]): Promise<any>;
        RequestConfirmation(...args: any[]): Promise<any>;
        RequestPasskey(...args: any[]): Promise<any>;
        RequestPinCode(...args: any[]): Promise<any>;
    }
    export class Device {
        constructor(...args: any[]);
        Connect(): Promise<void>;
        ConnectProfile(uuid: string): Promise<void>;
        Connected(): Promise<void>;
        Disconnect(): Promise<void>;
        DisconnectProfile(uuid: string): Promise<void>;
        Pair(): Promise<void>;
        CancelPairing(): Promise<void>;

        Adapter(): Promise<any>;
        Address(): Promise<any>;
        AdvertisingFlags(): Promise<any>;
        Alias(): Promise<any>;
        Appearance(): Promise<any>;
        Blocked(): Promise<any>;
        Class(): Promise<any>;
        Icon(): Promise<any>;
        LegacyPairing(): Promise<any>;
        ManufacturerData(): Promise<any>;
        Modalias(): Promise<any>;
        Name(): Promise<any>;
        Paired(): Promise<any>;
        RSSI(): Promise<any>;
        ServiceData(): Promise<any>;
        ServicesResolved(): Promise<any>;
        Trusted(): Promise<any>;
        TxPower(): Promise<any>;
        UUIDs(): Promise<any>;

        getService(uuid: string): Service | undefined;
    }
    export class Service {
        getCharacteristic(uuid: string): Characteristic | undefined;
        //TODO: properties
    }
    export class Characteristic {
        getDescriptor(uuid: string): Descriptor | undefined;
        ReadValue(options?: any): Promise<Buffer>;
        WriteValue(value: number[], options?: any): Promise<void>;
        AcquireWrite(options?: any): Promise<RawFdSocket>;
        AcquireNotify(options?: any): Promise<RawFdSocket>;
        StartNotify(): Promise<void>;
        StopNotify(): Promise<void>;

        //TODO: properties
    }
    export class Descriptor {
        //TODO: properties
    }
    export class Profile {
        constructor(...args: any[]);
        NewConnection(...args: any[]): void;
        Release(...args: any[]): Promise<any>;
        RequestDisconnection(...args: any[]): Promise<any>;
    }
    export class RawFdSocket extends stream.Duplex {
        constructor(fd: number, options?: stream.DuplexOptions);
        close(): void;
    }
    export class SerialProfile extends Profile {
        constructor(...args: any[]);
        NewConnection(...args: any[]): void;
        static uuid: string;
    }
}