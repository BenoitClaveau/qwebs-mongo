/*!
 * qwebs-mongo
 * Copyright(c) 2016 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const setup = require("./setup");
const Qwebs = require("qwebs");
const qs0 = require("qs");
const expect = require("expect.js");
const { inspect } = require("util");
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', inspect(reason));
});


describe("A suite for Rest", () => {

    before(async () => await setup.run())
    after(async () => await setup.stop())

    it("parse", async () => {
        const qs = await setup.resolve("$mongo-querystring");
        const query = qs.parse("name=peter");
        expect(query.filter).to.eql({
            name: "peter"
        });
    });

    it("parse", async () => {
        const qs = await setup.resolve("$mongo-querystring");
        const query = qs.parse("price>10&limit=5");
        expect(query.filter).to.eql({
            price: {
                $gt: 10
            }
        });
        expect(query.limit).to.be(5);
    });

    it("parse", async () => {
        const qs = await setup.resolve("$mongo-querystring");
        const query = qs.parse("price>10||price<5");
        expect(query.filter).to.eql({
            $or: [{
                    price: {
                        $gt: 10
                    },
                }, {
                    price: {
                        $lt: 5
                    }
                }
            ]
        });
    });

});
