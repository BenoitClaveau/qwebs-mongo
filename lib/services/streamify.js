/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Transform, Readable } = require("stream");

streamifyOne = (action) => {
    const stream = Readable({ 
        objectMode: true,
        read: () => {} 
    }); 
    process.nextTick(() => {
        try {
            stream.push(action());
        }
        catch(error) {
            stream.emit("error", error)
        }
    })
    return stream;
}

streamify = (action) =>{
    return new Transform({
        objectMode: true,
        async transform(chunk, encoding, callback) {
            try {
                const res = await action(chunk, encoding);
                callback(null, res);
            }
            catch(error) {
                callback(error);
            }
        }
    });
}

module.exports.streamifyOne = streamifyOne;
module.exports.streamify = streamify;