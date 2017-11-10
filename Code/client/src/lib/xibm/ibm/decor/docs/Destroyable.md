---
layout: doc
title: decor/Destroyable
---

# decor/Destroyable

Decor/Destroyable is used to track handles of an instance, and then release/destroy them when the instance is destroyed.
Handles are registered via the `own()` method.
The application must call `destroy()` on the instance in order to release the handles.

Destroyable is one of the superclasses of `delite/Widget`.


## Handles passed to own()

``own()``'s arguments can be either Promises with ``cancel()`` methods, or any handles
with ``destroy()`` or ``remove()`` methods.

## Example

```js
var DestroyableSubClass = dcl(Destroyable, {
	constructor: function(aStatefulObject, aPromise){
		var d = new Deferred();

		this.own(
			// observe changes to aStatefulObject (automatically stop observing when I'm destroyed)
			aStatefulObject.observe("x", function(oldVals){ ... }),

			// create a supporting (internal) widget, to be destroyed when I'm destroyed
			new MySupportingWidget(...),

			// execute code when promise completes, but cancel promise if I am destroyed
			d.then(myFunc)
		);

		...
	}
});
```
