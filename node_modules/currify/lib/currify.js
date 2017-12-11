'use strict';

const f = (fn) => [
    /*eslint no-unused-vars: 0*/
    function(a) {
        return fn(...arguments);
    },
    function(a, b) {
        return fn(...arguments);
    },
    function(a, b, c) {
        return fn(...arguments);
    },
    function(a, b, c, d) {
        return fn(...arguments);
    },
    function(a, b, c, d, e) {
        return fn(...arguments);
    }
];

module.exports = function currify(fn, ...args) {
    check(fn);
    
    if (args.length >= fn.length)
        return fn(...args);
    
    const again = function() {
        return currify(...[fn, ...args, ...arguments]);
    };
    
    const count = fn.length - args.length - 1;
    const func = f(again)[count];
    
    return func || again;
}

function check(fn) {
    if (typeof fn !== 'function')
        throw Error('fn should be function!');
}

