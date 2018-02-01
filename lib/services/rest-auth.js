const Rest = require("./Rest");

class RestAuthService extends Rest {

    constructor(collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
    }

    /* http methods */

    async authFindMe(context, stream, headers) {
        context.mongo = { filter: { _id: stream.auth.payload._id }};
        return await this.findOne(context, stream, headers);
    }

    async authFindOne(context, stream, headers) {
        return await this.findOne(context, stream, headers);
    }

    async authFind(context, stream, headers) {
        return await this.find(context, stream, headers);
    }

    async authSave(context, stream, headers) {
        return await this.save(context, stream, headers);
    }
}

exports = module.exports = RestAuthService;