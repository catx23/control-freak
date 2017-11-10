define([
	"i18n!myapp/nls/bundleA",
	"i18n!myapp/nls/bundleB"
], function (bundleA, bundleB) {
	return {
		log: function (element) {
			element.innerHTML = bundleA.MSG + " " + bundleB.MSG;
		}
	};
});
