global.Router = require("./backend/core/Router.js").Router;

Router.resolve("core/Extended");

global.GlobalData = {
    AppInProcess: false,
    CurrentBucketObjects: []
};
global.Store = Router.resolve("core/Store");

const {BrowserWindow , app, ipcMain, dialog} = require('electron') // app : control application life.
const cors = require('cors')
//const Sequelize = require('sequelize')
const find = require('find-process');
//const Config = Router.resolve('core/Config');
const path = require("path");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

console.log("Electron started.")

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', CreateWindow);

app.disableHardwareAcceleration();

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q

    if(process.env.DEV_MODE && process.env.ENABLE_KILL_PORT_3000 === true){

        KillPort(3000, function () {
            console.log('Kill 3000 port');
            console.log('Closing...');

            if (process.platform !== 'darwin') {
                app.quit()
            }

        })
    }
    else{

        console.log('Closing...');

        if (process.platform !== 'darwin') {
            app.quit()
        }

    }

});

app.on('activate', function () {

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        CreateWindow()
    }
});


function CreateWindow() {

    // Create the browser window.

    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 1024,
        minHeight: 768,
        icon: path.join(__dirname, 'icon.png'),
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.maximize();
    mainWindow.show();

    mainWindow.on('close', async e => {
        e.preventDefault();

        if(GlobalData.AppInProcess){
            const { response } = await dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Processing',
                message: 'The program is executing the operation. It is not possible to exit.',
            });
        }
        else{
            mainWindow.destroy();
        }

    });

    mainWindow.loadFile('backend/view/loading.html');
    console.log('Launch electron window.');

    CheckConnectingToDataBase()
        .then(() => {

            console.log('Database Connection is ok.');

            ipcMain.handle('custom-channels', async (event, channel, ...args) => {

                try{

                    let [channelClassName, method] = channel.split("@");

                    let instance = Router.resolve("channel/" + channelClassName + "Channel");

                    instance.mainWindow = mainWindow;

                    return [null, await instance[method](...args)];
                }
                catch (e) {

                    console.error(e);

                    let error = JSON.stringify(e);

                    return [error, null];
                }

            })


            if(!process.env.DEV_MODE){

                console.log('Project is running now.');

                mainWindow.loadFile('build/index.html')

            }
            else{

                // Open the DevTools.
                mainWindow.webContents.openDevTools({ mode: 'detach' });

                const net = require('net');
                const client = new net.Socket();
                const {spawn} = require('child_process')

                console.log('Run script "npm react-scripts start".');
                console.log('Waiting for react dev server to start.');

                spawn('npm.cmd',['run', 'react-start']);

                let react_is_available = false;
                const tryConnection = () => {

                    console.log("Try connecting port 3000.");

                    client.connect({port: 3000}, () => {



                        client.end();
                        if(!react_is_available) {

                            react_is_available = true;
                            mainWindow
                                .loadURL('http://localhost:3000')
                                .then(()=>{
                                    console.log('Project is running now on dev mode.');
                                    /*
                                                                        mainWindow.webContents.on("ipc-message", (event, channel, ...args) => {

                                                                            let [channelClassName, method] = channel.split("@");

                                                                            let instance = Router.resolve("channel/" + channelClassName + "Channel");

                                                                            instance.mainWindow = mainWindow;

                                                                            instance[method](...args);

                                                                        });


                                                                        mainWindow.webContents.on("ipc-message-sync", async(event, channel, ...args) => {

                                                                            let [channelClassName, method] = channel.split("@");

                                                                            let instance = Router.resolve("channel/" + channelClassName + "Channel");

                                                                            instance.mainWindow = mainWindow;

                                                                            try{
                                                                                event.returnValue = [
                                                                                    null,
                                                                                    await instance[method](...args)
                                                                                ];

                                                                            }
                                                                            catch (e) {
                                                                                event.returnValue = [
                                                                                    e,
                                                                                    null
                                                                                ];
                                                                            }

                                                                        });
                                    */

                                });
                        }
                    });
                };

                tryConnection();

                client.on('error', (error) => {
                    //console.error(error);
                    setTimeout(tryConnection, 2000);
                });

            }

            // Emitted when the window is closed.
            mainWindow.on('closed', function () {
                // Dereference the window object, usually you would store windows
                // in an array if your app supports multi windows, this is the time
                // when you should delete the corresponding element.

                mainWindow = null

            })

        })
        .catch(err => {

            console.error('Unable to connect to the database: ', err);
        })
}

async function CheckConnectingToDataBase() {

    console.log("Connecting to database.");

    return ;

    var database = Config.database.mysql;

    const sequelize = new Sequelize(database.database, database.user, database.password, {
        host: database.host,
        dialect: 'mysql'
    });

    return sequelize.authenticate()

}

function KillPort(port, callback) {

    find('port', 3000)
        .then(function (list) {
            if(list[0] != null){
                process.kill(list[0].pid);
                callback();
            }

        })
        .catch((e) => {
            console.log(e.stack || e);
            callback();
        });

}