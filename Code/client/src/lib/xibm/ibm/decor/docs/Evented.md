---
layout: doc
title: decor/Evented
---

# decor/Evented

**decor/Evented** is a base class for classes that emit their own events, even if those classes have nothing
to do with the DOM.  It also provides an easy way for applications to monitor those events.

The structure of the event that is emitted is up to the
developer, but it should be consistent and easy to understand.

## Usage

The `decor/Evented` class provides two methods, `on(eventType, listener)` and `emit(eventType, eventObject)`.
For example, we could create a class:

```js
define(["dcl/dcl", "decor/Evented"], function(dcl, Evented){
	var MyComponent = dcl(Evented, {
		startup: function(){
			// once we are done with startup, fire the "ready" event
			this.emit("ready", {});
		}
	});

	component = new MyComponent();
	component.on("ready", function(){
		// this will be called when the "ready" event is emitted
		// ...
	});
	component.startup();
});
```

While `decor/Evented` can be extended and used directly, it is better to subclass into a new class.
