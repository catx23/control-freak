define([
	"require",
	"intern",
	"intern!object",
	"intern/chai!assert",
	"intern/dojo/node!leadfoot/helpers/pollUntil"
], function (require, intern, registerSuite, assert, pollUntil) {

	registerSuite({
		name: "jquery plugin build test",

		setup: function () {
			return this.remote
				.get(require.toUrl("./jqueryApp/app.html"))
				.then(pollUntil("return ready || null;", [],
					intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		},

		"layer file contains jquery modules": function () {
			this.timeout = intern.config.TEST_TIMEOUT;

			return this.remote
				.findById("result").getVisibleText().then(function (text) {
					assert.strictEqual(text, "works!");
				});
		}
	});
});
