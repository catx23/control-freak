---
layout: doc
title: requirejs-dplugins/Promise
---

# requirejs-dplugins/Promise!

`requirejs-dplugins/Promise` provides an ES6 Promise implementation. If the browser does not provide it, the
plugin will load the [lie](https://github.com/calvinmetcalf/lie) implementation.

## Configuration

If RequireJS `baseUrl` is not the `bower_components` directory, the path to the `lie` directory should be set
using RequireJS `paths` configuration.

```js
require.config({
	paths: {
		"lie": "path/to/lie"
	}
});
```

If you want to use the minified version of lie, you should use the following configuration:

```js
require.config({
	paths: {
		"lie/dist/lie": "path/to/lie/dist/lie.min"
	}
});
```


## Build

The `lie` module will not be included in a layer depending on the Promise plugin.
It can be included in a layer by including it explicitly.

```js
layers: [{
	name: "js/app",
	include: ["lie/dist/lie"]
}]
```

## Sample
```
require(["requirejs-dplugins/Promise!"], function(Promise){
	var promise = new Promise(function (resolve, reject) {
		...
	});
});
```
