var path = require("path"),
    setup = require("./setup"),
    ObjectId = require("mongodb").ObjectID,
    fs = require("fs"),
    stream = require("stream"),
    util = require("util"),
    Q = require("q"); 

describe("A suite for array", function () {

    it("setup", function (done) {

        return setup.run().then(function() {
            
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            var promises = [];
            
            for (var i = 0; i < 5; i++) {
                var user = {
                    login: "user" + i,
                    password: "password " + i
                };
                
                promises.push($mongo.insert("users", user));
            };
            
            return Q.all(promises);

        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("array", function (done) {
        
        return Q.try(function() {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(function(cursor) {
                return Q.ninvoke(cursor, "toArray").then(function(users) {
                    expect(users.length).toEqual(5);
                });
            });            
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("array on none existing collection", function (done) {
        
        return Q.try(function() {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users2").then(function(cursor) {
                return Q.ninvoke(cursor, "toArray").then(function(users) {
                    expect(users.length).toEqual(0);
                });
            });            
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
});
