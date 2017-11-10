/**
 * dpointer - configuration of Intern unit and functional tests
 *
 * Use this test page URL for direct unit-testing:
 *  http://[host:port/path]/dpointer/node_modules/intern/client.html?config=tests/intern/config
 * (requires a local http server to access project files from the device browser)
 *
 * Local desktop browser
 * ---------------------
 * 1. Open the test page URL in your browser
 * 2. Look at the browser console to see the output result
 *
 * iOS devices
 * -----------
 * 1. Plug the iOS device to your Mac or use the iOS simulator
 * 2. Ensure Web inspector is 'on' on iOS (Settings > Safari > Advanced > Web inspector)
 * 3. Ensure Safari Develop menu is available on Mac (Preferences > Advanced > Show Develop Menu)
 * 3. Open Safari on the Mac (Develop > [your devive] > Inspectable applications)
 * 4. Go to the test page
 * See the output result in Safari desktop console (Inspectable > Console)
 *
 * Android devices
 * ---------------
 * 1. Plug the Android device to you computer or use the Android emulator
 * 2. Open the Android browser and go to the test page
 * See the output result in logcat (command 'adb logcat')
 */
define({
	suites: [ "dpointer/tests/intern/unit/all" ],

	loader: {
		baseUrl: typeof window !== "undefined" ? "../../.." : ".."
	},

	useLoader: {
		"host-node": "requirejs",
		"host-browser": "../../../requirejs/require.js"
	},
	
	reporters: ["console"],

	excludeInstrumentation: /^(requirejs.*|dpointer\/tests)/
});