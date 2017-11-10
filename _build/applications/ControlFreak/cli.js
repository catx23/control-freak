"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli = require("yargs");
const path = require("path");
function create() {
    const argv = cli.argv;
    const cwd = process.cwd();
    cli.options('v', {
        alias: 'version',
        description: 'Display version number'
    });
    cli.options('user', {
        alias: 'u',
        description: 'Specify user directory'
    });
    cli.options('system', {
        alias: 's',
        description: 'Specify system directory'
    });
    cli.options('root', {
        alias: 'r',
        description: 'Specify control-freak root directory'
    });
    cli.options('port', {
        description: 'Specify http server port',
        default: "5555"
    });
    cli.options('host', {
        description: 'Specify http host',
        default: "0.0.0.0"
    });
    cli.options('home', {
        description: 'Is desktop release, this will set user to ~/.control-freak',
        default: false
    });
    cli.options('print', {
        description: 'verbose',
        default: false
    });
    cli.options('info', {
        description: 'show information'
    });
    cli.options('interface', {
        alias: 'i',
        description: 'Specify main interface: electron or cli'
    });
    if (argv.h || argv.help) {
        cli.showHelp();
        process.exit();
    }
    else if (argv.v || argv.version) {
        const pkginfo = require(path.join(cwd, './package.json'));
        console.log(pkginfo.version);
        process.exit();
    }
}
exports.create = create;
//# sourceMappingURL=cli.js.map