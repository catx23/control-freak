/**
 * Plugin based on requirejs i18n
 * see: http://github.com/requirejs/i18n for details
 */
define(["./i18n/common", "./i18n/build", "module"], function (common, build, module) {

	var localesList,
		writePluginFile,

		mixin = common.mixin,
		eachProp = common.eachProp,
		parseName = common.parseName,
		getMasterMid = common.getMasterMid,

		normalizeBundlesMap = function (bundlesMap) {
			var result = {};
			eachProp(bundlesMap, function (layer, bundleList) {
				bundleList.forEach(function (bundle) {
					result[bundle] = layer;
				});
			});
			return result;
		},

		// Transform a bundle from a language layer to a root bundle.
		rootify = function (bundle, locale) {
			var result = {};
			if (bundle._pseudoRoot) {
				result[locale] = {};
				mixin(result, bundle._pseudoRoot);
				delete bundle._pseudoRoot;
				mixin(result[locale], bundle);
				bundle = result;
			}
			return bundle;
		},

		// Construct the best language bundle by merging from most specific locale to less specific locale.
		resolveAMD = function (name, req, onLoad) {
			var masterMid = getMasterMid(name);

			//First, fetch the master bundle, it knows what locales are available.
			req([masterMid], function (master) {
				var getBundleAndMixin = function (prefix, suffix, locale, value) {
					var mixBundle = function (bundle) {
						mixin(value, bundle);
						locale = common.getParentLocale(locale);
						if (!bundle._flattened && locale) {
							getBundleAndMixin(prefix, suffix, locale, value);
						} else {
							value._flattened = true;
							onLoad(value);
						}
					};

					if (master[locale] === true || master[locale] === 1) {
						req([prefix + locale + '/' + suffix], mixBundle);
					} else {
						// locale is on the master bundle or locale is unexisting
						mixBundle(master[locale] || {});
					}
				};

				master = rootify(master, name.masterLocale);
				getBundleAndMixin(name.prefix, name.suffix, name.requestedLocale, {});
			});
		},

		getLayer = function (name, layer, moduleConfig, getParentLocale, req, onLoad) {
			var locale = name.requestedLocale,
				localesList = moduleConfig.localesMap[layer];

			while (locale && localesList.indexOf(locale) < 0) {
				locale = getParentLocale(locale);
			}

			if (locale) {
				name.masterLocale = locale;

				req([layer + "_" + locale], function () {
					pickFromLayer(name, moduleConfig, req, onLoad);
				});
			} else {
				console.log("i18n: no relevant layer " + layer + " found for locale " + name.requestedLocale + ".");
				onLoad();
			}
		},


		tryLayer = function (name, layer, moduleConfig, getParentLocale, req, onLoad) {
			var helper = function (locale) {
				if (locale) {
					req(["maybe!" + layer + "_" + locale], function (bundle) {
						if (bundle) {
							name.masterLocale = locale;
							pickFromLayer(name, moduleConfig, req, onLoad);
						} else {
							helper(getParentLocale(locale));
						}
					});
				} else {
					console.log("i18n: no relevant layer " + layer + " found for locale " + name.requestedLocale + ".");
					onLoad();
				}
			};

			helper(name.requestedLocale);
		},

		pickFromLayer = function (name, moduleConfig, req, onLoad) {
			var masterMid = getMasterMid(name);

			if (name.requestedLocale === name.masterLocale || moduleConfig.layerOnly || !moduleConfig.enhanceLayer) {
				req([masterMid], function (bundle) {
					if (bundle.root) {
						bundle = bundle.root;
					}
					onLoad(bundle);
				});
			} else {
				resolveAMD(name, req, onLoad);
			}
		};

	return {
		/* jshint maxcomplexity:15 */
		load: function (name, req, onLoad, config) {
			if (!name) {
				onLoad();
				return;
			}

			config = config || {};

			var moduleConfig = {},
				masterMid,
				layer;

			// Copy the config
			mixin(moduleConfig, typeof module.config === "function" ? module.config() || {} : {});

			if (config.isBuild) {
				localesList = moduleConfig.localesList;
				onLoad();
				return;
			}

			moduleConfig.enhanceLayer = moduleConfig.enhanceLayer === undefined ? true : moduleConfig.enhanceLayer;

			// Parse name and set the locale if a top level bundle is required
			name = parseName(name);
			name.requestedLocale = name.requestedLocale || common.getLocale(moduleConfig.locale || config.locale);
			masterMid = getMasterMid(name);

			// If there is no layer, classic AMD mode
			if (!moduleConfig.bundlesMap) {
				resolveAMD(name, req, onLoad);
				return;
			}

			// From now on there is at least one layer available

			// Check if requested module is in a layer
			moduleConfig.bundlesMap = normalizeBundlesMap(moduleConfig.bundlesMap);
			layer = moduleConfig.bundlesMap[masterMid];

			if (!layer && moduleConfig.layerOnly) {
				console.log("i18n: module " + masterMid + " not found in layer.");
				onLoad();
				return;
			} else if (!layer) {
				resolveAMD(name, req, onLoad);
				return;
			}

			// The module is in a layer

			if (moduleConfig.languagePack) {
				// Drop language pack mode, hence need to try every possible layer
				tryLayer(name, layer, moduleConfig, common.getParentLocale, req, onLoad);
				return;
			} else {
				// There is a locale list for the layer
				getLayer(name, layer, moduleConfig, common.getParentLocale, req, onLoad);
				return;
			}
		},
		/* jshint  maxcomplexity:10 */

		write: function (pluginName, moduleName, write) {
			var name = parseName(moduleName),
				bundle;

			if (name.requestedLocale) {
				bundle = build.resolveSync(name.requestedLocale, name);
				if (name.requestedLocale !== "root") {
					bundle._pseudoRoot = {};
					bundle._flattened = true;
				}
				write.asModule(pluginName + "!" + moduleName, "define(" + JSON.stringify(bundle) + ")");
			} else {
				build.addBundleToNlsLayer(name);
			}
		},

		writeFile: function (pluginName, resource, requirejs, writeFile) {
			writePluginFile = writeFile;
		},

		onLayerEnd: function (write, data) {
			if (data.name && data.path) {
				var layersContent;

				build.setLocalesList(localesList);

				layersContent = build.getLayersContent();

				build.writeLayers(layersContent, data, writePluginFile);
				build.writeConfig(module.id, data, write);
			}
			build.reset();
		}
	};
});
