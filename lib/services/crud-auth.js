const { DataError } = require("qwebs");
const { CRUD } = require("qwebs-mongo");

/**
 * Override http methods to identify the caller
 * For more information see qwebs-auth 
 * https://www.npmjs.com/package/qwebs-auth-jwt
 */
class CRUDAuth extends CRUD {

    constructor($auth, collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
        this.$auth = $auth;
    }

    /* http ------------------------------------------------*/

    httpGetById(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpGetById(request, response);
        })
    };

    httpInsert(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpInsert(request, response);
        })
    };

    httpUpdate(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpUpdate(request, response);
        })
    };

    httpSave(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpSave(request, response);
        })
    };

    httpInsertList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpInsertList(request, response);
        })
    };

    httpUpdateList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpUpdateList(request, response);
        })
    };

    httpSaveList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpSaveList(request, response);
        })
    };

    httpDeleteById(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpDeleteById(request, response);
        })
    };

    httpDelete(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpDelete(request, response);
        })
    };

    httpDeleteList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpDeleteList(request, response);
        })
    };

    httpDeleteMany(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpDeleteMany(request, response);
        })
    };

    httpStream(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpStream(request, response);
        })
    };

    httpArray(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpArray(request, response);
        })
    };

    httpDistinct(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpDistinct(request, response);
        })
    };

    httpAggregate(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return httpAggregate(request, response);
        })
    };
}

exports = module.exports = CRUDAuth;