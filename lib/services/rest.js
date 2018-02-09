/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

"use strict";

const { Error, UndefinedError } = require("oups");
const { Readable } = require('stream');
const Crud = require('./crud');
const pump = require("pump");

/**
 * context.mongo must be defined
 */
class HttpService extends Crud {
    
    constructor($qwebs, collectionName, dbName) {
        super($qwebs, collectionName, dbName);
        $qwebs.inject("$mongo-querystring", `${__dirname}/mongo-querystring`, { reload: false });
    }

    async mount() {
        this.qs = await this.qwebs.resolve("$mongo-querystring");
    }

    /* default rest api */

    //GET /:id
    async httpFindOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        stream.mode("object");
        return pump(this.findOne(filter, options), stream);
    }

    //GET /?query-string as filter
    async httpFind(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options, skip, limit, sort, project } = context.mongo || this.qs.parse(context.querystring) || {};
        
        let cursor = this.find(filter, options);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (sort) cursor = cursor.sort(sort);
        if (project) cursor = cursor.project(project);

        return pump(cursor, stream);
    }

    //POST /
    async httpInsertOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        stream.mode("object");
        return pump(stream, this.insert(), stream);
    }

    //PUT /:id
    async httpUpdateOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        stream.mode("object");
        return pump(stream, this.update(), stream);
    }

    //DELETE /:id
    async httpDeleteOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        stream.mode("object");
        return pump(this.deleteOne(filter, options), stream);
    }
    
    /* http api */

    async httpInsertMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        return pump(stream, this.insert(), stream);
    }

    async httpUpdateMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        return pump(stream, this.update(), stream);
    }

    async httpSaveMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        return pump(stream, this.save(), stream);
    }

    async httpSaveOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        stream.mode("object");
        return pump(stream, this.save(), stream);
    }

    async httpCount(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        const { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        
        stream.mode("object");
        return pump(this.count(filter, options), stream);
    }
}

exports = module.exports = HttpService;