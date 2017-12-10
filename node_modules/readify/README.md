# Readify [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/readify.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/readify/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/readify.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/readify "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/readify  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/readify "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

Read directory content with file attributes: size, date, owner, mode.

## Install

With npm:

```
npm i readify --save
```

## API

### readify(dir [, options, ], callback)

- **dir** - path of a directory
- **options** - `object` can contain:
  - `type` - type of result, could be "raw"
  - `sort` - sort by: name, size, date
  - `order` - "asc" or "desc" for ascending and descending order (default: "asc")
- **callback** - `function`

## Examples

```js
const readify = require('readify');

radify('/', (error, data) => {
    console.log(data);
    // output
    {
        path: '/',
        files:  [{
            name: 'readify.js',
            size: '4.22kb',
            date: '20.02.2016',
            owner: 'coderaiser',
            mode: 'rw- rw- r--'
        }]
    }
});

radify('/', {type: 'raw'}, (error, data) => {
    console.log(data);
    // output
    {
        path: '/',
        files:  [{
            name: 'readify.js',
            size: 4735,
            date: 2016-11-21T13:37:55.275Z,
            owner: 1000,
            mode: 33204
        }]
    }
});

radify('/', {type: 'raw', sort: 'size', order: 'desc'}, (error, data) => {
    console.log(data);
    // output
    {
        path: '/',
        files:  [{
            name: 'readify.js',
            size: 4735,
            date: 2016-11-21T13:37:55.275Z,
            owner: 1000,
            mode: 33204
        }]
    }
});
```

## Environments

In old `node.js` environments that supports `es5` only, `readify` could be used with:

```js
var readify = require('readify/legacy');
```

## License

MIT

[CoverageURL]:              https://coveralls.io/github/coderaiser/readify?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/readify/badge.svg?branch=master&service=github

