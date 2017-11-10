var os= require('os');
/**
 * @param logPath
 * @param mainModule
 * @param commander
 * @param clientRoot
 */
function createDojoConfig(logPath,mainModule,commander,clientRoot){
    var libRoot = clientRoot + '/' + 'lib/';
    var dojoConfig = {
        libRoot:libRoot,
        cwd:__dirname,
        logRoot:logPath,
        commander:commander,
        clientRoot:clientRoot,
        hasCache: {
            "host-node": 1,
            "host-browser":0,
            "dom":0,
            "dojo-amd-factory-scan":0,
            "dojo-has-api":1,
            "dojo-inject-api":0,
            "dojo-timeout-api":0,
            "dojo-trace-api":0,
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
            'debug':false,
            'dojo-undef-api': true,
            "serialport":os.arch().indexOf('arm') ===-1
        },
        has:{
            'debug':false
        },
        trace: 1,
        async: 0,
        baseUrl: ".",
        packages: [
            {
                name: "dojo",
                location:"dojo"
            },
            {
                name: "nxappmain",
                location: "nxappmain"
            },
            {
                name: "node",
                location: "node"
            },
            {
                name: "nxapp",
                location: "nxapp"
            },
            {
                name: "xcf",
                location: libRoot +'xcf'
            },
            {
                name: "dstore",
                location: libRoot + 'dstore'
            },
            {
                name: "xide",
                location: libRoot + 'xide'
            },
            {
                name: "xwire",
                location: libRoot + 'xwire'
            },
            {
                name: "dcl",
                location: libRoot +'dcl'
            },
            {
                name: "xblox",
                location: libRoot + 'xblox'
            },
            {
                name: "xlog",
                location: libRoot + 'xlog'
            },
            {

                name: "xblox",
                location: libRoot + 'xblox'
            },
            {
                name: "dstore",
                location: libRoot + 'dstore'
            },
            {
                name: "dijit",
                location: libRoot + 'dijit'
            },
            {
                name: "xlang",
                location: libRoot + 'xlang'
            },
            {
                name: "xgrid",
                location: libRoot + 'xgrid'
            },
            {
                name: "xaction",
                location: libRoot + 'xaction/src'
            },
            {
                name: "xdojo",
                location: __dirname + '/compat/xdojo'
            }
        ],
        deps: mainModule ? [mainModule] : null
    };
    return dojoConfig;
}

module.exports.createDojoConfig = createDojoConfig;


