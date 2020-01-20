/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @Company Indar
 * @Author Roberto Velasco 
 * @external define
 */

define( [ 'SuiteScripts/INDAR SCRIPTS/httpService','N/error', 'N/log', 'N/runtime', 'N/file' ],
        function(httpService, error, log, runtime, file) {

    function createJSON( context ) {//arterSubmit
        if(context.type != context.UserEventType.CREATE){ return true; }

        try {
            var currentRecord = context.newRecord;

            var itemReceiptObj = {
                id                            : currentRecord.getValue({fieldId: 'id'}),
                type                          : currentRecord.getValue({fieldId: 'type'}),
                createddate                   : currentRecord.getValue({fieldId: 'createddate'}),
                tranid                        : currentRecord.getValue({fieldId: 'tranid'}),
                createdfrom                   : currentRecord.getValue({fieldId: 'createdfrom'}),
                location                      : currentRecord.getValue({fieldId: 'location'}),
                items                         : [],
                expenses                      : [],
            }


            var itemCount = currentRecord.getLineCount( { sublistId: 'expense' } );
            for ( var i = 0 ; i < itemCount ; i++) {
                itemReceiptObj.items.push( {
                   account   : currentRecord.getSublistValue( { sublistId: 'expense', line: i, fieldId: 'account' } ),
                   memo      : currentRecord.getSublistValue( { sublistId: 'expense', line: i, fieldId: 'memo' } ),
                   amount    : currentRecord.getSublistValue( { sublistId: 'expense', line: i, fieldId: 'amount' } ),
                   orderline : currentRecord.getSublistValue( { sublistId: 'expense', line: i, fieldId: 'orderline' } ),
                });
            }

            var itemCount = currentRecord.getLineCount( { sublistId: 'item' } );
            for ( var i = 0 ; i < itemCount ; i++) {
                itemReceiptObj.expenses.push( {
                   line                : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'line' } ),
                   orderline           : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'orderline' } ),
                   itemreceive         : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itemreceive' } ),
                   item                : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } ),
                   itemtype            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itemtype' } ),
                   isnoninventory      : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'isnoninventory' } ),
                   itemdescription     : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itemdescription' } ),
                   itemunitprice       : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itemunitprice' } ),
                   itemquantity        : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itemquantity' } )                  
                });
            }

            
            var json=JSON.stringify(itemReceiptObj);
            httpService.post('api/Inventory/ItemReceipt', json );

            

        }  catch ( ex ){
            log.error( ex );
            var fileDescription = 'Archivo .json pra la inegración Recepcion de Articulos';
            var archivo = generaArchivo( JSON.stringify(itemReceiptObj), currentRecord.getValue( { fieldId : 'tranid' } ) );
        }
    }

     function generaArchivo( contenido, nombreArchivo, description) {

        var fileObjPDF = null,
            fileObj = file.create( {
                name:        nombreArchivo + '.json',
                fileType:    file.Type.PLAINTEXT,
                contents:    contenido,
                description: description,
                encoding:    file.Encoding.UTF8,
                folder:      67,
                isOnline:    true
            });
        return fileObj.save();
    }

    return {
        afterSubmit: createJSON
    };
});