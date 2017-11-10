/**
 * Configuration to run Intern tests locally with selenium.
 * 
 * Desktop browsers
 * ----------------
 * 1. Uncomment the local browser environments you want to test against.
 * 2. Ensure a selenium server is started (chrome driver is required to test against Chrome)
 * java -jar selenium-server-standalone.jar -port 4444 -Dwebdriver.chrome.driver=chromedriver
 * 3. Run grunt test:local from test project root directory
 * 
 */
define([
	"./config"
], function (config) {

	config.environments = [
		{ browserName: "firefox" }
//		{ browserName: "chrome" },
//		{ browserName: "safari" },
//		{ browserName: "internet explorer" }
	];

	config.useSauceConnect = false;
	config.webdriver = {
		hostname: "localhost",
		port: 4444
	};

	config.proxyPort = 9000;
	config.proxyUrl = "http://127.0.0.1:9000";

	config.maxConcurrency = 1;

	return config;
});