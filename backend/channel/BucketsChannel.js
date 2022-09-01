const Channel = Router.resolve('core/Channel');
const {ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand} = require('@aws-sdk/client-s3');
const S3Helper = Router.resolve('helper/S3Helper');
const fs = require("fs-extra");

class BucketsChannel extends Channel {

    async getBuckets(profile) {

        const s3 = S3Helper.getS3(profile);

        const response = await s3.send(new ListBucketsCommand({}));

        return response.Buckets;
    }

    async createBucket(profile, bucketName, acl) {

        const s3 = S3Helper.getS3(profile);

        let exist = await S3Helper.checkExistBucket(s3, bucketName);

        if (exist) {
            throw {Code: "ExistBucket"}
        }

        const data = await s3.send(
            new CreateBucketCommand({
                Bucket: bucketName,
                ACL: acl, // 'private' | 'public-read'
            })
        );

    }

    async deleteBucket(profile, bucketName) {

        const s3 = S3Helper.getS3(profile);

        await s3.send(new DeleteBucketCommand({Bucket: bucketName}));

    }

    async syncBucket(sourceProfile, sourceBucketName, destProfile, destBucketName) {

        GlobalData.AbortSignal = false;
        GlobalData.AppInProcess = true;

        const self = this;
        const maxSingleUploadSize = 5 * 1024 * 1024;

        const sourceS3 = S3Helper.getS3(sourceProfile);
        const destS3 = S3Helper.getS3(destProfile);

        let sourceObjects = await S3Helper.getAllObjects(sourceS3, sourceBucketName);

        if (GlobalData.AbortSignal === true) {

            self.sendTrigger('copyBucket@abort');
            GlobalData.AppInProcess = false;

            return;
        }

        const objectsCount = sourceObjects.length;

        let objectIndex = 0;
        let objectKey = null;
        let objectPercent = 0;

        const progress = () => {

            let mainPercent = (100 * objectIndex + objectPercent) / objectsCount;

            self.sendTrigger('copyBucket@progress', {
                mainProgress: objectIndex + 1,
                mainTotal: objectsCount,
                mainPercent: mainPercent,
                objectKey: objectKey,
                objectPercent: objectPercent
            });
        };

        let destObjects = await S3Helper.getAllObjects(destS3, destBucketName);

        for (let i = 0; i < objectsCount; i++) {

            if (GlobalData.AbortSignal === true) {

                self.sendTrigger('copyBucket@abort');
                GlobalData.AppInProcess = false;

                return;
            }


            objectKey = sourceObjects[i].Key;
            objectIndex = i;

            let destIndex = destObjects.findIndex(value => (value.Key === sourceObjects[i].Key && value.Size === sourceObjects[i].Size));

            if(destIndex > -1){
                objectPercent = 100;
                progress();
                continue;
            }
            else{
                objectPercent = 0;
                progress();
            }

            sourceObjects[i].IsPublic = await S3Helper.isPublicObject(sourceS3, sourceBucketName, sourceObjects[i].Key);
            sourceObjects[i].TempPath = await S3Helper.downloadObjectInTemp(sourceS3, sourceBucketName, sourceObjects[i].Key);

            objectPercent = 30;

            progress();

            if (sourceObjects[i].Size < maxSingleUploadSize) {

                await S3Helper.putObjectInBucket(destS3, destBucketName, sourceObjects[i].TempPath, sourceObjects[i].Key, sourceObjects[i].IsPublic)
                fs.remove(sourceObjects[i].TempPath);

                objectPercent = 100;

                progress();
            }
            else {

                await new Promise((resolve, reject) => {

                    const mPart = S3Helper.putObjectInBucketMultiPart(destS3, destBucketName, sourceObjects[i].TempPath, sourceObjects[i].Key, sourceObjects[i].IsPublic);

                    mPart.on("error", async (e) => {

                        await fs.remove(sourceObjects[i].TempPath);

                        reject(e);

                    });

                    mPart.on("abort", async () => {

                        await fs.remove(sourceObjects[i].TempPath);

                        self.sendTrigger('copyBucket@abort');

                        GlobalData.AppInProcess = false;

                        reject();


                    });

                    mPart.on("end", async (response) => {

                        await fs.remove(sourceObjects[i].TempPath);

                        objectPercent = 100;

                        progress();

                        resolve(response);

                    });

                    mPart.on("progress", (doneCount, totalCount) => {

                        objectPercent = 30 + (doneCount * 70 / totalCount);

                        progress();

                    });
                });

            }

        }

        GlobalData.AppInProcess = false;

        self.sendTrigger('copyBucket@end');

    }

