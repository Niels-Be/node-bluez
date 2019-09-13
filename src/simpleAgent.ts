import { Agent } from "./agent";
import { Device } from "./device";

export class SimpleAgent implements Agent {
    AgentCapabilities: "KeyboardDisplay";

    constructor(private pin: string) {}

    RequestPinCode(device: Device): string | Promise<string> {
        return this.pin;
    }
    RequestPasskey(device: Device): number | Promise<number> {
        return parseInt(this.pin, 10);
    }
}