'use strict';

let test        = require('tape');
let shortdate   = require('..');

test('no args: result is string', (t) => {
   let date = shortdate();
    
    t.equal(typeof date, 'string', 'date should be string');
    
    t.end();
});

test('no args: year should equal', (t) => {
    let date = shortdate().split('.').map(Number);
    let newDate = new Date();
    
    t.equal(date[0], newDate.getFullYear(), 'year should be equal');
    
    t.end();
});

test('args: bad date', (t) => {
     let fn = () => shortdate('hi');
    
    t.throws(fn, /date should be Date!/, 'should throw when type of arg not Date');
    t.end();
});

test('args: bad options', (t) => {
     let fn = () => shortdate(new Date(), 'world');
    
    t.throws(fn, /options should be object!/, 'should throw when type of options not object');
    t.end();
});

test('args: date lower then 10', (t) => {
    const September9 = new Date('9-9');
    let date = shortdate(September9);
    let day = date.split('.')[2];
    
    t.equal('09', day, 'day should be equal');
    t.end();
});

test('options: no sep', (t) => {
    let date    = shortdate();
    let length  = date.split('.').length;
    
    t.equal(length, 3, 'default separator should be used to divide date');
    t.end();
});

test('options: sep', (t) => {
    let date = shortdate(new Date('9-9'), {
        sep: '#'
    });
    
    let length = date.split('#').length;
    
    t.equal(length, 3, 'separator should be used to divide date');
    t.end();
});

test('options: no order', (t) => {
    let date = shortdate(new Date('9-9'));
    let year = Number(date.split('.')[0]);
    
    t.equal(year, 2001, 'year should be first (big endian used)');
    t.end();
});

test('options: little order', (t) => {
    let date = shortdate(new Date('9-9'), {
        order: 'little'
    });
    
    let year = Number(date.split('.')[2]);
    
    t.equal(year, 2001, 'year should be last');
    t.end();
});

test('options: middle order', (t) => {
    let date = shortdate(new Date('5-9'), {
        order: 'middle'
    });
    
    let month = Number(date.split('.')[0]);
    
    t.equal(month, 5, 'year should be last');
    t.end();
});

test('options: bad order', (t) => {
    let fn = () => {
        shortdate(new Date('5-9'), {
            order: 'hello'
        });
    }
    
    t.throws(fn, /order could be "big", "middle" and "little" only!/, 'should throw when order is not big, middle or little');
    t.end();
});
