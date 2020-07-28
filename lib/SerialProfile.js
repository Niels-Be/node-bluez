const Profile = require('./Profile');

class SerialProfile extends Profile {

    constructor(bluez, DBusObject, listener, socketOptions) {
        super(bluez, DBusObject);
        this.listener = listener;
        this.socketOptions = socketOptions;
        try {
            require("bluetooth-socket")
        } catch(err) {
            console.error("The SerialProfile requires 'bluetooth-socket' module.");
            console.error("Please install it via 'npm install bluetooth-socket");
            throw err;
        }
    }

    get uuid() {
        return SerialProfile.uuid;
    }

    NewConnection(devicePath, fd, options, callback) {
        this.bluez.getDevice(devicePath).then((device) => {
            const BluetoothSocket = require("bluetooth-socket");
            this.listener(device, new BluetoothSocket(fd, this.socketOptions));
            callback();
        }).catch((err)=>{
            callback(err);
        })
    }
}

SerialProfile.uuid = "00001101-0000-1000-8000-00805f9b34fb";

module.exports = SerialProfile;