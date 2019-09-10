import * as DBus from 'dbus-next';
import { EventEmitter } from 'events';

/**
 * org.bluez.Device1
 */
export class OrgBluezDevice1 extends EventEmitter {

    public readonly dbusInterfaceName = 'org.bluez.Device1';
    public dbusObject: DBus.ProxyObject;
    public propertiesDBusInterface: DBus.ClientInterface;
    public thisDBusInterface: DBus.ClientInterface;

    constructor(dbusObject: DBus.ProxyObject) {
        super();
        this.dbusObject = dbusObject;
        this.thisDBusInterface = dbusObject.getInterface('org.bluez.Device1');
        this.propertiesDBusInterface = dbusObject.getInterface('org.freedesktop.DBus.Properties');

        // forward property change events
        this.propertiesDBusInterface.on('PropertiesChanged', (iface: string, changed: any, invalidated: any) => {
            if(iface === this.dbusInterfaceName) {
                this.emit('PropertiesChanged', iface, changed, invalidated);
            }
        });
        // forward all signals
        this.on("newListener", this.thisDBusInterface.on.bind(this.thisDBusInterface));
        this.on("removeListener", this.thisDBusInterface.removeListener.bind(this.thisDBusInterface));
    }

    /***** Properties *****/

    public getProperties(): Promise<{[name: string]: DBus.Variant}> {
        return this.propertiesDBusInterface.GetAll(this.dbusInterfaceName);
    }

    public getProperty(name: string): Promise<DBus.Variant> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, name);
    }

    public setProperty(name: string, value: DBus.Variant): Promise<DBus.Variant> {
        return this.propertiesDBusInterface.Set(this.dbusInterfaceName, name, value);
    }

    //@property({ name: 'Address', signature: 's', access: ACCESS_READ })
    public Address(): Promise<string> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Address');
    }

    //@property({ name: 'AddressType', signature: 's', access: ACCESS_READ })
    public AddressType(): Promise<string> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'AddressType');
    }

    //@property({ name: 'Name', signature: 's', access: ACCESS_READ })
    public Name(): Promise<string> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Name');
    }

    //@property({ name: 'Alias', signature: 's', access: ACCESS_READWRITE })
    
    public Alias(): Promise<string>;
    public Alias(value: string): Promise<void>;
    public Alias(value?: string): Promise<any> {
        if(value !== undefined) {
            return this.propertiesDBusInterface.Set(this.dbusInterfaceName, 'Alias', value);
        } else {
            return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Alias');
        }
    }

    //@property({ name: 'Class', signature: 'u', access: ACCESS_READ })
    public Class(): Promise<number> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Class');
    }

    //@property({ name: 'Appearance', signature: 'q', access: ACCESS_READ })
    public Appearance(): Promise<number> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Appearance');
    }

    //@property({ name: 'Icon', signature: 's', access: ACCESS_READ })
    public Icon(): Promise<string> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Icon');
    }

    //@property({ name: 'Paired', signature: 'b', access: ACCESS_READ })
    public Paired(): Promise<boolean> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Paired');
    }

    //@property({ name: 'Trusted', signature: 'b', access: ACCESS_READWRITE })
    
    public Trusted(): Promise<boolean>;
    public Trusted(value: boolean): Promise<void>;
    public Trusted(value?: boolean): Promise<any> {
        if(value !== undefined) {
            return this.propertiesDBusInterface.Set(this.dbusInterfaceName, 'Trusted', value);
        } else {
            return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Trusted');
        }
    }

    //@property({ name: 'Blocked', signature: 'b', access: ACCESS_READWRITE })
    
    public Blocked(): Promise<boolean>;
    public Blocked(value: boolean): Promise<void>;
    public Blocked(value?: boolean): Promise<any> {
        if(value !== undefined) {
            return this.propertiesDBusInterface.Set(this.dbusInterfaceName, 'Blocked', value);
        } else {
            return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Blocked');
        }
    }

    //@property({ name: 'LegacyPairing', signature: 'b', access: ACCESS_READ })
    public LegacyPairing(): Promise<boolean> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'LegacyPairing');
    }

    //@property({ name: 'RSSI', signature: 'n', access: ACCESS_READ })
    public RSSI(): Promise<number> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'RSSI');
    }

    //@property({ name: 'Connected', signature: 'b', access: ACCESS_READ })
    public Connected(): Promise<boolean> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Connected');
    }

    //@property({ name: 'UUIDs', signature: 'as', access: ACCESS_READ })
    public UUIDs(): Promise<Array<string>> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'UUIDs');
    }

    //@property({ name: 'Modalias', signature: 's', access: ACCESS_READ })
    public Modalias(): Promise<string> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Modalias');
    }

    //@property({ name: 'Adapter', signature: 'o', access: ACCESS_READ })
    public Adapter(): Promise<DBus.ObjectPath> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Adapter');
    }

    //@property({ name: 'ManufacturerData', signature: 'a{qv}', access: ACCESS_READ })
    public ManufacturerData(): Promise<{[key: number]: DBus.Variant}> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'ManufacturerData');
    }

    //@property({ name: 'ServiceData', signature: 'a{sv}', access: ACCESS_READ })
    public ServiceData(): Promise<{[key: string]: DBus.Variant}> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'ServiceData');
    }

    //@property({ name: 'TxPower', signature: 'n', access: ACCESS_READ })
    public TxPower(): Promise<number> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'TxPower');
    }

    //@property({ name: 'ServicesResolved', signature: 'b', access: ACCESS_READ })
    public ServicesResolved(): Promise<boolean> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'ServicesResolved');
    }


    /***** Methods *****/

    //@method({ name: 'Disconnect', inSignature: '', outSignature: '' })
    public Disconnect(): Promise<void> {
        return this.thisDBusInterface.Disconnect();
    }

    //@method({ name: 'Connect', inSignature: '', outSignature: '' })
    public Connect(): Promise<void> {
        return this.thisDBusInterface.Connect();
    }

    //@method({ name: 'ConnectProfile', inSignature: 's', outSignature: '' })
    public ConnectProfile(UUID: string): Promise<void> {
        return this.thisDBusInterface.ConnectProfile(UUID);
    }

    //@method({ name: 'DisconnectProfile', inSignature: 's', outSignature: '' })
    public DisconnectProfile(UUID: string): Promise<void> {
        return this.thisDBusInterface.DisconnectProfile(UUID);
    }

    //@method({ name: 'Pair', inSignature: '', outSignature: '' })
    public Pair(): Promise<void> {
        return this.thisDBusInterface.Pair();
    }

    //@method({ name: 'CancelPairing', inSignature: '', outSignature: '' })
    public CancelPairing(): Promise<void> {
        return this.thisDBusInterface.CancelPairing();
    }

}
/***** Signals for OrgBluezDevice1 *****/
export declare interface OrgBluezDevice1 {
    on(evt: "PropertiesChanged", cb: (iface: string, changedProperties: {[key:string]: any}, invalidatedProperties: string[]) => void): this;
    on(event: string, listener: Function): this;
}

