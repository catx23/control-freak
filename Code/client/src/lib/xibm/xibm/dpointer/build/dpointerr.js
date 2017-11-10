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

/**
 * 
 */
define('dpointer/handlers/features',[
	"requirejs-dplugins/has"
], function (has) {
	if (typeof document !== "undefined") {
		has.add("touch-events", "ontouchstart" in document); // UA supports Touch Events
		has.add("pointer-events", "onpointerdown" in document); // UA supports Pointer Events
		has.add("mspointer-events", "onmspointerdown" in document); // UA supports Pointer Events (IE10+IE11 preview)
		has.add("touch-device", /(mobile)|(android)/i.test(navigator.userAgent)); // mobile device
		has.add("css-touch-action", "touchAction" in document.body.style);// touch-action CSS
		has.add("css-ms-touch-action", "msTouchAction" in document.body.style);// -ms-touch-action CSS
	}
	return has;
});
/**
 * Pointer Events utilities
 */
define('dpointer/handlers/utils',[

], function () {
	"use strict";

	var utils = {
		events: { // pointer events names
			DOWN: "pointerdown",
			UP: "pointerup",
			CANCEL: "pointercancel",
			MOVE: "pointermove",
			OVER: "pointerover",
			OUT: "pointerout",
			ENTER: "pointerenter",
			LEAVE: "pointerleave",
			GOTCAPTURE: "gotpointercapture",
			LOSTCAPTURE: "lostpointercapture"
		},
		TouchAction: { // touch action
			ATTR_NAME: "touch-action",
			AUTO: 0,  // 0000
			PAN_X: 1, // 0001
			PAN_Y: 2, // 0010
			NONE: 3   // 0011
		}
	};

	// Properties and their default value used to create synthetic "Pointer Events" 
	var eventPropDesc = {
		// MouseEvent interface properties
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		ctrlKey: null,
		shiftKey: null,
		altKey: null,
		metaKey: null,
		button: 0,
		relatedTarget: null,
		// MouseEvent non standard properties
		which: 0,
		pageX: 0,
		pageY: 0,
		buttons: 0,
		// PointerEvent interface properties
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tiltX: 0,
		tiltY: 0,
		pointerType: "",
		isPrimary: false
	};

	// Pointer Events properties depending on the event type
	var eventTypeDesc = {
		pointerover: {bubbles: true, cancelable: true},
		pointerenter: {bubbles: false, cancelable: false},
		pointerdown: {bubbles: true, cancelable: true},
		pointermove: {bubbles: true, cancelable: true},
		pointerup: {bubbles: true, cancelable: true},
		pointercancel: {bubbles: true, cancelable: false},
		pointerout: {bubbles: true, cancelable: true},
		pointerleave: {bubbles: false, cancelable: false},
		gotpointercapture: {bubbles: true, cancelable: false},
		lostpointercapture: {bubbles: true, cancelable: false}
	};

	// Check if all properties can be redefined using a UIEvent.
	// Synthetic Pointer Event are created from a UIEvent.
	// "MouseEvent" would be too restrictive when it comes to redefine properties. 
	// "Event" may be better for performance and lest restrictive to redefine properties, but it causes weird/unstable
	// behavior on some Samsung/Android 4.2.2 browsers (fast moving of a Slider cause event.target to be null at
	// some point...)
	var canRedefineUIEvent = (function () {
		try {
			defineEventProperties(document.createEvent("UIEvent"), {});
			return true;
		} catch (error) {
			eventPropDesc.view = null;
			eventPropDesc.detail = 0;
			return false;
		}
	})();

	/**
	 * Pointer Event constructor.
	 *
	 * @param pointerType pointer event type name ("pointerdown", "pointerup"...)
	 * @param nativeEvent underlying event which contributes to this pointer event.
	 * @param props event properties (optional). Note that "bubbles", "cancelable", "view" and "detail" are ignored. 
	 * @returns Event a  Pointer event
	 */
	utils.Pointer = function (pointerType, nativeEvent, props) {
		var event;
		// set bubbles and cancelable value according to pointer event type
		props.bubbles = eventTypeDesc[pointerType].bubbles;
		props.cancelable = eventTypeDesc[pointerType].cancelable;
		// create the base event
		if (canRedefineUIEvent) {
			event = document.createEvent("UIEvent");
			event.initUIEvent(
				pointerType, props.bubbles, props.cancelable, nativeEvent.view || null, nativeEvent.detail || 0
			);
		} else {
			// fallback (iOS 7 disallows to redefine property value/getter)
			event = document.createEvent("Event");
			event.initEvent(pointerType, props.bubbles, props.cancelable);
			// view and detail properties are not available in Event constructor 
			props.view = nativeEvent.view || null;
			props.detail = nativeEvent.detail || 0;
		}
		// redefine event properties
		defineEventProperties(event, props);
		// map functions
		mapNativeFunctions(event, nativeEvent);

		return event;
	};

	/**
	 * @param e event
	 * @param props event properties
	 * @returns Event
	 */
	function defineEventProperties(e, props) {
		props.pressure = props.pressure || (props.buttons ? 0.5 : 0);
		var propsDesc = {};
		Object.keys(eventPropDesc).forEach(function (name) {
			if (name in e) {
				this[name] = {
					get: function () {
						return props[name] || eventPropDesc[name];
					}
				};
			} else {
				this[name] = {
					value: props[name] || eventPropDesc[name]
				};
			}
		}, propsDesc);
		Object.defineProperties(e, propsDesc);
		return e;
	}

	/**
	 * creates a synthetic click event with properties based on another event.
	 *
	 * @param sourceEvent the underlying event which contributes to the creation of this event.
	 * @param dblClick set to true to generate a dblclick event, otherwise a click event is generated
	 * @returns {Event} the event (click or dblclick)
	 */
	utils.createSyntheticClick = function (sourceEvent, dblClick) {
		var e = document.createEvent("MouseEvents");
		if (e.isTrusted === undefined) { // Android 4.1.1 does not implement isTrusted
			Object.defineProperty(e, "isTrusted", {
				value: false,
				enumerable: true,
				writable: false,
				configurable: false
			});
		}
		e.initMouseEvent(dblClick ? "dblclick" : "click", true, // bubbles
			true, // cancelable
			sourceEvent.view,
			dblClick ? 2 : 1,
			sourceEvent.screenX,
			sourceEvent.screenY,
			sourceEvent.clientX,
			sourceEvent.clientY,
			sourceEvent.ctrlKey,
			sourceEvent.altKey,
			sourceEvent.shiftKey,
			sourceEvent.metaKey, 0, // button property (touch: always 0)
			null); // no related target
		return e;
	};

	/**
	 * returns true for a native click event, false for a synthetic click event.
	 *
	 * @param e an event
	 * @returns true if native event, false for synthetic event.
	 */
	utils.isNativeClickEvent = function (e) {
		return (e.isTrusted === undefined || e.isTrusted);
	};

	/**
	 * returns the value of MouseEvent.buttons from MouseEvent.which.
	 *
	 * @param whichValue value of a MouseEvent.which property
	 * @returns Number the value MouseEvent.buttons should have
	 */
	utils.which2buttons = function (whichValue) {
		switch (whichValue) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 4;
		case 3:
			return 2;
		default:
			return Math.pow(2, (whichValue - 1));
		}
	};

	/**
	 * Registers the event handler eventListener on target element targetElement
	 * for events of type eventName.
	 *
	 * @param targetElement DOM element to attach the event listener
	 * @param eventName the event type name ("mousedown", "touchstart"...)
	 * @param eventListener an event listener function
	 * @param useCapture set to true to set the handler at the event capture phase
	 */
	utils.addEventListener = function (targetElement, eventName, eventListener, useCapture) {
		targetElement.addEventListener(eventName, eventListener, useCapture);
	};

	/**
	 * Unregister an existing handler.
	 *
	 * @param targetElement DOM element where the event listener is attached
	 * @param eventName  the event type name ("mousedown", "touchstart"...)
	 * @param eventListener the event listener function to remove
	 * @param useCapture set to true if the handler is set at the event capture phase
	 */
	utils.removeEventListener = function (targetElement, eventName, eventListener, useCapture) {
		targetElement.removeEventListener(eventName, eventListener, useCapture);
	};

	/**
	 * Dispatch an event.
	 *
	 * @param targetElement DOM element
	 * @param event event
	 */
		// possible optimization:
		// Chrome: use getEventListeners() to dispatch event ONLY if there is a listener for the target event type
		// other: hook HTMLElement.prototype.addEventListener to keep a record of active [element|event type]
	utils.dispatchEvent = function (targetElement, event) {
		if (!targetElement) {
			// handle case when  moving a pointer outside the window (elementFromTouch return null)
			return false;
		}
		if (!(targetElement.dispatchEvent)) {
			throw new Error("dispatchEvent not supported on targetElement");
		}
		return targetElement.dispatchEvent(event);
	};

	/**
	 * Dispatch pointerleave events.
	 *
	 * @param target DOM element
	 * @param relatedTarget DOM element
	 * @param syntheticEvent the pointerleave event to dispatch
	 */
	utils.dispatchLeaveEvents = function (target, relatedTarget, syntheticEvent) {
		if (target != null &&
			relatedTarget != null &&
			target !== relatedTarget && !(target.compareDocumentPosition(relatedTarget) & 16)) {
			return this.dispatchEvent(target, syntheticEvent) &&
				this.dispatchLeaveEvents(target.parentNode, relatedTarget, syntheticEvent);
		}
		return true;
	};

	/**
	 * Dispatch pointerenter events.
	 *
	 * @param target DOM element
	 * @param relatedTarget DOM element
	 * @param syntheticEvent the pointerenter event to dispatch
	 */
	utils.dispatchEnterEvents = function (target, relatedTarget, syntheticEvent) {
		if (target != null &&
			relatedTarget != null &&
			target !== relatedTarget && !(target.compareDocumentPosition(relatedTarget) & 16)) {
			return this.dispatchEnterEvents(target.parentNode, relatedTarget, syntheticEvent) &&
				this.dispatchEvent(target, syntheticEvent);
		}
		return true;
	};

	/**
	 * @param e event
	 * @param nativeEvent underlying event which contributes to this pointer event.
	 */
	function mapNativeFunctions(e, nativeEvent) {
		if (e.type === utils.GOTCAPTURE || e.type === utils.LOSTCAPTURE) {
			return; //no default action on pointercapture events
		}
		if (e.bubbles) {
			var _stopPropagation = e.stopPropagation;
			e.stopPropagation = function () {
				nativeEvent.stopPropagation();
				_stopPropagation.apply(this);
			};
			if (e.stopImmediatePropagation) {
				var _stopImmediatePropagation = e.stopImmediatePropagation;
				e.stopImmediatePropagation = function () {
					nativeEvent.stopImmediatePropagation();
					_stopImmediatePropagation.apply(this);
				};
			}
		}
		if (eventTypeDesc[e.type].cancelable) {
			var _preventDefault = e.preventDefault;
			e.preventDefault = function () {
				nativeEvent.preventDefault();
				_preventDefault.apply(this);
			};
		}
	}

	return utils;
});
define('dpointer/handlers/touchTracker',[
	"./utils"
], function (utils) {
	"use strict";

	var TouchInfo = function (touchAction, pageX, pageY) {
		this.touchAction = touchAction;
		this.lastNativeEvent = null; // undefined
		this.lastTouch = null; // undefined
		this.capturedTarget = null; // undefined, rename capturedTarget
		this.lastTargetElement = null;
		this.firstMove = {
			startX: pageX,
			startY: pageY
		};
		this.enforceTouchAction = (touchAction === utils.TouchAction.AUTO);
	};

	// touchId of the primary pointer, or -1 if no primary pointer set.
	var primaryTouchId = -1,
		t = {},
		canScroll = function (a1, b1, a2, b2) {
			return Math.abs(a2 - a1) / Math.abs(b2 - b1) > 0.7;
		};

	return {

		register: function (touchId, touchAction, touch) {
			// the first touch to register becomes the primary pointer
			if (primaryTouchId === -1) {
				primaryTouchId = touchId;
			}
			t[touchId] = new TouchInfo(touchAction, touch.pageX, touch.pageY);
		},

		unregister: function (touchId) {
			if (primaryTouchId === touchId) {
				primaryTouchId = -1;
			}
			return (delete t[touchId]);
		},

		update: function (touch, touchEvent, targetElement) {
			t[touch.identifier].lastTouch = touch;
			t[touch.identifier].lastNativeEvent = touchEvent;
			t[touch.identifier].lastTargetElement = targetElement;
		},

		isActive: function (touchId) {
			return (touchId in t);
		},

		isPrimary: function (touchId) {
			return (touchId === primaryTouchId);
		},

		getTouchAction: function (touchId) {
			return t[touchId].touchAction;
		},

		updateScroll: function (touch) {
			if (t[touch.identifier].firstMove) {
				var touchInfo = t[touch.identifier];
				if (touchInfo.touchAction === utils.TouchAction.PAN_Y) {
					touchInfo.enforceTouchAction =
						canScroll(touchInfo.firstMove.startY, touchInfo.firstMove.startX, touch.pageY, touch.pageX);
				} else {
					if (touchInfo.touchAction === utils.TouchAction.PAN_X) {
						touchInfo.enforceTouchAction =
							canScroll(touchInfo.firstMove.startX, touchInfo.firstMove.startY, touch.pageX, touch.pageY);
					}
				}
				touchInfo.firstMove = false;
			}
		},


		isTouchActionEnforced: function (touchId) {
			return t[touchId].enforceTouchAction;
		},

		getLastTouch: function (touchId) {
			return t[touchId].lastTouch;
		},

		getTargetElement: function (touchId) {
			return t[touchId].lastTargetElement;
		},

		getTouchEvent: function (touchId) {
			return t[touchId].lastNativeEvent;
		},

		hasPrimary: function () {
			return (primaryTouchId !== -1);
		},

		getPrimaryTouchEvent: function () {
			return t[primaryTouchId].lastNativeEvent;
		},

		getPrimaryTouch: function () {
			return t[primaryTouchId].lastTouch;
		},

		// touch target depends whether capture has been set on the pointer
		identifyTouchTarget: function (touchId, nonCapturedElement) {
			return (t[touchId] && t[touchId].capturedTarget) || nonCapturedElement;
		},

		identifyPrimaryTouchTarget: function (nonCapturedElement) {
			return this.identifyTouchTarget(primaryTouchId, nonCapturedElement);
		},

		hasCapture: function (touchId) {
			return !!(t[touchId].capturedTarget);
		},

		setCapture: function (touchId, targetElement) {
			// 1. check if pointer is active, otw throw DOMException with the name InvalidPointerId.
			if (!this.isActive(touchId)) {
				throw new Error("InvalidPointerId");
			}
			// todo: 2. pointer must have active buttons, otherwise return
			// 3. register capture on this element.
			t[touchId].capturedTarget = targetElement;
		},

		releaseCapture: function (touchId, targetElement) {
			// 1. check if pointerId is active, otw throw DOMException with the name InvalidPointerId.
			if (!this.isActive(touchId)) {
				throw new Error("InvalidPointerId");
			}
			if (targetElement && targetElement !== t[touchId].capturedTarget) {
				// explicit release but capture element doesn't match
				return false;
			}
			if (t[touchId].capturedTarget) {
				t[touchId].capturedTarget = null;
				return true;
			} else {
				return false;
			}
		}
	};
});
/**
 * this module listen to touch events and generates corresponding pointer events.
 *
 * http://www.w3.org/TR/touch-events/#list-of-touchevent-types
 * todo: pointerenter/pointerleave: generate on capture when target is the originated element.
 */
