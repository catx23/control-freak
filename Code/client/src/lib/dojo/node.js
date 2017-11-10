define([
	"dojo/_base/kernel",
	"dojo/has",
	"require",
	"dojo/noob" //empty module
], function (kernel, has, require, noob) {

	var nodeRequire = kernel.global.require && kernel.global.require.nodeRequire;
	var _window = typeof window !== 'undefined' ? window : null;
	var isElectron = _window && _window.process && _window.process.type === "renderer";
	var module = nodeRequire ? nodeRequire("module") : null;
	if (!nodeRequire) {
		//@TODO: notice that window.nodeRequire must be set manually in your Electron renderer code. I could not extract the
		//Electron's require from anywhere.
		if (isElectron && _window && _window.nodeRequire) {
			nodeRequire = _window.nodeRequire;
			module = nodeRequire("module");
		} else {
		    if(has('debug')) {
                console.warn("Cannot get Electron/Node.js require, will noob to empty module dojo/noob");
            }
		}
	}
	return {
		// summary:
		//		This AMD plugin module allows native Node.js modules to be loaded by AMD modules using the Dojo
		//		loader. This plugin will not work with AMD loaders that do not expose the Node.js require function
		//		at `require.nodeRequire`.
		//
		// example:
		//	|	require(["dojo/node!fs"], function(fs){
		//	|		var fileData = fs.readFileSync("foo.txt", "utf-8");
		//	|	});

		load: function (/*string*/ id, /*Function*/ contextRequire, /*Function*/ load) {
			/*global define:true */
			// The `nodeRequire` function comes from the Node.js module of the AMD loader, so module ID resolution is
			// relative to the loader's path, not the calling AMD module's path. This means that loading Node.js
			// modules that exist in a higher level or sibling path to the loader will cause those modules to fail to
			// resolve.
			//
			// Node.js does not expose a public API for performing module filename resolution relative to an arbitrary
			// directory root, so we are forced to dig into the internal functions of the Node.js `module` module to
			// use Node.js's own path resolution code instead of having to duplicate its rules ourselves.
			//
			// Sooner or later, probably around the time that Node.js internal code is reworked to use ES6, these
			// methods will no longer be exposed and we will have to find another workaround if they have not exposed
			// an API for doing this by then.
			if (module && module._findPath && module._nodeModulePaths) {
				var localModulePath = module._findPath(id, module._nodeModulePaths(contextRequire.toUrl(".")));
				if (localModulePath !== false) {
					id = localModulePath;
				}
			}

			if (id && typeof  global !== "undefined" && global.moduleCache && global.moduleCache[id]) {
				return global.moduleCache[id];
			}

			//noob out modules when not node-js and not electron
			if (!module) {
				return load(noob);
			}

			var oldDefine = define,
				result;

			// Some modules attempt to detect an AMD loader by looking for global AMD `define`. This causes issues
			// when other CommonJS modules attempt to load them via the standard Node.js `require`, so hide it
			// during the load
			define = undefined;

			try {
				result = nodeRequire(id);
			}
			finally {
				define = oldDefine;
			}

			load(result);
		},
		normalize: function (/**string*/ id, /*Function*/ normalize) {
			// summary:
			//		Produces a normalized CommonJS module ID to be used by Node.js `require`. Relative IDs
			//		are resolved relative to the requesting module's location in the filesystem and will
			//		return an ID with path separators appropriate for the local filesystem

			if (id.charAt(0) === ".") {
				// absolute module IDs need to be generated based on the AMD loader's knowledge of the parent module,
				// since Node.js will try to use the directory containing `dojo.js` as the relative root if a
				// relative module ID is provided
				id = require.toUrl(normalize("./" + id));
			}

			if (!module) {
				id = normalize('dojo/noob');
			}

			return id;
		}
	};
});
