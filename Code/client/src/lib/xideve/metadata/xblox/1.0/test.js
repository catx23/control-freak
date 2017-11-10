define([
    "dojo/_base/declare",
    "dcl/dcl",
    "dojo/has",
    "xide/mixins/ReferenceMixin"

], function(declare,dcl,has,ReferenceMixin){

    //actual implementation
    var Impl = {
        render:function(){...}
    };

    var _class = null;

    //register module via declare or dcl
    if(has('use-dcl')){
        _class = dcl([ReferenceMixin],Impl);
    }else{
        _class = declare('xblox.model.Referenced',[ReferenceMixin],Impl);
    }

    //static access to Impl.
    _class.Impl = Impl;

    return _class
});