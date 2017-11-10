define([
    "dcl/dcl",
    "xdojo/has!host-node?nxapp/protocols/ProtocolBase",
    "xide/mixins/EventedMixin",
    "dojo/node!net",
    "dojo/node!util",
    "dojo/node!events",
    "dojo/has",
    "xide/utils",
    "module",
    "dojo/node!fs",
    "dojo/node!path",
    "xdojo/has!host-node?dojo/node!player",
    "xdojo/has!host-node?dojo/node!musicmetadata",
    "xdojo/has!host-node?dojo/node!mp3-duration",
    "xdojo/has!host-node?nxapp/utils/FileUtils"
], function(dcl,ProtocolBase,EventedMixin,net,util,events,has,utils,module,fs,_path,Player,musicmetadata,mp3Duration,FileUtils){

    if(!ProtocolBase){
        return dcl(null,{});
    }


// create a new parser from a node ReadStream 
    return dcl([ProtocolBase], {
        connect:function(){
            this.owner.onConnected();
        },
        _send:function(data,command,options){
            var wait = options.params.wait;
            var self = this;

            var outString = JSON.stringify(utils.mixin({
                command:command
            },data,null,2));

            if(wait) {
                console.log('send : ',outString);
                self.owner.onFinish(command,options,new Buffer(outString));
            }else{
                self.owner.onData(outString, new Buffer(outString));
            }
        },
        _sendProgress:function(data,command,options){
            var self = this;
            var outString = JSON.stringify(utils.mixin({
                command:command
            },data,null,2));

            self.owner.onProgress(command,options,new Buffer(outString));
        },
        _player:null,
        volume:function(path,vol,options){

            vol = parseFloat(vol);
            
            path = FileUtils.resolve(path);
            if(!path){
                console.error('player doesnt exists');
            }

            var playData = this.getPlayer(path,options);
            var player = playData.player;

            console.log('set volume : '+path + ' : ' + vol + ' l = ' + arguments.length);

            player.setVolume(vol);

        },
        getPlayer:function(path,options){
            if(!this._player){
                this._player = {};
            }

            var self = this;


            if(!this._player[path]){

                var player = new Player(path);

                var struct = {
                    player:player,
                    isPlaying:false,
                    error:null,
                    path:path
                };

                this._player[path] = struct;

                player.on('playing',function(item){
                    struct.isPlaying = true;
                    console.log('is playing');
                    /*
                    var parser = musicmetadata(fs.createReadStream(path),{ duration: true },function (err, metadata) {
                        if(err){
                            console.log('error meta data ',err);
                        }
                        console.log('meta data ' , metadata);
                    });
                    */

                    mp3Duration(path, function (err, duration) {
                        if (err) return console.log(err.message);
                        console.log('Your file is ' + duration + ' seconds long');
                        self._sendProgress({
                            file:path,
                            end:false,
                            duration:duration
                        },'play',options);
                    });
                });

                player.on('playend',function(item){
                    // return a playend item
                    console.log('src:' + item + ' play done, switching to next one ...');
                    struct.isPlaying = false;
                    self._send({
                        file:path,
                        end:true
                    },'play',options);
                });

                player.on('error', function(err){
                    // when error occurs
                    console.log('error '  + err);
                    struct.error = err;
                    self._send({
                        file:path,
                        end:true
                    },'play',options);
                    delete self._player[path];
                });


            }

            return this._player[path];
        },
        play:function(path,options){
            path = FileUtils.resolve(path);
            if(!path){
                console.error('player doesnt exists');
            }

            console.log('play audio : '+path,options.params);

            var playData = this.getPlayer(path,options);
            var player = playData.player;
            
            if(options.params.stop===true){
                player.stop();
                delete this._player[path];
                return;
            }


            if(options.params.pause===true){
                player.pause();
                playData.isPaused=true;
                return;
            }

            if(playData.isPaused===true){
                player.pause();
                playData.isPaused=false;
                return;
            }

            if(playData.isPlaying){
                console.log('already playing '+playData.isPaused);
                return;
            }
            var self = this;
            player.play(function(err, player){
                self._send({},'play',options);
            });
        },
        write:function(data,options){



            var intArray = utils.bufferFromDecString(data);
            var buffer = new Buffer(intArray);
            var str = buffer.toString();


            console.log('write : '+str,options.params);

            var parts = str.split(' ');
            if(!parts.length){
                return;
            }
            var cmd = parts[0];

            if(typeof this[cmd]==='function'){
                parts.shift();
                parts.push(options);
                return this[cmd].apply(this,parts);
            }
        },
        send:function(data){
            console.log('send : ',data);
        },
        destroy:function(){
            this._player && _.each(this._player,function(item){
              //console.log(' destroy',item);
                item.player.stop();
            });
            delete this._player;
        }
    });
});

