define([
	"intern!object",
	"intern/chai!assert"
], function (registerSuite, assert) {
	registerSuite({
		name: "Promise plugin",
		"promise support": function () {
			var dfd = this.async(1000);

			require(["requirejs-dplugins/Promise!"], function (Promise) {
				new Promise(function (resolve) {
					setTimeout(resolve, 50);
				}).then(function () {
					dfd.resolve(true);
				});
			});
		}
	});
});