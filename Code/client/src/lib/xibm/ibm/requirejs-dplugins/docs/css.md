---
layout: doc
title: requirejs-dplugins/css
---

# requirejs-dplugins/css!

This plugin will load and wait for a css file. This can be handy to load the css
specific to any AMD module (like a widget) .

This plugin uses `<link>` tags to load CSS files and those tags are inserted as the first child of the
`<head>` tag. This guarantees that CSS loaded with this plugin will not overwrite CSS inserted manually using
 `<link>` or `<style>` tag.

This plugin will return the path of the inserted css file relative to requirejs baseUrl.

## Example

To load the css file `myproj/comp.css` you can use:

```
require(["requirejs-dplugins/css!myproj/comp.css"], function (){
	// Code placed here will wait for myproj/comp.css before running.
});
```

Or as a widget dependency:

```
define(["requirejs-dplugins/css!myproj/comp.css"], function (){
	// My widget factory
});
```

## Build

To build a CSS layer containing all the CSS files required, [clean-css](https://github.com/jakubpawlowicz/clean-css)
needs to be installed in the `node_modules` directory of the application.
Clean-css should be added to the application `devDependencies` property in `package.json` so it is
automatically installed with `npm install`.
The following command will do that automatically:

```bash
$ npm install --save-dev clean-css
``` 

