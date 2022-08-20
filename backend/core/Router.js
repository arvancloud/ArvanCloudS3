const path = require("path");

const Router = function () {};

Router.BasePath = path.join(__dirname, "..");

Router.TempPath = path.join(Router.BasePath, "..", "temp");

Router.resolve =  (objectPath) => require(Router.BasePath + '/' + objectPath);

module.exports.Router = Router;
