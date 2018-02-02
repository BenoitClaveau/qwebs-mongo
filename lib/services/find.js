/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Error, UndefinedError } = require("oups");
const { PassThrough } = require('stream');

class Find extends PassThrough {
    constructor(crud, filter, options = {}) {
        super({ objectMode: true });
        this.crud = crud;
        this._filter = filter;
        this._options = options;
        this._skip = null;
        this._limit = null;
        this._sort = null;
        this._project = null;
    };

    skip(skip) {
        this._skip = skip;
        return this;
    }

    limit(limit) {
        this._limit = limit;
        return this;
    }

    sort(sort) {
        this._sort = sort;
        return this;
    }

    project(project) {
        this._project = project;
        return this;
    }
    
    pipe(dest) {
        super.pipe(dest);
        process.nextTick(async () => {
            let cursor = await this.crud.mongoFind(this._filter, this._options);
            if (this._skip) cursor = cursor.skip(this._skip);
            if (this._limit) cursor = cursor.limit(this._limit);
            if (this._sort) cursor = cursor.sort(this._sort);
            if (this._project) cursor = cursor.project(this._project);
            cursor.on("data", data => {
                this.write(data);
            }).on("end", () => {
                this.end();
            }).on("error", error => {
                this.emit("error", error);
            })
        });
        return this;
    };
};

exports = module.exports = Find;