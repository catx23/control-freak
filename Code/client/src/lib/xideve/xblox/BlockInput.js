define([
    "dojo/_base/declare",
    "dcl/dcl",
    "davinci/ve/input/SmartInput",
    "dojo/_base/array",
    "dojo/_base/connect",
    "xide/mixins/ReloadMixin",
    "xide/mixins/EventedMixin",
    "./ContainerInput",
    "davinci/Workbench",
    "davinci/ve/widget",
    "xide/types",
    "davinci/ve/commands/ModifyCommand",
    "xide/widgets/TemplatedWidgetBase",
    "xide/views/_Panel",
    "xide/factory",
    "xide/utils"
], function (declare, dcl, SmartInput, array, connect, ReloadMixin, EventedMixin, ContainerInput, Workbench, Widget, types, ModifyCommand,
    TemplatedWidgetBase, _Panel, factory, utils) {


    return declare('xideve.xblox.BlockInput', [SmartInput, EventedMixin], {
        ctx: null,
        /**
         * Called when user dragged the RunScript palette item into the scene.
         *
         * Procedure:
         * 1. analyze the proxied blox script and find outlets which fit into the targets widget's inputs
         * 2. pre-select possible matches in user widget
         * 3.
         *
         *
         * @param widgetId
         */
        /**
         *
         * @param widget {davinci/ve/DeliteWidget}
         * @param proxy {xblox/RunScript}
         * @param variable {xblox/model/variables/Variable}
         */
        initWithVariable: function (widget, proxy, variable) {

            var thiz = this;
            var proxy = widget.domNode;

            function variableWizard(ready) {

                var widgetProp = null;

                var value = "widgetProp";

                var panel = new _Panel({
                    title: 'What you want with the variable ',
                    containerClass: 'CIDialog',
                    options: {
                        "contentSize": {
                            width: '400px',
                            height: '300px'
                        },
                        footerToolbar: [{
                                item: "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                                event: "click",
                                btnclass: "btn btn-danger btn-sm",
                                btntext: " Cancel",
                                callback: function (event) {
                                    event.data.close();

                                }
                            },
                            {
                                item: "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                                event: "click",
                                btnclass: "btn btn-primary btn-sm",
                                btntext: " Ok",
                                callback: function (event) {
                                    ready(widgetProp ? widgetProp.get('value') : null, value);
                                    event.data.close();
                                }
                            }
                        ]
                    },
                    onShow: function (panel, contentNode) {

                        var widget = dcl(TemplatedWidgetBase, {
                            templateString: '<div class="widget" style="padding: 16px">' + factory.radioButtonString(true, "thename", "Update Widget Property", "wRadioWidgetProp") + ' ' + factory.radioButtonString(false, "thename", "Set State with Variable value", "wRadioWidgetState") + '</div>'
                        });

                        var radios = utils.addWidget(widget, {}, null, contentNode, true);

                        function textBox() {
                            utils.destroy(widgetProp);
                            widgetProp = factory.createValidationTextBox(contentNode, "", "Widget Property", "label");
                        }

                        function changed(radio) {
                            value = radio;
                            if (radio === 'widgetProp') {
                                //widgetProp = textBox();
                                widgetProp.set('value', 'label');
                            } else {
                                //utils.destroy(widgetProp);
                                //widgetProp = null;
                                widgetProp.set('value', 'state');
                            }
                        }

                        textBox();
                        radios.$wRadioWidgetProp.on('change', function (val) {
                            changed('widgetProp');
                        });
                        radios.$wRadioWidgetState.on('change', function (val) {
                            changed('widgetState');
                        });
                        return [radios];
                    }
                });

                panel.show();
                return panel;

            }

            variableWizard(function (widgetProp, _mode) {
                var mode = 1; //_mode ==='widgetProp' ? 1 : 2;
                var settings = {
                    sourceevent: 'onDriverVariableChanged',
                    targetproperty: widgetProp,
                    targetevent: "",
                    mode: mode
                };

                if (_mode === 'widgetState') {
                    settings.targetevent = "";
                    settings.targetproperty = "state"
                }
                thiz.updateWidget(settings);
                proxy.onSettingsChanged(settings);
            });

        },
        initWithCommand: function (widget, proxy, command) {

            var thiz = this;
            var proxy = widget.domNode;
            var CIS = [];

            function variableWizard(ready) {
                var widgetProp = null;
                var value = "widgetProp";
                var panel = new _Panel({
                    title: 'To which event you want link the command ?',
                    containerClass: 'CIDialog',
                    options: {
                        "contentSize": {
                            width: '400px',
                            height: '300px'
                        },
                        footerToolbar: [{
                                item: "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                                event: "click",
                                btnclass: "btn btn-danger btn-sm",
                                btntext: " Cancel",
                                callback: function (event) {
                                    event.data.close();

                                }
                            },
                            {
                                item: "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                                event: "click",
                                btnclass: "btn btn-primary btn-sm",
                                btntext: " Ok",
                                callback: function (event) {
                                    ready(widgetProp ? widgetProp.get('value') : null, value);
                                    event.data.close();
                                }
                            }
                        ]
                    },
                    onShow: function (panel, contentNode) {
                        
                        var options = [
                            {label:"onclick", value:"click"},
                            {label:"ondblclick",value:"dblclick"},
                            {label:"onmousedown",value:"mousedown"},
                            {label:"onmouseup",value:"mouseup"},
                            {label:"onmouseover",value:"mouseover"},
                            {label:"onmousemove",value:"mousemove"},
                            {label:"onmouseout",value:"mouseout"},
                            {label:"onkeypress",value:"keypress"},
                            {label:"onkeydown",value:"keydown"},
                            {label:"onkeyup",  value:"keyup"},
                            {label:"onfocus",  value:"focus"},
                            {label:"onblur",  value:"blur"},
                            {label:"onchange",  value:"change"}
                        ];
                        CIS.push(utils.createCI('Event',types.ECIType.ENUMERATION,'click',{
                            group:'General',
                            options:options,
                            title:'Event',
                            widget:{
                                search:true
                            }
                        }));
                        

                        factory.renderCIS(CIS, contentNode, {                            
                        }).then(function (widgets) {                            
                        });
                        return [];
                    }
                });

                panel.show();
                return panel;

            }
            variableWizard(function (widgetProp, _mode) {
                var settings = {
                    targetevent: CIS[0].value,
                    mode: 1
                };
                thiz.updateWidget(settings);
                proxy.onSettingsChanged(settings);
            });

        },
        show: function (widgetId) {
            console.log('show block helper');
            this._widget = Widget.byId(widgetId);
            this.publish(types.EVENTS.ON_SHOW_BLOCK_SMART_INPUT, {
                input: this,
                widget: this._widget
            });

            if (this._widget && this._widget.domNode) {
                if (this._widget.domNode._targetBlock) {
                    var block = this._widget.domNode._targetBlock;
                    if (block.declaredClass == "xcf.model.Variable") {
                        this.initWithVariable(this._widget, block);
                    }

                    if (block.isCommand) {
                        return this.initWithCommand(this._widget, block);
                    }
                } else {
                    console.warn('target widget has no target block!');
                }
            }
        },
        updateWidget: function (settings) {
            var values = settings;
            var context = this._widget.getContext();
            var command = new ModifyCommand(this._widget, values, null, context);
            this._widget._edit_context.getCommandStack().execute(command);
            this._widget = command.newWidget;
            // get the focus on the current node
            this._widget._edit_context._focuses[0]._selectedWidget = this._widget;
            // redraw the box around the
            context.select(this._widget, null, false);
        }
    });
});