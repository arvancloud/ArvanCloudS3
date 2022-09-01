const Channel = Router.resolve('core/Channel');
const { ListObjectsCommand } = require('@aws-sdk/client-s3');
const S3Helper = Router.resolve('helper/S3Helper');
const Utility = Router.resolve('helper/Utility');
const path = require('path');
const fs = require('fs-extra');

class ObjectsChannel extends Channel {

    async getObjectsPro(profile, bucketName, page = 1){

        const s3 = S3Helper.getS3(profile);

        // return await s3.send(new ListObjectsCommand({
        //     Bucket: bucketName
        // }));

        return await S3Helper.getAllObjects(s3, bucketName);
    }

    async selectFilesForUpload(files, folders = []){

        for(let i = 0; i < folders.length; i++){

            if(fs.statSync(folders[i].Path).isDirectory()){

                files = files.concat(await Utility.dirToKeys(folders[i].Path, folders[i].FolderName));
            }

        }

        GlobalData.FilesForUpload = files;

        return {
            count: GlobalData.FilesForUpload.length,
            first: GlobalData.FilesForUpload[0],
        };

    }

    async startUploadFiles(profile, bucketName, isPublic){

        GlobalData.AbortSignal = false;
        GlobalData.AppInProcess = true;

        const self = this;
        const maxSingleUploadSize = 5 * 1024 * 1024;

        const destS3 = S3Helper.getS3(profile);

        const sourceObjects = GlobalData.FilesForUpload;

        const objectsCount = sourceObjects.length;

        let objectIndex = 0;
        let objectKey = null;
        let objectPercent = 0;

        const progress = () => {

            let mainPercent = (100 * objectIndex + objectPercent) / objectsCount;

            self.sendTrigger('uploadFiles@progress', {
                mainProgress: objectIndex + 1,
                mainTotal: objectsCount,
                mainPercent: mainPercent,
                objectKey: objectKey,
                objectPercent: objectPercent
            });
        };

        for (let i = 0; i < objectsCount; i++) {

            if (GlobalData.AbortSignal === true) {

                self.sendTrigger('uploadFiles@abort');
                GlobalData.AppInProcess = false;

                return;
            }

            objectPercent = 0;
            objectKey = sourceObjects[i].Key;
            objectIndex = i;

            progress();

            if (sourceObjects[i].Size < maxSingleUploadSize) {

                await S3Helper.putObjectInBucket(destS3, bucketName, sourceObjects[i].Path, sourceObjects[i].Key, isPublic)

                objectPercent = 100;

                progress();
            }
            else {

                await new Promise((resolve, reject) => {

                    const mPart = S3Helper.putObjectInBucketMultiPart(destS3, bucketName, sourceObjects[i].Path, sourceObjects[i].Key, isPublic);

                    mPart.on("error", async (e) => {

                        reject(e);

                    });

                    mPart.on("abort", async () => {

                        self.sendTrigger('uploadFiles@abort');

                        GlobalData.AppInProcess = false;

                        reject();


                    });

                    mPart.on("end", async (response) => {

                        objectPercent = 100;

                        progress();

                        resolve(response);

                    });

                    mPart.on("progress", (doneCount, totalCount) => {

                        objectPercent = (doneCount * 100 / totalCount);

                        progress();

                    });
                });

            }
        }

        GlobalData.AppInProcess = false;

        self.sendTrigger('uploadFiles@end');
    }

}

const instance = new ObjectsChannel();

module.exports = instance;
