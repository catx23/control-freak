define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "xide/mixins/ReloadMixin",
    "xide/mixins/EventedMixin",
    "xide/utils",
    'xide/Wizards',
    'xide/views/CIView',
    "davinci/ve/metadata"
    //"dojo/i18n"
    //'xide/wizard/WizardPaneBase',//WizardPaneBase    
], function (declare,lang,ReloadMixin, EventedMixin,utils,Wizards,CIView,Metadata) {
    
    var result = declare('xideve.xblox.Wizards', [EventedMixin,ReloadMixin], {
        createCISPane:function(CIS,where,args){
            var _args = {
                viewStyle: 'padding:0px;height:auto;',
                options: {
                    groupOrder: {
                        'General': 0,
                        'Advanced': 1,
                        'Description': 2
                    }
                },
                cis: CIS,
                wizard:where
            };

            if(args){
                lang.mixin(_args,args);
            }
            return utils.addWidget(CIView,_args,this, where, true, null, [WizardPaneBase]);
        },
        createWizard:function(title,CIS){
            /**
             * setup
             *
             * 1. create the dialog,
             * 2. create wizard
             * 3. add panes
             *
             *
             */
            var wizardStruct = Wizards.createWizard(title,false);
            this._lastWizard=wizardStruct;

            var wizard = wizardStruct.wizard;
            var dialog = wizardStruct.dialog;


            if(CIS) {
                var ciView = utils.addWidget(CIView, {
                    viewStyle: 'padding:0px;',
                    options: {
                        groupOrder: {
                            'General': 0,
                            'Advanced': 1,
                            'Description': 2
                        }
                    },
                    cis: CIS
                }, this, wizard, true, null, [WizardPaneBase]);
                //ciView.initWithCIS(CIS);
            }
            /*
            dialog.show().then(function(){
                //dialog.resize();
            });
            */
            return wizardStruct;

        },
        onReloaded: function () {
            console.log('wizard reloaded');
        },
        /**
         *
         * @param widget {davinci/ve/DeliteWidget}
         * @param block {xblox/model}
         * @param variable {xblox/model/variables/Variable}
         */
        initWithVariable:function(widget,block,variable,blockInput,updateCB){
            
            var wizardStruct = this.createWizard('Variable Wizard');
            var dialog = wizardStruct.dialog;
            var wizard = wizardStruct.wizard,
                CIS_0,CIS_1;

            /**
             * @type {xblox/RunScript}
             */
            var proxy = widget.domNode;

            var onDone = function(){
                var mode = CIS_0[0].value;
                var newSettings = {
                    sourceevent:'onDriverVariableChanged',
                    targetproperty:CIS_1[0].value,
                    mode:mode
                };

                if(mode==1){
                    newSettings["targetevent"]="";
                }
                updateCB(newSettings);
                wizard.destroy();
                dialog.hide().then(function(){
                    utils.destroy(dialog);
                });
                proxy.onSettingsChanged(newSettings);
            };

            CIS_0 = [
                utils.createCI('Scope', 3, 'system_drivers', {
                    "options": [
                        {
                            label: 'Update a widget property when its value changed',
                            value: 1
                        },
                        {
                            label: 'User',
                            value: 'user_drivers'
                        }

                    ],
                    value:proxy.mode!=null ? proxy.mode : 1,
                    widget:{
                        "class":"xide.form.Radio"
                    }
                })
            ];

            //mode
            var CSIVIEW_0 = this.createCISPane(CIS_0,wizard,
                {
                    inserts: [{
                        query: '.dijitDialogPaneContent',
                        insert: '<div><span class="wizardPaneText">What you want to do with the variable' + '?</span></div>',
                        place: 'first'
                    }],
                    _checkPass:function(){
                        return true;
                    }

                }
            );


            CIS_1 = [
                utils.createCI('', 13, 'widgetProperty', {
                    value:proxy.targetproperty,
                    widget:{
                        showLabel:false
                    }
                })
            ];
            var CSIVIEW_1 = this.createCISPane(CIS_1,wizard,{
                    inserts: [{
                        query: '.dijitDialogPaneContent',
                        insert: '<div><span class="wizardPaneText">Which property you want to update' + '?</span></div>',
                        place: 'first'
                    }],
                    canGoBack:true,
                    _checkPass:function(){
                        return true;
                    },
                    doneFunction:function(){
                        onDone();
                    }
                }
            );

            CSIVIEW_0.isLastChild=false;
            CSIVIEW_1.isLastChild=true;

            wizard._checkButtons();
            dialog.show().then(function(){
                dialog.resize();

            });

            this.initReload();
        }
    });

    result.prototype.instance = new result();
    result.prototype.instance.initReload();
    //warm up meta
    Metadata.getSmartInput('xblox/RunScript');
    return result;
});