#flop

FLOP - Folder operations module.

## Install
For use as application you could use global install.

```
npm i flop -g
```

If you run `flop -h` you will see:

```
flop - folder operations module.
options:
-h, --help - show this message
-r, --read - get directory content
```

Also you can use flop as a module if install with
```
npm i flop
```

## API

### create
Create new directory.

```js
var flop = require('flop');

flop.create('./hello/world/from/flop', function(error, data) {
    console.log(error, data);
});
```

### read
Read content of directory with permisions and sizes.

Parameters:
- path
- type (optional)
- options (optional)
- callback

Posible type:
- raw
- time
- size
- size raw

```js
var flop = require('flop');

flop.read('.', function(error, data) {
    console.log(error, data);
});

flop.read('.', {sort: 'size'}, function(error, data) {
    console.log(error, data);
});

flop.read('.', 'raw', function(error, data) {
    console.log(error, data);
});


flop.read('.', 'time', function(error, data) {
    console.log(error, data);
});

flop.read('.', 'size', function(error, data) {
    console.log(error, data);
});

flop.read('.', 'size raw', function(error, data) {
    console.log(error, data);
});
```
### copy

```js
var flop = require('flop');

flop.copy('from', 'to', function(error) {
    console.log(error);
});
```

### move

```js
var flop = require('flop');

flop.move('from', 'to', function(error) {
    console.log(error);
});
```

### delete

```js
flop.delete('path/to/delete', function(error) {
    console.log(error);
});

flop.delete('path/to/delete', ['folder1', 'folder2'], function(error) {
    console.log(error);
});
```

## License

MIT
