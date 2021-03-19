import * as DBus from "dbus-next";
import { Profile } from "./profile";
import { Agent } from "./agent";
import { Adapter } from "./adapter";
import { Device } from "./device";
import { ProfileWrapper } from "./profileWrapper";
import { AgentWrapper } from "./agentWrapper";
import { wrapDbusVariantObject } from "./utilts";
import { OrgBluezProfileManager1 } from "./dbus/ProfileManager1";
import { OrgBluezAgentManager1 } from "./dbus/AgentManager1";
import { OrgFreedesktopDBusObjectManager } from "./dbus/DBus-ObjectManager";

export interface BluezOptions {
    bus: DBus.MessageBus;
    userInterfacesPath: DBus.ObjectPath;
}

const HAS_WEAKREF = typeof WeakRef === "function";

export class Bluez {
    private bus: DBus.MessageBus;
    private options: BluezOptions;
    private objectManager: OrgFreedesktopDBusObjectManager;
    private agentManager: OrgBluezAgentManager1;
    private profileManager: OrgBluezProfileManager1;
    private bluezRootObject: DBus.ProxyObject;

    private adapterCache = new Map<DBus.ObjectPath, WeakRef<Adapter>>();

    constructor(options?: Partial<BluezOptions>) {
        this.bus = options && options.bus ? options.bus : DBus.systemBus();
        this.options = Object.assign(
            {
                bus: this.bus,
                userInterfacesPath: "/org/bluez",
            },
            options,
        );
    }

    public async init() {
        this.objectManager = await OrgFreedesktopDBusObjectManager.Connect(this.bus);
        this.bluezRootObject = await this.bus.getProxyObject("org.bluez", "/org/bluez");
        this.agentManager = new OrgBluezAgentManager1(this.bluezRootObject);
        this.profileManager = new OrgBluezProfileManager1(this.bluezRootObject);
        //await this.bus.requestName('org.test.name');
    }

    public getBus(): DBus.MessageBus {
        return this.bus;
    }
    public getObjectManager(): OrgFreedesktopDBusObjectManager {
        return this.objectManager;
    }

    public getAdapter(name = "hci0"): Promise<Adapter> {
        const adapterNode = this.bluezRootObject.nodes.find((node) => {
            const path = node.split("/");
            return path[path.length - 1] === name;
        });
        if (adapterNode === undefined) throw new DBus.DBusError("org.bluez.Error.DoesNotExist", "Adapter not found");
        return this.getAdapterFromObject(adapterNode);
    }

    public listAdapters(): Promise<Adapter[]> {
        return Promise.all(
            this.bluezRootObject.nodes.map((node) => {
                return this.getAdapterFromObject(node);
            }),
        );
    }

    /**
     * This registers a profile implementation.
     * If an application disconnects from the bus all
     * its registered profiles will be removed.
     * HFP HS UUID: 0000111e-0000-1000-8000-00805f9b34fb
     *     Default RFCOMM channel is 6. And this requires
     *     authentication.
     * Possible errors: org.bluez.Error.InvalidArguments
     *                  org.bluez.Error.AlreadyExists
     **/
    public registerProfile(profile: Profile) {
        const wrappedProfile = new ProfileWrapper(profile, this);
        // register wrapped service
        this.bus.export(this.options.userInterfacesPath, wrappedProfile);
        return this.profileManager.RegisterProfile(
            this.options.userInterfacesPath,
            profile.UUID,
            wrapDbusVariantObject(profile.ProfileOptions),
        );
    }
    public unregisterProfile(profile: Profile) {
        return this.profileManager.UnregisterProfile(this.options.userInterfacesPath);
    }

    /**
     * This registers an agent handler.
     * The object path defines the path of the agent
     * that will be called when user input is needed.
     * Every application can register its own agent and
     * for all actions triggered by that application its
     * agent is used.
     * It is not required by an application to register
     * an agent. If an application does chooses to not
     * register an agent, the default agent is used. This
     * is on most cases a good idea. Only application
     * like a pairing wizard should register their own
     * agent.
     * An application can only register one agent. Multiple
     * agents per application is not supported.
     * The capability parameter can have the values
     * "DisplayOnly", "DisplayYesNo", "KeyboardOnly",
     * "NoInputNoOutput" and "KeyboardDisplay" which
     * reflects the input and output capabilities of the
     * agent.
     * If an empty string is used it will fallback to
     * "KeyboardDisplay".
     * Possible errors: org.bluez.Error.InvalidArguments
     *                  org.bluez.Error.AlreadyExists
     **/
    public async registerAgent(agent: Agent, requestAsDefault?: boolean) {
        const wrappedAgent = new AgentWrapper(agent, this);
        // register wrapped service
        this.bus.export(this.options.userInterfacesPath, wrappedAgent);
        await this.agentManager.RegisterAgent(this.options.userInterfacesPath, agent.AgentCapabilities);
        if (requestAsDefault) {
            await this.agentManager.RequestDefaultAgent(this.options.userInterfacesPath);
        }
    }
    public unregisterAgent(agent: Agent) {
        return this.agentManager.UnregisterAgent(this.options.userInterfacesPath);
    }

    /**
     * Gat an Adapter from at that path.
     * For node > 14.6 Adapters are cached using WeakRefs
     * @param object
     */
    public async getAdapterFromObject(object: DBus.ObjectPath) {
        // We should cache adapters since they have event listeners attached to the ObjectManager
        if (HAS_WEAKREF) {
            const adapter = this.adapterCache.get(object)?.deref();
            if (adapter) return adapter;
        }
        const obj = await this.bus.getProxyObject("org.bluez", object);
        const adapter = new Adapter(obj, this);
        if (HAS_WEAKREF) {
            this.adapterCache.set(object, new WeakRef(adapter));
        }
        return adapter;
    }

    /**
     * Get a Device Interface at the Object.
     * Shortcut for `Bluez.getDbusObjectInterface(Device, object)`
     * @param object
     */
    public async getDeviceFromObject(object: DBus.ObjectPath) {
        return this.getDbusObjectInterface(Device, object);
    }

    /**
     * Get an low level dbus interface from the given object path
     * @param type Low level dbus interface from ./dbus/*
     * @param object dbus object path
     */
    public async getDbusObjectInterface<T>(
        type: { new (obj: DBus.ProxyObject, bluez: Bluez): T },
        object: DBus.ObjectPath,
    ) {
        const obj = await this.bus.getProxyObject("org.bluez", object);
        return new type(obj, this);
    }
}
