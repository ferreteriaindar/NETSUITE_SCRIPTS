
/**
 *@NApiVersion 2.0
 *@NScriptType MassUpdateScript
 */
define(['N/record'],
	function (record) {
	function each(params) {
		// Need to LOAD each record and SAVE it for changes to take effect
		// LOAD the PO
	
        
            var factura = record.load({
                type: record.Type.INVOICE,
                id: params.id,
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


	}
	return {
		each: each
	};
});
