/**
 * This file is used to reconfigure parts of the loader at runtime for this application. We’ve put this extra
 * configuration in a separate file, instead of adding it directly to index.html, because it contains options that
 * can be shared if the application is run on both the client and the server.
 *
 * If you aren’t planning on running your app on both the client and the server, you could easily move this
 * configuration into index.html (as a dojoConfig object) if it makes your life easier.
 */
function __getLocation(name,_default){
    if(typeof location !=='undefined'){
        if(location.href.indexOf(name +'=' + 'release')!==-1){
            return 'build/' + name + '-release/' + name;
        }else if(location.href.indexOf(name +'=' + 'debug')!==-1){
            return name;
        }
        if(_default === 'release'){
            return 'build/' + name + '-release/' + name;
        }
    }

    return _default || name;


}
function __getLocation2(name,_default,offset){
    if(typeof location !=='undefined'){

        offset  = offset || "";
        if(location.href.indexOf(name +'=' + 'release')!==-1){
            return name + '/build/';
        }else if(location.href.indexOf(name +'=' + 'debug')!==-1){
            return name + '/' + offset;
        }
        if(_default === 'release'){
            return '../build/' + name;
        }
    }

    return _default || name;


}
require({
    // The base path for all packages and modules. If you don't provide this, baseUrl defaults to the directory
    // that contains dojo.js. Since all packages are in the root, we just leave it blank. (If you change this, you
    // will also need to update app.profile.js).

    // A list of packages to register. Strictly speaking, you do not need to register any packages,
    // but you can't require "xbox" and get xbox/main.js if you do not register the "xbox" package (the loader will look
    // for a module at <baseUrl>/xbox.js instead). Unregistered packages also cannot use the packageMap feature, which
    // might be important to you if you need to relocate dependencies. TL;DR, register all your packages all the time:
    // it will make your life easier.
    packages: [
        // If you are registering a package that has an identical name and location, you can just pass a string
        // instead, and it will configure it using that string for both the "name" and "location" properties. Handy!
        {
            name: 'dojo',
            location: 'dojo',
            packageMap: {}
        },
        {
            name: 'core',
            location: 'core/_build/src',
            packageMap: {}
        },
        {
            name: 'xgrid',
            _location: 'xgrid',
            location: __getLocation2('xgrid','release'),
            packageMap: {}
        },
        {
            name: 'xlog',
            location: __getLocation2('xlog','release'),
            packageMap: {}
        },
        {
            name: 'xnode',
            location: __getLocation2('xnode','release'),
            packageMap: {}
        },
        {
            name: 'dijit',
            location: 'dijit',
            packageMap: {}
        },
        {
            name: 'orion',
            _location: 'build/orion-release/orion',
            location: 'orion',
            packageMap: {}
        },
        {
            name: 'dojox',
            location:'dojox',
            packageMap: {}
        },
        {
            name: 'xapp',
            location: 'xapp',
            packageMap: {}
        },
        {

            name: 'xas',
            location: 'xas',
            packageMap: {}
        },
        {
            name: 'xbox',
            location: 'xbox',
            packageMap: {}
        },

        {
            name: 'xappconnect',
            location: 'xappconnect',
            packageMap: {}
        },
        {
            name: 'xide',
            location: 'xide',
            packageMap: {}
        },
        {
            name: 'dgrid',
            location: __getLocation2('dgrid','release'),
            packageMap: {}
        },
        {
            name: 'put-selector',
            location: 'put-selector',
            packageMap: {}
        },
        {
            name: 'xstyle',
            location: 'xstyle',
            packageMap: {}
        },
        {
            name: 'xfile',
            _location: 'build/xfile-release/xfile',
            __location: 'xfile',
            location: __getLocation2('xfile','release'),
            packageMap: {}
        },
        {
            name: 'xblox',
            location: 'xblox',
            //location: __getLocation2('xblox','release'),
            packageMap: {}
        },
        {
            name: 'xcf',
            location: 'xcf',
            packageMap: {}
        },
        {
            name: 'davinci',
            location: 'davinci',
            //_location: 'build/davinci-release/davinci',
            //location: __getLocation2('davinci','release'),
            packageMap: {}
        },
        {
            name: 'xideve',
            location: 'xideve',
            _location: 'build/xideve-release/xideve',
            packageMap: {}
        },
        {
            name: 'system',
            location: 'system',
            packageMap: {}
        },
        {
            name: 'preview',
            location: 'preview',
            packageMap: {}
        },
        {
            name: 'xwire',
            location: __getLocation2('xwire','release'),
            packageMap: {}
        },
        {
            name: 'xexpression',
            location: 'xexpression',
            packageMap: {}
        },
        {
            name: 'ace',
            location: '../xfile/ext/ace',
            packageMap: {}
        },
        {
            name: 'liaison',
            location: 'ibm-js/liaison',
            packageMap: {}
        },
        {
            name: 'decor',
            location: 'ibm-js/decor',
            packageMap: {}
        },
        {
            name: 'dmodel',
            location: 'dmodel',
            packageMap: {}
        },
        {
            name: 'requirejs-dplugins',
            location: 'requirejs-dplugins'
        },
        {
            name: 'xdocker',
            //location: __getLocation2('xdocker','release'),
            location:'xdocker',
            packageMap: {}
        },
        {
            name: 'xace',
            location: __getLocation2('xace','release','src'),
            packageMap: {}
        },
        {
            name: 'wcDocker',
            //location: __getLocation2('wcDocker','release','src'),
            //location: __getLocation2('wcDocker','debug','src'),
            location:'wcDocker/src',
            packageMap: {}
        },
        {
            name: 'xlang',
            location: 'xlang',
            packageMap: {}
        },
        {
            name: 'xcf',
            location: 'xcf',
            packageMap: {}
        },
        {
            name: 'xaction',
            location: __getLocation2('xaction','release','src'),
            //location: 'xaction/src',
            packageMap: {}
        },
        {
            name: 'xconsole',
            location: 'xconsole/src',
            packageMap: {}
        },
        'xtest'
    ],
    cache: {}
// Require 'xbox'. This loads the main application file, xbox/main.js.
}, ['xtest']);
