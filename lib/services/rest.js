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
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        this.findOne(filter, options).pipe(stream);
    }

    //GET /?query-string as filter
    async httpFind(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");

        let { filter, options, skip, limit, sort, project } = context.mongo || this.qs.parse(context.querystring) || {};
        
        let cursor = this.find(filter, options);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (sort) cursor = cursor.sort(sort);
        if (project) cursor = cursor.project(project);

        cursor.pipe(stream);
    }

    //POST /
    async httpInsertOne(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");
        
        stream.obj.pipe(this.insert()).pipe(stream);
    }

    //PUT /:id
    async httpUpdateOne(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");
        
        stream.obj.pipe(this.update()).pipe(stream);
    }

    //DELETE /:id
    async httpDeleteOne(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        this.deleteOne(filter, options).pipe(stream);
    }
    
    /* http api */

    async httpInsertMany(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");
        
        stream.pipe(this.insert()).pipe(stream);
    }

    async httpUpdateMany(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");
        
        stream.pipe(this.update()).pipe(stream);
    }

    async httpSaveMany(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");
        
        stream.pipe(this.save()).pipe(stream);
    }

    async httpSaveOne(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");
        
        stream.obj.pipe(this.save()).pipe(stream);
    }

    async httpCount(context, stream, headers) {
        if (!stream) throw new UndefinedError("stream");
        if (!stream) throw new UndefinedError("stream");

        const { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        this.count(filter, options).pipe(stream);
    }
}

exports = module.exports = HttpService;