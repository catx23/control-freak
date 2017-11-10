"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function runElectron(root, appPath, userDirectory) {
    const which = require('npm-which')(process.cwd()); // remember to supply cwd
    const env = Object.create(process.env);
    console.log('run ' + root + ' with : ' + appPath + ' user : ' + userDirectory);
    which('electron', (err, pathToElectron) => {
        if (err) {
            return console.error(err.message);
        }
        const cmd = pathToElectron;
        const child = child_process_1.spawn(cmd, [appPath, '--userDirectory=' + userDirectory], {
            cwd: root,
            env: env
        });
        child.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        child.stderr.on('data', function (data) {
            console.error(data.toString());
        });
        child.on('close', function (code) {
            process.exit(code);
        });
        //console.log(pathToTape); // /Users/.../node_modules/.bin/tape
    });
}
exports.runElectron = runElectron;
//# sourceMappingURL=app.js.map