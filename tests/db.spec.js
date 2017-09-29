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

    beforeAll(setup.run.bind(setup));
    afterAll(setup.stop.bind(setup));

    it("setup", done => {
        return setup.$qwebs.resolve("$mongo").db.then(db => {
            expect(db.databaseName).toEqual("test");
        }).then(done).catch(fail);
    });
});
