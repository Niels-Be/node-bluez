const DbusInterfaceBase = require("./DbusInterfaceBase");

class MediaPlayer extends DbusInterfaceBase {

    /*
    Resume playback.

    Possible Errors: org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    Play() {
        return new Promise((resolve, reject) => {
            this._interface.Play((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

    /*
    Pause playback.

    Possible Errors: org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    Pause() {
        return new Promise((resolve, reject) => {
            this._interface.Play((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }
                
    /*
    Stop playback.

    Possible Errors: org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    Stop() {
        return new Promise((resolve, reject) => {
            this._interface.Stop((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }
                
    /*
    Next item.

    Possible Errors: org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    Next() {
        return new Promise((resolve, reject) => {
            this._interface.Next((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

    /*
    Previous item.

    Possible Errors: org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    Previous() {
        return new Promise((resolve, reject) => {
            this._interface.Previous((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

    /*
    Fast forward playback, this action is only stopped
    when another method in this interface is called.

    Possible Errors: org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    FastForward() {
        return new Promise((resolve, reject) => {
            this._interface.FastForward((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }
                    
    /*
    Rewind playback, this action is only stopped
    when another method in this interface is called.

    Possible Errors: org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    Rewind() {
        return new Promise((resolve, reject) => {
            this._interface.Rewind((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

    /*
    Press a specific key to send as passthrough command.
    The key will be released automatically. Use Hold()
    instead if the intention is to hold down the key.

    Possible Errors: org.bluez.Error.InvalidArguments
					 org.bluez.Error.NotSupported
					 org.bluez.Error.Failed
    */
    Press(avc_key) {
        return new Promise((resolve, reject) => {
            this._interface.Press(avc_key, (err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

    /*
    Press and hold a specific key to send as passthrough
    command. It is your responsibility to make sure that
    Release() is called after calling this method. The held
    key will also be released when any other method in this
    interface is called.
    */
    Hold(avc_key) {
        return new Promise((resolve, reject) => {
            this._interface.Hold(avc_key, (err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

    /*
    Release the previously held key invoked using Hold().
    */
    Release() {
        return new Promise((resolve, reject) => {
            this._interface.Release((err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    }

    /****** Properties ******/

    /*
    string Equalizer [readwrite]
    
        Possible values: "off" or "on"
    */
    Equalizer(value) {
        if (value !== undefined) {
            return this.setProperty("Equalizer", value);
        }
        return this.getProperty("Equalizer");
    }

    /*
    string Repeat [readwrite]
    Possible values: "off", "singletrack", "alltracks" or
					"group"
    */
    Repeat(value) {
        if (value !== undefined) {
            return this.setProperty("Repeat", value);
        }
        return this.getProperty("Repeat");
    }

    /*
    string Shuffle [readwrite]
    Possible values: "off", "alltracks" or "group"
    */
    Shuffle(value) {
        if (value !== undefined) {
            return this.setProperty("Shuffle", value);
        }
        return this.getProperty("Shuffle");
    }

    /*
    string Scan [readwrite]
    Possible values: "off", "alltracks" or "group"
    */
    Scan(value) {
        if (value !== undefined) {
            return this.setProperty("Scan", value);
        }
        return this.getProperty("Scan");
    }

    /*
    string Status [readonly]
    Possible status: "playing", "stopped", "paused",
					"forward-seek", "reverse-seek"
					or "error"
    */
    Status() {
        return this.getProperty("Status");
    }


    /*
    uint32 Position [readonly]

    Playback position in milliseconds. Changing the
    position may generate additional events that will be
    sent to the remote device. When position is 0 it means
    the track is starting and when it's greater than or
    equal to track's duration the track has ended. Note
    that even if duration is not available in metadata it's
    possible to signal its end by setting position to the
    maximum uint32 value.
    */
    Position() {
        return this.getProperty("Position");
    }

    /*
    dict Track [readonly]

			Track metadata.
			Possible values:
				string Title:
					Track title name
				string Artist:
					Track artist name
				string Album:
					Track album name
				string Genre:
					Track genre name
				uint32 NumberOfTracks:
					Number of tracks in total
				uint32 TrackNumber:
					Track number
				uint32 Duration:
					Track duration in milliseconds
    */
    Track() {
        return this.getProperty("Track");
    }

    /*
    object Device [readonly]

			Device object path.
    */
    Device() {
        return this.getProperty("Device");
    }
                        
    /*
    string Name [readonly]

			Player name
    */
    Name() {
        return this.getProperty("Name");
    }

    /*
    string Type [readonly]

    Player type

    Possible values:

        "Audio"
        "Video"
        "Audio Broadcasting"
        "Video Broadcasting"
    */
    Type() {
        return this.getProperty("Type");
    }

    /*
    string Subtype [readonly]

    Player subtype

    Possible values:

        "Audio Book"
        "Podcast"
    */
    Subtype() {
        return this.getProperty("Subtype");
    }

    /*
    boolean Browsable [readonly]

    If present indicates the player can be browsed using
    MediaFolder interface.

    Possible values:

        True: Supported and active
        False: Supported but inactive

    Note: If supported but inactive clients can enable it
    by using MediaFolder interface but it might interfere
    in the playback of other players.
    */
    Browsable() {
        return this.getProperty("Browsable");
    }

    /*
    boolean Searchable [readonly]

    If present indicates the player can be searched using
    MediaFolder interface.

    Possible values:

        True: Supported and active
        False: Supported but inactive

    Note: If supported but inactive clients can enable it
    by using MediaFolder interface but it might interfere
    in the playback of other players.
    */
    Searchable() {
        return this.getProperty("Searchable");
    }

    /*
    object Playlist

			Playlist object path.
    */
    Playlist() {
        return this.getProperty("Playlist");
    }
        
}

MediaPlayer.INTERFACE_NAME = "org.bluez.MediaPlayer1";

module.exports = MediaPlayer;