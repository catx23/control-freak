define([
	"intern!object",
	"intern/chai!assert"
], function (registerSuite, assert) {

	var container;

	var cssRequire = require.config({
		context: "css",
		//note: BaseUrl is relative to requirejs-dplugins/node_modules/intern/ so baseUrl needs 3 "../"
		//		to be able to access requirejs-dplugins sibling directories.
		//		The last /requirejs-dplugins is here to allow to use css! directly instead of
		//		requirejs-dplugins/css!
		baseUrl: "../../../requirejs-dplugins",
		paths: {lie: "../lie"}
	});

	function getStyles() {
		// summary:
		//		Debugging method to get all the styles in the document.
		var sheets = document.styleSheets;
		return Array.prototype.map.call(sheets, function (s) {
			var rules = s.cssRules || s.rules;
			return Array.prototype.map.call(rules, function (r) {
				return r.cssText;
			});
		}).join("\n");
	}

	registerSuite({
		name: "css",

		setup: function () {
			// For testing that css! loaded styles don't override user-defined styles
			document.head.insertAdjacentHTML("beforeend",
				"<style>.userDefined { border: 1px dashed black; }</style>");

			assert.strictEqual(getStyles().match(/userDefined/g).length, 1, "userDefined CSS inserted");

			// Create some nodes for testing that styles are loaded correctly
			container = document.createElement("div");
			container.innerHTML =
				"<div class=test1 id=test1></div>" +
				"<div class='test1 userDefined' id=userDefined></div>";
			document.body.appendChild(container);
		},

		load: function () {
			var d = this.async(10000);

			// Load two modules that both use requirejs-dplugins/css! to load test1.css
			cssRequire([
				"tests/unit/resources/CssWidget1",
				"tests/unit/resources/CssWidget2"
			], d.callback(function () {
				// test1.css should be automatically loaded (but just once, not twice) by the time
				// this require() call completes.
				assert.strictEqual(getStyles().match(/test1/g).length, 1, "test1.css inserted once");

				// If stylesheet loaded, <div id=test1> should have a background-image defined.
				var backgroundImage = getComputedStyle(window.test1).backgroundImage;
				assert(backgroundImage, "stylesheet loaded");

				// Test that <style> nodes defined by app override the style that was loaded by css!
				assert.strictEqual(getComputedStyle(window.userDefined).borderLeftStyle, "dashed",
						"user defined style wins: " + getStyles());
			}));

			return d;
		},

		reload: function () {
			var d = this.async(10000);

			// Load another modules that uses requirejs-dplugins/css! to load the same test1.css,
			// just to triple check that the CSS doesn't get reloaded
			cssRequire([
				"tests/unit/resources/CssWidget3"
			], d.callback(function () {
				assert.strictEqual(getStyles().match(/test1/g).length, 1, "test1.css inserted once");
			}));

			return d;
		},

		concurrent: function () {
			var d = this.async(10000);

			// Load module with double dependency on test2.css
			cssRequire([
				"tests/unit/resources/CssWidget4"
			], d.callback(function () {
				// test2.css should be automatically loaded (but just once, not twice) by the time
				// this require() call completes.
				assert.strictEqual(getStyles().match(/test2/g).length, 1, "test2.css inserted once");
			}));

			return d;
		},

		loadLayer: function () {
			var d = this.async(10000);

			require.config({
				config: {
					"css": {
						layersMap: {
							"tests/unit/css/module5.css": "tests/unit/css/layer.css"
						}
					}
				},
				context: "css"
			});

			cssRequire([
				"css!tests/unit/css/module5.css"
			], d.callback(function () {
				// layer.css should be loaded instead of module5.css
				assert.strictEqual(getStyles().match(/cssLayer/g).length, 1, "layer.css inserted once");
			}));

			return d;
		},

		teardown: function () {
			container.parentNode.removeChild(container);
		}
	});
});
