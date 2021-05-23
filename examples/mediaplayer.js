const Bluez = require('..');

const bluetooth = new Bluez();

// This will only work if you already have a phone or other media
// player paired and already connected to your computer, of course. For Linux,
// checkout bluealsa as a very easy solution.

// Register callback for new Media players
bluetooth.on('mediaplayer', async (device, props) => {
    var address = 'invalid';
    console.log("[NEW] Mediaplayer:", device);

    const player = await bluetooth.getMediaPlayer(device).catch(console.error);
    player.on("PropertiesChanged", (props, invalidated) => {
        console.log("[CHG] MediaPlayer:", device, props, invalidated);
    });
    player.on("interface-removed", () => {
        console.log('[DEL] Player removed', device);
        player.removeAllListeners();
        delete mediaPlayers[address];
        delete player;
    })
});

bluetooth.init().then(async () => {
    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter();
}).catch(console.error);
