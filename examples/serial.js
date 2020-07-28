const Bluez = require('..');

const bluetooth = new Bluez();

// Register callback for new devices
bluetooth.on('device', async (address, props) => {
    console.log("Found new Device " + address + " " + props.Name);
    // apply some filtering
    if(props.Name !== "HC05") return;
    
    // Get the device interface
    const device = await bluetooth.getDevice(address);

    // Pair with the device if not already done
    // Not pairing twice will throw an error
    if(!props.Paired) {
        await device.Pair().catch((err)=>{
            console.error("Error while pairing to device " + address + ": " + err.message);
        });
    }
    // Connect to the Serial Service
    await device.ConnectProfile(Bluez.SerialProfile.uuid).catch((err)=>{
        console.error("Error while connection to device " + address + ": " + err.message);
    });
});

bluetooth.init().then(async ()=>{

    // Register Agent that accepts everything and uses key 1234
    await bluetooth.registerDummyAgent();
    console.log("Agent registered");
    
    // Register a Serial Client Service
    await bluetooth.registerSerialProfile(async (device, socket) => {
        const name = await device.Name();
        console.log("Serial Connection from " + name);
        // socket is a non blocking duplex stream similar to net.Socket
        // Print everything
        socket.pipe(process.stdout);
        //socket.on('data', (data)=>process.stdout.write(data));
        socket.on('error', console.error);
        // Send hello to device
        socket.write("Hello\n");
    }, "client");
    console.log("SerialProfile registered");
    
    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter('hci0');
    await adapter.StartDiscovery();
    console.log("Discovering");
});