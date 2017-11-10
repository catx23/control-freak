define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/json',

    'xide/utils',
    'xide/utils/StringUtils',
    'xide/utils/HTMLUtils',
    'xide/utils/StoreUtils',
    'xide/utils/WidgetUtils',
    'xide/utils/CIUtils',
    'xide/utils/ObjectUtils',
    /***
     * XFILE
     */

    'xfile/types',
    /***
     * XIDE
     */

    'xide/types',
    'xide/types/Types',


    'xide/factory',
    'xide/factory/Objects',
    'xide/factory/Events',
    'xide/factory/Clients',

    /***
     * XCF
     */
    'xcf/model/ModelBase',
    'xcf/model/Command',
    'xcf/model/Variable',
    'xcf/factory/Blocks',
    'xcf/types',
    'xcf/types/Types',
    /**
     * XBLOX
     */
    'xblox/types/Types',
    'xaction/types',
    'xconsole/types'

],function(declare)
{
    Array.prototype.remove= function(){
        var what, a= arguments, L= a.length, ax;
        while(L && this.length){
            what= a[--L];
            if(this.indexOf==null){
                break;
            }
            while((ax= this.indexOf(what))!= -1){
                this.splice(ax, 1);
            }
        }
        return this;
    };
    Array.prototype.swap = function (x,y) {
        var b = this[x];
        this[x] = this[y];
        this[y] = b;
        return this;
    };

    if (!Array.prototype.indexOfPropertyValue){
        Array.prototype.indexOfPropertyValue = function(prop,value){
            for (var index = 0; index < this.length; index++){
                if (this[index][prop]){
                    if (this[index][prop] == value){
                        return index;
                    }
                }
            }
            return -1;
        }
    }

    if ( typeof String.prototype.startsWith != 'function' ) {
        String.prototype.startsWith = function( str ) {
            return this.substring( 0, str.length ) === str;
        }
    }

    if ( typeof String.prototype.endsWith != 'function' ) {
        String.prototype.endsWith = function( str ) {
            return this.substring( this.length - str.length, this.length ) === str;
        }
    }

    // Cheap polyfill to approximate bind(), make Safari happy
    Function.prototype.bind = Function.prototype.bind || function(that){ return dojo.hitch(that, this);};
    window['xlog']=function(what){

        try{
            console.log(what);
        }catch(e){

        }
    };
    window['xwarn']=console.warn;
    window['xerror']=console.error;
    window['xtrace']=console.trace;
    return declare("xide.XIDECommons", null,{});
});
