/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error, UndefinedError } = require("oups");
const through2 = require('through2');
const Crud = require('./crud');

class RestService {
    
    constructor(collectionName, $mongo, dbName) {
        if (!collectionName) throw new UndefinedError("collectionName");
        if (typeof collectionName !== "string") throw new Error("collectionName isn't a string.");
        if (!$mongo) throw new UndefinedError("$mongo");
        
        this.mongo = new Crud(collectionName, $mongo, dbName);
    }

    async saveObject(obj) {
        const { _id, ...fields } = obj;
        const doc = await this.mongo.updateOne({ _id: _id }, fields, { upsert: true });
    }

    async save(ask, reply) {
        ask.pipe(through2.obj(async (chunk, enc, callback) => {
            const res = await this.saveObject(chunk);
            callback(null, res);
        })).pipe(reply);
    }

    async find(ask, reply) {
        const { filter, skip, limit, project, sort } = ask.mongo;
        
        let cursor = await this.mongo.find(filter);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (project) cursor = cursor.project(project);
        if (sort) cursor = cursor.sort(sort);
        
        cursor.stream().pipe(reply);
    }

    async findOne(ask, reply) {
        const doc = await this.mongo.findOne(ask.mongo);
        reply.end(doc);
    }
}

exports = module.exports = RestService;