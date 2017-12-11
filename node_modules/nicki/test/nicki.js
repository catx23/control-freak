'use strict';

const test = require('tape');
const nicki = require('..');

test('nicki: parse /etc/passwd', (t) => {
    const passwd = 'root:x:0:0:root:/root:/bin/bash';
    const users = {
        '0': 'root'
    }
    
    t.deepEqual(nicki.parse(passwd), users, 'should parse passwd string');
    t.end();
});


