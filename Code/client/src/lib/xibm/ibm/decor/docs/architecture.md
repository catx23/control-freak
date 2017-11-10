---
layout: doc
title: Decor Architecture
---

# Decor Architecture

General notes on decor design goals and architectural decisions.

## Observable

[`Observable`](Observable.html) is a "value-holder" object working as a shim of ES7 [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe).
A "value-holder" object sometimes requires decoration/undecoration from/to plain object, and triggering observation requires specific way to set a property on an object,
but such "specific way" ensures the best performance, without needing to go through all observed objects to see what objects are changed
at ends of [micro-tasks](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#microtask).

For triggering observation, [`Stateful`](Stateful.html), a class on top of [`Observable`](Observable.html), decorates declared properties with ES5 accessors.
[`Observable`](Observable.html) itself provides `.set(name, value)` method which allows to trigger observation without declaraing properties.
Alternatively `Observable.getNotifier(observable).notify(changeRecord)` can be used.

### Observable and ES7 Object.observe()

[`Observable`](Observable.html) attemps to provide high fidelity shim of ES7 [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe), but there is one difference between them, which is:

* **DOM property**: Given many of DOM properties actually are "computed", automatically emitting change records for those are [considered of a performance problem](https://github.com/Polymer/observe-js/issues/49). Therefore `Object.observe()` does not automatically emit change records for those. There is no good way to detect what are in the category of such DOM properties, though, so `Observable#set()` API keeps emitting change records for those. The difference may be noticable with browsers that natively supports [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe), because [`Observable`](Observable.html) directly uses [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe) with browsers supporting the API. You can emit change records explicitly with `Observable.getNotifier(observable).notify(changeRecord)` in such condition, however, extra care should be taken given the performance concern raised by [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe) author.

## Stateful

The design goals of Stateful were:

* allow property update and access via `myWidget.foo = ...` syntax, rather than `set()` and `get()`
  methods (or `setFoo()` and `getFoo()` methods)
* no requirement to call `deliverChangeRecords()` (or similar function) after changing instance properties
* work with [dcl](http://www.dcljs.org/) to allow proper OO programming
* no performance penalty due to polling for property changes
* no performance penalty if many instances of the class are created

Behind the scenes, `Stateful` implements the `observe()` method by extending
[`decor/Observable`](Observable.md) shim of `Object.observe()`.

But then, [`decor/Stateful`](Stateful.md) notes all the properties defined in the prototype, direct and inherited,
and calls `Object.defineProperty()` on the **prototype** to add native ES5 setters and getters for those properties.
For properties where the subclass doesn't define a custom setter, Stateful will generate one on-the-fly
that just calls `this._set(...)` to save the new value and notify `Observable` that the value changed.

Using custom setters means that there's no polling required to detect when properties have changed.
Also, putting the custom setters on the prototype means that there's no performance issue when many instances of
the class are created.

Ideally ES5 native accessors would be supported via [dcl](http://www.dcljs.org/) but we are
[still waiting for that](https://github.com/uhop/dcl/issues/2).