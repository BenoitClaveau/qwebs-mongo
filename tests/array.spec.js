const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");
const stream = require("stream");
const util = require("util");

describe("A suite for array", () => {

    it("setup", done => {

        return setup.run().then(() => {
            
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            var promises = [];
            
            for (var i = 0; i < 5; i++) {
                var user = {
                    login: "user" + i,
                    password: "password " + i
                };
                
                promises.push($mongo.insert("users", user));
            };
            
            return Promise.all(promises);

        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("array", done => {
        
        return Promise.resolve().then(() => {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(cursor => {
                return cursor.toArray().then(users => {
                    expect(users.length).toEqual(5);
                });
            });            
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("array on none existing collection", done => {
        
        return Promise.resolve().then(() => {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users2").then(cursor => {
                return cursor.toArray().then(users => {
                    expect(users.length).toEqual(0);
                });
            });            
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
});
