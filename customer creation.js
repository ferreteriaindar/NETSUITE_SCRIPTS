/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor Leopoldo Santiago Rodríguez, Marco Antonio Benitez, Itzadiana Morales R
 *@Company Netsoft
 *@NModuleScope Public
 *@Name NSO | RS | INDAR | Customer Creation
 *@Description Script encargado de crear y editar un cliente apartir de un json recibido de INDAR.
 * scriptName nso_indr_rs_Customer_Integration.js
 * idScript: customscript_nso_rs_indr_customer
 * idDeploy: customdeploy_nso_rs_indr_customer
 */

 define( ['N/error', 'N/record', 'N/format', 'N/search'], function( error, record, format, search ) {

  var handler = {};
  const ERRORS = {
    NSO_NULL_FIELD : { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
    NSO_LOST_PARAMETER : { name: 'NSO_LOST_PARAMETER', message: 'No se encontró el cliente con el ID especificado' },
    NSO_ID_NOT_FOUND: { name: 'NSO_ID_NOT_FOUND', message:'No se encontró dirección con el ID especificado' }
  };

  function validateContext( context ) {
    if ( !context.company || !context.company == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': company' } );
    }
    if ( !context.companyID || !context.companyID == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': companyID' } );
    }
    if ( context.address && context.address.length > 0 ) {
      for ( var i = 0; i < context.address.length; i++ ) {
        for ( var atributo in context.address[i] ) {
          if ( atributo == "addressID" ){ continue; }
          if ( atributo == "noInt" ){ continue; }
          if ( atributo == "longitude" ){ continue; }
          if ( atributo == "latitude" ){ continue; }
          if ( !context.address[i][atributo] ) {
            throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=' de address es: '+atributo } );
          }
        }
      }
    } else {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': address' } );
    }
    if ( context.contacts && context.contacts.length > 0 ) {
     for ( var i = 0; i < context.contacts.length; i++ ) {
       for ( var atributo in context.contacts[i] ) {
         if ( atributo == "nameContact" ) {
           if ( context.contacts[i][atributo] == '' || context.contacts[i][atributo] == null ) {
             throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=' de contacts es: '+atributo } );
           }
         }
       }
     }
    } else {
     throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': contacts' } );
    }
    if ( !context.typeCustomer['id'] || !context.typeCustomer['id'] == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': typeCustomer' } );
    }
    if ( !context.idNet || !context.idNet == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': idNet' } );
    }
    if ( !context.RFC || !context.RFC == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': RFC' } );
    }
    if ( !context.paymentTerms['id'] || !context.paymentTerms['id'] == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': paymentTerms' } );
    }
    if ( !context.methodPayment['id'] || !context.methodPayment['id'] == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': methodPayment' } );
    }
    if ( !context.typeCFDI['id'] || !context.typeCFDI['id'] == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': typeCFDI' } );
    }
    if ( !context.paymentCFDI['id'] || !context.paymentCFDI['id'] == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': paymentCFDI' } );
    }
    if ( !context.paymentSAT['id'] || !context.paymentSAT['id'] == null ) {
      throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': paymentSAT' } );
    }
  }

  function buscarDirecciones( customerID ) {
    if ( !customerID ) {
      throw error.create( { name: ERRORS.NSO_LOST_PARAMETER.name, message: ERRORS.NSO_LOST_PARAMETER.message+=': customerID' } );
    }
    var direcciones = {}, idDireccion = null, defaultbilling = false, defaultshipping = false, residential = false;
    var customerIndarLoad = record.load( { type: record.Type.CUSTOMER, id: customerID, isDynamic: true } );
    for (var i = 0; i < customerIndarLoad.getLineCount('addressbook'); i++) {
      customerIndarLoad.selectLine( { sublistId: 'addressbook', line: i } );
      idDireccion     = customerIndarLoad.getCurrentSublistValue( { sublistId: 'addressbook', fieldId: 'id' } );
      defaultshipping = customerIndarLoad.getCurrentSublistValue( { sublistId: 'addressbook', fieldId: 'defaultshipping' } );
      defaultbilling  = customerIndarLoad.getCurrentSublistValue( { sublistId: 'addressbook', fieldId: 'defaultbilling' } );
      residential  = customerIndarLoad.getCurrentSublistValue( { sublistId: 'addressbook', fieldId: 'isresidential' } );
      direcciones['dataDireccion'+(i+1)] = { id : idDireccion, 'defaultshipping': defaultshipping , 'defaultbilling': defaultbilling, 'isresidential': residential };
    }
    return direcciones;
  }

  function crearContactos( customerID, context) {
    if ( !customerID ) {
      throw error.create( { name: ERRORS.NSO_LOST_PARAMETER.name, message: ERRORS.NSO_LOST_PARAMETER.message+=': customerID' } );
    }
    if ( context.contacts.length > 0 ) {
      var objContact = {}, idContact = null;
      for (var i = 0; i < context.contacts.length; i++ ) {
        if ( Object.keys( context.contacts[i] ).length > 0 ) {
          var recContact = record.create( { type: 'contact', isDynamic: true } );
          recContact.setValue( { fieldId: 'company', value: customerID } );
          recContact.setValue( { fieldId: 'entityid', value: context.companyID + ' ' + context.contacts[i].nameContact + ' ' + i  } );
          if ( context.contacts[i].email ) { recContact.setValue( { fieldId: 'email', value: context.contacts[i].email } ); }
          if ( context.contacts[i].phone ) { recContact.setValue( { fieldId: 'phone', value: context.contacts[i].phone } ); }
          if ( context.contacts[i].idRole ) { recContact.setValue( { fieldId: 'contactrole', value: context.contacts[i].idRole } ); }
           idContact = recContact.save( { ignoremandatoryfields: true } );
           log.debug( 'id contact', idContact );
           objContact['dataContacto'+(i+1)] = { id : idContact };
        }
      }
      return objContact;
    } else {
      return {};
    }
  }

  function editarContactos( customerIndar, contacto ) {
    if ( !customerIndar ) {
      throw error.create( { name: ERRORS.NSO_LOST_PARAMETER.name, message: ERRORS.NSO_LOST_PARAMETER.message+=': customerIndar' } );
    }
    var camposContactos = {};
    for ( var j = 0; j < customerIndar.getLineCount( 'contactroles' ); j++) {
      customerIndar.selectLine( { sublistId: 'contactroles', line: j } );
      if ( contacto.contactID == customerIndar.getCurrentSublistValue( { sublistId: 'contactroles', fieldId: 'contact' } ) ) {
        if ( contacto.nameContact ) { camposContactos['entityid'] = contacto.nameContact }
        if ( contacto.email ) { camposContactos['email'] = contacto.email }
        if ( contacto.phone ) { camposContactos['phone'] = contacto.phone }
        if ( contacto.idRole ) { camposContactos['contactrole'] = contacto.idRole }
        var contactRecord = record.submitFields({ type: record.Type.CONTACT, id: contacto.contactID, values: camposContactos, options: { ignoreMandatoryFields : true } });
        log.debug('contacto modificado', contactRecord );
        return;
      }
    }
  }

  handler.post = function( context ) {
    try {
      var valorCheckbox;
      log.debug( 'Entrada al POST del Restlet', JSON.stringify( context ) );
      validateContext( context );
      var methodPayment = context.methodPayment['id'] != "10" ? context.methodPayment['id'] : "99";
      var customerIndar = record.create( { type: record.Type.CUSTOMER, isDynamic: true } );
      customerIndar.setValue( { fieldId: 'isperson', value: 'F' } );
      customerIndar.setValue( { fieldId: 'autoname', value: false } );
      customerIndar.setValue( { fieldId: 'entityid', value: context.companyID } );
      customerIndar.setValue( { fieldId: 'companyname', value: context.company } );
      customerIndar.setValue( { fieldId: 'custentity_razon_social', value: context.company } ); //nuevo campo CFDI 3.3
      customerIndar.setValue( { fieldId: 'custentity_nso_id_net', value: context.idNet } );
      customerIndar.setValue( { fieldId: 'custentity_rfc', value: context.RFC } );
      customerIndar.setValue( { fieldId: 'vatregnumber', value: context.RFC } );
      customerIndar.setValue( { fieldId: 'accountnumber', value: context.account } );
      customerIndar.setValue( { fieldId: 'phone', value: context.phone } );
      customerIndar.setValue( { fieldId: 'email', value: context.email } );
      customerIndar.setValue( { fieldId: 'custentity_fe_sf_se_destinatario', value: context.email } ); //Nuevo Campo cfdi 3.3
      customerIndar.setValue( { fieldId: 'custentity_fe_sf_se_cc', value: context.email } ); //Nuevo Campo cfdi 3.3
      customerIndar.setValue( { fieldId: 'custentity_num_prospecto', value: context.numProspect } );
      customerIndar.setValue( { fieldId: 'creditlimit', value: parseFloat( context.creditLimit ) } );
      customerIndar.setValue( { fieldId: 'custentity_limite_pedidos', value: parseFloat( context.limitOrders ) } );
      customerIndar.setValue( { fieldId: 'custentity_referencia_bancaria', value: context.bankReference } );
      customerIndar.setValue( { fieldId: 'custentity_monto_pagare', value: context.ammountPagare } );
      customerIndar.setValue( { fieldId: 'custentity_descuento_financiero', value: context.financialDiscount } );
      customerIndar.setValue( { fieldId: 'custentity_checar_credito', value: context.checkCredit } );
      customerIndar.setValue( { fieldId: 'custentity_nombre_comercial', value: context.tradeName } );
      var today = new Date();
      customerIndar.setValue( { fieldId: 'custentitycliente_fech_creacion', value: today } );
      //-------------------------------------------------------------------------------------------------
      ( context.newCreditRequest == "T" ) ? valorCheckbox = true: valorCheckbox = false;
      customerIndar.setValue( { fieldId: 'custentity_solicitud_credito_nuevo', value: valorCheckbox } );
      ( context.newPagare == "T" ) ? valorCheckbox = true: valorCheckbox = false;
      customerIndar.setValue( { fieldId: 'custentity_pagare_nuevo', value: valorCheckbox } );
      ( context.newCustomerBonus == "T" ) ? valorCheckbox = true: valorCheckbox = false;
      customerIndar.setValue( { fieldId: 'custentity_bono_cliente_nuevo', value: valorCheckbox } );
      ( context.modifyExpiration == "T" ) ? valorCheckbox = true: valorCheckbox = false;
      customerIndar.setValue( { fieldId: 'custentity_modificar_vencimiento', value: valorCheckbox } );
      //--------------------------------------------------------------------------------
      customerIndar.setValue( { fieldId: 'custentity_nso_indr_client_category', value: context.typeCustomer['id'] } );
      customerIndar.setValue( { fieldId: 'category', value: context.category['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_nso_entity_type', value: 2 } );//Entidad Cliente
      customerIndar.setValue( { fieldId: 'custentity_nso_payment_terms', value: 57 } );//Termino de pago contado
      customerIndar.setValue( { fieldId: 'custentity_cfdi_metpago', value: context.methodPayment['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_metodo_pago', value:  methodPayment} ); //Nuevo campo CFDI 3.3
      customerIndar.setValue( { fieldId: 'custentity_condicion_cliente', value: context.condition['id'] } );
      //customerIndar.setValue( { fieldId: 'custentity_nso_grupo', value: context.customerGroup['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_indar_ruta_venta', value: context.routeSale['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_ruta', value: context.route['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_forma_envio_cliente', value: context.shippingWay['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_crm_influencia', value: context.crmInfluence['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_condiciones_comerciales', value: context.commercialTerms['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_bloquear_morosos', value: context.blockDelinquents['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_zona_cliente', value: context.customerZone['id'] } );
      customerIndar.setValue( { fieldId: 'entitystatus', value: context.status['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_cliente_contado', value: context.countedCustomer['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_paqueteria', value: context.package['id'] } );
      customerIndar.setValue( { fieldId: 'pricelevel', value: context.priceList['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_giro_cliente', value: context.giro['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_recorrer_vencimiento', value: context.extendExpiration['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_uso_cfdi_ent', value: context.typeCFDI['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_uso_cfdi', value: context.typeCFDI['id'] } ); //Nuevo Campo CFDI 3.3
      customerIndar.setValue( { fieldId: 'custentity_cfdi_formadepago_ent', value: context.paymentCFDI['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_fe_metodo_pago_33', value: context.paymentCFDI['id'] } ); //Nuevo Campo CFDI 3.3
      customerIndar.setValue( { fieldId: 'custentity_cfdi_metpago_sat_ent', value: context.paymentSAT['id'] } );
      customerIndar.setValue( { fieldId: 'custentity_imr_fe40_regimenfiscal', value: context.regimenFiscal} );
      customerIndar.setValue( { fieldId: 'custentitycustentity_contrato_adhesion', value: (context.archivoAdhesion=='T'?true:false) } );
      //---------------------------------Se introduce las direcciones al addressbook-------------------------------------
      for ( var i = 0; i < context.address.length; i++ ) {
        customerIndar.selectNewLine( { sublistId: 'addressbook' } );
        ( context.address[i].defaultbilling == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: valorCheckbox });
        ( context.address[i].defaultshipping == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: valorCheckbox });
        ( context.address[i].residential == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'isresidential', value: valorCheckbox });
        customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'label', value: context.address[i].addr1 });
        var objSubrecord = customerIndar.getCurrentSublistSubrecord( { sublistId: 'addressbook', fieldId: 'addressbookaddress' } );
        objSubrecord.setValue( { fieldId: 'country', value: context.address[i].country } );
        objSubrecord.setValue( { fieldId: 'city', value: context.address[i].city } );
        objSubrecord.setValue( { fieldId: 'state', value: context.address[i].state } );
        objSubrecord.setValue( { fieldId: 'addr1', value: context.address[i].addr1 } );
        objSubrecord.setValue( { fieldId: 'addr2', value: context.address[i].addr2 } );
        objSubrecord.setValue( { fieldId: 'custrecord_fe_numero_interior', value: context.address[i].noInt } );
        objSubrecord.setValue( { fieldId: 'custrecord_fe_numero_exterior', value: context.address[i].noExt } );
		objSubrecord.setValue( { fieldId: 'custrecord_zindar_latitude', value: context.address[i].latitude } );
		objSubrecord.setValue( { fieldId: 'custrecord_zindar_longitude', value: context.address[i].longitude } );
        objSubrecord.setValue( {fieldId: 'zip',value: context.address[i].postalCode } );
        objSubrecord.setValue( { fieldId: 'custrecord_zindarformaenviodireccion', value: context.address[i].formaEnvioDireccion } );
        objSubrecord.setValue( { fieldId: 'custrecord_zindarrutadireccion', value: context.address[i].rutaDireccion } );
        customerIndar.commitLine( { sublistId: 'addressbook' } );
      }
      var customerID = customerIndar.save( { ignoreMandatoryFields: true } );
      log.debug( 'NSO_CLIENTE_CREADO', customerID );
      var direcciones = buscarDirecciones( customerID );
      try {
        var contactos = crearContactos( customerID, context );
        var objRecord = record.load({ type: record.Type.CUSTOMER, id: customerID, isDynamic: true });
        var recordID = objRecord.save({ ignoreMandatoryFields: true });
      } catch (e) {
        log.error( 'POST', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_CONTACTS_CUSTOMER ' + errorText }, 'internalId': customerID, direcciones: direcciones, contactos: {} };
      }
      return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Creación Del Cliente Completada' }, 'internalId': customerID, direcciones: direcciones, contactos: contactos };
    } catch ( e ) {
      log.error( 'POST', JSON.stringify( e ) );
      var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
      return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_CUSTOMER ' + errorText }, 'internalId': '' };
    }
  };

  handler.put = function( context ) {
    try {
      log.debug( 'Entrada al PUT del Restlet', JSON.stringify( context ) );
      if ( !context.internalid || !context.internalid == null ) {
        throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': internalid' } );
      }
      var valorCheckbox;
      var customerIndar = record.load( { type: record.Type.CUSTOMER, id: context.internalid, isDynamic: true } );
      if ( context.company ) { customerIndar.setValue( { fieldId: 'companyname', value:  context.company } ); }
      if ( context.companyID ) { customerIndar.setValue( { fieldId: 'entityid', value: context.companyID } ); }
      if ( context.idNet ) { customerIndar.setValue( { fieldId: 'custentity_nso_id_net', value: context.idNet } ); }
      if ( context.RFC ) {
        customerIndar.setValue( { fieldId: 'custentity_rfc', value: context.RFC } );
        customerIndar.setValue( { fieldId: 'vatregnumber', value: context.RFC } );
      }
      if ( context.account ) { customerIndar.setValue( { fieldId: 'accountnumber', value: context.account } ); }
      if ( context.phone ) { customerIndar.setValue( { fieldId: 'phone', value: context.phone } ); }
      if ( context.email ) { customerIndar.setValue( { fieldId: 'email', value: context.email } ); }
      if ( context.hasOwnProperty( 'priceList' ) ) {
        if ( context.priceList['id'] ) { customerIndar.setValue( { fieldId: 'pricelevel', value: context.priceList['id'] } ); }
      }
      if ( context.numProspect ) { customerIndar.setValue( { fieldId: 'custentity_num_prospecto', value: context.numProspect } ); }
      if ( context.creditLimit && context.creditLimit != '' &&  context.creditLimit != '0') { customerIndar.setValue( { fieldId: 'creditlimit', value: parseFloat(context.creditLimit) } ); }
      log.debug('creditlimit', context.creditLimit);
      log.debug('creditlimit set', customerIndar.getValue({fieldId: 'creditlimit'}));
      if ( context.creditDays ) { customerIndar.setValue( { fieldId: 'daysoverdue', value: context.creditDays } ); }
      if ( context.currencyCredits ) { customerIndar.setValue( { fieldId: 'custentity_def_moneda_credito_moneda', value: context.currencyCredits } ); }
      if ( context.bankReference ) { customerIndar.setValue( { fieldId: 'custentity_referencia_bancaria', value: context.bankReference } ); }
      if ( context.ammountPagare ) { customerIndar.setValue( { fieldId: 'custentity_monto_pagare', value: context.ammountPagare } ); }
      if ( context.financialDiscount ) { customerIndar.setValue( { fieldId: 'custentity_descuento_financiero', value: context.financialDiscount } ); }
      if ( context.checkCredit ) { customerIndar.setValue( { fieldId: 'custentity_checar_credito', value: context.checkCredit } ); }
      if ( context.tradeName ) { customerIndar.setValue( { fieldId: 'custentity_nombre_comercial', value: context.tradeName } ); }
      if ( context.crmMovSale ) { customerIndar.setValue( { fieldId: 'custentity_crm_mov_venta', value: context.crmMovSale } ); }
      //--------------------------------------------------------------------------------------------------------
      if ( context.creditWithLimit ) {
        ( context.creditWithLimit == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_credito_con_limite', value: valorCheckbox } );
      }
      if ( context.creditWithDays ) {
        ( context.creditWithDays == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_credito_con_dias', value: valorCheckbox } );
      }
      if ( context.creditWithConditions ) {
        ( context.creditWithConditions == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_credito_con_condiciones', value: valorCheckbox } );
      }
      if ( context.partialOrders ) {
        ( context.partialOrders == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_pedidos_parciales', value: valorCheckbox } );
      }
      if ( context.discountSurcharges ) {
        ( context.discountSurcharges == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_descuento_recargos', value: valorCheckbox } );
      }
      if ( context.newCreditRequest ) {
        ( context.newCreditRequest == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_solicitud_credito_nuevo', value: valorCheckbox } );
      }
      if ( context.newPagare ) {
        ( context.newPagare == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_pagare_nuevo', value: valorCheckbox } );
      }
      if ( context.newCustomerBonus ) {
        ( context.newCustomerBonus == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_bono_cliente_nuevo', value: valorCheckbox } );
        customerIndar.setValue( { fieldId: 'custentity_nso_cliente_aplicabono', value: valorCheckbox } );

      }
      if ( context.modifyExpiration ) {
        ( context.modifyExpiration == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_modificar_vencimiento', value: valorCheckbox } );
      }
      if ( context.specialCredit ) {
        ( context.specialCredit == "T" ) ? valorCheckbox = true: valorCheckbox = false;
        customerIndar.setValue( { fieldId: 'custentity_credito_especial', value: valorCheckbox } );
      }
      //--------------------------------------------------------------------------------------------------------
      if ( context.hasOwnProperty( 'typeCustomer' ) ) {
        if ( context.typeCustomer['id'] ) { customerIndar.setValue( { fieldId: 'custentity_nso_indr_client_category', value: context.typeCustomer['id'] } ); }
      }
      if ( context.hasOwnProperty( 'category' ) ) {
        if ( context.category['id'] ) { customerIndar.setValue( { fieldId: 'category', value: context.category['id'] } ); }
      }
      if ( context.hasOwnProperty( 'paymentTerms' ) ) {
        if ( context.paymentTerms['id'] ) { customerIndar.setValue( { fieldId: 'custentity_nso_payment_terms', value: context.paymentTerms['id'] } ); }
      }
      if ( context.hasOwnProperty( 'methodPayment' ) ) {
        if ( context.methodPayment['id'] ) { customerIndar.setValue( { fieldId: 'custentity_cfdi_metpago', value: context.methodPayment['id'] } ); }
      }
      if ( context.hasOwnProperty( 'extendExpiration' ) ) {
        if ( context.extendExpiration['id'] ) { customerIndar.setValue( { fieldId: 'custentity_recorrer_vencimiento', value: context.extendExpiration['id'] } ); }
      }
      if ( context.hasOwnProperty( 'condition' ) ) {
        if ( context.condition['id'] ) { customerIndar.setValue( { fieldId: 'custentity_condicion_cliente', value: context.condition['id'] } ); }
      }
      /*if ( context.hasOwnProperty( 'customerGroup' ) ) {
        if ( context.customerGroup['id'] ) { customerIndar.setValue( { fieldId: 'custentity_nso_grupo', value: context.customerGroup['id'] } ); }
      }*/
      if ( context.hasOwnProperty( 'routeSale' ) ) {
        if ( context.routeSale['id'] ) { customerIndar.setValue( { fieldId: 'custentity_indar_ruta_venta', value: context.routeSale['id'] } ); }
      }
      if ( context.hasOwnProperty( 'route' ) ) {
        if ( context.route['id'] ) { customerIndar.setValue( { fieldId: 'custentity_ruta', value: context.route['id'] } ); }
      }
      if ( context.hasOwnProperty( 'shippingWay' ) ) {
        if ( context.shippingWay['id'] ) { customerIndar.setValue( { fieldId: 'custentity_forma_envio_cliente', value: context.shippingWay['id'] } ); }
      }
      if ( context.hasOwnProperty( 'crmInfluence' ) ) {
        if ( context.crmInfluence['id'] ) { customerIndar.setValue( { fieldId: 'custentity_crm_influencia', value: context.crmInfluence['id'] } ); }
      }
      if ( context.hasOwnProperty( 'commercialTerms' ) ) {
        if ( context.commercialTerms['id'] ) { customerIndar.setValue( { fieldId: 'custentity_condiciones_comerciales', value: context.commercialTerms['id'] } ); }
      }
      if ( context.hasOwnProperty( 'blockDelinquents' ) ) {
        if ( context.blockDelinquents['id'] ) { customerIndar.setValue( { fieldId: 'custentity_bloquear_morosos', value: context.blockDelinquents['id'] } ); }
      }
      if ( context.hasOwnProperty( 'customerZone' ) ) {
        if ( context.customerZone['id'] ) { customerIndar.setValue( { fieldId: 'custentity_zona_cliente', value: context.customerZone['id'] } ); }
      }
      if ( context.hasOwnProperty( 'status' ) ) {
        if ( context.status['id'] ) { customerIndar.setValue( { fieldId: 'entitystatus', value: context.status['id'] } ); }
      }
      if ( context.hasOwnProperty( 'countedCustomer' ) ) {
        if ( context.countedCustomer['id'] ) { customerIndar.setValue( { fieldId: 'custentity_cliente_contado', value: context.countedCustomer['id'] } ); }
      }
      if ( context.hasOwnProperty( 'package' ) ) {
        if ( context.package['id'] ) { customerIndar.setValue( { fieldId: 'custentity_paqueteria', value: context.package['id'] } ); }
      }
      if ( context.hasOwnProperty( 'giro' ) ) {
        if ( context.giro['id'] ) { customerIndar.setValue( { fieldId: 'custentity_giro_cliente', value: context.giro['id'] } ); }
      }
      if ( context.hasOwnProperty( 'typeCFDI' ) ) {
        if ( context.typeCFDI['id'] ) { customerIndar.setValue( { fieldId: 'custentity_uso_cfdi_ent', value: context.typeCFDI['id'] } ); }
      }
      if ( context.hasOwnProperty( 'paymentCFDI' ) ) {
        if ( context.paymentCFDI['id'] ) { customerIndar.setValue( { fieldId: 'custentity_cfdi_formadepago_ent', value: context.paymentCFDI['id'] } ); }
      }
      if ( context.hasOwnProperty( 'paymentSAT' ) ) {
        if ( context.paymentSAT['id'] ) {customerIndar.setValue( { fieldId: 'custentity_cfdi_metpago_sat_ent', value: context.paymentSAT['id'] } ); }
      }
      //--------------------------------------------------------------------------------------------------
      if ( context.hasOwnProperty( 'address' ) ) {
        if ( context.address.length > 0 ) {
          for ( var i = 0; i < context.address.length; i++ ) { //  Se introduce las direcciones al addressbook
            if ( Object.keys( context.address[i] ).length > 0 ) {
                var vacios = 0;
                for ( var atributo in context.address[i] ) { //reviso si todos los valores de direccion son "", de ser asi salto esa direccion
                    if ( context.address[i][atributo] )
                       vacios++;
                }
                if( vacios == 0 )
                continue;
                if ( context.address[i].addressID ) {
                  var existe = 0; // variable para verificar si el ID de direcciones del json coincide con alguno existente
                  for ( var j = 0; j < customerIndar.getLineCount('addressbook'); j++) {
                    customerIndar.selectLine( { sublistId: 'addressbook', line: j } );
                    if ( context.address[i].addressID == customerIndar.getCurrentSublistValue( { sublistId: 'addressbook', fieldId: 'id' } ))
                    {
                    existe = 1;
                    break; //para mantener el indice de la linea del selectLine
                    }
                  }
                  if ( existe == 0 )// entra aqui si no existe el id de direccion
                  {
                    throw error.create( { name: ERRORS.NSO_ID_NOT_FOUND.name, message: ERRORS.NSO_ID_NOT_FOUND.message } );
                    continue;
                  }
                }
                else
                customerIndar.selectNewLine( { sublistId: 'addressbook' } ); //nueva direccion
                if ( context.address[i].defaultbilling != '' ) {
                  ( context.address[i].defaultbilling == "T" ) ? valorCheckbox = true: valorCheckbox = false;
                  customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: valorCheckbox });
                  customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'isresidential', value: valorCheckbox });
                }
                if ( context.address[i].defaultshipping != '' ) {
                  ( context.address[i].defaultshipping == "T" ) ? valorCheckbox = true: valorCheckbox = false;
                  customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: valorCheckbox });
                }
                if ( context.address[i].residential != '' ) {
                  ( context.address[i].residential == "T" ) ? valorCheckbox = true: valorCheckbox = false;
                  customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'isresidential', value: valorCheckbox });}
                if ( context.address[i].addr1 ) {
                  customerIndar.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'label', value: context.address[i].addr1 });
                }
                var objSubrecord = customerIndar.getCurrentSublistSubrecord( { sublistId: 'addressbook', fieldId: 'addressbookaddress' } );
                if ( context.address[i].country ) { objSubrecord.setValue( { fieldId: 'country', value: context.address[i].country } ); }
                if ( context.address[i].city ) { objSubrecord.setValue( { fieldId: 'city', value: context.address[i].city } ); }
                if ( context.address[i].state ) { objSubrecord.setValue( { fieldId: 'state', value: context.address[i].state } ); }
                if ( context.address[i].addr1 ) { objSubrecord.setValue({ fieldId: 'addr1', value: context.address[i].addr1 }); }
                if ( context.address[i].addr2 ) { objSubrecord.setValue( { fieldId: 'addr2', value: context.address[i].addr2 } ); }
                if ( context.address[i].noInt ) { objSubrecord.setValue( { fieldId: 'custrecord_fe_numero_interior', value: context.address[i].noInt } ); }
                if ( context.address[i].noExt ) { objSubrecord.setValue( { fieldId: 'custrecord_fe_numero_exterior', value: context.address[i].noExt } ); }
				if ( context.address[i].latitude ) { objSubrecord.setValue( { fieldId: 'custrecord_zindar_latitude', value: context.address[i].latitude } ); }
                if ( context.address[i].longitude ) { objSubrecord.setValue( { fieldId: 'custrecord_zindar_longitude', value: context.address[i].longitude } ); }
                objSubrecord.setValue( { fieldId: 'custrecord_zindarformaenviodireccion', value: context.shippingWay['txt'] } );
              	objSubrecord.setValue( { fieldId: 'custrecord_zindarrutadireccion', value: context.route['txt']  } );
              if ( context.address[i].postalCode ) { objSubrecord.setValue( { fieldId: 'zip',value: context.address[i].postalCode } );}
                customerIndar.commitLine( { sublistId: 'addressbook' } );
            }
          }
        }
      }
      if ( context.hasOwnProperty( 'contacts' ) ) {
        if ( context.contacts.length > 0 ) {
          var contacto = {};
          for ( var i = 0; i < context.contacts.length; i++ ) {
            contacto['contacts'] = [];
            log.debug('Contenido del contactID', context.contacts[i].contactID );
            if ( context.contacts[i].contactID == '' ) {
              contacto['contacts'][0] = context.contacts[i];
              log.debug( 'Contacto A crear', JSON.stringify( contacto ) );
              var contactoCreado = crearContactos( customerIndar.id, contacto );
              log.debug( 'Contacto CREADO', JSON.stringify( contactoCreado ) );
            } else {
              editarContactos( customerIndar, context.contacts[i] );
            }
          }
        }
      }
      var customerID = customerIndar.save( { ignoreMandatoryFields: true } );
      return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Actualización del Cliente Completada' }, 'internalId': customerID };
    } catch ( e ) {
      log.debug( 'PUT', JSON.stringify( e ) );
      var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
      return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_ACTUALIZAR_CUSTOMER ' + errorText }, 'internalId': '' };
    }
  };

  return handler;

 } );