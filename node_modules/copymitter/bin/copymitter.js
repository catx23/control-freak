#!/usr/bin/env node

(function() {
    'use strict';
    
    var copymitor   = require('..'),
        path        = require('path'),
        glob        = require('glob'),
        args        = process.argv.slice(2),
        arg         = args[0];
        
    if (/^-(v|-version)$/.test(arg))
        version();
    else if (!arg || args.length === 1|| /^-(h|-help)$/.test(arg))
        help();
    else
        glob(arg, function(error, files) {
            var from,
                to      = args[1],
                name    = files[0];
            
            if (~name.indexOf('/'))
                from    = path.dirname(name);
            else
                from    = process.cwd();
            
            if (error)
                console.error(error.message);
            else
                main(from, to, files);
        });
       
    function main(from, to, files) {
        var cp;
        
        cp = copymitor(from, to, files);
        
        cp.on('error', function(error, name) {
            console.error(name, ':', error.message);
            cp.continue();
        });
        
        cp.on('progress', function(percent) {
            console.log(percent + '%');
        });
        
        cp.on('end', function() {
            console.log('Done.');
        });
    }
    
    function version() {
        console.log('v' + info().version);
    }
    
    function info() {
        return require('../package');
    }
    
    function help() {
        var bin         = require('../json/bin'),
            usage       = 'Usage: ' + info().name + ' [filename] [distanation path]';
            
        console.log(usage);
        console.log('Options:');
        
        Object.keys(bin).forEach(function(name) {
            var line = '  ' + name + ' ' + bin[name];
            console.log(line);
        });
    }
})();
