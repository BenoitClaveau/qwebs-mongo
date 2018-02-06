/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
const { Error, UndefinedError } = require("oups");
const { PassThrough } = require("stream");

const kCrud = Symbol("crud");
const kReadable = Symbol("cursor");
const kFilter = Symbol("filter");
const kOptions = Symbol("options");
const kSkip = Symbol("skip");
const kLimit = Symbol("limit");
const kSort = Symbol("sort");
const kProject = Symbol("project");

class Find extends PassThrough {
    constructor(crud, filter, options = {}) {
        super({ objectMode: true });

        this[kCrud] = crud;
        this[kReadable] = null;
        this[kFilter] = filter;
        this[kOptions] = options;
        this[kSkip] = null;
        this[kLimit] = null;
        this[kSort] = null;
        this[kProject] = null;

        this.once("readableinit", this.onceReadableInit.bind(this));
    };

    skip(skip) {
        this[kSkip] = skip;
        return this;
    }

    limit(limit) {
        this[kLimit] = limit;
        return this;
    }

    sort(sort) {
        this[kSort] = sort;
        return this;
    }

    project(project) {
        this[kProject] = project;
        return this;
    }

    async onceReadableInit() {
        this[kReadable] = await this[kCrud].mongoFind(this[kFilter], this[kOptions]);
        if (this[kSkip]) this[kReadable] = this[kReadable].skip(this[kSkip]);
        if (this[kLimit]) this[kReadable] = this[kReadable].limit(this[kLimit]);
        if (this[kSort]) this[kReadable] = this[kReadable].sort(this[kSort]);
        if (this[kProject]) this[kReadable] = this[kReadable].project(this[kProject]);
        this[kReadable].on("data", data => {
            this.push(data);
            super.read(this._readableState.highWaterMark);
        })
        this[kReadable].on("end", () => {
            this.push(null);
            super.read(0);
        })
        
        this.emit("readableready");    
    }

    read(size) {
        if (!this[kReadable]) {
            this.once("readableready", this.read.bind(this, size));
            this.emit("readableinit");
            return null;
        }
        
        return this[kReadable].read(size); //force readable to read
    }
};

exports = module.exports = Find;