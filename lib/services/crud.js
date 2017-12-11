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

    async collection() {
        const db = await this.mongo.connect(this.dbName);
        return db.collection(this.collectionName);
    }

    /* http methods */

    async httpFindOne(ask, reply) {
        const { query } = ask.mongo || {};

        let doc = await this.findOne(query);
        reply.end(doc);
    }

    async httpFindMany(ask, reply) {
        const { query, skip, limit, project, sort } = ask.mongo || {};

        let q = await this.findMany({});
        // if (skip) q = q.skip(skip);
        // if (limit) q = q.limit(limit);
        // if (project) q = q.project(project);
        // if (sort) q = q.sort(sort);
        q.stream().pipe(reply);
    }

    async httpSave(ask, reply) {
        ask.pipe(through2.obj(async (chunk, enc, callback) => {
            const res = await this.save(chunk);
            callback(null, res);
        })).pipe(reply);
    }

    /* extended api */

    async save(obj) {
        const { _id, ...fields } = obj;
        const doc = await this.updateOne({ _id: _id }, fields, { upsert: true });
    }

    async deleteObject(obj) {
        return this.deleteOne({ _id: new ObjectId(obj._id) })
    }

    /* mongo api */

    async findOne() {
        const collection = await this.collection();
        return collection.findOne(...arguments)
    }

    async findMany() {
        const collection = await this.collection();
        return collection.findMany(...arguments)
    }

    async insertOne() {
        const collection = await this.collection();
        const doc = await collection.insertOne(...arguments);
        return doc.ops[0];
    }

    async insertMany() {
        const collection = await this.collection();
        return collection.insertMany(...arguments)
    }

    async deleteOne() {
        const collection = await this.collection();
        return collection.deleteOne(...arguments)
    }

    async deleteMany() {
        const collection = await this.collection();
        return collection.deleteMany(...arguments)
    }
};

exports = module.exports = CrudService;
