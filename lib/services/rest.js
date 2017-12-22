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
            try {
                stream.push(action());
            }
            catch(error) {
                stream.emit("error", error)
            }
        })
        return stream;
    }

    streamify(action) {
        return through2.obj((chunk, enc, callback) => {
            action(chunk, enc, callback);
        })
    }

    save() {
        return this.streamify(async (chunk, enc, callback) => {
            try {
                const res = await this.mongoSave(chunk);
                callback(null, chunk);
            }
            catch(error) {
                callback(error);
            }
        })
    }

    insert() {
        return this.streamify(async (chunk, enc, callback) => {
            try {
                const res = await this.mongoInsertOne(chunk);
                callback(null, res.ops[0]);
            }
            catch(error) {
                callback(error);
            }
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

        ask.on("mode", mode => reply.mode = mode);  //same mode (object | array) as input
        const save = this.save().on("error", error => reply.emit("error", error));
        ask.pipe(save).pipe(reply);
        
    }

    async httpInsert(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");
        
        ask.on("mode", mode => reply.mode = mode);  //same mode (object | array) as input
        const insertion = this.insert().on("error", error => reply.emit("error", error));
        ask.pipe(insertion).pipe(reply);
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