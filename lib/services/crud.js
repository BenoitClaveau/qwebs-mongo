/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error, UndefinedError } = require("oups");
const ObjectID = require('mongodb').ObjectID;
const pluralize = require('pluralize');
const through2 = require('through2');

class CrudService {
    constructor(collectionName, $mongo, dbName) {
        if (!collectionName) throw new UndefinedError("collectionName");
        if (typeof collectionName !== "string") throw new Error("collectionName isn't a string.");
        if (!$mongo) throw new UndefinedError("$mongo");
        
        this.mongo = $mongo;
        this.collectionName = collectionName;
        this.objectName = pluralize.singular(collectionName);
        this.dbName = dbName;   //could be null
    };

    async collection(filter, options) {
        const db = await this.mongo.connect(this.dbName);
        return db.collection(this.collectionName);
    }

    /* http methods */

    async httpFindOne(ask, reply) {
        const { filter } = ask.mongo || {};

        let doc = await this.findOne(filter);
        reply.end(doc);
    }

    async httpFind(ask, reply) {
        const { filter, skip, limit, project, sort } = ask.mongo || {};

        let cursor = await this.find(filter);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (project) cursor = cursor.project(project);
        if (sort) cursor = cursor.sort(sort);
        return cursor.stream().pipe(reply);
    }

    async httpSave(ask, reply) {
        ask.pipe(through2.obj(async (chunk, enc, callback) => {
            const res = await this.save(chunk);
            callback(null, res);
        })).pipe(reply);
    }

    /* extended api */

    async deleteObject(obj) {
        return this.deleteOne({ _id: new ObjectId(obj._id) })
    }

    async save(obj) {
        const { _id, ...fields } = obj;
        const doc = await this.updateOne({ _id: _id }, fields, { upsert: true });
    }

    /* mongo api */

    async insertOne(doc, options) {
        const collection = await this.collection();
        const res = await collection.insertOne(doc, options);
        return res.ops[0];
    }

    async insertMany(docs, options) {
        const collection = await this.collection();
        return await collection.insertMany(docs, options)
    }

    async aggregate(pipeline, options) {
        const collection = await this.collection();
        return await collection.aggregate(pipeline, options)
    }

    async bulkWrite(operations, options) {
        const collection = await this.collection();
        return await collection.bulkWrite(operations, options)
    }

    async count(filter, options) {
        const collection = await this.collection();
        return await collection.count(filter, options)
    }

    async deleteOne(filter, options) {
        const collection = await this.collection();
        return await collection.deleteOne(filter, options)
    }

    async deleteMany(filter, options) {
        const collection = await this.collection();
        return await collection.deleteMany(filter, options)
    }

    async distinct(key, query, options) {
        const collection = await this.collection();
        return await collection.distinct(key, query, options)
    }

    async findOne(filter, options) {
        const collection = await this.collection();
        return await collection.findOne(filter, options)
    }

    async find(filter, options) {
        const collection = await this.collection();
        return await collection.find(filter, options)
    }

    async findOneAndDelete(filter, options) {
        const collection = await this.collection();
        return await collection.findOneAndDelete(filter, options)
    }

    async findOneAndReplace(filter, replacement, options) {
        const collection = await this.collection();
        return await collection.findOneAndReplace(filter, replacement, options)
    }

    async findOneAndUpdate(filter, update, options) {
        const collection = await this.collection();
        return await collection.findOneAndUpdate(filter, update, options)
    }

    async geoHaystackSearch(x, y, options) {
        const collection = await this.collection();
        return await collection.geoHaystackSearch(x, y, options)
    }

    async geoNear(x, y, options) {
        const collection = await this.collection();
        return await collection.geoNear(x, y, options)
    }

    async group(keys, condition, initial, reduce, finalize, command, options) {
        const collection = await this.collection();
        return await collection.group(keys, condition, initial, reduce, finalize, command, options)
    }

    async mapReduce(map, reduce, options) {
        const collection = await this.collection();
        return await collection.group(map, reduce, options)
    }

    async replaceOne(filter, doc, options) {
        const collection = await this.collection();
        return await collection.group(filter, doc, options)
    }
};

exports = module.exports = CrudService;
