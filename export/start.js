var fs = require('fs');
var path = require('path');
var util = require('util');
var exec = require('child_process');
var tracer = require('tracer');
var commander = require('commander');
var UTILS_ROOT = path.resolve('./');//Utils
var APP_ROOT = path.resolve('../../');//Control-Freak
var eol = require('os').EOL;
var extend = require('extend');

var _process = process;
var os = require('os');
var arch = os.arch();
var is32 = arch!=='x64';
var is64 = arch==='x64';
var lodash = require('lodash');
var userStopped = false;

var IS_WEB = false;
var IS_EXPORTED = false;

//collect pids here
var pids = [];
var options = {
    stdout: true,
    stderr: true,
    stdin: true,
    failOnError: true,
    stdinRawMode: false,
    //silent:false,
    callback:function(err, stdout, stderr){
        console.error('callback',arguments);
        if(err){
            console.error('-errror : '+err);
            return;
        }
        stdout.on('data', function(data) {
            console.log('stdout (' + childProcess.pid + '): ' + data);
            console.dir(data);
        });
    }
};

commander
    .version('0.0.1')
    .option('--mongo <ANY>', 'specify path to Mongo or set false to disable Mongo')
    .option('--nginx  <ANY>', 'specify path to NGINX or set false to disable NGINX')
    .option('--user  <ANY>', 'specify path to user directory')
    .option('--system  <ANY>', 'specify path to system directory')
    .option('--mqtt  <ANY>', 'enable/disable MQTT (requires Mongo)')
    .option('--web  <ANY>', 'enable web-server mode by setting this to true/false')
    .option('--export  <ANY>', 'set true/false to enable "exported mode" ')



commander.allowUnknownOption(true);
commander.parse(_process.argv);

/////////////////////////////////////////////////////////////////////////////////////////////
//
// Device Server Switches
//


/////////////////////////////////////////////////////////////////////////////////////////////
//
// MONGO Switches
//
var START_MONGO = true;
var MONGO_PATH = null;
if(commander.mongo==='false'){
    START_MONGO = false;
}else if(lodash.isString(commander.mongo)){
    MONGO_PATH = commander.mongo;
}

/////////////////////////////////////////////////////////////////////////////////////////////
//
// NGINX Switches
//
var START_NGINX = true;
var NGINX_PATH = null;
if(commander.nginx==='false'){
    START_NGINX = false;
}else if(lodash.isString(commander.NGINX)){
    NGINX_PATH = commander.nginx;
}


