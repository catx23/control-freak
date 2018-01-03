# Zames [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

`zames` converts callback-based functions to Promises and apply currying to arguments.

`zames` = [currify][currify] + [promisify][promisify].

## Install

`npm i zames --save`

## API

### zames(fn [,ctx])

- `fn` - function
- `ctx` - context

`zames` can take just a `function`:

```js
const zames = require('zames');

const promise = zames((a, b, fn) => {
    fn(null, a + b);
});

const add = promise('hello ');

add('world').then((a) => {
    console.log(a);
    // output
    'hello world';
});

```

Or could be used with `ctx` as well:

```js
const ctx = {
    error: 'hello',
    log: function(a, b, fn) {
        fn(this.error);
    }
}

const withContext = zames(ctx.log, ctx);

withContext(1, 2)
    .catch((e) => {
        console.error(e.message);
        // output
        'hello';
    });

```

## Environments

In old `node.js` environments that not fully supports `es2015`, `zames` could be used with:

```js
var zames = require('zames/legacy');
```

## Related

- [currify](https://github.com/coderaiser/currify "currify") - translate the evaluation of a function that takes multiple arguments into evaluating a sequence of functions, each with a single or more arguments.

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/zames.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/zames/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/zames.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/zames "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/zames  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/zames "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/coderaiser/zames?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/zames/badge.svg?branch=master&service=github

[currify]:                 https://en.wikipedia.org/wiki/Currying "Currying"
[promisify]:                https://github.com/digitaldesignlabs/es6-promisify "Promisify"

