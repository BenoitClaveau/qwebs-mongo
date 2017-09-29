/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");
const stream = require("stream");
const util = require("util");
const Qwebs = require("qwebs");

class Setup {
    constructor() {
        this.$qwebs = new Qwebs({dirname: __dirname});
        this.$qwebs.inject("$mongo", "./../index"); 
    };

    run(done) {
        return this.loadQwebs().then(() => {
            return this.mongoConnect();
        }).then(() => {
            return this.clear();
        }).then(() => {
            return this.schema();
        }).then(() => {
            return this.injectData();
        }).then(() => {
            return this;
        }).then(done).catch(fail);
    };

    loadQwebs() {
        return this.$qwebs.load();
    };

    mongoConnect() {
        return Promise.resolve().then(() => {
            
            let $config = this.$qwebs.resolve("$config");
            let $mongo = this.$qwebs.resolve("$mongo");
            
            if ($config.mongo.connectionString !== "mongodb://localhost:27017/test") throw new DataError({ message: "Inconherent mongo connectionString." });
            return $mongo.db;
        });
    };

    schema() {
        let $mongo = this.$qwebs.resolve("$mongo");
        
        return Promise.all([
            $mongo.db.then(db => db.createCollection("users")),
            $mongo.db.then(db => db.ensureIndex("users", { "login": 1 }))               
        ]);
    };
    
    injectData() {
        return Promise.resolve().then(() => {
            let $mongo = this.$qwebs.resolve("$mongo");
            return $mongo.db;
        }).then(db => {
            let user = {
                login: "paul",
                password: "1234"
            };
            return db.collection("users").insertOne(user).then(data => {
                let commands = [
                    {
                        ref: "ref001",
                        userId: data.ops[0]._id,
                        price: 9.99,
                        date: new Date()
                    }, {
                        ref: "ref002",
                        userId: data.ops[0]._id,
                        price: 12.14,
                        date: new Date()
                    }
                ];
                return db.collection("commands").insertMany(commands);
            }).then(() => {
                let user = {
                    login: "henri",
                    password: "pwd"
                };
                return db.collection("users").insertOne(user);
            });
        });
    };

    clear() {
        let $mongo = this.$qwebs.resolve("$mongo");
        let promises = [];
        [$mongo.db.then(db => db.collection("users").remove()),
         $mongo.db.then(db => db.collection("commands").remove())].forEach(promise => {
            promises.push(promise.catch(error => {
                console.warn(error.message);
            }));
        });
        return Promise.all(promises);
    };

    stop() {
        let $mongo = this.$qwebs.resolve("$mongo");
        $mongo.close();
    };
};

exports = module.exports = new Setup();
