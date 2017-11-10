---
layout: doc
title: requirejs-dplugins/has
---

# requirejs-dplugins/has

`requirejs-dplugins/has` provides an extensible API to manage feature detection. It also implements the
[requirejs plugin api](http://requirejs.org/docs/plugins.html) to provide conditional module loading.

It is based on the conventions in the [has.js project](https://github.com/phiggins42/has.js).

__Note:__ This plugin does NOT include any feature tests.

##### Table of Contents
[Features](#features)  
[Adding tests](#adding-tests)  
[Use as module](#use-as-module)  
[Use as plugin](#use-as-plugin)  
[Build](#build)  

<a name="features"></a>
## Features

* __lazy evaluation__: Tests are only evaluated when they are required by the application.
* __test result caching__: tests results are stored for later use to minimize the impact on resources.
* __static configuration__: Tests can be set statically using requirejs configuration, providing support for configuration
flag.
* __requirejs plugin__: Use ternary operator to conditionally load modules.

<a name="adding-tests"></a>  
## Adding tests

Since the plugin itself does not include any tests, the first thing to do is add one.

### Using has.add()

The plugin provides an `add` function to add new tests, with the following signature:

```js
has.add(name, test, now, force)
```
1. name _(String)_: The test name.
1. test _(Boolean or Function)_: The test function or directly a `Boolean` value. The test function will be call with a
single `global` argument pointing to the global scope.
1. now _(Boolean)_: If true, evaluate the test function now instead of when it will be needed.
1. force _(Boolean)_: If true, add the test even if a test with the same name already exists.

#### Sample
```js
define(["requirejs-dplugins/has"], function (has) {
	// using a boolean directly
	has.add("host-browser", typeof window !== "undefined");

	// using a test function and overwriting previous tests
	has.add("host-browser", function (global) {
		return global.window !== undefined;
	}, false, true);
});
```

<a name="using-static-configuration"></a>
### Using static configuration

The plugin will look for static configuration in a hashmap provided through
[requirejs module configuration](http://requirejs.org/docs/api.html#config-moduleconfig).

#### Sample
```js
require.config({
	config: {
		"requirejs-dplugins/has": {
			// Create a bidi flag.
			bidi: true
		}
	}
});
```

<a name="use-as-module"></a>  
## Use as module
To access the tests, the plugin exports a main function taking a test name as argument and returning the test result.

#### Sample
```js
define(["requirejs-dplugins/has"], function (has) {
	if (has("bidi")) {
		// Do something special to support bidi
	}
});
```

<a name="use-as-plugin"></a>
## Use as plugin
Ternary operator can be used to conditionally load modules. It uses the following syntax:

```
test?moduleA:moduleB
```

If `test` return true, `moduleA` will be loaded, otherwise it will be `moduleB`.
Note that `moduleA` and `moduleB` are optional and if the expression doesn't resolve to a module, the plugin returns
`undefined`.

Ternary operation can be chained to run another test if the first one fails.

```
test1?moduleA:test2?moduleB:moduleC
```

If `test1` is true, the plugin loads `moduleA`.
If `test1` is false but `test2` is true, the plugin loads `moduleB`.
If `test1` is false and `test2` is false, the plugin loads `moduleC`.

#### Sample
```js
define(["requirejs-dplugins/has!bidi?./bidiWidget:./Widget"], function (widget) {
	// Do something with the widget
});
```

<a name="build"></a>
## Build

Has flag can be specified at build time using the [static configuration](#using-static-configuration).
If a flag is `undefined` at build time, then all the possible modules will be added to the layer.
If a flag was set to `true` or `false`, the build will resolve the ternary condition and include only the
needed modules in the layer.
