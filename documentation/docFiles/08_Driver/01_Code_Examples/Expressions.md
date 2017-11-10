## General Notes


### Scoping

the **_this_** keyword refers to the scope of execution.

In case its part of a command or an expression (driver console), **this** will be the driver instance.

Each time a device will be connected, its creates an instance of the driver code. Each driver has its own JS code and will be sub classed from a [driver base class](https://github.com/net-commander/default-workspace/blob/master/system/drivers/DriverBase.js). See also the API documentation [here](../modules/module-xcf_driver_DriverBase.html) 

So if your driver code contains a method "doSomething", you can write

```js 
this.doSomething(2) 
 ```

The base driver class contains also methods to send messages to the device.



## Here a number of expressions being used in the console or as command string


### Send hex values

```js

some string x0d

```

will be replaced to
 
```js 
some string \r 
 ```
 
Make sure "Replace Hex" is on

<hr/>

### Using variables

```js

"mv" + [Volume] +"x0d"

```

will be modified to 

```js
return "mv" + this.getVariable("Volume") + "x0d";
```

and evaluates to (Volume variable is set to 60) 

```js
 mv60\r 
```


### Using variables II

```js
var Volume = this.getVariable("Volume");
return "mv" + (Volume + 2) + "x0d";
```

evaluates to (Volume variable is set to 60) 

```js
 mv62\r 
```

Make sure "Replace Hex" and "Expression" is on


