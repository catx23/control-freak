define(["intern",
	"intern!object",
	"intern/dojo/node!leadfoot/helpers/pollUntil",
	"intern/chai!assert",
	"require"
], function (intern, registerSuite, pollUntil, assert, require) {
	var PAGE = "./sniff.html";

	registerSuite({
		name: "Sniff tests",
		setup: function () {},

		"Checking browser and platform sniffing": function () {
			var remote = this.remote;
			return remote
				.get(require.toUrl(PAGE))
				.then(pollUntil("return ('ready' in window && ready) ? true : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.execute("return _has")
				.then(function (has) {
					var browserName = remote.environmentType.browserName,
						platform = remote.environmentType.platform,
						deviceName = remote.environmentType.deviceName;

					// Check platform flags.
					if (/mac/i.test(platform) && browserName !== "iOS") {
						assert(has.mac, "has(mac) set");
					} else {
						assert.isFalse(has.mac, "has(mac) not set");
					}

					// Check browser flags.
					function shouldDetectOnlyBrowsers(expected) {
						Object.keys(has).forEach(function (flag) {
							if (flag === "mac" || flag === "android") {
								return;
							}
							if (expected.indexOf(flag) > -1) {
								assert.ok(has[flag], "detected " + flag + " as expected");
							} else {
								assert.notOk(has[flag], "didn't detect " + flag + " as expected");
							}
						});
					}
					switch (browserName) {
					case "chrome":
						shouldDetectOnlyBrowsers(["chrome", "webkit"]);
						break;
					case "internet explorer":
						shouldDetectOnlyBrowsers(["ie"]);
						break;
					case "microsoftedge":	// TODO: Check actual value of browserName once Intern supports Edge.
						shouldDetectOnlyBrowsers(["edge"]);
						break;
					case "firefox":
						shouldDetectOnlyBrowsers(["ff", "mozilla"]);
						break;
					case "safari":
						shouldDetectOnlyBrowsers(["safari", "webkit"]);
						break;
					case "iOS":
						switch (deviceName) {
						case "iPad Simulator":
							shouldDetectOnlyBrowsers(["safari", "webkit", "ios", "ipad"]);
							break;
						case "iPhone Simulator":
							shouldDetectOnlyBrowsers(["safari", "webkit", "ios", "iphone"]);
							break;
						}
						break;
					}
				})
				.end();
		}
	});
});
