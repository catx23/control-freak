define([
	"intern!object",
	"intern/chai!assert",
	"decor/Observable"
], function (registerSuite, assert, Observable) {
	var handles = [],
		pseudoError = new Error("Error thrown on purpose. This error does not mean bad result of test case.");
	// TODO(asudoh): Look more at Object.observe() spec and add more tests
	registerSuite({
		name: "Observable",
		afterEach: function () {
			for (var handle = null; (handle = handles.shift());) {
				handle.remove();
			}
		},
		"Enumerate observable instance": function () {
			/* jshint unused: false */
			var found = false,
				observable = new Observable();
			for (var s in observable) {
				found = true;
			}
			assert.strictEqual(found, false);
		},
		"Observing null": function () {
			var caught;
			try {
				Observable.observe(null, function () {});
			} catch (e) {
				caught = true;
			}
			assert.isTrue(caught);
			assert.isTrue(!Observable.canObserve(null));
		},
		"Work with a single observable": function () {
			var dfd = this.async(1000),
				observable = new Observable();
			handles.push(Observable.observe(observable, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable,
						name: "foo"
					},
					{
						type: "add",
						object: observable,
						name: "bar"
					},
					{
						type: "update",
						object: observable,
						name: "foo",
						oldValue: "Foo0"
					}
				]);
			})));
			observable.set("foo", "Foo0");
			observable.set("bar", "Bar");
			observable.set("foo", "Foo1");
		},
		"Work with multiple observables": function () {
			// Observable.observe() callback defined earlier should be called earlier
			var dfd = this.async(1000),
				observable0 = new Observable(),
				observable1 = new Observable();
			handles.push(Observable.observe(observable1, dfd.rejectOnError(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable1,
						name: "foo"
					},
					{
						type: "add",
						object: observable1,
						name: "bar"
					}
				]);
			})));
			handles.push(Observable.observe(observable0, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable0,
						name: "foo"
					},
					{
						type: "add",
						object: observable0,
						name: "bar"
					},
					{
						type: "add",
						object: observable0,
						name: "baz"
					}
				]);
			})));
			observable0.set("foo", "Foo0");
			observable1.set("foo", "Foo0");
			observable0.set("bar", "Bar0");
			observable1.set("bar", "Bar0");
			observable0.set("baz", "Baz0");
		},
		"Work with multiple observers per an observable": function () {
			var dfd = this.async(1000),
				observable = new Observable();
			handles.push(Observable.observe(observable, dfd.rejectOnError(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable,
						name: "foo"
					},
					{
						type: "add",
						object: observable,
						name: "bar"
					},
					{
						type: "update",
						object: observable,
						name: "foo",
						oldValue: "Foo0"
					}
				]);
			})));
			handles.push(Observable.observe(observable, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable,
						name: "foo"
					},
					{
						type: "add",
						object: observable,
						name: "bar"
					},
					{
						type: "update",
						object: observable,
						name: "foo",
						oldValue: "Foo0"
					}
				]);
			})));
			observable.set("foo", "Foo0");
			observable.set("bar", "Bar");
			observable.set("foo", "Foo1");
		},
		"Observer callback changing another observable": function () {
			var changeRecords = [],
				observable0ObserverCalledCount = 0,
				dfd = this.async(1000),
				observable0 = new Observable(),
				observable1 = new Observable();
			handles.push(Observable.observe(observable0, dfd.rejectOnError(function (records) {
				[].push.apply(changeRecords, records);
				if (++observable0ObserverCalledCount >= 2) {
					assert.strictEqual(observable0ObserverCalledCount, 2);
					assert.deepEqual(changeRecords, [
						{
							type: "add",
							object: observable0,
							name: "foo0"
						},
						{
							type: "add",
							object: observable1,
							name: "foo1"
						},
						{
							type: "add",
							object: observable0,
							name: "bar0"
						}
					]);
					dfd.resolve(1);
				}
			})));
			handles.push(Observable.observe(observable1, dfd.rejectOnError(function (records) {
				observable0.set("bar0", "Bar0");
				[].push.apply(changeRecords, records);
			})));
			observable1.set("foo1", "Foo1");
			observable0.set("foo0", "Foo0");
		},
		"Execution order of callback with observer callback changing another observable": function () {
			var first,
				changeRecords = [],
				dfd = this.async(1000),
				observable0 = new Observable(),
				observable1 = new Observable(),
				observable2 = new Observable();
			handles.push(Observable.observe(observable0, dfd.rejectOnError(function (records) {
				[].push.apply(changeRecords, records);
				observable1.set("foo", "Foo0");
			})));
			handles.push(Observable.observe(observable1, dfd.rejectOnError(function (records) {
				[].push.apply(changeRecords, records);
				if (!first) {
					first = true;
					observable0.set("foo", "Foo1");
				}
			})));
			handles.push(Observable.observe(observable2, dfd.rejectOnError(function (records) {
				[].push.apply(changeRecords, records);
			})));
			observable0.set("foo", "Foo0");
			observable2.set("foo", "Foo0");
			setTimeout(dfd.callback(function () {
				assert.deepEqual(changeRecords, [
					{
						type: "add",
						object: observable0,
						name: "foo"
					},
					{
						type: "add",
						object: observable1,
						name: "foo"
					},
					{
						type: "add",
						object: observable2,
						name: "foo"
					},
					{
						type: "update",
						object: observable0,
						name: "foo",
						oldValue: "Foo0"
					}
				]);
			}), 100);
		},
		"Setting a value that is same as the current property value": function () {
			var dfd = this.async(1000),
				observable = new Observable({
					foo: "Foo",
					bar: NaN,
					baz: 0
				});
			handles.push(Observable.observe(observable, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "update",
						object: observable,
						name: "baz",
						oldValue: 0
					}
				]);
			})));
			observable.set("foo", "Foo");
			observable.set("bar", NaN);
			observable.set("baz", -0);
		},
		"Observing with the same callback; Same object": function () {
			var dfd = this.async(1000),
				count = 0,
				observable = new Observable(),
				callback = dfd.rejectOnError(function () {
					assert.isTrue(++count < 2);
				});
			handles.push(Observable.observe(observable, callback, ["update"]));
			handles.push(Observable.observe(observable, callback, ["add"]));
			observable.set("foo", "Foo0");
			setTimeout(dfd.callback(function () {
				assert.deepEqual(count, 1);
			}), 100);
		},
		"Observing with the same callback; Different object": function () {
			var dfd = this.async(1000),
				observable0 = new Observable(),
				observable1 = new Observable(),
				callback = dfd.callback(function (records) {
					assert.deepEqual(records, [
						{
							type: "update",
							object: observable0,
							name: "foo",
							oldValue: "Foo0"
						},
						{
							type: "add",
							object: observable1,
							name: "foo"
						}
					]);
				});
			handles.push(Observable.observe(observable0, callback, ["update"]));
			handles.push(Observable.observe(observable1, callback, ["add"]));
			observable0.set("foo", "Foo0");
			observable0.set("foo", "Foo1");
			observable1.set("foo", "Foo0");
			observable1.set("foo", "Foo1");
		},
		"Error in observer callback": function () {
			var dfd = this.async(1000),
				observable = new Observable();
			handles.push(Observable.observe(observable, function () {
				throw pseudoError;
			}));
			handles.push(Observable.observe(observable, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable,
						name: "foo"
					}
				]);
			})));
			observable.set("foo", "Foo0");
		},
		"Synchronous change delivery": function () {
			var cumulatedRecords = [],
				observable0 = new Observable(),
				observable1 = new Observable(),
				callback = function (records) {
					cumulatedRecords.push.apply(cumulatedRecords, records);
				};
			handles.push(Observable.observe(observable0, callback, ["update"]));
			handles.push(Observable.observe(observable1, callback, ["add"]));
			observable0.set("foo", "Foo0");
			observable0.set("foo", "Foo1");
			observable1.set("foo", "Foo0");
			observable1.set("foo", "Foo1");
			assert.isUndefined(Observable.deliverChangeRecords(callback));
			assert.deepEqual(cumulatedRecords, [
				{
					type: "update",
					object: observable0,
					name: "foo",
					oldValue: "Foo0"
				},
				{
					type: "add",
					object: observable1,
					name: "foo"
				}
			]);
		},
		"Synthetic change record": function () {
			var dfd = this.async(1000),
				observable = new Observable({0: 0, 1: 1, length: 2});
			Observable.observe(observable, dfd.rejectOnError(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable,
						name: "2"
					},
					{
						type: "update",
						object: observable,
						name: "length",
						oldValue: 2
					},
					{
						type: "add",
						object: observable,
						name: "3"
					},
					{
						type: "update",
						object: observable,
						name: "length",
						oldValue: 3
					}
				]);
			}));
			Observable.observe(observable, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "fakesplice",
						object: observable,
						removed: [],
						addCount: 2
					}
				]);
			}), ["fakesplice"]);
			Observable.getNotifier(observable).performChange("fakesplice", function () {
				observable.set("2", 2);
				observable.set("length", 3);
				observable.set("3", 3);
				observable.set("length", 4);
				return {
					removed: [],
					addCount: 2
				};
			});
		},
		"Synthetic change record; Nested": function () {
			function Thingy(a, b) {
				Observable.call(this, {a: a, b: b});
			}
			Thingy.prototype = Object.create(Observable.prototype);
			Thingy.prototype.increment = function (amount) {
				var notifier = Observable.getNotifier(this);
				notifier.performChange("increment", function () {
					this.set("a", this.a + amount);
					this.set("b", this.b + amount);
				}.bind(this));
				notifier.notify({
					object: this,
					type: "increment",
					incremented: amount
				});
			};
			Thingy.prototype.multiply = function (amount) {
				var notifier = Observable.getNotifier(this);
				notifier.performChange("multiply", function () {
					this.set("a", this.a * amount);
					this.set("b", this.b * amount);
				}.bind(this));
				notifier.notify({
					object: this,
					type: "multiply",
					multiplied: amount
				});
			};
			Thingy.prototype.incrementAndMultiply = function (incAmount, multAmount) {
				var notifier = Observable.getNotifier(this);
				notifier.performChange("incrementAndMultiply", function () {
					this.increment(incAmount);
					this.multiply(multAmount);
				}.bind(this));
				notifier.notify({
					object: this,
					type: "incrementAndMultiply",
					incremented: incAmount,
					multiplied: multAmount
				});
			};

			var thingy = new Thingy(2, 4),
				dfd = this.async(1000);

			Observable.observe(thingy, dfd.rejectOnError(function (records) {
				assert.deepEqual(records, [
					{
						type: "update",
						object: thingy,
						name: "a",
						oldValue: 2
					},
					{
						type: "update",
						object: thingy,
						name: "b",
						oldValue: 4
					},
					{
						object: thingy,
						type: "multiply",
						"multiplied": 2
					}
				], "Thingy observe callback for MULTIPLY and update");
			}), ["multiply", "update"]);

			Observable.observe(thingy, dfd.rejectOnError(function (records) {
				assert.deepEqual(records, [
					{
						object: thingy,
						type: "increment",
						"incremented": 2
					},
					{
						type: "update",
						object: thingy,
						name: "a",
						oldValue: 4
					},
					{
						type: "update",
						object: thingy,
						name: "b",
						oldValue: 6
					}
				], "Thingy observe callback for INCREMENT and update");
			}), ["increment", "update"]);

			Observable.observe(thingy, dfd.rejectOnError(function (records) {
				assert.deepEqual(records, [
					{
						type: "update",
						object: thingy,
						name: "a",
						oldValue: 2
					},
					{
						type: "update",
						object: thingy,
						name: "b",
						oldValue: 4
					},
					{
						type: "update",
						object: thingy,
						name: "a",
						oldValue: 4
					},
					{
						type: "update",
						object: thingy,
						name: "b",
						oldValue: 6
					}
				], "Observe callback with default acceptList (native types only)");
			}));

			Observable.observe(thingy, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						object: thingy,
						type: "incrementAndMultiply",
						incremented: 2,
						multiplied: 2
					}
				], "Observe callback that accepts everything");
			}), ["increment", "multiply", "incrementAndMultiply", "update"]);

			thingy.incrementAndMultiply(2, 2);
		},
		"Unobserve": function () {
			var h0, h1,
				dfd = this.async(1000),
				observable0 = new Observable(),
				observable1 = new Observable();
			handles.push(h0 = Observable.observe(observable0, dfd.rejectOnError(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable0,
						name: "foo0"
					},
					{
						type: "add",
						object: observable0,
						name: "bar0"
					}
				]);
			})));
			handles.push(h1 = Observable.observe(observable1, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: observable1,
						name: "foo1"
					}
				]);
			})));
			observable0.set("foo0", "Foo1");
			observable1.set("foo1", "Foo1");
			assert.isUndefined(h1.remove());
			h1 = null;
			observable1.set("bar1", "Bar1");
			observable0.set("bar0", "Bar0");
			assert.isUndefined(h0.remove());
			assert.isUndefined(h0.remove()); // Make sure removing the handle twice won't cause any problem
			h0 = null;
		},
		"Assign to Observable": function () {
			var dfd = this.async(1000),
				dst = new Observable(),
				src0 = {
					foo: "Foo",
					bar: "Bar"
				},
				src1 = Object.create({ignore: "Ignore"}, {
					baz: {enumerable: true, writable: true, configurable: true, value: "Baz"}
				});
			handles.push(Observable.observe(dst, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: dst,
						name: "foo"
					},
					{
						type: "add",
						object: dst,
						name: "bar"
					},
					{
						type: "add",
						object: dst,
						name: "baz"
					}
				]);
			})));
			var s,
				merged = {},
				result = Observable.assign(dst, src0, src1);
			for (s in src0) {
				merged[s] = src0[s];
			}
			for (s in src1) {
				if (src1.hasOwnProperty(s)) {
					merged[s] = src1[s];
				}
			}
			assert.deepEqual(dst, merged);
			assert.strictEqual(dst, result);
		},
		"Assign to plain object": function () {
			var dfd = this.async(1000),
				dst = {},
				src0 = {
					foo: "Foo"
				},
				src1 = {
					bar: "Bar",
					baz: "Baz"
				};
			handles.push(Observable.observe(dst, dfd.callback(function (records) {
				assert.deepEqual(records, [
					{
						type: "add",
						object: dst,
						name: "foo"
					},
					{
						type: "add",
						object: dst,
						name: "bar"
					},
					{
						type: "add",
						object: dst,
						name: "baz"
					}
				]);
			})));
			var result = Observable.assign(dst, src0, src1);
			assert.strictEqual(result, dst);
			var s,
				merged = {};
			for (s in src0) {
				merged[s] = src0[s];
			}
			for (s in src1) {
				merged[s] = src1[s];
			}
			assert.deepEqual(dst, merged);
		},
		"Assign to primitive": function () {
			var dst = 0,
				src0 = {
					foo: "Foo"
				},
				src1 = {
					bar: "Bar",
					baz: "Baz"
				},
				result = Observable.assign(dst, src0, src1);
			var s,
				merged = Object(dst);
			for (s in src0) {
				merged[s] = src0[s];
			}
			for (s in src1) {
				merged[s] = src1[s];
			}
			assert.deepEqual(result, merged);
		},
		"Assign to undefined/null": function () {
			assert.throws(function () {
				Observable.assign(undefined, {});
			});
			assert.throws(function () {
				Observable.assign(null, {});
			});
		}
		// TODO(asudoh): Add more enumerable/configuable/writable tests
		// TODO(asudoh): Add test for Observable.observe() is called twice for the same observable/callback pair,
		// and removing that handle
	});
});
