/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor L&L
 *@Company Indar
 *@NModuleScope Public
  *@Description Script encargado de generar a partir de una factura una Autorizacion de Devolucion.
 */

  define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

    var handler = {};
  
    function GENERA_RETURNAUTHORIZATION(context)
    {

        var RA = record.transform({
            fromType: record.Type.INVOICE,
            fromId: context.id,
            toType: record.Type.RETURN_AUTHORIZATION,
            isDynamic: true,
            });


            RA.setValue({fieldId: 'location',value: context.location });
            RA.setValue({fieldId: 'memo',value: context.memo})

            var LineasFulfillMent=[];
            for ( var i = 0; i < RA.getLineCount( 'item' ); i ++ ) {
            LineasFulfillMent.push({itemId: RA.getSublistValue( 'item',  'item', i ),quantity: RA.getSublistValue( 'item',  'quantity', i ), line:RA.getSublistValue( 'item',  'line', i )});
            }
            log.error('LineasFulfillMent',LineasFulfillMent);
            var lines = context.lines;
            log.error('lines',lines);
            for (var i = 0; i < RA.getLineCount({sublistId: 'item'}); i++)
            {
                    var Articulo=RA.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } );
                
                    var existe=0
                    for (var j=0;j<lines.length;j++)
                    {
                    
                        if(Articulo==lines[j].itemId)
                            {
                                existe=1;
                               RA.selectLine({ sublistId: 'item',line: i    });
                               RA.setCurrentSublistValue({sublistId: 'item',  fieldId: 'quantity',value: lines[j].quantity });
                               RA.commitLine({sublistId: 'item'});
                            }
                        
                    }
                    if(existe==0)
                    {
                        RA.selectLine({ sublistId: 'item',line: i    });
                        RA.setCurrentSublistValue({sublistId: 'item',  fieldId: 'quantity',value: 0 });
                        RA.commitLine({sublistId: 'item'});

                    }
                   

            }     
             var id=  RA.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
               
            var ReturnAuth= record.load({ type: record.Type.RETURN_AUTHORIZATION, id: id,isDynamic: true,});
     
            for (var i = ReturnAuth.getLineCount({sublistId: 'item'})-1; i >=0 ; i--)
            {
              //  log.error('borrAR',RA.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } )+' linea='+RA.getSublistValue( { sublistId: 'item', line: i, fieldId: 'line' } ));
                    if(RA.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } )==0)
                    ReturnAuth.removeLine({sublistId: "item", line: i,ignoreRecalc: true});
            }

            var IdRegreso=ReturnAuth.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            log.error('idregres',IdRegreso);
            return IdRegreso;


    }
 
 
    handler.post = function( context )
  {
    try
    {
        
      
    var RESULTADO = GENERA_RETURNAUTHORIZATION(context);
 
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': RESULTADO }};
     // return {'Documentos':arqueo};
 
    }   catch ( e ) {
        log.error( 'CATCH', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
 
      }
    };
 return handler;
 } );