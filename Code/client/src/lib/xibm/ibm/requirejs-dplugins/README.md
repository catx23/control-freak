# requirejs-dplugins [![Build Status](https://travis-ci.org/ibm-js/requirejs-dplugins.png?branch=master)](https://travis-ci.org/ibm-js/requirejs-dplugins)

Set of AMD plugins for RequireJS. It contains the following plugins:

 * [css](#css)
 * [has](#has)
 * [i18n](#i18n)
 * [jquery](#jquery)
 * [maybe](#maybe)
 * [Promise](#promise)
 * [svg](#svg)

## Status

No official release yet.

## Migration

## Licensing

This project is distributed by the Dojo Foundation and licensed under the ["New" BSD License](./LICENSE).
All contributions require a [Dojo Foundation CLA](http://dojofoundation.org/about/claForm).

## Installation

_Bower_ release installation:

    $ bower install requirejs-dplugins

_Manual_ master installation:

    $ git clone git://github.com/ibm-js/requirejs-dplugins.git

Then install dependencies with bower (or manually from github if you prefer to):

	$ cd requirejs-dplugins
	$ bower install

When using the jQuery plugin, in order to be able to load jQuery modules, you must manually include jQuery into 
your app via `bower install jquery` or via a script tag (ex: `<script src="https://code.jquery.com/jquery-2.1.1.min.js">`).

## css
This plugin will load and wait for a css file. CSS loaded with this plugin can be overwritten by
user-defined style sheet, using `<link>` or `<style>` tag.

See [docs/css.md](./docs/css.md) for documentation.

## has
This plugin provides an extensible API to manage feature detection. It also implements the
[requirejs plugin api](http://requirejs.org/docs/plugins.html) to provide conditional module loading.

See [docs/has.md](./docs/has.md) and [samples/has.html](./samples/has.html) for documentation and sample.

## i18n
This plugin provides an API to handle string translation.

See [docs/i18n.md](./docs/i18n.md) and [samples/i18n.html](./samples/i18n.html) for documentation and sample.

## jquery
This plugin loads the specified jQuery modules if they are not loaded already.

See [docs/jquery.md](./docs/jquery.md) for documentation.

## maybe
This plugin allows to require modules that may or may not exist.

See [docs/maybe.md](./docs/maybe.md) and [samples/maybe.html](./samples/maybe.html) for documentation and sample.

## Promise
This plugin provides an ES6 Promise implementation. If the browser does not provide ES6 Promise, it provides a shim.

See [docs/Promise.md](./docs/Promise.md) for documentation.

## svg
This plugin loads an svg graphic and defines it in the DOM, so you can reference it in a `<use>` tag.

See [docs/svg.md](./docs/svg.md) for documentation.
