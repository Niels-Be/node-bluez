import * as DBus from "dbus-next";
import { Agent } from './agent';
import { Bluez } from "./bluez";

export class AgentWrapper extends DBus.interface.Interface {

    private impl: Agent;
    private bluez: Bluez;

    constructor(agent: Agent, bluez: Bluez) {
        super("org.bluez.Agent1");
        this.impl = agent;
        this.bluez = bluez;
    }

    /*
    void Release()

        This method gets called when the service daemon
        unregisters the agent. An agent can use it to do
        cleanup tasks. There is no need to unregister the
        agent, because when this method gets called it has
        already been unregistered.
    */
    @DBus.interface.method({ inSignature: '', outSignature: '' })
    Release() {
        if (this.impl.Release)
            return this.impl.Release();
    }
    /*
    string RequestPinCode(object device)
 
        This method gets called when the service daemon
        needs to get the passkey for an authentication.
 
        The return value should be a string of 1-16 characters
        length. The string can be alphanumeric.
 
        Possible errors: org.bluez.Error.Rejected
                        org.bluez.Error.Canceled
    */
    @DBus.interface.method({ inSignature: 'o', outSignature: 's' })
    async RequestPinCode(device: DBus.ObjectPath) {
        const dev = await this.bluez.getDeviceFromObject(device);
        return this.impl.RequestPinCode(dev);
    }
    /*
    void DisplayPinCode(object device, string pincode)
 
        This method gets called when the service daemon
        needs to display a pincode for an authentication.
 
        An empty reply should be returned. When the pincode
        needs no longer to be displayed, the Cancel method
        of the agent will be called.
 
        This is used during the pairing process of keyboards
        that don't support Bluetooth 2.1 Secure Simple Pairing,
        in contrast to DisplayPasskey which is used for those
        that do.
 
        This method will only ever be called once since
        older keyboards do not support typing notification.
 
        Note that the PIN will always be a 6-digit number,
        zero-padded to 6 digits. This is for harmony with
        the later specification.
 
        Possible errors: org.bluez.Error.Rejected
                        org.bluez.Error.Canceled
    */
    @DBus.interface.method({ inSignature: 'os', outSignature: '' })
    async DisplayPinCode(device: DBus.ObjectPath, pincode: string) {
        if (this.impl.DisplayPinCode) {
            const dev = await this.bluez.getDeviceFromObject(device);
            return this.impl.DisplayPinCode(dev, pincode);
        }
    }
    /*
    uint32 RequestPasskey(object device)
 
        This method gets called when the service daemon
        needs to get the passkey for an authentication.
 
        The return value should be a numeric value
        between 0-999999.
 
        Possible errors: org.bluez.Error.Rejected
                        org.bluez.Error.Canceled
    */
    @DBus.interface.method({ inSignature: 'o', outSignature: 'u' })
    async RequestPasskey(device: DBus.ObjectPath) {
        const dev = await this.bluez.getDeviceFromObject(device);
        return this.impl.RequestPasskey(dev);
    }
    /*
    void DisplayPasskey(object device, uint32 passkey,
                            uint16 entered)
 
        This method gets called when the service daemon
        needs to display a passkey for an authentication.
 
        The entered parameter indicates the number of already
        typed keys on the remote side.
 
        An empty reply should be returned. When the passkey
        needs no longer to be displayed, the Cancel method
        of the agent will be called.
 
        During the pairing process this method might be
        called multiple times to update the entered value.
 
        Note that the passkey will always be a 6-digit number,
        so the display should be zero-padded at the start if
        the value contains less than 6 digits.
    */
    @DBus.interface.method({ inSignature: 'ouq', outSignature: '' })
    async DisplayPasskey(device: DBus.ObjectPath, passkey: number, entered: number) {
        if (this.impl.DisplayPasskey) {
            const dev = await this.bluez.getDeviceFromObject(device);
            return this.impl.DisplayPasskey(dev, passkey, entered);
        }
    }
    /*
    void RequestConfirmation(object device, uint32 passkey)
 
        This method gets called when the service daemon
        needs to confirm a passkey for an authentication.
 
        To confirm the value it should return an empty reply
        or an error in case the passkey is invalid.
 
        Note that the passkey will always be a 6-digit number,
        so the display should be zero-padded at the start if
        the value contains less than 6 digits.
 
        Possible errors: org.bluez.Error.Rejected
                        org.bluez.Error.Canceled
    */
    @DBus.interface.method({ inSignature: 'ou', outSignature: '' })
    async RequestConfirmation(device: DBus.ObjectPath, passkey: number) {
        if (this.impl.RequestConfirmation) {
            const dev = await this.bluez.getDeviceFromObject(device);
            return this.impl.RequestConfirmation(dev, passkey);
        }
    }
    /*
    void RequestAuthorization(object device)
 
        This method gets called to request the user to
        authorize an incoming pairing attempt which
        would in other circumstances trigger the just-works
        model, or when the user plugged in a device that
        implements cable pairing. In the latter case, the
        device would not be connected to the adapter via
        Bluetooth yet.
 
        Possible errors: org.bluez.Error.Rejected
                        org.bluez.Error.Canceled
    */
    @DBus.interface.method({ inSignature: 'o', outSignature: '' })
    async RequestAuthorization(device: DBus.ObjectPath) {
        if (this.impl.RequestAuthorization) {
            const dev = await this.bluez.getDeviceFromObject(device);
            return this.impl.RequestAuthorization(dev);
        }
    }
    /*
    void AuthorizeService(object device, string uuid)
 
        This method gets called when the service daemon
        needs to authorize a connection/service request.
 
        Possible errors: org.bluez.Error.Rejected
                        org.bluez.Error.Canceled
    */
    @DBus.interface.method({ inSignature: 'os', outSignature: '' })
    async AuthorizeService(device: DBus.ObjectPath, uuid: string) {
        if (this.impl.AuthorizeService) {
            const dev = await this.bluez.getDeviceFromObject(device);
            return this.impl.AuthorizeService(dev, uuid);
        }
    }
    /*
    void Cancel()
 
        This method gets called to indicate that the agent
        request failed before a reply was returned.
    */
    @DBus.interface.method({ inSignature: '', outSignature: '' })
    async Cancel() {
        if (this.impl.Cancel)
            return this.impl.Cancel();
    }

}