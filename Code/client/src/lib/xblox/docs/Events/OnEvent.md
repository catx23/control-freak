## Description

This block enables to subscribe to system events. 


## Parameters

**Enabled**

Field Name : "enabled"

Type : Boolean

<hr/>

**Filter Path**


Every event comes with its own payload object and its own structure differs per event. 

This field enables to specify the path to a value inside that payload. This needs be set only if the
 
payload is an object, and not already primitive.


So this field enables you to filter events and the block will only be triggered if *Filter Value* matches the value inside the payload path.

**Example** 

We want to subscribe to "Driver Variable Changed", but only for a certain variable: "Volume".

The event payload object for "onDriverVariableChanged" looks like this: 

```
{
 item:variable
}
```

where the variable object looks like this:

```
{
  value:"variable value",
  name:"Volume"
}
```

To trigger this block only for "Volume", this field needs to be set to: item.name

<hr/>

**Filter Value**

Needs to be set when the block should only trigger if the event payload contains a certain value, specified by "Filter Path" 



**Example** 

We want to subscribe to "Driver Variable Changed", but only for a certain variable: "Volume".

The event payload object for "onDriverVariableChanged" looks like this: 

```
{
 item:variable
}
```

where the variable object looks like this:

```
{
  value:"variable value",
  name:"Volume"
}
```

To trigger this block only for "Volume", this field needs to be set to: "Volume", and the "Filter Path" needs
to be set to "item.name"

<hr/>

**Value Path**

The path to the value to be forward to sub blocks within the payload.

**Example** 

If we want to forward the variable's value to sub blocks, this field needs to be set to "item.value"

For instance, you can access this value in sub blocks with arguments[0];

<hr/>

### Tips:

Attach a Run Script block with this code:

```
console.log(arguments);
```

to see the event payload in the Dev-Tools console

