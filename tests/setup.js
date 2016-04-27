"use strict";

const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");
const stream = require("stream");
const util = require("util");

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
            
            var $config = this.$qwebs.resolve("$config");
            var $mongo = this.$qwebs.resolve("$mongo");
            
            if ($config.mongo.connectionString !== "mongodb://localhost:27017/test") throw new DataError({ message: "Inconherent mongo connectionString." });
            
            return $mongo.connect();
        });
    };

    schema() {
        var $mongo = this.$qwebs.resolve("$mongo");
        
        return Promise.all([
            $mongo.createCollection("users"),
            $mongo.ensureIndex("users", { "login": 1 })               
        ]);
    };
    
    injectData() {
        return Promise.resolve().then(() => {
            
            var $mongo = this.$qwebs.resolve("$mongo");
            
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
        var $mongo = this.$qwebs.resolve("$mongo");
        
        var promises = [];
        
        [$mongo.remove("users")].forEach(promise => {
            promises.push(promise.catch(error => {
                console.log("Warning", error.message);
            }));
        });
        return Promise.all(promises);
    };
};

exports = module.exports = new Setup();
