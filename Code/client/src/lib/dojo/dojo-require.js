var path = require('path');
function createDojoConfig(clientRoot,serverRoot,base,packages){
    dojoConfig = {
        cwd:__dirname,
        hasCache: {
            "host-node": 1,
            "host-browser":0,
            "dom":0,
            "dojo-amd-factory-scan":0,
            "dojo-has-api":1,
            "dojo-inject-api":0,
            "dojo-timeout-api":0,
            "dojo-trace-api":1,
            "dojo-log-api":0,
            "dojo-dom-ready-api":0,
            "dojo-publish-privates":1,
            "dojo-config-api":0,
            "dojo-sniff":1,
            "dojo-sync-loader":0,
            "dojo-test-sniff":0,
            "config-deferredInstrumentation":1,
            "config-useDeferredInstrumentation":"report-unhandled-rejections",
            "config-tlmSiblingOfDojo":1,
            'xlog':true,
            'xblox':true,
            'dojo-undef-api': true,
            "debug":true
        },
        trace: 1,
        async: 0,
        baseUrl: base || '.',
        packages: [
            {
                name: "dojo",
                location:"dojo"
            },
            {
                name: "nxappmain",
                location: serverRoot + path.sep + "nxappmain"
            },
            {
                name: "nxapp",
                location: "nxapp"
            },
            {
                name: "xcf",
                location: clientRoot + path.sep +'xcf'
            },
            {
                name: "dstore",
                location: clientRoot + path.sep + 'dstore'
            },
            {
                name: "xide",
                location: clientRoot + path.sep + 'xide'
            },
            {
                name: "xwire",
                location: clientRoot + path.sep + 'xwire'
            },
            {
                name: "dcl",
                location: clientRoot + path.sep +'dcl'
            },
            {
                name: "xblox",
                location: clientRoot + path.sep + 'xblox'
            },
            {
                name: "xlog",
                location: clientRoot + path.sep + 'xlog'
            },
            {
                name: "xblox",
                location: clientRoot + path.sep + 'xblox'
            },
            {
                name: "dstore",
                location: clientRoot + path.sep + 'dstore'
            },
            {
                name: "dijit",
                location: clientRoot + path.sep + 'dijit'
            },
            {
                name: "xlang",
                location: clientRoot + path.sep + 'xlang'
            },
            {
                name: "xgrid",
                location: clientRoot + path.sep + 'xgrid'
            },
            {
                name: "xaction",
                location: clientRoot + path.sep + 'xaction/src'
            },
            {
                name: "xdojo",
                location: clientRoot + path.sep + 'xdojo'
            }
        ],
        deps: ['dojo/moduleFetcher']
    };
    return dojoConfig;
}

module.exports = function(clientRoot,serverRoot,packages){
    dojoConfig = createDojoConfig(clientRoot,serverRoot,packages);
    require("./dojo.js");
    return amdRequire;
};

