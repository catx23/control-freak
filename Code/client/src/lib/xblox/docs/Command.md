## Description

The command block is meant for holding a string to be send to a device. 



## Parameters

**Enabled**

Field Name : "enabled"

Type : Boolean

Remarks:
 
 - If disabled at run-time, it will stop the block and cancels also the interval timer.

<hr/>


**Send on Startup**

If true, this block will be executed when the device is connected. 

Field Name: "startup"
  
Type: Boolean

<hr/>

**Interval**

If greater than 0, the block will be looped by that interval in ms.

Field Name: "interval"
  
Type: Boolean

<hr/>


**Has Response**

Some protocols like the built-in SSH return standard execution marks, like std-error, std-data. 
When this setting is on, the system will mark the command as running but not finished. 
As soon such command receives and "end" from the server, it will mark the command as finished and proceeds
with sub blocks. 

Field Name: "waitForResponse"
  
Type: Boolean

<hr/>

**Flags**


*"Dont parse"* : will send the string in "Send" as is. 

*"Expression"* : This flag is on by default! When on, the string in "Send" will be treated and evaluated as Javascript. 
     

Field Name: "flags"
  
Type: integer

*Remarks*:
 
 -When "Expression" is on, it will replace variables in "Send"
 
 -When "Expression" is on, it will add "return" in front of what's in "Send" if missing


<hr/>

