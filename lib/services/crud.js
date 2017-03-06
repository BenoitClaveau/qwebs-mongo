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
    constructor(collectionName, $mongo) {
        if (!collectionName) throw new DataError({ message: "collectionName isn't defined." });
        if (!$mongo) throw new DataError({ message: "$mongo isn't defined." });
        if ($mongo instanceof MongoService) throw new DataError({ message: "$mongo isn't a MongoService." });
        
        this.$mongo = $mongo;
        this.collectionName = collectionName;
        this.objectName = pluralize.singular(collectionName);
    };

    /* rest ------------------------------------------------*/

    getById(request, response) {
        let id = request.params.id;
        return this.mongoGetById(id).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    save(request, response) {
        let object = request.body;
        return this.mongoSave(object).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    deleteById(request, response) {
        let id = request.params.id;
        return this.mongoDeleteById(id).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    delete(request, response) {
        let object = request.body;
        return this.mongoDelete(object).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    deleteList(request, response) {
        let objects = request.body;
        return this.mongoDeleteList(objects).then(content => {
            return response.send({ request: request, content: content });
        });
    };

    /* primitives ------------------------------------------*/

    get collection() {
        return this.$mongo.db.then(db => {
            return db.collection(this.collectionName);
        });
    };

    mongoGetById(id) {
        return this.collection.then(collection => {
            if (!id) throw new DataError({ message: "Id isn't defined." });
            if (id instanceof ObjectID == false) id = new ObjectID(id);
            return collection.findOne({ _id: id }).then(object => {
                if (!object) throw new DataError({ message: `${this.objectName} isn't defined.` });
                return object;
            });
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

    mongoInsert(object) {
        return this.collection.then(collection => {
            delete object._id;
            return collection.insertOne(object).then(res => {
                return res.ops[0];
            });
        });
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

    mongoDeleteById(id) {
        return this.collection.then(collection => {
            if (!id) throw new DataError({ message: "Id isn't defined." });
            if (id instanceof ObjectID == false) id = new ObjectID(id);
            return collection.deleteOne({ _id: id });
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
};

exports = module.exports = CrudService;



