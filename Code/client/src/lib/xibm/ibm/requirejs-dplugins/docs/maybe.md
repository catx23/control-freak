---
layout: doc
title: requirejs-dplugins/maybe
---

# requirejs-dplugins/maybe!

`requirejs-dplugins/maybe` allows to require modules that may or may not exist.
If the module is not found, the loader will not crash (like it would do without this plugin) but there is an
expected 404 and the return value for the module will be `undefined`.

__Note:__ You should use this plugin with caution as requiring multiple nonexistent files will have an impact on
performances.


## Sample
```
require(["requirejs-dplugins/maybe!a/module/id"], function(module){
    if (module === undefined) {
        //do something when module IS NOT found
    } else {
        //do something else when module IS found
    }
});
```

## Build

This plugin is not doing anything special at the build. Nothing is added to the layer even if the module
exists.
