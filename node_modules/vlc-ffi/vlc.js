var os = require('os');
var path = require('path');
var FFI = require('ffi');
var ref = require('ref');


var LIBRARY_PATHS = [];

var _util = require('util');

switch (os.platform()) {
    case 'darwin':
        LIBRARY_PATHS.push('/Applications/VLC.app/Contents/MacOS/lib/libvlc.dylib');
        LIBRARY_PATHS.push(path.join(process.env.HOME, 'Applications/VLC.app/Contents/MacOS/lib/libvlc.dylib'));
        break;
    case 'win32':
        if (process.env['ProgramFiles(x86)']) {
            LIBRARY_PATHS.push(path.join('',
                process.env['ProgramFiles(x86)'],
                'VideoLAN',
                'VLC',
                'libvlc.dll'
            ));
        }
        LIBRARY_PATHS.push(path.join(
            process.env['ProgramFiles'],
            'VideoLAN',
            'VLC',
            'libvlc.dll'
        ));
        break;
    default:
        LIBRARY_PATHS.push('/usr/lib/libvlc.so');
        LIBRARY_PATHS.push('/usr/lib/libvlc.so.5');
        break;
}

exports.LIBRARY_PATHS = LIBRARY_PATHS;

var lib, MediaPlayer, MediaListPlayer, Media, MediaList, VLM;

