# x-dojo

Fixes and extensions for a custom and maintained dojo-1.x version. 
This will make it work in cross-environments and is for my own private usage, fitted to me needs.

## Notes:

You can also use the original Dojo version. I changed only a few things: 

 - use Electron's require if found
 - If you want read things from a module which is meant for Node.JS only(using for instance dojo/node!net) on the client side:
   it will noob out all dojo/node!... dependencies. This is done in Dojo's Node.JS plugin 'dojo/node'.
   Why ? Because I am storing some meta data but also some interface implementations inside modules.
   

## Installation

    git clone https://github.com/gbaumgart/x-dojo.git

## Usage


```js
    
    var path = require('path');
    
    //pass absolute path to your client library root in the first arg, and in the second the absolute path to your server
    //side only packages
    var amdRequire = require('./x-dojo/dojo-require')(path.resolve('../../Code/client/src/lib/'),path.resolve('.'));
    
    //at this point:
    // - dojo is loaded with a configuration defined in dojo/dojo-require
    // - there is the dojoRequire defined in global which is the original Dojo's require
    // - there is a little wrapper 'amdRequire' defined in global
    
    //now you can write: 
    
    var someModule = amdRequire('foo/bar');
    

    
```


