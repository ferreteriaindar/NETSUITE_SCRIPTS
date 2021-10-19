/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  cerrar el pedido,o una linea de un pedido
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
        var memo= SaleOrder.getValue('memo');
        log.error('status',status);
        
        
            
          if(SaleOrder.getValue('orderstatus')=='A' ||SaleOrder.getValue('orderstatus')=='B')
          {
              var VentaPerdidaLineas= [];
              var VentaVentaNoConcluidaLineas= [];
              log.error('LINEAS',SaleOrder.getLineCount({sublistId: 'item'}));
              for (var i = 0; i < SaleOrder.getLineCount({sublistId: 'item'}); i++) {
              
                  if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } )==0)
                  {
                        log.error('entra en 0','si');
                        SaleOrder.setSublistValue({sublistId:'item',fieldId:'quantitycommitted',line:i,value:0});
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
                  if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityonhand' } )>0)
                  {
                    VentaVentaNoConcluidaLineas.push( {
                        articulo:  SaleOrder.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' }),
                        cantidad:  (SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ))
                    });   

                  }



              }
             SaleOrder.setValue({fieldId:'memo',value:memo+"Cerrado desde el SAI"});
             log.error('memo',memo+"Cerrado desde el SAI");
              SaleOrder.save({ ignoreMandatoryFields: true });
              if(SaleOrder.getValue('orderstatus')=='B')
             { 
                 generaVentaPerdida(SaleOrder,VentaPerdidaLineas);
                 generaVentaNoConcluida(SaleOrder,VentaVentaNoConcluidaLineas);
             }
            
  
              
  
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


    function generaVentaNoConcluida(SaleOrder,lineas)
    {
        var ventaNoConcluida = record.create({
            type: 'customrecord_ventanoconcluida',
            isDynamic: true
            });
            ventaNoConcluida.setValue({fieldId:'custrecord_ventanoconcluida_pedido',value:SaleOrder.getValue('id')});
            ventaNoConcluida.setValue({fieldId:'name',value:SaleOrder.getValue('tranid').toString()});
            var hoy = new Date();
            var receipt_date2 = format.parse( hoy, 'date' );
            ventaNoConcluida.setValue('custrecord_ventanoconcluida_fecha',receipt_date2);
            ventaNoConcluida.setValue({fieldId:'custrecord_ventanoconcluida_cliente',value:SaleOrder.getValue('entity')});
            var idVentaNoConcluida= ventaNoConcluida.save({ignoreMandatoryFields:true});
            log.debug({
                title: 'ID_VNC',
                details: idVentaNoConcluida
            });

            for (var i = 0; i < lineas.length; i++) {
                var ventaPerdidaART = record.create({
                    type: 'customrecord_ventanoconcluida_articulo',
                    isDynamic: true
                    }); 
                    ventaPerdidaART.setValue('custrecord_ventanoconcluida_articulo',lineas[i].articulo);
                    ventaPerdidaART.setValue('custrecord_ventanoconcluida_cantidad',lineas[i].cantidad);
                    ventaPerdidaART.setValue('custrecord_ventanoconcluida_head',idVentaNoConcluida);
                    ventaPerdidaART.save({ignoreMandatoryFields:true});
                   
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
        '<p>El pedido '+saleOrder.getValue('tranid')+'('+saleOrder.getText('entity')+')  acaba de ser cancelado por  '+context.usuario+' desde el SAI, por favor</p>'+
        '<p>valida esta informacion con tu apoyo de ventas</p>'+
        '<p> </p>';

        if(context.compras==1)
        {

            myvar= '<h2 style="text-align: center;"><span style="color: #ff0000; background-color: #ffffff;">NOTIFICACIÓN</span></h2>'+
            '<p>El pedido  <a href="https://5327814.app.netsuite.com/app/accounting/transactions/transaction.nl?id='+saleOrder.getValue('id')+'">'+saleOrder.getValue('tranid')+'</a> acaba de ser cancelado por  '+context.usuario+' desde el SAI,se te notifica por que este pedido tiene   articulos de Sobre Pedido  s/pedido.</p>'+
            '<p> </p>';
                
            
        }
        ///2  si es que compras   cierra una linea de un  pedidop
        if(context.compras==2)
        {
            var myvar = '<h3 style="text-align: center;"><span style="background-color: #ff9900; color: #ffffff;">AVISO</span></h3>'+
            '<p style="text-align: left;">Este correo es para avisarte  que algunas partidas  del pedido <strong> '+saleOrder.getValue('tranid')+' </strong> del cliente <strong>'+saleOrder.getText('entity')+' </strong>  fueron canceladas. En caso de que el pedido tenga otras partidas seguirá su proceso normal . Según creas conveniente, avisa a tu cliente. Este correo es informativo, favor de no contestarlo. </p>'+
            '<p style="text-align: left;"></p>'+
            '<ul>'+
            '';
            log.error('LINEAS',context.lines.length);
            var lineas= context.lines;
            for (var i = 0; i < lineas.length; i++) {
            myvar=myvar+'  <li><strong>'+lineas[i].item+' '+lineas[i].quantity+ 'pza(s)</strong> </li>'
             
            };
            myvar=myvar+'</ul>';

        }
        var recipients= [context.apoyo,context.vendedor];
        if(context.compras==1)
        recipients.push( 16 );
       /* if(context.compras==2)
        recipients.push(7);*/

        
        log.error('destinataros',recipients);
                    
        email.send({
            author: 34,
            recipients: recipients,
            subject: 'Pedido '+saleOrder.getValue('tranid')+' a sido cancelado',
            body: myvar
            });
     };



     handler.put = function( context )
     {
        cerrarLineasSaleOrder(context);
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK' }, 'internalId': 0};
     }


     function cerrarLineasSaleOrder(context)
     {
        try
        {
             
        var SaleOrder = record.load({ type: record.Type.SALES_ORDER, id: context.saleOrderID    });
        var status =SaleOrder.getValue('status');
        var memo= SaleOrder.getValue('memo');
        log.error('status',status);

        var lineas=context.lines;
        if(SaleOrder.getValue('orderstatus')=='A' ||SaleOrder.getValue('orderstatus')=='B')
          {
            var VentaPerdidaLineas= [];
            log.error('LINEAS',SaleOrder.getLineCount({sublistId: 'item'}));
            for (var i = 0; i < SaleOrder.getLineCount({sublistId: 'item'}); i++) {
            
                for (var j=0; j<lineas.length;j++)
                {
                    if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } )==lineas[j].itemid)
                    {
                        log.error('encuentra',lineas[j].itemid);

                        VentaPerdidaLineas.push( {
                            articulo:  SaleOrder.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' }),
                           cantidad:  (SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } )-SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } ))
                            });
                        SaleOrder.setSublistValue({sublistId:'item',fieldId:'quantitycommitted',line:i,value:0});
                        SaleOrder.setSublistValue({
                                                        sublistId: 'item',
                                                        fieldId: 'isclosed',
                                                        line: i,
                                                        value: true
                                                    });
                        

                    }
                }
            }
            SaleOrder.save({ ignoreMandatoryFields: true });
            generaVentaPerdida(SaleOrder,VentaPerdidaLineas);
            enviarEmail(SaleOrder,context);
          }
          else{
              log.error("status","No se puedes cerrar ya esta facturado");
              return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Ya esta Facturado y/o Cancelado'}, 'internalId': ''};
          }




        }catch ( e ) {
            log.error( 'GET', JSON.stringify( e ) );
            var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }, 'internalId': ''};
    
          }

     }

  return handler;
  } );
