/*!
 * qwebs-mongo
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Error, UndefinedError } = require("oups");
const { ObjectID } = require('mongodb');
const { PassThrough, Transform, Readable } = require('stream');

class CrudService {
    
    constructor(collectionName, $mongo, dbName) {
        if (!collectionName) throw new UndefinedError("collectionName");
        if (typeof collectionName !== "string") throw new Error("collectionName isn't a string.");
        if (!$mongo) throw new UndefinedError("$mongo");
        
        this.mongo = $mongo;
        this.collectionName = collectionName;
        this.dbName = dbName;   //could be null
    };

    async collection(filter, options) {
        const db = await this.mongo.connect(this.dbName);
        return db.collection(this.collectionName);
    }

        /* stream methods */

        streamifyOne(action) {
            const stream = Readable({ 
                objectMode: true,
                read: () => {} 
            }); 
            process.nextTick(() => {
                try {
                    stream.push(action());
                }
                catch(error) {
                    stream.emit("error", error)
                }
            })
            return stream;
        }
    
        streamify(action) {
            return new Transform({
                objectMode: true,
                async transform(chunk, encoding, callback) {
                    try {
                        const res = await action(chunk, encoding);
                        callback(null, res);
                    }
                    catch(error) {
                        callback(error);
                    }
                }
            });
        }
    
        save() {
            return this.streamify(async (chunk, enc) => {
                const res = await this.mongoSave(chunk);
                if (!res) throw new Error("Fail to save document.", { document: chunk });
                return chunk;
            })
        }
    
        insert() {  
            return this.streamify(async (chunk, enc) => {
                const res = await this.mongoInsertOne(chunk);
                if (!res) throw new Error("Fail to insert document.", { document: chunk });
                return res.ops[0];
            })
        }
    
        update() {
            return this.streamify(async (chunk, enc) => {
                const res = await this.mongoUpdateOne(chunk);
                if (!res) throw new Error("Fail to update document.", { document: chunk });
                return res.ops[0];
            })
        }
    
        findOne(arg = {}) {
            const { filter, options } = arg;
            return this.streamifyOne(async () => await this.mongoFindOne(filter, options));
        }

        find(arg) {
            return new Find(this, arg);
        }

    
        count(arg = {}) {
            const { filter, options } = arg;
            return this.streamifyOne(async () => await this.mongoCount(filter, options));
        }

    /* mongo api */

    async mongoInsertOne(doc, options) {
        const collection = await this.collection();
        return await collection.insertOne(doc, options);
    }

    async mongoInsertMany(docs, options) {
        const collection = await this.collection();
        return await collection.insertMany(docs, options);
    }

    async mongoAggregate(pipeline, options) {
        const collection = await this.collection();
        return await collection.aggregate(pipeline, options);
    }

    async mongoBulkWrite(operations, options) {
        const collection = await this.collection();
        return await collection.bulkWrite(operations, options);
    }

    async mongoCreateIndex(fieldOrSpec, options) {
        const collection = await this.collection();
        return await collection.createIndex(fieldOrSpec, options);
    }

    async mongoCreateIndexes(indexSpecs, options) {
        const collection = await this.collection();
        return await collection.createIndexes(indexSpecs, options);
    }

    async mongoCount(filter, options) {
        const collection = await this.collection();
        return await collection.count(filter, options);
    }

    async mongoDeleteOne(filter, options) {
        const collection = await this.collection();
        return await collection.deleteOne(filter, options);
    }

    async mongoDeleteMany(filter, options) {
        const collection = await this.collection();
        return await collection.deleteMany(filter, options);
    }

    async mongoDistinct(key, query, options) {
        const collection = await this.collection();
        return await collection.distinct(key, query, options);
    }

    async mongoDrop(options) {
        const collection = await this.collection();
        return await collection.drop(options);
    }

    async mongoDropIndex(indexName, options) {
        const collection = await this.collection();
        return await collection.dropIndex(indexName, options);
    }

    async mongoDropIndexes(options) {
        const collection = await this.collection();
        return await collection.dropIndexes(options);
    }

    async mongoFindOne(filter, options) {
        const collection = await this.collection();
        return await collection.findOne(filter, options);
    }

    async mongoFind(filter, options) {
        const collection = await this.collection();
        return await collection.find(filter, options);
    }

    async mongoFindOneAndDelete(filter, options) {
        const collection = await this.collection();
        return await collection.findOneAndDelete(filter, options);
    }

    async mongoFindOneAndReplace(filter, replacement, options) {
        const collection = await this.collection();
        return await collection.findOneAndReplace(filter, replacement, options);
    }

    async mongoFindOneAndUpdate(filter, update, options) {
        const collection = await this.collection();
        return await collection.findOneAndUpdate(filter, update, options);
    }

    async mongoGeoHaystackSearch(x, y, options) {
        const collection = await this.collection();
        return await collection.geoHaystackSearch(x, y, options);
    }

    async mongoGeoNear(x, y, options) {
        const collection = await this.collection();
        return await collection.geoNear(x, y, options);
    }

    async mongoGroup(keys, condition, initial, reduce, finalize, command, options) {
        const collection = await this.collection();
        return await collection.group(keys, condition, initial, reduce, finalize, command, options);
    }

    async mongoMapReduce(map, reduce, options) {
        const collection = await this.collection();
        return await collection.group(map, reduce, options);
    }

    async mongoReplaceOne(filter, doc, options) {
        const collection = await this.collection();
        return await collection.group(filter, doc, options);
    }

    async mongoSave(doc, options) {
        const collection = await this.collection();
        return await collection.save(doc, options);
    }

    async mongoUpdateOne(filter, doc, options) {
        const collection = await this.collection();
        return await collection.updateOne(filter, doc, options);
    }

    async mongoUpdateMany(filter, docs, options) {
        const collection = await this.collection();
        return await collection.updateMany(filter, docs, options);
    }

    // async mongoValidateCollection(collectionName, options) {
    //     const db = await this.mongo.connect(this.dbName);
    //     return await db.validateCollection(collectionName, options);
    // }
};

class Find extends PassThrough {
    constructor(crud, arg = {}) {
        super({ objectMode: true });
        this.crud = crud;
        const { filter, options, skip, limit, sort, project } = arg;
        this.filter = filter;
        this.options = options;
        this.skip = skip;
        this.limit = limit;
        this.sort = sort;
        this.project = project;
    };
    
    pipe(dest) {
        process.nextTick(async () => {
            let cursor = await this.crud.mongoFind(this.filter, this.options);
            if (this.skip) cursor = cursor.skip(this.skip);
            if (this.limit) cursor = cursor.skip(this.limit);
            if (this.sort) cursor = cursor.skip(this.sort);
            if (this.project) cursor = cursor.skip(this.project);
            cursor.on("data", data => {
                this.push(data);
            }).on("end", () => {
                this.push(null);
            }).on("error", error => {
                this.emit("error", error);
            })
        })
        return this;
    };
};

exports = module.exports = CrudService;
