import * as DBus from 'dbus-next';
import { OrgFreedesktopDBusObjectManager } from './dbus/dbus';
import { OrgBluezAgentManager1, OrgBluezProfileManager1 } from './dbus/bluez';
import { Profile } from './profile';
import { Agent } from './agent';
import { Adapter } from './adapter';
import { Device } from './device';
import { ProfileWrapper } from './profileWrapper';
import { AgentWrapper } from './agentWrapper';

export interface BluezOptions {
    bus: DBus.MessageBus;
    userInterfacesPath: DBus.ObjectPath;
}

export class Bluez {

    private options: BluezOptions;
    private objectManager: OrgFreedesktopDBusObjectManager;
    private agentManager: OrgBluezAgentManager1;
    private profileManager: OrgBluezProfileManager1;
    private bluezRootObject: DBus.ProxyObject;

    constructor(options?: Partial<BluezOptions>) {
        this.options = Object.assign({
            bus: options && options.bus ? options.bus : DBus.systemBus(),
            userInterfacesPath: "/"
        }, options);
    }

    public async init() {
        const rootObject = await this.options.bus.getProxyObject("org.bluez", "/");
        this.objectManager = rootObject.getInterface<OrgFreedesktopDBusObjectManager>("org.freedesktop.DBus.ObjectManager");
        this.bluezRootObject = await this.options.bus.getProxyObject("org.bluez", "/org/bluez");
        this.agentManager = this.bluezRootObject.getInterface<OrgBluezAgentManager1>("org.bluez.AgentManager1");
        this.profileManager = this.bluezRootObject.getInterface<OrgBluezProfileManager1>("org.bluez.ProfileManager1");
/*
        this.objectManager.on('InterfacesAdded', this.onInterfacesAdded.bind(this));
        this.objectManager.on('InterfacesRemoved', this.onInterfaceRemoved.bind(this));
        const existingObjects = await this.objectManager.GetManagedObjects();
        Object.keys(existingObjects).forEach((k) => this.onInterfacesAdded(k, objs[k]));*/
    }

    public getBus(): DBus.MessageBus {
        return this.options.bus;
    }

    public async getAdapter(name: string = "hci0"): Promise<Adapter> {
        const adapterNode = this.bluezRootObject.nodes.find(node => {
            const path = node.split("/");
            return path[path.length - 1] === name;
        });
        if(adapterNode === undefined) throw new DBus.DBusError("org.bluez.Error.DoesNotExist", "Adapter not found");
        return this.getAdapterFromObject(adapterNode);
    }

    public listAdapters(): Promise<Adapter[]> {
        return Promise.all(this.bluezRootObject.nodes.map((node) => {
            return this.getAdapterFromObject(node);
        }));
    }


    public registerProfile(profile: Profile) {
        const wrappedProfile = new ProfileWrapper(profile, this);
        //TODO: check if we need to call request name first
        // register wrapped service
        this.options.bus.export(this.options.userInterfacesPath, wrappedProfile);
        
        return this.profileManager.RegisterProfile(this.options.userInterfacesPath, profile.UUID, profile.ProfileOptions);
    }
    public unregisterProfile(profile: Profile) {
        return this.profileManager.UnregisterProfile(this.options.userInterfacesPath);
    }

    public async registerAgent(agent: Agent, requestAsDefault?: boolean) {
        const wrappedAgent = new AgentWrapper(agent, this);
        //TODO: check if we need to call request name frist
        this.options.bus.export(this.options.userInterfacesPath, wrappedAgent);
        await this.agentManager.RegisterAgent(this.options.userInterfacesPath, agent.AgentCapabilities);
        if(requestAsDefault) {
            await this.agentManager.RequestDefaultAgent(this.options.userInterfacesPath);
        }
    }
    public unregisterAgent(agent: Agent) {
        return this.agentManager.UnregisterAgent(this.options.userInterfacesPath);
    }


    // internal methods
    public async getAdapterFromObject(object: DBus.ObjectPath) {
        const obj = await this.options.bus.getProxyObject("org.bluez", object);
        return new Adapter(obj);
    }

    public async getDeviceFromObject(object: DBus.ObjectPath) {
        const obj = await this.options.bus.getProxyObject("org.bluez", object);
        return new Device(obj);
    }
}