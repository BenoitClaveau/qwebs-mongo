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
            $config.mongo.connectionString = "dummy"; //replace mongo config
            let $mongo = setup.$qwebs.resolve("$mongo");
            $mongo.close(); //remove setup initialization
            return $mongo.db;
        }).then(() => {
            throw new Error("The test should have failed.");
        }).catch(error => {
            expect(error.message).toBeNull();
        }).then(() => {
            setup.teardown();
        }).then(done);
    });
});