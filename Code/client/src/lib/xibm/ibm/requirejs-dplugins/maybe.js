define({
	load: function (name, require, onload) {
		if (require.on) {
			// Dojo
			// code from https://bugs.dojotoolkit.org/attachment/ticket/16416/t16416.html courtesy of rcgill
			require.on("error", function () {
				if (!require.modules[name].executed) {
					// yep, it had a problem; therefore...

					// put it back into the "unloaded" state
					require.undef(name);

					// define it another way..
					define(name, [], function () {
						return 0;
					});

					// this gets the loader to notice that the module showed up without being requested
					require([name]);
				}
			});
		}
		// RequireJS and Dojo
		require([name], function (value) {
			onload(value);
		}, function () {
			onload(undefined);
		});
	}
});
