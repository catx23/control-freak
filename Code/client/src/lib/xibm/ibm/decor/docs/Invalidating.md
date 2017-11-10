---
layout: doc
title: decor/Invalidating
---

# decor/Invalidating

`decor/Invalidating` is a mixin class to for UI-related Custom Elements
that want to calculate computed properties once, and/or render the UI once, upon multiple property changes.
For that purpose the class adds two main lifecycle phases to the class, `computeProperties()` and
`refreshRendering()`, which are both called after a batch of property changes.

Invalidating extends `decor/Stateful`, and `delite/Widget` extends Invalidating.

##### Table of Contents
[Setting Up Invalidating](#setting)
[Changes Lifecycle](#changes)
[Startup Lifecycle](#startup)
[Implementing a Subclass](#implementing)
[Using Invalidating](#using)
[Rerendering From Scratch](#rerender)

<a name="setting"></a>
## Setting up Invalidating

Note that in order to be subject to invalidation the corresponding property must also haven been declared in the class.

Note that any property subject to compute properties phase will also be subject to the refresh rendering phase in a
second phase.

<a name="changes"></a>
## Changes Lifecycle

After a batch of changes, `decor/Invalidating` goes through two phases of processing: `computeProperties()` and
`refreshRendering()`.

The first phase, `computeProperties()`, is used to reconcile instances properties after they have been set.
A typical example is making sure the value of a range component is correctly set between min and max values and
that the max value is bigger than min value.
This phase is optional and not all classes leveraging `decor/Invalidating` will need it.
This phase can also be used to compute values for properties derived from other properties, such as an employee's
name which is "calculated" from the first name and last name.

The second phase, `refreshRendering()`, is used to update the rendering of the class (usually a `delite/Widget`)
based on the new values of the changed properties.
The advantage compared to doing that in a custom setter
is that for several properties changes the refresh rendering phase will be called only once,
leading to better performance by making sure the rendering is not modified several times in a row.

<a name="startup"></a>
## Startup Lifecycle

`decor/Invalidating` has an `initializeRendering()` method that it calls on startup, in order to do the initial
rendering of the DOM.
It also calls `computeProperties(this, true)` and `refreshRendering(this, true)`
since those methods tend to have code that is useful for the initial rendering in addition to responding to changes.

So, the startup lifecycle is:

1. mix in the parameters passed to the constructor
2. call `computeProperties(this, true)`
3. call `initializeRendering()`
4. call `refreshRendering(this, true)`

Note that `delite/Widget` replaces the `initializeRendering()` method with `preRender()`, `render()`, and `postRender()`
methods.

<a name="implementing"></a>
## Implementing a Subclass

Once you have set up your class, you will need to implement the lifecycle methods to do the initial rendering,
and then to react to property changes.
This can be done by redefining the `computeProperties()`, `initializeRendering()`, and/or `refreshRendering()` methods.
Both `computeProperties()` and `refreshRendering()` take as parameter a hash object which contains the name of the
properties that have triggered the refresh action.  This is particularly useful when several properties are involved.

```js
define(["dcl/dcl", "decor/Invalidating"/*, ...*/], function (dcl, Invalidating/*, ...*/) {
  return dcl(Invalidating, {
    a: true,
    b: "value",
    computeProperties: function (oldValues) {
      if ("a" in oldValues) {
        // do something logical that does not directly impact the DOM because "a" has changed
        // To access new value, access directly to `this.a`
      }
    },
    initializeRendering: function () {
      // create the initial DOM
    },
    refreshRendering: function (oldValues) {
      if ("b" in oldValues) {
        // modify the DOM because "b" has changed
        // To access new value, access directly to `this.b`
      }
      if ("a" in oldValues) {
      }
    }
  });
});
```

<a name="using"></a>
## Using Invalidating

Once setup you don't need anything special to use the Invalidating class.
You just need to change one of the properties and the refresh methods will be called automatically for you.

If for some reason you want to invalidate a particular property without setting it explicitly
then you can call `notifyCurrentValue(property)`.

In some cases you might want to force the rendering to occur right after a given property has been set.
For that you can use `deliver()`.

In some cases you might want to avoid rendering from occurring even if a property was changed.
For that you can use `discardChanges()`.

<a name="rerender"></a>
## Rerendering from scratch

Usually `initializeRendering()` (or for `delite/Widget`, `render()`) will be called only once, when the widget is created.
However, `decor/Invalidating` has some special code to allow the widget to be rerendered from scratch,
i.e. code to call `initializeRendering()` again, when certain properties are changed.
This is used by `delite/Widget` when the widget's template has been changed.

You can trigger a second call to `initializeRendering()` by defining a `shouldInitializeRendering(oldValues)` method
that returns true when you want `initializeRendering()` to be called.


