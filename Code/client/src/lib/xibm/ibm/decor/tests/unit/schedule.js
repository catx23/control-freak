define([
	"intern!object",
	"intern/chai!assert",
	"decor/schedule"
], function (registerSuite, assert, schedule) {
	var handles = [];
	registerSuite({
		name: "schedule",
		afterEach: function () {
			for (var handle = null; (handle = handles.shift());) {
				handle.remove();
			}
		},
		"Schedule a task at end of microtask": function () {
			var endedMicrotask,
				dfd = this.async(1000),
				h = schedule(dfd.callback(function () {
					assert.isTrue(endedMicrotask);
				}));
			handles.push(h);
			endedMicrotask = true;
		},
		"Removing a scheduled task": function () {
			var dfd = this.async(1000),
				h = schedule(dfd.rejectOnError(function () {
					throw new Error("This task should never be executed.");
				}));
			handles.push(h);
			h.remove();
			setTimeout(dfd.callback(function () {}), 100);
		},
		"Scheduling another task in schedule callback": function () {
			var dfd = this.async(1000);
			handles.push(schedule(dfd.rejectOnError(function () {
				handles.push(schedule(dfd.callback(function () {})));
			})));
		},
		"Scheduling same task in schedule callback": function () {
			var count = 0,
				dfd = this.async(1000),
				cb = dfd.rejectOnError(function () {
					if (count++ === 0) {
						handles.push(schedule(cb));
					} else {
						dfd.resolve(1);
					}
				});
			handles.push(schedule(cb));
		},
		"Running same callback twice": function () {
			var count = 0,
				dfd = this.async(1000),
				cb = dfd.rejectOnError(function () {
					count++;
				});
			handles.push(schedule(cb));
			handles.push(schedule(cb));
			setTimeout(dfd.callback(function () {
				assert.strictEqual(count, 2);
			}), 100);
		}
	});
});
