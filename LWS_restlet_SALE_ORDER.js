/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */

 define( [ 'SuiteScripts/INDAR SCRIPTS/LWS_HTTP_CONNECTION','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

 function( httpService, error, log, runtime, file, record ) {
 
     function getJsonSoAfterSubmit(context) {
             log.debug('context.type: ', context.type);
                
       
 /*
             if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT && context.type !== context.UserEventType.APPROVE && context.type!== context.UserEventType.Cancel) {
               log.debug('salir',context.type);
                 return true;
             }
 */
             try {
 
                 var current_record = context.newRecord;
                 var currentRecord = record.load({ type: record.Type.SALES_ORDER, id: current_record.id });
                 var estatus = currentRecord.getValue({ fieldId: 'orderstatus' });
                  log.debug('estatus: ', estatus);
               
               log.debug('internalid: ', current_record.id);
               
               
 
         /*       if (estatus == 'A') {
                     return true;
                 } */
                 var SO={};
                 var saleOrder = {};
                 var tamaño = currentRecord.getLineCount({ sublistId: 'item' });
                 var lineas = [];
                 for (var i = 0; i < tamaño; i++) {
                     lineas.push({
                         saleOrderId: currentRecord.getValue('id'),
                         itemId: currentRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' }),
                         quantity: currentRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'quantity' }),
                         backOrdered: currentRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'quantitybackordered' }),
                         listPrice: currentRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'price' }),
                         amount: currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'amount' } ),
                         rate: currentRecord.getSublistValue({sublistId:'item',line:i,fieldId:'rate'}),
                         taxrate: currentRecord.getSublistValue({sublistId:'item',line:i,fieldId:'taxrate1'}),
                         isclosed: currentRecord.getSublistValue({sublistId:'item',line:i,fieldId:'isclosed'}),
                         IdWebDet:  currentRecord.getSublistValue({sublistId:'item',line:i,fieldId:'custcol_zindar_idweb_det'}),
                         DescuentoPPDet: currentRecord.getSublistValue({sublistId:'item',line:i,fieldId:'custcol_zindar_descuentoppdetalle'}),
                         PlazoDet: currentRecord.getSublistValue({sublistId:'item',line:i,fieldId:'custcol_zindar_plazodetalle'}),

 
 
                     });
                 }

                  var direcciones=currentRecord.getValue('shipaddress');
               var arr = direcciones.split("\n"); 
            // log.error('address',arr[1]);
                 saleOrder = {
                     idCustomer: currentRecord.getValue('entity'),
                     location: currentRecord.getValue('location'),
                     idWeb: currentRecord.getValue('custbody_nso_id_web'),
                     typeSale: currentRecord.getValue('custbody_nso_tipo_orden'),
                     trandate:   currentRecord.getValue('createddate'), //currentRecord.getValue('trandate'),
                     condition: currentRecord.getValue('custbody_nso_due_condition'),
                     paymetTerm: currentRecord.getValue('custbody_nso_payment_terms'),
                     term: currentRecord.getValue('terms'),
                     event: currentRecord.getValue('custbody_eventos'),
                     typeOrder: currentRecord.getValue('custbody_tipo_pedido'),
                     internalId: currentRecord.getValue('id'),
                     tranId: currentRecord.getValue('tranid'),
                     status: currentRecord.getValue('status'),
                     package: currentRecord.getValue('custbody_paqueteria'),
                     memo: currentRecord.getValue('memo'),
                     shippingWay: currentRecord.getValue('custbody_forma_de_envio'),
                     customerDiscountPP: currentRecord.getValue('custbody_nso_indr_client_discount'),
                     //billingAddress: (currentRecord.getValue('billaddresslist')=='')?currentRecord.getValue('billingaddress_key'):currentRecord.getValue('billaddresslist'),
                     billingAddress:currentRecord.getValue('billaddresslist'),
                     //shippingAddress: (currentRecord.getValue('source')=='CSV')?arr[1]: (currentRecord.getValue('shipaddresslist')=='')?currentRecord.getValue('shippingaddress_key'):currentRecord.getValue('shipaddresslist'),                            
                     shippingAddress: currentRecord.getValue('shipaddresslist'),
                     subtotal: currentRecord.getValue( { fieldId : 'subtotal' } ),
                     taxtotal: currentRecord.getValue( { fieldId : 'taxtotal' } ),
                     total: currentRecord.getValue( { fieldId : 'total' } ),
                     discounttotal: currentRecord.getValue( { fieldId : 'discounttotal' } ),
                     specialDiscount: currentRecord.getValue( { fieldId : 'custbody_descuento_especial' } ),
                     specialDiscountAuth: currentRecord.getValue( { fieldId : 'custbody_autorizacion_especial' } ),
                     eventDiscount: currentRecord.getValue( { fieldId : 'custbody_descuento_evento' } ),
                       department: currentRecord.getValue( { fieldId : 'custbody2' } ),
                     zone: currentRecord.getValue( { fieldId : 'custbodyzona' } ),
                     cotizacion: currentRecord.getValue({fieldId:'custbodycustbody_num_cotizacion'}),
                     ordenCompra: currentRecord.getValue({ fieldId: 'custbody_orden_compra'  }),
                     ShippingAddressText: currentRecord.getValue({ fieldId: 'shippingaddress_text'}).replace(currentRecord.getValue({ fieldId: 'custbody_fe_razon_social'}),''),
                   zip:currentRecord.getValue({ fieldId: 'shipzip'  }),
                   TipoEntrega:currentRecord.getValue({fieldId:'custbody_zindar_tipo_entrega'})
 
                 };
               
                 SO.saleOrder=saleOrder;
                 SO.saleOrderDetails = lineas ;
                 SO = JSON.stringify(SO);
             	 
                 //  log.error('json',SO);
                 var archivo = generaArchivo(SO, currentRecord.getValue({ fieldId: 'tranid' }));
                 httpService.post('SaleOrder/SaleOrderInsertLWS', SO );
 
             }  catch ( ex ){
               log.error( ex );
             }
     }
 
      function generaArchivo( contenido, nombreArchivo ) {
 
       try {
 
         var fileObjPDF = null,
             fileObj = file.create( {
                 name:       'SO '+nombreArchivo + '.json',
                 fileType:    file.Type.PLAINTEXT,
                 contents:    contenido,
                 description: 'Archivo .json pra la inegración de órdenes de Venta',
                 encoding:     file.Encoding.UTF8,
                 folder:       12228129,
                 isOnline:     true
             });
 
       } catch( e ){
 
             log.error('Error al guardar el archivo', e );
             return null;
 
       }
 
         return fileObj.save();
     }
 
     return {
         afterSubmit: getJsonSoAfterSubmit
     };
 });