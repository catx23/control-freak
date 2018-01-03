'use strict';

const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const assert = require('assert');

const pullout = require('pullout/legacy');
const through = require('through2');
const iconv = require('iconv-lite');

const WIN = process.platform === 'win32';
const WIN_VOLUME = '^[a-z]{1}:$';

const chcp = store();

const CHCP = 'cp437';

exports.getVolumes = getVolumes;
exports.prepareCodePage = prepareCodePage;

exports.isVolume = isVolume;
exports.isChangeVolume = isChangeVolume;
exports.unicodify = unicodify;

function unicodify() {
    if (!WIN || chcp() === '65001')
        return through();
   
    return iconv.decodeStream(`cp${chcp() || CHCP}`);
}

function getVolumes(callback) {
    const wmic = spawn('wmic', ['logicaldisk', 'get', 'name']);
   
    assert(callback, 'callback could not be empty!');
    
    /* stream should be closed on win xp*/
    wmic.stdin.end();
    
    pullout(wmic.stdout, 'string', function(error, data) {
        if (error)
            callback(error);
        else
            parse(data, callback);
    });
    
    wmic.stderr.on('data', callback);
    wmic.on('error', callback);
}

function parse(data, callback) {
    const strDrop = /Name|\r| |\n/g;
    
    if (!data)
        return callback(null, []);
    
    const volumes = data
        .replace(strDrop, '')
        .split(':');
    
    volumes.pop();
    
    callback(null, volumes);
}

function prepareCodePage() {
    /* if we on windows and command is built in
     * change code page to unicode becouse
     * windows use unicode on non English versions
     */
     
    if (process.platform !== 'win32')
        return;
        
    getCodePage((codepage) => {
        if (!codepage)
            return;
        
        process.on('SIGINT', () => {
            exec('chcp ' + codepage, () => {
                process.exit();
            });
        });
        
        exec('chcp 65001', () => {
            getCodePage(chcp);
        });
    });
}

function getCodePage(callback) {
    exec('chcp', (error, stdout, stderror) => {
        if (error || stderror || !stdout)
            return;
        
        const index = stdout.indexOf(':');
        const codepage = stdout
            .slice(index + 2)
            .replace('\r\n', '');
        
        callback(codepage);
    });
}

function isVolume(command) {
    assert(command, 'command could not be empty!');
    
    if (!WIN)
        return;
        
    const winVolume = new RegExp(WIN_VOLUME + '\\\\.*', 'i');
    return command.match(winVolume);
}

function isChangeVolume(command) {
    assert(command, 'command could not be empty!');
    
    if (!WIN)
        return;
    
    const winVolume = new RegExp(WIN_VOLUME, 'i');
    return command.match(winVolume);
}

function store() {
    let data;
    
    return (value) => {
        if (value)
            data = value;
        
        return data;
    };
}

