define([
    'require'
], function (require) {

    global.dojoRequire = require;
    function isString(x) {
        return Object.prototype.toString.call(x) === "[object String]"
    }

    global.amdRequire = function(mid){
        var first = require( isString(mid)? [mid] : mid,function(){});
        return require(mid);
    }
    return require;
});