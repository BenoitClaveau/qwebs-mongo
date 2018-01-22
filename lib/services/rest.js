/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error, UndefinedError } = require("oups");
const { Readable } = require('stream');
const Crud = require('./crud');

class RestService extends Crud {
    
    constructor(collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
    }
    
    /* http methods */

    async httpSave(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        ask.on("mode", mode => reply.mode = mode);  //same mode (object | array) as input
        ask.pipe(this.save()).pipe(reply);
    }

    async httpInsert(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");
        
        ask.on("mode", mode => reply.mode = mode);  //same mode (object | array) as input
        ask.pipe(this.insert()).pipe(reply);
    }

    async httpUpdate(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");
        
        ask.on("mode", mode => reply.mode = mode);  //same mode (object | array) as input
        ask.pipe(this.update()).pipe(reply);
    }

    async httpFind(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options, skip, limit, sort, project } = ask.mongo || {};
        let cursor = this.find(filter, options);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (sort) cursor = cursor.sort(sort);
        if (project) cursor = cursor.project(project);

        cursior.pipe(reply);
    }

    async httpFindOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options } = ask.mongo || {};
        this.findOne(filter, options).pipe(reply);
    }

    async httpDeleteOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options } = ask.mongo || {};
        this.deleteOne(filter, options).pipe(reply);
    }

    async httpCount(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options } = ask.mongo || {};
        this.count(filter, options).pipe(reply);
    }
}

exports = module.exports = RestService;