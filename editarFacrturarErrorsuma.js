/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  enviar Email
 */

  define( ['N/email','N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( email,error, record, format, search, query ) {

    var handler = {};
  
   
    handler.post = function( context )
    {
            var Invoice =record.load({
                type: record.Type.INVOICE,
                id: context.id,
                isDynamic: true,
          
            });

           
            var lineas = Invoice.getLineCount({sublistId:'item'});

            for( var i = 0; i < lineas; i++ ) {
                Invoice.selectLine({
                    sublistId: 'item',
                    line: i
                });

                var rate = Invoice.getSublistValue({ sublistId: 'item', line: i, fieldId: 'rate' });

                var rateDosDigitos = parseFloat(rate.toFixed(2));

              //  Invoice.setSublistValue({sublistId:'item', fieldId:'rate', line:i , value: rateDosDigitos});
              Invoice.setCurrentSublistValue({
                  sublistId: 'item',
                  fieldId: 'rate',
                  value: rateDosDigitos
                
              });

                }
            Invoice.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
                });   
            
                Invoice=   record.load({
                    type: record.Type.INVOICE,
                    id: context.id,
                    isDynamic: true,
              
                });
                Invoice.setValue({ fieldId: 'custbody_foliosat', value: '2'        });

                Invoice.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                    });   


    };
    
  return handler;
  } );