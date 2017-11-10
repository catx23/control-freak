/**
 * This is a new Dojo 1.7 style build profile. Look at util/build/buildControlDefault.js if you want to explore the
 * default Dojo build profile options.
 */
// This function is used to determine whether or not a resource should be tagged as copy-only. See the resourceTags
// property below for more information.
function copyOnly(mid) {
    return mid in {
        // There are no modules right now in dojo boilerplate that are copy-only. If you have some, though, just add
        // them here like this:
        'xide/resources': 1,
        'cssMobile': 1
    };
}

var profile = {
    // basePath is relative to the directory containing this profile file; in this case, it is being set to the
    // src/ directory, which is the same place as the baseUrl directory in the loader configuration. (If you change
    // this, you will also need to update run.js).
    basePath: '../',

    // This is the directory within the release directory where built packages will be placed. The release directory
    // itself is defined by build.sh. You really probably should not use this; it is a legacy option from very old
    // versions of Dojo (like, version 0.1). If you do use it, you will need to update build.sh, too.
    // releaseName: '',

    // Builds a new release.
    action: 'release',

    // Strips all comments from CSS files.
    //cssOptimize: 'comments',

    // Excludes tests, demos, and original template files from being included in the built version.
    mini: true,

    // Uses Closure Compiler as the JavaScript minifier. This can also be set to "shrinksafe" to use ShrinkSafe.
    // Note that you will probably get some “errors” with CC; these are generally safe to ignore, and will be
    // fixed in a later version of Dojo. This defaults to "" (no compression) if not provided.
    optimize: 'closure',

    // We’re building layers, so we need to set the minifier to use for those, too. This defaults to "shrinksafe" if
    // it is not provided.
    layerOptimize: 'closure',

    // Strips all calls to console functions within the code. You can also set this to "warn" to strip everything
    // but console.error, and any other truthy value to strip everything but console.warn and console.error.
    stripConsole: 'warn',

    // The default selector engine is not included by default in a dojo.js build in order to make mobile builds
    // smaller. We add it back here to avoid that extra HTTP request. There is also a "lite" selector available; if
    // you use that, you’ll need to set selectorEngine in app/run.js too. (The "lite" engine is only suitable if you
    // are not supporting IE7 and earlier.)
    selectorEngine: 'lite',

    // Builds can be split into multiple different JavaScript files called “layers”. This allows applications to
    // defer loading large sections of code until they are actually required while still allowing multiple modules to
    // be compiled into a single file.
    layers: {
        // This is the main loader module. It is a little special because it is treated like an AMD module even though
        // it is actually just plain JavaScript. There is some extra magic in the build system specifically for this
        // module ID.
        'dojo/dojo': {
            // In addition to the loader (dojo/dojo) and the loader configuration file (app/run), we’re also including
            // the main application (app/main) and the dojo/i18n and dojo/domReady modules because they are one of the
            // conditional dependencies in app/main (the other being app/Dialog) but we don’t want to have to make
            // extra HTTP requests for such tiny files.
            include: [
                'dojo/dojo',
                'xtest/main',
                'dojo/domReady',
                'dojo/i18n',
                'xdojo/declare',
                'xace/views/Editor',//  <--- important to be before xide/types/Types. No idea why

                'xide/types/Types',

                'xcf/types/Types',

                'xtest/Widgets',

                'xtest/Managers',
                'xtest/Views',

                'xcf/GUIALL',
                'dojo/_base/lang',
                'dojo/dom-class',
                'dojo/parser',
                'dojo/_base/window',
                'xblox/embedded_ui',


                'xnode/component',
                'xnode/types',
                'xnode/xnode',
                'xnode/views/NodeServiceView',
                'xnode/manager/NodeServiceManager',
                'xnode/manager/NodeServiceManagerUI',

                'xblox/views/BlocksFileEditor',
                'xblox/views/Grid',
                'xblox/views/ThumbRenderer',
                'xblox/BlockActions',
                'xblox/component',

                'dstore/Cache',

                'dojo/debounce',
                'dojo/uacss',
                'xcf/manager/BlockManager',

                'xcf/manager/Application_UI',
                'xide/manager/Application_XFILE',
                'xide/manager/Application_XBLOX',
                'xide/views/_CIDialog',
                "xide/data/Reference",
                'dojo/Deferred',
                'dijit/dijitb',
                'xide/registry',

                'xide/types',
                'xide/utils',
                'xide/factory',
                'xace/views/Editor',
                'xide/views/_CIDialog',
                "xide/data/Reference",
                'xlog/views/LogGrid',
                'xlog/xlog',
                'xgrid/xgrid',
                'dgrid/dgrid',
                'xide/xide',
                'xfile/xfile',
                'xdocker/xdocker',
                'xide/widgets/ExpressionJavaScript',
                'xide/widgets/RichTextWidget',
                'xide/widgets/ToggleButton',
                'xide/manager/Application_XNODE',
                'xide/manager/WindowManager',
                'xide/manager/NotificationManager',
                'xide/manager/Context_UI',
                'xide/mixins/_State',
                'xide/mixins/ResourceMixin',
                'xide/views/_Console',
                'xide/views/_ConsoleWidget',
                'xide/views/_LayoutMixin',
                'xide/views/_MainView',
                'xide/views/Dialog',
                'xide/views/TextEditor',
                "xide/json/JSONEditor",
                'xide/Wizards',
                'xide/widgets/MainMenu',
                'xide/widgets/JSONEditorWidget',
                'xide/container/_PaneBase',
                'xide/layout/Container',
                'xide/layout/ContentPane',
                'xide/layout/_Accordion',
                'xide/layout/_TabContainer',

                'xide/container/TabContainer',

                'xlang/i18',
                'xide/Lang',
                'xide/debug',
                'xide/Lang',

                'xfile/component',
                'xfile/FileActions',
                'xfile/FolderSize',
                'xfile/Statusbar',
                'xfile/ThumbRenderer',
                'xfile/data/Store',
                'xfile/factory/Store',
                'xfile/manager/BlockManager',
                'xfile/manager/FileManager',
                'xfile/manager/FileManagerActions',
                'xfile/manager/MountManager',
                'xfile/model/File',
                'xfile/views/FileConsole',
                'xfile/views/FileGrid',
                'xfile/views/FilePicker',
                'xfile/views/FilePreview',
                'xfile/views/FileSize',
                'xfile/views/Grid',
                'xfile/views/UploadMixin',


                //ve - extras
                "dgrid/Editor",


                'xide/widgets/ExpressionJavaScript',
                "xwire/Binding",
                "xwire/Source",
                "xwire/Target",
                "xwire/WidgetSource",
                "xwire/WidgetTarget",
                "xwire/EventSource",
                "xwire/DeviceTarget",
                'dojo/date',
                'dojo/date/locale',
                'xblox/views/BlockGrid',
                'xblox/manager/BlockManagerUI',
                'xblox/model/Block_UI',
                'xide/utils/TestUtils',
                'xblox/utils/TestUtils',
                'xide/serverDebug',
                "xide/manager/ResourceManager",
                "xblox/manager/BlockManager",
                "xcf/manager/DeviceManager",
                "xcf/manager/DeviceManager_UI",
                "xcf/manager/DriverManager",
                "xcf/manager/DriverManager_UI",
                "xide/mixins/EventedMixin",
                "xide/mixins/ReloadMixin",
                "dcl/dcl",
                "xide/manager/WindowManager",
                "xlog/manager/LogManager",
                "xide/manager/SettingsManager",
                'xide/encoding/MD5',
                "xcf/views/DriverView2"
            ],

            // By default, the build system will try to include dojo/main in the built dojo/dojo layer, which adds a
            // bunch of stuff we don’t want or need. We want the initial script load to be as small and quick as
            // possible, so we configure it as a custom, bootable base.
            boot: false,
            customBase: true
        }
        // In the demo application, we conditionally require app/Dialog on the client-side, so we’re building a
        // separate layer containing just that client-side code. (Practically speaking, you’d probably just want
        // to roll everything into a single layer, but I wanted to make sure to illustrate multi-layer builds.)

    },
    useSourceMaps:0,
    cssOptimize:"",
    localeList:'en-us',
    // Providing hints to the build system allows code to be conditionally removed on a more granular level than
    // simple module dependencies can allow. This is especially useful for creating tiny mobile builds.
    // Keep in mind that dead code removal only happens in minifiers that support it! Currently, ShrinkSafe does not
    // support dead code removal; Closure Compiler and UglifyJS do.
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api':0,
        'dojo-log-api':0,
        'dojo-bidi':0,
        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates':0,
        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader':0,
        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory':0,
        // We aren’t loading tests in production
        'dojo-test-sniff':0,
        'dojo-v1x-i18n-Api':1,

        'dojo-firebug': false,
        'tab-split':true,
        'dojo-undef-api': true,
        'xblox':true,
        'xblox-ui':true,
        'xlog':true,
        'config-stripStrict': 0,
        'xideve':false,
        'xreload':true,
        'xidebeans':true,
        'delite':true,
        'xexpression':false,
        'filtrex':true,
        'ace-formatters':false,
        'xnode-ui':true,
        'xfile':true,
        'xcf-ui':true,
        'host-node':false,
        'xace':true,
        'drivers':false,
        'files':true,
        'protocols':false,
        'devices':false,
        'debug':false,
        'host-browser':true,
        'xaction':true,
        'php':false
    },

    // Resource tags are functions that provide hints to the compiler about a given file. The first argument is the
    // filename of the file, and the second argument is the module ID for the file.
    resourceTags: {
        // Files that contain test code.
        test: function (filename, mid) {
            if(filename){
                if(
                    //filename.indexOf('tests') !==-1 ||
                    filename.indexOf('/out') !==-1 ||
                    ////filename.indexOf('xidebuild') !==-1 ||
                    filename.indexOf('serverbuild') !==-1 ||
                    filename.indexOf('node_modules') !==-1||
                    filename.indexOf('build/') !==-1||
                    filename.indexOf('xapp/bootr') !==-1||
                    filename.indexOf('minimatch') !==-1||
                    filename.indexOf('xide/json/ace') !==-1||
                    filename.indexOf('bower_components') !==-1
                )
                    return true;
            }
        },

        // Files that should be copied as-is without being modified by the build system.
        copyOnly: function (filename, mid) {
            return copyOnly(mid);
        },

        // Files that are AMD modules.
        amd: function (filename, mid) {
            return !copyOnly(mid) && /\.js$/.test(filename);
        },

        // Files that should not be copied when the “mini” compiler flag is set to true.
        miniExclude: function (filename, mid) {
            return mid in {
                'xapp/profile': 1
            };
        }
    }
};
