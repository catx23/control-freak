require([
    'xapp/manager/Context',
    'require'
], function (Context, require) {
    var context = null;
    var vlc = null;
    var fileServer = null;
    function getInstance(context, name) {
        var deviceManager = context.getDeviceManager();
        //device instance
        return deviceManager.getInstanceByName(name);
    }


    function onFolderPicked(path,context){

        vlc = getInstance(context, "VLC");
        if(!vlc){
            console.error('have no vlc');
        }

        path = path  || "/home/mc007/Music/Sasha/";
        var cmd = vlc.getCommand('Play Args');
        cmd.stop();
        path = path.replace(/\\/g, '/');
        vlc.setVariable("Current Folder",path + '/*.mp3');
        vlc.callCommand('Play Args');
    }
    
    //subscribe to 'onContextReady' in order to have a valid application context object
    Context.notifier.subscribe('onContextReady', function (_context) {

        //track context
        context = _context;

        //Subscribe to 'DevicesConnected' in order to get a driver instance by name.
        //This gets called multiple times since there multiple device/driver sources (user/system)
        Context.notifier.subscribe('DevicesConnected', function (evt) {

            vlc = getInstance(context, "VLC");
            fileServer = getInstance(context, "File-Server");

            if (fileServer) {
                window['openFolderPicker'] = function (button) {

                    require(['xfile/build/xfiler'], function () {
                        require([
                            "xdeliteful/Widgets/Popup",
                            'xfile/views/FileGridLight',
                            'xide/utils',
                            'xfile/data/DriverStore',
                            'xide/types',
                            'dojo/Deferred',
                            'xide/_Popup',
                            'xfile/views/FilePicker',
                            "dojo/_base/declare",
                            "delite/popup",
                            "deliteful/Combobox",
                            "deliteful/list/List",
                            "dstore/Memory",
                            "requirejs-dplugins/css!../../../css/xfile/main_lib.css"
                        ], function (Popup, FileGridLight, utils, DriverStore, types, Deferred, _Popup, FilePicker, declare,popup,Combobox, List, Memory) {

                            function createStore(ext) {
                                var config = {};
                                var options = {
                                    fields: types.FIELDS.SHOW_ISDIR | types.FIELDS.SHOW_OWNER | types.FIELDS.SHOW_SIZE |
                                    types.FIELDS.SHOW_FOLDER_SIZE |
                                    types.FIELDS.SHOW_MIME |
                                    types.FIELDS.SHOW_PERMISSIONS |
                                    types.FIELDS.SHOW_TIME |
                                    types.FIELDS.SHOW_MEDIA_INFO
                                };

                                return new DriverStore({
                                    data: [],
                                    config: config,
                                    mount: 'none',
                                    options: options,
                                    driver: fileServer,
                                    glob: ext,
                                    micromatch: "!(*.*)" // Only folders
                                });
                            }
                            _Popup.setStartIndex(2000);
                            var owner = {};
                            var permissions = utils.clone(types.DEFAULT_FILE_GRID_PERMISSIONS);
                            var picker = utils.addWidget(FilePicker, utils.mixin({
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
                                leftStore: createStore("/*"),
                                rightStore: createStore("/*")
                            }, {}), this, $('#root')[0], true);


                            function createPickerPopup(button,picker,Popup) {
                                var value = [];
                                var _popup;
                                /**
                                 * callback when ok
                                 */
                                function ok() {
                                    picker._selection = picker._selection || [''];

                                    console.log('ok ',picker._selection[0].realPath,picker._selection[0]);
                                    utils.destroy(picker);
                                    utils.destroy(_popup);
                                    onFolderPicked(picker._selection[0].realPath,context);
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
                            createPickerPopup(button, picker, Popup);
                        });
                    });
                };
            }
        });
    });
});