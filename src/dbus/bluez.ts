import * as DBus from 'dbus-next';

/**
 * org.bluez.AgentManager1
 */
export interface OrgBluezAgentManager1 extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'RegisterAgent', inSignature: 'os', outSignature: '' })
    RegisterAgent(agent: DBus.ObjectPath, capability: string): Promise<void>;

    //@method({ name: 'UnregisterAgent', inSignature: 'o', outSignature: '' })
    UnregisterAgent(agent: DBus.ObjectPath): Promise<void>;

    //@method({ name: 'RequestDefaultAgent', inSignature: 'o', outSignature: '' })
    RequestDefaultAgent(agent: DBus.ObjectPath): Promise<void>;


    /***** Signals *****/

    
}

/**
 * org.bluez.ProfileManager1
 */
export interface OrgBluezProfileManager1 extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'RegisterProfile', inSignature: 'osa{sv}', outSignature: '' })
    RegisterProfile(profile: DBus.ObjectPath, UUID: string, options: {[key: string]: DBus.Variant}): Promise<void>;

    //@method({ name: 'UnregisterProfile', inSignature: 'o', outSignature: '' })
    UnregisterProfile(profile: DBus.ObjectPath): Promise<void>;


    /***** Signals *****/

    
}


