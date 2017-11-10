define([
	"intern!object",
	"intern/chai!assert",
	"dcl/dcl",
	"decor/observe",
	"decor/Stateful"
], function (registerSuite, assert, dcl, observe, Stateful) {
	var handles = [];

	registerSuite({
		name: "observe",

		"basic": function () {
			var dfd = this.async(1000);
			var pojo = {
				foo: "Foo0",
				bar: "Bar0"
			};
			handles.push(observe(pojo, dfd.callback(function (oldVals) {
				assert.deepEqual(oldVals, {
					foo: "Foo0",
					bar: "Bar0"
				}, "oldVals");
			})));

			pojo.foo = "Foo1";
			pojo.bar = "Bar1";
			assert.strictEqual(pojo.foo, "Foo1", "observable.foo");
			assert.strictEqual(pojo.bar, "Bar1", "observable.bar");
		},

		"multiple notifications": function () {
			var dfd = this.async(1000);
			var log = [];
			var pojo = {
				foo: "Foo0",
				bar: "Bar0"
			};
			handles.push(observe(pojo, function (oldVals) {
				log.push(oldVals);
			}));

			pojo.foo = "Foo1";
			pojo.bar = "Bar1";

			setTimeout(dfd.rejectOnError(function () {
				assert.deepEqual(log, [
					{
						foo: "Foo0",
						bar: "Bar0"
					}
				], "first notification");

				pojo.foo = "Foo2";
				pojo.bar = "Bar2";

				setTimeout(dfd.callback(function () {
					assert.deepEqual(log, [
						{
							foo: "Foo0",
							bar: "Bar0"
						},
						{
							foo: "Foo1",
							bar: "Bar1"
						}
					], "second notification");
				}), 1);
			}), 1);
		},

		"set to same value": function () {
			var dfd = this.async(1000);
			var log = [];
			var pojo = {
				foo: "Foo0",
				bar: "Bar0"
			};
			handles.push(observe(pojo, function (oldVals) {
				log.push(oldVals);
			}));

			pojo.foo = "Foo0";

			setTimeout(dfd.callback(function () {
				assert.deepEqual(log, [], "no notifications");
			}), 1);
		},

		"notifications collapsed": function () {
			var dfd = this.async(1000);
			var log = [];
			var pojo = {
				foo: "Foo0",
				bar: "Bar0"
			};
			handles.push(observe(pojo, function (oldVals) {
				log.push(oldVals);
			}));

			pojo.foo = "Foo1";
			pojo.foo = "Foo2";

			setTimeout(dfd.callback(function () {
				assert.deepEqual(log, [{
					foo: "Foo0"
				}], "only one notification");
			}), 1);
		},

		"unobserve": function () {
			var dfd = this.async(1000);
			var log = [];
			var pojo = {
				foo: "Foo0",
				bar: "Bar0"
			};
			var handle = observe(pojo, function (oldVals) {
				log.push(oldVals);
			});

			pojo.foo = "Foo1";

			setTimeout(dfd.rejectOnError(function () {
				assert.deepEqual(log, [{
					foo: "Foo0"
				}], "observed");

				handle.remove();
				log = [];

				pojo.foo = "Foo2";

				setTimeout(dfd.callback(function () {
					assert.deepEqual(log, [], "no notifications");
				}), 1);
			}), 1);
		},

		"multiple observers": function () {
			var dfd = this.async(1000);
			var log = [];
			var pojo = {
				foo: "Foo0",
				bar: "Bar0"
			};
			handles.push(observe(pojo, function (oldVals) {
				log.push(oldVals);
			}));

			pojo.foo = "Foo1";
			pojo.bar = "Bar1";

			setTimeout(dfd.rejectOnError(function () {
				assert.deepEqual(log, [
					{
						foo: "Foo0",
						bar: "Bar0"
					}
				], "first notification");

				pojo.foo = "Foo2";
				pojo.bar = "Bar2";

				setTimeout(dfd.callback(function () {
					assert.deepEqual(log, [
						{
							foo: "Foo0",
							bar: "Bar0"
						},
						{
							foo: "Foo1",
							bar: "Bar1"
						}
					], "second notification");
				}), 1);
			}), 1);
		},

		"observers called in order registered": function () {
			var dfd = this.async(1000);
			var log = [];
			var pojo1 = {
				foo: "pojo 1",
				bar: "Bar0"
			};
			var pojo2 = {
				foo: "pojo 2",
				bar: "Bar0"
			};

			handles.push(observe(pojo1, function (oldVals) {
				log.push(oldVals);
			}));
			handles.push(observe(pojo2, function (oldVals) {
				log.push(oldVals);
			}));

			// Update pojo2 first.  Pojo1 listener should still be called first.
			pojo2.foo = "pojo 2 update";
			pojo1.foo = "pojo 1 update";

			setTimeout(dfd.callback(function () {
				assert.deepEqual(log, [
					{
						foo: "pojo 1"
					},
					{
						foo: "pojo 2"
					}
				]);
			}), 1);
		},

		"nested": function () {
			var dfd = this.async(1000);
			var log = [];
			var pojo = {
				foo: "Foo0",
				bar: "Bar0",
				nested1: {
					a: 1,
					b: 2,
					nested2: {
						c: 3,
						d: 4
					}
				}
			};
			handles.push(observe(pojo, function (oldVals) {
				log.push(oldVals);
			}));

			// Change nested property.
			pojo.nested1.a = 2;

			setTimeout(dfd.rejectOnError(function () {
				assert.deepEqual(log, [
					{
						"nested1.a": 1
					}
				], "change in nested1");

				assert.strictEqual(pojo.nested1.a, 2, "new nested1.a");

				log = [];

				pojo.nested1.nested2.c = 4;

				setTimeout(dfd.rejectOnError(function () {
					assert.deepEqual(log, [
						{
							"nested1.nested2.c": 3
						}
					], "changed in nested2");

					log = [];

					// Change whole object.
					var oldNested1 = pojo.nested1;
					pojo.nested1 = {
						a: 5,
						b: 2,
						nested2: {
							c: 4,
							d: 10
						}
					};

					setTimeout(dfd.rejectOnError(function () {
						assert.deepEqual(log, [
							{
								"nested1.a": 2,
								"nested1.nested2.d": 4
							}
						], "new nested1");

						log = [];

						// Check that changes to new nested1 are tracked and conversely,
						// that changes to old nested1 are *not* tracked.
						oldNested1.a = 20;
						pojo.nested1.b = 30;

						setTimeout(dfd.callback(function () {
							assert.deepEqual(log, [
								{
									"nested1.b": 2
								}
							], "changes to new nested1 tracked, changes to old nested1 not tracked");
						}), 1);
					}), 1);
				}), 1);
			}), 1);
		},

		"observe decor/Stateful subclass": function () {
			var dfd = this.async(1000);
			var MyClass = dcl(Stateful, {
				foo: 1,
				bar: 2
			});
			var myObj = new MyClass();
			handles.push(observe(myObj, dfd.callback(function (oldVals) {
				assert.deepEqual(oldVals, {
					foo: 1,
					bar: 2
				}, "oldVals");
			})));

			myObj.foo = 3;
			myObj.bar = 4;
		}
	});
});
