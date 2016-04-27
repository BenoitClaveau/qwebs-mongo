/*!
 * qwebs-mongo
 * Copyright(c) 2015 Benoît Claveau
 * MIT Licensed
 */

//https://mongodb.github.io/node-mongodb-native

"use strict";

const MongoClient = require('mongodb').MongoClient;
const format = require('util').format;
const GridStore = require('mongodb').GridStore; //obsolete
const GridFSBucket = require('mongodb').GridFSBucket;
const DataError = require("qwebs").DataError;

class MongoService {
    constructor($config) {
        if (!$config.mongo) throw new DataError({ message: "Mongo section is not defined in qwebs config." });
        if (!$config.mongo.connectionString) throw new DataError({ message: "Mongo connectionString is not defined in qwebs config." });
        this.$config = $config;
        RegExp.prototype.toJSON = RegExp.prototype.toString; //serialize Regex
    };

    connect() {
        return Promise.resolve().then(() => {
            if (this.db) this.db;
            return this._init();
        });
    };

    _init() {
        return MongoClient.connect(this.$config.mongo.connectionString).then(db => {
            if (!db) throw new DataError({ message: "No database." });
            if (!db.collection) throw new DataError({ message: "No collection." });
            this.db = db;
            console.log("Listen mongo " + this.$config.mongo.connectionString);
        });
    };

