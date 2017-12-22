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
        this.connections = {};

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
        let connection = this.connections[dbName];
        if (connection) return connection.db;

        let config = this.configuration(dbName);
        const { user, password, host, port, database } = config;
        let db, client, server;
        try {
            //https://github.com/mongodb/node-mongodb-native/blob/3.0.0/CHANGES_3.0.0.md#api-changes
            const connectonString = `mongodb://${user}:${password}@${host}:${port}/${database}`;

            //server = new Server(host, port || 27017, { user, password });
            //client = await MongoClient.connect(server);
            client = await MongoClient.connect(connectonString);
            db = client.db(database);
        }
        catch(error) {
            throw new Error("Failed to connect to the mongo database ${host}:${port}.", { host, port }, error);
        }
        if (!db.collection) throw new Error("No collection for database ${host}:${port}.", { host, port });
        
        this.connections[dbName] = { db, client, server };
        // client.on("close", () => {
        //     delete this.connections[dbName];
        // });
        return db;
    }

    async unmount() {
        for (let [dbName, connection] of Object.entries(this.connections)) {
            await connection.client.close();
        }
    }
};

exports = module.exports = MongoService;
