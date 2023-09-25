
/**
 *@NApiVersion 2.0
 *@NScriptType MassUpdateScript
 */
define(['N/record','N/format'],
	function (record,format) {
	function each(params) {
		// Need to LOAD each record and SAVE it for changes to take effect
		// LOAD the PO
	
        
            var Credit = record.load({
                type: record.Type.CREDIT_MEMO,
                id: params.id
               
                });
                
                


                      log.error('postingperiod',Credit.getValue({fieldId:'postingperiod'}) );
                      log.error('trandate',Credit.getValue({fieldId:'trandate'}));
        
                
                      var FECHA = format.parse( '3/7/2023', 'date' );
                      Credit.setValue({fieldId:'trandate',value:FECHA});
                      Credit.setValue({fieldId:'postingperiod',value:'252'});
                    
                      Credit.save();

                  
                     
                    


	}
	return {
		each: each
	};
});
