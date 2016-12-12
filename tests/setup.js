/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau
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
        console.log("Create setup")
        this.$qwebs = new Qwebs({dirname: __dirname});
        this.$qwebs.inject("$mongo", "./../index"); 
    };

    run() {
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
        });
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
            $mongo.db.createCollection("users"),
            $mongo.db.ensureIndex("users", { "login": 1 })               
        ]);
    };
    
    injectData() {
        return Promise.resolve().then(() => {
            
            let $mongo = this.$qwebs.resolve("$mongo");
            
        }).then(() => {
            console.log("-------------------------------------------------");
            console.log("data injection completed");
            console.log("-------------------------------------------------");
        }).catch(error => {
            console.log("-------------------------------------------------");
            if(e.data) console.log("Error:", e.message, JSON.stringify(e.data), e.stack);
            else console.log("Error:", e.message, e.stack);
            console.log("-------------------------------------------------");
        });
    };

    clear() {
        let $mongo = this.$qwebs.resolve("$mongo");
        
        let promises = [];
        
        [$mongo.db.remove("users")].forEach(promise => {
            promises.push(promise.catch(error => {
                console.log("Warning", error.message);
            }));
        });
        return Promise.all(promises);
    };
};

exports = module.exports = new Setup();
