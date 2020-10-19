/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @Autor ROBERTO VELASCO LARIOS
 * @NModuleScope Public
 * @Company INDAR
 * @NModuleScope Public
 *
*/


    define(['SuiteScripts/INDAR SCRIPTS/httpService',"N/runtime",'N/record','N/file'], function (httpService,runtime,record,file) {

    var exports = {};
    function afterSubmit(scriptContext) {
        notifySupervisor(scriptContext);
    }


    function notifySupervisor(scriptContext) {

        if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE) {

        var viejo = scriptContext.oldRecord;
       
          var nuevo = record.load({ type: viejo.type, id: viejo.id });

     
                
                    var valoresFactura = {};
                    var tamaño        = nuevo.getLineCount( { sublistId: 'item' } );
                    var lineas          = [];
                    for ( var i = 0 ; i < tamaño ; i++) {

                       
                            log.error('item',Number(nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } )));
                            log.error('commited', nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantitycommitted' } ));

                    
                    return;
                 
                }
    }
        return;
    }

    function iguales(viejo,nuevo)
    {
        var UUIDNuevo= nuevo.getValue({fieldId : 'custbody_uuid'});
            var UUIDviejo=viejo.getValue({fieldId : 'custbody_uuid'});
       //  var UUIDNuevo= nuevo.getValue({fieldId : 'custbody_fe_uuid_cfdi_33'});
       //     var UUIDviejo=viejo.getValue({fieldId : 'custbody_fe_uuid_cfdi_33'});
            if(UUIDviejo==UUIDNuevo)
            return true;
            else return false;
    }
    exports.afterSubmit = afterSubmit;
    return exports;
});
