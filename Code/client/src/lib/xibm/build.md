# Final Built Parts ("Release" mode) 

1. App (the one which contains the Dojo stuff (dom-construct,...))
built as dojo/dojo

2. "Plugins" (whatever this means)
built into plugins

3. "Views" (whatever this means)
built into views


Make sure that myapp/views has no modules from myapp/plugins and vice versa


<hr/>

# Debug mode

In this mode all modules from app, plugins, views will point typically into a directory

/dijit
/dojo
/views
/plugins
/app/main

via dojo config's packages entry

I usually place an empty file in each package directory which I want to have pre-compiled:

/views/views.js
/plugins/plugins.js


So that I can use the same bootstrap for "debug" and "release" in my apps my
 
require([
    'views/view',
    'plugins/plugins'
    ],function(views,plugins){
    
    // do main stuff here
    
};


# Building

I have always one build profile for each package: 

So my pre-built layers are always built with same naming as i use in my bootstrap shown above

layers: {
    'views/views':{
    }
}

or 

layers: {
    'plugins/plugins':{
    }
}


## main app

After all, I run the dojo compiler with --require "see file below" :
 
require({
    packages: [
        'dojo',
        'dijit',
        'dojox',
        {
            name: 'app',
            location: 'app',
            packageMap: {}
        }        
    ],

    // This is a hack. In order to allow app/main and app/run to be built together into a single file, a cache key needs
    // to exist here in order to force the loader to actually process the other modules in the file. Without this hack,
    // the loader will think that code for app/main has not been loaded yet and will try to fetch it again, resulting in
    // a needless extra HTTP request.
    cache: {}
    // Require 'app'. This loads the main application file, app/main.js.
}, ['app']);
