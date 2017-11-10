/** @module decor/Evented */
define('decor/Evented',["dcl/dcl", "dcl/advise"], function (dcl, advise) {
	/**
	 * Base class to add `on()` and `emit()` methods to a class for listening for events and emitting events.
	 * @example
	 * var EventedSubClass = dcl(Evented, {...});
	 * var instance = new EventedSubClass();
	 * instance.on("open", function (event) {
	 *     ... do something with event
	 * });
	 * instance.emit("open", {name: "some event", ...});
	 * @mixin module:decor/Evented
	 */
	return dcl(null, /** @lends module:decor/Evented# */ {
		/**
		 * Setup listener to be called when specified event is fired.
		 * @param {string} type - Name of event.
		 * @param {Function} listener - Callback for when event occurs.
		 * @returns {Object} Handle with `destroy()` method to stop listening to event.
		 */
		on: function (type, listener) {
			return advise.before(this, "on" + type, listener);
		},

		/**
		 * Emit specified event.
		 * @param {string} type - Name of event.
		 * @param {...anything} var_args Parameters to pass to the listeners for this event.
		 */
		emit: function (type) {
			var func = "on" + type;
			if (this[func]) {
				var args = Array.prototype.slice.call(arguments, 1);
				this[func].apply(this, args);
			}
		}
	});
});

define('requirejs-dplugins/has',["module"], function (module) {
	var cache = (module.config && module.config()) || {};
	var tokensRE = /[\?:]|[^:\?]+/g;

	function resolve(resource, has, isBuild) {
		var tokens = resource.match(tokensRE);
		var i = 0;
		var get = function (skip) {
			var term = tokens[i++];
			if (term === ":") {
				// empty string module name; therefore, no dependency
				return "";
			} else {
				// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
				if (tokens[i++] === "?") {
					var hasResult = has(term);
					if (hasResult === undefined && isBuild) {
						return undefined;
					} else if (!skip && hasResult) {
						// matched the feature, get the first value from the options
						return get();
					} else {
						// did not match, get the second value, passing over the first
						get(true);
						return get(skip);
					}
				}
				// A module or empty string.
				// This allows to tell apart "undefined flag at build time" and "no module required" cases.
				return term || "";
			}
		};
		return get();
	}

	function forEachModule(tokens, callback) {
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i] !== ":" && tokens[i] !== "?" && tokens[i + 1] !== "?") {
				callback(tokens[i], i);
			}
		}
	}

	var has = function (name) {
		var global = (function () {
			return this;
		})();

		return typeof cache[name] === "function" ? (cache[name] = cache[name](global)) : cache[name]; // Boolean
	};

	has.cache = cache;

	has.add = function (name, test, now, force) {
		if (!has("builder")) {
			(typeof cache[name] === "undefined" || force) && (cache[name] = test);
			return now && has(name);
		}
	};

	has.normalize = function (resource, normalize) {
		var tokens = resource.match(tokensRE);

		forEachModule(tokens, function (module, index) {
			tokens[index] = normalize(module);
		});

		return tokens.join("");
	};

	has.load = function (resource, req, onLoad, config) {
		config = config || {};

		if (!resource) {
			onLoad();
			return;
		}

		var mid = resolve(resource, has, config.isBuild);

		if (mid) {
			req([mid], onLoad);
		} else {
			onLoad();
		}
	};

	has.addModules = function (pluginName, resource, addModules) {
		var modulesToInclude = [];

		var mid = resolve(resource, has, true);
		if (mid) {
			modulesToInclude.push(mid);
		} else if (typeof mid === "undefined") {
			// has expression cannot be resolved at build time so include all the modules just in case.
			var tokens = resource.match(tokensRE);
			forEachModule(tokens, function (module) {
				modulesToInclude.push(module);
			});
		}

		addModules(modulesToInclude);
	};

	return has;
});

define('decor/features',["requirejs-dplugins/has"], function (has) {
	/* global Platform */
	has.add("console-api", typeof console !== "undefined");
	has.add("host-browser", typeof window !== "undefined");
	has.add("object-observe-api", typeof Object.observe === "function" && typeof Array.observe === "function");
	has.add("object-is-api", !!Object.is);
	has.add("setimmediate-api", typeof setImmediate === "function");
	has.add("mutation-observer-api",
		typeof MutationObserver !== "undefined"
			&& (/\[\s*native\s+code\s*\]/i.test(MutationObserver) // Avoid polyfill version of MutationObserver
				|| !/^\s*function/.test(MutationObserver)));
	has.add("polymer-platform", typeof Platform !== "undefined");
	return has;
});

/** @module decor/schedule */
define('decor/schedule',["./features"], function (has) {
	"use strict";

	/**
	 * Calls a function at the end of microtask.
	 * @function module:decor/schedule
	 * @param {Function} callback The function to call at the end of microtask.
	 */

	/* global setImmediate */
	var inFlight,
		SCHEDULEID_PREFIX = "_schedule",
		seq = 0,
		uniqueId = Math.random() + "",
		callbacks = {},
		pseudoDiv = has("mutation-observer-api") && document.createElement("div");
	function runCallbacks() {
		for (var anyWorkDone = true; anyWorkDone;) {
			anyWorkDone = false;
			for (var id in callbacks) {
				var callback = callbacks[id];
				delete callbacks[id];
				callback();
				anyWorkDone = true;
			}
		}
		inFlight = false;
	}
	if (has("mutation-observer-api")) {
		pseudoDiv.id = 0;
		new MutationObserver(runCallbacks).observe(pseudoDiv, {attributes: true});
	} else if (!has("setimmediate-api") && has("host-browser")) {
		window.addEventListener("message", function (event) {
			if (event.data === uniqueId) {
				runCallbacks();
			}
		});
	}
	return function (callback) {
		var id = SCHEDULEID_PREFIX + seq++;
		callbacks[id] = callback;
		if (!inFlight) {
			has("mutation-observer-api") ? ++pseudoDiv.id :
				has("setimmediate-api") ? setImmediate(runCallbacks) :
				window.postMessage(uniqueId, "*");
			inFlight = true;
		}
		return {
			remove: function () {
				delete callbacks[id];
			}
		};
	};
});


