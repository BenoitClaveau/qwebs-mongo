/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error, UndefinedError } = require("oups");
const { Readable } = require('stream');
const Crud = require('./crud');

/**
 * ask.mongo must be defined
 */
class HttpService extends Crud {
    
    constructor($qwebs, collectionName, dbName) {
        super($qwebs, collectionName, dbName);
        $qwebs.inject("$mongo-querystring", `${__dirname}/mongo-querystring`, { reload: false });
    }

    async mount() {
        this.qs = await this.qwebs.resolve("$mongo-querystring");
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

        let { filter, options, skip, limit, sort, project } = ask.mongo || this.qs.parse(ask.querystring);
        
        let cursor = this.find(filter, options);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (sort) cursor = cursor.sort(sort);
        if (project) cursor = cursor.project(project);

        cursor.pipe(reply);
    }

    async httpFindOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options } = ask.mongo || this.qs.parse(ask.querystring);
        this.findOne(filter, options).pipe(reply);
    }

    async httpDeleteOne(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options } = ask.mongo || this.qs.parse(ask.querystring);
        this.deleteOne(filter, options).pipe(reply);
    }

    async httpCount(ask, reply) {
        if (!ask) throw new UndefinedError("ask");
        if (!reply) throw new UndefinedError("reply");

        const { filter, options } = ask.mongo || this.qs.parse(ask.querystring);
        this.count(filter, options).pipe(reply);
    }
}

exports = module.exports = HttpService;