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
], function (Context, require, dcl,utils,popup,Combobox, List, Memory,types) {

    var context = null;
    var fileServerDeviceInstance = null;
    var StoreClass = null;

    console.log('app module loaded2x');
    

    Context.notifier.subscribe('onContextReady', function (_context) {
        console.error('context ready');
        context = _context;
        Context.notifier.subscribe('DevicesConnected', function (evt) {
            var deviceManager = context.getDeviceManager();
            var deviceName = "File-Server";
            //device instance
            var instance = deviceManager.getInstanceByName(deviceName);
            if (!instance) {
                return;
            }
            fileServerDeviceInstance = instance;
            console.log('got file-server instance');
            function createStore(ext){
                var config = {};
                var options = {
                    fields: types.FIELDS.SHOW_ISDIR |
                    types.FIELDS.SHOW_OWNER |
                    types.FIELDS.SHOW_SIZE |
                    types.FIELDS.SHOW_FOLDER_SIZE |
                    types.FIELDS.SHOW_MIME |
                    types.FIELDS.SHOW_PERMISSIONS |
                    types.FIELDS.SHOW_TIME |
                    types.FIELDS.SHOW_MEDIA_INFO
                };

                return new StoreClass({
                    data: [],
                    config: config,
                    mount: 'none',
                    options: options,
                    driver: fileServerDeviceInstance,
                    glob:ext,
                    micromatch:"!(*.*)" // Only folders
                });
            }
            function createPopup(button,fileGrid) {


                var value = [];
                var _popup;
                /**
                 * callback when ok
                 */
                function ok() {
                    //var value = combo.value;
                    if (value && value[0]) {
                        //set driver variable without network updates
                        //instance.setVariable(targetVariable, value[0], false, false, false);
                        //instance.callCommand(targetCommand);
                    }
                    console.log('ok');
                    utils.destroy(fileGrid);
                    utils.destroy(_popup);
                }


                var dataSource = new Memory({idProperty: "label", data: []});
                var list = new List({source: dataSource, righttextAttr: "value"});
                var combo = new Combobox({
                    list: list,
                    id: "combo-single",
                    selectionMode: 'single'
                });
                var gridNode = fileGrid.template.domNode;
                _popup =  new Popup({
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
                        utils.destroy(fileGrid);
                        utils.destroy(_popup);
                    },
                    combobox: combo
                });
                //extend button
                utils.mixin(button, {
                    popup:_popup,
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

                        $(combo.list).css('height','600px');
                        $(combo.list).css('width','800px');
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

                        fileGrid._parent = combo.list;

                        $(gridNode).css('height','100%');
                        $(gridNode).css('width','100%');



                        //fileGrid.resize();
                        setTimeout(function(){
                            fileGrid.refresh().then(function(){
                                fileGrid.collection._loadPath('.',true).then(function(){
                                    fileGrid.refresh();
                                    fileGrid.showColumn("0",true);
                                    fileGrid.showColumn("1",true);
                                });
                                //fileGrid._showColumn(1);
                            });


                            $(gridNode).css('height','100%');
                        },1000);

                    }
                });
                button.on("delite-deactivated", function () {
                    button._deactivatedHandler();
                });
                button._openPopup();


            }
            function createPickerPopup(button,picker,Popup) {
                var value = [];
                var _popup;
                /**
                 * callback when ok
                 */
                function ok() {
                    console.log('ok ',picker._selection[0].path);
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

                _popup =  new Popup({
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
                    popup:_popup,
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

                        $(combo.list).css('height','600px');
                        $(combo.list).css('width','800px');
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

                        $(gridNode).css('height','100%');
                        $(gridNode).css('width','100%');

                        function refreshGrid(fileGrid){
                            fileGrid.collection._loadPath('.',true).then(function(){
                                fileGrid.refresh();
                            });
                        }

                        setTimeout(function() {
                            refreshGrid(picker.leftGrid);
                            setTimeout(function() {
                                refreshGrid(picker.rightGrid);
                            },1000);
                        },1000);
                    }
                });
                button.on("delite-deactivated", function () {
                    button._deactivatedHandler();
                });
                button._openPopup();


            }
            window['openFolderPicker'] = function(button){

                require(['xfile/build/xfiler'],function(){
                    require([
                        "workspace_user/Widgets/Popup",
                        'xfile/views/FileGridLight',
                        'xide/utils',
                        'xfile/data/DriverStore',
                        'xide/types',
                        'dojo/Deferred',
                        'xide/_Popup',
                        'xfile/views/FilePicker',
                        "dojo/_base/declare",
                        "requirejs-dplugins/css!../../../css/xfile/main_lib.css"
                    ], function (Popup,FileGridLight, utils, DriverStore, types,Deferred,_Popup,FilePicker,declare) {

                        _Popup.setStartIndex(2000);

                        var config = {};
                        var options = {
                            fields: types.FIELDS.SHOW_ISDIR |
                            types.FIELDS.SHOW_OWNER |
                            types.FIELDS.SHOW_SIZE |
                            types.FIELDS.SHOW_FOLDER_SIZE |
                            types.FIELDS.SHOW_MIME |
                            types.FIELDS.SHOW_PERMISSIONS |
                            types.FIELDS.SHOW_TIME |
                            types.FIELDS.SHOW_MEDIA_INFO
                        };
                        //device manager
                        var deviceManager = context.getDeviceManager();

                        var deviceName = "File-Server";
                        //device instance
                        fileServerDeviceInstance = deviceManager.getInstanceByName(deviceName);

                        StoreClass = DriverStore;
                        var owner = {};
                        var permissions =utils.clone(types.DEFAULT_FILE_GRID_PERMISSIONS);
                        var picker = utils.addWidget(FilePicker,utils.mixin({
                            ctx: context,
                            owner: owner,
                            selection: '.',
                            resizeToParent: true,
                            storeOptionsMixin: {
                                "includeList": "*,.*",
                                "excludeList": ""
                            },
                            Module: FileGridLight,
                            permissions: permissions,
                            leftStore:createStore("/*"),
                            rightStore:createStore("/*")
                        },{}),this,$('#root')[0],true);

                        createPickerPopup(button,picker,Popup);

                    });
                });


            };
            //openFolderPicker($('#picker')[0]);
        });
    });
});