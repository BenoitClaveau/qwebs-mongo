/*!
 * qwebs-mongo
 * Copyright(c) 2015 Benoît Claveau <benoit.claveau@gmail.com>
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
        };
    }

    get db() {
        return new Promise((resolve, reject) => {
            try {
                if (this._db) resolve(this._db);
                else {
                    MongoClient.connect(this.$config.mongo.connectionString).then(db => {
                        if (!db) throw new DataError({ message: "No database." });
                        if (!db.collection) throw new DataError({ message: "No collection." });
                        console.log("Listen mongo " + this.$config.mongo.connectionString);
                        this._db = db;
                        this._db.on("close", () => {
                            this._db = null;
                        });
                        resolve(this._db);
                    }).catch(error => {
                        reject(new DataError({ statusCode: 500, message: error.message, data: { connectionString: this.$config.mongo.connectionString }, stack: error.stack }));
                    });
                }
            }
            catch(error) {
                reject(new DataError({ statusCode: 500, message: error.message, stack: error.stack }));
            }
        });
    }

    close() {
        if (this._db) this._db.close();
    }
};

exports = module.exports = MongoService;
