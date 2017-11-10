require.config({
	context: context,
	config: {
		"i18n": {
			bundlesMap: {
				"myapp/nls/test": ["myapp/nls/bundleA", "myapp/nls/bundleB"]
			},
			localesMap: {
				"myapp/nls/test": ["fr", "root"]
			}
		}
	}
});

define("myapp/test", [
	"i18n!myapp/nls/bundleA",
	"i18n!myapp/nls/bundleB"
], function (bundleA, bundleB) {
	return {
		bundleA: bundleA.MSG,
		bundleB: bundleB.MSG
	};
});
