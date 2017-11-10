define([
	"require",
	"intern",
	"intern!object",
	"intern/chai!assert",
	"intern/dojo/node!leadfoot/helpers/pollUntil"
], function (require, intern, registerSuite, assert, pollUntil) {

	registerSuite({
		name: "css plugin build test",

		setup: function () {
			return this.remote
				.get(require.toUrl("./cssApp/app.html"))
				.then(pollUntil("return ready || null;", [],
					intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		},

		"css style application": function () {
			this.timeout = intern.config.TEST_TIMEOUT;

			return this.remote
				.findById("result").getComputedStyle("borderLeftStyle").then(function (style) {
					assert.strictEqual(style, "dashed");
				}).getComputedStyle("backgroundImage").then(function (style) {
					var match = style.match(/(build\/resources\/test\.png)["']?\)?;?$/);
					assert.strictEqual(match[1], "build/resources/test.png");
				});
		}
	});
});
