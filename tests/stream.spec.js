var path = require("path"),
    Setup = require("./setup"),
    ObjectId = require("mongodb").ObjectID,
    fs = require("fs"),
    stream = require('stream'),
    util = require('util'),
    Q = require("q"); 

describe("A suite for stream", function () {

    it("setup", function (done) {
          
        return new Setup().run().then(function(setup) {
        
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
    
    it("stream", function (done) {
        
        return Q.try(function() {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(function(cursor) {
                
                var stream = cursor.stream();
     
                stream.once("end", function() {
                    console.log("Stream completed");
                    done();
                });
                
                stream.on("error", function(error) {
                    done();
                    console.log("ERROR");
                });
                
                return stream;
            });
        }).then(function(stream) {
            console.log("Continue to use stream");

        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally();
    });
    
    it("transform stream", function (done) {
        
        return Q.try(function() {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(function(cursor) {
                return cursor.stream().pipe(new ExtendUser($mongo, {objectMode: true}));
            });
        }).then(function(stream) {
              
            stream.once("finish", function() { //Not end but finish
                console.log("finish");
                done();
            });
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally();
    });
});

function ExtendUser($mongo, options) {
    stream.Transform.call(this, options);
    this.$mongo = $mongo;
}

util.inherits(ExtendUser, stream.Transform);

ExtendUser.prototype._transform = function (chunk, enc, cb) {
    var self = this;
    self.$mongo.findOne("users", { login: chunk.login }).then(function(user) {
        user.date = new Date();
        self.push(user);
    }).finally(function() {
        cb();
    });
};
