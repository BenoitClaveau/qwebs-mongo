/*!
 * remit
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

    get(request, response) {
        let id = request.params.id;
        return this.mongoGetById().then(content => {
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


};

exports = module.exports = CrudService;



