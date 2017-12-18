/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const { Error } = require("oups");
const Qwebs = require("qwebs");
const path = require("path");

class Setup {

    constructor() {
        this.qwebs = new Qwebs({ dirname: __dirname });
    }

    async run() {
        const { qwebs } = this;
        await qwebs.inject("$mongo", path.join(__dirname, "..", "index"));
        await qwebs.inject("$http", "qwebs-http");
        await qwebs.load();
        
        const config = await qwebs.resolve("$config");
        if (config.mongo.connectionString !== "mongodb://localhost:27017/test") 
            throw new Error("Inconherent mongo connectionString.");

        await this.clear();
        await this.schema();
        await this.data();
    };

    async schema() {
        const { qwebs } = this;
        let mongo = await qwebs.resolve("$mongo");
        let db = await mongo.connect();
        await db.createCollection("users");
        await db.ensureIndex("users", { "login": 1 });
    };
    
    async data() {
        const { qwebs } = this;
        const mongo = await qwebs.resolve("$mongo");
        const db = await mongo.connect();
        let user = {
            login: "paul",
            password: "1234"
        };
        let res = await db.collection("users").insertOne(user)
        let commands = [
            {
                ref: "ref001",
                userId: res.ops[0]._id,
                price: 9.99,
                date: new Date()
            }, {
                ref: "ref002",
                userId: res.ops[0]._id,
                price: 12.14,
                date: new Date()
            }
        ];

        res = await db.collection("commands").insertMany(commands);

        user = {
            login: "henri",
            password: "pwd"
        };
        res = await db.collection("users").insertOne(user);
    };

    async clear() {
        const { qwebs } = this;
        let mongo = await qwebs.resolve("$mongo");
        let db = await mongo.connect();
        await db.collection("users").remove();
        await db.collection("commands").remove();
    };

    async stop() {
        const { qwebs } = this;
        await qwebs.unload();
    }

};

exports = module.exports = new Setup();
