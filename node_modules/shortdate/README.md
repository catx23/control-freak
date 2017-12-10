# Shortdate [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

Get short date. For browser and node.

## Install

```
npm i shortdate --save
```

## How to use?
`shortdate` uses arguments:
- `date` (optional)
- `options` (optional):
    - `sep` - separator
    - `order` - "big", "middle", "little" ([endian types][EndianTypes]);

```js
var shortdate = require('shortdate');

shortdate();
// returns
'2015.01.08'

shortdate(new Date('9-9'));
// returns
'2001.09.09'

shortdate(new Date(), {
    sep: '/'
});
// returns
'2016/02/20'

shortdate(new Date(), {
    order: 'little'
});
// returns
'20.02.2016'
```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/shortdate.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/shortdate/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/shortdate.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/shortdate "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/shortdate  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/shortdate "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/coderaiser/shortdate?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/shortdate/badge.svg?branch=master&service=github

[EndianTypes]:              https://en.wikipedia.org/wiki/Date_format_by_country
