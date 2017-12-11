var ref = require('ref');

var lib = require('./libvlc');
var util = require('./util');

var TrackInfo = require('./libvlc_types').TrackInfo;
var MediaStats = require('./libvlc_types').MediaStats;
var EventPtr = require('./libvlc_types').EventPtr;

var metaName = require('./media_enum').metaName;
var metaEnum = require('./media_enum').metaEnum;
var state = require('./media_enum').state;

var EventEmitter = require('events').EventEmitter;
var ffi = require('ffi');

var MediaList = module.exports = function (parent) {
  var self = this;
  var released = false;
  this.parent = parent;
  this._list = [];
  this.instance = lib.libvlc_media_list_new(parent);
  this.release = function () {
    if (!released) {
      lib.libvlc_media_list_release(self.instance);
      released = true;
    }
  };

  this.count = function () {
    return lib.libvlc_media_list_count(self.instance);
  };

  this.media = function(){
    var _m = lib.libvlc_media_list_media(self.instance);
    console.error('media pointer : ',_m);
    return _m;
  };

  this.at = function(index){
    return this._list[index];
  };

  this.add = function (media) {
    var m = lib.libvlc_media_list_add_media(self.instance,media.instance);
    this._list.push(media);
    return m;
  };
  
};
require('util').inherits(MediaList, EventEmitter);
