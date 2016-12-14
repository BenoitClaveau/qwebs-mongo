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
            $config.mongo = {}; //remove mongo config
            console.log("$config", $config)
            console.log("qwebs $config", setup.$qwebs.resolve("$config"))

            let $mongo = setup.$qwebs.resolve("$mongo");
            return $mongo.db;
        }).catch(error => {
            expect(error.message).toBeNull();
        }).then(() => {
            setup.teardown();
        }).then(done);
    });
});