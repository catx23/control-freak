var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var unzip = require('unzip');
var tracer = require('tracer');
var progress = require('request-progress');
var ProgressBar = require('progress');
var commander = require('commander');
var util = require('util');
var exec = require('child_process').exec;
var windows = process.platform.indexOf("win") === 0;
function clear()
{
    var i,lines;
    var stdout = "";
    
    if (windows === false)
    {
        stdout += "\x1B[2J";
    }
    else
    {
        lines = process.stdout.getWindowSize()[1];
        
        for (i=0; i<lines; i++)
        {
            stdout += "\r\n";
        }
    }
    
    // Reset cursur
    stdout += "\x1B[0f";
    
    process.stdout.write(stdout);
}

commander
    .version('0.0.1')
    .option('-t, --to <path>', 'destination')
    .option('-f, --file <path>', 'run a file')
    .option('-u, --url <path>', 'the download url');

commander.allowUnknownOption(true);
commander.parse(process.argv);

var console = tracer.colorConsole({
    format : "<{{title}}> {{message}}",
    dateformat : "HH:MM:ss.L"
});
var _url = commander.url || 'http://net-commander.com/?ddownload=3581';
var _to = path.resolve('./download.zip');
// The options argument is optional so you can omit it
var bar = null;

clear();

var unzipFolder = './update';

console.info('Download ' + _url + ' to ' + _to);

var destination = path.resolve(commander.to || '../../../../');
/**
 *
 */
function finish(){
    console.info('Download finish, extracting');
    bar && bar.terminate();
    unzipArchive(_to,unzipFolder);
}
/**
 *
 * @param err
 */
function error(err){
    console.error('Error downloading file '+ _url,err)
}
/**
 *
 * @param secs
 * @returns {string}
 */
function toHHMMSS(secs) {
    var date = new Date(secs * 1000);
    var hh = date.getUTCHours();
    var mm = date.getUTCMinutes();
    var ss = date.getSeconds();
    // If you were building a timestamp instead of a duration, you would uncomment the following line to get 12-hour (not 24) time
    // if (hh > 12) {hh = hh % 12;}
    // These lines ensure you have two-digits
    if (hh < 10) {hh = "0"+hh;}
    if (mm < 10) {mm = "0"+mm;}
    if (ss < 10) {ss = "0"+ss;}
// This formats your string to HH:MM:SS
    return  hh+":"+mm+":"+ss;
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
function updateBar(len,duration,now,tokens) {
    if(!bar && len>0) {
        bar = new ProgressBar('  downloading [:bar] :percent Remaining :time | :size of :sizeTotal | Speed: :speed / sec' , {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: len
        });
    }
    bar && bar.tick(now,tokens);
}

var _t0 = 0;
var total = null;

function download(_url) {

    process.stdout.write("\u001b[2J\u001b[0;0H");

    progress(request(_url), {
        throttle: 1000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        delay: 100                       // Only start to emit after 1000ms delay, defaults to 0ms
        //lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    }).on('progress', function (state) {
        // The state is an object that looks like this:
        // {
        //     percentage: 0.5,            // Overall percentage (between 0 to 1)
        //     speed: 554732,              // The download speed in bytes/sec
        //     size: {
        //         total: 90044871,        // The total payload size in bytes
        //         transferred: 27610959   // The transferred payload size in bytes
        //     },
        //     time: {
        //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
        //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
        //     }
        // }
        if(!_t0){
            console.info('....downloading around 200MB...grab some coffee! \n');
            _t0++;
        }
        if(!state.size.total && total){
            state.size.total = total;
        }
        if (state.size.total) {
            updateBar(state.size.total, null, state.size.transferred / 100, {
                size: bytesToSize(state.size.transferred),
                sizeTotal: bytesToSize(state.size.total),
                speed: bytesToSize(state.speed),
                time: toHHMMSS(state.time.remaining)
            });
        }
    }).on('error', function (err) {error(err);})
        .on('response', function (response) {
            var len = parseInt(response.headers['content-length'], 10);
            if(len){
                total = len;
            }
        })
        .on('end', function () {
            finish();
        }).pipe(fs.createWriteStream(_to));
}

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
function getFilesizeInBytes(filename) {
    if( fs.existsSync(filename) ) {
        var stats = fs.statSync(filename)
        var fileSizeInBytes = stats["size"];
        return fileSizeInBytes
    }

    return false;
}
var showDiff = true;

function unzipArchive(what,where){
    deleteFolderRecursive(where);
    fs.mkdirSync('./update', 0777, function(err){
        if(err){
            console.log('Error deleting ' +where,err);
        }
    });
    console.log('Extract into ' + destination);
    fs.createReadStream(what)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            var fileName = entry.path;
            var type = entry.type; // 'Directory' or 'File'
            var size = entry.size;
            var parts = fileName.split('/');
            var relative = parts.join(path.sep);
            var dest = path.resolve(destination +'/'+relative);
            if(showDiff && dest && type ==='File' && relative) {

                var sizeD = getFilesizeInBytes(dest);
                var diff = sizeD - size;
                if(sizeD && sizeD!==size && Math.abs(diff)>300){
                    console.info('Have update for : ' + diff +' ' + relative);
                }
            }else{
                if( showDiff && !fs.existsSync(dest) && type ==='File' ) {
                    console.log('new ' + relative);
                }
            }


            var dest2 = destination + path.sep + relative;
            var destPath = path.dirname(dest2);
            if( !fs.existsSync(destPath) ) {
                console.error('dest path doesnt exists '+destPath);
                mkdirp(destPath);                
            }
            var debug  = false;
            var canWrite = true;

            try{
                var exists = fs.existsSync(dest2);
                var dstIsDir = exists && !fs.lstatSync(dest2).isFile();
                var dstIsFile = exists && fs.lstatSync(dest2).isFile();
                var dstFileExists = dstIsFile && fs.existsSync(dest2);
                var isNativeModule = false;
                if(dstFileExists){
                    if(dest2.indexOf('.node') !==-1 && dest2.indexOf('Release')!==-1){
                        canWrite=false;
                        isNativeModule = true;
                    }
                    try{                    
                        fs.accessSync(dest2, fs.W_OK);
                    }catch(e){
                        canWrite=false;
                    }
                }

                
                if(!canWrite){
                    console.error('Cant write ' + dest2);
                    return;
                }
                if (type =='File' && !dstIsDir) {
                    debug && console.log('write '+relative + ' to ' + dest2 + ' exists ' + dstFileExists);
                    try{
                        entry.pipe(fs.createWriteStream(dest2));
                    }catch(e){
                        consol.error('error extracting '+ fileName + ' to ' + dest2);
                    }
                }else{
                    entry.autodrain();
                }
            }catch(e){
                console.error('---error ',e);
            }
        });

}
download(_url);
//unzipArchive(_to,unzipFolder);