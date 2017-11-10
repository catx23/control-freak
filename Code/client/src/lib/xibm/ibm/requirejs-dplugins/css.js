/**
 * CSS loading plugin for widgets.
 *
 * This plugin will load and wait for a css file. This can be handy to load the css
 * specific to a widget.
 *
 * This plugin uses the link load event and a work-around on old webkit browsers.
 * The work-around watches a stylesheet until its rules are
 * available (not null or undefined).
 *
 * This plugin will return the path of the inserted css file relative to requirejs baseUrl.
 *
 * @example:
 *      To load the css file `myproj/comp.css`:
 *      ```
 *      require(["requirejs-dplugins/css!myproj/comp.css"], function (){
 *          // Code placed here will wait for myproj/comp.css before running.
 *      });
 *      ```
 *
 *      Or as a widget dependency:
 *      ```
 *      define(["requirejs-dplugins/css!myproj/comp.css"], function (){
 *          // My widget factory
 *      });
 *      ```
 *
 * @module requirejs-dplugins/css
 */

define([
	"./has",
	"./Promise!",
	"module"
], function (has, Promise, module) {
	"use strict";

	has.add("event-link-onload-api", function (global) {
		var wk = global.navigator.userAgent.match(/AppleWebKit\/([\d.]+)/);
		return !wk || parseInt(wk[1], 10) > 535;
	});
	var cache = {},
		lastInsertedLink;

	/**
	 * Return a promise that resolves when the specified link has finished loading.
	 * @param {HTMLLinkElement} link - The link element to be notified for.
	 * @returns {module:jQuery/Promise} - A promise.
	 * @private
	 */
	var listenOnLoad = function (link) {
		return new Promise(function (resolve) {
			if (has("event-link-onload-api")) {
				// We're using "readystatechange" because IE happily support both
				link.onreadystatechange = link.onload = function () {
					if (!link.readyState || link.readyState === "complete") {
						link.onreadystatechange = link.onload = null;
						resolve();
					}
				};
			} else {
				var poll = function () {
					// watches a stylesheet for loading signs.
					var sheet = link.sheet || link.styleSheet,
						styleSheets = document.styleSheets;
					if (sheet && Array.prototype.lastIndexOf.call(styleSheets, sheet) !== -1) {
						resolve();
					} else {
						setTimeout(poll, 25);
					}
				};
				poll();
			}
		});
	};

	var loadCss = {
		id: module.id,

		/*jshint maxcomplexity: 11*/
		/**
		 * Loads a css file.
		 * @param {string} path - The css file to load.
		 * @param {Function} require - A local require function to use to load other modules.
		 * @param {Function} callback - A function to call when the specified stylesheets have been loaded.
		 * @method
		 */
		load: function (path, require, callback) {
			if (has("builder")) {
				buildFunctions.addOnce(loadList, path);
				callback();
				return;
			}

			// Replace single css bundles by corresponding layer.
			var config = module.config();
			if (config.layersMap) {
				path = config.layersMap[path] || path;
			}

			var head = document.head || document.getElementsByTagName("head")[0],
				url = require.toUrl(path),
				link;

			// if the url has not already been injected/loaded, create a new promise.
			if (!cache[url]) {
				// hook up load detector(s)
				link = document.createElement("link");
				link.rel = "stylesheet";
				link.type = "text/css";
				link.href = url;
				head.insertBefore(link, lastInsertedLink ? lastInsertedLink.nextSibling : head.firstChild);
				lastInsertedLink = link;
				cache[url] = listenOnLoad(link);
			}

			cache[url].then(function () {
				// The stylesheet has been loaded, so call the callback
				callback(path);
			});
		}
	};

	if (has("builder")) {
		// build variables
		var loadList = [],
			writePluginFiles;

		var buildFunctions = {
			/**
			 * Write the layersMap configuration to the corresponding modules layer.
			 * The configuration will look like this:
			 * ```js
			 * require.config({
			 *     config: {
			 *         "requirejs-dplugins/css": {
			 *             layersMap: {
			 *                 "module1.css": "path/to/layer.css",
			 *                 "module2.css": "path/to/layer.css"
			 *             }
			 *         }
			 *     }
			 * });
			 * ```
			 *
			 * @param {Function} write - This function takes a string as argument
			 * and writes it to the modules layer.
			 * @param {string} mid - Current module id.
			 * @param {string} dest - Current css layer path.
			 * @param {Array} loadList - List of css files contained in current css layer.
			 */
			writeConfig: function (write, mid, dest, loadList) {
				var cssConf = {
					config: {}
				};
				cssConf.config[mid] = {
					layersMap: {}
				};
				loadList.forEach(function (path) {
					cssConf.config[mid].layersMap[path] = dest;
				});

				write("require.config(" + JSON.stringify(cssConf) + ");");
			},

			/**
			 * Concat and optimize all css files required by a modules layer and write the result.
			 * The node module `clean-css` is responsible for optimizing the css and correcting
			 * images paths.
			 *
			 * @param {Function} writePluginFiles - The write function provided by the builder to `writeFile`.
			 * and writes it to the modules layer.
			 * @param {string} dest - Current css layer path.
			 * @param {Array} loadList - List of css files contained in current css layer.
			 * @returns {boolean} Return `true` if the function successfully writes the layer.
			 */
			writeLayer: function (writePluginFiles, dest, loadList) {
				function tryRequire(paths) {
					var module;
					var path = paths.shift();
					if (path) {
						try {
							// This is a node-require so it is synchronous.
							module = require.nodeRequire(path);
						} catch (e) {
							return tryRequire(paths);
						}
					}
					return module;
				}

				var path = require.getNodePath(require.toUrl(module.id).replace(/[^\/]*$/, "node_modules/clean-css"));
				var CleanCSS = tryRequire([path, "clean-css"]);
				var fs = require.nodeRequire("fs");

				loadList = loadList.map(require.toUrl)
					.filter(function (path) {
						if (!fs.existsSync(path)) {
							console.log(">> Css file '" + path + "' was not found.");
							return false;
						}
						return true;
					});

				if (CleanCSS) {
					var layer = "";
					loadList.forEach(function (src) {
						var result = new CleanCSS({
							relativeTo: "./",
							target: dest
						}).minify("@import url(" + src + ");");
						// Support clean-css version 2.x and 3.x
						layer += result.styles || result;
					});

					writePluginFiles(dest, layer);
					return true;
				} else {
					console.log(">> WARNING: Node module clean-css not found. Skipping CSS inlining. If you" +
						" want CSS inlining run 'npm install clean-css' in your console.");
					loadList.forEach(function (src) {
						writePluginFiles(src, fs.readFileSync(src));
					});
					return false;
				}
			},

			/**
			 * Add the string to `ary` if it's not already in it.
			 * @param {Array} ary - Destination array.
			 * @param {string} element - Element to add.
			 */
			addOnce: function (ary, element) {
				if (ary.indexOf(element) === -1) {
					ary.push(element);
				}
			}
		};

		loadCss.writeFile = function (pluginName, resource, require, write) {
			writePluginFiles = write;
		};

		loadCss.onLayerEnd = function (write, data) {
			if (data.name && data.path) {
				var dest = data.path.replace(/\.js$/, ".css");
				var destMid = data.name + ".css";

				// Write layer file
				var success = buildFunctions.writeLayer(writePluginFiles, dest, loadList);
				// Write css config on the layer if the layer was successfully written.
				success && buildFunctions.writeConfig(write, module.id, destMid, loadList);
				// Reset loadList
				loadList = [];
			}
		};

		// Expose build functions to be used by delite/theme
		loadCss.buildFunctions = buildFunctions;
	}

	return loadCss;
});
