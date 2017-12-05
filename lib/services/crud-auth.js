const CRUD = require("./crud");

class CRUDAuth extends CRUD {

    constructor($auth, collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
        this.auth = $auth;
    }

    async httpOne(ask, reply) {
        this.auth.identify(ask);
        return super.httpOne(ask, reply);
    }

    async httpFind(ask, reply) {
        this.auth.identify(ask);
        return super.httpFind(ask, reply);
    }
}

exports = module.exports = CRUDAuth;