const EventEmitter = require('events').EventEmitter;
const DBus = require('dbus');
const util = require('util');

const Adapter = require('./Adapter');
const Device = require('./Device');
const Agent = require('./Agent');
const MediaPlayer = require('./MediaPlayer');
const StaticKeyAgent = require('./StaticKeyAgent');
const Profile = require('./Profile');
const SerialProfile = require('./SerialProfile');
const SimplePairingAgent = require('./SimplePairingAgent');

class Bluez extends EventEmitter {
    constructor(options) {
        super();
        this.options = Object.assign({
            service: null, // connection local service
            objectPath: "/org/node/bluez"
        }, options);
        this.bus = this.options.bus || this.getUserService().bus;//DBus.getBus('system');
        if (this.options.service && typeof this.options.service !== "string")
            this.userService = this.options.service;

        this.getInterface = util.promisify(this.bus.getInterface.bind(this.bus));

        this.tree = {};
    }

    async init() {
        if (this.objectManager) this.objectManager.removeAllListeners();
        this.objectManager = await this.getInterface('org.bluez', '/', 'org.freedesktop.DBus.ObjectManager');
        this.agentManager = await this.getInterface('org.bluez', '/org/bluez', 'org.bluez.AgentManager1');
        this.profileManager = await this.getInterface('org.bluez', '/org/bluez', 'org.bluez.ProfileManager1');

        this.objectManager.on('InterfacesAdded', this.onInterfacesAdded.bind(this));
        this.objectManager.on('InterfacesRemoved', this.onInterfaceRemoved.bind(this));
        await new Promise((resolve, reject) => {
            this.objectManager.GetManagedObjects((err, objs) => {
                if (err) return reject(err);
                Object.keys(objs).forEach((k) => this.onInterfacesAdded(k, objs[k]))
                resolve();
            });
        });
    }

    /**
     * Get a Bluetooth Adapter
     * @param {string} [dev] Adapter name e.g. hci0, if not supplied returns first available adapter
     * @returns {Promise<Adapter>}
     */
    async getAdapter(dev) {
        if (dev) {
            const match = dev.match(new RegExp("^/org/bluez/(\\w+)$"));
            if (!match) dev = "/org/bluez/" + dev;
            const res = this.getInterfaceInstance(dev, Adapter.INTERFACE_NAME, Adapter);
            if (!res) throw new Error("Adapter not found");
            return res;
        }

        // No name given, use first available Adapter
        const adapters = this.getAllInterfaceProps(Adapter.INTERFACE_NAME, "/org/bluez");
        const firstAdapter = Object.entries(adapters)[0];
        if (!firstAdapter) throw new Error("No Adapter Available");
        return this.getInterfaceInstance(firstAdapter[0], Adapter.INTERFACE_NAME, Adapter, firstAdapter[1]);
    }
    /**
     * Find an Adapter by Props
     * @param {(props)=>boolean} filterFn 
     * @returns {Promise<Adapter|null>}
     */
    findAdapter(filterFn) {
        return this.findInterfaceInstance(Adapter.INTERFACE_NAME, Adapter, filterFn);
    }

    /**
     * Get a Device by address.
     * This searches all Adapters.
     * @param {string} address 
     * @returns {Promise<Device>}
     */
    async getDevice(address) {
        // normalize address
        const match = address.match(new RegExp("^/org/bluez/(\\w+)/dev_(\\w+)$"));
        if (match) address = match[2];
        address = address.replace(/_/g, ":");

        const res = await this.findInterfaceInstance(Device.INTERFACE_NAME, Device, (d) => d.Address === address);
        if (!res) throw new Error("Device not found");
        return res;
    }
    /**
     * Find a Device by Props
     * @example Bluez.findDevice((props) => props.Name === "Test Device")
     * @param {(props)=>boolean} filterFn 
     * @returns {Promise<Device|null>}
     */
    findDevice(filterFn) {
        return this.findInterfaceInstance(Device.INTERFACE_NAME, Device, filterFn);
    }

    /**
     * Get all available Devices.
     * Note: only returns properties, not instances
     */
    getAllDevicesProps() {
        const devProps = this.getAllInterfaceProps(Device.INTERFACE_NAME, "/org/bluez");
        return Object.values(devProps);
    }

