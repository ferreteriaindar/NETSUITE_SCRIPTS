/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope Public
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERROS
 */
define( ['N/error', 'N/record', 'N/format', 'N/search'], function( error, record, format, search ) {

    var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
        NSO_LOST_PARAMETER: { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }
    };



    handler.post = function (context) {
        try {

            var payment= record.create({
                type: record.Type.CUSTOMER_PAYMENT,
                isDynamic: true
            });


            payment.setValue( { fieldId: 'customer', value: context.customer } );
            /*var trandate = format.parse({ value:context.date, type: format.Type.DATE });
            payment.setValue({fieldId:'trandate', value: context.date});*/
            if(context.hasOwnProperty('trandate') && context.date){
                var receipt_date = format.parse( context.date, 'date' );
                payment.setValue({fieldId:'trandate', value: receipt_date})
            }
            payment.setValue({fieldId:'Pesos', value: 'Pesos'});
            payment.setValue({fieldId:'payment',value: 1000});
            payment.save({ ignoreMandatoryFields: true });
            return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'PAYMENT SUCCESSFUL' }, 'internalId': payment.internalId };

        } catch (e) {
            // error("error creating sales order: " + salesOrderInternalId)
            log.error('POST2', JSON.stringify(e));
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR EMBRQUE .' + e.message }, 'internalId': '' };
        }


    };
    return handler;
    });