define('dpointer/handlers/touch',[
	"./features",
	"./touchTracker",
	"./utils"
], function (has, tracker, utils) {
	"use strict";

	var TouchEvents = {
			touchstart: "touchstart",
			touchmove: "touchmove",
			touchend: "touchend",
			touchcancel: "touchcancel"
		},
		DoubleTap = { // allow to track click and determine if a double click/tap event can be fired.
			TAP_DELAY: 250, // maximum delay between 2 clicks in ms, after this delay a dblclick won't be generated
			lastClickTS: 0, // timestamp of the last click
			hasFirstClick: false, // are we waiting for a second click?
			targetElement: null, // element which received the click
			isEligible: function (target) {
				return this.hasFirstClick && (this.targetElement === target) &&
					((new Date().getTime()) - this.lastClickTS < this.TAP_DELAY);
			}
		};

	/**
	 * touchstart event handler.
	 *
	 * @param e touch event
	 */
	function touchstart(e) {
		var touch, touchTarget, touchAction;
		for (var l = e.changedTouches.length, i = 0; i < l; i++) {
			touch = e.changedTouches.item(i);
			touchTarget = null;
			touchAction = determineTouchActionFromAttr(touch.target);
			// before doing anything, we check if there is already an active primary pointer:
			// if default touch action!=auto on the target element, the touch action must be
			// handled by the user agent. The current event is related to a new pointer which contributes to a
			// multi touch gesture: we must absorb this event and cancel the primary pointer to let the user agent
			// handle the default action.
			if (tracker.hasPrimary() && (touchAction === utils.TouchAction.AUTO)) {
				// fire pointerout > pointercancel for current primary pointer
				var lastNativeEvent = tracker.getPrimaryTouchEvent();
				var lastTouch = tracker.getPrimaryTouch();
				touchTarget = tracker.identifyPrimaryTouchTarget(lastTouch.target);
				utils.dispatchEvent(touchTarget, createPointer(utils.events.OUT, lastNativeEvent, lastTouch, {}));
				utils.dispatchEvent(touchTarget, createPointer(utils.events.CANCEL, lastNativeEvent, lastTouch, {}));
				releaseCapture(lastTouch.identifier); //implicit release
				// cancel the primary pointer to avoid duplicate generation of PointerOut > PointerCancel
				tracker.unregister(lastTouch.identifier);
			} else {
				if (touchAction !== utils.TouchAction.AUTO) {
					if (DoubleTap.isEligible(touch.target)) {
						e.preventDefault(); // prevent zoom on double tap
					}
				}
				// primary touch pointer must be defined in case an event handler on pointerdown decides
				// to set a pointer capture on the element, so we must:
				// - register the pointer *before* firing the events.
				// - update the tracker *before* firing the events.
				tracker.register(touch.identifier, touchAction, touch);
				tracker.update(touch, e, touch.target);
				// fire pointerover > pointerdown
				utils.dispatchEvent(touch.target, createPointer(utils.events.OVER, e, touch, {}));
				utils.dispatchEvent(touch.target, createPointer(utils.events.DOWN, e, touch, {}));
			}
		}
	}

	/**
	 * touchmove event handler.
	 *
	 * @param e touch event
	 */
	function touchmove(e) {
		var touch;
		for (var l = e.changedTouches.length, i = 0; i < l; i++) {
			touch = e.changedTouches.item(i);
			if (!tracker.isActive(touch.identifier)) {
				return;
			}
			tracker.updateScroll(touch);
			// browser default actions
			if (tracker.isTouchActionEnforced(touch.identifier)) {
				var lastNativeEventType = tracker.getTouchEvent(touch.identifier).type;
				switch (lastNativeEventType) {
				case TouchEvents.touchstart:
					// (1) fire PointerOut > PointerCancel
					utils.dispatchEvent(touch.target, createPointer(utils.events.OUT, e, touch, {}));
					utils.dispatchEvent(touch.target, createPointer(utils.events.CANCEL, e, touch, {}));
					break;
				case TouchEvents.touchmove:
					// (2) do not fire synthetic event: absorb the touchmove.
					break;
				default:
					// events flow already ended (previous touchmove already removed pointer from tracker to
					// prevent PointerEvent to be fired)
				}
				releaseCapture(touch.identifier); //implicit release
				tracker.unregister(touch.identifier);
			} else { // always map PointerMove when touch action is set (none/pan-x/pan-y)
				var touchTarget = tracker.identifyTouchTarget(touch.identifier, elementFromTouch(touch));
				var lastElementFromPoint = tracker.getTargetElement(touch.identifier);
				// check if the pointer is moving out from the current target element
				if (touchTarget !== lastElementFromPoint) {
					// expected sequence of events:
					// PointerOut (on previous elt) > PointerMove (on current elt) >  PointerOver (on current elt)
					utils.dispatchEvent(lastElementFromPoint,
						createPointer(utils.events.OUT, e, touch, {relatedTarget: touchTarget}));
					// generate pointerleave event(s)
					utils.dispatchLeaveEvents(lastElementFromPoint, touchTarget,
						createPointer(utils.events.LEAVE, e, touch, {relatedTarget: touchTarget}));
					// generate pointermove
					utils.dispatchEvent(touchTarget, createPointer(utils.events.MOVE, e, touch, {}));
					// generate pointerover
					utils.dispatchEvent(touchTarget,
						createPointer(utils.events.OVER, e, touch, {relatedTarget: lastElementFromPoint}));
					// generate pointerenter event(s)
					utils.dispatchEnterEvents(touchTarget, lastElementFromPoint,
						createPointer(utils.events.ENTER, e, touch,
							{relatedTarget: lastElementFromPoint}));
				} else {
					utils.dispatchEvent(touchTarget, createPointer(utils.events.MOVE, e, touch, {}));
				}
				tracker.update(touch, e, touchTarget);
				// touch default actions must be prevented.
				// Let user agent handle it if it supports the touch-action CSS property.
				if (!has("css-touch-action")) {
					e.preventDefault();
				}
			}
		}
	}

	/**
	 * touchend event handler.
	 *
	 * @param e touch event
	 */
	function touchend(e) {
		var touch;
		for (var l = e.changedTouches.length, i = 0; i < l; i++) {
			touch = e.changedTouches.item(i);
			if (!tracker.isActive(touch.identifier)) {
				return;
			}
			var lastNativeEventType = tracker.getTouchEvent(touch.identifier).type;
			// elementFromPoint may return null on android when user makes a pinch 2 zoom gesture
			// in that case we use the current touch.target.
			var elementFromPoint = elementFromTouch(touch) || touch.target;
			var touchTarget = tracker.identifyTouchTarget(touch.identifier, elementFromPoint);
			if (tracker.isTouchActionEnforced(touch.identifier)) {
				// default action handled by user agent
				switch (lastNativeEventType) {
				case TouchEvents.touchmove:
					// (3) do not generate pointer event
					break;
				case TouchEvents.touchstart:
					// (5) fire pointermove > pointerup > pointerOut
					utils.dispatchEvent(touchTarget, createPointer(utils.events.MOVE, e, touch, {}));
					utils.dispatchEvent(touchTarget, createPointer(utils.events.UP, e, touch, {}));
					utils.dispatchEvent(touchTarget, createPointer(utils.events.OUT, e, touch, {}));
					break;
				default:
					// unexpected behavior:
					// touchend event with touch action=auto and lastNativeEventType=[" + lastNativeEventType + "]");
				}
			} else {
				switch (lastNativeEventType) {
				case TouchEvents.touchstart:
					// (6) fire pointermove > pointerup > fast click > pointerout
					utils.dispatchEvent(touchTarget, createPointer(utils.events.MOVE, e, touch, {}));
					utils.dispatchEvent(touchTarget, createPointer(utils.events.UP, e, touch, {}));
					e.preventDefault();
					fireSyntheticClick(touchTarget, touch);
					utils.dispatchEvent(touchTarget, createPointer(utils.events.OUT, e, touch, {}));
					break;
				case TouchEvents.touchmove:
					// (4) fire pointerup > fast click > pointerout
					utils.dispatchEvent(touchTarget, createPointer(utils.events.UP, e, touch, {}));
					// fire synthetic click only if pointer is released on the origin element
					// (touch.target is the target element from the touchstart)
					if (elementFromPoint === touch.target) {
						e.preventDefault();
						fireSyntheticClick(touchTarget, touch);
					}
					utils.dispatchEvent(touchTarget, createPointer(utils.events.OUT, e, touch, {}));
					break;
				default:
					// unexpected behavior:
					// "touchend event with touch action!=auto and lastNativeEventType=[" + lastNativeEventType + "]"
				}
			}
			releaseCapture(touch.identifier); // implicit release
			tracker.unregister(touch.identifier);
		}
	}

	/**
	 * touchcancel event handler.
	 *
	 * @param e touch event
	 */
	function touchcancel(e) {
		var touch;
		for (var l = e.changedTouches.length, i = 0; i < l; i++) {
			touch = e.changedTouches.item(i);
			if (!tracker.isActive(touch.identifier)) {
				return;
			}
			utils.dispatchEvent(tracker.identifyTouchTarget(touch.identifier, elementFromTouch(touch)),
				createPointer(utils.events.CANCEL, e, touch, {}));
			releaseCapture(touch.identifier); // implicit release
			tracker.unregister(touch.identifier);
		}
	}

	/**
	 * create a synthetic Pointer event based on a touch event.
	 *
	 * @param pointerType pointer event type name ("pointerdown", "pointerup"...)
	 * @param touchEvent the underlying touch event which contributes to the creation of the pointer event.
	 * @param touch the underlying touch element which contributes to the creation of the pointer event.
	 * @param props event properties (optional)
	 * @returns {utils.Pointer}
	 */
	function createPointer(pointerType, touchEvent, touch, props) {
		props = props || {};
		// Mouse Event properties
		props.screenX = touch.screenX;
		props.screenY = touch.screenY;
		props.clientX = touch.clientX;
		props.clientY = touch.clientY;
		props.ctrlKey = touchEvent.ctrlKey;
		props.altKey = touchEvent.altKey;
		props.shiftKey = touchEvent.shiftKey;
		props.metaKey = touchEvent.metaKey;
		props.pageX = touch.pageX;
		props.pageY = touch.pageY;
		if (tracker.hasCapture(touch.identifier)) {  // W3C spec §10.1
			props.relatedTarget = null;
		}
		// normalize button/buttons values
		// http://www.w3.org/TR/pointerevents/#chorded-button-interactions
		props.button = (pointerType === utils.events.MOVE) ? -1 : 0;
		props.buttons = 1;
		props.which = props.button + 1;
		// Pointer Events properties
		props.pointerId = touch.identifier + 2; // avoid id collision: 1 is reserved for mouse events mapping
		props.pointerType = "touch";
		props.isPrimary = tracker.isPrimary(touch.identifier);
		return new utils.Pointer(pointerType, touchEvent, props);
	}

	/**
	 * Create and dispatch synthetic events click and dblclick (if eligible).
	 *
	 * @param target
	 * @param touch
	 */
	function fireSyntheticClick(target, touch) {
		// IE10 always generates a click for every pointer when there is multiple touches
		// todo: investigate how IE11 handles clicks when there is multiple touches
		if (tracker.isPrimary(touch.identifier)) {
			// here we choose to fire click/dblclick only for primary pointer
			utils.dispatchEvent(target, utils.createSyntheticClick(touch));
			// dispatch double tap if eligible
			if (DoubleTap.isEligible(target)) {
				utils.dispatchEvent(target, utils.createSyntheticClick(touch, true));
				DoubleTap.hasFirstClick = false;
			} else {
				// remember first click
				DoubleTap.hasFirstClick = true;
				DoubleTap.lastClickTS = (new Date().getTime());
				DoubleTap.targetElement = target;
			}
		}
	}

	/**
	 * returns the deeply nested dom element at window coordinates from a touch element.
	 *
	 * @param touch the touch element
	 * @return HTMLElement the DOM element.
	 */
	function elementFromTouch(touch) {
		return touch.target.ownerDocument.elementFromPoint(touch.clientX, touch.clientY);
	}

	function releaseCapture(touchId, targetElement) {
		if (tracker.releaseCapture(touchId, targetElement)) {
			// 4. Fire a lostpointercapture event at the targetElement
			utils.dispatchEvent(
				tracker.getLastTouch(touchId).target,
				createPointer(utils.events.LOSTCAPTURE,
					tracker.getTouchEvent(touchId),
					tracker.getLastTouch(touchId), {}
				)
			);
			return true;
		}
		return false;
	}

	/**
	 * With touch events there is no CSS property touch-action: Touch action
	 * is specified by the value of the HTML attribute touch-action.
	 * This function returns the touch action which applies to the element, based on "touch action"
	 * from its ancestors.
	 * To be used only when underlying native events are touch events.
	 *
	 * @param targetNode DOM element
	 * @return Number touch action value which applies to the element (auto: 0, pan-x:1, pan-y:2, none: 3)
	 */
	function determineTouchActionFromAttr(targetNode) {
		// touch-action default value: allow default behavior (no prevent default on touch).
		var nodeValue = utils.TouchAction.AUTO;
		// find ancestors with "touch action" and define behavior accordingly.
		do {
			switch (targetNode.getAttribute && targetNode.getAttribute(utils.TouchAction.ATTR_NAME)) {
			case "auto":
				nodeValue = nodeValue | utils.TouchAction.AUTO;
				break;
			case "pan-x":
				nodeValue = nodeValue | utils.TouchAction.PAN_X;
				break;
			case "pan-y":
				nodeValue = nodeValue | utils.TouchAction.PAN_Y;
				break;
			case "none":
				nodeValue = nodeValue | utils.TouchAction.NONE;
				break;
			}
		} while ((nodeValue !== utils.TouchAction.NONE) && (targetNode = targetNode.parentNode));
		return nodeValue;
	}

	return {
		/**
		 * register touch events handlers.
		 *
		 * @param targetElement target element for touch event listeners
		 */
		registerHandlers: function (targetElement) {
			targetElement = targetElement || window.document;
			utils.addEventListener(targetElement, TouchEvents.touchstart, touchstart, true);
			utils.addEventListener(targetElement, TouchEvents.touchmove, touchmove, true);
			utils.addEventListener(targetElement, TouchEvents.touchend, touchend, true);
			utils.addEventListener(targetElement, TouchEvents.touchcancel, touchcancel, true);
		},

		/**
		 * deregister touch events handlers.
		 *
		 * @param targetElement target element for touch  event listeners
		 */
		deregisterHandlers: function (targetElement) {
			utils.removeEventListener(targetElement, TouchEvents.touchstart, touchstart, true);
			utils.removeEventListener(targetElement, TouchEvents.touchmove, touchmove, true);
			utils.removeEventListener(targetElement, TouchEvents.touchend, touchend, true);
			utils.removeEventListener(targetElement, TouchEvents.touchcancel, touchcancel, true);
		},

		/**
		 * Set Pointer capture.
		 *
		 * @param targetElement DOM element to be captured by the pointer
		 * @param pointerId Id of the capturing Pointer
		 */
		setPointerCapture: function (targetElement, pointerId) {
			var touchId = pointerId - 2;
			tracker.setCapture(touchId, targetElement);
			// 4. Fire a gotpointercapture event at the targetElement
			utils.dispatchEvent(
				tracker.getLastTouch(touchId).target,
				createPointer(utils.events.GOTCAPTURE,
					tracker.getTouchEvent(touchId),
					tracker.getLastTouch(touchId), {}
				)
			);
			return true;
		},

		/**
		 * Release Pointer capture.
		 *
		 * @param targetElement DOM element to be captured by the pointer
		 * @param pointerId Id of the capturing Pointer
		 */
		releasePointerCapture: function (targetElement, pointerId) {
			return releaseCapture(pointerId - 2, targetElement);
		},

		/**
		 * @param targetNode DOM element
		 * @return Number touch action value which applies to the element (auto: 0, pan-x:1, pan-y:2, none: 3)
		 */
		determineTouchAction: function (targetNode) {
			return determineTouchActionFromAttr(targetNode);
		}
	};
});
/**
 * This module listens to mouse events and generates corresponding pointer events.
 *
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevent-event-order
 */
