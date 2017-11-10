define(["./common"], function (common) {
	var bundlesList = [],
		localesList,
		layerMid,

		mixin = common.mixin,
		eachProp = common.eachProp,
		getMasterMid = common.getMasterMid,

		getLayerMid = function (data) {
			var match;
			if (!layerMid) {
				match = data.name.match(/^(.*\/)?(.*)$/);
				layerMid = (match[1] || "") + "nls/" + match[2];
			}
			return layerMid;
		},

		getLayerPath = function (data, loc) {
			var match = data.path.match(/^(.*\/)?(.*)\.js$/);
			return (match[1] || "") + "nls/" + match[2] + "_" + loc + ".js";
		},

		getAllAvailableLocales = function () {
			localesList = [];
			bundlesList.forEach(function (name) {
				var root = require(getMasterMid(name));

				eachProp(root, function (loc) {
					if (root[loc] && localesList.indexOf(loc) < 0) {
						localesList.push(loc);
					}
				});
			});
			return localesList;
		},

		normalizeRoot = function (bundle, name) {
			bundle.root = (bundle.root === true || bundle.root === 1) ?
				require(name.prefix + "root/" + name.suffix) : bundle.root;
			return bundle;
		},

		getPseudoRoots = function (root) {
			var pseudoRoots = {};
			eachProp(root, function (loc) {
				var parent = common.getParentLocale(loc);
				while (parent && parent !== "root") {
					pseudoRoots[parent] = pseudoRoots[parent] || {};
					pseudoRoots[parent][loc] = true;
					parent = common.getParentLocale(parent);
				}
			});
			return pseudoRoots;
		},

		resolveSync = function (locale, name, root) {
			var loc = locale,
				result = {},
				localizedBundle;

			if (arguments.length === 2) {
				root = normalizeRoot(require(getMasterMid(name)), name);
			}

			if (loc !== "root") {
				while (loc && loc !== "root") {
					if (root[loc]) {
						localizedBundle = require(name.prefix + loc + "/" + name.suffix);
						mixin(result, localizedBundle);
					}
					loc = common.getParentLocale(loc);
				}
				localizedBundle = root.root;
				mixin(result, localizedBundle);
			} else {
				mixin(result, root);
			}

			return result;
		};

	return {
		addBundleToNlsLayer: function (name) {
			bundlesList.push(name);
		},

		setLocalesList: function (locList) {
			localesList = locList ? locList.slice() : getAllAvailableLocales();
			if (localesList.indexOf("root") < 0) {
				localesList.push("root");
			}
		},

		reset: function () {
			bundlesList = [];
			localesList = undefined;
			layerMid = undefined;
		},

		getLayersContent: function () {
			var layersContent = {};

			bundlesList.forEach(function (name) {
				var root = normalizeRoot(require(getMasterMid(name)), name),
					pseudoRoots = getPseudoRoots(root);

				localesList.forEach(function (loc) {
					var result = resolveSync(loc, name, root);

					layersContent[loc] = layersContent[loc] || "";

					var mid;
					if (loc !== "root") {
						mid = name.prefix + loc + "/" + name.suffix;
						result._flattened = true;
						result._pseudoRoot = pseudoRoots[loc] || {};
					} else {
						mid = name.prefix + name.suffix;
					}

					layersContent[loc] += 'define("' + mid + '",' + JSON.stringify(result) + ");";
				});
			});

			return layersContent;
		},

		writeLayers: function (layersContent, data, writePluginFile) {
			eachProp(layersContent, function (loc, content) {
				content += "define('" + getLayerMid(data) + "_" + loc + "', true);";
				writePluginFile(getLayerPath(data, loc), content);
			});
		},

		writeConfig: function (pluginName, data, write) {
			var bundles = bundlesList.map(getMasterMid),
				layerMid = getLayerMid(data),
				i18nConf = {
					config: {}
				};
			i18nConf.config[pluginName] = {
				bundlesMap: {},
				localesMap: {}
			};
			i18nConf.config[pluginName].bundlesMap[layerMid] = bundles;
			i18nConf.config[pluginName].localesMap[layerMid] = localesList;

			// write i18n config on the layer
			write("require.config(" + JSON.stringify(i18nConf) + ");");
		},

		resolveSync: resolveSync
	};
});
