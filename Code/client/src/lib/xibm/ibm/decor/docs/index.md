---
layout: docMain
---

The decor project contains some classes and utilities that are not directly related to UI.

## Observable classes

* [Invalidating](Invalidating.md) - Mixin class to for UI-related Custom Elements that want to calculate computed
  properties at once and/or to render UI at once upon multiple property changes
* [Observable](Observable.md) - The bedrock observable class, ES7 `Object.observe()` shim based on value-holder object
* [Stateful](Stateful.md) - Base class for widgets or other objects to allow ES5 getter/setter of properties and
  a simplified interface for notifications of property changes.

## Other classes

* [Destroyable](Destroyable.md) - Base class to track handles and release them when the instance is destroyed.
* [Evented](Evented.md) - Base class to emit events and let applications easily monitor those events.
* [schedule](schedule.md) - A utility function to schedule a callback at the end of [micro-task](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#microtask).
* [sniff](sniff.md) - Browser sniffing.

## General information

* [Decor architecture](architecture.md) - Notes on decor's design choices.