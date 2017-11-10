/**
 * Svg loading plugin.
 *
 * This plugin loads an svg graphic and defines it in the DOM, so you can reference it in a `<use>` tag.
 *
 * @example:
 *      To load the svg file `myicons/myicon.svg`:
 *      ```
 *      require(["requirejs-dplugins/svg!myicons/myicon.svg"], function (myiconId){
 *          // myicon was added to the DOM
 *      });
 *      ```
 * @module requirejs-dplugins/svg
 */

define([
	"./has",
	"./Promise!",
	"module",
	"require",
	"requirejs-text/text",
	"requirejs-domready/domReady"
], function (has, Promise, module, localRequire, textPlugin) {
	"use strict";

	var loaded = {}, // paths of loaded svgs
		SPRITE_ID = 'requirejs-dplugins-svg',
		sprite = null;


	var loadSVG = {
		id: module.id,

		/**
		 * Loads an svg file.
		 * @param {string} path - The svg file to load.
		 * @param {Function} resourceRequire - A require function local to the module calling the svg plugin.
		 * @param {Function} onload - A function to call when the specified svg file have been loaded.
		 * @method
		 */
		load: function (path, resourceRequire, onload) {
			if (has("builder")) { // when building
				loaded[path] = true;
				onload();
			} else { // when running
				// special case: when running a built version
				// Replace graphic by corresponding sprite.
				var idInLayer;
				var layersMap = module.config().layersMap;
				if (layersMap && layersMap[path]) {
					idInLayer = layersMap[path].id;
					path = layersMap[path].redirectTo;
				}

				if (!(path in loaded)) {
					loaded[path] = new Promise(function (resolve) {
						localRequire(["requirejs-domready/domReady!"], function () {
							textPlugin.load(path, resourceRequire, function (svgText) {
								if (!sprite) {
									sprite = createSprite(document, SPRITE_ID);
									document.body.appendChild(sprite);
								}
								var symbol = extractGraphicAsSymbol(document, svgText);
								sprite.appendChild(symbol);
								resolve(symbol.getAttribute("id"));
							});
						});
					});
				}

				loaded[path].then(function (symbolId) {
					onload(idInLayer || symbolId);
				});
			}
		}
	};

	if (has("builder")) {
		// build variables
		var writePluginFiles;

		var buildFunctions = {
			/**
			 * Writes the layersMap configuration to the corresponding modules layer.
			 * The configuration will look like this:
			 * ```js
			 * require.config({
			 *     config: {
			 *         "requirejs-dplugins/svg": {
			 *             layersMap: {
			 *                 "file1.svg": {redirectTo: "path/to/layer.svg", id: "id-inside-file-1"},
			 *                 "file2.svg": {redirectTo: "path/to/layer.svg", id: "id-inside-file-2"}
			 *             }
			 *         }
			 *     }
			 * });
			 * ```
			 *
			 * @param {Function} write - This function takes a string as argument
			 * and writes it to the modules layer.
			 * @param {string} mid - Current module id.
			 * @param {string} dest - Current svg sprite path.
			 * @param {Array} loaded - Maps the paths of the svg files contained in current sprite to their ids.
			 */
			writeConfig: function (write, mid, destMid, loaded) {
				var svgConf = {
					config: {},
					paths: {}
				};
				svgConf.config[mid] = {
					layersMap: {}
				};
				for (var path in loaded) {
					svgConf.config[mid].layersMap[path] = {redirectTo: destMid, id: loaded[path]};
				}

				write("require.config(" + JSON.stringify(svgConf) + ");");
			},

			/**
			 * Concatenates all svg files required by a modules layer and write the result.
			 *
			 * @param {Function} writePluginFiles - The write function provided by the builder to `writeFile`.
			 * and writes it to the modules layer.
			 * @param {string} dest - Current svg sprite path.
			 * @param {Array} loaded - Maps the paths of the svg files contained in current sprite to their ids.
			 */
			writeLayer: function (writePluginFiles, dest, loaded) {
				function tryRequire(paths) {
					var module;
					var path = paths.shift();
					if (path) {
						try {
							// This is a node-require so it is synchronous.
							module = require.nodeRequire(path);
						} catch (e) {
							if (e.code === "MODULE_NOT_FOUND") {
								return tryRequire(paths);
							} else {
								throw e;
							}
						}
					}
					return module;
				}

				var fs = require.nodeRequire("fs"),
					jsDomPath = require.getNodePath(require.toUrl(module.id).replace(/[^\/]*$/, "node_modules/jsdom")),
					jsDomModule = tryRequire([jsDomPath, "jsdom"]);

				var path, url, svgText;
				if (!jsDomModule) {
					console.log(">> WARNING: Node module jsdom not found. Skipping SVG bundling. If you" +
						" want SVG bundling run 'npm install jsdom' in your console.");
					for (path in loaded) {
						url = require.toUrl(path);
						svgText = fs.readFileSync(url, "utf8");
						writePluginFiles(url, svgText);
					}
					return false;
				} else {
					var jsdom = jsDomModule.jsdom,
						document = jsdom("<html></html>"),
						sprite = createSprite(document);

					for (path in loaded) {
						url = require.toUrl(path);
						svgText = fs.readFileSync(url, "utf8");
						var symbol = extractGraphicAsSymbol(document, svgText);
						sprite.appendChild(symbol);
						loaded[path] = symbol.getAttribute("id");
					}

					writePluginFiles(dest, sprite.outerHTML);
					return true;
				}
			}
		};

		loadSVG.writeFile = function (pluginName, resource, require, write) {
			writePluginFiles = write;
		};

		loadSVG.onLayerEnd = function (write, layer) {
			if (layer.name && layer.path) {
				var dest = layer.path.replace(/^(.*\/)?(.*).js$/, "$1/$2.svg"),
					destMid = layer.name + ".svg";

				// Write layer file and config
				var success = buildFunctions.writeLayer(writePluginFiles, dest, loaded);
				success && buildFunctions.writeConfig(write, module.id, destMid, loaded);

				// Reset cache
				loaded = {};
			}
		};

	}

	return loadSVG;

	// makes a symbol out of an svg graphic
	function extractGraphicAsSymbol(document, svgText) {
		var div = document.createElement("div");
		div.innerHTML = svgText;
		var element = div.querySelector("svg"),
			id = element.getAttribute("id"),
			viewBox = element.getAttribute("viewbox") || element.getAttribute("viewBox"),
			symbol = createSymbol(document, id, element, viewBox);
		return symbol;
	}

	// makes symbol from svg element
	function createSymbol(document, id, element, viewBox) {
		var symbol = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
		while (element.firstChild) {
			symbol.appendChild(element.firstChild);
		}
		typeof id === "string" && symbol.setAttribute("id", id);
		typeof viewBox === "string" && symbol.setAttribute("viewBox", viewBox);
		return symbol;
	}

	// creates empty sprite
	function createSprite(document, id) {
		var sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		sprite.setAttribute("style", "display: none");
		id && sprite.setAttribute("id", id);
		return sprite;
	}
});
