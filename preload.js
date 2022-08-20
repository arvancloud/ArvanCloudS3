window.ipcRenderer = require('electron').ipcRenderer;
window.channel = async (channel, ...args) => {

    let [err, response] = await window.ipcRenderer.invoke("custom-channels", channel, ...args);

    if(err)
        throw JSON.parse(err);
    else
        return response;

};
