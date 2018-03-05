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

    /* rest api: alias to http api */

    //GET /:id
    async restGet(context, stream, headers) {
        return await this.httpFindOne(context, stream, headers);
    }

    //GET /?query-string as filter
    async restFind(context, stream, headers) {
        return await this.httpFind(context, stream, headers);
    }

    //POST /
    async restInsert(context, stream, headers) {
        return await this.httpInsertOne(context, stream, headers);
    }

    //PUT /:id
    async restUpdate(context, stream, headers) {
        return await this.httpSaveOne(context, stream, headers);
    }

    //DELETE /:id
    async restDelete(context, stream, headers) {
        return await this.httpDeleteOne(context, stream, headers);
    }
    

    /* http api */

    async httpFindOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        stream.mode("object");
        return pump(this.findOne(filter, options), stream);
    }

    
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

	async httpAggregate(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { pipeline, options } = context.mongo || {};
        
        let cursor = this.aggregate(pipeline, options);

        return pump(cursor, stream);
    }

    async httpInsertOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        stream.mode("object");
        return pump(stream, this.insert(), stream);
    }
    
    async httpInsertMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        return pump(stream, this.insert(), stream);
    }

    /* user $set, $unset, $rename */
    async httpUpdateOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        stream.mode("object");
        return pump(stream, this.update(filter, options), stream);
    }

    /* user $set, $unset, $rename */
    async httpUpdateMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        
        return pump(stream, this.update(filter, options), stream);
    }

    async httpDeleteOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        stream.mode("object");
        return pump(this.deleteOne(filter, options), stream);
    }

    async httpDeleteMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        
        return pump(stream, this.delete(filter, options), stream);
    }

    async httpSaveOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");
        
        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        stream.mode("object");
        return pump(stream, this.save(filter, options), stream);
    }

    async httpSaveMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        
        return pump(stream, this.save(filter, options), stream);
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