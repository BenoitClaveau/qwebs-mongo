const CRUD = require("./crud");

class CRUDAuth extends CRUD {

    constructor($auth, collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
        this.auth = $auth;
    }

    async httpAuthOne(ask, reply) {
        return super.httpOne(ask, reply);
    }

    async httpAuthFind(ask, reply) {
        return super.httpFind(ask, reply);
    }
}

exports = module.exports = CRUDAuth;