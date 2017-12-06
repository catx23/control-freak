/** @module delite/_Stated */
define([
	"dcl/dcl",
	"requirejs-dplugins/has",
	"xide/utils/CSSUtils",
	"xide/lodash",
	'xide/utils'
], function (dcl, has, utils, _, xutils) {
	const toArray = (stateName) => {
		return xutils.replaceAll(' ', '', stateName).split(',');
	}
	return dcl(null, {
		state: '',
		/**
		 * Returns all direct children of this widget, i.e. all widgets or DOM nodes underneath
		 * `this.containerNode`.  Note that it does not return all
		 * descendants, but rather just direct children.
		 *
		 * The result intentionally excludes element outside off `this.containerNode`.  So, it is different than
		 * accessing the `children` or `childNode` properties.
		 *
		 * @returns {Element[]}
		 */
		_getChildren: function () {
			// use Array.prototype.slice to transform the live HTMLCollection into an Array
			return Array.prototype.slice.call(this.children);
		},
		_states: null,
		setState: function (stateName) {
			//can be integer or anything non string
			var state = _.find(this.getStates(), {
				name: stateName
			});
			state && state.applyTo(this, stateName);
		},
		getState: function (_stateName) {
			//can be integer or anything non string
			var stateName = "" + _stateName;
			const found = _.find(this.getStates(), {
				name: stateName
			});
			return found;
		},
		attachedCallback: function () {
			/*
			console.log('attached ' + has('ide'));
			if(!has('ide')){
				var style = $(this).attr('style');
				var background = utils.getBackgroundUrl(style);
				console.log('style : '+background,this);
			}
			*/
		},
		addState: function (state) {
			if (!this._states) {
				this._states = [];
			}

			if (this._states.indexOf(state) == -1) {
				this._states.push(state);
			}
		},
		removeState: function (state) {
			if (!this._states) {
				this._states = [];
			}

			if (this._states.indexOf(state) == -1) {
				this._states.splice(this._states.indexOf(state), 1);
			}
			// @TODO: weird, still there
			const found = _.find(this.getStates(), {
				id: state.id
			});
			if (found) {
				this._states.splice(this._states.indexOf(found), 1);
			}
		},
		isActive: function (name) {
			const allStates = this.getStates();
			const enabled = toArray(this.state)
			return enabled.includes(name);
		},
		getActiveStates: function () {
			const allStates = this.getStates();
			const enabled = toArray(this.state)
			return allStates.filter((state) => {
				return enabled.includes(state.name);
			});
		},
		disableState: function (state) {
			let enabled = toArray(this.state)
			enabled = enabled.filter((stateName) => {
				return state.name !== stateName
			});
			return enabled.join(',');
		},
		enableState: function (state) {
			let enabled = toArray(this.state);
			if (!this.isActive(state.name)) {
				enabled.push(state.name);
			}
			return enabled.join(',');
		},
		stateReady: function (state) {
			this.addState(state);
			if (this.isActive(state.name)) {
				state.applyTo(this, state.name);
			}
		},
		getStates: function () {
			return this._states || [];
		}
	})
});