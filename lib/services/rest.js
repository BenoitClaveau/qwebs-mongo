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

    save() {
        return through2.obj(async (chunk, enc, callback) => {
            try {
                const res = await this.mongoSave(chunk);
                callback(null, res);
            }
            catch(error) {
                callback(error);
            }
        })
    }

    findOne(options = {}) {
        const { filter, options } = options;

        const stream = Readable({ objectMode: true }); 
        stream._read = () => {};
        process.nextTick(async () => {
            stream.push(await this.mongoFindOne(filter, options));
        })
        return stream;
    }
    
    /* http methods */

    async httpSave(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");
        ask.pipe(this.save()).pipe(reply);
        ask.on("mode", mode => reply.mode = mode);
    }

    async httpFind(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, skip, limit, project, sort, options } = ask.mongo || {};

        const cursor = await this.mongoFind(filter, options);
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
        reply.end(res);
    }

    async httpDeleteOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const res = await this.mongoDeleteOne(...ask.mongo);
        reply.end(res.ops[0]);
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