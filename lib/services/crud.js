/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const DataError = require("qwebs").DataError;
const ObjectID = require('mongodb').ObjectID;
const ToArray = require("qwebs").ToArray;
const MongoService = require("../qwebs-mongo");
const pluralize = require('pluralize');


class CrudService {
    constructor(collectionName, $mongo, dbName = "db") {
        if (!collectionName) throw new DataError({ message: "collectionName isn't defined." });
        if (!$mongo) throw new DataError({ message: "$mongo isn't defined." });
        if ($mongo instanceof MongoService == false) throw new DataError({ message: "$mongo isn't a MongoService." });
        
        this.$mongo = $mongo;
        this.collectionName = collectionName;
        this.objectName = pluralize.singular(collectionName);
        this.dbName = dbName;

        Object.defineProperty(this, 'collection', { 
            get: () => { 
                return this.$mongo[this.dbName].then(db => {
                    return db.collection(this.collectionName);
                });
            }
        });
    };

    /* http ------------------------------------------------*/

    httpGetById(request, response) {
        let id = request.params ? request.params.id : request.query ? request.query.id : null;
        if (!id) throw new DataError({ message: "Id is not defined." });
        return this.mongoGetById(id).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpInsert(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoInsert(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpUpdate(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoUpdate(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpSave(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoSave(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpInsertList(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoInsertList(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpUpdateList(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoUpdateList(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpSaveList(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoSaveList(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpDeleteById(request, response) {
        let id = request.params ? request.params.id : request.query ? request.query.id : null;
        if (!id) throw new DataError({ message: "Id is not defined." });
        return this.mongoDeleteById(id).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpDelete(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoDelete(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpDeleteList(request, response) {
        if (!request.body) throw new DataError({ message: "Request body is not defined." });
        return this.mongoDeleteList(request.body).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpDeleteMany(request, response) {
        const {filter} = request.mongo || {};
        return this.mongoDeleteMany(filter).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpStream(request, response) {
        const {query, options} = request.mongo || {};
        return this.mongoStream(query, options).then(stream => {
            return response.send({ request: request, stream: stream });
        });
    };

    httpArray(request, response) {
        const {query, options} = request.mongo || {};
        return this.mongoArray(query, options).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpDistinct(request, response) {
        const {field, query, options} = request.mongo || {};
        return this.mongoDistinct(field, query, options).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    httpAggregate(request, response) {
        const {pipeline, options} = request.mongo || {};
        return this.mongoAggregate(pipeline, options).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    /* primitives ------------------------------------------*/

    mongoGetById(id, options) {
        return this.collection.then(collection => {
            if (!id) throw new DataError({ message: "Id isn't defined." });
            if (id instanceof ObjectID == false) id = new ObjectID(id);
            return collection.findOne({ _id: id }, options).then(object => {
                if (!object) throw new DataError({ message: `${this.objectName} isn't defined.` });
                return object;
            });
        });
    };

    mongoGet(query, options) {
        return this.collection.then(collection => {
            if (!query) throw new DataError({ message: "Query isn't defined." });
            return collection.findOne(query, options).then(object => {
                if (!object) throw new DataError({ message: `${this.objectName} isn't defined.` });
                return object;
            });
        });
    };

    mongoArray(query, options) {
        query = query || {};
        options = options || {};

        return this.collection.then(collection => {
            let q = collection.find(query);
            if (options.limit) q = q.limit(options.limit);
            if (options.skip) q = q.skip(options.skip);
            if (options.sort) q = q.sort(options.sort);

            return q.toArray();
        });
    };

    mongoStream(query, options) {
        query = query || {};
        options = options || {};

        return this.collection.then(collection => {
            let q = collection.find(query);
            if (options.limit) q = q.limit(options.limit);
            if (options.skip) q = q.skip(options.skip);
            if (options.sort) q = q.sort(options.sort);

            return q.stream();
        });
    };

    mongoCount(query) {
        query = query || {};

        return this.collection.then(collection => {
            return this.count(query);
        });
    };

    mongoSave(object) {
        return this.mongoGetById(object._id).then(previous => {
            return this.mongoUpdate(object);
        }).catch(error => {
            if (error.message != `${this.objectName} isn't defined.`) throw error;
            return this.mongoInsert(object);
        });
    };

    mongoSaveList(objects) {
        return Promise.all(objects.map(object => {
            return this.mongoSave(object);
        }));
    };

    mongoInsert(object) {
        return this.collection.then(collection => {
            delete object._id;
            return collection.insertOne(object).then(res => {
                return res.ops[0];
            });
        });
    };

    mongoInsertList(objects) {
        return Promise.all(objects.map(object => {
            return this.mongoInsert(object);
        }));
    };

    mongoUpdate(object) {
        return this.collection.then(collection => {
            if (object._id instanceof ObjectID == false) object._id = new ObjectID(object._id);
            let copy = Object.assign({}, object);
            delete copy._id;
            return collection.updateOne({ _id: object._id }, object).then(res => {
                return this.mongoGetById(object._id);
            });
        });
    };

    mongoUpdateList(objects) {
        return Promise.all(objects.map(object => {
            return this.mongoUpdate(object);
        }));
    };

    mongoDeleteById(id) {
        return this.collection.then(collection => {
            if (!id) throw new DataError({ message: "Id isn't defined." });
            if (id instanceof ObjectID == false) id = new ObjectID(id);
            return collection.deleteOne({ _id: id });
        });
    };

    mongoDeleteMany(filter) {
        return this.collection.then(collection => {
            if (!filter) throw new DataError({ message: "Filter isn't defined." });
            return collection.deleteMany(filter);
        });
    };

    mongoDelete(object) {
        return this.mongoDeleteById(object._id);
    };

    mongoDeleteList(objects) {
        return Promise.all(objects.map(object => {
            return this.mongoDelete(object);
        }));
    };

    mongoDrop(options) {
        return this.collection.then(collection => {
            return collection.drop(options);
        });
    };

    mongoCreateIndex(fieldOrSpec, options) {
        return this.collection.then(collection => {
            return collection.createIndex(fieldOrSpec, options);
        });
    };

    mongoDistinct(field, query, options) {
        return this.collection.then(collection => {
            return collection.distinct(field, query, options);
        });
    };

    mongoAggregate(pipeline, options) {
        return this.collection.then(collection => {
            return collection.aggregate(pipeline, options);
        });
    };
};

exports = module.exports = CrudService;
