define([
    "xapp/build/main_build"
], function () {
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
        "xblox/RunScript",
        "xblox/CSSState",
        "xblox/StyleState",
        'delite/register',
        "deliteful/Button",
        "deliteful/Slider",
        "deliteful/Select",
        "deliteful/Combobox",
        "deliteful/Checkbox",
        "deliteful/RadioButton",
        "deliteful/ToggleButton",
        "require"
    ],function(has,dcl,dHas,Deferred){
        
        
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