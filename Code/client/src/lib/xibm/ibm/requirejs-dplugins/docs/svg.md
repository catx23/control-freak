---
layout: doc
title: requirejs-dplugins/svg
---

# requirejs-dplugins/svg!

This plugin loads an svg graphic and defines it in the DOM, so you can reference it in a `<use>` tag.

## Example

```js
define([
    "requirejs-dplugins/svg!./icon1.svg", // <svg id="icon1"...
    "requirejs-dplugins/svg!./icon2.svg"  // <svg id="icon2"...
], function(id1, id2){
	// id1 === "icon1" and id2 === "icon2"
})
```

This will fetch `icon1.svg` and `icon2.svg` and define two symbols in the DOM
```xml
<svg>
	...
	<symbol id="icon1" viewBox="..." > ... </symbol>
	<symbol id="icon2" viewBox="..." > ... </symbol>
</svg>
```

You can then use the icons anytime with

```xml
<svg>
	<use xlink:href="#icon1"></use>
</svg>
```

Note that the first `<svg>` tag of your graphic should have an `id` attribute which will be used as the reference.
It should also have a `viewBox` attribute. 

As an example, here is the minimal markup your graphic should follow:

```xml
<svg id="my-graphic" viewBox="0 0 80 120"> ... </svg>
```

## Build
`jsdom` is used during the build step to merge all graphics in one sprite beforehand and save the result in a `<layer>.svg`. 
When running the built version, this sprite is fetched as soon as one of the graphics inside is required.

Note that `jsdom` should be added to your application `devDependencies` property in `package.json` so it is
automatically installed with `npm install`.
The following command will do that automatically:

```bash
$ npm install --save-dev jsdom
``` 

