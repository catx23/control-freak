define([
	"require",
	"intern",
	"intern!object",
	"intern/chai!assert",
	"intern/dojo/node!leadfoot/helpers/pollUntil"
], function (require, intern, registerSuite, assert, pollUntil) {

	registerSuite({
		name: "jquery plugin functional tests",

		setup: function () {
			return this.remote
				.get(require.toUrl("./jqueryScript.html"))
				.then(pollUntil("return ready || null;", [],
					intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		},

		"no double load": function () {
			this.timeout = intern.config.TEST_TIMEOUT;

			return this.remote
				.findById("result").getVisibleText().then(function (text) {
					assert.strictEqual(text, "works!");
				});
		}
	});
});
