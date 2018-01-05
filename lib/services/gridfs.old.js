/*!
 * remit
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
"use strict";

const { Error } = require("oups");
const GridFSBucket = require("mongodb").GridFSBucket;
const ObjectID = require("mongodb").ObjectID;
const { PassThrough } = require("stream");
const CRUD = require("./crud");

class GridFSService extends CRUD {
    constructor(bucketName, $mongo, dbName) {
        super(`${bucketName}.files`, $mongo, dbName);

        if (!bucketName) throw new Error("bucketName isn't defined.");
        if (!$mongo) throw new Error("$mongo isn't defined.");
        if ($mongo instanceof MongoService == false) throw new Error("$mongo isn't a MongoService.");
        
        this.$mongo = $mongo;
        this.bucketName = bucketName;
        this.chunksName = `${bucketName}.chunks`;
        this._buckets = null;
    };

    /* rest ------------------------------------------------*/

    donwload(request, response) {
        let id = request.params ? request.params.id : request.query ? request.query.id : null;
        let attachment = request.params ? request.params.attachment : request.query ? request.query.attachment : null;
        
        if (!id) throw new Error("Id is not defined.");

        return this.mongoGetById(id).then(file => {
            return this.fileOpenDownloadStream(id).then(stream => {
                let header = {
                    "Content-Type": file.contentType,
                    "Content-Length": file.length,
                    "Transfer-Encoding": "chuncked"
                };
                if (attachment) header["Content-Disposition"] = `attachment;filename=${attachment}`;
                return response.send({ request: request, header: header, stream: stream });
            });
        });
    };

    donwloadByName(request, response) {
        let filename = request.params ? request.params.filename : request.query ? request.query.filename : null;
        let attachment = request.params ? request.params.attachment : request.query ? request.query.attachment : null;
        
        if (!filename) throw new Error("Filename is not defined.");

        return this.mongoGet({ name: filename }).then(file => {
            return this.fileOpenDownloadStream(id).then(stream => {
                let header = {
                    "Content-Type": file.contentType,
                    "Content-Length": file.length,
                    "Transfer-Encoding": "chuncked"
                };
                if (attachment) header["Content-Disposition"] = `attachment;filename=${attachment}`;
                return response.send({ request: request, header: header, stream: stream });
            });
        });
    };

    uploadDataURL(request, response) {
        let filename = request.params ? request.params.filename : request.query ? request.query.filename : null;
        if (!filename) throw new Error("Filename is not defined.");

        let match = /data:(\S*);(\S*),(.+)/.exec(event.body);
        if (!match) throw new Error("Body is not a dataURL.");

        let contentType = match[1];
        let data64 = match[3];

        let buffer = Buffer.from(data64, "base64");

        return this.uploadFileFromBuffer(filename, buffer, contentType).then(file => {
            return response.send({ request: request, header: header, content: file });
        });
    };


    /* primitives ------------------------------------------*/

    get bucket() {
        return new Promise((resolve, reject) => {
            if (this._buckets) return resolve(this._buckets);
            else return this.$mongo[this.dbName].then(db => {
                this._buckets = new GridFSBucket(db, { bucketName: bucketName});
                bucket.on("close", () => {
                    delete this._buckets;
                });
                resolve(this._buckets);
            }).catch(reject);
        });
    };

    openDownloadStream(id, options) { 
       return this.bucket.then(bucket => {
         if (!id) throw new Error("Id isn't defined.");
         if (id instanceof ObjectID == false) id = new ObjectID(id);
         return bucket.openDownloadStream(id, options);
       });
    };

    openUploadStream(filename, options) { 
       return this.bucket.then(bucket => {
         if (!filename) throw new Error("Filename isn't defined.");
         return bucket.openUploadStream(filename, options);
       });
    };

    uploadFileFromBuffer(filename, buffer, contentType) {
        return this.openUploadStream(filename, { contentType: contentType }).then(uploadStream => {
            return new Promise((resolve, reject) => {
                uploadStream.once("finish", () => {
                    resolve(uploadStream);
                });
                uploadStream.once("error", error => {
                    reject(error);
                });
                let readstream = new PassThrough();
                readstream.once("error", error => {
                    reject(error);
                });
                readstream.pipe(uploadStream).end(buffer);
            });
        });
    };

    uploadFileFromStream(filename, stream, contentType) {
        return this.openUploadStream(filename, { contentType: contentType }).then(uploadStream => {
            return new Promise((resolve, reject) => {
                uploadStream.once("finish", () => {
                    resolve(uploadStream);
                });
                uploadStream.once("error", error => {
                    reject(error);
                });
                stream.pipe(uploadStream);
            });
        });
    };

    deleteFile(id) { 
      return this.bucket.then(bucket => {
        if (!id) throw new Error("Id isn't defined.");
        if (id instanceof ObjectID == false) id = new ObjectID(id);
        return bucket.delete(id);
      });
    };

    renameFile(id, name) { 
      return this.bucket.then(bucket => {
        if (!id) throw new Error("Id isn't defined.");
        if (!name) throw new Error("Name isn't defined.");
        if (id instanceof ObjectID == false) id = new ObjectID(id);
        return bucket.rename(id, name);
      });
    };
};

exports = module.exports = GridFSService;