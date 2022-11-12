const Channel = Router.resolve('core/Channel');
const { DeleteObjectCommand, DeleteObjectsCommand, PutObjectAclCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const S3Helper = Router.resolve('helper/S3Helper');
const Utility = Router.resolve('helper/Utility');
const path = require('path');
const fs = require('fs-extra');
const { dialog } = require('electron');

class ObjectsChannel extends Channel {

    async getObjectsPro(profile, bucketName, queryOptions, directory, clearCache){

        const s3 = S3Helper.getS3(profile);

        if(clearCache){
            GlobalData.CurrentBucketObjects = [];

            if(directory.directoryMode === true){
                GlobalData.CurrentBucketObjects = await S3Helper.getAllObjectsByDirectory(s3, bucketName, directory.prefix);
            }
            else{
                GlobalData.CurrentBucketObjects = await S3Helper.getAllObjects(s3, bucketName);
            }

            //console.log("load object from s3")
        }

        const start = queryOptions.page * queryOptions.pageSize;
        const end = (queryOptions.page + 1) * queryOptions.pageSize;

        let objects;
        let filter = null;
        if(queryOptions.searchKey){
            filter = function (object) {
                return (object.Key && object.Key.indexOf(queryOptions.searchKey) >= 0) || (object.Prefix && object.Prefix.indexOf(queryOptions.searchKey) >= 0);
            };
        }

        if(queryOptions.sort.length > 0){

            if(queryOptions.sort[0].sort === "desc"){
                objects = GlobalData.CurrentBucketObjects.filter(filter).sortBy(queryOptions.sort[0].field).reverse().slice(start, end);
            }
            else{
                objects = GlobalData.CurrentBucketObjects.filter(filter).sortBy(queryOptions.sort[0].field).slice(start, end);
            }
        }
        else{

            objects = GlobalData.CurrentBucketObjects.filter(filter).slice(start, end);

        }

        await Promise.all(objects.map(async (object) => {

            if(object.Prefix){

                object.IsPublic = false;
                object.id = object.Prefix;
                object.Key = object.Prefix;
                object.IsFolder = true;

            }
            else{

                object.IsPublic = await S3Helper.isPublicObject(s3, bucketName, object.Key);
                object.id = object.Key;
                object.IsFolder = false;
            }

            return object;

        }));

        return {
            count: GlobalData.CurrentBucketObjects.length,
            objects: objects
        }

    }

    async deleteObject(profile, bucketName, objectKey) {

        const s3 = S3Helper.getS3(profile);

        await s3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        }));

    }

    async deleteObjects(profile, bucketName, objectKeys) {

        const s3 = S3Helper.getS3(profile);

        await s3.send(new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: objectKeys.map(key => {
                    return {Key: key}
                })
            },
        }));

    }

    async setObjectIsPublic(profile, bucketName, objectKey, isPublic){

        const s3 = S3Helper.getS3(profile);

        const response = await s3.send(
            new PutObjectAclCommand({
                Bucket: bucketName,
                Key: objectKey,
                ACL: isPublic ? 'public-read' : 'private',
            })
        );

    }

    async setObjectsAcl(profile, bucketName, objectKeys, isPublic){

        const s3 = S3Helper.getS3(profile);

        for (let i = 0; i < objectKeys.length; i++){

            await s3.send(
                new PutObjectAclCommand({
                    Bucket: bucketName,
                    Key: objectKeys[i],
                    ACL: isPublic ? 'public-read' : 'private',
                })
            );

        }

    }

    async downloadObject(profile, bucketName, objectKey) {

        const downloadPath = dialog.showSaveDialogSync(this.mainWindow ,{
            title: objectKey,
            defaultPath: path.basename(objectKey),
            buttonLabel: "Download Object",
        });

        if(!downloadPath)
            return ;

        const s3 = S3Helper.getS3(profile);

        const data = await s3.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey
        }));

        return await new Promise((resolve, reject) => {

            const writeStream = fs.createWriteStream(downloadPath);

            writeStream.on("finish", () => resolve(downloadPath));

            writeStream.on("error", reject);

            //writeStream.on("pipe", (r) => console.log("pipe"));

            data.Body.pipe(writeStream);

        });

    }

    async downloadObjects(profile, bucketName, objectKeys) {

        let downloadPath = dialog.showOpenDialogSync(this.mainWindow ,{
            title: "Select folder for download",
            defaultPath: "",
            buttonLabel: "Select Folder",
            properties: [
                'openFile',
                'openDirectory',
                'promptToCreate'
            ]
        });

        if(!downloadPath)
            return ;

        downloadPath = downloadPath[0];


        const s3 = S3Helper.getS3(profile);

        for (let i = 0; i < objectKeys.length; i++){

            let objectPath = path.resolve(downloadPath, objectKeys[i]);
            let objectDir = path.resolve(downloadPath, objectKeys[i], "..");

            console.log(objectPath);
            console.log(objectDir);

            await fs.ensureDir(objectDir);

            let data = await s3.send(new GetObjectCommand({
                Bucket: bucketName,
                Key: objectKeys[i]
            }));

            await new Promise((resolve, reject) => {

                const writeStream = fs.createWriteStream(objectPath);

                writeStream.on("finish", () => resolve(downloadPath));

                writeStream.on("error", reject);

                //writeStream.on("pipe", (r) => console.log("pipe"));

                data.Body.pipe(writeStream);

            });

        }

        return downloadPath;

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
