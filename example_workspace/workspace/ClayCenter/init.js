require([
    'xapp/manager/Context',
    'require',
    'dcl/dcl',
    "xide/utils",
    "delite/popup",
    "deliteful/Combobox",
    "deliteful/list/List",
    "dstore/Memory",
    "xide/types"
], function (Context, require, dcl, utils, popup, Combobox, List, Memory, types) {

    var context = null;

    Context.notifier.subscribe('onContextReady', function (_context) {

        context = _context;
        Context.notifier.subscribe('DevicesConnected', function (evt) {

            var deviceManager = context.getDeviceManager();

            function createPickerPopup(button, picker, Popup) {
                var value = [];
                var _popup;

                /**
                 * callback when ok
                 */
                function ok() {
                    console.log('ok ', picker._selection[0].path);
                    utils.destroy(picker);
                    utils.destroy(_popup);
                }


                var dataSource = new Memory({idProperty: "label", data: []});
                var list = new List({source: dataSource, righttextAttr: "value"});
                var combo = new Combobox({
                    list: list,
                    id: "combo-single",
                    selectionMode: 'single'
                });

                var gridNode = picker.domNode;

                _popup = new Popup({
                    /**
                     * Called when clicking the OK button of the popup.
                     * @protected
                     */
                    okHandler: function () {
                        this.combobox._validateMultiple(this.combobox.inputNode);
                        this.combobox.closeDropDown();
                        popup.close(button.popup);
                        ok();
                    },

                    /**
                     * Called when clicking the Cancel button of the popup.
                     * @protected
                     */
                    cancelHandler: function () {
                        this.combobox.list.selectedItems = this.combobox._selectedItems;
                        this.combobox.closeDropDown();
                        popup.close(button.popup);
                        console.log('cancel');
                        utils.destroy(picker);
                        utils.destroy(_popup);
                    },
                    combobox: combo
                });


                //extend button
                utils.mixin(button, {
                    popup: _popup,
                    _setLabelAttr: function (label) {
                        this.textContent = label;
                        this._set("label", label);
                    },
                    closePopup: function () {
                        if (this.open) {
                            popup.close(this.popup);
                            this.open = false;
                        }
                    },
                    _deactivatedHandler: function () {
                        //this.closePopup();
                    },
                    _openPopup: function () {

                        $(combo.list).css('height', '1000px');
                        $(combo.list).css('width', '2000px');
                        $(combo.list).empty();
                        $(combo.list).append(gridNode);
                        this._openRet = popup.open({
                            popup: this.popup,
                            parent: this,
                            around: this,
                            orient: ['center'],
                            maxHeight: -1
                        });

                        this.open = true;

                        picker._parent = combo.list;

                        $(gridNode).css('height', '100%');
                        $(gridNode).css('width', '100%');

                        function refreshGrid(fileGrid) {
                            fileGrid.collection._loadPath('.', true).then(function () {
                                fileGrid.refresh();
                            });
                        }

                        setTimeout(function () {
                            refreshGrid(picker.leftGrid);
                            setTimeout(function () {
                                refreshGrid(picker.rightGrid);
                            }, 1000);
                        }, 1000);
                    }
                });
                button.on("delite-deactivated", function () {
                    button._deactivatedHandler();
                });
                button._openPopup();


            }

            window['openPlaylists'] = function (button) {

                var variable = $(button).attr('variable');

                console.log('open popup with variable ' + variable);

                var targetVariable = $(button).attr('targetVariable');
                var targetLabel =  $($(button).attr('targetText'));

                console.log('use target label : ',targetLabel);

                require(["xdeliteful/Widgets/Popup"], function (Popup) {

                    //grab app context

                    //device manager
                    var deviceManager = context.getDeviceManager();

                    //flow variables for onOk
                    var deviceName = "ShowSource";
                    var sourceVariable = variable;
                    var targetCommand = "PlayList";

                    //device instance
                    var instance = deviceManager.getInstanceByName(deviceName);
                    if (!instance) {
                        console.error('cant find device instance ' + deviceName);
                        return;
                    }
                    var blockScope = instance.blockScope;
                    var playListVariable = blockScope.getVariable(sourceVariable);
                    if (!playListVariable) {
                        console.error('cant find variable Playlists');
                        return;
                    }

                    //build combo-box list data
                    var data = utils.getJson(playListVariable.value);
                    var playListData = [];
                    _.each(data, function (item) {
                        playListData.push({
                        	label: item.name,
                        	value: item.index
                        });
                    });
                    var dataSource = new Memory({idProperty: "label", data: playListData});
                    var list = new List({source: dataSource});
                    var combo = new Combobox({
                        list: list,
                        id: "combo-single",
                        selectionMode: 'single'
                    });


                    /**
                     * callback when ok
                     */
                    function ok() {
                        var value = combo.value;
                        if (value && value[0]) {
                            //set driver variable without network updates
                            var _item = list.selectedItems[0].__item;
                            var _value = _item.value;
                            instance.setVariable(targetVariable, _value, true,true,true);
                            targetLabel[0].innerHTML = value[0];
                            console.log('set variable '+_value,value);
                            //instance.callCommand(targetCommand);
                        }
                    }

                    //extend button
                    utils.mixin(button, {
                        popup: new Popup({
                            /**
                             * Called when clicking the OK button of the popup.
                             * @protected
                             */
                            okHandler: function () {
                                this.combobox._validateMultiple(this.combobox.inputNode);
                                this.combobox.closeDropDown();
                                popup.close(button.popup);
                                ok();

                            },

                            /**
                             * Called when clicking the Cancel button of the popup.
                             * @protected
                             */
                            cancelHandler: function () {
                                this.combobox.list.selectedItems = this.combobox._selectedItems;
                                this.combobox.closeDropDown();
                                popup.close(button.popup);
                            },
                            combobox: combo
                        }),
                        _setLabelAttr: function (label) {
                            this.textContent = label;
                            this._set("label", label);
                        },
                        closePopup: function () {
                            if (this.open) {
                                popup.close(this.popup);
                                this.open = false;
                            }
                        },
                        _deactivatedHandler: function () {
                            this.closePopup();
                        },
                        _openPopup: function () {
                            this._openRet = popup.open({
                                popup: this.popup,
                                parent: this,
                                around: this,
                                orient: ['center'],
                                maxHeight: -1
                            });
                            this.open = true;
                        }
                    });
                    button.on("delite-deactivated", function () {
                        button._deactivatedHandler();
                    });
                    button._openPopup();
                });
            };
        });
    });
});