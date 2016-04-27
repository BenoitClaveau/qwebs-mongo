const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");
const stream = require("stream");
const util = require("util");

describe("A suite for write", () => {

    it("setup", done => {
  
        return setup.run().then(() => {
            var $mongo = setup.$qwebs.resolve("$mongo");
            $mongo.connect();
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("insert and read", done => {
        
        return Promise.resolve().then(() => {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            var user = {
                login: "user1",
                password: "password1"
            };
            
            return $mongo.insert("users", user).then(newUser => {
                expect(newUser.login).toEqual(user.login);
                
                return $mongo.findOne("users", { "login": "user1"}).then(dbUser => {
                    expect(dbUser.password).toEqual(user.password);
                });
            });
            
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
});

