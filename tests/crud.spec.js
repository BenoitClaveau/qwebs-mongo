/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;

describe("A suite for create operations", () => {

    beforeAll(setup.run.bind(setup));
    afterAll(setup.stop.bind(setup));

    it("insertOne & deleteOne", done => {
        return setup.$qwebs.resolve("$mongo").db.then(db => {
            let user = {
                login: "jean-pierre",
                password: "1234"
            };
            let collection = db.collection("users");
            return collection.insertOne(user).then(data => {
                expect(data.result.ok).toEqual(1);
                expect(data.ops[0].login).toEqual("jean-pierre");
                expect(data.ops[0].password).toEqual("1234");
                expect(data.ops[0]._id).not.toBeUndefined();

                return collection.deleteOne({_id: data.ops[0]._id}).then(data => {
                    expect(data.result.ok).toEqual(1);
                    expect(data.result.n).toEqual(1);
                });
            });
        }).then(done).catch(fail);
    });

    it("toArray", done => {
        return setup.$qwebs.resolve("$mongo").db.then(db => {
            db.collection("users").find({}).toArray().then(data => {
                expect(data.length).toEqual(2);
                expect(data[0].login).toEqual("paul");
                expect(data[1].login).toEqual("henri");
            });
        }).then(done).catch(fail);
    });

    it("toArray skip limit", done => {
        return setup.$qwebs.resolve("$mongo").db.then(db => {
            db.collection("users").find({}).skip(1).limit(1).toArray().then(data => {
                expect(data.length).toEqual(1);
                expect(data[0].login).toEqual("henri");
            });
        }).then(done).catch(fail);
    });

    it("stream", done => {
        return setup.$qwebs.resolve("$mongo").db.then(db => {
            return new Promise((resolve, reject) => {
                let stream = db.collection("users").find({}).stream();
                let results = [];
                stream.on('data', item => {
                    results.push(item);
                }).on('end', () => {
                    expect(results.length).toEqual(2);
                    resolve();
                }).on('error', reject);
            });
        }).then(done).catch(fail);
    });
});

