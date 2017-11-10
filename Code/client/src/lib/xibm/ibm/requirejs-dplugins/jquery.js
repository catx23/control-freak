/**
 * Plugin to load specified jQuery module(s), unless the application has loaded the whole jQuery
 * library via a `<script>` tag, in which case it just returns a pointer to the already loaded jQuery.
 * Useful to avoid loading jQuery twice.
 *
 * @example:
 * To get a jQuery object that can modify classes and do animations:
 * ```
 * require(["requirejs-dplugins/jquery!attributes/classes,effects"], function ($){
 *     ...
 *     $(myNode).addClass("selected");
 *     $(myNode).animate(...);
 * });
 * ```
 *
 * @module requirejs-dplugins/jquery
 */

define([], function () {

	// This is modifying and using the global require() configuration.  Is there a better way?
	// I tried using a local require but it doesn't have a config() method.
	require.config({
		map: {
			jquery: {
				"jquery/src/selector": "jquery/src/selector-native"     // don't pull in sizzle
			}
		}
	});

	// Convert abbreviated list of jQuery modules to real list of jQuery modules
	//		1. Always include jquery/core since some modules like jquery/attributes/classes don't return
	//		   anything.
	//		2. Fix paths to modules by prefixing each module name with jQuery/src.  The "src" directoy
	//		   is to match the directory structure in the jQuery installed via bower.
	//
	// Ex: "attributes/classes,effects" --> ["jquery/src/core", "jquery/src/attributes/classes", "jquery/src/effects"]
	function getModules(str) {
		return ["core"].concat(str.split(/, */)).map(function (amid) {
			return "jquery/src/" + amid;
		});
	}

	return {
		normalize: function (resource) {
			// Don't do any normalization here; it's done when getModules() is called.
			return resource;
		},

		load: function (resource, req, onLoad, config) {
			/* global jQuery */
			/* global $ */
			if (config.isBuild) {
				onLoad();
			} else if (typeof jQuery !== "undefined") {
				onLoad(jQuery);
			} else if (typeof $ !== "undefined") {
				onLoad($);
			} else {
				require(getModules(resource), function ($) {
					onLoad($);
				});
			}
		},

		// Interface for grunt-amd-build.  If the application doesn't want jQuery in the layer it should exclude
		// it through directives to grunt-amd-build.
		addModules: function (pluginName, resource, addModules) {
			addModules(getModules(resource));
		}
	};
});
