/** @module deliteful/TabBar */
define([
    "dcl/dcl",
    "delite/register",
    "delite/Widget",
    "xblox/RunScript",
    'xide/mixins/EventedMixin',
    "delite/handlebars!./MediaPlayer/template.html",
    "requirejs-dplugins/jquery!attributes/classes",
    "requirejs-dplugins/has",
    "delite/handlebars",
    "delite/Template",
    "deliteful/ToggleButton",
    "xdeliteful/Button",
    "xblox/RunScript",
    "deliteful/Slider"
], function (dcl, register,Widget,RunScript,EventedMixin,template, $,has,handlebars,Template) {

    var MediaPlayer = dcl([Widget,EventedMixin.dcl], /** @lends module:delite/Widget# */ {
        baseClass: "d-media-player",
        template:template,
        context:null,
        vlc:null,
        fileServer:null,
        declaredClass:'delite/MediaPlayer',
        allowAudio:true,
        allowVideo:false,
        getDriverInstance:function(name){
            var deviceManager = this.context.getDeviceManager();
            //device instance
            return deviceManager.getInstanceByName(name);
        },
        onPickedFolder:function(selection){

            var vlc = this.vlc;
            if(!vlc){
                console.error('can`t get VLC driver, abort');
                return;
            }

            var cmd = vlc.getCommand('Play Args');
            var item = selection[0];
            if(selection.length>1){
                var _items = _.pluck(selection,'realPath');
                var items = [];
                _.each(_items,function(path){
                    items.push(path.replace(/\\/g, '/'));
                });
                cmd.stop();
                vlc.setVariable("Current Folder",items.join(';'));
                vlc.callCommand('Play Args');
                return;

            }

            item = item || {isDir:true};

            var path = item.realPath;
            path = path  || "/home/mc007/Music/Sasha/";
            path = path.replace(/\\/g, '/');
            if(item.isDir) {
                //path += '/*.mp3';
                path+='/+(*.mp3|*.wav|*.m4a|*.wma)';
            }
            vlc.setVariable("Current Folder",path);
            vlc.callCommand('Play Args');
        },
        initFilePicker:function(){

            var thiz  = this;
            var btn = this.btnOpenFolder;
            var _r = require;
            _r(['xfile/build/xfiler'], function () {
                _r([
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
                    "requirejs-dplugins/css!../../../build/xfile/xfile.min.css"
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

                        var match = thiz.allowAudio ? "(*.m4a)|(*.wav)|(*.mp3)|(*.wma)" : "";
                        if(thiz.allowVideo){
                            thiz.allowAudio && (match+="|");
                            match+="(*.avi)|(*.mp4)|(*.mkv)";
                        }
                        match+="|!(*.*)";
                        return new DriverStore({
                            data: [],
                            config: config,
                            mount: 'none',
                            options: options,
                            driver: thiz.fileServer,
                            glob: ext,
                            _micromatch: "(*.m4a)|(*.wav)|(*.mp3)|(*.wma)|!(*.*)", // Only folders
                            micromatch: match // Only folders
                        });
                    }
                    _Popup.setStartIndex(2000);
                    var owner = {};
                    var permissions = utils.clone(types.DEFAULT_FILE_GRID_PERMISSIONS);
                    function createPickerPopup(button,picker,Popup) {
                        var value = [];
                        var _popup;

                        /**
                         * callback when ok
                         */
                        function ok() {
                            var selection = picker._selection || [{isDir:true}];
                            console.log('ok ',selection[0]);
                            utils.destroy(picker);
                            utils.destroy(_popup);
                            thiz.onPickedFolder(selection);                        }

                        

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
                                picker.startup();
                                $(gridNode).css('height','100%');
                                $(gridNode).css('min-width','100%');

                                picker.resize();
                                function refreshGrid(fileGrid,collection){

                                    picker.resize();
                                    picker.resize();
                                }
                                
                                setTimeout(function() {
                                    picker.rightGrid.collection._loadPath('/',true).then(function(){
                                        picker.rightGrid.refresh();
                                        setTimeout(function(){
                                            picker.leftGrid.select(0,null,true,{
                                                append:false,
                                                focus:true,
                                                delay:10
                                            });
                                        },200);
                                    });
                                },100);
                            }
                        });
                        button.on("delite-deactivated", function () {
                            button._deactivatedHandler();
                        });
                        button._openPopup();
                    }

                    $(btn).on('click',function(){
                        var picker = utils.addWidget(FilePicker, utils.mixin({
                            ctx: thiz.context,
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
                        }, {}), this, $('BODY')[0], false);

                        $(picker.domNode).addClass('MediaPlayerFilePicker');

                        $(picker.domNode).css('height','600px');

                        createPickerPopup(btn, picker, Popup);
                    });

                });
            });
        },
        initVLC:function(){
        },
        wireWidgets:function(){
            var self = this;
            var vlc = self.vlc;
            if(!vlc) {
                return;
            }
            //wire slider to position
            $(this.slider).on('change',function(e){
                if(self._lastPos ===e.target.value){
                    return;
                }
                self._lastPos = e.target.value;
                var settings = {
                    override:{
                        args:[e.target.value]
                    }
                };
                vlc.callCommand('Position',settings);
            });

            $(this.mute).on('click',function(e){

                var settings = {
                    override:{
                        args:[self.mute.checked ? 1 : 0]
                    }
                };
                console.log('changed mute : ',settings);
                vlc.callCommand('Mute',settings);

            });

            $(this.volume).on('change',function(e){
                if(self._lastVol ===e.target.value){
                    return;
                }
                self._lastVol = e.target.value;

                var settings = {
                    override:{
                        args:[e.target.value]
                    }
                };
                console.log('changed volume : ',settings);
                vlc.callCommand('Volume',settings);
            });
        },

        doTemplate:function(){
            var template = $(this).attr('templateId');
            if(template){
                template = $(template);
                if(template[0] && !this._didTemplate){
                    var text = template[0].outerHTML;
                    text = text.replace('display:none','');
                    text = text.replace('pointer-events:none','');
                    var templateDom = handlebars.toDom(text);
                    var requires = templateDom.getAttribute("requires") ||templateDom.getAttribute("data-requires") || "";

                    templateDom.removeAttribute("requires");
                    templateDom.removeAttribute("data-requires");
                    templateDom.removeAttribute("style");
                    var tree = handlebars.parse(templateDom);
                    this.template = new Template(tree).func;
                    this._didTemplate=true;
                }
            }
        },
        attachedCallback:function () {
            var template = $(this).attr('templateId');
            if(template) {
                template = $(template);
                if (template[0]) {
                    this.doTemplate();
                }
            }
        },
        DevicesConnected:function(){
            var vlc = this.getDriverInstance("VLC");
            if(vlc && !this.vlc){
                this.vlc = vlc;
                this.initVLC();
                this.wireWidgets();
            }
            var fileServer = this.getDriverInstance("File-Server");
            if(fileServer && !this.fileServer){
                this.fileServer = fileServer;
                this.initFilePicker();
            }
        },
        onContextReady:function(context){
            this.context = context;
            this.subscribe('DevicesConnected');
        },
        init:function(){
            this.subscribe('onContextReady');
        },
        createdCallback: function () {
            // Get label from innerHTML, and then clear it since we are to put the label in a <span>
            this.doTemplate();
            this.init();
        }
    });

    return register("d-media-player", [HTMLElement,MediaPlayer]);
});