define('dpointer/handlers/mouse',[
	"./utils"
], function (utils) {
	"use strict";

	var MouseEvents = {
			mousedown: "mousedown",
			mousemove: "mousemove",
			mouseout: "mouseout",
			mouseover: "mouseover",
			mouseup: "mouseup"
		},
		isScrolling = false; // indicates if the mouse is scrolling an element with CSS overflow=auto|scroll.

	/**
	 * mousedown event handler.
	 *
	 * @param e mouse event
	 */
	function mousedown(e) {
		MouseTracker.update(e);
		utils.dispatchEvent(e.target, createPointer(utils.events.DOWN, e, {}));
		// Firefox continues to send mouse event while dragging the scrollbar:
		// if overflow CSS style is set at target element, fire a PointerCancel,
		// then track and absorb subsequent mouse events until a mouseup occurs
		var overflow = (window.getComputedStyle(e.target).overflow);
		if (overflow && (overflow === "auto" || overflow === "scroll")) {
			isScrolling = true;
			utils.dispatchEvent(e.target, createPointer(utils.events.CANCEL, e, {}));
		}
	}

	/**
	 * mousemove event handler.
	 *
	 * @param e mouse event
	 */
	function mousemove(e) {
		if (isScrolling) {
			return;
		}
		utils.dispatchEvent(MouseTracker.identifyTarget(e.target), createPointer(utils.events.MOVE, e, {}));
		MouseTracker.update(e);
	}

	/**
	 * mouseout event handler.
	 *
	 * @param e mouse event
	 */
	function mouseout(e) {
		if (isScrolling || MouseTracker.hasCapture()) {
			return;
		}
		if (e.relatedTarget) {
			utils.dispatchEvent(e.target, createPointer(utils.events.OUT, e, {}));
			// generate pointerleave events
			utils.dispatchLeaveEvents(e.target, e.relatedTarget,
				createPointer(utils.events.LEAVE, e));
		}
		MouseTracker.update(e);
	}

	/**
	 * mouseover event handler.
	 *
	 * @param e mouse event
	 */
	function mouseover(e) {
		if (isScrolling || MouseTracker.hasCapture()) {
			return;
		}
		if (e.relatedTarget) {
			utils.dispatchEvent(e.target, createPointer(utils.events.OVER, e, {}));
			// generate pointerenter events
			utils.dispatchEnterEvents(e.target, e.relatedTarget,
				createPointer(utils.events.ENTER, e));
		}
		MouseTracker.update(e);
	}

	/**
	 * mouseup event handler.
	 *
	 * @param e mouse event
	 */
	function mouseup(e) {
		if (isScrolling) {
			isScrolling = false;
		} else {
			utils.dispatchEvent(MouseTracker.identifyTarget(e.target), createPointer(utils.events.UP, e, {}));
			MouseTracker.implicitReleaseCapture();
			MouseTracker.update(e);
		}
	}

	/**
	 * Create a synthetic pointer from a mouse event.
	 *
	 * @param pointerType pointer event type name ("pointerdown", "pointerup"...)
	 * @param mouseEvent the underlying mouse event which contributes to the creation of the pointer event.
	 * @param props event properties (optional)
	 * @returns {utils.Pointer}
	 */
	function createPointer(pointerType, mouseEvent, props) {
		props = props || {};
		// Mouse Events properties
		props.screenX = mouseEvent.screenX;
		props.screenY = mouseEvent.screenY;
		props.clientX = mouseEvent.clientX;
		props.clientY = mouseEvent.clientY;
		props.ctrlKey = mouseEvent.ctrlKey;
		props.altKey = mouseEvent.altKey;
		props.shiftKey = mouseEvent.shiftKey;
		props.metaKey = mouseEvent.metaKey;
		props.pageX = mouseEvent.pageX;
		props.pageY = mouseEvent.pageY;
		// normalize button/buttons values
		// http://www.w3.org/TR/pointerevents/#chorded-button-interactions
		var buttonValue = mouseEvent.button,
			buttonsValue = (mouseEvent.buttons !== undefined) ? mouseEvent.buttons :
				utils.which2buttons(mouseEvent.which);

		if (mouseEvent.type === "mousemove") {
			buttonValue = -1;
		}
		props.button = buttonValue;
		props.buttons = buttonsValue;
		props.which = buttonValue + 1;
		if (MouseTracker.hasCapture()) {  // Pointer events Spec §10.1: related target must be null on pointer capture
			props.relatedTarget = null;
		} else {
			props.relatedTarget = mouseEvent.relatedTarget;
		}
		// Pointer Events properties
		props.pointerId = 1;
		props.pointerType = "mouse";
		props.isPrimary = true;
		return new utils.Pointer(pointerType, mouseEvent, props);
	}

	var MouseTracker = {
		_lastNativeEvent: null,
		_captureTarget: null,
		register: function () {
		},
		update: function (mouseEvent) {
			this._lastNativeEvent = mouseEvent;
		},
		setCapture: function (targetElement) {
			// 1. check if pointerId is active, otw throw DOMException with the name InvalidPointerId.
			if (!this._lastNativeEvent) {
				throw "InvalidPointerId";
			}
			// 2. at least one button must be pressed
			if (this._lastNativeEvent.buttons === 0) {
				return false;
			}
			// 3. set PointerCapture=true
			this._captureTarget = targetElement;
			// 4. Fire a gotpointercapture event at the targetElement
			utils.dispatchEvent(this._lastNativeEvent.target,
				createPointer(utils.events.GOTCAPTURE, this._lastNativeEvent, {}));
			return true;
		},
		hasCapture: function () {
			return !!(this._captureTarget);
		},
		identifyTarget: function (nonCapturedElement) {
			return (this._captureTarget) || nonCapturedElement;
		},
		releaseCapture: function (targetElement, implicit) {
			// 1. check if pointerId is active, otw throw DOMException with the name InvalidPointerId.
			if (!this._lastNativeEvent) {
				throw "InvalidPointerId";
			}
			// 2. if pointer capture not set at targetElement, return
			if (!implicit && (this._captureTarget !== targetElement)) {
				return false;
			}
			// 3. release capture
			if (this._captureTarget) {
				// 4. Fire a lostpointercapture event at the targetElement
				utils.dispatchEvent(this._captureTarget,
					createPointer(utils.events.LOSTCAPTURE, this._lastNativeEvent, {}));
				this._captureTarget = null;
			}
			return true;
		},
		implicitReleaseCapture: function () {
			return this.releaseCapture(null, true);
		}
	};

	return {
		/**
		 * register mouse events handlers.
		 *
		 * @param targetElement target element for mouse event listeners
		 */
		registerHandlers: function (targetElement) {
			targetElement = targetElement || window.document;
			utils.addEventListener(targetElement, MouseEvents.mousedown, mousedown, true);
			utils.addEventListener(targetElement, MouseEvents.mousemove, mousemove, true);
			utils.addEventListener(targetElement, MouseEvents.mouseout, mouseout, true);
			utils.addEventListener(targetElement, MouseEvents.mouseover, mouseover, true);
			utils.addEventListener(targetElement, MouseEvents.mouseup, mouseup, true);
		},

		/**
		 * deregister mouse events handlers.
		 * @param targetElement target element for mouse event listeners
		 */
		deregisterHandlers: function (targetElement) {
			utils.removeEventListener(targetElement, MouseEvents.mousedown, mousedown, true);
			utils.removeEventListener(targetElement, MouseEvents.mousemove, mousemove, true);
			utils.removeEventListener(targetElement, MouseEvents.mouseout, mouseout, true);
			utils.removeEventListener(targetElement, MouseEvents.mouseover, mouseover, true);
			utils.removeEventListener(targetElement, MouseEvents.mouseup, mouseup, true);
		},

		/**
		 * set pointer capture.
		 *
		 * @param targetElement DOM element to be captured by the pointer
		 * @returns true if pointer is captured.
		 */
		setPointerCapture: function (targetElement) {
			return MouseTracker.setCapture(targetElement);
		},

		/**
		 * release pointer capture.
		 *
		 * @param targetElement DOM element to be captured by the pointer
		 * @returns true is pointer is released.
		 */
		releasePointerCapture: function (targetElement) {
			return MouseTracker.releaseCapture(targetElement, false);
		}
	};
});

