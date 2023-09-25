/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope Public
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERROS
 */

 define(['N/error', 'N/record', 'N/format', 'N/search', 'N/log','N/file'], function (error, record, format, search, log,file) {

    var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
        NSO_LOST_PARAMETER: { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }
    };


    handler.post = function (context) {
        try {

       
            var factura = record.load({
                type: record.Type.INVOICE,
                id: context.internalId,
                isDynamic: true,
                });


                var lineCount = factura.getLineCount({
                    sublistId: 'item'
                  });
              

                  if (lineCount > 0) {
                    // Leer el valor de la columna "Plazo" del primer detalle/línea del Invoice
                    var plazoValue = factura.getSublistValue({
                      sublistId: 'item',
                      fieldId: 'custcol_zindar_plazodetalle', // Asegúrate de que este campo sea el ID correcto de la columna "Plazo" en tu instancia
                      line: 0 // Índice del primer detalle (los índices comienzan en 0)
                    });
                    var DescuentoPP = factura.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_zindar_descuentoppdetalle', // Asegúrate de que este campo sea el ID correcto de la columna "Plazo" en tu instancia
                        line: 0 // Índice del primer detalle (los índices comienzan en 0)
                      });

                      var total= factura.getValue({
                        fieldId: 'total', // Asegúrate de que este campo sea el ID correcto de la columna "Plazo" en tu instancia
                        line: 0 // Índice del primer detalle (los índices comienzan en 0)
                      });

                      log.error('plazoValue',plazoValue);
                      log.error('DescuentoPP',DescuentoPP);
                      log.error('total',total);
                      log.error('Descuento$',total*(DescuentoPP/100));
                

                      factura.setValue({fieldId:'custbody_nso_payment_terms',value:plazoValue});
                      factura.setValue({fieldId:'custbody_nso_indr_client_discount',value:DescuentoPP});
                      factura.setValue({fieldId:'custbody_nso_indr_discount_16p',value:total*(DescuentoPP/100)});
                      factura.setValue({fieldId:'custbody_nso_indr_total_discount',value:total*(DescuentoPP/100)});
                      factura.save();

                  
                     
                    }


              //  return {'PDF':factura.getValue( {  fieldId: 'custbody_cfdi_pdf' } )};
              return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': factura.getValue( {  fieldId: 'custbody_cfdi_pdf' } ) }, 'internalId': '' };
                        
               


        } catch (e)
        {
            log.error('Error al Obtener PDF', e.message);
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al Obtener PDF' }, 'internalId': '' };
        }



    };

    return handler;
});