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
        this.filter = filter;
        this.options = options;
        this.skip = null;
        this.limit = null;
        this.sort = null;
        this.project = null;
    };

    skip(skip) {
        this.skip = skip;
        return this;
    }

    limit(limit) {
        this.limit = limit;
        return this;
    }

    sort(sort) {
        this.sort = sort;
        return this;
    }

    project(project) {
        this.project = project;
        return this;
    }
    
    pipe(dest) {
        super.pipe(dest);
        process.nextTick(async () => {
            let cursor = await this.crud.mongoFind(this.filter, this.options);
            if (this.skip) cursor = cursor.skip(this.skip);
            if (this.limit) cursor = cursor.skip(this.limit);
            if (this.sort) cursor = cursor.skip(this.sort);
            if (this.project) cursor = cursor.skip(this.project);
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