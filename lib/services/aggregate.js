/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
const { Error, UndefinedError } = require("oups");
const { PassThrough } = require("stream");

const kCrud = Symbol("crud");
const kReadable = Symbol("cursor");
const kPipeline = Symbol("pipeline");
const kOptions = Symbol("options");

class Find extends PassThrough {
    constructor(crud, pipeline, options = {}) {
        super({ objectMode: true });

        this[kCrud] = crud;
        this[kReadable] = null;
        this[kPipeline] = pipeline;
        this[kOptions] = options;

        this.once("readableinit", async () => this.onceReadableInit());
    };

    async onceReadableInit() {
        this[kReadable] = await this[kCrud].mongoAggregate(this[kPipeline], this[kOptions]);
        this[kReadable].on("data", data => {
            this.push(data);
            super.read(this._readableState.highWaterMark);
        })
        this[kReadable].on("end", () => {
            this.push(null);
            super.read(0);
        })
        this.resume(); // resume then flow(stream) then stream.read
    }

    read(size) {
        if (!this[kReadable]) {
            this.pause();
            this.emit("readableinit");
            return false;
        }
        
        return this[kReadable].read(size); //force readable to read
    }
};

exports = module.exports = Find;