const Store = require('electron-store');
const path = require('path');

const store = new Store({
    name: "user-data",
    cwd: path.join(Router.BasePath, "store")
});

module.exports.get = (key, defaultValue) => {

    return store.get(key, defaultValue);
};

module.exports.set = (key, value) => {

    return store.set(key, value);
};