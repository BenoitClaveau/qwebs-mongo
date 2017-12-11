const Crud = require("./crud");

class CrudAuthService extends Crud {

    constructor(collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
    }

    /* http methods */

    async httpAuthFindMe(ask, reply) {
        ask.mongo = { query: { _id: ask.auth.payload._id }}
        return await super.httpFindOne(ask, reply);
    }

    async httpAuthFindOne(ask, reply) {
        return await super.httpFindOne(ask, reply);
    }

    async httpAuthFind(ask, reply) {
        return await super.httpFind(ask, reply);
    }

    async httpAuthSave(ask, reply) {
        return await super.httpSave(ask, reply);
    }
}

exports = module.exports = CrudAuthService;