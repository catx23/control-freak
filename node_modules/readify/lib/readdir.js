'use strict';

const path = require('path');
const fs = require('fs');

const exec = require('execon');
const promisify = require('es6-promisify');
const currify = require('currify/legacy');
const zames = require('zames/legacy');

const getStat = currify(_getStat);
const getAllStats = zames(_getAllStats);

const readdir = promisify(fs.readdir, fs);
const good = (f) => (...a) => f(null, ...a);

module.exports = (path, fn) => {
    readdir(path)
        .then(getAllStats(path))
        .then(parseAllStats)
        .then(good(fn))
        .catch(fn);
};

function _getAllStats(dir, names, callback) {
    const length = names.length;
    
    if (!length)
        return callback(null, []);
    
    const funcs = names.map((name) => {
        return getStat(name, path.join(dir, name));
    });
    
    exec.parallel(funcs, (...args) => {
        callback(null, args.slice(1));
    });
}

function emptyStat() {
    return {
        mode        : 0,
        size        : 0,
        mtime       : 0,
        uid         : 0,
        isDirectory : () => {}
    };
}

function _getStat(name, path, callback) {
    fs.stat(path, (error, data = emptyStat()) => {
        data.name = name;
        
        callback(null, data);
    });
}

function parseAllStats(array) {
    const parse = (item) => {
        return parseStat(item);
    };
    
    return array.map(parse);
}

function parseStat(stat) {
    const isDir = stat.isDirectory();
    const size = isDir ? 'dir' : stat.size;
    
    return {
        name: stat.name,
        size,
        date: stat.mtime,
        owner: stat.uid,
        mode: stat.mode
    };
}

