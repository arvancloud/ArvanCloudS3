const {
    S3Client,
    HeadBucketCommand,
    PutObjectCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    ListObjectsCommand,
    GetObjectCommand,
    GetObjectAclCommand,
    GetBucketAclCommand,
} = require('@aws-sdk/client-s3');

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

module.exports.getS3 = (profile) => {

    return new S3Client({
        region: 'default',
        endpoint: profile.endpoint_url,
        credentials: {
            accessKeyId: profile.access_key,
            secretAccessKey: profile.secret_key,
        },
    });

};

module.exports.checkExistBucket = async (s3, bucketName) => {

    try {

        await s3.send(new HeadBucketCommand({Bucket: bucketName}));

        return true;
    }
    catch (e) {

        if(e.name === "NotFound"){
            return  false;
        }
        else if(e.name === "403"){
            return true;
        }

        throw e;
    }

};

module.exports.putObjectInBucket = async (s3, bucketName, filePath, objectKey, isPublic = true) => {

    // Configure the file stream and obtain the upload parameters

    return new Promise((resolve, reject) => {

        const readStream = fs.createReadStream(filePath);

        readStream.on('error', function (err) {

            reject(err);
        });

         s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            ACL: isPublic ? 'public-read' : 'private',
            Body: readStream,
         }))
             .then(resolve)
             .catch(reject);
    });

};

module.exports.putObjectInBucketMultiPart = (s3, bucketName, filePath, objectKey, isPublic = true, options = {}) => {

    const eventEmitter = new EventEmitter();

    options.PartSize =  options.PartSize || 5;
    options.TriesOnError =  options.TriesOnError || 3;
    let buffer;

    try {
        buffer = fs.readFileSync(filePath);
    }
    catch (e) {
        eventEmitter.emit('error', e);
        return ;
    }

    const startTime = new Date();
    let partNum = 0;

    // Maximum 400MB and Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
    const partSize = 1024 * 1024 * options.PartSize;

    const totalPart = Math.ceil(buffer.length / partSize);

    const multipartMap = {
        Parts: []
    };

    console.log("Creating multipart upload for:", objectKey);

    s3.send(new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: objectKey
    }))
        .then(async ({UploadId}) => {

            eventEmitter.emit('progress', 0, totalPart, multipartMap);

            for (let rangeStart = 0; rangeStart < buffer.length; rangeStart += partSize) {

                if(GlobalData.AbortSignal === true){
                    eventEmitter.emit('abort');
                    return ;
                }

                partNum++;

                let rangeEnd = Math.min(rangeStart + partSize, buffer.length);

                let tryUploadPart = options.TriesOnError;

                while (tryUploadPart){

                    try {
                        const uploadPartResponse = await s3.send(new UploadPartCommand({
                            Body: buffer.subarray(rangeStart, rangeEnd),
                            Bucket: bucketName,
                            Key: objectKey,
                            PartNumber: String(partNum),
                            UploadId: UploadId,
                        }));

                        multipartMap.Parts[partNum - 1] = {
                            ETag: uploadPartResponse.ETag,
                            PartNumber: partNum
                        };

                        tryUploadPart = 0;

                    }
                    catch (e) {

                        --tryUploadPart;
                        if(tryUploadPart === 0){

                            eventEmitter.emit('error', e);

                            return ;
                        }

                        console.log("try upload again");

                        await new Promise(resolve => setTimeout(resolve, 500));

                    }
                }

                eventEmitter.emit('progress', multipartMap.Parts.length, totalPart, multipartMap);
            }

            const response = await s3.send(new CompleteMultipartUploadCommand({
                Bucket: bucketName,
                Key: objectKey,
                MultipartUpload: multipartMap,
                UploadId: UploadId,
            }));

            let delta = (new Date() - startTime) / 1000;

            console.log("Completed upload in", delta, "seconds");

            eventEmitter.emit('end', response);

        })
        .catch(e => {
            eventEmitter.emit('error', e);
        });

    return eventEmitter;

};

module.exports.getAllObjects = async (s3, bucketName) => {

    const data = await s3.send(new ListObjectsCommand({
        Bucket: bucketName,
    }));

    //console.log(data);

    let objects = data.Contents ? data.Contents : [];
    let nextMarker = data.NextMarker;

    //console.log("IsTruncated", data.IsTruncated);
    // IsTruncated == true means exists objects still

    while (nextMarker){

        const data = await s3.send(new ListObjectsCommand({
            Bucket: bucketName,
            Marker: nextMarker
        }));

        objects = objects.concat(data.Contents);
        nextMarker = data.NextMarker;

    }

    return objects;

};

module.exports.getAllObjectsByDirectory = async (s3, bucketName, prefix) => {

    const data = await s3.send(new ListObjectsCommand({
        Bucket: bucketName,
        Delimiter: "/",
        Prefix: prefix,
    }));

    console.log(data);

    let folders = data.CommonPrefixes ? data.CommonPrefixes : [];

    let objects = data.Contents ? data.Contents : [];
    let nextMarker = data.NextMarker;

    while (nextMarker){

        const data = await s3.send(new ListObjectsCommand({
            Bucket: bucketName,
            Marker: nextMarker
        }));

        objects = objects.concat(data.Contents);
        nextMarker = data.NextMarker;

    }

    return folders.concat(objects);

};

module.exports.downloadObjectInTemp = async (s3, bucketName, objectKey) => {

    const data = await s3.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey
    }));

    const tempPath = path.join(Router.TempPath, "download");

    const tempObject = path.join(tempPath, uuidv4());

    await fs.ensureDir(tempPath);

    return new Promise((resolve, reject) => {

        const writeStream = fs.createWriteStream(tempObject);

        writeStream.on("finish", () => resolve(tempObject));

        writeStream.on("error", reject);

        //writeStream.on("pipe", (r) => console.log("pipe"));

        data.Body.pipe(writeStream);

    });

};

module.exports.isPublicObject = async (s3, bucketName, objectKey) => {

    const response = await s3.send(
        new GetObjectAclCommand({
            Bucket: bucketName,
            Key: objectKey
        })
    );

    return response.Grants[0] ? response.Grants[0].Permission === "READ" : false;

};

module.exports.isPublicBucket = async (s3, bucketName) => {

    const response = await s3.send(
        new GetBucketAclCommand({
            Bucket: bucketName
        })
    );

    return response.Grants[0] ? response.Grants[0].Permission === "READ" : false;

};