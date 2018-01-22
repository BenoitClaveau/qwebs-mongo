/*!
 * qwebs-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Error, UndefinedError } = require("oups");
const { ObjectID } = require("mongodb");
const { Transform, Readable } = require("stream");
const { streamifyOne, streamify } = require("./streamify");
const Find = require("./find");

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

    save() {
        return streamify(async (chunk, enc) => {
            const res = await this.mongoSave(chunk);
            if (!res) throw new Error("Fail to save document.", { document: chunk });
            return chunk;
        })
    }

    insert() {  
        return streamify(async (chunk, enc) => {
            const res = await this.mongoInsertOne(chunk);
            if (!res) throw new Error("Fail to insert document.", { document: chunk });
            return res.ops[0];
        })
    }

    update() {
        return streamify(async (chunk, enc) => {
            const res = await this.mongoUpdateOne(chunk);
            if (!res) throw new Error("Fail to update document.", { document: chunk });
            return res.ops[0];
        })
    }

    findOne(filter, options) {
        return streamifyOne(async () => await this.mongoFindOne(filter, options));
    }

    find(filter, options) {
        return new Find(this, filter, options);
    }

    count(filter, options) {
        return streamifyOne(async () => await this.mongoCount(filter, options));
    }

    deleteOne(filter, options) {
        return streamifyOne(async () => await this.mongoDeleteOne(filter, options));
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

    /* mongo api extension */
    async mongoDropIfExists(options) {
        try {
            return await this.mongoDrop(options);
        } 
        catch(error) {
            console.info(error);
        }
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

exports = module.exports = CrudService;
