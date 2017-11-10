#!/usr/bin/env node

process.argv.push('--type=OFFLINE_RELEASE');
process.argv.push('--release=true');
process.argv.push('--nodejs=true');
const homedir = require('os-homedir');
const jet = require('fs-jetpack');
const path = require('path');
const yargs_parser = require("yargs-parser");
let user = path.join(homedir(), '.control-freak');
let argv = yargs_parser(process.argv.slice(2));
if (argv.user) {
    user = path.resolve(argv.user);
} else {
    process.argv.push('--user=' + user);
}
console.log("User directory : " + user);
function ensureUser(_path, root) {
    var appDir = jet.cwd(root);

    jet.dir(_path + path.sep + 'devices');
    jet.dir(_path + path.sep + 'devices' + path.sep + 'logs');
    jet.dir(_path + path.sep + 'drivers');
    jet.dir(_path + path.sep + 'workspace');
    jet.dir(_path + path.sep + 'logs');

    var sourceDirectory, targetDirectory;

    sourceDirectory = path.resolve(appDir.path() + '/data/workspace/templates');
    targetDirectory = path.resolve(_path + path.sep + 'workspace/templates');

    jet.copy(sourceDirectory, targetDirectory, {
        overwrite: true
    });

    sourceDirectory = path.resolve(appDir.path() + '/data/workspace');
    targetDirectory = path.resolve(_path + path.sep + 'workspace/');
    jet.copy(sourceDirectory, targetDirectory, {
        matching: ['default.dhtml', 'default.css', 'default.xblox'],
        overwrite: true
    });
    sourceDirectory = path.resolve(appDir.path() + '/user');
    targetDirectory = path.resolve(_path + path.sep + '');
    if (!jet.exists(_path + path.sep + 'settings.json')) {
        jet.copy(sourceDirectory, targetDirectory, {
            matching: ['settings.json'],
            overwrite: true
        });
    }
    if (!jet.exists(_path + path.sep + 'meta.json')) {
        jet.copy(sourceDirectory, targetDirectory, {
            matching: ['meta.json'],
            overwrite: true
        });
    }
    if (!jet.exists(_path + path.sep + 'settings.json')) {
        jet.copy(sourceDirectory, targetDirectory, {
            matching: ['settings.json'],
            overwrite: true
        });
    }

}
ensureUser(user, path.resolve(path.join(__dirname, '..')));
if (!jet.exists(user)) {
    console.log(user);
    console.error('doesn exists');
}
require("../_build/index.js");