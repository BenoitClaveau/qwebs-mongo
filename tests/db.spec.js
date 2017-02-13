/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau <benoit.claveau@gmail.com>
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
            throw new Error();
        }).catch(error => {
            expect(error.message).toEqual("Cannot read property 'connectionString' of null");
        }).then(() => {
            setup.teardown();
        }).then(done);
    });
});
