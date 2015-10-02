/*!
 * qwebs-auth-jwt
 * Copyright (c) 2015 beny78
 * MIT Licensed
 */

//https://mongodb.github.io/node-mongodb-native
"use strict";

var MongoClient = require('mongodb').MongoClient,
    format = require('util').format,
    GridStore = require('mongodb').GridStore,
    DataError = require("qwebs").DataError,
    Q = require('q');

function MongoService($config) {
    if (!$config.mongo) throw new DataError({ message: "Mongo section is not defined in qwebs config." });
    if (!$config.mongo.connectionString) throw new DataError({ message: "Mongo connectionString is not defined in qwebs config." });
    this.$config = $config;
    RegExp.prototype.toJSON = RegExp.prototype.toString; //serialize Regex
};

MongoService.prototype.connect = function() {
    var self = this;
    if (!self.db) return self._init();
    return Q.try(function() {
        return self.db;
    });
};

MongoService.prototype._init = function() {
    var self = this;
    
    return Q.try(function() {
        return Q.ninvoke(MongoClient, "connect", self.$config.mongo.connectionString).then(function(db) {
            if (!db) throw new DataError({ message: "No database." });
            if (!db.collection) throw new DataError({ message: "No collection." });
            self.db = db;
            console.log("Listen mongo " + self.$config.mongo.connectionString);
            return db;
        });
    });
};

MongoService.prototype.insert = function(collectionName, item) {
    var self = this;
    return self.connect().then(function(db) {
        return Q.ninvoke(db.collection(collectionName), 'insert', item).then(function(results) {
            if (self.$config.verbose) console.log("db." + collectionName + ".insert(" + JSON.stringify(item) + ")");
            return item;
        });
    });
};

MongoService.prototype.remove = function(collectionName, selector) {
    var self = this;
    return self.connect().then(function(db) {
        if (self.$config.verbose) console.log("db." + collectionName + ".remove(" + JSON.stringify(selector) + ")");
        return Q.ninvoke(db.collection(collectionName), 'remove', selector);
    });
};

MongoService.prototype.drop = function(collectionName) {
    var self = this;
    return self.connect().then(function(db) {
        if (self.$config.verbose) console.log("db." + collectionName + ".drop()");
        return Q.ninvoke(db.collection(collectionName), 'drop');
    });
};

MongoService.prototype.update = function(collectionName, criteria, update, options) {
    options = options || {};
    var self = this;
    return self.connect().then(function(db) {
        var id = update._id;
        if (id) delete update._id;
        return Q.ninvoke(db.collection(collectionName), 'update', criteria, update, options).then(function(res) {
            if (self.$config.verbose) console.log("db." + collectionName + ".update(" + JSON.stringify(criteria) + ", " + JSON.stringify(update) + ", " + JSON.stringify(options), ") => " + res[0] + " element(s).");
            return res;
        }).finally(function() {
            if (id) update._id = id;
        });
    });
};

MongoService.prototype.findOne = function(collectionName, query, fields) {
    fields = fields || {};
    var self = this;
    return self.connect().then(function(db) {
        return Q.ninvoke(db.collection(collectionName), 'findOne', query, fields).then(function(data) {
            if (self.$config.verbose) console.log("db." + collectionName + ".findOne(" + JSON.stringify(query) + ", " + JSON.stringify(fields) + ") => ", JSON.stringify(data));
            return data;
        });
    });
};

MongoService.prototype.find = function(collectionName, query, options) {
    options = options || {};
    var self = this;
    return self.connect().then(function(db) {
        return Q.ninvoke(db.collection(collectionName), 'find', query, options).then(function(cursor) {
            if (self.$config.verbose) {
                return Q.ninvoke(cursor, 'count').then(function(count) {
                    console.log("db." + collectionName + ".find(" + JSON.stringify(query) + ", " + JSON.stringify(options) + ") => " + count + " elements.");
                    cursor.rewind();
                    return cursor;
                });
            }
            else {
                return cursor;
            }
        });
    });
};