    async copyBucket(sourceProfile, sourceBucketName, destProfile, destBucketName) {

        GlobalData.AbortSignal = false;
        GlobalData.AppInProcess = true;

        const self = this;
        const maxSingleUploadSize = 5 * 1024 * 1024;

        const sourceS3 = S3Helper.getS3(sourceProfile);
        const destS3 = S3Helper.getS3(destProfile);


        const sourceObjects = await S3Helper.getAllObjects(sourceS3, sourceBucketName);

        const objectsCount = sourceObjects.length;

        let objectIndex = 0;
        let objectKey = null;
        let objectPercent = 0;

        const progress = () => {

            let mainPercent = (100 * objectIndex + objectPercent) / objectsCount;

            self.sendTrigger('copyBucket@progress', {
                mainProgress: objectIndex + 1,
                mainTotal: objectsCount,
                mainPercent: mainPercent,
                objectKey: objectKey,
                objectPercent: objectPercent
            });
        };

        for (let i = 0; i < objectsCount; i++) {

            if (GlobalData.AbortSignal === true) {

                self.sendTrigger('copyBucket@abort');
                GlobalData.AppInProcess = false;

                return;
            }

            objectPercent = 0;
            objectKey = sourceObjects[i].Key;
            objectIndex = i;

            progress();

            sourceObjects[i].IsPublic = await S3Helper.isPublicObject(sourceS3, sourceBucketName, sourceObjects[i].Key);
            sourceObjects[i].TempPath = await S3Helper.downloadObjectInTemp(sourceS3, sourceBucketName, sourceObjects[i].Key);

            objectPercent = 30;

            progress();

            if (sourceObjects[i].Size < maxSingleUploadSize) {

                await S3Helper.putObjectInBucket(destS3, destBucketName, sourceObjects[i].TempPath, sourceObjects[i].Key, sourceObjects[i].IsPublic)
                fs.remove(sourceObjects[i].TempPath);

                objectPercent = 100;

                progress();
            }
            else {

                await new Promise((resolve, reject) => {

                    const mPart = S3Helper.putObjectInBucketMultiPart(destS3, destBucketName, sourceObjects[i].TempPath, sourceObjects[i].Key, sourceObjects[i].IsPublic);

                    mPart.on("error", async (e) => {

                        await fs.remove(sourceObjects[i].TempPath);

                        reject(e);

                    });

                    mPart.on("abort", async () => {

                        await fs.remove(sourceObjects[i].TempPath);

                        self.sendTrigger('copyBucket@abort');

                        GlobalData.AppInProcess = false;

                        reject();


                    });

                    mPart.on("end", async (response) => {

                        await fs.remove(sourceObjects[i].TempPath);

                        objectPercent = 100;

                        progress();

                        resolve(response);

                    });

                    mPart.on("progress", (doneCount, totalCount) => {

                        objectPercent = 30 + (doneCount * 70 / totalCount);

                        progress();

                    });
                });

            }

        }

        GlobalData.AppInProcess = false;

        self.sendTrigger('copyBucket@end');

    }

    async cancelOperation() {

        GlobalData.AbortSignal = true;

    }
}

const instance = new BucketsChannel();

module.exports = instance;
