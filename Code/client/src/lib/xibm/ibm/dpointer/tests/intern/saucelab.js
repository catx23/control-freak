/**
 * Configuration to run Intern (1.x) tests on SauceLab.
 * 
 * 1. Set environment variables SAUCE_USERNAME and SAUCE_ACCESS_KEY
 * 2. Run grunt test:remote
 */
define([
	"./config"
], function (config) {

	config.environments = [
		// desktop
		{browserName: "internet explorer", version: "9", platform: "Windows 7"},
		{browserName: "internet explorer", version: "10", platform: "Windows 8"},
		{browserName: "internet explorer", version: "11", platform: "Windows 8.1"},
		{browserName: "firefox", version: "31", platform: "Windows 7"},
		{browserName: "chrome", version: "32", platform: "Windows 7"},
		{browserName: "chrome", version: "35", platform: "Windows 8.1"},
		{browserName: "safari", version: "7", platform: "OS X 10.9"},
		// mobile
		{browserName: "Safari", platformVersion: "7.1", platformName: "iOS", deviceName: "iPhone Simulator",
			"appium-version": "1.2.2"}
	];

	// SauceLab
	config.useSauceConnect = true;
	config.webdriver = {
		hostname: "localhost",
		port: 4444
	};
	config.environments.forEach(function (env) {
		env.name = "dpointer";
	});

	config.proxyPort = 9000;
	config.proxyUrl = "http://127.0.0.1:9000/";

	config.maxConcurrency = 1;

	return config;
});