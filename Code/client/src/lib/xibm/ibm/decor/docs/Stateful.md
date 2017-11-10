---
layout: doc
title: decor/Stateful
---

# decor/Stateful

decor/Stateful allows an application to define a class with a set of properties,
and to observe changes to an instance's properties.
The application defines the class like this, declaring the properties in the prototype:

```js
MyClass = dcl(Stateful, {
	label: "Press"
});
```

Then the application can instantiate instances of that class, and set and retrieve its properties
using standard notation:

```js
var myWidget = new MyClass();
myWidget.label = "hello";
console.log(myWidget.label);
```

## Observing changes

Application code can observe changes to the instance properties using `.observe()`, like this:

```js
myWidget.observe(function (oldVals) {
	Object.keys(oldVals).forEach(function (prop) {
		console.log(prop + "  changed from " + oldVals[prop] + " to " + this[prop]);
	}, this);
});
```

Note that `oldVals` is a hash of all the properties that have changed (since the last execution of the
callback method), rather than an array of change records such as `Object.observe()` delivers.

## Custom setters

It can also define custom getters/setters for some (or all, or none) of those properties:

```js
MyClass = dcl(Stateful, {
	label: "Press",
	_setLabelAttr: function(val){
		this._set("label", ...);
		...
	}
});
```

Note that the custom setter should call `this._set()` to record the new value of the property.
