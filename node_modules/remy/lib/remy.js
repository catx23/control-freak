(function() {
    'use strict';
    
    var fs      = require('fs'),
        path    = require('path'),
        util    = require('util'),
        findit  = require('findit'),
        assert  = require('assert'),
        rimraf  = require('rimraf'),
        Emitter = require('events').EventEmitter;
        
    util.inherits(Remy, Emitter);
        
    module.exports = function(from, files) {
        var emitter;
        
        assert(typeof from === 'string', 'from should be string!');
        
        if (!files) {
            files   = [
                path.basename(from)
            ];
            
            from    = path.dirname(from);
        }
        
        emitter = new Remy(from, files);
        
        return emitter;
    };
    
    function Remy(from, files) {
        var self            = this;
        
        this._i             = 0;
        this._files         = [];
        this._dirs          = [];
        
        this._percent       = 0;
        this._percentPrev   = 0;
        
         this._parallel(from, files, function() {
            var filesCount  = self._files.length,
                dirsCount   = self._dirs.length;
                
            self._n = filesCount + dirsCount;
            
            self._rmAll();
        });
    }
    
    Remy.prototype._parallel  = function(from, files, callback) {
        var self    = this,
            i       = files.length,
            fn      = function() {
                if (!--i)
                    callback();
            };
        
        files.forEach(function(name) {
            var full = path.join(from, name);
            
            self._findFiles(full, fn);
        });
    };
    
    Remy.prototype.continue   = function() {
        this._pause = false;
        this._rmAll();
    };
    
    Remy.prototype.pause      = function() {
        this._pause = true;
    };
    
    Remy.prototype.abort      = function() {
        this._files = [];
        this._dirs  = [];
        
        this._rmAll();
    };
    
    Remy.prototype._rmAll     = function() {
        var self    = this,
            
            rmFn    = self._rmOneFile,
            toFull,
            rmEmitter,
            
            name    = this._files.shift();
        
        ++this._i;
        
        if (!name) {
            name    = this._dirs.shift();
            rmFn    = self._rmOneDir;
        }
        
        if (!name) {
            self.emit('end');
        } else {
            rmEmitter   = rmFn(name);
            
            rmEmitter.on('error', function(error) {
                self._progress();
                self.emit('error', error, toFull, self._i);
            });
            
            rmEmitter.on('end', function() {
                self._progress();
                
                self.emit('file', toFull, self._i);
                
                if (!self._pause)
                    self._rmAll();
            });
        }
    };
    
    Remy.prototype._findFiles = function(filename, fn) {
        var self        = this,
            
            finder      = findit(filename),
            
            onError     = function(error) {
                self._files.push(error.path);
            },
            
            onFile      = function(name) {
                self._files.push(name);
            },
            
            onDir       = function(name) {
                self._dirs.push(name);
            };
        
        finder.on('file', onFile);
        finder.on('error', onError);
        finder.on('directory', onDir);
        finder.on('link', onFile);
        
        finder.on('end', function() {
            fn();
        });
    };
    
    Remy.prototype._rmOneFile = function(name) {
        var emitter     = new Emitter();
        
        fs.unlink(name, function(error) {
            if (error)
                emitter.emit('error', error);
            else
                emitter.emit('end');
        });
        
        return emitter;
    };
    
    Remy.prototype._rmOneDir  = function(name) {
        var emitter     = new Emitter();
        
        rimraf(name, function(error) {
            if (error && error.code !== 'ENOENT')
                emitter.emit('error', error);
            else
                emitter.emit('end');
        });
        
        return emitter;
    };
    
    Remy.prototype._progress  = function() {
        var value;
        
        value = Math.round(this._i * 100 / this._n);
        
        this._percent = value;
        
        if (value !== this._percentPrev) {
            this._percentPrev = value;
            this.emit('progress', value);
        }
    };
})();
