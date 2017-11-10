/* global context:true, onlyLayer:true */
define([
	"intern!object",
	"intern/chai!assert"
], function (registerSuite, assert) {
	var index = 0;

	function getNewContext() {
		index++;
		return "v" + index;
	}

	function setupContext(options) {
		context = getNewContext();
		require.config({
			context: context,
			//note: BaseUrl is relative to requirejs-dplugins/node_modules/intern/ so baseUrl needs 3 "../"
			//		to be able to access requirejs-dplugins sibling directories.
			//		The last /requirejs-dplugins is here to allow to use i18n! directly instead of
			//		requirejs-dplugins/i18n!
			baseUrl: "../../../requirejs-dplugins",
			packages: [{
				name: "myapp",
				location: "tests/unit/resources/app/dist/myapp"
			}],
			config: {
				i18n: {
					layerOnly: options[0],
					enhanceLayer: options[1],
					languagePack: options[2]
				}
			}
		});
	}

	function execTest(locale, testFunc) {
		var contextRequire = require.config({
			context: context,
			locale: locale
		});

		contextRequire(["myapp/test"], function (test) {
			if (!onlyLayer) {
				contextRequire(["i18n!myapp/nls/bundleC", "i18n!myapp/nls/bundleD"], function (bC, bD) {
					test.bundleC = bC.MSG;
					test.bundleD = bD.MSG;
					testFunc(test);
				});
			} else {
				testFunc(test);
			}
		});
	}


	registerSuite({
		name: "i18n - layerOnly - !enhanceLayer - languagePack",
		setup: function () {
			context = "";
			onlyLayer = true;
		},
		beforeEach: function () {
			setupContext([onlyLayer, false, true]);
		},
		"fr": function () {
			var dfd = this.async();
			var hint = "The text should come from the exact layer";

			execTest("fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hint);
			}));
		},
		"fr-fr (404 fr-fr expected)": function () {
			var dfd = this.async();
			var hint = "The text should come from the best layer (ie. fr)";

			execTest("fr-fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hint);
			}));
		},
		"en": function () {
			var dfd = this.async();
			var hint = "The unknown layer en should be used";

			execTest("en", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "En from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "En from Layer Bundle B", hint);
			}));
		},
		"it (404 it expected)": function () {
			var dfd = this.async();
			var hint = "The root layer should be used when a locale does not exist";

			execTest("it", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Root Text from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "Root Text from Layer Bundle B", hint);
			}));
		}
	});

	registerSuite({
		name: "i18n - layerOnly - !enhanceLayer - !languagePack",
		setup: function () {
			context = "";
			onlyLayer = true;
		},
		beforeEach: function () {
			setupContext([onlyLayer, false, false]);
		},
		"fr": function () {
			var dfd = this.async();
			var hint = "The text should come from the exact layer";

			execTest("fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hint);
			}));
		},
		"fr-fr": function () {
			var dfd = this.async();
			var hint = "The text should come from the best layer (ie. fr)";

			execTest("fr-fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hint);
			}));
		},
		"en": function () {
			var dfd = this.async();
			var hint = "The en layer should not be discovered";

			execTest("en", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Root Text from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "Root Text from Layer Bundle B", hint);
			}));
		},
		"it": function () {
			var dfd = this.async();
			var hint = "The root layer should be used when a locale does not exist";

			execTest("it", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Root Text from Layer Bundle A", hint);
				assert.strictEqual(test.bundleB, "Root Text from Layer Bundle B", hint);
			}));
		}
	});

	registerSuite({
		name: "i18n - !layerOnly - !enhanceLayer - !languagePack",
		setup: function () {
			context = "";
			onlyLayer = false;
		},
		beforeEach: function () {
			setupContext([onlyLayer, false, false]);
		},
		"fr": function () {
			var dfd = this.async();
			var hintLayer = "The text should come from the exact layer";
			var hintBundle = "The best match should be found";

			execTest("fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"fr-fr": function () {
			var dfd = this.async();
			var hintLayer = "The layer should not be enhanced";
			var hintBundle = "The best match should be found";

			execTest("fr-fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr-fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"en": function () {
			var dfd = this.async();
			var hintLayer = "The layer en should not be found";
			var hintBundle = "The best match should be found";

			execTest("en", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Root Text from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Root Text from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Root Text from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Root Text from Bundle D", hintBundle);
			}));
		}
	});

	registerSuite({
		name: "i18n - !layerOnly - enhanceLayer - !languagePack",
		setup: function () {
			context = "";
			onlyLayer = false;
		},
		beforeEach: function () {
			setupContext([onlyLayer, true, false]);
		},
		"fr": function () {
			var dfd = this.async();
			var hintLayer = "The text should come from the exact layer";
			var hintBundle = "The best match should be found";

			execTest("fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"fr-fr": function () {
			var dfd = this.async();
			var hintLayer = "The layer should be enhanced";
			var hintBundle = "The best match should be found";

			execTest("fr-fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr-fr from Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr-fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"en": function () {
			var dfd = this.async();
			var hintLayer = "The layer en should not be found";
			var hintBundle = "The best match should be found";

			execTest("en", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Root Text from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Root Text from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Root Text from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Root Text from Bundle D", hintBundle);
			}));
		}
	});

	registerSuite({
		name: "i18n - !layerOnly - !enhanceLayer - languagePack",
		setup: function () {
			context = "";
			onlyLayer = false;
		},
		beforeEach: function () {
			setupContext([onlyLayer, false, true]);
		},
		"fr": function () {
			var dfd = this.async();
			var hintLayer = "The text should come from the exact layer";
			var hintBundle = "The best match should be found";

			execTest("fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"fr-fr (404 fr-fr expected)": function () {
			var dfd = this.async();
			var hintLayer = "The layer should not be enhanced";
			var hintBundle = "The best match should be found";

			execTest("fr-fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr-fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"en": function () {
			var dfd = this.async();
			var hintLayer = "The layer en should be found";
			var hintBundle = "The best match should be found";

			execTest("en", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "En from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "En from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Root Text from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Root Text from Bundle D", hintBundle);
			}));
		}
	});

	registerSuite({
		name: "i18n - !layerOnly - enhanceLayer - languagePack",
		setup: function () {
			context = "";
			onlyLayer = false;
		},
		beforeEach: function () {
			setupContext([onlyLayer, true, true]);
		},
		"fr": function () {
			var dfd = this.async();
			var hintLayer = "The text should come from the exact layer";
			var hintBundle = "The best match should be found";

			execTest("fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"fr-fr (404 fr-fr expected)": function () {
			var dfd = this.async();
			var hintLayer = "The layer should be enhanced";
			var hintBundle = "The best match should be found";

			execTest("fr-fr", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "Fr-fr from Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "Fr from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Fr-fr from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Fr from Bundle D", hintBundle);
			}));
		},
		"en": function () {
			var dfd = this.async();
			var hintLayer = "The layer en should be found";
			var hintBundle = "The best match should be found";

			execTest("en", dfd.callback(function (test) {
				assert.strictEqual(test.bundleA, "En from Layer Bundle A", hintLayer);
				assert.strictEqual(test.bundleB, "En from Layer Bundle B", hintLayer);
				assert.strictEqual(test.bundleC, "Root Text from Bundle C", hintBundle);
				assert.strictEqual(test.bundleD, "Root Text from Bundle D", hintBundle);
			}));
		}
	});
});
