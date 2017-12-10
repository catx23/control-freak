'use strict';

var fs = require('fs');
var path = require('path');

var size = require('trammel');
var time = require('timem');
var check = require('checkup');
var copymitter = require('copymitter');
var remy = require('remy');
var mkdir = require('mkdirp');

var readify = require('readify/legacy');
var win = require('win32/legacy');

var flop = exports;

var isWin = process.platform === 'win32';

exports.create = function(path, callback) {
    check
        .type('path', path, 'string')
        .type('callback', callback, 'function');
    
    mkdir(path, callback);
};

exports.read = function(path, type, options, callback) {
    if (!callback && !options) {
        callback = type;
        options = {};
    } else if (!callback) {
        callback = options
        options = {}
    };
    
    check
        .type('path', path, 'string')
        .type('callback', callback, 'function');
    
    switch (type) {
    case 'size':
        size(path, callback);
        break;
    
    case 'size raw':
        size(path, {type: 'raw'}, callback);
        break;
    
    case 'time':
        time(path, callback);
        break;
        
    case 'time raw':
        time(path, 'raw', callback);
        break;
    
    case 'raw':
        options.type = 'raw'
        readify(path, options, callback);
        break;
    
    default:
        if (isWin && path === '/')
            return getRoot(callback);
      
        readify(path, options, callback);
        break;
    }
};

exports.delete  = function(path, files, callback) {
    var wasError;
    
    if (!callback) {
        callback    = files;
        files       = null;
    }
    
    check
        .type('path', path, 'string')
        .type('callback', callback, 'function');
    
    var rm = remy(path, files);
    
    rm.on('error', function(error) {
        callback(error);
        wasError = true;
        rm.abort();
    });
    
    rm.on('end', function() {
        if (!wasError)
            callback();
    });
};

exports.move    = function(from, to, callback) {
    check
        .type('from', from, 'string')
        .type('to', to, 'string')
        .type('callback', callback, 'function');
    
    fs.rename(from, to, function(error) {
        var regexp = /EXDEV|ENOTEMPTY/;
        
        if (!error || !regexp.test(error.code))
            callback(error);
        else
            flop.copy(from, to, function(error) {
                if (error)
                    callback(error);
                else
                    flop.delete(from, callback);
            });
    });
};

exports.copy    = function(from, to, callback) {
    var wasError, cp, fromPart, toPart, name;
    
    check
        .type('from', from, 'string')
        .type('to', to, 'string')
        .type('callback', callback, 'function');
    
    name        = path.basename(from);
    fromPart    = from.replace(name, '');
    toPart      = to.replace(name, '');
    
    cp = copymitter(fromPart, toPart, [name]);
    
    cp.on('error', function(error) {
        callback(error);
        wasError = true;
        cp.abort();
    });
    
    cp.on('end', function() {
        if (!wasError)
            callback();
    });
};

function getRoot(callback) {
    win.getVolumes(function(error, volumes) {
        var data = {
            path    : '/',
            files   : []
        };
        
        if (!error)
            data.files = volumes.map(function(volume) {
                return {
                    name: volume,
                    size: 'dir',
                    date: '--.--.----',
                    mode: '--- --- ---',
                    owner: 0
                };
            });
        
        callback(error, data);
    });
}

