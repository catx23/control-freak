### States

Widget can have "states" which can contain visual properties and have also a unique name.
 
There is the "**CSS State**" (Palette/xblox/Controls/CSSState). It has to be a child element of a widget and 
it has 2 modes it can operate: 

The **"cssClass" mode** will add a css class to the parent widget when selected: 

```html
    
    <button label="PlayState" state="off">
    
        <d-xstate-css name="off" cssClass="offClass"></d-xstate-css>        
    
    </button>

```

This will set the state "off" on the button and it will add the CSS class "offClass";


The **"inline CSS" mode** will create dynamic CSS to the document, specified in the inner text on the CSS state: 

```html
    
    <button label="PlayState" state="off">
    
        <d-xstate-css name="off" >
            
            .foo{
                color:red;
            }
            
        </d-xstate-css>
        
    
    </button>

```

This will set the state "off" on the button and adds a dynamic CSS class with the declarations "color:red"; 