/**
 * org.bluez.MediaControl1
 */
export class OrgBluezMediaControl1 extends EventEmitter {

    public readonly dbusInterfaceName = 'org.bluez.MediaControl1';
    public dbusObject: DBus.ProxyObject;
    public propertiesDBusInterface: DBus.ClientInterface;
    public thisDBusInterface: DBus.ClientInterface;

    constructor(dbusObject: DBus.ProxyObject) {
        super();
        this.dbusObject = dbusObject;
        this.thisDBusInterface = dbusObject.getInterface('org.bluez.MediaControl1');
        this.propertiesDBusInterface = dbusObject.getInterface('org.freedesktop.DBus.Properties');

        // forward property change events
        this.propertiesDBusInterface.on('PropertiesChanged', (iface: string, changed: any, invalidated: any) => {
            if(iface === this.dbusInterfaceName) {
                this.emit('PropertiesChanged', iface, changed, invalidated);
            }
        });
        // forward all signals
        this.on("newListener", this.thisDBusInterface.on.bind(this.thisDBusInterface));
        this.on("removeListener", this.thisDBusInterface.removeListener.bind(this.thisDBusInterface));
    }

    /***** Properties *****/

    public getProperties(): Promise<{[name: string]: DBus.Variant}> {
        return this.propertiesDBusInterface.GetAll(this.dbusInterfaceName);
    }

    public getProperty(name: string): Promise<DBus.Variant> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, name);
    }

    public setProperty(name: string, value: DBus.Variant): Promise<DBus.Variant> {
        return this.propertiesDBusInterface.Set(this.dbusInterfaceName, name, value);
    }

    //@property({ name: 'Connected', signature: 'b', access: ACCESS_READ })
    public Connected(): Promise<boolean> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Connected');
    }

    //@property({ name: 'Player', signature: 'o', access: ACCESS_READ })
    public Player(): Promise<DBus.ObjectPath> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, 'Player');
    }


    /***** Methods *****/

    //@method({ name: 'Play', inSignature: '', outSignature: '' })
    public Play(): Promise<void> {
        return this.thisDBusInterface.Play();
    }

    //@method({ name: 'Pause', inSignature: '', outSignature: '' })
    public Pause(): Promise<void> {
        return this.thisDBusInterface.Pause();
    }

    //@method({ name: 'Stop', inSignature: '', outSignature: '' })
    public Stop(): Promise<void> {
        return this.thisDBusInterface.Stop();
    }

    //@method({ name: 'Next', inSignature: '', outSignature: '' })
    public Next(): Promise<void> {
        return this.thisDBusInterface.Next();
    }

    //@method({ name: 'Previous', inSignature: '', outSignature: '' })
    public Previous(): Promise<void> {
        return this.thisDBusInterface.Previous();
    }

    //@method({ name: 'VolumeUp', inSignature: '', outSignature: '' })
    public VolumeUp(): Promise<void> {
        return this.thisDBusInterface.VolumeUp();
    }

    //@method({ name: 'VolumeDown', inSignature: '', outSignature: '' })
    public VolumeDown(): Promise<void> {
        return this.thisDBusInterface.VolumeDown();
    }

    //@method({ name: 'FastForward', inSignature: '', outSignature: '' })
    public FastForward(): Promise<void> {
        return this.thisDBusInterface.FastForward();
    }

    //@method({ name: 'Rewind', inSignature: '', outSignature: '' })
    public Rewind(): Promise<void> {
        return this.thisDBusInterface.Rewind();
    }

}
/***** Signals for OrgBluezMediaControl1 *****/
export declare interface OrgBluezMediaControl1 {
    on(evt: "PropertiesChanged", cb: (iface: string, changedProperties: {[key:string]: any}, invalidatedProperties: string[]) => void): this;
    on(event: string, listener: Function): this;
}


