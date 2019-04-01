const EventEmitter = require('events').EventEmitter;
const Profile = require('./Profile');
const RawFdSocket = require('./RawFdSocket');


class SerialProfile extends Profile {

    constructor(bluez, DBusObject, listener, socketOptions) {
        super(bluez, DBusObject);
        this.listener = listener;
        this.socketOptions = socketOptions;
    }

    get uuid() {
        return SerialProfile.uuid;
    }

    NewConnection(devicePath, fd, options, callback) {
        this.bluez.getDevice(devicePath).then((device) => {
            this.listener(device, new RawFdSocket(fd, this.socketOptions));
            callback();
        }).catch((err)=>{
            callback(err);
        })
    }
}

SerialProfile.uuid = "00001101-0000-1000-8000-00805f9b34fb";

module.exports = SerialProfile;