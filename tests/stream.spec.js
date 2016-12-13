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

// describe("A suite for stream", () => {

//     it("setup", done => {
          
//         return setup.run().then(() => {
        
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             let promises = [];
            
//             for (let i = 0; i < 5; i++) {
//                 let user = {
//                     login: "user" + i,
//                     password: "password " + i
//                 };
                
//                 promises.push($mongo.insert("users", user));
//             };
            
//              return Promise.all(promises).then(items => {
//                 expect(items.length).toEqual(5);
//             });
 
//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
    
//     // it("stream", done => {
        
//     //     return Promise.resolve().then(() => {
//     //         let $mongo = setup.$qwebs.resolve("$mongo");
            
//     //         return $mongo.find("users").then(cursor => {
                
//     //             let stream = cursor.stream();
//     //             let output = fs.createWriteStream("output2.json");
                
//     //             stream.pipe(output)
//     //                 .on("end", done)
//     //                 .on("error", done);
//     //         });
//     //     }).catch(error => {
//     //         expect(error.stack).toBeNull();
//     //     }).then(done);
//     // });
    
//     it("transform stream", done => {
        
//         return Promise.resolve().then(() => {
//             let $mongo = setup.$qwebs.resolve("$mongo");
            
//             return $mongo.find("users").then(cursor => {
//                 return cursor.stream().pipe(new ExtendUser($mongo, {objectMode: true}));
//             });
//         }).then(stream => {
              
//             stream.once("finish", done);
//             stream.once("error", done);
           
//         }).catch(error => {
//             expect(error.stack).toBeNull();
//         }).then(done);
//     });
// });

// class ExtendUser extends stream.Transform {
//     constructor($mongo, options) {
//         super(options);
//         this.$mongo = $mongo;
//     }

//     _transform(chunk, enc, cb) {
//         this.$mongo.findOne("users", { login: chunk.login }).then(user => {
//             user.date = new Date();
//             this.push(user);
//         }).then(cb);
//     };
// };
