/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  aplicar  facturas a un pago
 */

define( ['N/log','N/error', 'N/record', 'N/format' , 'N/search', 'N/email'], function( log,error, record, format, search, email ) {

    var handler = {};


    handler.post = function( context )
    {
        /*var lines = context.lineItems;
        for ( var i = 0; i < lines.length; i ++ ) {
            cerrarSaleOrder(lines[i]);
        }*/
        cerrarSaleOrder(context);
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK' }, 'internalId': 0};
    
    };

    function cerrarSaleOrder(context)
    {
        try
        {
             
        var SaleOrder = record.load({ type: record.Type.SALES_ORDER, id: context.saleOrderID    });
        var status =SaleOrder.getValue('status');
        log.error('status',status);
        
        
            
          if(SaleOrder.getValue('orderstatus')=='A' ||SaleOrder.getValue('orderstatus')=='B')
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
              if(SaleOrder.getValue('orderstatus')=='B')
              generaVentaPerdida(SaleOrder,VentaPerdidaLineas);
            
  
              
  
          }
         else
          {
              log.error('No es STATUSd',SaleOrder.getValue('orderstatus'));
          }
        
          enviarEmail(SaleOrder,context);
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

     function enviarEmail(saleOrder,context)
     {
        
        var myvar = '<h2 style="text-align: center;"><span style="color: #ff0000; background-color: #ffffff;">NOTIFICACIÓN</span></h2>'+
        '<p>El pedido '+saleOrder.getValue('tranid')+'('+saleOrder.getText('entity')+')  acaba de ser cancelado por  '+context.usuario+' desde el SAI, por favor</p>'+
        '<p>valida esta informacion con tu apoyo de ventas</p>'+
        '<p> </p>';

        if(context.compras==1)
        {

            myvar= '<h2 style="text-align: center;"><span style="color: #ff0000; background-color: #ffffff;">NOTIFICACIÓN</span></h2>'+
            '<p>El pedido  <a href="https://5327814.app.netsuite.com/app/accounting/transactions/transaction.nl?id='+saleOrder.getValue('id')+'">'+saleOrder.getValue('tranid')+'</a> acaba de ser cancelado por  '+context.usuario+' desde el SAI,se te notifica por que este pedido tiene   articulos de Sobre Pedido  s/pedido.</p>'+
            '<p> </p>';
                
            
        }
        var recipients= [context.apoyo,context.vendedor,7];
        if(context.compras==1)
        recipients.push( 16 );
        
        log.error('destinataros',recipients);
                    
        email.send({
            author: 34,
            recipients: recipients,
            subject: 'Pedido '+saleOrder.getValue('tranid')+' a sido cancelado',
            body: myvar,
            
            });
     };
  return handler;
  } );