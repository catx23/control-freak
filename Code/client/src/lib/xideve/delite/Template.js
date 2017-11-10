define([], function () {
    var Module = {};
    Module.create = function (dojoBaseUrl, ibmRoot, offset, theme,appUrl) {
        return {
            dojoRoot: dojoBaseUrl,
            ibmRoot: ibmRoot,
            contextClass: 'xideve/delite/Context',
            baseUrl: dojoBaseUrl + '/' + ibmRoot,
            requireUrl: dojoBaseUrl + ibmRoot + '/requirejs/require.js',
            jQueryUrl: dojoBaseUrl + 'external/jquery-1.9.1.min.js',
            lodashUrl: dojoBaseUrl + 'external/lodash.min.js',
            bodyStyle: {
                width: "100%",
                height: "100%",
                visibility: "visible",
                margin: "0"
            },
            bodyTheme: "superhero",
            templateVariables: {
                requireUrl: ibmRoot + '/requirejs/require.js',
                jQueryUrl: dojoBaseUrl + '/external/jquery-1.9.1.min.js',
                lodashUrl: dojoBaseUrl + '/external/lodash.min.js',
                ibmRoot: ibmRoot,
                offset: offset,
                theme: theme,
                baseUrl: dojoBaseUrl,
                appUrl:appUrl
            }
        }
    };
    return Module;
});