var defaultConfig = {
    "nginx":{
        "port":"8887"
    }
};
/////////////////////////////////////////////////////////////////////////////////////////////
//
// Utils
//
function readJson(file) {

    if(!fs.existsSync(file)){
        return null;
    }
    var str = fs.readFileSync(file,'utf8');
    var result = {};
    try{
        result = JSON.parse(str);
    }catch(e){
        console.error('Error reading file : '+file,e);
    }
    return result;

}
var console = console;
if(tracer){
    console = tracer.colorConsole({
        format : "{{title}}: {{message}}",
        dateformat : "HH:MM:ss.L"
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////
//
// platform
//
var OS = "linux";
if(os.platform() ==='win32'){
    OS = 'windows';
}else if(os.platform() ==='darwin'){
    OS = 'osx';
}else if(os.arch() === 'arm'){
    OS = 'arm';
}

if(OS==='linux'){
    if(is32){
        arch = "_32";
    }else if(is64){
        arch = "_64";
    }
}else {
    arch ="";
}

var config = defaultConfig;

if(!Array.prototype.remove){
    Array.prototype.remove= function(){
        var what, a= arguments, L= a.length, ax;
        while(L && this.length){
            what= a[--L];
            if(this.indexOf==null){
                break;
            }
            while((ax= this.indexOf(what))!= -1){
                this.splice(ax, 1);
            }
        }
        return this;
    };
}
/////////////////////////////////////////////////////////////////////////////////////////////
//
// Server - Configs
//
var NGINX_EXE = path.resolve(NGINX_PATH ? path.resolve(NGINX_PATH) : APP_ROOT+'/nginx/nginx-' + OS + arch);

var NGINX_ARGS = ["-p", APP_ROOT + path.sep + 'nginx' + path.sep,"-c",path.resolve(APP_ROOT+'/nginx/nginx.conf')];
var nginx;
//----------------
var DEVICE_SERVER = path.resolve(UTILS_ROOT +'/server');

var USER_SCOPE_PATH = (commander.user || path.resolve(APP_ROOT +'/www/user'));
var SYSTEM_SCOPE_PATH = (commander.system || path.resolve(APP_ROOT +'/www/'));

if(commander.web==='true'){
    IS_WEB = true;
    DEVICE_SERVER = "node";
}
if(commander.export==='true'){
    IS_EXPORTED = true;
}
var DEVICE_SERVER_ARGS = ['noob','--serverSide=true'];
if(IS_EXPORTED){
    DEVICE_SERVER_ARGS = ['noob','--serverSide=true','--user='+USER_SCOPE_PATH,'--system='+SYSTEM_SCOPE_PATH];
}
var deviceServer = null;

//----------------
var MONGO_SERVER = path.resolve(MONGO_PATH ? path.resolve(MONGO_PATH) : APP_ROOT+'/mongo/mongod-'+OS +arch);
var MONGO_SERVER_ARGS = ["--smallfiles","--quiet","--dbpath", path.resolve(APP_ROOT + '/data/_MONGO'), "--storageEngine=mmapv1" , '--port=%mongo_port%'];
var mongo;

if(OS==='arm'){
    MONGO_SERVER_ARGS.remove("--storageEngine=mmapv1");
}

function startDeviceServer(){

    if(!deviceServer) {
        var deviceServerOptions =extend({
            cwd: path.resolve(UTILS_ROOT)
        }, options);

        function reststart(){
            deviceServer = start(DEVICE_SERVER, DEVICE_SERVER_ARGS, deviceServerOptions, "Device - Server");
            return deviceServer;
        }
        deviceServerOptions.restart = reststart;
        deviceServer = reststart();
    }else{
        console.warn("Device Server already created, wait please. Mongo didnt fire ready yet");
    }
}
function mongoReady(){
    startDeviceServer();
}

function maybeQuote(a) {
    if (a.indexOf(' ') != -1) {
        a = a.replace(' ', '\ ');
    }
    return a;
}

function start(exce_path,args,options,name){
    
    if(OS!=="windows") {
        try {
            exec.execFile('chmod', ['+x', exce_path]);
        }catch(e){}
    }

    if(OS=='windows' && exce_path.indexOf('.exe')===-1){
        exce_path+='.exe';
    }

    if(!fs.existsSync(exce_path)){
        console.error("Sorry, but cant start "+name +'. ' +exce_path +' doesnt exists!');
        return;
    }

    options.path = exce_path;
    options.name = name;

    var env = Object.create(_process.env);
    options.env = env;

    for (var i = 0; i < args.length; i++) {
        args[i] = maybeQuote(args[i]);

    }
    console.info('Start '+ name + ' @ ' + exce_path + ' ' + args.join(' '));

    var process = exec.spawn(exce_path, args || [],options, function (err, stdout, stderr) {
        if (typeof options.callback === 'function') {
            options.callback.call(this, err, stdout, stderr);
        } else {
            if (err && options.failOnError) {
                console.error('Error : ',err);
            }
        }
    }.bind(this));

    process.stdout.on('data',function(data){

        var str = data.toString();

        if(options.silent!==true) {
            console.debug('stdout data (pid:' + process.pid + ' name:' + name + '):');
            console.log(name +'\n\t' + str);
        }

        if(options.already && str.indexOf(options.already)!==-1){
            console.warn('Abort '+options.name +' , seems already running.');
            pids.remove(process);
            options.killed=true;
            if(options.alreadyCallback){
                options.alreadyCallback();
            }
        }
        if(options.ready && options.readyCB && str.indexOf(options.ready)!==-1){
            options.readyCB();
        }

    });
    process.stderr.on('data',function(data){
        console.debug('stderr data (pid:' + process.pid + ' name:' + name + '):');
        var str = data.toString();
        var newStr = String(str).split(eol).join(eol + '\t');
        console.log(name + '\n\t' + newStr);
        if(options.already && str.indexOf(options.already)!==-1){
            console.warn('Abort '+options.name+' , seems already running.');
            pids.remove(process);
            options.killed=true;
            if(options.alreadyCallback){
                options.alreadyCallback();
            }
        }
    });
    process.on('close', function(code){
        console.debug('Child process ' + options.name + ' ' + ' exited with code ' + code);
        options.background!==true && pids.remove(process);
        if(options.restart && userStopped!==true){
            console.debug('\t Restart : ' + options.name);
            options.restart();
        }
    });
    process.options = options;
    pids.push(process);


    var pidFilePath = APP_ROOT+ path.sep + "_" + options.name + '.pid';
    try {
        fs.writeFileSync(pidFilePath, "{name:" + process.pid + "}");
    }catch(e){
        console.log('cant write pid file',e);
    }


    return process;
}
/////////////////////////////////////////////////////////////////////////////////////////////
//
// Server instances
//

console.log('---start servers ' + IS_WEB + ' ' + DEVICE_SERVER);

if(!IS_WEB) {

    START_NGINX && (nginx = start(NGINX_EXE, NGINX_ARGS, extend({
        kill: NGINX_EXE,
        killCWD: APP_ROOT,
        killArgs: ['-s', 'stop'].concat(NGINX_ARGS),
        background:true
    }, options), "NGINX"));

    START_MONGO && (mongo = start(MONGO_SERVER, MONGO_SERVER_ARGS, extend({
        cwd: APP_ROOT + '',
        already: "Address already in use",
        silent: true,
        alreadyCallback: mongoReady,
        ready: "waiting for connections on port",
        readyCB: mongoReady
    }, options), "Mongo"));

    if(!START_MONGO){
        startDeviceServer();
    }

}else{

    DEVICE_SERVER = process.execPath;

    DEVICE_SERVER_ARGS = ['main.js'];
    
    var deviceServerOptions = extend({
        cwd: path.resolve(UTILS_ROOT)
    }, options);

    function reststart(){
        deviceServer = start(DEVICE_SERVER, DEVICE_SERVER_ARGS, deviceServerOptions, "Device - Server");
        return deviceServer;
    }
    deviceServerOptions.restart = reststart;
    deviceServer = reststart();

}

/////////////////////////////////////////////////////////////////////////////////////////////
//
// Keep running and end child processes on SIGINT
//
process.stdin.resume();
process.on('SIGINT', function() {
    userStopped = true;
    console.log('received kill signal, stopping ' + pids.length + ' processes');
    for (var i = 0; i < pids.length; i++) {
        var obj = pids[i];
        var options = obj.options;
        console.log('Stopping '+options.name + ' pid '+obj.pid);
        var pidFilePath = APP_ROOT+ path.sep + "_" + options.name + '.pid';
        try {
            fs.unlinkSync(pidFilePath, process.pid);
        }catch(e){
            console.log('cant delete pid file ' + pidFilePath,e);
        }
        //has own kill
        if(obj.options.kill){
            console.log('Stopping '+options.name + ' @ ' + obj.options.kill + ' ' + obj.options.killArgs.join(" "));
            exec.spawn(obj.options.kill,obj.options.killArgs,extend({
                cwd:obj.options.killCWD
            },obj.options),obj.options.killArgs);
            continue;
        }
        try {
            obj.kill(obj.pid);
        }catch(e){
            console.error('error killing '+options.name,e);
        }
    }
    //kill us in latestly 5 secs
    setTimeout(function(){
        process.exit();
    },5000);
});
