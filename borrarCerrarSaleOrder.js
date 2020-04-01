/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  aplicar  facturas a un pago
 */

define( ['N/log','N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( log,error, record, format, search, query ) {

    var handler = {};


    handler.post = function( context )
    {
        var lines = context.lineItems;
        for ( var i = 0; i < lines.length; i ++ ) {
            cerrarSaleOrder(lines[i]);
        }
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK' }, 'internalId': 0};
    
    };

    function cerrarSaleOrder(saleOrderID)
    {
        try
        {
             
        var SaleOrder = record.load({ type: record.Type.SALES_ORDER, id: saleOrderID    });
  
          if(SaleOrder.getValue('orderstatus')=='D' ||SaleOrder.getValue('orderstatus')=='D')
          {
              var VentaPerdidaLineas= [];
              log.error('LINEAS',SaleOrder.getLineCount({sublistId: 'item'}));
              for (var i = 0; i < SaleOrder.getLineCount({sublistId: 'item'}); i++) {
              
                  if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } )==0)
                  {
                      
                  SaleOrder.setSublistValue({
                                                  sublistId: 'item',
                                                  fieldId: 'isclosed',
                                                  line: i,
                                                  value: true
                                              });
                  }
                  if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } )<SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ))
                  {
                      log.error('Detecta Parcial','si'+SaleOrder.getSublistText({ sublistId: 'item', line: i, fieldId: 'item' }));
                      SaleOrder.setSublistValue({
                          sublistId: 'item',
                          fieldId: 'isclosed',
                          line: i,
                          value: true
                      });
                      VentaPerdidaLineas.push( {
                          articulo:  SaleOrder.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' }),
                          cantidad:  (SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } )-SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } ))
                      });
                  }
              }
             
              SaleOrder.save({ ignoreMandatoryFields: true });
              generaVentaPerdida(SaleOrder,VentaPerdidaLineas);
            
  
              
  
          }
          else
          {
              log.error('No es STATUSd',SaleOrder.getValue('orderstatus'));
          }
        
      
        }
           catch ( e ) {
            log.error( 'GET', JSON.stringify( e ) );
            var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }, 'internalId': ''};
    
          }

    }

     function generaVentaPerdida(saleOrder,lineas)
     {
         log.error('generaVentaPerdida','si');
        var ventaPerdida = record.create({
            type: 'customrecord_zindarventaperdida',
            isDynamic: true
            });

            ventaPerdida.setValue({fieldId:'custrecord_ventaperdida_pedido',value:saleOrder.getValue('id')});
            ventaPerdida.setValue({fieldId:'name',value:saleOrder.getValue('tranid').toString()});
            ventaPerdida.setValue({fieldId:'custrecord_ventaperdida_forma',value:saleOrder.getValue('custbody_forma_de_envio')});
            var hoy = new Date();
            var receipt_date2 = format.parse( hoy, 'date' );
            ventaPerdida.setValue('custrecord_ventaperdida_fecha',receipt_date2);
            ventaPerdida.setValue({fieldId:'custrecord_ventaperdida_cliente',value:saleOrder.getValue('entity')});
           var idVentaperdida= ventaPerdida.save({ignoreMandatoryFields:true});
            log.error( 'vp json', JSON.stringify( ventaPerdida ) );
            log.error( 'name', ventaPerdida.getValue('name') );
            log.error( 'id', idVentaperdida);
            for (var i = 0; i < lineas.length; i++) {
                var ventaPerdidaART = record.create({
                    type: 'customrecord_ventaperdida_articulorecord',
                    isDynamic: true
                    }); 
                    ventaPerdidaART.setValue('custrecord_articulorecord_articulo',lineas[i].articulo);
                    ventaPerdidaART.setValue('custrecord_articulorecord_cantidad',lineas[i].cantidad);
                    ventaPerdidaART.setValue('custrecord_articulorecord_pedidoid',idVentaperdida);
                    ventaPerdidaART.save({ignoreMandatoryFields:true});
                   
            }
     };
  return handler;
  } );