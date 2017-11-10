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
    "xdojo/has!host-node?dojo/node!mime",
    "xdojo/has!host-node?dojo/node!glob",
    "xdojo/has!host-node?dojo/node!flop",
    "xdojo/has!host-node?dojo/node!yargs-parser"

], function(dcl,ProtocolBase,EventedMixin,net,util,events,has,utils,module,fs,_path,mime,glob,flop,yargs){

    if(!ProtocolBase){
        return dcl(null,{});
    }
    return dcl([ProtocolBase], {
        onMessage:function(data){
        },
        connect:function(){
            this.owner.onConnected();
        },
        _size:function(size){
            var isNumber    = typeof size === 'number',
                l1KB        = 1024,
                l1MB        = l1KB * l1KB,
                l1GB        = l1MB * l1KB,
                l1TB        = l1GB * l1KB,
                l1PB        = l1TB * l1KB;

            if (isNumber) {
                if      (size < l1KB)   size = size + 'b';
                else if (size < l1MB)   size = (size / l1KB).toFixed(2) + 'kb';
                else if (size < l1GB)   size = (size / l1MB).toFixed(2) + 'mb';
                else if (size < l1TB)   size = (size / l1GB).toFixed(2) + 'gb';
                else if (size < l1PB)   size = (size / l1TB).toFixed(2) + 'tb';
                else                    size = (size / l1PB).toFixed(2) + 'pb';
            }

            return size;
        },
        toObject:function(path){

            try {
                var result = fs.statSync(path, function (error) {

                });

                var _mime = mime.lookup(path);
                var isDirectory = result.isDirectory();
                return {
                    path: path,
                    sizeBytes: result.size,
                    size: isDirectory ? 'Folder' : this._size(result.size),
                    owner: result.uid,
                    group: result.gid,
                    mode: result.mode,
                    isDir: isDirectory,
                    directory: isDirectory,
                    mime: _mime,
                    name: _path.win32.basename(path),
                    fileType: isDirectory ? 'folder' : 'file',
                    modified: result.mtime.getTime() / 1000
                };
                return result;
            }catch(e){
                return {
                    path: path,
                    sizeBytes: 0,
                    size: 0 ,
                    owner: 0,
                    group: 0,
                    mode: 0,
                    directory: false,
                    mime: 'unknown',
                    name: _path.win32.basename(path),
                    fileType: 'file',
                    modified: 0
                };
            }
        },
        _send:function(data,command,options){
            options = options || {params:{}};
            options.params = options.params || {};
            var wait = options.params ? options.params.wait : true;
            var self = this;
            var outString = JSON.stringify(utils.mixin({
                command:command
            },data,null,2));

            if(wait) {
                self.owner.onFinish(command,options,new Buffer(outString));
            }else{
                self.owner.onData(outString, new Buffer(outString));
            }
        },
        ls:function(path,options){
            var self = this;
            var _options = {};
            var isWin       = process.platform === 'win32';
            this.isDebug() && console.log('ls path : ' + path + ' win= '+isWin);
            if(path ==='/*' && isWin){
                var out = [];
                flop.read('/', function(error, data) {
                    _.each(data.files,function(item){
                        out.push({
                            path: '/' + item.name + ':',
                            sizeBytes: 0,
                            size: 0 ,
                            owner: 0,
                            group: 0,
                            mode: 0,
                            directory: true,
                            mime: 'unknown',
                            name: item.name,
                            fileType: 'folder',
                            modified: 0,
                            drive:true
                        })
                    });
                    self._send({
                        files:out
                    },'ls',options);
                });
                return;
            }

            var _root = "";

            if (isWin) {
                if(path.length===5){//   /C:/*
                    var _parts = path.split(':/');
                    if(_parts.length==2){
                        _root = _parts[0][1] + ":/";
                        _options = {
                            root:_root
                        };
                        path = "/*"
                    }
                }else{
                    var _parts = path.split(':/');
                    if(_parts.length==2){
                        _root = _parts[0][1] + ":/";
                        _options = {
                            root:_root
                        };
                        path = '/' + _parts[1];
                    }
                }
            }
            function pathFromWin(current, root) {

                if(!current){
                    return "";
                }

                if (isWin && (!root || root === '/')) {

                    current = '/' + current
                        //.replace(':', ':/')
                            .replace(/\\/g, '/');
                } else {
                    current = _path.join(root, current);
                }

                return current;
            }


            glob(path, _options, function (er, files) {
                if(!_.isArray(files)){
                    files = [files];
                }
                var out = [];
                _.each(files,function(file){
                    var object = self.toObject(file);
                    if(isWin && object && object.path) {
                        object.path = pathFromWin(object.path);
                    }
                    if(!file){
                        console.error('invalid file path');
                    }else {
                        object.realPath = _path.resolve(file);
                        object && out.push(object);
                    }
                });
                self._send({
                    files:out
                },'ls',options);
            });
        },
        get:function(path,options){
            try {
                if (!fs.statSync(path)) {}
            }catch(e){
                console.error('path doesnt exists '+path);
                return;
            }
            var self = this;
            var content = utils.readFile(path);
            self._send({
                content:content
            },'get',options);
        },
        write:function(data,options){
            var intArray = utils.bufferFromDecString(data);
            var buffer = new Buffer(intArray);
            var str = buffer.toString();
            var args = yargs(str,{array:true});
            var cmd = args['_'][0];
            delete  args['_'];
            args = _.values(args);
            if(typeof this[cmd]==='function'){
                args.push(options);
                return this[cmd].apply(this,args);
            }
        },
        send:function(data){
            //console.log('send : ',data);
        }
    });
});

