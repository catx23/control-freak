define([
	"intern!object",
	"intern/chai!assert",
	"decor/bind"
], function (registerSuite, assert, bind) {
	var handles = [];

	registerSuite({
		name: "bind",

		afterEach: function () {
			for (var handle = null; (handle = handles.shift());) {
				handle.remove();
			}
		},

		"one way": function () {
			var dfd = this.async(1000);
			var model = {
				m1: 1,
				m2: 2
			};
			var view = {
				v1: 1,
				v2: 2
			};
			bind(model, view, {
				v1: "m1",
				v2: function (model) { return model.m1 + model.m2; }
			});

			model.m1 = 10;
			model.m2 = 20;

			setTimeout(dfd.callback(function () {
				assert.strictEqual(view.v1, 10, "view.v1");
				assert.strictEqual(view.v2, 30, "view.v2");
			}), 1);
		},

		"one way nested": function () {
			var dfd = this.async(1000);
			var model = {
				m1: {
					m2: 2
				}
			};
			var view = {
				v1: {
					v2: 2
				},
				v3: {
					v4: 3
				}
			};
			bind(model, view, {
				"v1.v2": "m1.m2",
				"v3.v4": function (model) { return model.m1.m2 * 2; }
			});

			model.m1.m2 = 10;

			setTimeout(dfd.callback(function () {
				assert.strictEqual(view.v1.v2, 10, "view.v1.v2");
				assert.strictEqual(view.v3.v4, 20, "view.v3.v4");
			}), 1);
		},

		"two way": function () {
			var dfd = this.async(1000);
			var model = {
				m1: 1,
				m2: 2
			};
			var view = {
				v1: 1,
				v2: 2
			};
			bind(model, view, [
				{
					model: "m1",
					view: "v1",
					twoWay: true
				},
				{
					model: "m2",
					view: "v2",
					modelToView: function (model) { return model.m1 + model.m2; },
					viewToModel: function (view) { return view.v2 - view.v1; },
					twoWay: true
				}
			]);

			model.m1 = 10;
			model.m2 = 20;

			setTimeout(dfd.rejectOnError(function () {
				assert.strictEqual(view.v1, 10, "view.v1");
				assert.strictEqual(view.v2, 30, "view.v2");

				view.v1 = 25;
				view.v2 = 75;
				setTimeout(dfd.callback(function () {
					assert.strictEqual(model.m1, 25, "model.m1");
					assert.strictEqual(model.m2, 50, "model.m2");
				}), 1);
			}), 1);
		},

		"two way nested": function () {
			var dfd = this.async(1000);
			var model = {
				m1: {
					m2: 2
				},
				m3: {
					m4: 4
				}
			};
			var view = {
				v1: 1,
				v2: 2
			};
			bind(model, view, [
				{
					model: "m1.m2",
					view: "v1",
					twoWay: true
				},
				{
					model: "m3.m4",
					view: "v2",
					modelToView: function (model) { return model.m1.m2 + model.m3.m4; },
					viewToModel: function (view) { return view.v2 - view.v1; },
					twoWay: true
				}
			]);

			model.m1.m2 = 10;
			model.m3.m4 = 20;

			setTimeout(dfd.rejectOnError(function () {
				assert.strictEqual(view.v1, 10, "view.v1");
				assert.strictEqual(view.v2, 30, "view.v2");

				view.v1 = 25;
				view.v2 = 75;
				setTimeout(dfd.callback(function () {
					assert.strictEqual(model.m1.m2, 25, "model.m1.m2");
					assert.strictEqual(model.m3.m4, 50, "model.m3.m4");
				}), 1);
			}), 1);
		}

	});
});
