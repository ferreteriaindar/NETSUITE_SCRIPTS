/**
 * Author: Roberto Velasco  Larios 17/12/2020
 *@NApiVersion 2.0
 *@NScriptType MassUpdateScript
 */
define(['N/record'],
	function (record) {
	function each(params) {
		// Need to LOAD each record and SAVE it for changes to take effect
		// LOAD the PO
		var SO = record.load({
				type: params.type,
				id: params.id
			});

        var numLines = SO.getLineCount({
            sublistId: 'item'
        });


        for (var i = 0; i < numLines; i++) {
          
            SO.setSublistValue({
                sublistId: 'item',
                fieldId: 'isclosed',
                line: i,
                value: true
            });
           
            
        };
        
        var IdSO= SO.save({ignoreMandatoryFields: true });
        log.error({
            title: 'idpedido',
            details: IdSO
        });
        var note = record.create({type:record.Type.NOTE});
        note.setValue({fieldId: 'title', value: 'Cerrado'});
        note.setValue({fieldId: 'note', value: 'Pedido Cerrado por viejo y apartar mercancia. FIN DE AÑO'});
        note.setValue({fieldId: 'notetype', value: 7});
        note.setValue({fieldId: 'transaction', value: IdSO});
        note.save();
       
		// SAVE the PO
		
	}
	return {
		each: each
	};
});