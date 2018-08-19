'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _replaceall = require('replaceall');

var _replaceall2 = _interopRequireDefault(_replaceall);

var _fileType = require('file-type');

var _fileType2 = _interopRequireDefault(_fileType);

var _busboy = require('busboy');

var _busboy2 = _interopRequireDefault(_busboy);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createModule(_ref) {
    var accessKeyId = _ref.accessKeyId,
        secretAccessKey = _ref.secretAccessKey,
        bucket = _ref.bucket,
        region = _ref.region;

    var S3 = new _awsSdk2.default.S3({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, region: region });
    async function S3Upload(_ref2) {
        var bucket = _ref2.bucket,
            key = _ref2.key,
            buffer = _ref2.buffer;

        return await S3.upload({
            Bucket: bucket,
            Key: key,
            ACL: 'public-read',
            ContentType: (0, _fileType2.default)(buffer).mime,
            Body: buffer
        }).promise();
    }
    var S3erModule = {
        inspect: async function inspect(_ref3) {
            var request = _ref3.request;

            var deferred = _q2.default.defer();
            var inspected = {};
            inspected.files = {};
            inspected.fields = {};
            var busboy = new _busboy2.default({ headers: request.headers });
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                var buffers = [];
                file.on('data', function (data) {
                    buffers.push(data);
                });
                file.on('end', function () {
                    inspected.files = Object.assign(inspected.files, _defineProperty({}, fieldname, { fileName: filename, buffer: Buffer.concat(buffers) }));
                });
            });
            busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                inspected.fields = Object.assign(inspected.fields, _defineProperty({}, fieldname, val));
            });
            busboy.on('finish', function () {
                deferred.resolve(inspected);
            });
            request.pipe(busboy);
            return deferred.promise;
        },
        execute: async function execute(_ref4) {
            var request = _ref4.request,
                subBucket = _ref4.subBucket;

            var inspected = await S3erModule.inspect({ request: request });
            var kArray = _lodash2.default.keys(inspected.files);
            var vArray = _lodash2.default.values(inspected.files);
            var uArray = await _q2.default.all(_lodash2.default.map(vArray, function (item) {
                var key = (0, _replaceall2.default)('-', '', (0, _v2.default)());
                var bucketPath = _lodash2.default.isEmpty(subBucket) ? bucket + '/' + (0, _moment2.default)().format('YYYYMMDD') : bucket + subBucket;
                return S3Upload({ bucket: bucketPath, key: key, buffer: item.buffer });
            }));
            var merged = _lodash2.default.merge(vArray, uArray);
            var ommited = _lodash2.default.map(merged, function (item) {
                return _lodash2.default.omit(item, ['buffer']);
            });
            var files = _lodash2.default.zipObject(kArray, ommited);
            return {
                files: files,
                fields: inspected.fields
            };
        }
    };
    return S3erModule;
};

exports.default = {
    createModule: createModule
};