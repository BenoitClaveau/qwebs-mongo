/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau
 * MIT Licensed
 */
"use strict"

const path = require("path");
const setup = require("./setup");
const ObjectId = require("mongodb").ObjectID;

describe("A suite for db property", () => {

    it("config error", done => {
        return setup.run().then(() => {
            let $config = setup.$qwebs.resolve("$config");
            $config.mongo = null; //replace mongo config to generate an exception
            let $mongo = setup.$qwebs.resolve("$mongo");
            $mongo.close(); //remove setup initialization
            return $mongo.db;
        }).then(() => {
            throw new Error("Cannot read property 'connectionString' of null");
        }).catch(error => {
            expect(error.message).toEqual("invalid schema, expected mongodb");
        }).then(() => {
            setup.teardown();
        }).then(done);
    });
});
