"use strict";

var path = require("path"),
    Qwebs = require("qwebs"),
    DataError = require("qwebs").DataError,
    ObjectId = require("mongodb").ObjectID,
    fs = require("fs"),
    Q = require("q");

function Setup () {
    console.log("Create setup")
    this.$qwebs = new Qwebs({dirname: __dirname});
    this.$qwebs.inject("$mongo", "./../index"); 
};

Setup.prototype.run = function() {
    var self = this;
    
    return self.loadQwebs().then(function() {
        return self.mongoConnect();
    }).then(function() {
        return self.clear();
    }).then(function() {
        return self.schema();
    }).then(function() {
        return self.injectData();
    }).then(function() {
        return self;
    });
};

Setup.prototype.loadQwebs = function() {
    return this.$qwebs.load();
};

Setup.prototype.mongoConnect = function() {
    var self = this;
    
    return Q.try(function() {
        
        var $config = self.$qwebs.resolve("$config");
        var $mongo = self.$qwebs.resolve("$mongo");
        
        if ($config.mongo.connectionString !== "mongodb://localhost:27017/test") throw new DataError({ message: "Inconherent mongo connectionString." });
        
        return $mongo.connect();
    });
};

Setup.prototype.schema = function() {
    var $mongo = this.$qwebs.resolve("$mongo");
    
    return Q.all([
        $mongo.createCollection("users"),
        $mongo.ensureIndex("users", { "login": 1 })               
    ]);
};
 
Setup.prototype.injectData = function () {
    var self = this;
    
    return Q.try(function() {
        
        var $mongo = self.$qwebs.resolve("$mongo");
        
    }).then(function () {
        console.log("-------------------------------------------------");
        console.log("data injection completed");
        console.log("-------------------------------------------------");
    }).catch(function (e) {
        console.log("-------------------------------------------------");
        if(e.data) console.log("Error:", e.message, JSON.stringify(e.data), e.stack);
        else console.log("Error:", e.message, e.stack);
        console.log("-------------------------------------------------");
    });
};

Setup.prototype.clear = function () {
    var $mongo = this.$qwebs.resolve("$mongo");
    
    var promises = [];
    [
        $mongo.remove("users")
    ].forEach(function(promise){
        promises.push(promise.catch(function(error){
            console.log("Warning", error.message);
        }));
    });
    return Q.all(promises);
};

exports = module.exports = new Setup();
