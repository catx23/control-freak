define([
	"intern!object",
	"intern/chai!assert",
	"../../Stateful",
	"dcl/dcl"
], function (registerSuite, assert, Stateful, dcl) {
	registerSuite({
		name: "Stateful",
		"accessors": function () {
			var StatefulClass1 = dcl(Stateful, {
				foo: 0,
				bar: 0,
				baz: "",

				_getFooAttr: function () {
					return this._get("foo") - 1;
				},

				_setBarAttr: function (value) {
					this._set("bar", value + 1);
				}
			});

			var attr1 = new StatefulClass1();
			attr1.foo = 4;
			attr1.bar = 2;
			attr1.baz = "bar";

			assert.strictEqual(attr1.foo, 3, "attr1.foo getter works");
			assert.strictEqual(attr1.bar, 3, "attr1.bar setter works");
			assert.strictEqual(attr1.baz, "bar", "attribute set properly");
		},
		"paramHandling": function () {
			var StatefulClass2 = dcl(Stateful, {
				foo: null,
				bar: 5,

				_setFooAttr: function (value) {
					this._set("foo", value);
				},
				_setBarAttr: function (value) {
					this._set("bar", value);
				}
			});

			var attr2 = new StatefulClass2({
				foo: function () {
					return "baz";
				},
				bar: 4
			});

			assert.strictEqual(typeof attr2.foo, "function", "function attribute set");
			assert.strictEqual(attr2.foo(), "baz", "function has proper return value");
			assert.strictEqual(attr2.bar, 4, "attribute has proper value");

			// Check if user overrides widget to not process constructor params
			var IgnoreParamsStateful = dcl(Stateful, {
				foo: 3,
				processConstructorParameters: function () {
				}
			});
			var ignore = new IgnoreParamsStateful({
				foo: 4
			});
			assert.strictEqual(ignore.foo, 3, "constructor foo ignored");

			// And make sure it works even if the argument isn't a hash
			var ignore2 = new IgnoreParamsStateful(5, 4, 3, 2, 1);
			assert.strictEqual(ignore2.foo, 3, "ignore2 created");
		},
		"_get": function () {
			var StatefulClass5 = dcl(Stateful, {
				foo: "",
				_getFooAttr: function () {
					return this._get("foo") + "modified";
				}
			});

			var attr5 = new StatefulClass5();
			assert.strictEqual(attr5.foo, "modified", "value get properly");
			attr5.foo = "further";
			assert.strictEqual(attr5.foo, "furthermodified");
		},
		"moreCorrelatedProperties": function () {
			var Widget = dcl(Stateful, {
				foo: 10,
				_setFooAttr: function (val) {
					this._set("foo", val);
					this._set("bar", val + 1);
				},

				bar: 11,
				_setBarAttr: function (val) {
					this._set("bar", val);
					this._set("foo", val - 1);
				}
			});

			var w1 = new Widget({foo: 30});
			assert.strictEqual(w1.foo, 30, "w1.foo");
			assert.strictEqual(w1.bar, 31, "w1.bar");

			var w2 = new Widget({bar: 30});
			assert.strictEqual(w2.bar, 30, "w2.bar");
			assert.strictEqual(w2.foo, 29, "w2.foo");

			var w3 = new Widget({});
			assert.strictEqual(w3.foo, 10, "w3.foo");
			assert.strictEqual(w3.bar, 11, "w3.bar");
		},
		"getSetObserve": function () {
			var dfd = this.async(1000),
				count = 0,
				s = new (dcl(Stateful, {
					foo: 3
				}))();
			assert.strictEqual(s.foo, 3);
			var watching = s.observe(dfd.rejectOnError(function (oldValues) {
				if (++count > 1) {
					throw new Error("Observer callback should not be called after observation is stopped.");
				}

				assert.deepEqual(oldValues, {foo: 3});
				assert.strictEqual(s.foo, 4);

				watching.remove();
				s.foo = 5;
				assert.strictEqual(s.foo, 5);

				setTimeout(dfd.resolve.bind(dfd), 100);
			}));
			s.foo = 4;
			assert.strictEqual(s.foo, 4);
		},
		"removeObserveHandleTwice": function () {
			var dfd = this.async(1000),
				s = new (dcl(Stateful, {
					foo: 3
				}))(),
				changes = [];

			var watching = s.observe(dfd.rejectOnError(function (oldValues) {
				changes.push({id: "toBeRemoved", oldValues: oldValues});
			}));

			s.observe(dfd.rejectOnError(function (oldValues) {
				changes.push({id: "toBeAlive", oldValues: oldValues});
			}));

			s.foo = 4;
			watching.remove();
			watching.remove();
			s.foo = 5;

			setTimeout(dfd.callback(function () {
				assert.deepEqual(changes, [
					{id: "toBeAlive", oldValues: {foo: 3}}
				]);
			}), 100);
		},
		"setHash: observe()": function () {
			var dfd = this.async(1000),
				s = new (dcl(Stateful, {
					foo: 0,
					bar: 0
				}))(),
				changes = [];

			s.observe(dfd.rejectOnError(function (oldValues) {
				changes.push(oldValues);
			}));

			s.mix({
				foo: 3,
				bar: 5
			});

			assert.strictEqual(s.foo, 3);
			assert.strictEqual(s.bar, 5);

			setTimeout(dfd.rejectOnError(function () {
				assert.deepEqual(changes, [{foo: 0, bar: 0}]);

				var Clz2 = dcl(Stateful, {
						foo: 0,
						bar: 0
					}),
					s2 = new Clz2();
				s2.mix(s);
				assert.strictEqual(s2.foo, 3);
				assert.strictEqual(s2.bar, 5);

				setTimeout(dfd.callback(function () {
					// s watchers should not be copied to s2
					assert.strictEqual(changes.length, 1);
				}), 100);
			}), 100);
		},
		"_set: observe()": function () {
			var dfd = this.async(1000),
				StatefulClass4 = dcl(Stateful, {
					foo: null,
					bar: null,
					_setFooAttr: function (value) {
						this._set("bar", value);
						this._set("foo", value);
					},
					_setBarAttr: function (value) {
						this._set("foo", value);
						this._set("bar", value);
					}
				}),
				attr4 = new StatefulClass4(),
				changes = [];
			attr4.observe(dfd.rejectOnError(function (oldValues) {
				changes.push(oldValues);
			}));
			attr4.foo = 3;
			assert.strictEqual(attr4.bar, 3, "value set properly");
			attr4.bar = 4;
			assert.strictEqual(attr4.foo, 4, "value set properly");

			setTimeout(dfd.callback(function () {
				assert.deepEqual(changes, [{foo: null, bar: null}]);
			}), 100);
		},
		"subclasses1: observe()": function () {
			// Test when superclass and subclass are declared first, and afterwards instantiated
			var dfd = this.async(1000),
				SuperClass = dcl(Stateful, {
					foo: null,
					bar: null
				}),
				SubClass = dcl(SuperClass, {
					bar: 5
				}),
				sub = new SubClass(),
				changes = [];
			sub.observe(dfd.rejectOnError(function (oldValues) {
				changes.push({id: "sub", oldValues: oldValues});
			}));
			sub.foo = 3;
			sub.bar = 4;

			var sup = new SuperClass();
			sup.observe(dfd.rejectOnError(function (oldValues) {
				changes.push({id: "sup", oldValues: oldValues});
			}));
			sup.foo = 5;
			sup.bar = 6;

			setTimeout(dfd.callback(function () {
				assert.deepEqual(changes, [
					{id: "sub", oldValues: {foo: null, bar: 5}},
					{id: "sup", oldValues: {foo: null, bar: null}}
				]);
			}), 100);
		},
		"subclasses2: observe()": function () {
			// Test when superclass is declared and instantiated, then subclass is declared and use later
			var dfd = this.async(1000),
				SuperClass = dcl(Stateful, {
					foo: null,
					bar: null
				}),
				sup = new SuperClass(),
				changes = [];
			sup.observe(dfd.rejectOnError(function (oldValues) {
				changes.push({id: "sup", oldValues: oldValues});
			}));
			sup.foo = 5;
			sup.bar = 6;

			var customSetterCalled,
				SubClass = dcl(SuperClass, {
					bar: 5,
					_setBarAttr: function (val) {
						// this should get called even though SuperClass doesn't have a custom setter for "bar"
						customSetterCalled = true;
						this._set("bar", val);
					}
				}),
				sub = new SubClass();
			sub.observe(dfd.rejectOnError(function (oldValues) {
				changes.push({id: "sub", oldValues: oldValues});
			}));
			sub.foo = 3;
			sub.bar = 4;
			assert.ok(customSetterCalled, "SubClass custom setter called");

			setTimeout(dfd.rejectOnError(function () {
				assert.deepEqual(changes, [
					{id: "sup", oldValues: {foo: null, bar: null}},
					{id: "sub", oldValues: {foo: null, bar: 5}}
				]);
				sup.bar = 6;
				setTimeout(dfd.callback(function () {
					assert.strictEqual(changes.length, 2);
				}), 100);
			}), 100);
		},
		"observe(): Changing some properties while some of them don't yield actual changes": function () {
			var dfd = this.async(1000),
				stateful = new (dcl(Stateful, {
					foo: undefined,
					bar: undefined,
					baz: undefined,
					quux: undefined
				}))({
					foo: "Foo",
					bar: "Bar0",
					baz: NaN,
					quux: 0
				});
			stateful.observe(dfd.callback(function (oldValues) {
				assert.deepEqual(oldValues, {
					bar: "Bar0",
					quux: 0
				});
			}));
			stateful.foo = "Foo";
			stateful.bar = "Bar1";
			stateful.bar = "Bar2";
			stateful.baz = NaN;
			stateful.quux = -0;
		},
		"notifyCurrentValue()": function () {
			var dfd = this.async(1000),
				stateful = new (dcl(Stateful, {
					foo: undefined,
					bar: undefined,
					zaz: undefined
				}))({
					foo: "Foo",
					bar: "Bar",
					zaz: "Zaz"
				});
			stateful.observe(dfd.callback(function (oldValues) {
				assert.deepEqual(oldValues, {foo: "Foo", bar: "Bar", zaz: "Zaz"});
			}));
			stateful.notifyCurrentValue("foo", "bar");
			stateful.notifyCurrentValue("zaz");
		},
		"Stateful.PropertyListObserver#deliver(), Stateful.PropertyListObserver#discardChanges()": function () {
			var changes = [],
				stateful = new (dcl(Stateful, {
					foo: undefined
				}))({
					foo: "Foo0"
				}),
				hObserve = stateful.observe(function (oldValues) {
					changes.push(oldValues);
				});
			stateful.foo = "Foo1";
			hObserve.discardChanges();
			stateful.foo = "Foo2";
			hObserve.deliver();
			assert.deepEqual(changes, [{foo: "Foo1"}]);
		},
		"Stateful#deliver(), Stateful#discardChanges()": function () {
			var stateful = new (dcl(Stateful, {
				foo: undefined,
				bar: undefined
			}))({
				foo: "Foo0",
				bar: "Bar0"
			});
			var log = "";
			stateful.observe(function () {
				log += "first";
			});
			stateful.observe(function () {
				log += ", second";
			});
			stateful.foo = "Foo1";
			stateful.bar = "Bar1";
			stateful.deliver();
			assert.strictEqual(log, "first, second", "deliver()");

			log = "";
			stateful.foo = "Foo2";
			stateful.bar = "Bar2";
			stateful.discardChanges();
			stateful.deliver();
			setTimeout(this.async().callback(function () {
				assert.strictEqual(log, "", "discardChanges()");
			}), 10);
		},
		"observe filter": function () {
			// Check to make sure reported changes are consistent between platforms with and without Object.observe()
			// native support
			var dfd = this.async(1000),
				nop = function () {},
				stateful = new (dcl(Stateful, {
					_private: 1,

					foo: 2,
					_setFooAttr: function (val) {
						this._set("foo", val);
					},

					constructor: function () {
						this.instanceProp = 3;
					},

					anotherFunc: nop
				}))({});
			stateful.observe(dfd.callback(function (oldValues) {
				assert.deepEqual(oldValues, {
					_private: 1,
					foo: 2,
					anotherFunc: nop
				});
			}));
			stateful._private = 11;
			stateful.foo = 22;
			stateful.anotherFunc = function () { };
			stateful.instanceProp = 33;
		}
	});
});
