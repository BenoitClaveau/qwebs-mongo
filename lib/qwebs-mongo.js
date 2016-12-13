/*!
 * qwebs-mongo
 * Copyright(c) 2015 Benoît Claveau
 * MIT Licensed
 */

//https://mongodb.github.io/node-mongodb-native

"use strict";

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const DataError = require("qwebs").DataError;

class MongoService {
    constructor($config) {
        if (!$config.mongo) throw new DataError({ message: "Mongo section is not defined in qwebs config." });
        if (!$config.mongo.connectionString) throw new DataError({ message: "Mongo connectionString is not defined in qwebs config." });
        this.$config = $config;
        this._db = null;
        RegExp.prototype.toJSON = RegExp.prototype.toString; //serialize Regex
        ObjectId.prototype.inspect = function() {
            return "ObjectId(\"" + this.toString() + "\")"; 
        }

        console.log("defineProperty db");

        Object.defineProperty(this, "db", {
            enumerable: true,
            get: function() {
                console.log("inside db property");
                return new Promise((resolve, reject) => {
                    try {
                        if (this._db) resolve(this._db);
                        else {
                            return MongoClient.connect(this.$config.mongo.connectionString).then(db => {
                                if (!db) throw new DataError({ message: "No database." });
                                if (!db.collection) throw new DataError({ message: "No collection." });
                                console.log("Listen mongo " + this.$config.mongo.connectionString);
                                this._db = db;
                                return this.db;
                            }).then(resolve).catch(reject);
                        }
                    }
                    catch(error) {
                        reject(error);
                    }
                });
            }
        })
    }
};

exports = module.exports = MongoService;