/** @module decor/Observable */
define('decor/Observable',[
	"./features",
	"./features!object-observe-api?:./schedule"
], function (has, schedule) {
	"use strict";

	/**
	 * An observable object, working as a shim
	 * of {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Object.observe()}.
	 * @class
	 * @alias module:decor/Observable
	 * @param {Object} o The object to mix-into the new Observable.
	 * @example
	 *     var observable = new Observable({foo: "Foo0"});
	 *     Observable.observe(observable, function (changeRecords) {
	 *         // Called at the end of microtask with:
	 *         //     [
	 *         //         {
	 *         //             type: "update",
	 *         //             object: observable,
	 *         //             name: "foo",
	 *         //             oldValue: "Foo0"
	 *         //         },
	 *         //         {
	 *         //             type: "add",
	 *         //             object: observable,
	 *         //             name: "bar"
	 *         //         }
	 *         //     ]
	 *     });
	 *     observable.set("foo", "Foo1");
	 *     observable.set("bar", "Bar0");
	 */
	var Observable,
		defineProperty = Object.defineProperty,
		getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	/**
	 * The default list of change record types, which is:
	 * [
	 *     "add",
	 *     "update",
	 *     "delete",
	 *     "reconfigure",
	 *     "setPrototype",
	 *     "preventExtensions"
	 * ]
	 * @constant {Array.<module:decor/Observable~ChangeType>}
	 *     module:decor/Observable~DEFAULT_CHANGETYPES
	 */
	var DEFAULT_ACCEPT_CHANGETYPES = {
		"add": 1,
		"update": 1,
		"delete": 1,
		"reconfigure": 1,
		"setPrototype": 1,
		"preventExtensions": 1
	}; // Observable#set() only supports the first two

	/**
	 * Change record type.
	 * One of:
	 * * "add"
	 * * "update"
	 * * "delete"
	 * * "reconfigure"
	 * * "setPrototype"
	 * * "preventExtensions"
	 * * "splice"
	 * @typedef {string} module:decor/Observable~ChangeType
	 */

	/**
	 * Change record seen in Observable.observe().
	 * @typedef {Object} module:decor/Observable~ChangeRecord
	 * @property {module:decor/Observable~ChangeType} type The type of change record.
	 * @property {Object} object The changed object.
	 * @property {string} [name] The changed property name. Set only for non-splice type of change records.
	 * @property {number} [index] The array index of splice. Set only for splice type of change records.
	 * @property {Array} [removed] The removed array elements. Set only for splice type of change records.
	 * @property {number} [addedCount] The count of added array elements. Set only for splice type of change records.
	 */

	/**
	 * Change callback.
	 * @callback module:decor/Observable~ChangeCallback
	 * @param {Array.<module:decor/Observable~ChangeRecord>} changeRecords The change records.
	 */

	Observable = function (o) {
		// Make Observable marker not enumerable, configurable or writable
		if (!this._observable) { // In case this constructor is called manually
			defineProperty(this, "_observable", {value: 1});
		}
		o && Observable.assign(this, o);
	};

	/**
	 * @method module:decor/Observable.test
	 * @param {Object} o The object to test.
	 * @returns {boolean} true if o is an instance of Observable.
	 */
	Observable.test = function (o) {
		return o && o._observable;
	};

	/**
	 * @method module:decor/Observable.is
	 * @returns {boolean} true if the given two values are the same, considering NaN as well as +0 vs. -0.
	 */
	Observable.is = has("object-is-api") ? Object.is : function (lhs, rhs) {
		return lhs === rhs && (lhs !== 0 || 1 / lhs === 1 / rhs) || lhs !== lhs && rhs !== rhs;
	};

	/**
	 * Copy properties of given source objects to given target object.
	 * If target object has {@link module:decor/Observable#set set()} function for the property, uses it.
	 * @function module:decor/Observable.assign
	 * @param {Object} dst The target object.
	 * @param {...Object} var_args The source objects.
	 * @returns {Object} The target object.
	 */
	Observable.assign = function (dst) {
		if (dst == null) {
			throw new TypeError("Can't convert " + dst + " to object.");
		}
		dst = Object(dst);
		for (var i = 1, l = arguments.length; i < l; ++i) {
			var src = Object(arguments[i]),
				props = Object.getOwnPropertyNames(src);
			for (var j = 0, m = props.length; j < m; ++j) {
				var prop = props[j];
				Observable.prototype.set.call(dst, prop, src[prop]);
			}
		}
		return dst;
	};

	/**
	 * @method module:decor/Observable.canObserve
	 * @param {Object} o The object to test.
	 * @returns {boolean} true if o can be observed with {@link module:decor/Observable.observe Observable.observe()}.
	 */
	if (has("object-observe-api")) {
		Observable.canObserve = function (o) {
			return typeof o === "object" && o != null;
		};
	} else {
		Observable.canObserve = Observable.test;
	}

	if (has("object-observe-api")) {
		defineProperty(Observable.prototype, "set", { // Make set() not enumerable
			value: function (name, value) {
				this[name] = value;
				return value;
			},
			configurable: true,
			writable: true
		});

		Observable.observe = function (object, callback, accept) {
			Object.observe.call(this, object, callback, accept);
			return {
				remove: function () {
					Object.unobserve(object, callback);
				}
			};
		};

		Observable.getNotifier = Object.getNotifier;
		Observable.deliverChangeRecords = Object.deliverChangeRecords;
	} else {
		defineProperty(Observable.prototype, "set", { // Make set() not enumerable
			/**
			 * Sets a value.
			 * Automatically emits change record(s)
			 * compatible with {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe Object.observe()}
			 * if no ECMAScript setter is defined for the given property.
			 * If ECMAScript setter is defined for the given property, use
			 * {@link module:decor/Observable~Notifier#notify Observable.getNotifier(observable).notify(changeRecord)}
			 * to manually emit a change record.
			 * @method module:decor/Observable#set
			 * @param {string} name The property name.
			 * @param value The property value.
			 * @returns The value set.
			 */
			value: function (name, value) {
				var type = name in this ? "update" : "add",
					oldValue = this[name],
					// For defining setter, ECMAScript setter should be used
					setter = (getOwnPropertyDescriptor(this, name) || {}).set;
				this[name] = value;
				if (!Observable.is(value, oldValue) && setter === undefined) {
					// Auto-notify if there is no setter defined for the property.
					// Application should manually call Observable.getNotifier(observable).notify(changeRecord)
					// if a setter is defined.
					var changeRecord = {
						type: type,
						object: this,
						name: name + ""
					};
					if (type === "update") {
						changeRecord.oldValue = oldValue;
					}
					Observable.getNotifier(this).notify(changeRecord);
				}
				return value;
			},
			configurable: true,
			writable: true
		});

		var seq = 0,
			hotCallbacks = {},
			deliverHandle = null,
			deliverAllByTimeout = function () {
				/* global Platform */
				has("polymer-platform") && Platform.performMicrotaskCheckpoint(); // For Polymer watching for Observable
				for (var anyWorkDone = true; anyWorkDone;) {
					anyWorkDone = false;
					// Observation may stop during observer callback
					var callbacks = [];
					for (var s in hotCallbacks) {
						callbacks.push(hotCallbacks[s]);
					}
					hotCallbacks = {};
					callbacks = callbacks.sort(function (lhs, rhs) {
						return lhs._seq - rhs._seq;
					});
					for (var i = 0, l = callbacks.length; i < l; ++i) {
						if (callbacks[i]._changeRecords.length > 0) {
							Observable.deliverChangeRecords(callbacks[i]);
							anyWorkDone = true;
						}
					}
				}
				deliverHandle = null;
			},
			removeGarbageCallback = function (callback) {
				if (callback._changeRecords.length === 0 && callback._refCountOfNotifier === 0) {
					callback._seq = undefined;
				}
			};

		/**
		 * Notifier object for Observable.
		 * This is an internal function and cannot be used directly.
		 * @class module:decor/Observable~Notifier
		 */
		var Notifier = function (target) {
			this.target = target;
			this.observers = {};
			this._activeChanges = {};
		};

		Notifier.prototype = /** @lends module:decor/Observable~Notifier */ {
			/**
			 * Queue up a change record.
			 * It will be notified at the end of microtask,
			 * or when {@link module:decor/Observable.deliverChangeRecords Observable.deliverChangeRecords()}
			 * is called.
			 * @method module:decor/Observable~Notifier#notify
			 * @param {module:decor/Observable~ChangeRecord} changeRecord
			 *     The change record to queue up for notification.
			 */
			notify: function (changeRecord) {
				function shouldDeliver(activeChanges, acceptTable, changeType) {
					if (changeType in acceptTable) {
						for (var s in acceptTable) {
							if (activeChanges[s] > 0) {
								return false;
							}
						}
						return true;
					}
				}
				for (var s in this.observers) {
					if (shouldDeliver(this._activeChanges, this.observers[s].acceptTable, changeRecord.type)) {
						var callback = this.observers[s].callback;
						callback._changeRecords.push(changeRecord);
						hotCallbacks[callback._seq] = callback;
						if (!deliverHandle) {
							deliverHandle = schedule(deliverAllByTimeout);
						}
					}
				}
			},
			/**
			 * Let the series of changes made in the given callback be represented
			 * by a synthetic change of the given change type.
			 * The callback may return the synthetic change record,
			 * which will be of the `type` and automatically emitted.
			 * Otherwise, the caller can emit the synthetic record manually
			 * via {@link module:decor/Observable~Notifier#notify notify()}.
			 * @param {string} type The change type of synthetic change record.
			 * @param {Function} callback The callback function.
			 */
			performChange: function (type, callback) {
				this._activeChanges[type] = (this._activeChanges[type] || 0) + 1;
				var source = callback.call(undefined);
				--this._activeChanges[type];
				if (source) {
					var target = {
						type: type,
						object: this.target
					};
					for (var s in source) {
						if (!(s in target)) {
							target[s] = source[s];
						}
					}
					this.notify(target);
				}
			}
		};

		/**
		 * Obtains a notifier object for the given {@link module:decor/Observable Observable}.
		 * @method module:decor/Observable.getNotifier
		 * @param {Object} observable The {@link module:decor/Observable Observable} to get a notifier object of.
		 * @returns {module:decor/Observable~Notifier}
		 */
		Observable.getNotifier = function (observable) {
			if (!getOwnPropertyDescriptor(observable, "_notifier")) {
				// Make the notifier reference not enumerable, configurable or writable
				defineProperty(observable, "_notifier", {
					value: new Notifier(observable)
				});
			}
			return observable._notifier;
		};

		/**
		 * Observes an {@link module:decor/Observable Observable} for changes.
		 * @method module:decor/Observable.observe
		 * @param {Object} observable The {@link module:decor/Observable Observable} to observe.
		 * @param {module:decor/Observable~ChangeCallback} callback The change callback.
		 * @param {Array.<module:decor/Observable~ChangeType>}
		 *     [accept={@link module:decor/Observable~DEFAULT_CHANGETYPES}]
		 *     The list of change record types to observe.
		 * @returns {Handle} The handle to stop observing.
		 * @throws {TypeError} If the 1st argument is non-object or null.
		 */
		Observable.observe = function (observable, callback, accept) {
			if (Object(observable) !== observable) {
				throw new TypeError("Observable.observe() cannot be called on non-object.");
			}
			if (!("_seq" in callback)) {
				callback._seq = seq++;
				callback._changeRecords = [];
				callback._refCountOfNotifier = 0;
			}
			var acceptTable = accept ? accept.reduce(function (types, type) {
					types[type] = 1;
					return types;
				}, {}) : DEFAULT_ACCEPT_CHANGETYPES,
				notifier = Observable.getNotifier(observable);
			if (!(callback._seq in notifier.observers)) {
				notifier.observers[callback._seq] = {
					acceptTable: acceptTable,
					callback: callback
				};
				++callback._refCountOfNotifier;
			} else {
				notifier.observers[callback._seq].acceptTable = acceptTable;
			}
			return {
				remove: function () {
					if (callback._seq in notifier.observers) {
						delete notifier.observers[callback._seq];
						--callback._refCountOfNotifier;
					}
				}
			};
		};

		/**
		 * Delivers change records immediately.
		 * @method module:decor/Observable.deliverChangeRecords
		 * @param {Function} callback The change callback to deliver change records of.
		 */
		Observable.deliverChangeRecords = function (callback) {
			var length = callback._changeRecords.length;
			try {
				callback(callback._changeRecords.splice(0, length));
			} catch (e) {
				has("console-api") && console.error("Error occured in observer callback: " + (e.stack || e));
			}
			removeGarbageCallback(callback);
		};
	}

	return Observable;
});

