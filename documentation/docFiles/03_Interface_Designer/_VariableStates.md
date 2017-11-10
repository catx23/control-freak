### Mapping variable changes to widget states

#### Introduction

Consider a simple button:
 
```html
 
<button label="myButton' label="Test"> </button>

```

Now, if you want to link a variable's value to a widget property like "state", the interface designer wizard 
will create a binding element for you which set's the widget property "state" to the variables value: 

```html

<button label="myButton' label="Test">
    
    <d-xscript bidirectional="false" 
            mode="1" 
            targetproperty="state" 
            sourceevent="onDriverVariableChanged"
            sourceeventvaluepath="item.value" 
            sourceeventnamepath="item.name"
            block="variable://deviceScope=user_devices&amp;device=bc09b5c4-cfe6-b621-c412-407dbb7bcef8&amp;driver=9db866a4-bb3e-137b-ae23-793b729c44f8&amp;driverScope=user_drivers&amp;block=74e15697-d98e-a96b-f57f-6b8199ed7ca1"/>
    
</button>

```

Every time the variable changes, it will set the widget property "state" to the variable's value.

Now lets add some states which add CSS classes: 

```html
    
    <button label="PlayState" state="1">
    
    <d-xscript bidirectional="false" 
        mode="1" 
        targetproperty="state" 
        sourceevent="onDriverVariableChanged"
        sourceeventvaluepath="item.value" 
        sourceeventnamepath="item.name"
        block="variable://deviceScope=user_devices&amp;device=bc09b5c4-cfe6-b621-c412-407dbb7bcef8&amp;driver=9db866a4-bb3e-137b-ae23-793b729c44f8&amp;driverScope=user_drivers&amp;block=74e15697-d98e-a96b-f57f-6b8199ed7ca1"/>
        
    <d-xstate-css name="1" cssClass="state_1"></d-xstate-css>
    <d-xstate-css name="2" cssClass="state_2"></d-xstate-css>
        
    
    </button>

```

As soon the variable's value is 1, it will activate the state with the name "1". In this case, it's adding the CSS class "state_1" to the button.


#### Rejecting state selection for variable changes

There are moments where you don't want to apply a state when the variable changes. This can be done with the "accept" function. Such expression
can be defined as part of the <d-xscript> binding element to our variable.

```html
    
<button label="PlayState" state="1">
    
    <d-xscript .... accept="accept">
        
        <d-script name="accept">
            
            var value = arguments[0];       //variable value 
            return value ==1  || value ==2;
            
        </d-script>
            
    </d-xscript>
                
        
    <d-xstate-css name="1" cssClass="state_1"></d-xstate-css>
    
</button>

```

#### Transforming variable value to another state name

Sometimes a variable may not have very friendly values or at least values which can't be used as state name.
In this case you can "transform" or map a variable value to a state name. For this you can define a transform function: 


For example, we want to activate the state named "another state" when our variable value is "foo";


```html
    
<button label="PlayState" state="1">
    
    <d-xscript .... transform="transform">
        
        <d-script name="transform">
            
            var value = arguments[0];       //variable value
            
            if(value === "foo"){
                return "another state";
            }
            
            return null; //return nothing if you want let the default behaviour take place
            
        </d-script>
            
    </d-xscript>
                
        
    <d-xstate-css name="1" cssClass="state_1"></d-xstate-css>
    <d-xstate-css name="another state" cssClass="anotherStateClassName"></d-xstate-css>
    
</button>

```

