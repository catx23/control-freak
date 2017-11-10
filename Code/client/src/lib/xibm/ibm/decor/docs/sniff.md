---
layout: doc
title: decor/sniff
---

# decor/sniff

You should always try to use feature detection (for a general overview, see
[Feature detection](http://en.wikipedia.org/wiki/Feature_detection_(web_development))
whenever possible to write forward-compatible code branches.
The `requirejs-dplugins/has` API is designed to help in this endeavor.

When feature detection is not an option, decor provides user agent sniffing code in the module, `decor/sniff`.
The sniff module augments the basic set of `has()` tests with additional user agent based tests,
so you can use the base `has()` api to test for browser environment and versions, just like you do for other features.
Using this approach in conjunction with an optimizing compiler at build time, it is possible to optimize out unwanted
code paths for specific browsers.

The sniff module defines the following has-features:

* `has("edge")` - successor to internet explorer
* `has("ie")` - internet explorer; note that unlike dojo, `has("ie")` is truthy for IE11
* `has("webkit")` - webkit based browser
* `has("ff")` - firefox
* `has("safari")` - safari (either on Mac desktop or iOS)
* `has("chrome")` - chrome
* `has("ios")` - truthy for iOS devices (iPhone, iPad, etc.)
* `has("android")` - truthy for Android devices
* `has("wp")` - truthy for Windows Phone devices
* `has("mac")` - true for mac desktop
* `has("msapp")` - app is running in Microsoft's container for stand alone web apps (similar to cordova).


The return value is only defined if the specified browser is being used.
For example, if you're using Internet Explorer, only `has("ie")` is defined;
all the other `has()` calls return undefined.

`has()` returns the browser version number as a number, so you can easily perform version checks.
Additionally, since undefined always results in a false result in greater-than or less-than comparisons,
you can use code like this to check for a certain browser version:


```js
require(["decor/sniff"], function(has) {
	if (has("ie") <= 9) { // only IE9 and below
	  ...
	}

	if (has("ff") < 24) { // only Firefox 24 and lower
	  ...
	}

	if (has("ie") == 10) { // only IE10
	  ...
	}
});
```
