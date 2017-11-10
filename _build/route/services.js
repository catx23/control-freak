"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(target) {
    return {
        'SMDVersion': '2.0',
        'description': 'Xapp JSON RPC Server',
        'contentType': 'application\/json',
        'transport': 'POST',
        'envelope': 'JSON-RPC-2.0',
        'target': target,
        'services': {
            'XApp_Store.getReader': { 'transport': 'POST', 'target': null, 'parameters': [] },
            'XApp_Store.getWriter': { 'transport': 'POST', 'target': null, 'parameters': [] },
            'XApp_Store.get': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'section', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }, { 'name': 'query', 'default': null, 'optional': true }]
            },
            'XApp_Store.set': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'section', 'optional': false }, {
                        'name': 'path',
                        'default': '.',
                        'optional': true
                    }, { 'name': 'query', 'default': null, 'optional': true }, {
                        'name': 'value',
                        'default': null,
                        'optional': true
                    }, { 'name': 'decodeValue', 'default': true, 'optional': true }]
            },
            'XApp_Store.update': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'section', 'optional': false }, {
                        'name': 'path',
                        'default': '.',
                        'optional': true
                    }, { 'name': 'searchQuery', 'default': null, 'optional': true }, {
                        'name': 'value',
                        'default': null,
                        'optional': true
                    }, { 'name': 'decodeValue', 'default': true, 'optional': true }]
            },
            'XCOM_Directory_Service.find': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'mount',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'searchConf', 'optional': false, 'type': 'mixed' }]
            },
            'XCOM_Directory_Service.compress': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'mount',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'selection', 'optional': false, 'type': 'mixed' }, {
                        'name': 'type',
                        'default': 'zip',
                        'optional': true,
                        'type': 'string'
                    }]
            },
            'XCOM_Directory_Service.extract': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{ 'name': 'mount', 'optional': false, 'type': 'mixed' }, {
                        'name': 'what',
                        'optional': false,
                        'type': 'mixed'
                    }]
            },
            'XCOM_Directory_Service.rename': {
                'transport': 'POST',
                'target': null,
                'returns': 'array',
                'parameters': [{ 'name': 'mount', 'optional': false, 'type': 'mixed' }, {
                        'name': 'path',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'newFileName', 'optional': false }]
            },
            'XCOM_Directory_Service.putRemote': {
                'transport': 'POST',
                'target': null,
                'returns': 'array',
                'parameters': [{ 'name': 'mount', 'optional': false }, {
                        'name': 'destination',
                        'optional': false
                    }]
            },
            'XCOM_Directory_Service.convert_size_to_num': {
                'transport': 'POST',
                'target': null,
                'returns': ['integer', 'string'],
                'parameters': [{ 'name': 'size', 'optional': false, 'type': 'mixed' }]
            },
            'XCOM_Directory_Service.get_max_fileupload_size': {
                'transport': 'POST',
                'target': null,
                'parameters': []
            },
            'XCOM_Directory_Service.put': {
                'transport': 'POST',
                'target': null,
                'returns': 'array',
                'parameters': []
            },
            'XCOM_Directory_Service.delete': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'selection', 'optional': false }, {
                        'name': 'options',
                        'optional': false
                    }, { 'name': 'secure', 'default': false, 'optional': true }]
            },
            'XCOM_Directory_Service.move': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'selection', 'optional': false }, {
                        'name': 'dst',
                        'optional': false
                    }, { 'name': 'inclusion', 'default': [], 'optional': true }, {
                        'name': 'exclusion',
                        'default': [],
                        'optional': true
                    }, { 'name': 'mode', 'default': 1504, 'optional': true }]
            },
            'XCOM_Directory_Service.copy': {
                'transport': 'POST',
                'target': null,
                'returns': 'array',
                'parameters': [{
                        'name': 'selection',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'dst', 'optional': false, 'type': 'mixed' }, {
                        'name': 'options',
                        'optional': false,
                        'type': 'array'
                    }]
            },
            'XCOM_Directory_Service.ls': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'mount', 'default': 'ws', 'optional': true }, {
                        'name': 'path',
                        'default': '\/',
                        'optional': true
                    }, { 'name': 'options', 'default': null, 'optional': true }, {
                        'name': 'recursive',
                        'default': false,
                        'optional': true
                    }]
            },
            'XCOM_Directory_Service.downloadTo': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{ 'name': 'url', 'optional': false, 'type': 'mixed' }, {
                        'name': 'mount',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'to', 'optional': false, 'type': 'string' }]
            },
            'XCOM_Directory_Service.fileUpdate': {
                'transport': 'POST',
                'target': null,
                'returns': ['boolean', 'mixed'],
                'parameters': []
            },
            'XCOM_Directory_Service.getFileSystem': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{ 'name': 'mount', 'default': '', 'optional': true }]
            },
            'XCOM_Directory_Service.getFSResources': {
                'transport': 'POST',
                'target': null,
                'returns': ['array', 'mixed', 'null'],
                'parameters': []
            },
            'XCOM_Directory_Service.getResourceType': {
                'transport': 'POST',
                'target': null,
                'returns': ['boolean', 'string'],
                'parameters': [{ 'name': 'mount', 'optional': false, 'type': 'mixed' }]
            },
            'XCOM_Directory_Service.isRemoteOperation': {
                'transport': 'POST',
                'target': null,
                'returns': 'boolean',
                'parameters': [{ 'name': 'src', 'optional': false, 'type': 'mixed' }, {
                        'name': 'dst',
                        'optional': false,
                        'type': 'mixed'
                    }]
            },
            'XCOM_Directory_Service.isRemoteToRemoteOperation': {
                'transport': 'POST',
                'target': null,
                'returns': 'boolean',
                'parameters': [{ 'name': 'src', 'optional': false, 'type': 'mixed' }, {
                        'name': 'dst',
                        'optional': false,
                        'type': 'mixed'
                    }]
            },
            'XCOM_Directory_Service.set': {
                'transport': 'POST',
                'target': null,
                'returns': 'boolean',
                'parameters': [{ 'name': 'mount', 'optional': false, 'type': 'mixed' }, {
                        'name': 'path',
                        'optional': false,
                        'type': 'mixed'
                    }, {
                        'name': 'content',
                        'default': '',
                        'optional': true,
                        'type': 'string'
                    }, { 'name': 'errors', 'default': [], 'optional': true, 'type': 'array' }]
            },
            'XCOM_Directory_Service.mkfile': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'mount', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    },
                    {
                        'content': 'content',
                        'optional': false
                    }
                ]
            },
            'XCOM_Directory_Service.mkdir': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'mount', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }]
            },
            'XCOM_Directory_Service.copyDirectory': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'srcDir', 'optional': false }, {
                        'name': 'dstDirectory',
                        'optional': false
                    }, { 'name': 'options', 'default': [], 'optional': false }, {
                        'name': 'inclusionMask',
                        'default': [],
                        'optional': false
                    }, { 'name': 'exclusionMask', 'default': [], 'optional': false }, {
                        'name': 'error',
                        'optional': false
                    }, { 'name': 'success', 'optional': false }]
            },
            'XCOM_Directory_Service.get': {
                'transport': 'POST',
                'target': null,
                'returns': ['boolean', 'string'],
                'parameters': [{
                        'name': 'path',
                        'optional': false,
                        'type': 'mixed'
                    }, {
                        'name': 'attachment',
                        'default': false,
                        'optional': true,
                        'type': ['boolean', 'false']
                    }, {
                        'name': 'send',
                        'default': true,
                        'optional': true,
                        'type': ['boolean', 'true']
                    }, {
                        'name': 'width',
                        'default': null,
                        'optional': true,
                        'type': 'null'
                    }, {
                        'name': 'time',
                        'default': null,
                        'optional': true,
                        'type': 'null'
                    }, { 'name': 'mount', 'default': '', 'optional': true, 'type': 'string' }]
            },
            'XCOM_Directory_Service.get2': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'mount', 'default': '', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }, { 'name': 'attachment', 'default': false, 'optional': true }, {
                        'name': 'send',
                        'default': true,
                        'optional': true
                    }, { 'name': 'width', 'default': null, 'optional': true }, {
                        'name': 'time',
                        'default': null,
                        'optional': true
                    }]
            },
            'XCOM_Directory_Service.deleteDirectory': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'path', 'optional': false }]
            },
            'XCOM_Directory_Service.deleteFile': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'path', 'optional': false }]
            },
            'XCOM_Directory_Service.createToken': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'what', 'optional': false }]
            },
            'XApp_Resource_Service.createResource': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'resource', 'optional': false }, {
                        'name': 'test',
                        'default': false,
                        'optional': true
                    }]
            },
            'XApp_Resource_Service.updateResource': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'resource', 'optional': false }, {
                        'name': 'test',
                        'default': false,
                        'optional': true
                    }]
            },
            'XApp_Resource_Service.removeResource': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'resource', 'optional': false }, {
                        'name': 'test',
                        'default': false,
                        'optional': true
                    }]
            },
            'XApp_Resource_Service.ls': { 'transport': 'POST', 'target': null, 'parameters': [] },
            'XApp_Tracking_Service.get': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'section', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }, { 'name': 'query', 'default': null, 'optional': true }]
            },
            'XApp_Tracking_Service.set': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'section', 'optional': false }, {
                        'name': 'path',
                        'default': '.',
                        'optional': true
                    }, { 'name': 'query', 'default': null, 'optional': true }, {
                        'name': 'value',
                        'default': null,
                        'optional': true
                    }, { 'name': 'decodeValue', 'default': true, 'optional': true }]
            },
            'XCF_Driver_Service.ls': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'default': null, 'optional': true }]
            },
            'XCF_Driver_Service.createItem': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }, { 'name': 'title', 'optional': false }, {
                        'name': 'meta',
                        'optional': false
                    }, { 'name': 'driverCode', 'optional': false }]
            },
            'XCF_Driver_Service.get': {
                'transport': 'POST',
                'target': null,
                'parameters': [
                    {
                        'name': 'path',
                        'optional': false
                    },
                    {
                        'name': 'send',
                        'optional': false
                    },
                    {
                        'name': 'attachment',
                        'optional': false
                    }
                ]
            },
            'XCF_Driver_Service.set': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [
                    { 'name': 'scope', 'optional': false, 'type': 'mixed' }, {
                        'name': 'path',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'content', 'optional': false, 'type': 'mixed' }
                ]
            },
            'XCF_Driver_Service.createGroup': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system_driver',
                        'optional': false,
                        'type': 'string'
                    }, { 'name': 'name', 'optional': false, 'type': 'mixed' }]
            },
            'XCF_Driver_Service.updateItemMetaData': {
                'transport': 'POST',
                'target': null,
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system',
                        'optional': false
                    }, {
                        'name': 'driverPathRelative',
                        'default': 'Denon\/Denon Base.meta.json',
                        'optional': false
                    }, { 'name': 'dataPath', 'default': '\/inputs', 'optional': false }, {
                        'name': 'query',
                        'optional': false
                    }, { 'name': 'value', 'optional': false }]
            },
            'XCF_Driver_Service.removeGroup': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system',
                        'optional': false,
                        'type': 'string'
                    }, { 'name': 'name', 'optional': false, 'type': 'mixed' }]
            },
            'XCF_Driver_Service.removeItem': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }, { 'name': 'name', 'optional': false }]
            },
            'XCF_Device_Service.ls': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'default': null, 'optional': true }]
            },
            'XCF_Device_Service.getDeviceContent': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }]
            },
            'XCF_Device_Service.setDeviceContent': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{ 'name': 'scope', 'optional': false, 'type': 'mixed' }, {
                        'name': 'path',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'content', 'optional': false, 'type': 'mixed' }]
            },
            'XCF_Device_Service.updateItemMetaData': {
                'transport': 'POST',
                'target': null,
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system',
                        'optional': false
                    }, {
                        'name': 'driverPathRelative',
                        'default': 'Denon\/Denon Base.meta.json',
                        'optional': false
                    }, { 'name': 'dataPath', 'default': '\/inputs', 'optional': false }, {
                        'name': 'query',
                        'optional': false
                    }, { 'name': 'value', 'optional': false }]
            },
            'XCF_Device_Service.createGroup': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system',
                        'optional': false,
                        'type': 'string'
                    }, { 'name': 'name', 'optional': false, 'type': 'mixed' }]
            },
            'XCF_Device_Service.createItem': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'options', 'default': [], 'optional': true }]
            },
            'XCF_Device_Service.removeItem': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'optional': false }, {
                        'name': 'name',
                        'optional': false
                    }]
            },
            'XCF_Device_Service.removeGroup': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system',
                        'optional': false,
                        'type': 'string'
                    }, { 'name': 'name', 'optional': false, 'type': 'mixed' }]
            },
            'XCF_Protocol_Service.ls': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'default': null, 'optional': true }]
            },
            'XCF_Protocol_Service.getProtocolContent': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'scope', 'optional': false }, {
                        'name': 'path',
                        'optional': false
                    }]
            },
            'XCF_Protocol_Service.setProtocolContent': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{ 'name': 'scope', 'optional': false, 'type': 'mixed' }, {
                        'name': 'path',
                        'optional': false,
                        'type': 'mixed'
                    }, { 'name': 'content', 'optional': false, 'type': 'mixed' }]
            },
            'XCF_Protocol_Service.updateItemMetaData': {
                'transport': 'POST',
                'target': null,
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system',
                        'optional': false
                    }, {
                        'name': 'driverPathRelative',
                        'default': 'Denon\/Denon Base.meta.json',
                        'optional': false
                    }, { 'name': 'dataPath', 'default': '\/inputs', 'optional': false }, {
                        'name': 'query',
                        'optional': false
                    }, { 'name': 'value', 'optional': false }]
            },
            'XCF_Protocol_Service.createGroup': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system_protocols',
                        'optional': false,
                        'type': 'string'
                    }, { 'name': 'name', 'optional': false, 'type': 'mixed' }]
            },
            'XCF_Protocol_Service.createItem': {
                'transport': 'POST',
                'target': null,
                'returns': 'array',
                'parameters': [{ 'name': 'scope', 'optional': false, 'type': 'array' }, {
                        'name': 'path',
                        'optional': false
                    }, { 'name': 'title', 'optional': false }, {
                        'name': 'meta',
                        'optional': false
                    }, { 'name': 'driverCode', 'optional': false }]
            },
            'XCF_Protocol_Service.removeItem': {
                'transport': 'POST',
                'target': null,
                'returns': 'array',
                'parameters': [{ 'name': 'scope', 'optional': false, 'type': 'array' }, {
                        'name': 'name',
                        'optional': false
                    }]
            },
            'XCF_Protocol_Service.removeGroup': {
                'transport': 'POST',
                'target': null,
                'returns': 'mixed',
                'parameters': [{
                        'name': 'scopeName',
                        'default': 'system',
                        'optional': false,
                        'type': 'string'
                    }, { 'name': 'name', 'optional': false, 'type': 'mixed' }]
            },
            'XApp_XIDE_Controller_UserService.test': {
                'transport': 'POST',
                'target': null,
                'parameters': []
            },
            'XApp_XIDE_Controller_UserService.login': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'userName', 'optional': false }, {
                        'name': 'password',
                        'optional': false
                    }]
            },
            'XIDE_NodeJS_Service.ls': { 'transport': 'POST', 'target': null, 'parameters': [] },
            'XIDE_NodeJS_Service.stop': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'services', 'default': [], 'optional': true }]
            },
            'XIDE_NodeJS_Service.start': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'services', 'default': [], 'optional': true }]
            },
            'XIDE_NodeJS_Service.run': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'arguments', 'optional': false }]
            },
            'XIDE_NodeJS_Service.checkServer': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'arguments', 'optional': false }]
            },
            'XIDE_NodeJS_Service.runDebugServer': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'arguments', 'optional': false }]
            },
            'XIDE_VE_Service.ls': { 'transport': 'POST', 'target': null, 'parameters': [] },
            'XIDE_VE_Service.view': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'file', 'optional': false }]
            },
            'XApp_XIDE_Workbench_Service.getInfo': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'dummy', 'optional': false }]
            },
            'XApp_XIDE_Workbench_Service.setState': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'data', 'optional': false }]
            },
            'XApp_XIDE_Workbench_Service.getWorkbenchState': {
                'transport': 'POST',
                'target': null,
                'returns': ['object', 'xapp_xide_workbenchstate'],
                'parameters': [{ 'name': 'path', 'optional': false, 'type': 'mixed' }]
            },
            'XApp_XIDE_Workbench_Service.createProject': {
                'transport': 'POST',
                'target': null,
                'parameters': [{
                        'name': 'name',
                        'default': '',
                        'optional': true
                    }, {
                        'name': 'projectToClone',
                        'default': '',
                        'optional': true
                    }, {
                        'name': 'eclipseSupport',
                        'default': false,
                        'optional': true
                    }, { 'name': 'projectTemplate', 'default': '', 'optional': true }]
            },
            'XIDE_Log_Service.ls': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'which', 'default': null, 'optional': true }]
            },
            'XIDE_Log_Service.lsAbs': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'path', 'default': null, 'optional': true }]
            },
            'XIDE_Log_Service.clear': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'which', 'optional': false }]
            },
            'XIDE_Log_Service.clearAbs': {
                'transport': 'POST',
                'target': null,
                'parameters': [{ 'name': 'path', 'optional': false }]
            }
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=services.js.map