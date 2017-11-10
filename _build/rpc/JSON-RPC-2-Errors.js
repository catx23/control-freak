"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inherits = require('inherits');
// PRE-DEFINED ERROR CODES
/** An error occurred on the server while parsing the JSON text. */
exports.C_PARSE_ERROR = -32700;
/** The JSON sent is not a valid Request object. */
exports.C_INVALID_REQUEST = -32600;
/** The method does not exist / is not available. */
exports.C_METHOD_NOT_FOUND = -32601;
/** Invalid method parameter(s). */
exports.C_INVALID_PARAMS = -32602;
/** Internal JSON-RPC error. */
exports.C_INTERNAL_ERROR = -32603;
// tslint:disable-next-line:class-name
class JSON_RPC_ERROR {
    constructor(message, code, data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
exports.JSON_RPC_ERROR = JSON_RPC_ERROR;
inherits(JSON_RPC_ERROR, Error); // @TODO, can we extend from native Error ?
class ParserError extends JSON_RPC_ERROR {
    constructor(message) {
        super('Parse error: ' + message, exports.C_PARSE_ERROR);
    }
}
exports.ParserError = ParserError;
class InvalidRequest extends JSON_RPC_ERROR {
    constructor() {
        super('Invalid Request ', exports.C_INVALID_REQUEST);
    }
}
exports.InvalidRequest = InvalidRequest;
class MethodNotFound extends JSON_RPC_ERROR {
    constructor(message) {
        super('Method not found : ' + message, exports.C_METHOD_NOT_FOUND);
    }
}
exports.MethodNotFound = MethodNotFound;
class InvalidParams extends JSON_RPC_ERROR {
    constructor(message) {
        super('Invalid params ' + message, exports.C_INVALID_PARAMS);
    }
}
exports.InvalidParams = InvalidParams;
class InternalError extends JSON_RPC_ERROR {
    constructor(message, err) {
        if (err && err.message) {
            message = err.message;
        }
        else {
            message = 'Internal error';
        }
        super('Internal error ' + message, exports.C_INTERNAL_ERROR);
    }
}
exports.InternalError = InternalError;
class ServerError extends JSON_RPC_ERROR {
    constructor(code) {
        if (code < -32099 || code > -32000) {
            throw new Error('Invalid error code');
        }
        super('Server error', code);
    }
}
exports.ServerError = ServerError;
//# sourceMappingURL=JSON-RPC-2-Errors.js.map