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
        generaVentaNoConcluida(context.id);
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK' }, 'internalId': 0};
    
    };


    function generaVentaNoConcluida(id)
    {
        var SaleOrder = record.load({ type: record.Type.SALES_ORDER, id: id  });
        log.debug({
            title: 'saleorderIR',
            details: SaleOrder.id
        })
        var VentaVentaNoConcluidaLineas= [];
        for (var i = 0; i < SaleOrder.getLineCount({sublistId: 'item'}); i++) {

            log.debug({
                title: 'disponible',
                details: SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityonhand' } )
            })

            if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } )<SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ))
                  {
                     
                    VentaVentaNoConcluidaLineas.push( {
                          articulo:  SaleOrder.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' }),
                          cantidad:  (SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } )-SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } ))
                      });
                  }
        }

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

            for (var i = 0; i < VentaVentaNoConcluidaLineas.length; i++) {
                var ventaPerdidaART = record.create({
                    type: 'customrecord_ventanoconcluida_articulo',
                    isDynamic: true
                    }); 
                    ventaPerdidaART.setValue('custrecord_ventanoconcluida_articulo',VentaVentaNoConcluidaLineas[i].articulo);
                    ventaPerdidaART.setValue('custrecord_ventanoconcluida_cantidad',VentaVentaNoConcluidaLineas[i].cantidad);
                    ventaPerdidaART.setValue('custrecord_ventanoconcluida_head',idVentaNoConcluida);
                    ventaPerdidaART.save({ignoreMandatoryFields:true});
                   
            }






    }


    return handler;
});