/** @module decor/Stateful */
define('decor/Stateful',[
	"dcl/advise",
	"dcl/dcl",
	"./features",
	"./Observable"
], function (advise, dcl, has, Observable) {
	var apn = {};

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

	/**
	 * Utility function for notification.
	 */
	function notify(stateful, name, oldValue) {
		Observable.getNotifier(stateful).notify({
			// Property is never new because setting up shadow property defines the property
			type: "update",
			object: stateful,
			name: name + "",
			oldValue: oldValue
		});
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
				Observable.call(this);
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
			// Even if Object.observe() is natively available,
			// automatic change record emission won't happen if there is a ECMAScript setter
			!Observable.is(value, oldValue) && notify(this, name, oldValue);
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
			Array.prototype.forEach.call(arguments, function (name) {
				notify(this, name, this[propNames(name).p]);
			}, this);
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
		 * @returns {module:decor/Stateful.PropertyListObserver}
		 *     The observer that can be used to stop observation
		 *     or synchronously deliver/discard pending change records.
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
			// create new listener
			var h = new Stateful.PropertyListObserver(this, this.getPropsToObserve());
			h.open(callback, this);

			// make this.deliver() and this.discardComputing() call deliver() and discardComputing() on new listener
			var a1 = advise.after(this, "deliver", h.deliver.bind(h)),
				a2 = advise.after(this, "discardChanges", h.discardChanges.bind(h));
			advise.before(h, "close", function () {
				a1.unadvise();
				a2.unadvise();
			});

			return h;
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

	/**
	 * An observer to observe a set of {@link module:decor/Stateful Stateful} properties at once.
	 * This class is what {@link module:decor/Stateful#observe} returns.
	 * @class module:decor/Stateful.PropertyListObserver
	 * @param {Object} o - The {@link module:decor/Stateful Stateful} being observed.
	 * @param {Object} props - Hash of properties to observe.
	 */
	Stateful.PropertyListObserver = function (o, props) {
		this.o = o;
		this.props = props;
	};

	Stateful.PropertyListObserver.prototype = {
		/**
		 * Starts the observation.
		 * {@link module:decor/Stateful#observe `Stateful#observe()`} calls this method automatically.
		 * @method module:decor/Stateful.PropertyListObserver#open
		 * @param {function} callback The change callback.
		 * @param {Object} thisObject The object that should work as "this" object for callback.
		 */
		open: function (callback, thisObject) {
			var props = this.props;
			this._boundCallback = function (records) {
				if (!this._closed && !this._beingDiscarded) {
					var oldValues = {};
					records.forEach(function (record) {
						// for consistency with platforms w/out native Object.observe() support,
						// only notify about updates to properties in prototype (see getProps())
						if (record.name in props && !(record.name in oldValues)) {
							oldValues[record.name] = record.oldValue;
						}
					});
					/* jshint unused: false */
					for (var s in oldValues) {
						callback.call(thisObject, oldValues);
						break;
					}
				}
			}.bind(this);
			this._h = Observable.observe(this.o, this._boundCallback);
			return this.o;
		},

		/**
		 * Synchronously delivers pending change records.
		 * @method module:decor/Stateful.PropertyListObserver#deliver
		 */
		deliver: function () {
			this._boundCallback && Observable.deliverChangeRecords(this._boundCallback);
		},

		/**
		 * Discards pending change records.
		 * @method module:decor/Stateful.PropertyListObserver#discardChanges
		 */
		discardChanges: function () {
			this._beingDiscarded = true;
			this._boundCallback && Observable.deliverChangeRecords(this._boundCallback);
			this._beingDiscarded = false;
			return this.o;
		},

		/**
		 * Does nothing, just exists for API compatibility with liaison and other data binding libraries.
		 * @method module:decor/Stateful.PropertyListObserver#setValue
		 */
		setValue: function () {},

		/**
		 * Stops the observation.
		 * @method module:decor/Stateful.PropertyListObserver#close
		 */
		close: function () {
			if (this._h) {
				this._h.remove();
				this._h = null;
			}
			this._closed = true;
		}
	};

	/**
	 * Synonym for {@link module:decor/Stateful.PropertyListObserver#close `close()`}.
	 * @method module:decor/Stateful.PropertyListObserver#remove
	 */
	Stateful.PropertyListObserver.prototype.remove = Stateful.PropertyListObserver.prototype.close;

	return Stateful;
});

/** @module decor/Destroyable */
define('decor/Destroyable',[
	"dcl/advise",
	"dcl/dcl"
], function (advise, dcl) {
	/**
	 * Mixin to track handles and release them when instance is destroyed.
	 *
	 * Call `this.own(...)` on list of handles (returned from dcl/advise, dojo/on,
	 * decor/Stateful#observe, or any class (including widgets) with a destroy() or remove() method.
	 * Then call `destroy()` later to destroy this instance and release the resources.
	 * @mixin module:decor/Destroyable
	 */
	var Destroyable = dcl(null, /** @lends module:decor/Destroyable# */ {
		/**
		 * Destroy this class, releasing any resources registered via `own()`.
		 * @method
		 */
		destroy: dcl.advise({
			before: function () {
				this._beingDestroyed = true;
				this._releaseHandles();
			},
			after: function () {
				this._destroyed = true;
			}
		}),

		_releaseHandles: function () {
		},

		/**
		 * Track specified handles and remove/destroy them when this instance is destroyed, unless they were
		 * already removed/destroyed manually.
		 * @returns {Object[]} The array of specified handles, so you can do for example:
		 * `var handle = this.own(on(...))[0];`
		 * @protected
		 */
		own: function () {
			var cleanupMethods = [
				"destroy",
				"remove",
				"cancel"
			];

			// transform arguments into an Array
			var ary = Array.prototype.slice.call(arguments);
			ary.forEach(function (handle) {
				// When this.destroy() is called, destroy handle.  Since I'm using advise.before(),
				// the handle will be destroyed before a subclass's destroy() method starts running, before it calls
				// this.inherited() or even if it doesn't call this.inherited() at all.  If that's an issue, make an
				// onDestroy() method and connect to that instead.
				var destroyMethodName;
				var odh = advise.after(this, "_releaseHandles", function () {
					handle[destroyMethodName]();
				});

				// Callback for when handle is manually destroyed.
				var hdhs = [];

				function onManualDestroy() {
					odh.destroy();
					hdhs.forEach(function (hdh) {
						hdh.destroy();
					});
				}

				// Setup listeners for manual destroy of handle.
				// Also compute destroyMethodName, used in listener above.
				if (handle.then) {
					// Special path for Promises.  Detect when Promise is settled.
					handle.then(onManualDestroy, onManualDestroy);
				}
				cleanupMethods.forEach(function (cleanupMethod) {
					if (typeof handle[cleanupMethod] === "function") {
						if (!destroyMethodName) {
							// Use first matching method name in above listener.
							destroyMethodName = cleanupMethod;
						}
						if (!handle.then) {
							// Path for non-promises.  Use AOP to detect when handle is manually destroyed.
							hdhs.push(advise.after(handle, cleanupMethod, onManualDestroy));
						}
					}
				});
			}, this);

			return ary;
		},

		/**
		 * Wrapper to setTimeout to avoid deferred functions executing
		 * after the originating widget has been destroyed.
		 * @param {Function} fcn - Function to be executed after specified delay (or 0ms if no delay specified).
		 * @param {number} delay - Delay in ms, defaults to 0.
		 * @returns {Object} Handle with a remove method that deschedules the callback from being called.
		 * @protected
		 */
		defer: function (fcn, delay) {
			// TODO: if delay unspecified, use schedule?
			var timer = setTimeout(
				function () {
					if (!timer) {
						return;
					}
					timer = null;
					if (!this._destroyed) {
						fcn.call(this);
					}
				}.bind(this),
					delay || 0
			);
			return {
				remove: function () {
					if (timer) {
						clearTimeout(timer);
						timer = null;
					}
					return null; // so this works well: handle = handle.remove();
				}
			};
		}
	});

	dcl.chainBefore(Destroyable, "destroy");

	return Destroyable;
});

/** @module decor/Invalidating */
define('decor/Invalidating',[
	"dcl/dcl",
	"./Stateful",
	"./Destroyable"
], function (dcl, Stateful, Destroyable) {
	/**
	 * Mixin class for widgets
	 * that want to calculate computed properties at once and/or to render UI at once upon multiple property changes.
	 * @class module:decor/Invalidating
	 */
	var Invalidating = dcl([Stateful, Destroyable], /** @lends module:decor/Invalidating# */ {
		// Call initializeInvalidating() right after class is constructed.  Note though that this code won't run for
		// custom elements, since they call createdCallback() rather than constructor().
		// Instead, delite/Widget calls initializeInvalidating() directly.
		constructor: dcl.after(function () {
			this.initializeInvalidating();
		}),

		/**
		 * Make initial calls to `computeProperties()`, `initializeRendering()`, and `refreshRendering()`,
		 * and setup observers so those methods are called whenever properties are modified in the future.
		 * Normally this method is called automatically by the constructor, and should not be called manually,
		 * but the method is exposed for custom elements since they do not call the `constructor()` method.
		 * @protected
		 */
		initializeInvalidating: function () {
			if (!this._hComputing && !this._hRendering) {
				// Make initial call to computeProperties() and setup listener for future calls to computeProperties().
				// Any call to computeProperties(), including the initial call, may trigger more immediate calls to
				// computeProperties().
				this.own(this._hComputing = this.observe(function (oldValues) {
					this.computeProperties(oldValues);
					this.deliverComputing();
				}));
				this.computeProperties(this, true);

				// Make initial call to initializeRendering() and refreshRendering(), and setup listener for future
				// calls.
				this.initializeRendering(this);
				this.refreshRendering(this, true);
				this.own(this._hRendering = this.observe(function (oldValues) {
					var shouldInitializeRendering = this.shouldInitializeRendering(oldValues);
					if (shouldInitializeRendering) {
						this.initializeRendering(oldValues);
						this.refreshRendering(this, true);
					} else {
						this.refreshRendering(oldValues);
					}
				}));
			}
		},

		/**
		 * Synchronously deliver change records for computed properties
		 * so that `computeProperties()` is called if there are pending change records.
		 */
		deliverComputing: function () {
			this._hComputing && this._hComputing.deliver();
			return this._hComputing;
		},

		/**
		 * Discard change records for computed properties.
		 */
		discardComputing: function () {
			this._hComputing && this._hComputing.discardChanges();
			return this._hComputing;
		},

		/**
		 * Function to return if rendering should be initialized.
		 * (Instead of making partial changes for post-initialization)
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 * @param {boolean} isAfterCreation True if this call is right after instantiation.
		 * @return {boolean} True if rendering should be initialized.
		 */
		shouldInitializeRendering: function () {},

		/**
		 * Callback function to calculate computed properties upon property changes.
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 * @param {boolean} isAfterCreation True if this call is right after instantiation.
		 */
		computeProperties: function () {},

		/**
		 * Callback function to initialize rendering.
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 */
		initializeRendering: function () {},

		/**
		 * Callback function to render UI upon property changes.
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 * @param {boolean} isAfterInitialRendering True if this call is right after `initializeRendering()`.
		 */
		refreshRendering: function () {}
	});

	dcl.chainAfter(Invalidating, "computeProperties");
	dcl.chainAfter(Invalidating, "refreshRendering");

	return Invalidating;
});

/** @module liaison/ObservableArray */
define('decor/ObservableArray',[
	"requirejs-dplugins/has",
	"./Observable"
], function (has, Observable) {
	"use strict";

	/**
	 * The same argument list of Array, taking the length of the new array or the initial list of array elements.
	 * @typedef {number|...Anything} module:liaison/ObservableArray~CtorArguments
	 */

	/**
	 * An observable array, working as a shim
	 * of {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Array.observe()}.
	 * @class
	 * @alias module:liaison/ObservableArray
	 * @augments module:decor/Observable
	 * @param {module:decor/ObservableArray~CtorArguments} [args]
	 *     The length of the new array or the initial list of array elements.
	 */
	var ObservableArray,
		augmentedMethods,
		defineProperty = Object.defineProperty,
		EMPTY_ARRAY = [],
		REGEXP_GLOBAL_OBJECT = /\[\s*object\s+global\s*\]/i; // Global object in node.js

	(function () {
		var observableArrayMarker = "_observableArray";

		if (has("object-observe-api")) {
			// For useNative case, make ObservableArray an instance of Array instead of an inheritance,
			// so that Array.observe() emits splices for .length update
			ObservableArray = function (length) {
				var self = [];
				Observable.call(self);
				// Make ObservableArray marker not enumerable, configurable or writable
				defineProperty(self, observableArrayMarker, {value: 1});
				defineProperty(self, "set", Object.getOwnPropertyDescriptor(Observable.prototype, "set"));
				if (typeof length === "number" && arguments.length === 1) {
					self.length = length;
				} else {
					EMPTY_ARRAY.push.apply(self, arguments);
				}
				return self;
			};
		} else {
			// TODO(asudoh):
			// Document that ObservableArray cannot be observed by Observable.observe()
			// without "splice" in accept list.
			// We need to create large amount of change records to do so,
			// when splice happens with large amount of removals/adds
			ObservableArray = function (length) {
				var beingConstructed = this && !REGEXP_GLOBAL_OBJECT.test(this) && !this.hasOwnProperty("length"),
					// If this is called as regular function (instead of constructor), work with a new instance
					self = beingConstructed ? [] : new ObservableArray();
				if (beingConstructed) {
					Observable.call(self);
					// Make ObservableArray marker not enumerable, configurable or writable
					defineProperty(self, observableArrayMarker, {value: 1});
					// Make those methods not enumerable
					for (var s in augmentedMethods) {
						defineProperty(self, s, {
							value: augmentedMethods[s],
							configurable: true,
							writable: true
						});
					}
				}
				if (typeof length === "number" && arguments.length === 1) {
					self.length = length;
				} else {
					EMPTY_ARRAY.push.apply(self, arguments);
				}
				return self;
			};
		}

		/**
		 * @method module:liaison/ObservableArray.test
		 * @param {Array} a The array to test.
		 * @returns {boolean} true if o is an instance of {@link module:liaison/ObservableArray ObservableArray}.
		 */
		ObservableArray.test = function (a) {
			return a && a[observableArrayMarker];
		};
	})();

	/**
	 * @method module:liaison/ObservableArray.canObserve
	 * @param {Array} a The array to test.
	 * @returns {boolean}
	 *     true if o can be observed with {@link module:liaison/ObservableArray.observe ObservableArray.observe()}.
	 */
	if (has("object-observe-api")) {
		ObservableArray.canObserve = function (a) {
			return typeof (a || {}).splice === "function";
		};
	} else {
		ObservableArray.canObserve = ObservableArray.test;
	}

	if (!has("object-observe-api")) {
		(function () {
			/**
			 * Adds and/or removes elements from an array
			 * and automatically emits a change record compatible
			 * with {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Array.observe()}.
			 * @param {number} index Index at which to start changing the array.
			 * @param {number} removeCount [An integer indicating the number of old array elements to remove.
			 * @param {...Anything} [var_args] The elements to add to the array.
			 * @return {Array} An array containing the removed elements.
			 * @memberof module:liaison/ObservableArray#
			 */
			function splice(index, removeCount) {
				/* jshint validthis: true */
				if (index < 0) {
					index = this.length + index;
				}
				var oldLength = this.length,
					changeRecord = {
						index: index,
						removed: this.slice(index, index + removeCount),
						addedCount: arguments.length - 2
					},
					result = EMPTY_ARRAY.splice.apply(this, arguments),
					lengthRecord = oldLength !== this.length && {
						type: "update",
						object: this,
						name: "length",
						oldValue: oldLength
					},
					notifier = Observable.getNotifier(this);
				notifier.performChange("splice", function () {
					lengthRecord && notifier.notify(lengthRecord);
					return changeRecord;
				});
				return result;
			}

			augmentedMethods = /** @lends module:liaison/ObservableArray# */ {
				splice: splice,

				/**
				 * Sets a value and automatically emits change record(s)
				 * compatible with
				 * {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Array.observe()}.
				 * @param {string} name The property name.
				 * @param value The property value.
				 * @returns The value set.
				 */
				set: function (name, value) {
					var args;
					if (name === "length") {
						args = new Array(Math.max(value - this.length, 0));
						args.unshift(Math.min(this.length, value), Math.max(this.length - value, 0));
						splice.apply(this, args);
					} else if (!isNaN(name) && +name >= this.length) {
						args = new Array(name - this.length);
						args.push(value);
						args.unshift(this.length, 0);
						splice.apply(this, args);
					} else {
						Observable.prototype.set.call(this, name, value);
					}
					return value;
				},

				/**
				 * Removes the last element from an array
				 * and automatically emits a change record compatible with
				 * {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Array.observe()}.
				 * @returns The element removed.
				 */
				pop: function () {
					return splice.call(this, -1, 1)[0];
				},

				/**
				 * Adds one or more elements to the end of an array
				 * and automatically emits a change record compatible with
				 * {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Array.observe()}.
				 * @param {...Anything} var_args The elements to add to the end of the array.
				 * @returns The new length of the array.
				 */
				push: function () {
					var args = [this.length, 0];
					EMPTY_ARRAY.push.apply(args, arguments);
					splice.apply(this, args);
					return this.length;
				},

				/**
				 * Reverses the order of the elements of an array
				 * and automatically emits a splice type of change record.
				 * @returns {Array} The array itself.
				 */
				reverse: function () {
					var changeRecord = {
							type: "splice",
							object: this,
							index: 0,
							removed: this.slice(),
							addedCount: this.length
						},
						result = EMPTY_ARRAY.reverse.apply(this, arguments);
					// Treat this change as a splice instead of updates in each entry
					Observable.getNotifier(this).notify(changeRecord);
					return result;
				},

				/**
				 * Removes the first element from an array
				 * and automatically emits a change record compatible with
				 * {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Array.observe()}.
				 * @returns The element removed.
				 */
				shift: function () {
					return splice.call(this, 0, 1)[0];
				},

				/**
				 * Sorts the elements of an array in place
				 * and automatically emits a splice type of change record.
				 * @returns {Array} The array itself.
				 */
				sort: function () {
					var changeRecord = {
							type: "splice",
							object: this,
							index: 0,
							removed: this.slice(),
							addedCount: this.length
						},
						result = EMPTY_ARRAY.sort.apply(this, arguments);
					// Treat this change as a splice instead of updates in each entry
					Observable.getNotifier(this).notify(changeRecord);
					return result;
				},

				/**
				 * Adds one or more elements to the front of an array
				 * and automatically emits a change record compatible with
				 * {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Array.observe()}.
				 * @param {...Anything} var_args The elements to add to the front of the array.
				 * @returns The new length of the array.
				 */
				unshift: function () {
					var args = [0, 0];
					EMPTY_ARRAY.push.apply(args, arguments);
					splice.apply(this, args);
					return this.length;
				}
			};
		})();
	}

	/**
	 * Observes an ObservableArray for changes.
	 * Internally calls {@link module:decor/Observable.observe Observable.observe()}
	 * observing for the following types of change records:
	 * [
	 *     "add",
	 *     "update",
	 *     "delete",
	 *     "splice"
	 * ]
	 * All change records will be converted to "splice" and are sorted by index and merged to smaller number
	 * of change records.
	 * @method
	 * @param {Object} observable The {@link module:liaison/ObservableArray ObservableArray} to observe.
	 * @param {module:decor/Observable~ChangeCallback} callback The change callback.
	 * @returns {Handle} The handle to stop observing.
	 * @throws {TypeError} If the 1st argument is non-object or null.
	 */
	ObservableArray.observe = (function () {
		function intersect(start1, end1, start2, end2) {
			return end1 <= start2 ? end1 - start2 : // Adjacent or distant
				end2 <= start1 ? end2 - start1 : // Adjacent or distant
				Math.min(end1, end2) - Math.max(start1, start2); // Intersected or contained
		}
		function normalize(record) {
			return record.type !== "add" && record.type !== "update" ? record :
				{
					type: "splice",
					object: record.object,
					index: +record.name,
					removed: [record.oldValue],
					addedCount: 1
				};
		}
		function observeSpliceCallback(callback, records) {
			var merged = [];
			records.forEach(function (incoming) {
				incoming = normalize(incoming);
				var doneIncoming = false,
					indexAdjustment = 0;
				for (var i = 0; i < merged.length; ++i) {
					var entry;
					if (!has("object-observe-api") || !Object.isFrozen(merged[i])) {
						entry = merged[i];
						entry.index += indexAdjustment;
					} else {
						entry = merged[i] = {
							type: "splice",
							object: merged[i].object,
							index: merged[i].index + indexAdjustment,
							removed: merged[i].removed,
							addedCount: merged[i].addedCount
						};
					}
					/* jshint maxlen:150 */
					var amount = intersect(entry.index, entry.index + entry.addedCount, incoming.index, incoming.index + incoming.removed.length);
					if (amount >= 0) {
						// Merge splices
						merged.splice(i--, 1);
						var removed,
							addedCount = entry.addedCount - amount + incoming.addedCount;
						if (entry.index < incoming.index) {
							removed = incoming.removed.slice(Math.max(amount, 0));
							EMPTY_ARRAY.unshift.apply(removed, entry.removed);
						} else {
							removed = incoming.removed.slice(0, amount > 0 ? entry.index - incoming.index : incoming.length);
							EMPTY_ARRAY.push.apply(removed, entry.removed);
							// Append happens when second splice's range contains first splice's range
							EMPTY_ARRAY.push.apply(removed, incoming.removed.slice(entry.index + entry.addedCount - incoming.index));
						}
						/* jshint maxlen:120 */
						if (removed.length === 0 && addedCount === 0) {
							doneIncoming = true;
						} else {
							incoming = {
								type: "splice",
								object: entry.object,
								index: Math.min(entry.index, incoming.index),
								removed: removed,
								addedCount: addedCount
							};
						}
						indexAdjustment -= entry.addedCount - entry.removed.length; // entry is subsumed by incoming
					} else if (incoming.index < entry.index) {
						// Insert the new splice
						var adjustment = incoming.addedCount - incoming.removed.length;
						entry.index += adjustment;
						indexAdjustment += adjustment;
						merged.splice(i++, 0, incoming);
						doneIncoming = true;
					}
				}
				if (!doneIncoming) {
					merged.push(incoming);
				}
			});
			if (merged.length > 0) {
				callback(merged);
			}
		}
		if (has("object-observe-api")) {
			return function (observableArray, callback) {
				Array.observe(observableArray, callback = observeSpliceCallback.bind(observableArray, callback));
				return {
					deliver: Object.deliverChangeRecords.bind(Object, callback),
					remove: Array.unobserve.bind(Array, observableArray, callback)
				};
			};
		} else {
			return function (observableArray, callback) {
				var h = Object.create(Observable.observe(observableArray,
					callback = observeSpliceCallback.bind(observableArray, callback), [
					"add",
					"update",
					"delete",
					"splice"
				]));
				h.deliver = Observable.deliverChangeRecords.bind(Observable, callback);
				return h;
			};
		}
	})();

	return ObservableArray;
});

/**
 * This module sets has() flags based on the current browser and platform:
 *
 * - `has("webkit")`, `has("chrome")`, `has("safari")`
 * - `has("ff")`
 * - `has("ie")`, `has("edge")`
 * - `has("ios")`
 * - `has("android")`
 * - `has("wp")`
 * - `has("mac")`
 *
 * It returns the `has()` function.
 * @module decor/sniff
 */
define('decor/sniff',["./features"], function (has) {
	/* jshint maxcomplexity:20 */

	if (has("host-browser")) {
		var n = navigator,
			dua = n.userAgent,
			dav = n.appVersion;

		// Platform detection
		has.add("mac", /Macintosh/.test(dav));
		if (dua.match(/(iPhone|iPod|iPad)/)) {
			var p = RegExp.$1.replace(/P/, "p");
			var v = dua.match(/OS ([\d_]+)/) ? RegExp.$1 : "1";
			var os = parseFloat(v.replace(/_/, ".").replace(/_/g, ""));
			has.add(p, os);		// "iphone", "ipad" or "ipod"
			has.add("ios", os);
		}
		has.add("android", parseFloat(dua.split("Android ")[1]) || undefined);

		has.add("msapp", parseFloat(dua.split("MSAppHost/")[1]) || undefined);

		has.add("wp", parseFloat(dua.split("Windows Phone ")[1]) || undefined);

		// Browser detection
		var version;
		if ((version = parseFloat(dua.split("Edge/")[1]))) {
			has.add("edge", version);
		} else if ((version = parseFloat(dua.split("WebKit/")[1]))) {
			has.add("webkit", version);
			has.add("chrome", parseFloat(dua.split("Chrome/")[1]) || undefined);
			has.add("safari", /Safari/.test(dav) && !has("chrome") && !has("android") ?
					parseFloat(dav.split("Version/")[1]) : undefined);
		} else if (/Trident/.test(dav)) {
			// IE8+
			has.add("ie", document.documentMode || parseFloat(dav.split("rv:")[1]));
		} else if ((version = parseFloat(dua.split("Firefox/")[1]))) {
			has.add("ff", version);
		}
	}

	return has;
});

define('../xibm/decor/main.js',[
    'decor/Evented',
    'decor/Invalidating',
    'decor/ObservableArray',
    'decor/features',
    'decor/schedule',
    'decor/sniff'
], function () {
});
