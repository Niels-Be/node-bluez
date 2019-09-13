
const Bluez = require('./dist/bluez').Bluez;


Bluez.Adapter = require('./dist/adapter').Adapter;
Bluez.SimpleAgent = require('./dist/simpleAgent').SimpleAgent;
Bluez.Bluez = Bluez;
Bluez.Device = require('./dist/device').Device;
//Bluez.Profile = require('./dist/profile').Profile;
//Bluez.SerialProfile = require('./dist/SerialProfile');

Bluez.Service = require('./dist/gattService').Service;
Bluez.Characteristic = require('./dist/gattCharacteristic').Characteristic;
Bluez.Descriptor = require('./dist/gattDescriptor').Descriptor;

module.exports = Bluez;