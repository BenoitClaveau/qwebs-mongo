/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error, UndefinedError } = require("oups");
const through2 = require('through2');
const Crud = require('./crud');

class RestService extends Crud {
    
    constructor(collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
    }

    save() {
        return through2.obj(async (chunk, enc, callback) => {
            const res = await this.mongoSave(chunk);
            callback(null, res);
        })
    }

    async find(options = {}) {
        const { filter, skip, limit, project, sort } = options;

        let cursor = await this.mongoFind(filter);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (project) cursor = cursor.project(project);
        if (sort) cursor = cursor.sort(sort);
        
        return cursor.stream();
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
        this.find(ask.mongo).pipe(reply);
    }

    async httpFindOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const res = await this.mongoFindOne(ask.mongo);
        reply.end(res.ops[0]);
    }

    async findMe(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");
        if (!ask.auth) throw new HttpError(500, "${ask.method}:${ask.url} hasn't been authenticated.", { ask });

        ask.mongo = { filter: { _id: ask.auth.payload._id }};
        return this.httpFindOne(ask, reply);
    }

    async httpDeleteOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const res = await this.mongoDeleteOne(ask.mongo);
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