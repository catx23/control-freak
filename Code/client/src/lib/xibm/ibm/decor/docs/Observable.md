---
layout: doc
title: decor/Observable - A shim of ES7 Object.observe() by value-holder object
---

# decor/Observable

`Observable` is an object working as a shim of ES7 [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe).
`Observable` has `.set()` method for automatic emission of change record, and static `Observable.observe()` method to observe for that, for example:

<iframe width="100%" height="225" src="http://jsfiddle.net/ibmjs/pngb8/embedded/js,result" allowfullscreen="allowfullscreen" frameborder="0"><a href="http://jsfiddle.net/ibmjs/pngb8/">checkout the sample on JSFiddle</a></iframe>

Similar to ES7 [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe),
change records are delivered in a batch at the end of the [micro-task](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#microtask).
In above example, you'll see that change to `foo` property and change to `bar` properties are notified in a single callback, in a format of array.
The format of change records is compatible with ES7 [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe).

Under the hood, `Observable.observe()` directly uses ES7 [`Object.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe) if it's available natively in browser.

## Synchronous delivery of change record

There are some cases you want to deliver change records immediately,
instead of waiting for the end of [micro-task](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#microtask).
For that purpose, you can use `Observable.deliverChangeRecord()` that synchronously delivers change records that are queued for callback.
Here's an example:

<iframe width="100%" height="300" src="http://jsfiddle.net/ibmjs/S83Ey/embedded/js,result" allowfullscreen="allowfullscreen" frameborder="0"><a href="http://jsfiddle.net/ibmjs/S83Ey/">checkout the sample on JSFiddle</a></iframe>

## Manual emission of change record

Similar to `Object.observe()`, `.set()` won't automatically emit a change record if:

* There is no actual change in value
* The given property has a setter (ECMAScript setter)

In such conditions, you can manually emit a change record (and queue it for delivery) by `Observable.getNotifier(observable).notify(changeRecord)` method, which is what `.set()` calls under the hood. Here's an example:

<iframe width="100%" height="300" src="http://jsfiddle.net/ibmjs/5ezRw/embedded/js,result" allowfullscreen="allowfullscreen" frameborder="0"><a href="http://jsfiddle.net/ibmjs/5ezRw/">checkout the sample on JSFiddle</a></iframe>

## Synthetic change record

If you make a higher-level change to an object (as opposed to a simple property update/delete/add), such as array splice, having such higher-level change represented directly in a change record will be useful. You can do that by `Observable.getNotifier(observable).performChange(type, callback)` method. The first argument (`type`) is the change type you define for your higher-level change. The second argument is a function where you can make a series of changes that your higher-level change represents, and then return your higher-level change.

You can observe your higher-level change by adding the change type of your higher-level change to the third argument of `Observable.observe()`. Otherwise, raw changes to `Observable` (`update`, etc.) will be observed.

Here's an example, where `Point#move()` method moves the point with the given distance and direction (`angle`). The code to update `x` and `y` with the result is in `performChange()` callback so that the updates are represented by a change record with `move` type, with the distance and direction (`angle`):

<iframe width="100%" height="600" src="http://jsfiddle.net/ibmjs/B5BQK/embedded/js,result" allowfullscreen="allowfullscreen" frameborder="0"><a href="http://jsfiddle.net/ibmjs/B5BQK/">checkout the sample on JSFiddle</a></iframe>

## Utility functions

`Observable` has two static utility funcitons:

* `Observable.is(value0, value1)` - Compares `value0` and `value1`. Basically returns `value0 === value1`, except:
  * Returns `true` for `NaN` and `NaN`
  * Returns `false` for `+0` and `-0`
* `Observable.assign(observable, object0, object1...)` - Copies all enumerable properties in `object0`, `object1`, ... to `observable`, and automatically emits change records for those properties.

# ObservableArray

`ObservableArray` is an object that extends native JavaScript array, and works as a shim of ES7 [`Array.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe). Like `Observable`, `ObserableArray` has `.set()` method for automatic emission of change record, and static `ObservableArray.observe()` method to observe for that. Here's an example:

<iframe width="100%" height="250" src="http://jsfiddle.net/ibmjs/MtN79/embedded/js,result" allowfullscreen="allowfullscreen" frameborder="0"><a href="http://jsfiddle.net/ibmjs/MtN79/">checkout the sample on JSFiddle</a></iframe>

In addition to `.set()`, the following methods automatically emit change records, too:

* `pop()`
* `push()`
* `shift()`
* `unshift()`
* `splice()`
* `reverse()`
* `sort()`

Here's an example with `.splice()`:

<iframe width="100%" height="250" src="http://jsfiddle.net/ibmjs/4dTAf/embedded/js,result" allowfullscreen="allowfullscreen" frameborder="0"><a href="http://jsfiddle.net/ibmjs/4dTAf/">checkout the sample on JSFiddle</a></iframe>

Under the hood, `ObservableArray.observe()` uses ES7 [`Array.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe) if it's available natively in browser.

## Change record translation and ES7 `Array.observe()` compatibility

With `ObservableArray.observe()`, change records are translated to a synthetic version representing array splice where applicable. It makes `ObservableArray.observe()` compatible to ES7 [`Array.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe) except the following conditions:

* Any of splices are adjacent or intersect; `ObservableArray.observe()` attempts to merge them. It makes what liaison or your application do with the callback, e.g. DOM updates, more efficient.
* Result of `ObserableArray#reverse()`; [`Array.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe) emits "update" type of change records for array entries.
* Result of `ObserableArray#sort()`; [`Array.observe()`](http://wiki.ecmascript.org/doku.php?id=harmony:observe) emits "update" type of change records for array entries.

## Synchronous delivery of change record

There are some cases you want to deliver change records immediately, instead of waiting for end of [micro-task](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#microtask). For that purpose, you can use `.deliver()` method of the return value of `ObservableArray.observe()`.
Here's an example:

<iframe width="100%" height="300" src="http://jsfiddle.net/ibmjs/2p1LuL06/embedded/js,result" allowfullscreen="allowfullscreen" frameborder="0"><a href="http://jsfiddle.net/ibmjs/2p1LuL06/">checkout the sample on JSFiddle</a></iframe>

This is different from `Observable.deliverChangeRecords()` explained in `Observable` section; As explained above, `ObservableArray.observe()` attemps to merge change records of splice if any of them are adjacent or intersect.
To do that, `ObservableArray.observe()` calls `Array.observe()` or `Observable.observe()` (depending on whether `Array.observe()` is availble native in browser) with its own callback, instead of the callback given to `ObservableArray.observe()`.

# Explicit way of emitting change records

Observable takes an approach where you make an explicit API call to emit change records of an object or an array for observation.
With this approach, the underlying system doesn't need to do a heavy lifting to compare old/new values of all object properties observed in your application, which becomes non-trivial for bigger-scale applications.

For example,

```javascript
observable.set("foo", "FooValue1")
```

explicitly emits a change record of `observable` object for observation. If it were `observable.foo = "FooValue1"` change record would *not* be emitted and thus observation callback would't be called (unless ES7 `Object.observe()` is availble in your browser).

Similar for value assignment to array by index, call

```javascript
observableArray.set(n, "ValueForObservableArrayN")
```

to explicitly emit change records of `observableArray` for observation. If it were `observableArray[n] = "ValueForObservableArrayN"` change records would *not* be emitted and thus observation callback won't be called (unless ES7 `Array.observe()` is availble in your browser).

Here is the list of the APIs you can use to explicitly emit change records:

* [`Observable`](http://ibm-js.github.io/decor/docs/0.5.0/Observable.html) (In [decor](https://github.com/ibm-js/decor) library)
  * `#set()`
  * `.assign()` (New in 0.6.0)
* [`ObservableArray`](http://ibm-js.github.io/liaison/docs/master/ObservableArray.html)
  * `#set()`
  * `#pop()`
  * `#push()`
  * `#shift()`
  * `#unshift()`
  * `#splice()`
  * `#reverse()`
  * `#sort()`
