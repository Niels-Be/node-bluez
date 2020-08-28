const { EventEmitter } = require("events");

class DbusInterfaceBase extends EventEmitter {
    constructor(interface_, bluez) {
        super();
        this._interface = interface_;
        this._bluez = bluez;

    }


    getProperties() {
        return new Promise((resolve, reject) => {
            this._interface.getProperties((err, props) => {
                if (err) return reject(err);
                resolve(props);
            })
        });
    }

    getProperty(name) {
        return new Promise((resolve, reject) => {
            this._interface.getProperty(name, (err, val) => {
                if (err) return reject(err);
                resolve(val);
            })
        });
    }

    setProperty(name, value) {
        return new Promise((resolve, reject) => {
            this._interface.setProperty(name, value, (err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

}

module.exports = DbusInterfaceBase;