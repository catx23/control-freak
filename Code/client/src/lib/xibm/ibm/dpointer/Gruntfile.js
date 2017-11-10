/* global module */
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		
		jshint: {
			src: [
				"**/*.js", "!{node_modules,dev}/**"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		intern: {
			// run tests on local desktop browser(s)
			local: {
				options: {
					runType: "runner",
					config: "tests/intern/local",
					reporters: ["runner"]
				}
			},
			// run tests on remote cloud service
			remote: {
				options: {
					runType: "runner",
					config: "tests/intern/saucelab",
					reporters: ["runner"]
				}
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks("intern");
	grunt.loadNpmTasks("grunt-contrib-jshint");

	// Aliases
	grunt.registerTask("default", ["jshint"]);

	// Testing.
	// always specify the target e.g. grunt test:remote, grunt test:remote
	// then add on any other flags afterwards e.g. console, lcovhtml
	var testTaskDescription = "Run this task instead of the intern task directly! \n" +
		"Always specify the test target e.g. \n" +
		"grunt test:local\n" +
		"grunt test:local.android\n" +
		"grunt test:local.ios\n" +
		"grunt test:remote\n\n" +
		"Add any optional reporters via a flag e.g. \n" +
		"grunt test:local:console\n" +
		"grunt test:local:lcovhtml\n" +
		"grunt test:local:console:lcovhtml";
	grunt.registerTask("test", testTaskDescription, function (target) {
		function addReporter(reporter) {
			var property = "intern." + target + ".options.reporters",
				value = grunt.config.get(property);
			if (value.indexOf(reporter) !== -1) {
				return;
			}
			value.push(reporter);
			grunt.config.set(property, value);
		}
		if (this.flags.lcovhtml) {
			addReporter("lcovhtml");
		}
		if (this.flags.console) {
			addReporter("console");
		}
		grunt.task.run("intern:" + target);
	});
};