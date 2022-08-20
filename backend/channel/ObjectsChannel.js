const Channel = Router.resolve('core/Channel');
const { ListObjectsCommand } = require('@aws-sdk/client-s3');
const S3Helper = Router.resolve('helper/S3Helper');
const path = require('path');


class ObjectsChannel extends Channel {

    async getObjectsPro(profile, bucketName, page = 1){

        const s3 = S3Helper.getS3(profile);

        // return await s3.send(new ListObjectsCommand({
        //     Bucket: bucketName
        // }));

        return await S3Helper.getAllObjects(s3, bucketName);
    }

    async uploadFiles(profile, bucketName, filePaths){

        const s3 = S3Helper.getS3(profile);

        //return await S3Helper.putObjectInBucket(s3, bucketName, path.basename(filePaths[0].path), path.basename(filePaths[0].path));
        const mPart = S3Helper.putObjectInBucketMultiPart(s3, bucketName, filePaths[0].path, path.basename(filePaths[0].path));

        mPart.on("error", (e) => {
            console.log(e);
        })

        mPart.on("end", (response) => {
            console.log("on End: ");
            console.log(response);
        })

        mPart.on("progress", (doneCount, totalCount) => {
            console.log(doneCount, " from ", totalCount, " part done!");
        })

    }
}

const instance = new ObjectsChannel();

module.exports = instance;
