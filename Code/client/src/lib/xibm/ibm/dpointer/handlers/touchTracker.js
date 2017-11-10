define([
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