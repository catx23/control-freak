# Nicki [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

Get names of users by uids from `/etc/passwd` (or from `dscl` on `darwin`).

## Install

`npm i nicki --save`

## Hot to use?

```js
var nicki = require('nicki');

nicki(function(error, names) {
    console.log(error || names);
}

/*
 * Could be something like this
{ 
  '0': 'root',
  '1': 'daemon',
  '2': 'bin',
  '3': 'sys',
  '4': 'sync',
  '5': 'games',
  '6': 'man',
  '7': 'lp',
  '8': 'mail',
  '9': 'news',
  '10': 'uucp',
  '13': 'proxy',
  '33': 'www-data',
  '34': 'backup',
  '38': 'list',
  '39': 'irc',
  '41': 'gnats',
  '100': 'libuuid',
  '101': 'syslog',
  '102': 'messagebus',
  '103': 'landscape',
  '104': 'sshd',
  '105': 'colord',
  '106': 'debian-deluged',
}
*/
```

## How it works?

`Nicki` parses `/etc/passwd` and makes object where key is `uid` and value is `name`.

## Environments

In old `node.js` environments that not fully supports `es2015`, `nicki` could be used with:

```js
var nicki = require('nicki/legacy');
```

## License

MIT


[NPMIMGURL]:                https://img.shields.io/npm/v/nicki.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/nicki/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/nicki.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/nicki "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/nicki  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/nicki "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

