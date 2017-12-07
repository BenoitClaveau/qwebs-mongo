const CRUD = require("./crud");

class CRUDAuth extends CRUD {

    constructor(collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
    }

    async httpAuthOne(ask, reply) {
        return super.httpOne(ask, reply);
    }

    async httpAuthFind(ask, reply) {
        return super.httpFind(ask, reply);
    }
}

exports = module.exports = CRUDAuth;