# Spawnify

Create new processes, change directories, auto switch between spawn and exec.

## Install

```
npm i spawnify --save
```

## How to use?

```js
const spawnify = require('spawnify');
const spawn = spawnify('ls -lha', {cwd: __dirname});

spawn.on('error', (error) => {
    console.error(error.message);
});

/* not mandatory */
spawn.on('data', (data) => {
    console.log(data);
});

/* not mandatory */
spawn.on('start', () => {
    console.log('process has been started');
    // kill process after start
    spawn.kill();
});

/* not mandatory */
spawn.on('path', (path) => {
    console.log('directory was changed', path);
});

/* not mandatory */
spawn.on('close', () => {
    console.log('process closed');
});

/* not mandatory */
spawn.on('exit', function() {
    console.log('process closed');
});
```

## Environments

In old `node.js` environments that not fully supports `es2015`, `spawnify` could be used with:

```js
var spawnify = require('spawnify/legacy');
```

## License

MIT
