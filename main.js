var commander = require('commander');
var _path = require('path');
var os= require('os');
var sockjs= require('sockjs');
var sockjs_client= require('sockjs-client');
var colors= require('colors');
var ansi_to_html= require('ansi-to-html');
var ansi_up= require('ansi_up');
var progress= require('progress');
var request_progress= require('request-progress');
var walk= require('walk');
var readline= require('readline');
var deferred= require('deferred');
var safe= require('colors/safe');
var unzip= require('unzip');
var strip_ansi= require('strip-ansi');

var cwd = _path.resolve('./'),
    clientRoot =_path.resolve(cwd + '/../../Code/client/src/'),
    _dojoConfig = require('./dojoConfig'),
    initModule = "nxappmain/server-nexe-run";

global.moduleCache={
    "deferred":deferred,
    "strip-ansi":strip_ansi,
    "ansi-to-html":ansi_to_html,
    "ansi_up":ansi_up,
    "unzip":unzip,
    "commander":commander,
    "dojoConfig":_dojoConfig
};

var _re =require;

global['_'] = _re('lodash');

global['oriRequire'] = require;

var newRequire = function(args){
    if(args && global.moduleCache && global.moduleCache[args]){
        return global.moduleCache[args];
    }
    return global['oriRequire'](args);
};

require = newRequire;


global['nRequire'] = newRequire;
global['cwd'] = _path.resolve('./');

var logPath = _path.resolve('./logs');

commander
    .version('0.1.2')
    .option('-i, --info', 'return service profile')
    .option('-f, --file <path>', 'run a file')
    .option('-s, --system <name>', 'specify system data scope')
    .option('-j, --jhelp', 'output options as json');

commander.allowUnknownOption(true);
commander.parse(process.argv);

dojoConfig = _dojoConfig.createDojoConfig(logPath,initModule,commander,clientRoot);

dojoConfig.isBuild = true;
// Load dojo/dojo
var _dUrl = "./dojo/dojo.js";
_re(_dUrl);
