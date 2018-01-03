#!/usr/bin/env node

'use strict';

var minimist = require('minimist');
var flop = require('..');
var argv = minimist(process.argv.slice(2));

var path;
var keys = Object.keys(argv);

if (keys.length === 1)
    if (argv._.length)
        unknown();
    else
        help();
else
    keys.some(function(name) {
        var isDone = true;
        
        if (name === 'h' || name === '')
            name = 'help';
        
        switch(name) {
        case 'help':
            help();
            break;
        
        case 'read':
            path = argv.read;
            break;
        
        case 'r':
            path = argv.r;
            break;
        
        case '_':
            isDone = false;
            break;
        
        default:
            isDone = true;
            unknown();
        }
        
        return isDone;
    });

if (path) {
    flop.read(path, function(error, data) {
        if (error)
            console.log(error);
        else
            console.log(data);
    });
}

function help() {
    var message =   'flop - folder operations module.\n'        +
                    'options: \n'                               +
                    '-h, --help - show this message\n'          +
                    '-r, --read - get directory content\n';
    
    console.log(message);
}

function unknown() {
    var message =   'Unknown parameter. For help use: flop -h';
    
    console.log(message);
}

