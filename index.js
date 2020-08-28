
const Bluez = require('./lib/Bluez');


Bluez.Adapter = require('./lib/Adapter');
Bluez.Agent = require('./lib/Agent');
Bluez.StaticKeyAgent = require('./lib/StaticKeyAgent');
Bluez.SimplePairingAgent = require('./lib/SimplePairingAgent');
Bluez.Bluez = Bluez;
Bluez.Device = require('./lib/Device');
Bluez.Profile = require('./lib/Profile');
Bluez.SerialProfile = require('./lib/SerialProfile');

Bluez.Service = require('./lib/Service');
Bluez.Characteristic = require('./lib/Characteristic');
Bluez.Descriptor = require('./lib/Descriptor');

module.exports = Bluez;