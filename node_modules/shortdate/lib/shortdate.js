'use strict';

module.exports = function(date, options) {
    var sep;
    var order;
    var ret;
    var day;
    var month;
    var year;
    
    date = date || new Date();
    
    check(date, options);
    
    if (!options) {
        options = {};
    }
    
    sep     = options.sep || '.';
    order   = options.order || 'big'
    
    day     = date.getDate();
    month   = date.getMonth() + 1;
    year    = date.getFullYear();
     
    if (month <= 9)
        month   = '0' + month;
    
    if (day <= 9)
        day     = '0' + day;
    
    switch(order) {
    case 'big':
        ret         = [year, month, day].join(sep);
        break;
    case 'middle':
        ret         = [month, day, year].join(sep);
        break;
    case 'little':
        ret         = [day, month, year].join(sep);
        break;
    default:
        throw Error('order could be "big", "middle" and "little" only!');
    }
    
    return ret;
};

function check(date, options) {
    var type = {}.toString.call(date);
    
    if (date && type !== '[object Date]')
        throw Error('date should be Date!');
    
    if (options && typeof options !== 'object')
        throw Error('options should be object!');
 }