MongoService.prototype.find2 = function(collectionName, query, meta, options) {
    meta = meta || {};
    options = options || {};
    var self = this;
    return self.connect().then(function(db) {
        var skip = options.skip;
        var limit = options.limit;
        
        delete options.skip;
        delete options.limit;
        
        var cursor = db.collection(collectionName).find(query, meta, options);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        
        if (self.$config.verbose) {
            return Q.ninvoke(cursor, 'count').then(function(count) {
                console.log("db." + collectionName + ".find(" + JSON.stringify(query) + ", " + JSON.stringify(meta) + ", " + JSON.stringify(options) + ").skip(" + skip + ").limit(" + limit + ") => " + count + " elements.");
                cursor.rewind();
                return cursor;
            });
        }
        else {
            return cursor;
        }
    });
};

MongoService.prototype.count = function(collectionName, query, options) {
    options = options || {};
    var self = this;
    return self.connect().then(function(db) {
        return Q.ninvoke(db.collection(collectionName), 'find', query, options).then(function(cursor) {
            return Q.ninvoke(cursor, 'count').then(function(count){
                if (self.$config.verbose) console.log("db." + collectionName + ".count(" + JSON.stringify(query) + ", " + JSON.stringify(options) + ") => " + count + " elements.");
                return count;
            });
        });
    });
};

//http://emptysqua.re/blog/paging-geo-mongodb/ for skip
MongoService.prototype.geoNear = function(collectionName, x, y, options) {
    var self = this;
    return self.connect().then(function(db) {

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
            if (self.$config.verbose) console.log("db.runCommand(" + JSON.stringify(command) + ") => " + doc.results.length + " element(s).");
            return doc;
        });
    });
};

MongoService.prototype.aggregate = function(collectionName, array) {
    var self = this;
    return self.connect().then(function(db) {
        if (self.$config.verbose) console.log("db." + collectionName + ".aggregate(" + JSON.stringify(array) + ")");
        return Q.ninvoke(db.collection(collectionName), 'aggregate', array);
    });
};

MongoService.prototype.mapReduce = function(collectionName, map, reduce, options) {
    var self = this;
    return self.connect().then(function(db) {
        if (self.$config.verbose) console.log("db." + collectionName + ".mapReduce(" + map + ", " + reduce + ", " + JSON.stringify(options) + ")");
        return Q.ninvoke(db.collection(collectionName), 'mapReduce', map, reduce, options);
    });
};

MongoService.prototype.gridStore = function(objectId, mode, options) {
    options = options || {};
    var self = this;
    return self.connect().then(function(db) {
        if (self.$config.verbose) console.log("new GridStore(db, " + objectId + ", " + mode + ", " + JSON.stringify(options) + ")");
        return new GridStore(db, objectId, mode, options);
    });
};

MongoService.prototype.ensureIndex = function(collectionName, index, options) {
    options = options || {};
    var self = this;
    return self.connect().then(function(db) {
        if (!db) throw new DataError({ message: "No database." });
        if (!db.collection) throw new DataError({ message: "No collection." });
        
        return Q.ninvoke(db.collection(collectionName), 'ensureIndex', index, options);
    });
};

MongoService.prototype.dropIndex = function(collectionName, index) {
    var self = this;
    return self.connect().then(function(db) {
        if (!db) throw new DataError({ message: "No database." });
        if (!db.collection) throw new DataError({ message: "No collection." });
        
        return Q.ninvoke(db.collection(collectionName), 'dropIndex', index);
    });
};

MongoService.prototype.createCollection = function(collectionName) {
        var self = this;
        return self.connect().then(function(db) {
            return Q.ninvoke(db, "createCollection", collectionName);
        });
};

MongoService.prototype.initializeUnorderedBulkOp = function(collectionName){
    var self = this;
    return self.connect().then(function(db) {
        if (self.$config.verbose) console.log("db." + collectionName + ".initializeUnorderedBulkOp()");
        var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
        if (!bulk) throw new DataError({ message: "UnorderedBulk is not initialize." });
        return bulk;
    });
};

exports = module.exports = MongoService;
