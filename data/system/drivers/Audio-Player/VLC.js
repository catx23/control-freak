define([
    "dcl/dcl",
    "xdojo/has!host-node?nxapp/protocols/ProtocolBase",
    "dojo/has",
    "xide/utils",
    "dojo/node!path",
    "xdojo/has!host-node?nxapp/utils/FileUtils",
    "xdojo/has!host-node?dojo/node!vlc-ffi/vlc",
    "xdojo/has!host-node?dojo/node!yargs-parser"
], function (dcl,ProtocolBase,has, utils,_path, FileUtils, vlc, yargs) {


    var isIDE = has('xcf-ui');
    var Module = null;
    //No ProtocolBase means we're running on client side
    if (!ProtocolBase) {
        //create dummy module
        Module = dcl(null, {});
    }

    /**
     * Function to implement optional Command Interface.
     * @param Module
     */
    function patchModule(Module){
        //////////////////////////////////////////////////////////
        //
        //  Optional: An example implementation to modify the string sent to a advice. This makes sense if you added additional fields as shown above.
        //
        /**
         * Callback when a command is before parsing the expression in the "send" field.
         * @param command {module:xcf/model/Command}
         * @param inputString {string}
         * @returns {string}
         */
         Module.resolveBefore = function (command,inputString) {
             return inputString;
         };
        /**
         * Callback when a command was parsing the expression in the "send" field.
         * @param command {module:xcf/model/Command}
         * @param inputString {string}
         * @returns {string}
         */
        /*
         Module.resolveAfter = function (command,inputString) {
         console.log('resolve after: ' + inputString);
         return inputString;
         };
         */
    }

    //////////////////////////////////////////////////////////
    //
    //  Optional: An example implementation to extend commands in the interface for additional fields in the command properties.
    //
    if(isIDE) {
        /**
         *
         * @param command {module:xcf/model/Command}
         * @param fields {Object[]}
         */
        /*
         Module.getFields = function (command, fields) {
         return [utils.createCI('test',0,command.test,{
         group:'General',
         title:'asdasd',
         dst:'test',
         order:198
         })];
         };
         */
    }

    //we're in client mode, return dummy module with patches.
    if(!ProtocolBase){
        patchModule(Module);
        return Module;
    }

    Module = dcl([ProtocolBase], {
        _player: null,
        connect: function () {
            this.owner.onConnected();
        },
        _send: function (data, command, options) {
            var wait = options.params.wait;
            var self = this;

            var outString = JSON.stringify(utils.mixin({
                command: command
            }, data, null, 2));

            if (wait) {
                self.owner.onFinish(command, options, new Buffer(outString));
            } else {
                self.owner.onData(outString, new Buffer(outString));
            }
        },
        _sendProgress: function (data, command, options) {
            var self = this;
            var outString = JSON.stringify(utils.mixin({
                command: command
            }, data, null, 2));

            self.owner.onProgress(command, options, new Buffer(outString));
        },
        _sendPaused: function (data, command, options) {
            var self = this;
            var outString = JSON.stringify(utils.mixin({
                command: command
            }, data, null, 2));

            self.owner.onPaused(command, options, new Buffer(outString));
        },
        sendStopped: function (data, command, options) {
            var self = this;
            var outString = JSON.stringify(utils.mixin({
                command: command
            }, data, null, 2));

            self.owner.onStopped(command, options, new Buffer(outString));
        },

        volume: function (path, vol, options) {
            var playData  = this.getPlayer(path,options,false);
            if(playData){
                playData.player.setVolume(vol);
                this.sendUpdate(playData,options);
            }else{
                console.warn("VLC -> set position: cant find player for "+path );
            }
        },
        sendUpdate:function(playData,options){
            this._sendProgress({
                file: playData.media.path,
                duration: playData.media.duration,
                position: playData.player.position,
                muted:playData.muted,
                volume:playData.player.getVolume(),
                repeat:playData.repeat,
                index:playData.list ? playData.current : -1,
                count:playData.list ? playData.list.count() : -1
            }, 'play', options);
        },
        mute: function (path, mute, options) {
            var playData  = this.getPlayer(path,options,false);
            if(playData){
                var _muted = mute =='on';
                _muted && (playData._lastVolume = playData.player.getVolume());
                playData.muted = mute;
                if(_muted){
                    playData._lastVolume = playData.player.setVolume(0);
                }else{
                    playData.player.setVolume(playData._lastVolume || 100);
                }

                this.sendUpdate(playData,options);

            }else{
                console.warn("VLC -> set position: cant find player for "+path );
            }
        },
        repeat: function (path, repeat, options) {
            var playData  = this.getPlayer(path,options,false);
            if(playData){
                playData.repeat = repeat;
                this.sendUpdate(playData,options);
            }else{
                console.warn("VLC -> set position: cant find player for "+path );
            }
        },
        getVLC: function () {
            return new vlc([
                '-I', 'dummy',
                '-V', 'dummy',
                //'-vvvv', 'dummy',
                //'--verbose', '1',
                '--no-video-title-show',
                '--no-disable-screensaver',
                '--no-snapshot-preview',
                '--ignore-config'
            ]);
            if (!global['__vlcInstance']) {
                global['__vlcInstance'] = new vlc([
                    '-I', 'dummy',
                    '-V', 'dummy',
                    //'-vvvv', 'dummy',
                    //'--verbose', '1',
                    '--no-video-title-show',
                    '--no-disable-screensaver',
                    '--no-snapshot-preview',
                    '--ignore-config'
                ]);
            }
            return global['__vlcInstance'];
        },
        next: function (path, options) {

            var playData = this.getPlayer(path, options, false);
            if (playData) {

                playData.current += 1;
                if (playData.current > playData.list.count()) {
                    playData.current = 0;
                }
                playData.isManual = true;
                var newMedia = playData.list.at(playData.current);
                if (newMedia) {
                    playData.player.media = newMedia;

                    playData.media = newMedia;

                    this.sendUpdate(playData,options);
                    if(playData.module && playData.soundcard) {
                        playData.player.setOut(outmodule,soundcard);
                    }
                    playData.player.play();

                } else {
                    console.error('cant find media at ' + playData.current);
                }
            } else {
                console.error('cant get player for ' + path);
            }

        },
        prev: function (path, options) {

            var playData = this.getPlayer(path, options, false);
            if (playData) {
                playData.current -= 1;
                if (playData.current < 0) {
                    playData.current = 0;
                }
                playData.isManual = true;
                var newMedia = playData.list.at(playData.current);
                if (newMedia) {

                    playData.player.media = newMedia;
                    playData.media = newMedia;
                    if(playData.module && playData.soundcard) {
                        playData.player.setOut(outmodule,soundcard);
                    }
                    playData.player.play();
                    this.sendUpdate(playData,options);
                } else {
                    console.error('cant find media at ' + playData.current);
                }

            } else {
                console.error('cant get player for ' + path);
            }

        },
        shuffle: function (path, options) {

            var playData = this.getPlayer(path, options, false);
            if (playData) {
                if(playData.list){
                    playData.list._list.shuffle();
                }
            } else {
                console.error('cant get player for ' + path);
            }

        },
        pos:function(path,position,options){
            var playData  = this.getPlayer(path,options,false);
            if(playData){
                playData.player.position = position;
                this.sendUpdate(playData,options);

            }else{
                console.warn("VLC -> set position: cant find player for "+path );
            }
        },
        diagnose:function(){
            try {
                var vlc = this.getVLC();
                vlc.diagnose();
                vlc.release();
            }catch(e){
                console.error(e);
            }

        },
        getPlayer: function (path, options, create) {
            var id = "" + path;
            if (!this._player) {
                this._player = {};
            }
            var self = this;
            if (!this._player[id] && create !== false) {
                var _vlc = this.getVLC();
                _vlc.releasePlayer();
                var player = null;
                var media = null;
                var mediaList = false;

                var files = null;

                //individual file selection
                if(id.indexOf('http')!==-1){
                    media = _vlc.mediaFromUrl(id);
                    player = _vlc.mediaplayer;
                    player.media = media;
                }else {

                    var parts = path.indexOf(';') !== -1 ? path.split(';') : null;

                    if (parts && parts.length > 0) {
                        files = parts;
                        files = [];
                        _.each(parts, function (part) {
                            files.push({
                                realPath: part
                            });
                        });

                    } else {
                        files = FileUtils.ls(_path.normalize(path));
                    }

                    if (_.isArray(files)) {
                        mediaList = _vlc.mediaList();
                        _.each(files, function (item) {
                            var media = _vlc.mediaFromFile(item.realPath);
                            if (media) {
                                mediaList.add(media);
                            } else {
                                console.warn("invalid media : " + item.realPath);
                            }
                        });

                        media = mediaList.at(0);
                        player = _vlc.mediaplayer;
                        player.media = media;
                    } else {
                        media = _vlc.mediaFromFile(path);
                        player = _vlc.mediaplayer;
                        player.media = media;
                    }

                }
                var struct = {
                    player: player,
                    isPlaying: false,
                    error: null,
                    path: path,
                    id:id,
                    media: media,
                    vlc: _vlc,
                    list: mediaList,
                    duration: media.duration,
                    current: 0,
                    repeat:'off',
                    muted:'off',
                    release: function () {
                        try {
                            clearInterval(this.poller);
                            delete this.poller;
                            if(this.isFinished!==true){
                                this.vlc.releasePlayer();
                            }
                            if(this.media && this.media.release){
                                this.media.release();
                            }
                            if(this.isFinished === true && this.vlc){
                                try {
                                    //this.vlc.release();
                                }catch(e){
                                    console.error(e);
                                }
                            }
                            delete this.vlc;
                            delete this.media;
                            delete this.player;
                            delete self._player[id];
                        } catch (e) {
                            console.error('error releasing player', e);
                        }
                    }
                };


                function creatPoller(_player) {
                    clearInterval(struct.poller);
                    struct.poller = setInterval(function () {
                        if (struct.isPaused || struct.isStopped || struct.isFinished) {
                            return;
                        }

                        self.sendUpdate(struct,options);

                    }, 2000);
                }

                this._player[id] = struct;

                function wirePlayer(player) {
                    player.on('Stopped', function (e) {
                        if (struct.player.songEnded) {
                            return;
                        }
                        try {
                            var outString = JSON.stringify(utils.mixin({
                                command: 'play'
                            }, {
                                file: path
                            }, null, 2));
                            self.owner.onStopped('play', options, new Buffer(outString));
                        } catch (e) {
                            console.error('error ', e);
                        }
                        struct.release();
                    });

                    player.on('Paused', function (e) {
                        self._sendPaused({
                            file: path,
                            duration: media.duration,
                            position: player.position
                        }, 'play', options);
                    });

                    player.on('EndReached', function (e) {
                        struct.isFinished = true;
                        if (struct.list) {
                            var next = struct.current + 1;

                            //reached the end
                            if (next == struct.list.count()) {

                                //we're in repeat mode so we are setting back the index
                                if(struct.repeat==='on'){
                                    setTimeout(function(){
                                        struct.current = -1;
                                        var _player = _vlc.createPlayer();
                                        struct.player = _player;
                                        wirePlayer(_player);
                                        creatPoller(_player);
                                        self.next(id, options);
                                        struct.isFinished = false;
                                    },100);
                                    return;
                                }

                                struct.isFinished = true;
                                struct.release();
                                self._send({
                                    file: id,
                                    duration: 0,
                                    position: 1
                                }, 'play', options);
                                return;

                            }
                            setTimeout(function() {
                                var _player = _vlc.createPlayer();
                                struct.player = _player;
                                wirePlayer(_player);
                                creatPoller(_player);
                                self.next(id, options);
                                struct.isFinished = false;
                            }, 100);
                            return;
                        }
                        self._send({
                            file: path,
                            duration: media.duration,
                            position: player.position
                        }, 'play', options);
                        struct.release();
                    });
                }

                wirePlayer(player);
                creatPoller(player);
            }
            return this._player[id];
        },
        play: function (path,outmodule,soundcard) {
            var id = "" + path;

            var options = arguments.length > 2 ? arguments[arguments.length-1] : arguments[1];

            if(path.indexOf('http')==-1) {
                path = FileUtils.resolve(path);
            }

            if (!path) {
                this.debug() && console.error('Cant play +' + id + " : path doesnt exists!");
                return;
            }
            this.isDebug () && console.log('play audio : ' + path, options.params);
            var stop = options && options.params ? options.params.stop === true  : false;
            if(stop){
                var _p = this.getPlayer(id, options,false);
                if(!_p){
                    return;
                }
            }

            var playData = this.getPlayer(id, options);
            if(!playData){
                console.error('cant find a player for '+id);
                return;
            }
            var player = playData.player;
            if (playData.isPaused === true) {
                playData.isPaused = false;
                player.play();
                return;
            }
            if (options.params.pause === true) {
                player.pause();
                playData.isPaused = true;
                return;
            }

            if (options.params.stop === true) {
                playData.isStopped = true;
                playData.isFinished = true;
                playData.player.stop();
                playData.release();
                return;
            }


            if (playData.isPaused === true) {
                player.pause();
                playData.isPaused = false;
                return;
            }

            if (playData.isPlaying) {
                return;
            }
            //player.test();
            if(outmodule && soundcard) {
                player.setOut(outmodule,soundcard);
                playData.module = outmodule;
                playData.soundcard = soundcard;
            }
            player.play();
            this.sendUpdate(playData,options);
            playData.isPlaying = true;
        },
        write: function (data, options) {
            var intArray = utils.bufferFromDecString(data);
            var buffer = new Buffer(intArray);
            var str = buffer.toString();
            this.isDebug() && console.log('write : ' + str, options.params);
            var args = yargs(str,{array:true});
            var cmd = args['_'][0];
            delete  args['_'];
            args = _.values(args);
            if (typeof this[cmd] === 'function') {
                args.push(options);
                return this[cmd].apply(this, args);
            }
        },
        send: function (data) {
            this.isDebug() && console.log('send : ', data);
        },
        destroy: function () {
            this._player && _.each(this._player, function (item) {
                item.release();
            });
            delete this._player;
        }
    });

    patchModule(Module);
    return Module;

});

