/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error } = require("oups");
const ObjectID = require('mongodb').ObjectID;
const MongoService = require("../qwebs-mongo");
const pluralize = require('pluralize');


class CrudService {
    constructor(collectionName, $mongo, dbName) {
        if (!collectionName) throw new Error("collectionName isn't defined.");
        if (!$mongo) throw new Error("$mongo isn't defined.");
        if ($mongo instanceof MongoService == false) throw new Error("$mongo isn't a MongoService.");
        
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
};

exports = module.exports = CrudService;
