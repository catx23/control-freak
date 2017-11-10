/** @module deliteful/Combobox/ComboPopup */
define([
    "delite/register",
    "delite/handlebars!./popup.html",
    "deliteful/Combobox/ComboPopup"
], function (register,template,ComboPopup) {
    return register("d-combo-popup2", [ComboPopup], /** @lends module:deliteful/Combobox/ComboPopup# */ {
        baseClass: "d-combo-popup2",
        template:template
    });
});
