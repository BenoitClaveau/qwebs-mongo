/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error, UndefinedError } = require("oups");
const ObjectID = require('mongodb').ObjectID;
const pluralize = require('pluralize');

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
        const { mongo: { query, skip, limit, project, sort }} = ask;
        const collection = await this.collection();
        let doc = collection.httpFindOne(query);
        reply.end(doc);
    }

    async httpFind(ask, reply) {
        const { mongo: { query, skip, limit, project, sort }} = ask;
        const collection = await this.collection();
        let q = collection.find(query);
        if (skip) q = q.skip(skip);
        if (limit) q = q.limit(limit);
        if (project) q = q.project(project);
        if (sort) q = q.sort(sort);
        return q.stream().pipe(reply);
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
        return collection.insertOne(...arguments)
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

    async deleteObject(obj) {
        return this.deleteOne({ _id: new ObjectId(obj._id) })
    }
};

exports = module.exports = CrudService;
