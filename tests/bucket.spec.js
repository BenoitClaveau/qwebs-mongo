var path = require("path"),
    Setup = require("./setup"),
    ObjectId = require("mongodb").ObjectID,
    fs = require("fs"),
    stream = require('stream'),
    util = require('util'),
    Q = require("q"); 

//http://mongodb.github.io/node-mongodb-native/2.1/api/GridFSBucket.html

describe("A suite for bucket", function () {

    it("setup", function (done) {
         
        return new Setup().run().then(function(setup) {
            
            var $mongo = setup.qwebs.resolve("$mongo");
            $mongo.connect();
            
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally(done);
    });
    
    it("openUploadStream", function (done) {
        
        return Q.try(function() {
            
            var $mongo = setup.qwebs.resolve("$mongo");
            
            return $mongo.gridFSBucket({bucketName: "images"}).then(function(bucket) {
                return bucket.openUploadStream("test.png");
            }).then(function(uploadStream) {

                console.log("id:", uploadStream.id);
                uploadStream.once('finish', function() {
                    console.log("Completed");
                    done();
                });
                return uploadStream;
            }).then(function(uploadStream) {
                var filepath = path.join(__dirname, "data/world.png")
                fs.createReadStream(filepath).pipe(uploadStream);
            });
            
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally();
    });
    
    it("openDownloadStreamByName", function (done) {
        
        return Q.try(function() {
            
            var $mongo = setup.qwebs.resolve("$mongo");
            
            var output = path.join(__dirname, "data/world.dest.png");
            return Q.try(function() {
                if(fs.existsSync(output)) return Q.ninvoke(fs, "unlink", output);
            }).then(function() {

                return $mongo.gridFSBucket({bucketName: "images"}).then(function(bucket) {
                    return bucket.openDownloadStreamByName("test.png");
                }).then(function(downloadStream) {
                    downloadStream.once('end', function() {
                        console.log("Completed");
                        done();
                    });
                    return downloadStream;
                }).then(function(downloadStream) {
                    downloadStream.pipe(fs.createWriteStream(output));
                });
            });
            
        }).catch(function (error) {
            expect(error.stack).toBeNull();
        }).finally();
    });
});
