/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor Misael Larios
 *@Company Indar
 *@NModuleScope Public
 *@Name INDAR | Create Sale Order
 *@Description Script que crea una Orden de Venta a partir de un JSON.
 */

 define( ['N/error', 'N/record', 'N/format', 'N/search'], function( error, record, format, search ) {

  var handler = {};

  const ERRORS = {
    NSO_NULL_FIELD : { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
    NSO_LOST_PARAMETER : { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }

  };

  function addItemLines( salesOrderIndar, context ) {
    if ( !salesOrderIndar || !context) {
      throw error.create( { name: ERRORS.NSO_LOST_PARAMETER.name, message: ERRORS.NSO_LOST_PARAMETER.message } );
    }
    var lines = context.lineItems;
    try {
      for ( var i = 0; i < lines.length; i ++ ) {
        salesOrderIndar.selectNewLine( 'item' );
        salesOrderIndar.setCurrentSublistValue( 'item',  'item', lines[i].itemId );
        salesOrderIndar.setCurrentSublistValue( 'item',  'quantity', lines[i].quantity );
        salesOrderIndar.setCurrentSublistValue( 'item',  'price', lines[i].listPrice );
        salesOrderIndar.setCurrentSublistValue( 'item',  'custcol_zindar_idweb_det', lines[i].idWeb_DET );
        salesOrderIndar.setCurrentSublistValue( 'item',  'custcol_zindar_descuentoppdetalle', lines[i].descuento_DET );
        salesOrderIndar.setCurrentSublistValue( 'item',  'custcol_zindar_plazodetalle', lines[i].plazo_DET );
        if(lines[i].listPrice=='-1')
         { log.debug('REGALO','SI');
           salesOrderIndar.setCurrentSublistValue( 'item',  'rate', .01 );
           if(lines[i].itemId==167006 || lines[i].itemId==169707) // HAY QUE PONERLE EL ID DEL  H0 CEMENTOG50
           {
            salesOrderIndar.setCurrentSublistValue( 'item',  'rate', lines[i].rate );
            if( context.shippingWay['id']==9) //SI ES  CEMENTO Y FORMA DE ENVIO CCI LOCAL SE CAMBIA A  HOLCIM CEMENTO
            salesOrderIndar.setValue( { fieldId: 'custbody_forma_de_envio', value:29  } );
           }
         }
        salesOrderIndar.commitLine( 'item' );
      }
    } catch(e){
      log.error( 'Error agregando lineas', JSON.stringify( e ) );
      var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
      return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_AGREGA_LINEAS ' + errorText }};
    }
  }

  function removeItemLines( salesOrderIndar, context ){
    if ( !salesOrderIndar || !context) {
        throw error.create( { name: ERRORS.NSO_LOST_PARAMETER.name, message: ERRORS.NSO_LOST_PARAMETER.message } );
    }
    var tamano = salesOrderIndar.getLineCount({ sublistId: 'item' });
    for (var i = tamano-1; i >= 0; i --) {
        salesOrderIndar.removeLine({sublistId: 'item', line: i});
    }
  }

  function addDirecciones( salesOrderIndar, context ) {
    if ( !salesOrderIndar || !context) {
      throw error.create( { name: ERRORS.NSO_LOST_PARAMETER.name, message: ERRORS.NSO_LOST_PARAMETER.message } );
    }
    salesOrderIndar.setValue( { fieldId: 'billaddresslist', value: context.billingAddress['id'] } );
    if ( context.shippingAddress['id'] ) {
      salesOrderIndar.setValue( { fieldId: 'shipaddresslist', value: context.shippingAddress['id'] } );
    } else {
      salesOrderIndar.setValue( { fieldId: 'shipaddresslist', value: '' } );
    }
  }

  function validateContext( context ) {
    if ( !context.idCustomer || !context.idCustomer == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': idCustomer' } );
    }
    if ( !context.date || !context.date == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': date' } );
    }
    if ( !context.location || !context.location == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': location' } );
    }
    if ( context.billingAddress && context.billingAddress['id'].length > 0 ) {
      for ( var i = 0; i < context.billingAddress.length; i++ ) {
        for ( var atributo in context.billingAddress[i] ) {
          if ( !context.billingAddress[i][atributo] ) {
            throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=' de billingAddress '+[i+1]+' es: '+atributo } );
          }
        }
      }
    } else {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': billingAddress' } );
    }
    if ( context.lineItems && context.lineItems.length > 0 ) {
      for ( var i = 0; i < context.lineItems.length; i++ ) {
        for ( var atributo in context.lineItems[i] ) {
          if ( !context.lineItems[i][atributo] && atributo!='rate' ) {
            throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=' de lineItems '+[i+1]+' es: '+atributo } );
          }
        }
      }
    } else {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': lineItems' } );
     }
    if ( !context.typeSale['id'] || !context.typeSale['id'] == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': typeSale' } );
    }
    if ( !context.idWeb || !context.idWeb == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': idWeb' } );
    }
    if ( !context.plazoEvento || !context.plazoEvento == null ) {//Es para los terminos de pago de la orden de venta
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': plazo Evento' } );
    }
  }

  handler.post = function( context ) {
    try {
      log.debug( 'Entrada al POST del Restlet', JSON.stringify( context ) );
      validateContext( context );
      var salesOrderIndar = record.create( { type: record.Type.SALES_ORDER, isDynamic: true } );
      var idCust = context.idCustomer, idTerminoPago = context.plazoEvento['id'];
      var terms = search.lookupFields({ type: 'customrecord_nso_vendor_terms', id: idTerminoPago, columns: ['custrecord_nso_netsuite_terms_vendor'] }).custrecord_nso_netsuite_terms_vendor;
     // log.debug( 'terms', terms );
      log.debug('STATUS_INICIO',salesOrderIndar.getValue({fieldId: 'orderstatus'}));
      salesOrderIndar.setValue({ fieldId: 'entity', value: context.idCustomer });
      salesOrderIndar.setValue({ fieldId: 'location', value: context.location });
      salesOrderIndar.setValue({ fieldId: 'custbody_nso_indr_require_approval', value: false });
      salesOrderIndar.setValue({ fieldId: 'custbody_nso_indr_discount_approval', value: true });
      salesOrderIndar.setValue({ fieldId: 'custbody_nso_id_web', value:  context.idWeb });
      salesOrderIndar.setValue({ fieldId: 'custbodycustbody_num_cotizacion', value:  context.noCotizacion });
      salesOrderIndar.setValue({ fieldId: 'custbody_nso_tipo_orden', value: context.typeSale['id'] });//Tipo de orden INDARNET, INDARWEB O ERUOTE
      var trandate = format.parse({ value:context.date, type: format.Type.DATE });
      salesOrderIndar.setValue({ fieldId: 'trandate', value: trandate });
      salesOrderIndar.setValue({ fieldId: 'custbody_nso_due_condition', value: 3 });
      salesOrderIndar.setValue({ fieldId: 'custbody_nso_payment_terms', value: idTerminoPago });
      salesOrderIndar.setValue({ fieldId: 'terms', value: terms[0].value });
      salesOrderIndar.setValue({ fieldId: 'custbody_inter', value: context.user });
      if ( context.methodPayment ) {
        salesOrderIndar.setValue({ fieldId: 'custbody_cfdi_metpago_sat', value: context.methodPayment['id'] });
      }
      if ( context.useCFDI ) {
        salesOrderIndar.setValue({ fieldId: 'custbody_uso_cfdi', value: context.useCFDI['id'] });
      }
      salesOrderIndar.setValue({ fieldId: 'custbody_orden_compra', value: context.numPurchase });
      salesOrderIndar.setValue({ fieldId: 'memo', value: context.comments });
      if ( context.events ) {
        salesOrderIndar.setValue({ fieldId: 'custbody_eventos', value: context.events['id'] });
      }
      if ( context.typeOrder ) {
        salesOrderIndar.setValue({ fieldId: 'custbody_tipo_pedido', value: context.typeOrder['id'] });
      }
      salesOrderIndar.setValue({ fieldId: 'currency', value: 1 });//MONEDA MXN
      salesOrderIndar.setValue({ fieldId: 'custbody_descuento_especial', value: context.discountSpecial });
      salesOrderIndar.setValue({ fieldId: 'custbodydescneg', value:0 /* context.desneg*/ });
      salesOrderIndar.setValue({ fieldId: 'custbodydescgar', value: context.desgar });
      salesOrderIndar.setValue({ fieldId: 'custbody_autorizacion_especial', value: context.specialAuthorization });
      salesOrderIndar.setValue({ fieldId: 'custbody_descuento_evento', value: context.eventSpecialDiscount });
      salesOrderIndar.setValue({ fieldId: 'custbody_nso_indr_client_discount', value: context.customerDiscountPP });
      salesOrderIndar.setValue({fieldId: 'orderStatus', value: '_pendingFulfillment'});
      salesOrderIndar.setValue({fieldId: 'custbody_zindar_tipo_entrega', value: context.TipoEntrega});
      log.debug('Status_Cambiado',salesOrderIndar.getValue({fieldId: 'orderstatus'}));
      if ( context.package ) {
       // log.debug('package', context.package['id']);
        salesOrderIndar.setValue( { fieldId: 'custbody_paqueteria', value: context.package['id'] } );
      }
      if ( context.shippingWay ) {
        salesOrderIndar.setValue( { fieldId: 'custbody_forma_de_envio', value: context.shippingWay['id'] } );
      }
      addItemLines( salesOrderIndar, context );
      addDirecciones( salesOrderIndar, context );
      var salesOrderId = salesOrderIndar.save( { ignoreMandatoryFields: true } );
     
      log.debug( 'NSO_ID_SALES_ORDER_CREATE', salesOrderId );
      var currentRecord = record.load({ type: record.Type.SALES_ORDER, id: salesOrderId });
      /*log.debug('Status_CambiadoDELLOAd',currentRecord.getValue({fieldId: 'orderstatus'}));*/
      currentRecord.setValue({fieldId: 'orderStatus', value: '_pendingFulfillment'});
      currentRecord.save( { ignoreMandatoryFields: true } );
      log.debug('status after', currentRecord.getValue({fieldId: 'orderstatus'}));
      return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Creación de la Orden de Venta Completada' }, 'internalId': salesOrderId, 'tranId': currentRecord.getValue('tranid'), };
    } catch ( e ) {
      log.error( 'POST', JSON.stringify( e ) );
      var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
      return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_SALESORDER ' + errorText }, 'internalId': '' };
    }
  };

  handler.put = function( context ) {
    try {
        if ( !context.internalId || !context.internalId == null ) {
            throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': internalId' } );
        }
        var salesOrderIndar = record.load( { type: record.Type.SALES_ORDER, id: context.internalId, isDynamic: true } );
        if(!salesOrderIndar){
            throw error.create( { name: 'INVALID_FIELD_VALUE', message: 'Invalid internalId field value' } );
        }
        /** Update Code Here */
      	var saleOrderStatus = salesOrderIndar.getValue('status');
		if(saleOrderStatus != 'Pending Approval' && saleOrderStatus != 'Pending Fulfillment' && saleOrderStatus != 'Ejecución del pedido pendiente' && saleOrderStatus != 'Aprovacion Pendiente'){
          throw error.create( { name: 'INVALID_STATUS_UPDATE', message: 'Invalid status for update.' } );
        }
      
      	if(context.lineItems){
          removeItemLines( salesOrderIndar, context);
          addItemLines( salesOrderIndar, context );
        }
      	//update fields
      	var saleOrderShippingWay = salesOrderIndar.getValue('custbody_forma_de_envio');
		if(context.shippingWay != "" && context.shippingWay != null && saleOrderShippingWay != context.shippingWay ){
          salesOrderIndar.setValue({fieldId: 'custbody_forma_de_envio', value: context.shippingWay});
        }
      	//salesOrderIndar.setValue({ fieldId: 'custbody_nso_indr_discount_approval', value: true });
      	//var NETSUITE_SALES_ORDER_APPROVED_STATUS = 'B';
        //salesOrderIndar.setValue({ fieldId: 'orderstatus', value: NETSUITE_SALES_ORDER_APPROVED_STATUS });
        var saleOrderId = salesOrderIndar.save( { enableSourcing: false, ignoreMandatoryFields: true } );
      	//var estatus = salesOrderIndar.getValue({ fieldId: 'orderstatus' });
      	//log.debug('Status', estatus);
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Sale Order Update Success' }, 'internalId': saleOrderId };
    } catch ( e ) {
        log.debug( 'PUT', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_UPDATE_SALEORDER ' + errorText }, 'internalId': '' };
    }
  }

  return handler;

 } );