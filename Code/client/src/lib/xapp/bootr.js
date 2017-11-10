define([
    "dcl/dcl",
    "requirejs-dplugins/has",
    "dojo/has",
    'dojo/Deferred'
], function (dcl,has,dHas,Deferred) {
    if(typeof logError==='undefined'){
        window['logError']=function(e,message){
            console.error('error '+message,e);
        }
    }
    require([
        "xblox/RunScript",
        "xblox/CSSState",
        "xblox/StyleState",
        'dojo/Deferred',
        "delite/register",
        "deliteful/Button",
        "deliteful/Slider",
        "deliteful/Combobox",
        "deliteful/Select",
        "deliteful/Checkbox",
        "deliteful/RadioButton",
        "deliteful/ToggleButton",
        "deliteful/ViewStack",
        "xdeliteful/TabBar",
        "deliteful/Accordion",
        "deliteful/Panel",
        "deliteful/LinearLayout",
        'dojo/Deferred',
        'xdojo/declare',
        "require"
    ],function(){

        has.add('xaction', function () {
            return true;
        });

        has.add('use-dcl', function () {
            return true;
        });

        has.add('runDrivers', function () {
            return true;
        });

        dHas.add('drivers', function () {
            return true;
        });
        dHas.add('runDrivers', function () {
            return true;
        });
        dHas.add('devices', function () {
            return true;
        });

        dHas.add('xaction', function () {
            return true;
        });

        dHas.add('php', function () {
            return true;
        });

        has.add('php', function () {
            return true;
        });

        dHas.add('use-dcl', function () {
            return true;
        });

        dHas.add('debug', function () {
            return true;
        });

        bootx({
            delegate:null
        },Deferred);
    });
});