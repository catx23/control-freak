# Pullout [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

Pull out data from stream.

## Install

```
npm i pullout --save
```

## pullout(stream[, type = 'buffer'], fn)

Type could be `string` or `buffer`.

```js
const pullout = require('pullout'),
const fs = require('fs'),

const readStream = fs.createReadStream(__filename);

pullout(readStream, 'string', (error, data) => {
    console.log(error || data);
});
```

## Environments

In old `node.js` environments that not fully supports `es2015`, `pullout` could be used with:

```js
var pullout = require('pullout/legacy');
```

## Related

- [pipe-io](https://github.com/coderaiser/pipe-io "pipe-io") - pipe streams and handle events

## License
MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/pullout.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/pullout/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/pullout.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/pullout/badge.svg?branch=master&service=github
[NPMURL]:                   https://npmjs.org/package/pullout "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/pullout  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/pullout "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]:              https://coveralls.io/github/coderaiser/pullout?branch=master