/**
 * Pointer Events shim
 */
define('dpointer/events',[
	"./handlers/features",
	"./handlers/utils",
	"./handlers/touch",
	"./handlers/mouse",
	"./handlers/features!mspointer-events?./handlers/mspointer"
], function (has, utils, touch, mouse, mspointer) {
	"use strict";

	var pointerEvents = {_targetElement: null};

	/**
	 * Enable Pointer events. Register native event handlers. Importing this module automatically register native
	 * event handlers on window.document, unless you specify a target element.
	 *
	 * @param targetElement DOM element on which to attach handlers.
	 * @default window.document
	 */
	pointerEvents.enable = function (targetElement) {
		targetElement = targetElement || window.document;
		if (this._targetElement) {
			return;// already initialized
		}
		if (!has("pointer-events")) {
			if (has("mspointer-events")) {
				mspointer.registerHandlers(targetElement);
			} else {
				if (has("touch-events") && has("touch-device")) {
					touch.registerHandlers(targetElement);
				} else {
					mouse.registerHandlers(targetElement);
				}
			}
		}
		this._targetElement = targetElement;
	};

	/**
	 * Disable Pointer events. Unregister native event handlers.
	 */
	pointerEvents.disable = function () {
		if (this._targetElement) {
			touch.deregisterHandlers(this._targetElement);
			mouse.deregisterHandlers(this._targetElement);
			mspointer && mspointer.deregisterHandlers(this._targetElement);
		}
		this._targetElement = null;
	};

	/**
	 * Set the attribute touch-action on the target element.
	 * Supported touch-actions are "auto" (user agent handles touch actions
	 * default behaviors), "none" (disable user agent default behavior), pan-x and pan-y.
	 *
	 * @param targetElement a DOM element
	 * @param actionType touch action type: "auto", "none", "pan-x" or "pan-y"
	 */
	pointerEvents.setTouchAction = function (targetElement, actionType) {
		targetElement.setAttribute(utils.TouchAction.ATTR_NAME, actionType);
	};

	/**
	 * Set pointer capture on a DOM element.
	 *
	 * @param targetElement DOM element
	 * @param pointerId Pointer ID
	 */
	pointerEvents.setPointerCapture = function (targetElement, pointerId) {
		// todo: Internet Explorer automatically set pointer capture on form controls when touch-action is none
		// todo: manage a list of element type to apply pointer capture automatically when touch-action=none is set??
		if (!this._targetElement) {
			return false;// not initialized
		}
		if (has("pointer-events")) {
			return targetElement.setPointerCapture(pointerId);// use native Pointer Events method
		} else {
			if (has("mspointer-events")) {
				return targetElement.msSetPointerCapture(pointerId);// use native Pointer Events method
			} else {
				if (pointerId === 1) { // mouse always gets ID = 1
					return mouse.setPointerCapture(targetElement);
				} else {
					return touch.setPointerCapture(targetElement, pointerId);
				}
			}
		}
	};

	/**
	 * Unset pointer capture on a DOM element.
	 *
	 * @param targetElement DOM element
	 * @param pointerId Pointer ID
	 */
	pointerEvents.releasePointerCapture = function (targetElement, pointerId) {
		if (!this._targetElement) {
			return false;
		}
		if (has("pointer-events")) {
			return targetElement.releasePointerCapture(pointerId);
		} else {
			if (has("mspointer-events")) {
				return targetElement.msReleasePointerCapture(pointerId);
			} else {
				if (pointerId === 1) {
					return mouse.releasePointerCapture(targetElement);
				} else {
					return touch.releasePointerCapture(targetElement, pointerId);
				}
			}
		}
	};

	/**
	 * CSS rule to define touch-action or -ms-touch-action when touch-action attribute is set on Elements.
	 *
	 * @param styleName should be touch-action or -ms-touch-action
	 */
	function insertTouchActionCSSRule(styleName) {
		var styleElement = document.createElement("style"),
			attributeName = utils.TouchAction.ATTR_NAME;
		styleElement.textContent = "[" + attributeName + "='none']  { " + styleName + ": none; }" +
			"[" + attributeName + "='auto']  { " + styleName + ": auto; }" +
			"[" + attributeName + "='pan-x'] { " + styleName + ": pan-x; }" +
			"[" + attributeName + "='pan-y'] { " + styleName + ": pan-y; }" +
			"[" + attributeName + "='pan-x pan-y'],[" + styleName + "='pan-y pan-x'] " +
			"{ " + styleName + ": pan-x pan-y; }";
		document.head.insertBefore(styleElement, document.head.firstChild);
	}

	// CSS rule when user agent implements W3C Pointer Events or when a polyfill is in place.
	if (has("pointer-events")) {
		insertTouchActionCSSRule("touch-action");
	}

		// CSS rule for IE10 and IE11 preview
	if (has("mspointer-events")) {
		insertTouchActionCSSRule("-ms-touch-action");
	}
	// CSS rule to map CSS attribute in case user agent has native support for touch-action or -ms-touch-action
	// CSS property.
	if (has("css-touch-action")) {
		insertTouchActionCSSRule("touch-action");
	} else {
		// CSS rule for IE10 and IE11 preview
		if (has("css-ms-touch-action")) {
			insertTouchActionCSSRule("-ms-touch-action");
		}
	}

	// start listening to native events
	pointerEvents.enable();

	return pointerEvents;
});
define('../xibm/dpointer/main.js',[
    'dpointer/events',
    'dpointer/handlers/features',
    'dpointer/handlers/mouse',
    'dpointer/handlers/touch',
    'dpointer/handlers/touchTracker',
    'dpointer/handlers/utils'
], function () {
});
