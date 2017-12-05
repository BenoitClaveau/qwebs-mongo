/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const setup = require("./setup");
const expect = require("expect.js");

describe("A suite for mongo", () => {

    before(async () => await setup.run())
    after(async () => await setup.stop())

    it("connect", async () => {
        const mongo = await setup.qwebs.resolve("$mongo");
        let db = await mongo.connect();
        expect(db.databaseName).to.be("test");
    });

    it("find", async () => {
        const mongo = await setup.qwebs.resolve("$mongo");
        let db = await mongo.connect();
        const docs = await db.collection("users").find().toArray();
        expect(docs.length).to.be(2);
    });
});
