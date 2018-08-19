import express from 'express';
import S3er from './dist';
const app = express();

const requestS3er = S3er.createModule({ 
    accessKeyId: 'accessKeyId', 
    secretAccessKey: 'secretAccessKey',
    bucket: 'bucket',
    region: 'region'
 });

 app.get('/inspect', ( request, response ) => {
    ( async () => {    
        const inspected = await requestS3er.inspect({ request });        
        // if you want to validate files ( ext, size, etc .. )
        // use inspect function to validate you want ( each files have buffer property )        
        response.send({
            hello: 'world'
        });
    })();    
});

app.post('/execute', ( request, response ) => {
    ( async () => {        
        response.send( await requestS3er.execute({ request }) );
    })();    
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});