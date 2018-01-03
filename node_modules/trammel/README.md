# Trammel

Get directory size.

## Example

```js
var trammel = require('trammel');

trammel('.', function(error, size) {
    console.log(error, size);
    //undefined '58.47kb'
});

trammel('.', {type: 'raw'}, function(error, size) {
    console.log(error, size);
    //undefined 59974
});

trammel('do not exist', {stopOnError: true}, function(error, size) {
    if (error)
        console.error(error.message);
    else
        console.log(size);
});

```

## License

MIT
