const Agent = require("./Agent");

class SimplePairingAgent extends Agent {
    constructor(bluez, DbusObject) {
        super(bluez, DbusObject);
    }

    RequestConfirmation(device, passkey, callback) {
        callback();
    }

    RequestAuthorization(device, callback) {
        callback();
    }

    AuthorizeService(device, uuid, callback) {
        callback();
    }
}

module.exports = SimplePairingAgent;