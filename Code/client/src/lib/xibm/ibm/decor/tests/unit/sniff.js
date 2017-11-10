define([
	"intern!object",
	"intern/chai!assert",
	"decor/sniff"
], function (registerSuite, assert, has) {
	registerSuite({
		name: "sniff",
		sniff: function () {
			assert(has("chrome") || has("safari") || has("ff") || has("ie") ||
				has("ios") || has("android") || has("wp") ||
				!has("host-browser"),
				"one browser's flag is set, or on node");
		}
	});
});

