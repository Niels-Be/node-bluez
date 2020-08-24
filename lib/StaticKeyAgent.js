const Agent = require("./Agent");

class StaticKeyAgent extends Agent {
    constructor(bluez, DbusObject, pin) {
        super(bluez, DbusObject);
        this.pin = pin;
    }

    RequestPinCode(device, callback) {
        callback(null, this.pin.toString());
    }

    RequestPasskey(device, callback) {
        callback(null, parseInt(this.pin, 10));
    }
}

module.exports = StaticKeyAgent;