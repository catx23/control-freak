/** @module xdeliteful/Script */
define([
    "dcl/dcl",
    "delite/register",
    'xide/mixins/EventedMixin',
    "delite/theme!xdeliteful/Script.css"
], function (dcl, register,EventedMixin) {

    var SCRIPT = dcl([EventedMixin.dcl], /** @lends module:delite/Widget# */ {
        type:"none",
        declaredClass: 'xblox/Script',
        _script:null,
        name:null,
        hasChildNodes:function(){
            return true;
        },
        getChildrenData:function(){
            return [this._script];
        },
        getContent:function(){
            return this._script;
        },
        /**
         * when restoring from createWidget in Maqetta
         * @param data
         */
        fromWidgetData:function(data){
            if(data && data.children && data.children[0]){
                this.setScript(data.children[0]);
            }
        },
        setScript:function(script){
            if(script) {
                delete this._function;
                delete this._script;
                this.innerHTML = "";
                this._function = new Function("{" + script + "; }");
                this._script = script;
            }
        },
        getFunction:function(){
            return this._function;
        },
        attachedCallback:function () {
            this.setScript(this.innerHTML);
        },
        createdCallback: function () {
            // Get label from innerHTML, and then clear it since we are to put the label in a <span>
            this.setScript(this.innerHTML);
        }
    });
    return register("d-script", [HTMLElement,SCRIPT]);
});

