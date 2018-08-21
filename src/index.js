import _ from 'lodash';
import AWS from 'aws-sdk';
import uuidV4 from 'uuid/v4';
import replaceall from 'replaceall';
import fileType from 'file-type';
import Busboy from 'busboy';
import q from 'q';
import util from 'util';
import moment from 'moment';

function createModule({ accessKeyId, secretAccessKey, bucket, region }){
    const S3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    async function S3Upload({ bucket, key, buffer }){
        return await S3.upload({
            Bucket: bucket,
            Key: key,
            ACL: 'public-read',
            ContentType: fileType( buffer ).mime,
            Body: buffer
        }).promise();
    }
    const S3erModule = {
        inspect: async ({ request }) => {
            const deferred = q.defer();
            const inspected ={};
            inspected.files = {};
            inspected.fields = {};            
            const busboy = new Busboy({ headers: request.headers });
            busboy.on('file', ( fieldname, file, filename, encoding, mimetype ) => {
                let buffers = [];
                file.on('data', data => {
                    buffers.push( data );
                });
                file.on('end', () => {
                    inspected.files = Object.assign( inspected.files, { [ fieldname ] : { fileName: filename, buffer: Buffer.concat( buffers )}});
                });
            });
            busboy.on('field', ( fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype ) => {
                inspected.fields = Object.assign( inspected.fields, { [ fieldname ]: val });
            });
            busboy.on('finish', () => {
                deferred.resolve( inspected );
            });
            request.pipe( busboy );
            return deferred.promise;
        },
        execute: async ({ request, subBucket }) => {            
            const inspected = await S3erModule.inspect({ request });                  
            if( _.isEmpty( inspected.files )) {
                return {
                    files: {},
                    fields: inspected.fields
                }
            };
            const kArray = _.keys( inspected.files );
            const vArray = _.values( inspected.files );
            const uArray = await q.all( _.map( vArray, item => { 
                const key = replaceall( '-', '', uuidV4() );                
                const bucketPath = _.isEmpty( subBucket ) ? bucket + '/' + moment().format( 'YYYYMMDD' ) : bucket + subBucket;     
                return S3Upload({ bucket: bucketPath, key: key, buffer: item.buffer }) 
            }));
            const merged = _.merge( vArray, uArray );
            const ommited = _.map( merged, item => _.omit( item, [ 'buffer' ]));
            const files = _.zipObject( kArray, ommited );           
            return {
                files,
                fields: inspected.fields
            }             
        }
    };
    return S3erModule;
};

export default {
    createModule
}