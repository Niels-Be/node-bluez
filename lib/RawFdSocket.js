const stream = require('stream');
const StringDecoder = require('string_decoder').StringDecoder;
const ErrNo = require('errno')
const RawFd = require('../build/Release/RawFd.node');

class RawFdSocket extends stream.Duplex {

    constructor(fd, options) {
        options = options || {};
        super({
            decodeStrings: true,
            highWaterMark: options.highWaterMark,
            encoding: options.encoding
        });

        this._impl = new RawFd(fd, this.onRead.bind(this));
    }

    _write(chunk, encoding, callback) {
        if (encoding !== 'buffer')
            chunk = Buffer.from(chunk, encoding);
        const ret = this._impl.write(chunk);

        let err = null;
        if (ret !== 0) {
            const errDesc = ErrNo.errno[ret] || {};
            const err = new Error(errDesc.description || "Code "+ret);
            err.name = "SystemError";
            err.syscall = "read";
            err.errno = ret;
            err.code = errDesc.code;
        }
        callback(err);
    }

    _read(size) {
        this._impl.start();
    }

    onRead(errno, buf) {
        if (errno !== 0) {
            //TODO emit close event
            if(errno === 103/*ECONNABORTED*/) {
                this._impl.stop();
                this.push(null);
                return;
            }

            const errDesc = ErrNo.errno[errno] || {};
            const err = new Error(errDesc.description || "Code "+errno);
            err.name = "SystemError";
            err.syscall = "read";
            err.errno = errno;
            err.code = errDesc.code;

            process.nextTick(() => this.emit('error', err));
            return;
        }
        if (!this.push(buf)) {
            this._impl.stop();
        }
    }

    _destroy(err, cb) {
        return this.close(cb);
    }

    _final(cb) {
        return this.close(cb);
    }

    close(cb) {
        try {
            this._impl.close();
        } catch (e) {
            return cb && cb(e);
        }
        cb && cb();
    }
}

module.exports = RawFdSocket;