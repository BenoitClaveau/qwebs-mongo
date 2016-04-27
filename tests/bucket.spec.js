/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau
 * MIT Licensed
 */
"use strict"

const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");
const stream = require("stream");
const util = require("util");

//http://mongodb.github.io/node-mongodb-native/2.1/api/GridFSBucket.html

describe("A suite for bucket", () => {

    it("setup", done => {
         
        return setup.run().then(() => {
            
            let $mongo = setup.$qwebs.resolve("$mongo");
            $mongo.connect();
            
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).then(done);
    });
    
    it("openUploadStream", done => {
        
        return Promise.resolve().then(() => {
            
            let $mongo = setup.$qwebs.resolve("$mongo");
            
            return $mongo.gridFSBucket({bucketName: "images"}).then(bucket => {
                return bucket.openUploadStream("test.png");
            }).then(uploadStream => {

                console.log("id:", uploadStream.id);
                uploadStream.once("finish", () => {
                    console.log("Completed");
                    done();
                });
                return uploadStream;
            }).then(uploadStream => {
                let filepath = path.join(__dirname, "data/world.png")
                fs.createReadStream(filepath).pipe(uploadStream);
            });
            
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).then(done);
    });
    
    it("openDownloadStreamByName", done => {
        
        return Promise.resolve().then(() => {
            
            let $mongo = setup.$qwebs.resolve("$mongo");
            
            let output = path.join(__dirname, "data/world.dest.png");
            return Promise.resolve().then(() => {
                if(fs.existsSync(output)) return fs.unlinkSync(output);
            }).then(() => {

                return $mongo.gridFSBucket({bucketName: "images"}).then(bucket => {
                    return bucket.openDownloadStreamByName("test.png");
                }).then(downloadStream => {
                    downloadStream.once("end", () => {
                        console.log("Completed");
                        done();
                    });
                    return downloadStream;
                }).then(downloadStream => {
                    downloadStream.pipe(fs.createWriteStream(output));
                });
            });
            
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).then(done);
    });
});
