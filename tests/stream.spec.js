const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");
const stream = require("stream");
const util = require("util");

describe("A suite for stream", () => {

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
            
            return Q.all(promises);
 
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("stream", done => {
        
        return Promise.resolve().then(() => {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(curor => {
                
                var stream = cursor.stream();
                var output = fs.createWriteStream("output2.json");
                
                stream.pipe(output)
                    .on("end", done)
                    .on("error", done);
            });
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally();
    });
    
    it("transform stream", done => {
        
        return Promise.resolve().then(() => {
            var $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.find("users").then(curor => {
                return cursor.stream().pipe(new ExtendUser($mongo, {objectMode: true}));
            });
        }).then(stream => {
              
            stream.once("finish", done);
            stream.once("error", done);
           
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).finally();
    });
});

class ExtendUser extends stream.Transform {
    constructor($mongo, options) {
        super(options);
        this.$mongo = $mongo;
    }

    _transform(chunk, enc, cb) {
        self.$mongo.findOne("users", { login: chunk.login }).then(user => {
            user.date = new Date();
            this.push(user);
        }).then(cb);
    };
};
