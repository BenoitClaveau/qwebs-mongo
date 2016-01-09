var path = require("path"),
    setup = require("./setup"),
    ObjectId = require("mongodb").ObjectID,
    fs = require("fs"),
    Q = require("q"); 

describe("A suite for write", function () {

    it("setup", function (done) {
        
        return setup.run().then(function() {
            var $mongo = setup.qwebs.resolve("$mongo");
            $mongo.connect();
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("insert and read", function (done) {
        
        return Q.try(function() {
            var $mongo = setup.qwebs.resolve("$mongo");
            
            var user = {
                login: "user1",
                password: "password1"
            };
            
            return $mongo.insert("users", user).then(function(newUser) {
                expect(newUser.login).toEqual(user.login);
                
                return $mongo.findOne("users", { "login": "user1"}).then(function(dbUser) {
                    expect(dbUser.password).toEqual(user.password);
                });
            });
            
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
});

