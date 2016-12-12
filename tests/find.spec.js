// /*!
//  * qwebs-mongo
//  * Copyright(c) 2016 Benoît Claveau
//  * MIT Licensed
//  */
// "use strict"

// const path = require("path");
// const setup = require("./setup");
// const ObjectId = require("mongodb").ObjectID;
// const fs = require("fs");
// const stream = require("stream");
// const util = require("util");

// describe("A suite for find", () => {

//     it("setup", done => {

//         return setup.run().then(() => {
            
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             let promises = [];
            
//             for (let i = 0; i < 5; i++) {
//                 let user = {
//                     login: "user" + i,
//                     password: "password" + i,
//                     age: i % 2 ? 18 : 22
//                 };
                
//                 promises.push($mongo.insert("users", user));
//             };
            
//             return Promise.all(promises).then(items => {
//                 expect(items.length).toEqual(5);
//             });

//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
    
//     it("findOne", done => {
        
//         return Promise.resolve().then(() => {
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             return $mongo.findOne("users", { login: "user3" }).then(user => {
//                 expect(user.login).toEqual("user3");
//                 expect(user.password).toEqual("password3");
//             });            
//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
    
//     it("find", done => {
        
//         return Promise.resolve().then(() => {
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             return $mongo.find("users").then(cursor => {
//                 return cursor.toArray().then(users => {
//                     expect(users.length).toEqual(5);
//                 });
//             });            
//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
    
//     it("find with query", done => {
        
//         return Promise.resolve().then(() => {
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             return $mongo.find("users", { age: { $gt: 20 }}).then(cursor => {
//                 return cursor.toArray().then(users => {
//                     expect(users.length).toEqual(3);
//                 });
//             });            
//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
    
//     it("count", done => {
        
//         return Promise.resolve().then(() => {
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             return $mongo.count("users").then(count => {
//                expect(count).toEqual(5);
//             });            
//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
    
//     it("count with query", done => {
        
//         return Promise.resolve().then(() => {
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             return $mongo.count("users", { age: { $gt: 20 }}).then(count => {
//                expect(count).toEqual(3);
//             });            
//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
// });
