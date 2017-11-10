/**
 * this module listen to touch events and generates corresponding pointer events.
 *
 * http://www.w3.org/TR/touch-events/#list-of-touchevent-types
 * todo: pointerenter/pointerleave: generate on capture when target is the originated element.
 */
define([
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