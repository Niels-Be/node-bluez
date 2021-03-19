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

const bluetooth = new Bluez();
// Initialize bluetooth interface
bluetooth.init().then(async ()=>{
    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter('hci0');
    // Register callback for new devices
    adapter.on('DeviceAdded', (address, props) => {
        console.log("Found new Device " + address + " " + props.Name);
    });
    await adapter.StartDiscovery();
    console.log("Discovering");
});
```

Custom Agents and Profiles can be implemented by extending Agent / Profile base classes.
Then use `bluez.registerAgent(agent, capability)` and `bluez.registerProfile(profile, options)` to activate them.

### Examples

Have a look at the [examples](examples) or [tests](tests) for more detailed usage information.

### API Docs

The API is based mostly on Bluez's DBus interface.
Its documentation can be found in its [repository](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/doc/).

Additionally this library provides some convenience functions which can be found in [API.md](API.md).

There is also low level access to the underlying Dbus interfaces available. Please have a look at [dbus.md](src/dbus/README.md).

