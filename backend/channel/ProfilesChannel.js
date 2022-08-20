const Channel = Router.resolve('core/Channel');
const S3Helper = Router.resolve('helper/S3Helper');
const {ListBucketsCommand} = require('@aws-sdk/client-s3');


class ProfilesChannel extends Channel {

    async getProfiles() {

        return Store.get("profiles", []);

    }

    async saveProfile(profile) {

        if(profile.provider === "arvan"){
            profile.endpoint_url = "https://s3.ir-thr-at1.arvanstorage.com";
        }

        const s3 = S3Helper.getS3(profile);

        await s3.send(new ListBucketsCommand({}));

        let profiles = Store.get("profiles", []);

        if(profile.id){

            const index = profiles.findIndex(value => value.id === profile.id);
            profiles[index] = profile;
        }
        else{

            let id = profiles.length === 0 ? 0 : profiles.max(profile =>  profile.id).id;

            id++;

            profile.id = id;

            profiles.push(profile);
        }

        Store.set("profiles", profiles);

    }

    async deleteProfile(profile) {

        let profiles = Store.get("profiles", []);

        const index = profiles.findIndex(value => value.id === profile.id);

        profiles = profiles.removeIndex(index);

        Store.set("profiles", profiles);

    }
}

const instance = new ProfilesChannel();

module.exports = instance;