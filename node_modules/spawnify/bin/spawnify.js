#!/usr/bin/env node

'use strict';

var spawn,
    spawnify    = require('../'),
    argv        = process.argv.slice(2),
    command     = argv.join(' ');

if (!command) {
    console.log('spawnify <command>');
} else {
    spawn = spawnify(command);
    spawn.on('data', function(data) {
        console.log(data);
    });
    
    spawn.on('error', function(error) {
        console.error(error.message);
    });
    
    spawn.on('close', function() {
        console.log('closed');
        spawn = null;
    });
}

