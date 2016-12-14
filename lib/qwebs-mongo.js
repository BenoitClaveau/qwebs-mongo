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

        Object.defineProperty(this, "db", {
            enumerable: true,
            get: function() {
                return new Promise((resolve, reject) => {
                    try {
                        if (this._db) resolve(this._db);
                        else {
                            console.log("connectionString", this.$config.mongo.connectionString);
                            return MongoClient.connect(this.$config.mongo.connectionString).then(db => {
                                if (!db) throw new DataError({ message: "No database." });
                                if (!db.collection) throw new DataError({ message: "No collection." });
                                console.log("Listen mongo " + this.$config.mongo.connectionString);
                                this._db = db;
                                this._db.on("close", error => {
                                    console.log("On close", error)
                                    this._db = null;
                                });
                                return this._db;
                            }).then(resolve).catch(reject);
                        }
                    }
                    catch(error) {
                        if (error.name != 'DataError') reject(new DataError({ message: error.message, stack: error.stack }));
                        else reject(error);
                    }
                });
            }
        })
    }

    close() {
        console.log("close.");
        if (this._db) this._db.close();
    }
};

exports = module.exports = MongoService;
