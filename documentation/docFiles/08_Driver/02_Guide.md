## <a name="Programming"></a>Programming Overview

### General 

The Control-Freak IDE and Run-time does already some legwork:

- Creating the Javascript class file from a template, ready to be completed by your code. 
- Instantiating the class when a device is referencing this driver
- Cleanup and stop the driver when not needed anymore
- Calling the driver API for each device or system event
- adding useful attributes to the instance like quick access the drivers meta database or more methods to access other drivers, devices and also calling xblox. 

### The Driver base class 


[Please find its API documentation here](./modules/module-xcf_driver_DriverBase.html)

All driver code is written in OOP. The system inherits your driver class automatically 
from a driver base class which provides the most wanted functions. It also enforces a
a strict API (signature) when it comes to device communication but its entirely up to you to you to make use of it.
 

### General Entry Points
 

The most important methods being called by the system are:

- [sendMessage(string,now)](./modules/module-xcf_driver_DriverBase.html#sendMessage)
- [onMessage(data)](./modules/module-xcf_driver_DriverBase.html#-inner-onMessage__anchor)
- [start()](./modules/module-xcf_driver_DriverBase.html#-inner-start__anchor)
- [stop(data)](./modules/module-xcf_driver_DriverBase.html#-inner-stop__anchor)

You may override or complete this methods. If you don't override it, then the methods of the base class will be called. 


### Tools 

There are more utils functions in your driver instance to have direct access to variables, commands or xBlox. Here some of them:

#### Variables


- [getVariable(title)](./modules/module-xcf_driver_DriverBase.html##-inner-getVariable__anchor)
- [setVariable(title,value)](./modules/module-xcf_driver_DriverBase.html##-inner-setVariable__anchor)

#### Commands

- [callCommand('PowerOn')](./modules/module-xcf_driver_DriverBase.html#-inner-callCommand__anchor)

#### xBlox

- runBlock('BlockTitle',args)


