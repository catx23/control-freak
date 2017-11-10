"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../../../services/Base");
const Bean_1 = require("./../../../services/Bean");
const AnyPromise = require("any-promise");
//import *  from '../export/Exporter';
class WorkbenchService extends Bean_1.BeanService {
    constructor() {
        super(...arguments);
        // implement Base#method
        this.method = 'XApp_XIDE_Workbench_Service';
    }
    // implement VFS#ls
    getInfo(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new AnyPromise((resolve, reject) => {
                resolve({
                    "themeDefaultSet": null,
                    "dojoOptions": null,
                    "widgetPalette": null,
                    "userInfo": {
                        "email": "noemail@noemail.com",
                        "isLocalInstall": false,
                        "userDisplayName": "A",
                        "userId": "A"
                    },
                    "workbenchState": {
                        "activeEditor": null,
                        "editors": [],
                        "nhfo": [],
                        "project": null,
                        "id": "",
                        "Fields": [],
                        "admin": {
                            "settings": [{
                                    "id": "driverView",
                                    "value": {
                                        "basic": {
                                            "showHeader": false,
                                            "selection": { "selected": ["9627cb05-2f23-8846-0721-5abcc7d3afbb"] },
                                            "toolbar": false,
                                            "properties": true
                                        },
                                        "conditionalProcess": {
                                            "showHeader": false,
                                            "selection": { "selected": [] },
                                            "toolbar": true,
                                            "properties": true
                                        },
                                        "basicVariables": {
                                            "showHeader": false,
                                            "selection": { "selected": [] },
                                            "toolbar": false,
                                            "properties": true
                                        }
                                    }
                                }, { "id": "theme", "value": "blue" }]
                        }
                    },
                    "project": null,
                    "id": "",
                    "Fields": []
                });
            });
        });
    }
    //
    // ─── DECORATORS ─────────────────────────────────────────────────────────────────
    //
    getRpcMethods() {
        throw new Error("Should be implemented by decorator");
    }
    methods() {
        const methods = this.getRpcMethods();
        return this.toMethods(methods);
    }
}
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkbenchService.prototype, "getInfo", null);
exports.WorkbenchService = WorkbenchService;
//# sourceMappingURL=Workbench.js.map