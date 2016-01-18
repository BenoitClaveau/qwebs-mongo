var path = require("path"),
    setup = require("./setup"),
    ObjectId = require("mongodb").ObjectID,
    fs = require("fs"),
    stream = require("stream"),
    util = require("util"),
    WritableStream = require("qwebs").WritableStream,
    Q = require("q"); 

describe("A suite for stream", function () {

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
    
    it("stream", function (done) {
        
        return Q.try(function() {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(function(cursor) {
                
                var stream = cursor.stream();
                var output = new WritableStream();
                
                return stream.pipe(output);
            });
        }).then(function(buffer) {
            expect(buffer).toBeNull();
            expect(buffer.length).toBeGreaterThan(0);
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("transform stream", function (done) {
        
        return Q.try(function() {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(function(cursor) {
                return cursor.stream().pipe(new ExtendUser($mongo, {objectMode: true}));
            });
        }).then(function(stream) {
              
            stream.once("finish", function() { //Not end but finish
                done();
            });
            
            stream.on("error", function(error) {
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
