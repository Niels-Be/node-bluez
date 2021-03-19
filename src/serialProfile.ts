import { Profile } from "./profile";
import { Device } from "./device";

export class SerialProfile implements Profile {
    ProfileOptions = {
        Name: "Node Serial Port",
        Role: "client",
        PSM: 0x0003,
    };
    // Bluetooth SSP uuid
    UUID = "00001101-0000-1000-8000-00805f9b34fb";

    NewConnection(device: Device, fd: number, options: { [name: string]: any }): void | Promise<void> {
        // Get a socket from the RFCOMM FD
        //const socket = new BluetoothSocket(fd);
        // the socket is a standard nodejs duplex stream
        //socket.on("data", (data: any) => console.log(data));
        //socket.write("Hello World");
    }
}
