define([
	"intern!object",
	"intern/chai!assert",
	"decor/Invalidating",
	"dcl/dcl"
], function (registerSuite, assert, Invalidating, dcl) {
	registerSuite({
		name: "Invalidating",
		"Basic": function () {
			var dfd = this.async(1000),
				log = [],
				invalidating = new (dcl(Invalidating, {
					foo: undefined,
					bar: undefined,
					computeProperties: function (oldValues) {
						log.push({method: "computeProperties", oldValues: oldValues});
					},
					initializeRendering: function () {
						log.push({method: "initializeRendering"});
					},
					refreshRendering: function (oldValues) {
						log.push({method: "refreshRendering", oldValues: oldValues});
					}
				}))({
					foo: "Foo0",
					bar: "Bar0"
				});

			// Initialization should call refreshRendering(this) etc. after properties are mixed in.
			assert.strictEqual(log.length, 3, "initial");
			assert.strictEqual(log[0].method, "computeProperties", "initial");
			assert.strictEqual(log[1].method, "initializeRendering", "initial");
			assert.strictEqual(log[2].method, "refreshRendering", "initial");
			assert.strictEqual(log[2].oldValues.foo, "Foo0", "initial");
			assert.strictEqual(log[2].oldValues.bar, "Bar0", "initial");

			// Changes after first addRenderingProperties() call should be delivered.
			// Second call to refreshRendering() should give changes.
			log = [];
			invalidating.bar = "Bar1";
			invalidating.foo = "Foo1";
			setTimeout(dfd.callback(function () {
				assert.strictEqual(log.length, 2, "changes");
				assert.strictEqual(log[0].method, "computeProperties", "changes");
				assert.strictEqual(log[1].method, "refreshRendering", "changes");
				assert.deepEqual(log[1].oldValues, {foo: "Foo0", bar: "Bar0"}, "changes");
			}), 5);
		},
		"Property validation": function () {
			var dfd = this.async(1000),
				cpLog = [], rrLog = [],
				invalidating = new (dcl(Invalidating, {
					foo: undefined,
					computeProperties: function (oldValues) {
						cpLog.push(oldValues);
						if (this.foo < 0) {
							this.foo = 0;
							this.discardComputing();
						}
					},
					refreshRendering: function (oldValues) {
						rrLog.push(oldValues);
					}
				}))({
					foo: 1
				});

			// Initialization should call computeProperties() and refreshRendering(this) after properties are mixed in.
			assert.strictEqual(cpLog.length, 1, "initial computeProperties() call");
			assert.strictEqual(cpLog[0].foo, 1, "initial computeProperties() value");
			assert.strictEqual(rrLog.length, 1, "initial refreshRendering()");

			invalidating.foo = -1;
			setTimeout(dfd.callback(function () {
				assert.strictEqual(cpLog.length, 2, "second computeProperties() call");
				assert.strictEqual(rrLog.length, 2, "second refreshRendering() call");
				assert.deepEqual(rrLog[1], {foo: 1}, "second refreshRendering() value");
			}), 5);
		},
		"Computed property": function () {
			var dfd = this.async(1000),
				cpLog = [], rrLog = [],
				invalidating = new (dcl(Invalidating, {
					foo: undefined,
					bar: undefined,
					baz: undefined,
					computeProperties: dfd.rejectOnError(function (oldValues) {
						cpLog.push(oldValues);
						if ("foo" in oldValues && typeof this.foo === "string") {
							this.bar = this.foo.replace(/^Foo/, "Bar");
						}
						if ("bar" in oldValues && typeof this.bar === "string") {
							this.baz = this.bar.replace(/^Bar/, "Baz");
						}
						if ("baz" in oldValues && typeof this.baz === "string") {
							this.foo = this.baz.replace(/^Baz/, "Foo");
						}
					}),
					refreshRendering: function (oldValues) {
						rrLog.push(oldValues);
					}
				}))();

			// Initialization should call computeProperties() and refreshRendering(this).
			assert.strictEqual(cpLog.length, 1, "initial computeProperties() call");
			assert.strictEqual(rrLog.length, 1, "initial refreshRendering()");

			// Test how setting a single property can trigger multiple calls to computeProperties() before
			// there's a single call to refreshRendering().
			invalidating.foo = "Foo0";
			setTimeout(dfd.callback(function () {
				assert.strictEqual(cpLog.length, 4, "total computeProperties() calls after setting foo");
				assert.strictEqual(invalidating.foo, "Foo0");
				assert.strictEqual(invalidating.bar, "Bar0");
				assert.strictEqual(invalidating.baz, "Baz0");
			}), 5);
		},
		"Synchronous change delivery": function () {
			var rrLog = [],
				invalidating = new (dcl(Invalidating, {
					foo: undefined,
					bar: undefined,
					computeProperties: function () {
						if (this.foo === "Foo1") {
							this.bar = "Bar1";
							this.deliver();
						}
					},
					refreshRendering: function (oldValues) {
						rrLog.push(oldValues);
					}
				}))({
					foo: "Foo0",
					bar: "Bar0"
				});
			assert.strictEqual(rrLog.length, 1, "on creation, one call to refreshRendering()");

			invalidating.foo = "Foo1";
			invalidating.deliverComputing();
			assert.strictEqual(rrLog.length, 2, "deliverComputing() triggered another call to refreshRendering()");
			assert.deepEqual(rrLog[1], {foo: "Foo0", bar: "Bar0"});
		},
		"Discard changes": function () {
			var dfd = this.async(1000),
				rrCalls = 0,
				invalidating = new (dcl(Invalidating, {
					foo: undefined,
					refreshRendering: function () {
						rrCalls ++;
					}
				}))({
					foo: "Foo0"
				});
			assert.strictEqual(rrCalls, 1, "refreshRendering() called on initialization");

			invalidating.foo = "Foo1";
			invalidating.discardChanges();
			setTimeout(dfd.callback(function () {
				assert.strictEqual(rrCalls, 1, "refreshRendering() not called again due to discardChanges()");
			}), 5);
		},
		"shouldInitializeRendering()": function () {
			var dfd = this.async(1000),
				log = [],
				invalidating = new (dcl(Invalidating, {
					foo: undefined,
					bar: undefined,
					template: undefined,
					computeProperties: function () {
						log.push("computeProperties");
					},
					shouldInitializeRendering: function (oldValues) {
						log.push("shouldInitializeRendering");
						return "template" in oldValues;
					},
					initializeRendering: function () {
						log.push("initializeRendering");
					},
					refreshRendering: function () {
						log.push("refreshRendering");
					}
				}))({
					foo: "Foo0",
					bar: "Bar0"
				});

			// On creation we call initializeRendering() unconditionally
			assert.deepEqual(log, ["computeProperties", "initializeRendering", "refreshRendering"], "initial");

			// Random change makes shouldInitializeRendering() return false, and initializeRendering() isn't called.
			log = [];
			invalidating.bar = "Bar1";
			setTimeout(dfd.rejectOnError(function () {
				assert.deepEqual(log, ["computeProperties", "shouldInitializeRendering", "refreshRendering"], "change");

				// But changing "template" property makes shouldInitializeRendering() return true,
				// triggering another call to initializeRendering().
				log = [];
				invalidating.template = 123;
				setTimeout(dfd.callback(function () {
					assert.deepEqual(log, ["computeProperties", "shouldInitializeRendering",  "initializeRendering",
						"refreshRendering"], "rerender");
				}), 5);
			}), 5);
		}
	});
});