var VLC = function (args) {
    if (!(this instanceof VLC)) {
        return new VLC(args);
    }

    if (!lib) {
        lib = require('./lib/libvlc').initialize(LIBRARY_PATHS);
        MediaPlayer = require('./lib/mediaplayer');
        Media = require('./lib/media');
        MediaList = require('./lib/media_list');
        MediaListPlayer = require('./lib/media_list_player');
        VLM = require('./lib/vlm');
    }

    if (!args) {
        args = [];
    }

    var mediaplayer, vlm;
    var released = false;

    var cargs = new Buffer(ref.sizeof.pointer * args.length);
    for (var i = 0; i < args.length; i++) {
        cargs.writePointer(ref.allocCString(args[i]), i * ref.sizeof.pointer);
    }

    instance = lib.libvlc_new(args.length, cargs);

    Object.defineProperty(this, 'mediaplayer', {
        get: function () {
            if (!mediaplayer) {
                mediaplayer = new MediaPlayer(instance);
            }
            return mediaplayer;
        }
    });

    this.createPlayer = function () {
        mediaplayer = new MediaPlayer(instance);
        return mediaplayer;
    };

    Object.defineProperty(this, 'mediaListPlayer', {
        get: function () {
            if (!mediaplayer) {
                mediaplayer = new MediaListPlayer(instance);
            }
            return mediaplayer;
        }
    });

    Object.defineProperty(this, 'deviceCount', {
        get: function () {
            var tmp = lib.libvlc_audio_output_device_count(instance, "");
            console.log('outputs : ', _util.inspect(tmp));
            return tmp;
        }
    });

    Object.defineProperty(this, 'vlm', {
        get: function () {
            if (!vlm) {
                vlm = new VLM(instance);
            }
            return vlm;
        }
    });

    this.release = function () {
        try {
            if (!released) {
                if (mediaplayer) {
                    mediaplayer.release();
                }
                if (vlm) {
                    vlm.release();
                }
                lib.libvlc_release(instance);
                released = true;
            }
        } catch (e) {
            console.error('error releasing', e);
        }
    };


    this.printDevices = function (moduleName) {
        try {
            var modCount = lib.libvlc_audio_output_device_count(instance, moduleName);
            console.log('device count for module ' + moduleName, modCount);
            for (var i = 0; i < modCount; i++) {
                console.log('t\ device name: ' + lib.libvlc_audio_output_device_longname(instance, moduleName, i));
            }
        } catch (e) {
            console.error(e);
        }
    };

    this.diagnose = function () {

        console.log('start diagnose');
        this.printDevices('waveout');
        this.printDevices('alsa');
        this.printDevices('ALSA');
        this.printDevices('alsa-audio-device');
        this.printDevices('pulse');
        this.printDevices('PULSE');
    };

    this.getAudioModules = function () {
        var ret = [], tmp, start;
        tmp = start = lib.libvlc_audio_output_list_get(instance);
        while (!tmp.isNull()) {
            tmp = tmp.deref();
            ret.push({
                name: tmp.name,
                description: tmp.description
            });
            tmp = tmp.next;
        }
        lib.libvlc_audio_output_list_release(start);
        console.log('start diagnose',ret);
        return ret;
    }

    this.getAudioDevices = function (name) {
        var ret = [], tmp, start;

        tmp = start = lib.libvlc_audio_output_device_list_get(instance,name);

        if(!tmp){
            console.error('no device');
        }

        while (!tmp.isNull()) {
            //var str = ref.readCString(tmp, 0);
            tmp = tmp.deref();
            //console.log('next ',tmp.inspect());
            //console.log(str);
            for(var prop in tmp){
                //console.log('this : '+prop,tmp[prop]);
            }

            if(tmp) {

                //console.log('enter',tmp.toJSON());
                //console.log(tmp.psz_description);

                //console.log('next ',tmp.device);
                //_util.inspect(tmp.device);
                //console.log('enter 2');
                /*
                ret.push({
                    device: tmp.device,
                    description: tmp.description
                });
                */
            }else{
                console.log('got nothing');
            }
            //console.log('it');
            //return;
            tmp = tmp.p_next;            
        }
        lib.libvlc_audio_output_device_list_release(start);
        console.log('start diagnose',ret);
        return ret;
    };
    
    this.diagnose2 = function () {

        //this.getAudioModules();
        return this.getAudioDevices('alsa');


        var ret = [], tmp, start;

        tmp = start = lib.libvlc_audio_output_list_get(instance);

        while (!tmp.isNull()) {

            tmp = tmp.deref();

            /*
            //console.dir(i);
            var tmp = i.deref();
            //console.dir(tmp);
            //i = i.contents;
            var name = tmp.name;
            var description = tmp.description;
            console.log('---- '+name + ' - ' +description);


            i = tmp.next;
            */
            //var tmp = i.deref();
            //var name = tmp.name;
            //var description = tmp.description;
            //console.log('---- '+name + ' - ' +description);
            /*
            return;
            var devices = [];
            var devs = lib.libvlc_audio_output_device_list_get(instance, name);
            if (devs) {
                var dev = devs;
                console.log("have devices" + " for " + name + ' l ');
                while (dev) {
                    dev = dev.contents;
                    //#log.info("init: aodlg: contents {}".format(dir(dev)))
                    //#devices.append({'device': dev.device, 'description': vlc.bytes_to_str(dev.description)})
                    //print dev.device +  'name description ' + vlc.bytes_to_str(dev.description)
                    dev = dev.next
                }
            }
            i = i.next*/
            ret.push({
                name: tmp.name,
                description: tmp.description
            });
            tmp = tmp.next;
        }
        
        console.log('start diagnose',ret);


        /*
         this.printDevices('waveout');
         this.printDevices('alsa');
         this.printDevices('ALSA');
         this.printDevices('alsa-audio-device');
         this.printDevices('pulse');
         this.printDevices('PULSE');
         */
    };
    Object.defineProperty(this, 'audio_filters', {
        get: function () {
            var ret = [], tmp, start;
            start = tmp = lib.libvlc_audio_filter_list_get(instance);

            while (!tmp.isNull()) {
                tmp = tmp.deref();
                ret.push({
                    name: tmp.psz_name,
                    shortname: tmp.psz_shortname,
                    longname: tmp.psz_longname,
                    help: tmp.psz_help
                });
                tmp = tmp.p_next;
            }

            if (!start.isNull())
                lib.libvlc_module_description_list_release(start);

            return ret;
        }
    });
    this.releasePlayer = function () {
        try {
            if (mediaplayer) {
                mediaplayer.release();
                mediaplayer = null;
            }
        } catch (e) {
            console.error('error releaseing', e);
        }
    };

    this.mediaFromFile = function (path) {
        return new Media(instance, undefined, {path: path});
    };

    this.mediaList = function () {
        return new MediaList(instance);
    };

    this.mediaFromUrl = function (url) {
        return new Media(instance, undefined, {url: url});
    };

    this.mediaFromFd = function (fd) {
        return new Media(instance, undefined, {fd: fd});
    };

    this.mediaFromNode = function (node) {
        return new Media(instance, undefined, node);
    };

    this.mediaFields = require('./lib/media_enum').metaEnum;



    Object.defineProperty(this, 'video_filters', {
        get: function () {
            var ret = [], tmp, start;
            start = tmp = lib.libvlc_video_filter_list_get(instance);

            while (!tmp.isNull()) {
                tmp = tmp.deref();
                ret.push({
                    name: tmp.psz_name,
                    shortname: tmp.psz_shortname,
                    longname: tmp.psz_longname,
                    help: tmp.psz_help
                });
                tmp = tmp.p_next;
            }

            if (!start.isNull())
                lib.libvlc_module_description_list_release(start);

            return ret;
        }
    });

    Object.defineProperty(this, 'version', {
        get: function () {
            return lib.libvlc_get_version();
        }
    });
};

module.exports = VLC;
