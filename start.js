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
var which = require('which');


var _process = process;
var os = require('os');
var arch = os.arch();
var is32 = arch!=='x64';
var is64 = arch==='x64';
var lodash = require('lodash');
var osTmpdir = require('os-tmpdir');
var userStopped = false;

var IS_WEB = false;
var IS_EXPORTED = false;
var AUTO_DETECT = false;

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
	.option('--php  <ANY>', 'specify path to PHP or or set false to disable PHP')
	.option('--user  <ANY>', 'specify path to user directory')
	.option('--build  <ANY>', 'is build version')
	.option('--detect  <ANY>', 'specify path to user directory')
	.option('--system  <ANY>', 'specify path to system directory')
    .option('--root  <ANY>', 'specify root directory')
	.option('--mqtt  <ANY>', 'enable/disable MQTT (requires Mongo)')
	.option('--web  <ANY>', 'enable web-server mode by setting this to true/false')
	.option('--exported  <ANY>', 'set true/false to enable "exported mode" ');

commander.allowUnknownOption(true);
commander.parse(_process.argv);

AUTO_DETECT = commander.detect==='true';


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
var NODE_PATH = null;

if(commander.mongo==='false'){
	START_MONGO = false;
}else if(lodash.isString(commander.mongo)){
	MONGO_PATH = commander.mongo;
}else if(AUTO_DETECT){
	MONGO_PATH = which.sync('mongod');
}
/////////////////////////////////////////////////////////////////////////////////////////////
//
// NGINX Switches
//
var START_NGINX = true;
var START_PHP = true;
var NGINX_PATH = null;
if(commander.php==='false') {
	START_PHP = false;
}
if(commander.nginx==='false'){
	START_NGINX = false;
}else if(lodash.isString(commander.NGINX)){
	NGINX_PATH = commander.nginx;
}else if(AUTO_DETECT){
	NGINX_PATH = which.sync('nginx');
}


var defaultConfig = {
	"php":{
		"port":"9012"
	},
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
var console = global['console'];
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
var config = readJson(path.resolve('./config.json')) || defaultConfig;

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
var NGINX_EXE = path.resolve(NGINX_PATH ? path.resolve(NGINX_PATH) : APP_ROOT+'/nginx-' + OS + arch);

var NGINX_ARGS = ["-p", APP_ROOT + path.sep,"-c",path.resolve(APP_ROOT+'/conf/nginx.conf'),"-g",'pid ' + APP_ROOT + path.sep + 'nginx.pid;daemon off;'];
var nginx;
//----------------
var PHP_CGI = path.resolve(APP_ROOT +'/php/php-cgi');
if(AUTO_DETECT){
	PHP_CGI = which.sync('php-cgi');
}
var PHP_CGI_ARGS = ["-b","127.0.0.1:" + config.php.port];
var php;
//----------------
var DEVICE_SERVER = path.resolve(UTILS_ROOT +'/server');

if(commander.web==='true'){
	IS_WEB = true;
	DEVICE_SERVER = "node";
	if(AUTO_DETECT){
		DEVICE_SERVER = which.sync('node');
	}
}
if(commander.export==='true'){
	IS_EXPORTED = true;
}

var ROOT = commander.root || './';
var BUILD = commander.build;

var USER_SCOPE_PATH = (commander.user || path.resolve(APP_ROOT + (IS_EXPORTED ? '/www/user' : '/user')));
var SYSTEM_SCOPE_PATH =(commander.system || path.resolve(APP_ROOT + (IS_EXPORTED ? '/www/' : '/data')));
var DEVICE_SERVER_ARGS = ['noob'];
if(IS_EXPORTED){
	DEVICE_SERVER_ARGS = ['noob','--serverSide=true','--user='+USER_SCOPE_PATH,'--system='+SYSTEM_SCOPE_PATH,'--root='+ROOT,'--build='+BUILD];
}
var deviceServer = null;
//----------------
var MONGO_SERVER = path.resolve(MONGO_PATH ? path.resolve(MONGO_PATH) : APP_ROOT+'/mongo/mongod-'+ OS +arch);
var MONGO_SERVER_ARGS = ["--smallfiles","--quiet","--dbpath", path.resolve(APP_ROOT + '/data/_MONGO'), "--storageEngine=mmapv1"];
var mongo;

if(arch.indexOf('64')!==-1){
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

function startDeviceServer2(){
	if(!deviceServer) {

		var deviceServerOptions =extend({
			cwd: path.resolve(UTILS_ROOT)
		}, options);
		DEVICE_SERVER = which.sync('node');
		DEVICE_SERVER_ARGS = ['main.js','--user='+USER_SCOPE_PATH,'--system='+SYSTEM_SCOPE_PATH,'--root='+ROOT,'--build='+BUILD];
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
				console.error('--err ',err);
			}
			//options.callback();
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
	var pidFilePath = osTmpdir() + path.sep + options.name + '.pid';
	try {
		fs.writeFileSync(pidFilePath, process.pid);
	}catch(e){
		console.log('cant write pid file',e);
	}


	return process;
}

/////////////////////////////////////////////////////////////////////////////////////////////
//
// Server instances
//

if(AUTO_DETECT){
	IS_WEB = false;
	startDeviceServer = startDeviceServer2;
}
if(!IS_WEB) {
	START_NGINX && (nginx = start(NGINX_EXE, NGINX_ARGS, extend({
		kill: NGINX_EXE,
		killCWD: APP_ROOT,
		killArgs: ['-s', 'stop'].concat(NGINX_ARGS),
		background:true
	}, options), "NGINX"));

	START_PHP && (php = start(PHP_CGI, PHP_CGI_ARGS, extend({
		cwd: !AUTO_DETECT ? path.resolve(APP_ROOT + '/php/') : "",
		already: "Address already in use"
	}, options), "PHP"));

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
	DEVICE_SERVER_ARGS = ['main.js','--user='+USER_SCOPE_PATH,'--system='+SYSTEM_SCOPE_PATH];
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
		var pidFilePath = osTmpdir() + path.sep + options.name + '.pid';
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
			//console.error('error killing '+options.name,e);
		}
	}
	//kill us in latestly 5 secs
	setTimeout(function(){
		process.exit();
	},5000);
});
