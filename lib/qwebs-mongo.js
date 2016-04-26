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
        return Promise.resolve().then(() => {
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.$config.mongo.connectionString, (err, data) => {
                    if (err) reject(err);
                    else resolve(db);
                });
            }).then(db => {
                if (!db) throw new DataError({ message: "No database." });
                if (!db.collection) throw new DataError({ message: "No collection." });
                this.db = db;
                console.log("Listen mongo " + this.$config.mongo.connectionString);
            });
        });
    };

    insert(collectionName, item) {
        return this.connect().then(function(db) {
            return new Promise((resolve, reject) => {
                db.collection(collectionName).insert(item, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(result => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".insert(" + JSON.stringify(item) + ")");
                    console.log();
                }
                return result;
            });
        });
    };

    remove(collectionName, selector) {
        return this.connect().then(function(db) {
            return new Promise((resolve, reject) => {
                db.collection(collectionName).remove(selector, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(result => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".remove(" + JSON.stringify(selector) + ")");
                    console.log();
                }
                return result;
            });
        });
    };

    drop(collectionName) {
        return this.connect().then(function(db) {
            return new Promise((resolve, reject) => {
                db.collection(collectionName).drop((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(result => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".drop()");
                    console.log();
                }
                return result;
            });
        });
    };

    update(collectionName, query, update, options) {
        return this.connect().then(function(db) {
            options = options || {};
            let copy = Object.assign({}, update);
            delete copy._id;
            
            return new Promise((resolve, reject) => {
                db.collection(collectionName).update(query, copy, options, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(result => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".update(" + JSON.stringify(query) + ", " + JSON.stringify(copy) + ", " + JSON.stringify(options), ") => " + res[0] + " element(s).");
                    console.log();
                }
                return result;
            });
        });
    };

    updateOne(collectionName, filter, update, options) {
        return this.connect().then(function(db) {
            options = options || {};
            let copy = Object.assign({}, update);
            delete copy._id;
            
            return new Promise((resolve, reject) => {
                db.collection(collectionName).update(filter, copy, options, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(result => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".update(" + JSON.stringify(filter) + ", " + JSON.stringify(copy) + ", " + JSON.stringify(options), ") => " + res[0] + " element(s).");
                    console.log();
                }
                return result;
            });
        });
    };

    updateMany(collectionName, filter, update, options) {
        return this.connect().then(function(db) {
            options = options || {};
            let copy = Object.assign({}, update);
            delete copy._id;
            
            return new Promise((resolve, reject) => {
                db.collection(collectionName).updateMany(filter, copy, options, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(result => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".updateMany(" + JSON.stringify(filter) + ", " + JSON.stringify(copy) + ", " + JSON.stringify(options), ") => " + res[0] + " element(s).");
                    console.log();
                }
                return result;
            });
        });
    };


    findOne(collectionName, query, fields) {
        return this.connect().then(function(db) {
            return new Promise((resolve, reject) => {
                db.collection(collectionName).findOne(query, fields, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(result => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".findOne(" + JSON.stringify(query) + ", " + JSON.stringify(fields) + ") => ", JSON.stringify(data));
                    console.log();
                }
                return result;
            });
        });
    };

    find(collectionName, query, options) {
        return this.connect().then(function(db) {
            options = options || {};
            
            return new Promise((resolve, reject) => {
                db.collection(collectionName).find(query, options, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }).then(cursor => {
                if (this.$config.verbose) {
                    console.log("db." + collectionName + ".find(" + JSON.stringify(query) + ", " + JSON.stringify(options) + ") => " + count + " elements.");
                    console.log();
                    cursor.rewind();
                    return cursor;
                }
                return cursor;
            });
        });
    };

    find2(collectionName, query, meta, options) {
        meta = meta || {};
        options = options || {};
        var this = this;

        return this.connect().then(function(db) {
            
            var skip = options.skip;
            var limit = options.limit;
            
            delete options.skip;
            delete options.limit;
            
            var cursor = db.collection(collectionName).find(query, meta, options);
            if (skip) cursor = cursor.skip(skip);
            if (limit) cursor = cursor.limit(limit);
            
            if (this.$config.verbose) {
                return Q.ninvoke(cursor, 'count').then(function(count) {
                    console.log("db." + collectionName + ".find(" + JSON.stringify(query) + ", " + JSON.stringify(meta) + ", " + JSON.stringify(options) + ").skip(" + skip + ").limit(" + limit + ") => " + count + " elements.");
                    console.log();
                    cursor.rewind();
                    return cursor;
                });
            }
            else {
                return cursor;
            }
        });
    };

    count(collectionName, query, options) {
        options = options || {};
        var this = this;
        return this.connect().then(function(db) {
            return Q.ninvoke(db.collection(collectionName), 'find', query, options).then(function(cursor) {
                return Q.ninvoke(cursor, 'count').then(function(count){
                    if (this.$config.verbose) {
                        console.log("db." + collectionName + ".count(" + JSON.stringify(query) + ", " + JSON.stringify(options) + ") => " + count + " elements.");
                        console.log();
                    }
                    return count;
                });
            });
        });
    };

    //http://emptysqua.re/blog/paging-geo-mongodb/ for skip
    geoNear(collectionName, x, y, options) {
        var this = this;
        return this.connect().then(function(db) {

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

            var deferred = Q.defer();
            db.command(command, function(error, res) {
                if (error) {
                    deferred.reject(new Error(error + " " + JSON.stringify(command)));
                } else {
                    deferred.resolve(res);
                }
            });

            return deferred.promise.then(function(doc) {
                if (this.$config.verbose) console.log("db.runCommand(" + JSON.stringify(command) + ") => " + doc.results.length + " element(s).");
                return doc;
            });
        });
    };

    aggregate(collectionName, array) {
        var this = this;
        return this.connect().then(function(db) {
            if (this.$config.verbose) {
                console.log("db." + collectionName + ".aggregate(" + JSON.stringify(array) + ")");
                console.log();
            }
            return Q.ninvoke(db.collection(collectionName), 'aggregate', array);
        });
    };

    mapReduce(collectionName, map, reduce, options) {
        var this = this;
        return this.connect().then(function(db) {
            if (this.$config.verbose) {
                console.log("db." + collectionName + ".mapReduce(" + map + ", " + reduce + ", " + JSON.stringify(options) + ")");
                console.log();
            }
            return Q.ninvoke(db.collection(collectionName), 'mapReduce', map, reduce, options);
        });
    };

    gridStore(objectId, mode, options) {
        options = options || {};
        var this = this;
        return this.connect().then(function(db) {
            if (this.$config.verbose) { 
                console.log("new GridStore(db, " + objectId + ", " + mode + ", " + JSON.stringify(options) + ")");
                console.log();
            }
            return new GridStore(db, objectId, mode, options);
        });
    };

    gridFSBucket(options) {
        options = options || {};
        var this = this;
        return this.connect().then(function(db) {
            if (this.$config.verbose) { 
                console.log("new GridFSBucket(db, " + JSON.stringify(options) + ")");
                console.log();
            }
            return new GridFSBucket(db, options);
        });
    };

    ensureIndex(collectionName, index, options) {
        options = options || {};
        var this = this;
        return this.connect().then(function(db) {
            if (!db) throw new DataError({ message: "No database." });
            if (!db.collection) throw new DataError({ message: "No collection." });
            
            return Q.ninvoke(db.collection(collectionName), 'ensureIndex', index, options);
        });
    };

    dropIndex(collectionName, index) {
        var this = this;
        return this.connect().then(function(db) {
            if (!db) throw new DataError({ message: "No database." });
            if (!db.collection) throw new DataError({ message: "No collection." });
            
            return Q.ninvoke(db.collection(collectionName), 'dropIndex', index);
        });
    };

    createCollection(collectionName) {
            var this = this;
            return this.connect().then(function(db) {
                return Q.ninvoke(db, "createCollection", collectionName);
            });
    };

    initializeUnorderedBulkOp(collectionName) {
        var this = this;
        return this.connect().then(function(db) {
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
        
        var recursively = function(curs) {
            return Q.ninvoke(curs, "nextObject").then(function(item) {
                if (!item) return;
                
                return Q.try(function() {
                    return func(item);  
                }).then(function() {
                    return recursively(curs);
                });
            });
        };
        
        return recursively(cursor);
    };
};
exports = module.exports = MongoService;
