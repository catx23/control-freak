#!/usr/bin/env node

(function() {
    'use strict';
    
    var remy       = require('..'),
        glob        = require('glob'),
        args        = process.argv.slice(2),
        arg         = args[0];
        
    if (/^-(v|-version)$/.test(arg))
        version();
    else if (!arg ||  /^-(h|-help)$/.test(arg))
        help();
    else
        glob(arg, function(error, files) {
            var name    = files[0];
            
            if (!name)
                error = Error('file not found');
            
            if (error)
                console.error(error.message);
            else
                main(name);
        });
       
    function main(name) {
        var rm;
        
        rm = remy(name);
        
        rm.on('error', function(error, name) {
            console.error(name, ':', error.message);
            rm.continue();
        });
        
        rm.on('progress', function(percent) {
            console.log(percent + '%');
        });
        
        rm.on('end', function() {
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
            usage       = 'Usage: ' + info().name + ' [path]';
            
        console.log(usage);
        console.log('Options:');
        
        Object.keys(bin).forEach(function(name) {
            var line = '  ' + name + ' ' + bin[name];
            console.log(line);
        });
    }
})();
