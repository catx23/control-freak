define([
    //"xapp/build/main_build"
    "xapp/build/xapp.min"
], function (dcl,has,xapp) {
    const debug = false;
    debug && console.log('Checkpoint 1.2 build ready');
    if(typeof logError==='undefined'){
        window['logError']=function(e,message){
            console.error('error '+message,e);
        }
    }
    require([
        "requirejs-dplugins/has",
        "dcl/dcl",
        "dojo/has",
        'dojo/Deferred',
        'xdojo/has',
        "xide/utils/ObjectUtils",
        "xblox/RunScript",
        "xblox/CSSState",
        "xblox/StyleState",
        'delite/register',        
        "deliteful/Button",
        "deliteful/Slider",
        "deliteful/Combobox",
        "deliteful/Select",
        "deliteful/Checkbox",
        "deliteful/RadioButton",
        "deliteful/ToggleButton",
        "deliteful/ViewStack",
        "xdeliteful/TabBar",
        "xdeliteful/MediaPlayer",
        "xdeliteful/Script",
        "deliteful/Accordion",
        "deliteful/Panel",
        'xblox/model/html/SetState',
        "requirejs-dplugins/css!Font-Awesome/css/font-awesome.css",
        "require"
    ],function(has,dcl,dHas,Deferred){

        has.add('xaction', function () {
            return true;
        });

        has.add('use-dcl', function () {
            return true;
        });

        has.add('embedded', function () {
            return true;
        });

        dHas.add('drivers', function () {
            return true;
        });
        dHas.add('devices', function () {
            return true;
        });
        dHas.add('xaction', function () {
            return true;
        });

        dHas.add('use-dcl', function () {
            return true;
        });
        
        dHas.add('runDrivers', function () {
            return true;
        });
        has.add('runDrivers', function () {
            return true;
        });

        bootx({
            delegate:null
        },Deferred);
    });
});