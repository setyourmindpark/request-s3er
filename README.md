## REQUEST-S3ER
### FEATURES
- provide informations of files ( uploaded files to s3 ) and fields ( received data from **form data** ) 
- support express, fastify, koa, etc.. any webfreamework can use this library 
- you can just call function **execute**, then be returnd some informations like this 
``` javascript
{
    "files": {
        "file_selfie": {
            "fileName": "425833_175694742533495_1978200863_n.jpg",
            "ETag": "\"fb74a480e59e8a8b22a0e2646385bc53\"",
            "Location": "https://jaehunpark.s3.ap-northeast-2.amazonaws.com/20180819/5e8dd37d7f614925ab19d0cd2c50ae02",
            "key": "20180819/5e8dd37d7f614925ab19d0cd2c50ae02",
            "Key": "20180819/5e8dd37d7f614925ab19d0cd2c50ae02",
            "Bucket": "jaehunpark"
        },
        "file_friends": {
            "fileName": "박재훈.jpeg",
            "ETag": "\"9b267d0b1cffad118a4c1ce51d526ff7\"",
            "Location": "https://jaehunpark.s3.ap-northeast-2.amazonaws.com/20180819/71e0920a6c1e48f7a3ca197ee9fa81c7",
            "key": "20180819/71e0920a6c1e48f7a3ca197ee9fa81c7",
            "Key": "20180819/71e0920a6c1e48f7a3ca197ee9fa81c7",
            "Bucket": "jaehunpark"
        },
        "file_landscape": {
            "fileName": "박재훈.JPG",
            "ETag": "\"ae50cabaee9b455db7220064379343d7\"",
            "Location": "https://jaehunpark.s3.ap-northeast-2.amazonaws.com/20180819/96020aa273874482ad0fa5822e8f1056",
            "key": "20180819/96020aa273874482ad0fa5822e8f1056",
            "Key": "20180819/96020aa273874482ad0fa5822e8f1056",
            "Bucket": "jaehunpark"
        }
    },
    "fields": {
        "age": "27",
        "name": "jaehunpark"
    }
}
```

### DEPENDENCIES
- aws-sdk
- busboy
- bytes
- file-type
- lodash
- moment
- q
- replaceall
- uuid

### INSTALL
set config in your package.json
``` 
...
"dependencies": {
    ...
    "request-s3er": "git+https://github.com/setyourmindpark/request-s3er.git"
    ...
  }
...
```

### EXAMPLE
``` javascript
import express from 'express';
import S3er from 'request-s3er';
const app = express();

const requestS3er = S3er.createModule({ 
    accessKeyId: 'accessKeyId', 
    secretAccessKey: 'secretAccessKey',
    bucket: 'bucket',
    region: 'region'
 });

 app.get('/inspect', async ( request, response ) => {
    const inspected = await requestS3er.inspect({ request });        
    // if you want to validate files ( ext, size, etc .. )
    // use inspect function to validate you want ( each files have buffer property )        
    response.send({ hello: 'world' });    
});

app.post('/execute', async ( request, response ) => {
    // default sub bucket is date( /YYYYMMDD )
    response.send( await requestS3er.execute({ request }) );
    // if you want to change bucket path, try below ( will be created sub buckets ( start with / ) )
    // response.send( await requestS3er.execute({ request, subBucket: '/aaaa/bbbb' }) );   
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

```
- **request** : required 
- **subBucket** : optional ( start with / )
