# qwebs-mongo
[Mongo](https://www.npmjs.com/package/mongodb) service build with [Promises](https://www.npmjs.com/package/q) for [Qwebs server](https://www.npmjs.com/package/qwebs).

 [![NPM][npm-image]][npm-url]
 [![Build Status][travis-image]][travis-url]
 [![Coverage Status][coveralls-image]][coveralls-url]

## Features

  * [Qwebs](https://www.npmjs.com/package/qwebs)
  * [Mongo](https://www.npmjs.com/package/mongodb)
  * [Promises](https://www.npmjs.com/package/q)
    
### Add the mongo connection string in config.json

```json
{
	"mongo": {
        "connectionString": "mongodb://localhost:27017/database"
    },
}
```

### Declare and inject $mongo

```js
const Qwebs = require("qwebs");
const qwebs = new Qwebs();

qwebs.inject("$mongo" ,"qwebs-mongo");
```

### Use $mongo service

```js
class MyService {
  constructor($mongo) {
    this.$mongo = $mongo;
  };

  insert(request, response) {
    return this.$mongo.db.then(db => {
      db.collection("collectionName").insertOne(request.body).then(data => {
        return response.send({ request: request, content: data });
      });
    });
  );
};

exports = module.exports = MyService; //Return a class. Qwebs will instanciate it;
```

## Promise API

  * connect()
  * createCollection(collectionName)
  * drop(collectionName)
  * ensureIndex(collectionName, index, options)
  * dropIndex(collectionName, index)
  * gridStore(objectId, mode, options)
  * gridFsBusket(options)
  * insert(collectionName, item)
  * update(collectionName, criteria, update, option)
  * remove(collectionName, selector)
  * findOne(collectionName, query, fields)
  * find(collectionName, query, options)
  * find2(collectionName, query, meta, options) for meta like textScore
  * count(collectionName, query, options)
  * geoNear(collectionName, x, y, options)
  * aggregate(collectionName, array)
  * mapReduce(collectionName, map, reduce, options)
  * initializeUnorderedBulkOp(collectionName)
  * [Mongo native API](http://mongodb.github.io/node-mongodb-native/2.1/api/)

## Installation

```bash
$ npm install qwebs-mongo
```

## Test

To run our tests, clone the qwebs-mongo repo and install the dependencies.

```bash
$ git clone https://github.com/BenoitClaveau/qwebs-mongo --depth 1
$ cd qwebs-mongo
$ npm install
$ mongod --dbpath ./data/db
$ node.exe "..\node_modules\jasmine-node\bin\jasmine-node" --verbose tests
```

[npm-image]: https://img.shields.io/npm/v/qwebs-mongo.svg
[npm-url]: https://npmjs.org/package/qwebs-mongo
[travis-image]: https://travis-ci.org/BenoitClaveau/qwebs-mongo.svg?branch=master
[travis-url]: https://travis-ci.org/BenoitClaveau/qwebs-mongo
[coveralls-image]: https://coveralls.io/repos/BenoitClaveau/qwebs-mongo/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/BenoitClaveau/qwebs-mongo?branch=master
