const _ = require("underscore");

Array.prototype.removeIndex = function(removeIndex) {

    return this.filter((value, index) => index !== removeIndex);
};

Array.prototype.max = function (iteratee) {

    return _.max(this, iteratee)

};