    /**
     * Get a Media player by path.
     * This searches all Adapters.
     * @param {string} path
     * @returns {Promise<MediaPlayer>}
     */
    async getMediaPlayer(path) {
        const res = await this.getInterfaceInstance(path, MediaPlayer.INTERFACE_NAME, MediaPlayer);
        if (!res) throw new Error("Media player not found");
        return res;
    }

    /*
    This registers a profile implementation.

    If an application disconnects from the bus all
    its registered profiles will be removed.

    HFP HS UUID: 0000111e-0000-1000-8000-00805f9b34fb

        Default RFCOMM channel is 6. And this requires
        authentication.

    Available options:

        string Name

            Human readable name for the profile

        string Service

            The primary service class UUID
            (if different from the actual
                profile UUID)

        string Role

            For asymmetric profiles that do not
            have UUIDs available to uniquely
            identify each side this
            parameter allows specifying the
            precise local role.

            Possible values: "client", "server"

        uint16 Channel

            RFCOMM channel number that is used
            for client and server UUIDs.

            If applicable it will be used in the
            SDP record as well.

        uint16 PSM

            PSM number that is used for client
            and server UUIDs.

            If applicable it will be used in the
            SDP record as well.

        boolean RequireAuthentication

            Pairing is required before connections
            will be established. No devices will
            be connected if not paired.

        boolean RequireAuthorization

            Request authorization before any
            connection will be established.

        boolean AutoConnect

            In case of a client UUID this will
            force connection of the RFCOMM or
            L2CAP channels when a remote device
            is connected.

        string ServiceRecord

            Provide a manual SDP record.

        uint16 Version

            Profile version (for SDP record)

        uint16 Features

            Profile features (for SDP record)

    Possible errors: org.bluez.Error.InvalidArguments
                        org.bluez.Error.AlreadyExists
    */
    registerProfile(profile, options) {
        // assert(profile instance of Profile)
        const self = this;
        return new Promise((resolve, reject) => {
            self.profileManager.RegisterProfile(profile._DBusObject.path, profile.uuid, options, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    registerSerialProfile(listener, mode, options) {
        if (!mode) mode = 'client';
        const obj = this.getUserServiceObject();
        const profile = new SerialProfile(this, obj, listener, options);
        return this.registerProfile(profile, {
            Name: "Node Serial Port",
            Role: mode,
            PSM: 0x0003
        });
    }

    /*
    This registers an agent handler.

    The object path defines the path of the agent
    that will be called when user input is needed.

    Every application can register its own agent and
    for all actions triggered by that application its
    agent is used.

    It is not required by an application to register
    an agent. If an application does chooses to not
    register an agent, the default agent is used. This
    is on most cases a good idea. Only application
    like a pairing wizard should register their own
    agent.

    An application can only register one agent. Multiple
    agents per application is not supported.

    The capability parameter can have the values
    "DisplayOnly", "DisplayYesNo", "KeyboardOnly",
    "NoInputNoOutput" and "KeyboardDisplay" which
    reflects the input and output capabilities of the
    agent.

    If an empty string is used it will fallback to
    "KeyboardDisplay".

    Possible errors: org.bluez.Error.InvalidArguments
                org.bluez.Error.AlreadyExists
    */
    registerAgent(agent, capabilities, requestAsDefault) {
        // assert(agent instance of Agent)
        const self = this;
        return new Promise((resolve, reject) => {
            self.agentManager.RegisterAgent(agent._DBusObject.path, capabilities || "", (err) => {
                if (err) return reject(err);
                if (!requestAsDefault) return resolve();
                self.agentManager.RequestDefaultAgent(agent._DBusObject.path, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }

    /**
     * Helper Method to register a Agent with a static pin
     * @param {string|number} pin 
     * @param {boolean} [requestAsDefault] 
     */
    registerStaticKeyAgent(pin, requestAsDefault) {
        const obj = this.getUserServiceObject();
        const agent = new StaticKeyAgent(this, obj, pin);
        return this.registerAgent(agent, "KeyboardOnly", requestAsDefault);
    }
    /**
     * Helper Method to register a Agent which accepts everything
     * @param {boolean} [requestAsDefault] 
     */
    registerSimplePairingAgent(requestAsDefault) {
        const obj = this.getUserServiceObject();
        const agent = new SimplePairingAgent(this, obj);
        return this.registerAgent(agent, "DisplayYesNo", requestAsDefault);
    }

    getUserService() {
        if (!this.userService) {
            this.userService = DBus.registerService('system', this.options.service);
        }
        return this.userService;
    }

    getUserServiceObject() {
        if (!this.userServiceObject) {
            this.userServiceObject = this.getUserService().createObject(this.options.objectPath);
        }
        return this.userServiceObject;
    }

    findInterfaceInstance(interfaceName, instanceConstructor, pathPrefix, filterFn) {
        if (!filterFn && typeof pathPrefix === "function") {
            filterFn = pathPrefix;
            pathPrefix = "/org/bluez";
        }
        const devProps = this.getAllInterfaceProps(interfaceName, pathPrefix);
        const devProp = Object.entries(devProps).find(d => filterFn(d[1]));
        if (!devProp) return Promise.resolve(null);
        const [path, devIf] = devProp;
        return this.getInterfaceInstance(path, interfaceName, instanceConstructor, devIf);
    }

    async getInterfaceInstance(objectPath, interfaceName, instanceConstructor, devIf) {
        if (!devIf) {
            const node = this.getNodeFromPath(objectPath);
            if (!node || !node._interfaces) return null;
            devIf = node._interfaces[interfaceName];
        }
        if (!devIf) return null;
        if (!devIf._instance) {
            const dbusIf = await this.getInterface('org.bluez', objectPath, interfaceName);
            if (!dbusIf) throw new Error("Interface not found");
            devIf._instance = new instanceConstructor(dbusIf, this);
        }
        return devIf._instance;
    }

    getAllInterfaceProps(interfaceName, pathPrefix) {
        // remove tailing /
        if (pathPrefix) pathPrefix = pathPrefix.replace(/\/$/, "");
        function extractInterface(path, node) {
            const res = {};
            if (node._interfaces[interfaceName]) {
                res[path] = node._interfaces[interfaceName];
            }
            for (const p in node) {
                if (p === "_interfaces") continue;
                Object.assign(res, extractInterface(path + "/" + p, node[p]));
            }
            return res;
        }
        let next = pathPrefix ? this.getNodeFromPath(pathPrefix) : this.tree;
        if (!next) return {};
        return extractInterface(pathPrefix || "", next);
    }

    getNodeFromPath(path) {
        let next = this.tree;
        for (const p of path.split("/")) {
            if (!p) continue;
            if (!next[p]) {
                return null;
            }
            next = next[p];
        }
        return next;
    }

    async onInterfacesAdded(path, interfaces) {
        //console.log("Interface Added", path, interfaces)

        let next = this.tree;
        for (const p of path.split("/")) {
            if (!p) continue;
            // console.log(p, next);
            if (!next[p]) {
                next[p] = {};
            }
            next = next[p];
        }
        next._interfaces = Object.assign(next._interfaces || {}, interfaces);

        if ('org.bluez.Device1' in interfaces) {
            const props = interfaces['org.bluez.Device1'];
            this.emit('device', props.Address, props);
        }

        if ('org.bluez.MediaPlayer1' in interfaces) {
            const props = interfaces['org.bluez.MediaPlayer1'];
            // Note: there is no unique ID for a media player like the MAC
            // address for a device, so we use the path, which is unique.
            this.emit('mediaplayer', path, props);
        }
    }

    async onInterfaceRemoved(path, interfaces/*:string[]*/) {

        let next = this.tree;
        for (const p of path.split("/")) {
            if (!p) continue;
            //console.log(p, next);
            if (!next[p]) {
                next[p] = {};
            }
            next = next[p];
        }
        if (next._interfaces) {
            for (const intf of interfaces) {
                if (next._interfaces[intf] && next._interfaces[intf]._instance) {
                    // Warning: if there are listeners registered for that interface,
                    // they will need to listen for "interface-removed" and remove
                    // all listeners.
                    next._interfaces[intf]._instance.emit("interface-removed");
                }
                delete next._interfaces[intf];
            }
        }
    }
}

module.exports = Bluez;