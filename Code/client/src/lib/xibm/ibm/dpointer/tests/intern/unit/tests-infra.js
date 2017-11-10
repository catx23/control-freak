/**
 * Simple unit test case to validate the test infrastructure
 */
define([
		"intern!object",
		"../TestUtils"
	], function (registerSuite) {
		registerSuite({
			name: "validation",
			"test infra": function () {
				console.log("--- Test infra ok ---");
			}
		});
	}
);