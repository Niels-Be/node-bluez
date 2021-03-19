Bluez D-Bus
===========


Easy to use Node.js Bluez5 D-Bus library.


## Install
```
npm install bluez
```

## Usage

```js
const Bluez = require('bluez');

// Initialize bluetooth interface
const bluetooth = new Bluez();
await bluetooth.init();

// listen on first bluetooth adapter
const adapter = await bluetooth.getAdapter();
// Register callback for new devices
adapter.on('DeviceAdded', (address, props) => {
    console.log("Found new Device " + address + " " + props.Name);
});
await adapter.StartDiscovery();
console.log("Discovering");
```

Custom Agents and Profiles can be implemented by extending Agent / Profile base classes.
Then use `bluez.registerAgent(agent, capability)` and `bluez.registerProfile(profile, options)` to activate them.

### Examples

Have a look at the [examples](examples) or [tests](tests) for more detailed usage information.

## API Docs

The API is based mostly on Bluez's DBus interface.
Its documentation can be found in its [repository](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/doc/).

Additionally this library provides some convenience functions which can be found in [API.md](API.md).

There is also low level access to the underlying Dbus interfaces available. Please have a look at [dbus.md](src/dbus/README.md).

### Tested with

- Node.js 12 and 14
- Bluez 5.50 Ubuntu 18.04
- Bluez 5.53 Ubuntu 20.04
- Bluez 5.48 Debian Stretch
- Bluez 5.50 Debian Buster
- Bluez 5.54 Debian Sid

Older Bluez version should work, but might miss some functions.
However I can not recommend using GATT with Bluez < 5.48.

## Migration

#### 0.4.x -> 1.0
- Underling Dbus library was replaced by [dbus-next](https://github.com/dbusjs/node-dbus-next). If you depend on the old library, do not update.
- [bluetooth-socket](https://github.com/waeco/node-bluetooth-socket) is no longer a required dependency, if your project depends on it install it directly.
- `Device.getService()` was renamed to `Device.getGattService()`
- `Bluez.getDevice()` was moved to `Adapter.getDevice()`
- `Bluez.getAllDevicesProps()` was moved to `Adapter.listDevices()`
- `Bluez.on("device")` was moved to `Adapter.on("DeviceAdded")`
- `Bluez.registerStaticKeyAgent()` was replaced by `Bluez.registerAgent(new SimpleAgent(pin))`
- `Bluez.registerSerialProfile()` was removed. See [example/serial.js](example/serial.js) for new usage

#### 0.3.x -> 0.4

- Characteristic Values are now always `Buffers`
- Characteristic, Descriptor and Service properties where changed to functions
- RawFdSocket was removed and replaced by [bluetooth-socket](https://github.com/waeco/node-bluetooth-socket) module
- `Bluez.registerDummyAgent` was renamed to `Bluez.registerStaticKeyAgent` which takes a pin code as argument
- `Bluez.getAllDevicesAddresses` was renamed to `Bluez.getAllDevicesProps` which returns all properties not only the address.
