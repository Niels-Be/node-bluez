import { Profile } from "./profile";
import { Device } from "./device";

export abstract class SerialProfile implements Profile {
    ProfileOptions = {
        Name: "Node Serial Port",
        Role: "client",
        PSM: 0x0003,
    };
    // Bluetooth SSP uuid
    UUID = "00001101-0000-1000-8000-00805f9b34fb";

    /**
     * This method needs to be implemented
     * A communication socket should be established with new BluetoothSocket(fd)
     * @param device
     * @param fd
     * @param options
     */
    abstract NewConnection(device: Device, fd: number, options: { [name: string]: any }): void | Promise<void>;
}
