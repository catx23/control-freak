/* global module */
module.exports = function (grunt) {
	grunt.initConfig({
		jshint: {
			src: [
				"**/*.js",
				"!{node_modules,out}/**/*.js"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		},
		intern: {
			node: {
				options: {
					runType: "client",
					config: "tests/intern"
				}
			},
			local: {
				options: {
					runType: "runner",
					config: "tests/intern.local",
					reporters: ["Runner"]
					//, leaveRemoteOpen: true	// uncomment for debugging
				}
			},
			remote: {
				options: {
					runType: "runner",
					config: "tests/intern",
					reporters: ["Runner"]
				}
			}
		},
		"jsdoc-amddcl": {
			docs: {
				files: [
					{
						args: [
							"-r"
						],
						src: [
							".",
							"./README.md",
							"./package.json"
						],
						packagePathFormat: "${name}/docs/api/${version}",
						includeEventsInTOC: "false"
					}
				]
			},
			export: {
				files: [
					{
						args: [
							"-X",
							"-r"
						],
						src: [
							".",
							"./README.md",
							"./package.json"
						],
						dest: "./out/doclets.json"
					}
				]
			}
		}
	});
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("intern");
	grunt.loadNpmTasks("jsdoc-amddcl");
	grunt.registerTask("jsdoc", "jsdoc-amddcl");

	// Testing.
	// Always specify the target e.g. grunt test:remote, grunt test:remote
	// then add on any other flags afterwards e.g. console, lcovhtml.
	var testTaskDescription = "Run this task instead of the intern task directly! \n" +
		"Always specify the test target e.g. \n" +
		"grunt test:local\n" +
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
