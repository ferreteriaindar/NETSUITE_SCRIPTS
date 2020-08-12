/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor Marco Antonio Benitez
 *@Company Netsoft
 *@NModuleScope Public
 *@Name 
 *@Description: 
 * scriptName: nso_rate_dos.js
 * idScript: 
 * idDeploy: 
 */

define([ 'N/error', 'N/record', 'N/search', 'N/format'  ],
function( error, record, search, format ) {

    var handler = {};

    handler.post = function (context) {


        var lines = context.documentos;
        for ( var i = 0; i < lines.length; i ++ ) {
            actualiza(lines[i]);
            log.error('id',lines[i].id);
        }
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK' }, 'internalId': 0};

    }



    function actualiza(context)
    {

        
    	try {

    		var factura = record.load({
                type: record.Type.INVOICE,
                id: context.id,
                isDynamic: true,
                });

	        var lineas = factura.getLineCount({sublistId:'item'});
                if(lineas==1)
                {
                for( var i = 0; i < lineas; i++ ) {

                    var rate = factura.getSublistValue({ sublistId: 'item', line: i, fieldId: 'rate' });
                        log.error('rateOrig',rate);
                    var rateDosDigitos = parseFloat(rate)-parseFloat(context.fix);
                    log.error('rateFix',rateDosDigitos)
                  
                  factura.selectLine({
                    sublistId: 'item',
                    line: i
                });
                factura.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: rateDosDigitos
                })

                factura.commitLine({
                    sublistId: 'item'
                    });

                  
                    factura.setValue({fieldId:'custbody_fe_metodo_de_pago_txt',value:1});
               
                    log.error('aftersave','ok');
                }
            }
            factura.save({ ignoreMandatoryFields: true });

         
                var note = record.create({type: 'note'});
                note.setValue({fieldId: 'title', value: 'AVISO'});
                note.setValue({fieldId: 'note', value: 'Se edito esta factura por que es de saldo inicial y no tenia el UUID donde tiene que ir,por script se actualizó pero nadie sabia que netsoft tiene un script que redondea y los dejó con .01 sin pagar aun ya liquidada y por eso hice esta ultima correccion.'});
                note.setValue({fieldId: 'notetype', value: 7});
                note.setValue({fieldId: 'transaction', value: context.id});
                note.save();
           

            

    	} catch(e) {

    		log.error('Error dos digitos', e);
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': e }, 'internalId': 0};
    	}
    }

    return handler;

});