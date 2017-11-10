/**
 * This file is used to reconfigure parts of the loader at runtime for this application. We’ve put this extra
 * configuration in a separate file, instead of adding it directly to index.html, because it contains options that
 * can be shared if the application is run on both the client and the server.
 *
 * If you aren’t planning on running your app on both the client and the server, you could easily move this
 * configuration into index.html (as a dojoConfig object) if it makes your life easier.
 */
require({
    // The base path for all packages and modules. If you don't provide this, baseUrl defaults to the directory
    // that contains dojo.js. Since all packages are in the root, we just leave it blank. (If you change this, you
    // will also need to update app.profile.js).
    //baseUrl: '.',

    // A list of packages to register. Strictly speaking, you do not need to register any packages,
    // but you can't require "app" and get app/main.js if you do not register the "app" package (the loader will look
    // for a module at <baseUrl>/app.js instead). Unregistered packages also cannot use the packageMap feature, which
    // might be important to you if you need to relocate dependencies. TL;DR, register all your packages all the time:
    // it will make your life easier.
    packages: [
        // If you are registering a package that has an identical name and location, you can just pass a string
        // instead, and it will configure it using that string for both the "name" and "location" properties. Handy!
        'dojo',
        'dijit',
        'dojox',
        {
            name: 'xgrid',
            location: 'xgrid',
            packageMap: {}
        },
        {
            name: 'xapp',
            location: 'xapp',
            packageMap: {}
        },
        {
            name: 'xcf',
            location: 'xcf',
            packageMap: {}
        },
        {
            name: 'dgrid',
            location: 'dgrid',
            packageMap: {}
        },
        {
            name: 'xide',
            location: 'xide',
            packageMap: {}
        },
        {
            name: 'xideve',
            location: 'xideve',
            packageMap: {}
        },
        {
            name: 'xblox',
            location: 'xblox',
            packageMap: {}
        },
        {
            name: 'xfile',
            location: 'xfile',
            packageMap: {}
        },
        {
            name: 'xlog',
            location: 'xlog',
            packageMap: {}
        },
        {
            name: 'xlang',
            location: 'xlang',
            packageMap: {}
        },
        {
            name: 'dstore',
            location: 'dstore',
            packageMap: {}
        },
        {
            name: 'xace',
            location: 'xace',
            packageMap: {}
        },
        {
            name: 'xnode',
            location: 'xnode',
            packageMap: {}
        },
        {
            name: 'xdocker',
            location: 'xdocker',
            packageMap: {}
        },
        {
            name: 'xwire',
            location: 'xwire',
            packageMap: {}
        },
        {
            name: 'dcl',
            location: 'dcl',
            packageMap: {}
        },
        {
            name: 'xdojo',
            location: 'xdojo/build',
            packageMap: {}
        },
        {
            name: 'wcDocker',
            location: 'wcDocker/src',
            packageMap: {}
        },
        {
            name: 'xaction',
            location: 'xaction/src',
            packageMap: {}
        },
        {
            name: 'xconsole',
            location: 'xconsole/src',
            packageMap: {}
        },
        'xtest'
    ],

    // This is a hack. In order to allow app/main and app/run to be built together into a single file, a cache key needs
    // to exist here in order to force the loader to actually process the other modules in the file. Without this hack,
    // the loader will think that code for app/main has not been loaded yet and will try to fetch it again, resulting in
    // a needless extra HTTP request.
    cache: {}
// Require 'app'. This loads the main application file, app/main.js.
}, ['xtest']);
