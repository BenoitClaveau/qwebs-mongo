/*!
 * qwebs-mongo
 * Copyright(c) 2015 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */

//https://mongodb.github.io/node-mongodb-native

"use strict";

const { MongoClient } = require("mongodb");
const { ObjectID } = require("mongodb");
const { DataError } = require("qwebs");
const EventEmitter = require('events');

class MongoService {
    constructor($config) {
        if (!$config.mongo) throw new DataError({ message: "Mongo section is not defined in qwebs config." });
        this.$config = $config;
        this._dbs = {};

        RegExp.prototype.toJSON = RegExp.prototype.toString; //serialize Regex
        ObjectID.prototype.inspect = function() {
            return "ObjectID(\"" + this.toString() + "\")"; 
        };

        Object.keys(this.$config.mongo).map(k => {
            if(this.$config.mongo[k].connectionString) { //need to create property
                Object.defineProperty(this, k, {
                    get: () => {
                        return this.instance(k);
                    }
                });
            }
        });

        Object.defineProperty(this, "db", { 
            get: () => {
                return this.instance("db");
            }
        });

        this.event = new EventEmitter();
		this.event.on("qwebs.dispose", () => this.close());
    }

    mongoConf(dbName) {
        switch (dbName) {
            case "db":
                return this.$config.mongo;
            default: 
                if (!this.$config.mongo[dbName]) throw new DataError({ message: "Failed to read mongo configuration", data: { dbName: dbName, "config.json": `config.mongo.${dbName}` }});
                return this.$config.mongo[dbName];
        }
    }

    instance(dbName) {
        return Promise.resolve({}).then(() => {
            const db = this._dbs[dbName];
            if (db) return db;
            
            let mongoConf = this.mongoConf(dbName);
            return MongoClient.connect(mongoConf.connectionString).then(db => {
                if (!db) throw new DataError({ message: "No database." });
                if (!db.collection) throw new DataError({ message: "No collection." });
                this._dbs[dbName] = db;
                db.on("close", () => {
                    delete this._dbs[dbName];
                });
                return db;
            }).catch(error => {
                throw new DataError({ statusCode: 500, message: error.message, data: { connectionString: mongoConf.connectionString }, stack: error.stack });
            });
        });
    }

    close() {
        Object.keys(this._dbs).map(k => {
            return this._dbs[k].close();
        });
    }
};

exports = module.exports = MongoService;
