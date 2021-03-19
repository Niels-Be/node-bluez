import { Agent } from "./agent";
import { Device } from "./device";
import { DBusError } from "dbus-next";

export class SimpleAgent implements Agent {
    public readonly AgentCapabilities = "KeyboardOnly";

    constructor(private pin: string) {}

    async DisplayPinCode(device: Device, pincode: string): Promise<void> {
        //console.log("Display Code", pincode, device.dbusObject.path);
        throw new DBusError("org.bluez.Error.Rejected", "Not Supported", true);
        //await new Promise(resolve => setTimeout(resolve, 10000000));
        //console.log("OK");
    }

    RequestPinCode(device: Device): string | Promise<string> {
        //console.log("Request Pin", device.dbusObject.path);
        return this.pin;
    }
    RequestPasskey(device: Device): number | Promise<number> {
        //console.log("Request Pin Int", device.dbusObject.path);
        return parseInt(this.pin, 10);
    }

    Cancel() {
        //console.log("Cancel");
    }
}
