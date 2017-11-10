---
layout: doc
title: requirejs-dplugins/jquery
---

# requirejs-dplugins/jquery!


This plugin will load the specified jQuery AMD module(s), unless the application has loaded the whole jQuery
library via a `<script>` tag, in which case it just returns a pointer to the already loaded jQuery.

It's useful to avoid loading jQuery twice.

When using this plugin, in order to be able to load jQuery modules, you must manually include jQuery into 
your app via `bower install jquery` or via a script tag (ex: `<script src="https://code.jquery.com/jquery-2.1.1.min.js">`).

## Example

To get a jQuery object that can modify classes and do animations:

```js
require(["requirejs-dplugins/jquery!attributes/classes,effects"], function ($) {
    ...
    $(myNode).addClass("selected");
    $(myNode).animate(...);
});
```

## Build
This plugin needs the following AMD loader configuration to work at build time:

```js
{
	map: {
		jquery: {
			"jquery/src/selector": "jquery/src/selector-native"     // don't pull in sizzle
		}
	}
}
```

If the build of this plugin is enabled, it will add the needed AMD jQuery modules to the layer.
If you don't want to include jQuery modules you can add this plugin to the `runtimePlugins` array in
`grunt-amd-build` configuration like this:

```js
{
	runtimePlugins: ["requirejs-dplugins/jquery"]
}
```
