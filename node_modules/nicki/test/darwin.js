'use strict';

const test = require('tape');
const darwin = require('../lib/darwin');

test('nicki: parse /etc/passwd', (t) => {
    const passwd = 'nobody                  -2';
    const users = {
        '-2': 'nobody'
    }
    
    t.deepEqual(darwin.parse(passwd), users, 'should parse passwd string');
    t.end();
});


