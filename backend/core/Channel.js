class Channel {

    mainWindow = {};

    sendTrigger(channel, data){

        this.mainWindow.webContents.send(channel, data);

    }

}

module.exports = Channel;