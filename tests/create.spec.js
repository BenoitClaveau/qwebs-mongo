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

describe("A suite for create operations", () => {

    it("setup", done => {
        return setup.run().then(() => {
            let $mongo = setup.$qwebs.resolve("$mongo");
            return $mongo.db;
        }).then(db => {
            expect(db.databaseName).toEqual("test");
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).then(() => {
            setup.teardown();
        }).then(done);
    });

    it("insertOne", done => {
        return setup.run().then(() => {
            let $mongo = setup.$qwebs.resolve("$mongo");
            return $mongo.db;
        }).then(db => {
            let user = {
                login: "paul",
                password: "1234"
            };
            let collection = db.collection("users");
            return collection.insertOne(user).then(data => {
                console.log("data", data)
                expect(data.results.ok).toEqual(1);
                expect(data.ops[0].login).toEqual("paul");
                expect(data.ops[0].password).toEqual("1234");
                expect(data.ops[0]._id).not.toBeUndefined();
            }).then(() => {
                return collection.deleteOne({_id: data.ops[0]._id}).then(data => {
                    console.log("data", data)
                });
            });
        }).catch(error => {
            expect(error.stack).toBeNull();
        }).then(() => {
            setup.teardown();
        }).then(done);
    });

    // it("crud", done => {
        
    //     return Promise.resolve().then(() => {
    //         let $mongo = setup.$qwebs.resolve("$mongo");
            
    //         let user = {
    //             login: "user1",
    //             password: "password1"
    //         };
            
    //         return $mongo.insert("users", user).then(newUser => {
    //             expect(newUser).not.toBeNull();
    //             expect(newUser.login).toEqual("user1");
                
    //             return $mongo.findOne("users", { "login": "user1" }).then(dbUser => {
    //                 expect(dbUser.login).toEqual("user1");
    //                 expect(dbUser.password).toEqual("password1");
                    
    //                 dbUser.login = "user2";
                    
    //                 return $mongo.update("users", { _id: dbUser._id }, dbUser).then(() => {
    //                     return $mongo.findOne("users", { _id: dbUser._id }).then(dbUser2 => {
    //                         expect(dbUser2.login).toEqual("user2");
                            
    //                         return $mongo.insert("users", dbUser).then(() => {
    //                             fail();
    //                         }).catch(error => {
    //                             expect(error.message.includes("duplicate key error")).toEqual(true);
    //                         });
    //                     });
    //                 });
    //             });
    //         });
            
    //     }).catch(error => {
    //         expect(error.stack).toBeNull();
    //     }).then(done);
    // });
});

