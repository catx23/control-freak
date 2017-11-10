define([
	"intern!object",
	"intern/chai!assert"
], function (registerSuite, assert) {
	var context = 0;
	function getContextRequire() {
		return require.config({
			context: "svg" + context++,
			baseUrl: "../../../requirejs-dplugins",
			paths: {lie: "../lie", "requirejs-text": "../requirejs-text/", "requirejs-domready": "../requirejs-domready/"},
			config: {
				"svg": {
					layersMap: {
						"tests/unit/resources/svg/never-loaded.svg": {
							redirectTo:  "tests/unit/resources/svg/sprite.svg",
							id: "never-loaded"
						}
					}
				}
			}
		});
	}

	var CONTAINER_ID = "requirejs-dplugins-svg";

	registerSuite({
		name: "svg plugin",
		afterEach: function(){
			var spriteContainer = document.getElementById(CONTAINER_ID);
			if (spriteContainer) {
				spriteContainer.parentNode.removeChild(spriteContainer);
			}
		},
		"Checking sprite is correctly created": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/icon1.svg",
				"svg!tests/unit/resources/svg/icon2.svg"
			], dfd.callback(function (id1, id2) {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				assert.isNotNull(spriteContainer, "Sprite was correctly created");
				var icon1 = spriteContainer.querySelector("symbol#icon1"),
					icon2 = spriteContainer.querySelector("symbol#icon2"),
					inexistentIcon = spriteContainer.querySelector("symbol#inexistent-icon"),
					symbols = spriteContainer.querySelectorAll("symbol");
				assert.isNotNull(icon1, "icon1 was correctly added");
				assert.isNotNull(icon2, "icon2 was correctly added");
				assert.isNull(inexistentIcon, "inexistent-icon was not found as expected");
				assert.strictEqual(symbols.length, 2, "total number of symbols found is correct");
				assert.strictEqual(id1, "icon1", "id1 is correct");
				assert.strictEqual(id2, "icon2", "id1 is correct");
			}));
		},
		"Checking svgs are correctly added to sprite": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();

			contextRequire([
				"svg!tests/unit/resources/svg/icon1.svg",
				"svg!tests/unit/resources/svg/icon1_2x.svg"
			], dfd.callback(function () {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var icon32 = spriteContainer.querySelector("symbol#icon1"),
					icon64 = spriteContainer.querySelector("symbol#icon1_2x");
				var viewBox32 = icon32.getAttribute("viewBox"),
					viewBox64 = icon64.getAttribute("viewBox");
				assert.strictEqual(viewBox32, "0 0 32 32", "viewBox was correctly set on the symbol");
				assert.strictEqual(viewBox64, "0 0 64 64", "viewBox was correctly set on the symbol");
			}));
		},
		"Checking svgs can't be added twice": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/icon1.svg",
				"svg!tests/unit/resources/svg/icon1.svg"
			], dfd.callback(function (id1, id2) {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var svgs = spriteContainer.querySelectorAll("symbol#icon1");
				assert.strictEqual(svgs.length, 1, "Icon was not added twice");
				assert.strictEqual(id1, "icon1", "Id1 is correct");
				assert.strictEqual(id2, "icon1", "Id2 is correct");
			}));
		},
		"Checking svg defined in sprite can't be reloaded": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/never-loaded.svg"
			], dfd.callback(function (id) {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var svgs = spriteContainer.querySelectorAll("symbol#never-loaded"),
					sprite = spriteContainer.querySelectorAll("symbol#sprite");
				assert.strictEqual(svgs.length, 0, "Icon was not loaded");
				assert.strictEqual(sprite.length, 1, "Sprite was loaded instead");
				assert.strictEqual(id, "never-loaded", "Id is correct");
			}));
		},
		"Loading an icon without an id": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/icon-without-id.svg"
			], dfd.callback(function (id) {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var svgs = spriteContainer.querySelectorAll("symbol");
				assert.strictEqual(svgs.length, 1, "Icon without id was loaded");
				var idAttr = svgs[0].getAttribute("id");
				assert.strictEqual(idAttr, null, "Icon without id gets no id attribute in the sprite");
				assert.strictEqual(id, null, "svg! returns null when fetching a icon without id");
			}));
		},
		"Loading an icon with an empty id": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/icon-with-empty-id.svg"
			], dfd.callback(function (id) {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var svgs = spriteContainer.querySelectorAll("symbol");
				assert.strictEqual(svgs.length, 1, "Icon with empty id was loaded");
				var idAttr = svgs[0].getAttribute("id");
				assert.strictEqual(idAttr, "", "Icon without id gets no id attribute in the sprite");
				assert.strictEqual(id, "", "svg! returns null when fetching a icon without id");
			}));
		},
		"Loading an icon without a viewBox": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/icon-without-viewBox.svg"
			], dfd.callback(function () {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var svgs = spriteContainer.querySelectorAll("symbol");
				assert.strictEqual(svgs.length, 1, "Icon without viewBox was loaded");
				var viewBoxAttr = svgs[0].getAttribute("viewBox");
				assert.strictEqual(viewBoxAttr, null, "Icon without viewBox gets no viewBox attribute in the sprite");
			}));
		},
		"Loading an icon with an empty viewBox": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/icon-with-empty-viewBox.svg"
			], dfd.callback(function () {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var svgs = spriteContainer.querySelectorAll("symbol");
				assert.strictEqual(svgs.length, 1, "Icon with empty viewBox was loaded");
				var viewBoxAttr = svgs[0].getAttribute("viewBox");
				// use notOk because IE insist to set viewBoxAttr to null while other browsers return ""
				assert.notOk(viewBoxAttr, "Icon with empty viewBox gets an empty viewBox attribute in the sprite");
			}));
		},
		"Loading an icon with a lowercase viewbox": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"svg!tests/unit/resources/svg/icon-with-lowercase-viewbox.svg"
			], dfd.callback(function (id) {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var svgs = spriteContainer.querySelectorAll("symbol");
				assert.strictEqual(svgs.length, 1, "Icon with lowercase viewbox was loaded");
				var viewBoxAttr = svgs[0].getAttribute("viewBox");
				assert.strictEqual(viewBoxAttr, "0 0 32 32", "lowercase viewbox attribute was converted to camel case viewBox");
			}));
		}
	});
});