    insert(collectionName, item) {
        return this.connect().then(db => {
            return db.collection(collectionName).insert(item).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".insert(" + JSON.stringify(item) + ")");
                console.log();
            });
        });
    };

    remove(collectionName, selector) {
        return this.connect().then(db => {
            return db.collection(collectionName).remove(selector).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".remove(" + JSON.stringify(selector) + ")");
                console.log();
            });
        });
    };

    drop(collectionName) {
        return this.connect().then(db => {
            return db.collection(collectionName).drop().then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".drop()");
                console.log();
            });
        });
    };

    update(collectionName, query, update, options) {
        return this.connect().then(db => {
            options = options || {};
            let copy = Object.assign({}, update);
            delete copy._id;
            
            return db.collection(collectionName).update(query, copy, options).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".update(" + JSON.stringify(query) + ", " + JSON.stringify(copy) + ", " + JSON.stringify(options), ") => " + res[0] + " element(s).");
                console.log();
            });
        });
    };

    updateOne(collectionName, filter, update, options) {
        return this.connect().then(db => {
            options = options || {};
            let copy = Object.assign({}, update);
            delete copy._id;
            
            return db.collection(collectionName).update(filter, copy, options).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".update(" + JSON.stringify(filter) + ", " + JSON.stringify(copy) + ", " + JSON.stringify(options), ") => " + res[0] + " element(s).");
                console.log();
            });
        });
    };

    updateMany(collectionName, filter, update, options) {
        return this.connect().then(db => {
            options = options || {};
            let copy = Object.assign({}, update);
            delete copy._id;
            
            return db.collection(collectionName).updateMany(filter, copy, options).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".updateMany(" + JSON.stringify(filter) + ", " + JSON.stringify(copy) + ", " + JSON.stringify(options), ") => " + res[0] + " element(s).");
                console.log();
            });
        });
    };


    findOne(collectionName, query, fields) {
        return this.connect().then(db => {
            return db.collection(collectionName).findOne(query, fields).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".findOne(" + JSON.stringify(query) + ", " + JSON.stringify(fields) + ") => ", JSON.stringify(data));
                console.log();
            });
        });
    };

    find(collectionName, query, options) {
        return this.connect().then(db => {
            options = options || {};
            
            return db.collection(collectionName).find(query, options).then(cursor => {
                if (!this.$config.verbose) return cursor;
                
                return cursor.count().then(count => {
                    console.log("db." + collectionName + ".find(" + JSON.stringify(query) + ", " + JSON.stringify(options) + ") => " + count + " elements.");
                    console.log();
                    cursor.rewind();
                    return cursor;
                });
            });
        });
    };

    find2(collectionName, query, meta, options) {
        return this.connect().then(db => {
            meta = meta || {};
            options = options || {};
            
            let skip = options.skip;
            let limit = options.limit;
            
            delete options.skip;
            delete options.limit;
            
            var cursor = db.collection(collectionName).find(query, meta, options);
            if (skip) cursor = cursor.skip(skip);
            if (limit) cursor = cursor.limit(limit);
            
            if (!this.$config.verbose) return cursor;
                
            return cursor.count().then(count => {
                console.log("db." + collectionName + ".find(" + JSON.stringify(query) + ", " + JSON.stringify(meta) + ", " + JSON.stringify(options) + ").skip(" + skip + ").limit(" + limit + ") => " + count + " elements.");
                console.log();
                cursor.rewind();
                return cursor;
            });
        });
    };

    count(collectionName, query, options) {
        return this.connect().then(db => {
            options = options || {};
            
            return db.collection(collectionName).find(query, options).count().then(count => {
                if (!this.$config.verbose) return count;
                
                console.log("db." + collectionName + ".find(" + JSON.stringify(query) + ", " + JSON.stringify(options) + ") => " + count + " elements.");
                console.log();
                return count;
            });
        });
    };

    //http://emptysqua.re/blog/paging-geo-mongodb/ for skip
    geoNear(collectionName, x, y, options) {
        return this.connect().then(db => {

            var command = {
                geoNear: collectionName,
                near: {
                    type: "Point",
                    coordinates: [x, y]
                }
            };

            if (options.spherical) command.spherical = options.spherical;
            if (options.query) command.query = options.query;
            if (options.maxDistance) command.maxDistance = options.maxDistance;
            if (options.minDistance) command.minDistance = options.minDistance;
            if (options.distanceMultiplier) command.distanceMultiplier = options.distanceMultiplier;
            if (options.num) command.num = options.num;

            return db.command(command).then(doc => {
                if (this.$config.verbose) console.log("db.runCommand(" + JSON.stringify(command) + ") => " + doc.results.length + " element(s).");
                return doc;
            });
        });
    };

    aggregate(collectionName, array) {
        return this.connect().then(db => {
            return db.collection(collectionName).aggregate(array).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".aggregate(" + JSON.stringify(array) + ")");
                console.log();
            });
        });
    };

    mapReduce(collectionName, map, reduce, options) {
        return this.connect().then(db => {
            return db.collection(collectionName).mapReduce(map, reduce, options).then(result => {
                if (!this.$config.verbose) return result;
                
                console.log("db." + collectionName + ".mapReduce(" + map + ", " + reduce + ", " + JSON.stringify(options) + ")");
                console.log();
            });
        });
    };

    gridStore(objectId, mode, options) {
        return this.connect().then(db => {
            options = options || {};
            if (this.$config.verbose) { 
                console.log("new GridStore(db, " + objectId + ", " + mode + ", " + JSON.stringify(options) + ")");
                console.log();
            }
            return new GridStore(db, objectId, mode, options);
        });
    };

    gridFSBucket(options) {
        return this.connect().then(db => {
            options = options || {};
            if (this.$config.verbose) { 
                console.log("new GridFSBucket(db, " + JSON.stringify(options) + ")");
                console.log();
            }
            return new GridFSBucket(db, options);
        });
    };

    ensureIndex(collectionName, index, options) {
        return this.connect().then(db => {
            if (!db) throw new DataError({ message: "No database." });
            if (!db.collection) throw new DataError({ message: "No collection." });
            
            options = options || {};
            return db.collection(collectionName).ensureIndex(index, options);
        });
    };

    dropIndex(collectionName, index) {
        return this.connect().then(db => {
            if (!db) throw new DataError({ message: "No database." });
            if (!db.collection) throw new DataError({ message: "No collection." });
            
            return db.collection(collectionName.dropIndex(index));
        });
    };

    createCollection(collectionName) {
        return this.connect().then(db => {
            return db.createCollection(collectionName);
        });
    };

    initializeUnorderedBulkOp(collectionName) {
        return this.connect().then(db => {
            if (this.$config.verbose) {
                console.log("db." + collectionName + ".initializeUnorderedBulkOp()");
                console.log();
            }
            var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
            if (!bulk) throw new DataError({ message: "UnorderedBulk is not initialize." });
            return bulk;
        });
    };

    iterate(cursor, func) {
        
        if (!cursor) throw new DataError({ message: "Cursor is not defined." });
        if (!func) throw new DataError({ message: "Promise is not defined." });
        
        var recursively = (curs) => {
            return curs.nextObject().then(item => {
                if (!item) return;
                
                func(item);
                return recursively(curs);
            });
        };
        
        return recursively(cursor);
    };
};

exports = module.exports = MongoService;
