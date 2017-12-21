/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error, UndefinedError } = require("oups");
const through2 = require('through2');
const Readable = require('stream');
const Crud = require('./crud');

class RestService extends Crud {
    
    constructor(collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
    }

    /* stream methods */

    streamifyOne(action) {
        const stream = Readable({ objectMode: true }); 
        stream._read = () => {};
        process.nextTick(() => {
            stream.push(action());
        })
        return stream;
    }

    streamify(action) {
        return through2.obj((chunk, enc, callback) => {
            try {
                callback(null, action(chunk, enc));
            }
            catch(error) {
                callback(error);
            }
        })
    }

    save() {
        return this.streamify(async (chunk, enc) => {
            const res = await this.mongoSave(chunk);
            return chunk;
        })
    }

    insert() {
        return this.streamify(async (chunk, enc) => {
            const res = await this.mongoInsertOne(chunk);
            return res.ops[0];
        })
    }

    findOne(options = {}) {
        const { filter, options } = options;
        return this.streamifyOne(async () => await this.mongoFindOne(filter, options));
    }

    count(options = {}) {
        const { filter, options } = options;
        return this.streamifyOne(async () => await this.mongoCount(filter, options));
    }
    
    /* http methods */

    async httpSave(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");
        ask.pipe(this.save()).pipe(reply);
        ask.on("mode", mode => reply.mode = mode);
    }

    async httpInsert(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");
        ask.pipe(this.insert()).pipe(reply);
        ask.on("mode", mode => reply.mode = mode);
    }

    async httpFind(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, skip, limit, project, sort, options } = ask.mongo || {};

        let cursor = await this.mongoFind(filter, options);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (project) cursor = cursor.project(project);
        if (sort) cursor = cursor.sort(sort);

        cursor.stream().pipe(reply);
    }

    async httpFindOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const res = await this.mongoFindOne(...ask.mongo);
        reply.obj.end(res);
    }

    async httpDeleteOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const res = await this.mongoDeleteOne(...ask.mongo);
        reply.obj.end(res.ops[0]);
    }

    async httpCount(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options } = ask.mongo || {};
        const count = await this.mongoCount(filter, options);
        reply.obj.end({ count });
    }
    
    /* mongo api extension */

    async mongoDropIfExists(options) {
        try {
            return await this.mongoDrop(options);
        } 
        catch(error) {
            console.log(error);
        }
    }
}

exports = module.exports = RestService;