/** @module decor/Stateful */
define([
	"dcl/advise",
	"dcl/dcl",
	"./features",
	"./Notifier"
], function (advise, dcl, has, Notifier) {
	var apn = {};

	// Object.is() polyfill from Observable.js
	function is(lhs, rhs) {
		return lhs === rhs && (lhs !== 0 || 1 / lhs === 1 / rhs) || lhs !== lhs && rhs !== rhs;
	}

	/**
	 * Helper function to map "foo" --> "_setFooAttr" with caching to avoid recomputing strings.
	 */
	function propNames(name) {
		if (apn[name]) {
			return apn[name];
		}
		var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
			return c.charAt(c.length - 1).toUpperCase();
		});
		var ret = apn[name] = {
			p: "_shadow" + uc + "Attr",	// shadow property, since real property hidden by setter/getter
			s: "_set" + uc + "Attr",	// converts dashes to camel case, ex: accept-charset --> _setAcceptCharsetAttr
			g: "_get" + uc + "Attr"
		};
		return ret;
	}

	var REGEXP_IGNORE_PROPS = /^constructor$|^_set$|^_get$|^deliver$|^discardChanges$|^_(.+)Attr$/;

	/**
	 * Base class for objects that provide named properties with optional getter/setter
	 * control and the ability to observe for property changes.
	 *
	 * The class also provides the functionality to auto-magically manage getters
	 * and setters for class attributes/properties.  Note though that expando properties
	 * (i.e. properties added to an instance but not in the prototype) are not supported.
	 *
	 * Getters and Setters should follow the format of `_setXxxAttr` or `_getXxxAttr` where
	 * the xxx is a name of the attribute to handle.  So an attribute of `foo`
	 * would have a custom getter of `_getFooAttr` and a custom setter of `_setFooAttr`.
	 * Setters must save and announce the new property value by calling `this._set("foo", val)`,
	 * and getters should access the property value as `this._get("foo")`.
	 *
	 * @example <caption>Example 1</caption>
	 * var MyClass = dcl(Stateful, { foo: "initial" });
	 * var obj = new MyClass();
	 * obj.observe(function(oldValues){
	 *    if ("foo" in oldValues) {
	 *      console.log("foo changed to " + this.foo);
	 *    }
	 * });
	 * obj.foo = bar;
	 * // Stateful by default interprets the first parameter passed to
	 * // the constructor as a set of properties to set on the widget
	 * // immediately after it is created.
	 *
	 * @example <caption>Example 2</caption>
	 * var MyClass = dcl(Stateful, { foo: "initial" });
	 * var obj = new MyClass({ foo: "special"});
	 *
	 * @mixin module:decor/Stateful
	 */
	var Stateful = dcl(null, /** @lends module:decor/Stateful# */ {
		/**
		 * Returns a hash of properties that should be observed.
		 * @returns {Object} Hash of properties.
		 * @protected
		 */
		getProps: function () {
			var hash = {};
			for (var prop in this) {
				if (!REGEXP_IGNORE_PROPS.test(prop)) {
					hash[prop] = true;
				}
			}
			return hash;
		},

		/**
		 * Sets up ES5 getters/setters for each class property.
		 * Inside introspect(), "this" is a reference to the prototype rather than any individual instance.
		 * @param {Object} props - Hash of properties.
		 * @protected
		 */
		introspect: function (props) {
			Object.keys(props).forEach(function (prop) {
				var names = propNames(prop),
					shadowProp = names.p,
					getter = names.g,
					setter = names.s;

				// Setup ES5 getter and setter for this property, if not already setup.
				// For a property named foo, saves raw value in _fooAttr.
				// ES5 setter intentionally does late checking for this[names.s] in case a subclass sets up a
				// _setFooAttr method.
				if (!(shadowProp in this)) {
					this[shadowProp] = this[prop];
					delete this[prop]; // make sure custom setters fire
					Object.defineProperty(this, prop, {
						enumerable: true,
						set: function (x) {
							setter in this ? this[setter](x) : this._set(prop, x);
						},
						get: function () {
							return getter in this ? this[getter]() : this[shadowProp];
						}
					});
				}
			}, this);
		},

		constructor: dcl.advise({
			before: function () {
				// First time this class is instantiated, introspect it.
				// Use _introspected flag on constructor, rather than prototype, to avoid hits when superclass
				// was already inspected but this class wasn't.
				var ctor = this.constructor;
				if (!ctor._introspected) {
					// note: inside getProps() and introspect(), this refs prototype
					ctor._props = ctor.prototype.getProps();
					ctor.prototype.introspect(ctor._props);
					ctor._introspected = true;
				}
			},

			after: function (args) {
				// Automatic setting of params during construction.
				// In after() advice so that it runs after all the subclass constructor methods.
				this.processConstructorParameters(args);
			}
		}),

		/**
		 * Called after Object is created to process parameters passed to constructor.
		 * @protected
		 */
		processConstructorParameters: function (args) {
			if (args.length) {
				this.mix(args[0]);
			}
		},

		/**
		 * Set a hash of properties on a Stateful instance.
		 * @param {Object} hash - Hash of properties.
		 * @example
		 * myObj.mix({
		 *     foo: "Howdy",
		 *     bar: 3
		 * });
		 */
		mix: function (hash) {
			for (var x in hash) {
				if (hash.hasOwnProperty(x)) {
					this[x] = hash[x];
				}
			}
		},


		/**
		 * Internal helper for directly setting a property value without calling the custom setter.
		 *
		 * Directly changes the value of an attribute on an object, bypassing any
		 * accessor setter.  Also notifies callbacks registered via observe().
		 * Custom setters should call `_set` to actually record the new value.
		 * @param {string} name - The property to set.
		 * @param {*} value - Value to set the property to.
		 * @protected
		 */
		_set: function (name, value) {
			var shadowPropName = propNames(name).p,
				oldValue = this[shadowPropName];
			this[shadowPropName] = value;
			!is(value, oldValue) && this._notify && this._notify(name, oldValue);
		},

		/**
		 * Internal helper for directly accessing an attribute value.
		 *
		 * Directly gets the value of an attribute on an object, bypassing any accessor getter.
		 * It is designed to be used by descendant class if they want
		 * to access the value in their custom getter before returning it.
		 * @param {string} name - Name of property.
		 * @returns {*} Value of property.
		 * @protected
		 */
		_get: function (name) {
			return this[propNames(name).p];
		},

		/**
		 * Notifies current values to observers for specified property name(s).
		 * Handy to manually schedule invocation of observer callbacks when there is no change in value.
		 * @method module:decor/Stateful#notifyCurrentValue
		 * @param {...string} name The property name.
		 */
		notifyCurrentValue: function () {
			if (this._notify) {
				Array.prototype.forEach.call(arguments, function (name) {
					this._notify(name, this[propNames(name).p]);
				}, this);
			}
		},

		/**
		 * Get list of properties that Stateful#observe() should observe.
		 * @returns {string[]} list of properties
		 * @protected
		 */
		getPropsToObserve: function () {
			return this.constructor._props;
		},

		/**
		 * Observes for change in properties.
		 * Callback is called at the end of micro-task of changes with a hash table of
		 * old values keyed by changed property.
		 * Multiple changes to a property in a micro-task are squashed.
		 * @method module:decor/Stateful#observe
		 * @param {function} callback The callback.
		 * @returns {Object}
		 *     Object with `deliver()`, `discardChanges()`, and `remove()` methods.
		 * @example
		 *     var stateful = new (dcl(Stateful, {
		 *             foo: undefined,
		 *             bar: undefined,
		 *             baz: undefined
		 *         }))({
		 *             foo: 3,
		 *             bar: 5,
		 *             baz: 7
		 *         });
		 *     stateful.observe(function (oldValues) {
		 *         // oldValues is {foo: 3, bar: 5, baz: 7}
		 *     });
		 *     stateful.foo = 4;
		 *     stateful.bar = 6;
		 *     stateful.baz = 8;
		 *     stateful.foo = 6;
		 *     stateful.bar = 8;
		 *     stateful.baz = 10;
		 */
		observe: function (callback) {
			var h = new Notifier(callback.bind(this));

			// Tell the Notifier when any property's value is changed,
			// Also, make this.deliver() and this.discardComputing() call deliver() and discardComputing() on Notifier.
			var advices = [
				advise.after(this, "_notify", function (args) {
					h.notify(args[0], args[1]);
				}),
				advise.after(this, "deliver", h.deliver.bind(h)),
				advise.after(this, "discardChanges", h.discardChanges.bind(h))
			];

			return {
				deliver: h.deliver.bind(h),
				discardChanges: h.discardChanges.bind(h),
				remove: function () {
					if (!this._removed) {
						h.discardChanges();
						advices.forEach(function (advice) {
							advice.destroy();
						});
						h = null;
						advices = null;
						this._removed = true;
					}
				}
			};
		},

		/**
		 * Synchronously deliver change records to all listeners registered via `observe()`.
		 */
		deliver: function () {
		},

		/**
		 * Discard change records for all listeners registered via `observe()`.
		 */
		discardChanges: function () {
		}
	});

	dcl.chainAfter(Stateful, "introspect");

	return Stateful;
});
