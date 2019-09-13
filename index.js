
const Bluez = require('./dist/Bluez').Bluez;


Bluez.Adapter = require('./dist/adapter').Adapter;
//Bluez.Agent = require('./dist/agent').Agent;
Bluez.Bluez = Bluez;
Bluez.Device = require('./dist/device').Device;
//Bluez.Profile = require('./dist/profile').Profile;
//Bluez.SerialProfile = require('./dist/SerialProfile');
//Bluez.RawFdSocket = require('./dist/RawFdSocket');

Bluez.Service = require('./dist/gattService').Service;
Bluez.Characteristic = require('./dist/gattCharacteristic').Characteristic;
Bluez.Descriptor = require('./dist/gattDescriptor').Descriptor;

module.exports = Bluez;