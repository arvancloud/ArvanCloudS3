const _ = require("underscore");

Array.prototype.removeIndex = function(removeIndex) {

    return this.filter((value, index) => index !== removeIndex);
};

Array.prototype.max = function (iteratee) {

    return _.max(this, iteratee)

};

Array.prototype.filter = function (predicate) {

    if(predicate){
        return _.filter(this, predicate)
    }
    else{
        return this;
    }


};

Array.prototype.sortBy = function (iteratee) {

    return _.sortBy(this, iteratee)

};