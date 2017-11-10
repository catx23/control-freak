define([
    "dcl/dcl",
    "delite/register",
    "delite/Widget",
    "delite/handlebars!./{{widgetName}}.html",
    "requirejs-dplugins/jquery!attributes/classes",
    "requirejs-dplugins/has",
    "delite/handlebars",
    "delite/Template"
], function (dcl, register, Widget, template, $, has, handlebars, Template) {
    const {{widgetName}} = dcl([Widget], {
        baseClass: "d-media-player",
        template: template,
        context: null,
        declaredClass: '{{widgetName}}/{{widgetName}}',
        doTemplate: function () {
            var template = $(this).attr('templateId');
            if (template) {
                template = $(template);
                if (template[0] && !this._didTemplate) {
                    var text = template[0].outerHTML;
                    text = text.replace('display:none', '');
                    text = text.replace('pointer-events:none', '');
                    var templateDom = handlebars.toDom(text);
                    var requires = templateDom.getAttribute("requires") || templateDom.getAttribute("data-requires") || "";
                    templateDom.removeAttribute("requires");
                    templateDom.removeAttribute("data-requires");
                    templateDom.removeAttribute("style");
                    var tree = handlebars.parse(templateDom);
                    this.template = new Template(tree).func;
                    this._didTemplate = true;
                }
            }
        },
        attachedCallback: function () {
            var template = $(this).attr('templateId');
            if (template) {
                template = $(template);
                if (template[0]) {
                    this.doTemplate();
                }
            }
        },
        createdCallback: function () {
            this.doTemplate();
        }
    });
    return register("d-{{widgetName}}", [HTMLElement, {{widgetName}}]);
});