## Description

The block reads JSON data from a file  



## Parameters

**Enabled**

Field Name : "enabled"

Type : Boolean

Remarks:
 
 - If disabled at run-time, it will stop the block and cancels also the interval timer.

<hr/>


**Path**

Field Name : "path"

Type : String

Description : An absolute path. This path must exist on the device server.


<hr/>


**Select**

Field Name : "jsonPath"

Type : String

Description : A path within the data. If set, the selected data will be forwarded to child blocks.

For instance, if the data is:
```json
{
    "boolean":true,
    "number":10.0,
    "array":[1,2,3],
    "myField":"my field value"
}
```

You can select the value of "myField" by using 'myField' which returns my field value. 
 
You can select the second field of "array" by using 'array.2' which returns 2.


<hr/>


**Tips**:

In child blocks you can retrieve the data by using "return arguments[0]".
 
