---
layout: doc
title: decor/schedule
---

# decor/schedule

`decor/schedule` is a utility function that tries to run the given callback (the first argument)
at the end of [micro-task](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#microtask),
which happens with IE11+ as well as latest Firefox/Chrome/Safari.
For other browsers, notably ones not supporting [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver),
`decor/schedule` attempts to take the quickest way reasonably possible to run the given callback
after [micro-task](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#microtask) ends.

`decor/schedule` returns a handle with `.remove()` method. If `.remove()` is called before the callback runs, running the callback will be cancelled.
