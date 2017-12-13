const Rest = require("./Rest");

class RestAuthService extends Rest {

    constructor(collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
    }

    /* http methods */

    async authFindMe(ask, reply) {
        ask.mongo = { filter: { _id: ask.auth.payload._id }};
        return await this.findOne(ask, reply);
    }

    async authFindOne(ask, reply) {
        return await this.findOne(ask, reply);
    }

    async authFind(ask, reply) {
        return await this.find(ask, reply);
    }

    async authSave(ask, reply) {
        return await this.save(ask, reply);
    }
}

exports = module.exports = RestAuthService;