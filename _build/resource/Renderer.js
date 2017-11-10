"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resource_1 = require("../interfaces/Resource");
const io = require("../io/json");
const Resolver_1 = require("../resource/Resolver");
const utils = require("../utils/StringUtils");
const _ = require("lodash");
const base64 = require("base-64");
// @TODO: escape & id
class ResourceRenderer extends Resolver_1.ResourceResolver {
    render(item) {
        let result = '';
        let delimitter = Resource_1.DefaultDelimitter();
        switch (item.type) {
            case Resource_1.EResourceType.JS_HEADER_INCLUDE: {
                // tslint:disable-next-line:quotemark
                result = "<script type='text/javascript' src='" +
                    utils.replace(item.url, null, this.relativeVariables, delimitter)
                    + "'></script>\n";
                break;
            }
            case Resource_1.EResourceType.JS_HEADER_SCRIPT_TAG: {
                result = '<script type="application/javascript">\n';
                result += utils.replace(io.read(utils.replace(item.url, null, this.absoluteVariables, delimitter)), null, this.relativeVariables, delimitter);
                result += '</script>';
                break;
            }
            case Resource_1.EResourceType.CSS: {
                const rel = 'stylesheet';
                // tslint:disable-next-line:quotemark
                result = "<link rel='" + rel + "' id='css_" + base64.encode(item.url) + "' href='" + utils.replace(item.url, null, this.relativeVariables, delimitter) + "'  type='text/css' />\n";
                break;
            }
        }
        return result;
    }
    renderHeader() {
        let resourceItems = [];
        _.each(JSON.parse(io.read(this.configPath)).items, (item) => {
            if (item.enabled) {
                const resolved = this.render(item);
                if (resolved && resolved.length) {
                    resourceItems.push(resolved);
                }
            }
        });
        return resourceItems.join('');
    }
}
exports.ResourceRenderer = ResourceRenderer;
//# sourceMappingURL=Renderer.js.map