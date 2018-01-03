win32
=====

Win32 specific functions module

## Install

```
npm install win32 --save
```

## Use

### getVolumes()

Get volumes of Windows platform

```js
const win = require('win32');

win.getVolumes((error, volumes) => {
    console.log(error || volumes);
});
```

### unicodify()

Convert `cp437` (or other detected by `prepareCodePage`) to `utf8`;

```js
const win = require('win32');
const {exec} = require('child_process');

exec('dir').stdout
    .pipe(win.unicodify())
    .pipe(process.stdout);
```

### prepareCodePage()

Set code page to `65001` which is `utf8`. Will set back originial before exit.

```js
const win = require('win32');
win.prepareCodePage();
```

### isVolume(command)

Determines is `command` is volume:

```js
const win = require('win32');
win.isVlume('c:\\');
// returns on windows
true
```

### isChangeVolume(command)

Determines is `command` is changing of `volume`:

```js
const win = require('win32');
win.isChangeVolume('c:');
// returns
true
```

## Environments

In old `node.js` environments that not fully supports `es2015`, `win32` could be used with:

```js
var win = require('win32/legacy');
```

## License

MIT

