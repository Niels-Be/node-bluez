const { EventEmitter } = require("events");

class DbusInterfaceBase extends EventEmitter {
    constructor(interface_, bluez) {
        super();
        this._interface = interface_;
        this._bluez = bluez;
        this._propertyInterface = null;

        // forward property change events
        const forwardPropertyChange = (iface, changed, invalidated) => {
            if (iface === this._interface.interfaceName) {
                this.emit('PropertiesChanged', changed, invalidated);
            }
        }

        // get property interface
        this._interface.bus.getInterface(this._interface.serviceName, this._interface.objectPath, "org.freedesktop.DBus.Properties", (err, res) => {
            // TODO: handle error
            if (err) return;
            this._propertyInterface = res;
            // in case a handler was registerd before we got the interface, attach it now
            if (this.listenerCount('PropertiesChanged') > 0) {
                this._propertyInterface.on('PropertiesChanged', forwardPropertyChange);
            }
        });

        // forward all signals
        this.on("newListener", (event, listener) => {
            if (event === "removeListener" || event === "newListener") return;
            if (event === "PropertiesChanged") {
                if (this.listenerCount('PropertiesChanged') === 0 && this._propertyInterface) {
                    this._propertyInterface.on('PropertiesChanged', forwardPropertyChange);
                }
            } else {
                this._interface.on(event, listener);
            }
        });
        this.on("removeListener", (event, listener) => {
            if (event === "removeListener" || event === "newListener") return;
            if (event === "PropertiesChanged") {
                if (this.listenerCount('PropertiesChanged') === 0 && this._propertyInterface) {
                    this._propertyInterface.removeListener('PropertiesChanged', forwardPropertyChange);
                }
            } else {
                this._interface.removeListener(event, listener);
            }
        });
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
