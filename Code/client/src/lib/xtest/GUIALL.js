define([
    'dojo/_base/declare',
    "dojo/dom-geometry",
    "dojo/dom-construct",
    "dojo/dom-style",
    'xide/factory/Widgets',
    'xide/factory/Views',
    'xide/widgets/FileEditor',
    'xide/form/FilterSelect',
    'xide/views/CIView',
    'xide/views/_Dialog',
    'xide/views/_CIDialog',
    'xide/layout/Container',
    'xide/layout/_Accordion',
    'xide/layout/_TabContainer'
],function(declare,domGeometry, domConstruct, domStyle)
{
    if(!dojo.place){
        dojo.place = domConstruct.place;
    }

    if(!dojo.create){
        dojo.create = domConstruct.create;
    }

    return declare("xtest.GUIALL", null,{});
});