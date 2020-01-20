define(["N/ui/dialog"], function (dialog) {

    /**
     * Provides click handler for custom button on Employee
     *
     * @exports ess/add-button/cl
     *
     * @copyright 2018 Stoic Software, LLC
     * @author ROBERTO VELASCO <rvelasco@indar.com.mx>
     *
     * @NApiVersion 2.x
     * @NScriptType ClientScript
     * @appliedtorecord INVENTORY_ITEM
     */
    var exports = {};
        var Articulo;
    function pageInit(context) {
        // TODO
        Articulo=context;
    }

    function onButtonClick() {
        dialog.alert({
            title: "Hello",
            message: Articulo
        });
    }

    exports.onButtonClick = onButtonClick;
    exports.pageInit = pageInit;
    return exports;
});

