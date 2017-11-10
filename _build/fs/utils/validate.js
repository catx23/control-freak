"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let prettyPrintTypes = function (types) {
    const addArticle = (str) => {
        let vowels = ['a', 'e', 'i', 'o', 'u'];
        if (vowels.indexOf(str[0]) !== -1) {
            return 'an ' + str;
        }
        return 'a ' + str;
    };
    return types.map(addArticle).join(' or ');
};
let isArrayOfNotation = function (typeDefinition) {
    return /array of /.test(typeDefinition);
};
let extractTypeFromArrayOfNotation = function (typeDefinition) {
    // The notation is e.g. 'array of string'
    return typeDefinition.split(' of ')[1];
};
let isValidTypeDefinition = (typeStr) => {
    if (isArrayOfNotation(typeStr)) {
        return isValidTypeDefinition(extractTypeFromArrayOfNotation(typeStr));
    }
    return [
        'string',
        'number',
        'boolean',
        'array',
        'object',
        'buffer',
        'null',
        'undefined',
        'function'
    ].some(function (validType) {
        return validType === typeStr;
    });
};
const detectType = function (value) {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'array';
    }
    if (Buffer.isBuffer(value)) {
        return 'buffer';
    }
    return typeof value;
};
const onlyUniqueValuesInArrayFilter = function (value, index, self) {
    return self.indexOf(value) === index;
};
let detectTypeDeep = function (value) {
    let type = detectType(value);
    let typesInArray;
    if (type === 'array') {
        typesInArray = value
            .map((element) => {
            return detectType(element);
        })
            .filter(onlyUniqueValuesInArrayFilter);
        type += ' of ' + typesInArray.join(', ');
    }
    return type;
};
let validateArray = function (argumentValue, typeToCheck) {
    let allowedTypeInArray = extractTypeFromArrayOfNotation(typeToCheck);
    if (detectType(argumentValue) !== 'array') {
        return false;
    }
    return argumentValue.every(function (element) {
        return detectType(element) === allowedTypeInArray;
    });
};
function validateArgument(methodName, argumentName, argumentValue, argumentMustBe) {
    let isOneOfAllowedTypes = argumentMustBe.some(function (type) {
        if (!isValidTypeDefinition(type)) {
            throw new Error('Unknown type "' + type + '"');
        }
        if (isArrayOfNotation(type)) {
            return validateArray(argumentValue, type);
        }
        return type === detectType(argumentValue);
    });
    if (!isOneOfAllowedTypes) {
        throw new Error('Argument "' + argumentName + '" passed to ' + methodName + ' must be '
            + prettyPrintTypes(argumentMustBe) + '. Received ' + detectTypeDeep(argumentValue));
    }
    return false;
}
exports.validateArgument = validateArgument;
;
function validateOptions(methodName, optionsObjName, obj, allowedOptions) {
    if (obj !== undefined) {
        validateArgument(methodName, optionsObjName, obj, ['object']);
        Object.keys(obj).forEach(function (key) {
            let argName = optionsObjName + '.' + key;
            if (allowedOptions.hasOwnProperty(key)) {
                validateArgument(methodName, argName, obj[key], allowedOptions[key]);
            }
            else {
                throw new Error('Unknown argument "' + argName + '" passed to ' + methodName);
            }
        });
    }
}
exports.validateOptions = validateOptions;
;
//# sourceMappingURL=validate.js.map