"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Component_1 = require("../Component");
const Workbench_1 = require("../xideve/services/Workbench");
const Library_1 = require("../xideve/services/Library");
const Preview_1 = require("./routes/Preview");
const d = {};
const e = {};
class XIDEVE extends Component_1.Component {
    label() {
        return "xideve";
    }
    services(config) {
        return [new Workbench_1.WorkbenchService(config), new Library_1.LibraryService('')];
    }
    routes() {
        return [Preview_1.default];
    }
}
exports.XIDEVE = XIDEVE;
;
//# sourceMappingURL=xideve.js.map