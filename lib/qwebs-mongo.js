/*!
 * qwebs-mongo
 * Copyright(c) 2015 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */

//https://mongodb.github.io/node-mongodb-native

"use strict";

const { Error, UndefinedError } = require("oups");
const { MongoClient, Server } = require("mongodb");
const { ObjectID } = require("mongodb");
const { promisify } = require("util");

class MongoService {
    constructor($config) {
        if (!$config.mongo) throw new UndefinedError("config.mongo");
        this.config = $config;
        this.databases = {};

        RegExp.prototype.toJSON = RegExp.prototype.toString; //serialize Regex
        ObjectID.prototype.inspect = function() {
            return "ObjectID(\"" + this.toString() + "\")"; 
        };
    }

    configuration(dbName) {
        switch (dbName) {
            case "db":
                return this.config.mongo;
            default: 
                if (!this.config.mongo[dbName]) throw new Error("Failed to read mongo configuration for ${dbName}", { dbName: dbName, "config.json": `config.mongo.${dbName}` });
                return this.config.mongo[dbName];
        }
    }

    async connect(dbName = "db") {
        let db = this.databases[dbName];
        if (db) return db;
            
        let config = this.configuration(dbName);
        try {
            //https://github.com/mongodb/node-mongodb-native/blob/3.0.0/CHANGES_3.0.0.md#api-changes
            const client = await MongoClient.connect(new Server(config.host, config.port || 27017));
            db = client.db(config.database);
        }
        catch(error) {
            throw new Error("Failed to connect to the mongo database ${connectionString}.", { connectionString: config.connectionString }, error);
        }
        if (!db.collection) throw new Error("No collection for database ${connectionString}.", { connectionString: config.connectionString });
        
        this.databases[dbName] = db;
        db.on("close", () => {
            delete this.databases[dbName];
        });
        return db;
    }

    unmount() {
        Object.keys(this.databases).map(k => {
            const db = this.databases[k];
            db.close && db.close();
        });
    }
};

exports = module.exports = MongoService;
