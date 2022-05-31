/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

 define( [ 'SuiteScripts/INDAR SCRIPTS/LWS_HTTP_CONNECTION','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

 function( httpService, error, log, runtime, file, record ) {
 
     function getJsonPoBeforeSubmit( context ) {
 
             log.debug( 'context.type: ' + context.type );
 
       /*  if ( context.type !== context.UserEventType.CREATE &&  context.type !== context.UserEventType.EDIT ) {
 
             return true;
         }*/
 
         try {
             var currentRecord    = context.newRecord;
             var currentRecord    = record.load( { type: currentRecord.type, id: currentRecord.id, isDynamic: false } );
               log.debug( 'type: ', currentRecord.type );
             var valoresCliente = {};
 
           //  var dirTamaño      = currentRecord.getLineCount( { sublistId: 'addressbook' } );
            // var dirLineas      = [];
 
            // var contactsTamaño = currentRecord.getLineCount( { sublistId: 'contactroles' } );
            // var contactsLineas = [];
 
             var userObj = runtime.getCurrentUser();
 
 
           /*  for ( var i = 0 ; i < dirTamaño ; i++ ) {
 
                   var objSubrecord = currentRecord.getSublistSubrecord( { sublistId: 'addressbook', fieldId: 'addressbookaddress', line: i } );
                 dirLineas.push( {
 
                    addressID        : currentRecord.getSublistValue( { sublistId: 'addressbook', line: i, fieldId: 'internalid' } ),
                    country          : objSubrecord.getValue( { fieldId: 'country' } ),
                    addr1            : objSubrecord.getValue( { fieldId: 'addr1' } ),
                    addr2            : objSubrecord.getValue( { fieldId: 'addr2' } ),
                    city             : objSubrecord.getValue( { fieldId: 'city' } ),
                    state            : objSubrecord.getValue( { fieldId: 'state' } ),
                    postalCode       : objSubrecord.getValue( { fieldId: 'zip' } ),
                    defaultbilling   : currentRecord.getSublistValue( { sublistId: 'addressbook', line: i, fieldId: 'defaultbilling' } ),
                    defaultshipping  : currentRecord.getSublistValue( { sublistId: 'addressbook', line: i, fieldId: 'defaultshipping' } ),
                    residential      : currentRecord.getSublistValue( { sublistId: 'addressbook', line: i, fieldId: 'isresidential' } ),
 
                 } );
             }  */
 
            /*  for ( var i = 0 ; i < contactsTamaño ; i++ ) {
 
                 contactsLineas.push( {
 
                    idContact      : currentRecord.getSublistValue( { sublistId: 'contactroles', line: i, fieldId: 'contact' } ),
                    nameContact    : currentRecord.getSublistValue( { sublistId: 'contactroles', line: i, fieldId: 'contactname' } ),
                    email          : currentRecord.getSublistValue( { sublistId: 'contactroles', line: i, fieldId: 'email' } ),
                    idRole         : currentRecord.getSublistValue( { sublistId: 'contactroles', line: i, fieldId: 'role' } ),
 
                 } );
             }*/
 
             valoresCliente = {
                             internalid              : currentRecord.id,
                             numProspect             : currentRecord.getValue( { fieldId : 'custentity_num_prospecto' } ),
                             idNet                   : currentRecord.getValue( { fieldId : 'custentity_nso_id_net' } ),
                             companyId				: currentRecord.getValue( { fieldId : 'entityid' } ),
                             entityId                : currentRecord.getValue( { fieldId : 'id' } ),
                             company                 : currentRecord.getValue( { fieldId : 'companyname' } ),
                             tradeName               : currentRecord.getValue( { fieldId : 'custentity_nombre_comercial' } ),
                             RFC                     : currentRecord.getValue( { fieldId : 'custentity_rfc' } ),
                             account                 : currentRecord.getValue( { fieldId : 'accountnumber' } ),
                             phone                   : currentRecord.getValue( { fieldId : 'phone' } ),
                             email                   : currentRecord.getValue( { fieldId : 'email' } ),
                             creditLimit             : currentRecord.getValue( { fieldId : 'creditlimit' } ),
                             bankReference           : currentRecord.getValue( { fieldId : 'custentity_referencia_bancaria' } ),
                             newPagare               : currentRecord.getValue( { fieldId : 'custentity_pagare_nuevo' } ),
                             ammountPagare           : currentRecord.getValue( { fieldId : 'custentity_monto_pagare' } ),
                             newCustomerBonus        : currentRecord.getValue( { fieldId : 'custentity_bono_cliente_nuevo' } ),
                             limitOrders             : currentRecord.getValue( { fieldId : 'custentity_limite_pedidos' } ),
                             newCreditRequest        : currentRecord.getValue( { fieldId : 'custentity_solicitud_credito_nuevo' } ),
                             shippingWayId           : currentRecord.getValue( { fieldId : 'custentity_forma_envio_cliente' } ),
                             GiroId                  : currentRecord.getValue( { fieldId : 'custentity_giro_cliente' } ),
                             MethodPayment           : currentRecord.getValue( { fieldId : 'custentity_cfdi_metpago_sat_ent' } ),
                             paymentTerms            : currentRecord.getValue( { fieldId : 'custentity_nso_payment_terms' } ),
                             department              : currentRecord.getValue( { fieldId : 'custentity_nso_departamento' } ),
                             extendExpiration        : currentRecord.getValue( { fieldId : 'custentity_recorrer_vencimiento' } ),
                             condition               : currentRecord.getValue( { fieldId : 'custentity_condicion_cliente' } ) ,
                             routeSale               : currentRecord.getValue( { fieldId : 'custentity_indar_ruta_venta' } ) ,
                             route                   : currentRecord.getValue( { fieldId : 'custentity_ruta' } ),
                             crmInfluence            : currentRecord.getValue( { fieldId : 'custentity_crm_influencia' } ) ,
                             CommercialTerms         : currentRecord.getValue( { fieldId : 'custentity_condiciones_comerciales' } ),
                             blockDelinquents        : currentRecord.getValue( { fieldId : 'custentity_bloquear_morosos' } ) ,
                             customerZone            : currentRecord.getValue( { fieldId : 'custentity_zona_cliente' } ) ,
                             status                  : currentRecord.getValue( { fieldId : 'entitystatus' } ) ,
                             countedCustomer         : currentRecord.getValue( { fieldId : 'custentity_cliente_contado' } ) ,
                             package                 : currentRecord.getValue( { fieldId : 'custentity_paqueteria' } ) ,
                             priceList               : currentRecord.getValue( { fieldId : 'pricelevel' } ),
                             datecreated             : currentRecord.getValue( { fieldId : 'custentitycliente_fech_creacion' } ),
                             userID                  : userObj.id ,
                             customerGroup           : currentRecord.getValue( { fieldId : 'custentity_nso_grupo' } ) ,
                             salesRep                : currentRecord.getValue( { fieldId : 'custentity_representaventas' } ) ,
                             salesSupport            : currentRecord.getValue( { fieldId : 'custentity_apoyo_vtas' } ) ,
                             serviceAgent            : currentRecord.getValue( { fieldId : 'custentity_auxiliar_cobranza' } ) ,
                             AccountingAssistant     : currentRecord.getValue( { fieldId : 'custentity_auxiliar_cobranza' } ),
                             lastmodifieddate        : currentRecord.getValue( { fieldId : 'lastmodifieddate' } ),
                             CategoryId                : currentRecord.getValue( { fieldId : 'category' } ) ,
                             latitud                 :currentRecord.getValue( { fieldId : 'custentityzindar_latitud' } ),
                               longitud				:currentRecord.getValue( { fieldId : 'custentityzindar_longitud' } ),
                            isInactive              :currentRecord.getValue( { fieldId : 'isinactive' } )
 
 
 
 
 
 
 
 
 
 
                             
                         /*
 
 
 
                               
                             name                    : currentRecord.getValue( { fieldId : 'firstname' } ),
                             lastName                : currentRecord.getValue( { fieldId : 'lastname' } ),
                             
                             
                             
                             
                             
                             
                             
                             
                             creditDays              : currentRecord.getValue( { fieldId : 'daysoverdue' } ),
                             //currencyCredits         : currentRecord.getValue( { fieldId : 'custentity_def_moneda_credito_moneda' } ),
                             
                             ammountPagare           : currentRecord.getValue( { fieldId : 'custentity_monto_pagare' } ),
                             financialDiscount       : currentRecord.getValue( { fieldId : 'custentity_descuento_financiero' } ),
                             checkCredit             : currentRecord.getValue( { fieldId : 'custentity_checar_credito' } ),
                             
                             //creditWithLimit         : currentRecord.getValue( { fieldId : 'custentity_credito_con_limite' } ),
                             //creditWithDays          : currentRecord.getValue( { fieldId : 'custentity_credito_con_dias' } ),
                             //creditWithConditions    : currentRecord.getValue( { fieldId : 'custentity_credito_con_condiciones' } ),
                             //partialOrders           : currentRecord.getValue( { fieldId : 'custentity_pedidos_parciales' } ),
                             //discountSurcharges      : currentRecord.getValue( { fieldId : 'custentity_descuento_recargos' } ),
                             
                             
                             newCustomerBonus        : currentRecord.getValue( { fieldId : 'custentity_bono_cliente_nuevo' } ),
                            
                             //specialCredit           : currentRecord.getValue( { fieldId : 'custentity_credito_especial' } ),
                             //crmMovSale              : currentRecord.getValue( { fieldId : 'custentity_crm_mov_venta' } ),
                             
                             datecreated             : currentRecord.getValue( { fieldId : 'custentitycliente_fech_creacion' } ),
                             lastmodifieddate        : currentRecord.getValue( { fieldId : 'lastmodifieddate' } ),
 
                             user                    : { id: userObj.id ,
                                                        txt: userObj.name },
 
                             category                : { id: currentRecord.getValue( { fieldId : 'category' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'category' } ) },
 
                              paymentTerms           : { id: currentRecord.getValue( { fieldId : 'custentity_nso_payment_terms' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_nso_payment_terms' } ) },
 
                              methodPayment          : { id: currentRecord.getValue( { fieldId : 'custentity_cfdi_metpago_sat_ent' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_cfdi_metpago_sat_ent' } ) },
 
                              department             : { id: currentRecord.getValue( { fieldId : 'custentity_nso_departamento' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_nso_departamento' } ) },
 
                             condition              : { id: currentRecord.getValue( { fieldId : 'custentity_condicion_cliente' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_condicion_cliente' } ) },
 
                             customerGroup           : { id: currentRecord.getValue( { fieldId : 'custentity_nso_grupo' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_nso_grupo' } ) },
 
                             routeSale               : { id: currentRecord.getValue( { fieldId : 'custentity_indar_ruta_venta' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_indar_ruta_venta' } ) },
 
                             route                   : { id: currentRecord.getValue( { fieldId : 'custentity_ruta' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_ruta' } ) },
 
                             shippingWay             : { id: currentRecord.getValue( { fieldId : 'custentity_forma_envio_cliente' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_forma_envio_cliente' } ) },
 
                             crmInfluence            : { id: currentRecord.getValue( { fieldId : 'custentity_crm_influencia' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_crm_influencia' } ) },
 
                             commercialTerms         : { id: currentRecord.getValue( { fieldId : 'custentity_condiciones_comerciales' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_condiciones_comerciales' } ) },
 
                             blockDelinquents        : { id: currentRecord.getValue( { fieldId : 'custentity_bloquear_morosos' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_bloquear_morosos' } ) },
 
                             salesRep                : { id: currentRecord.getValue( { fieldId : 'salesrep' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'salesrep' } ) },
 
                             customerZone             : { id: currentRecord.getValue( { fieldId : 'custentity_zona_cliente' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_zona_cliente' } ) },
 
                             status                  : { id: currentRecord.getValue( { fieldId : 'entitystatus' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'entitystatus' } ) },
 
                             countedCustomer         : { id: currentRecord.getValue( { fieldId : 'custentity_cliente_contado' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_cliente_contado' } ) },
 
                          
                            limitOrders         : { id: currentRecord.getValue( { fieldId : 'custentity_limite_pedidos' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_limite_pedidos' } ) },
 
                             salesSupport            : { id: currentRecord.getValue( { fieldId : 'custentity_apoyo_ventas' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_apoyo_ventas' } ) },
 
                             serviceAgent            : { id: currentRecord.getValue( { fieldId : 'custentity_apoyo_ventas' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_apoyo_ventas' } ) },
 
                             accountingAssistant     : { id: currentRecord.getValue( { fieldId : 'custentity_auxiliar_cobranza' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_auxiliar_cobranza' } ) },
 
                             package                 : { id: currentRecord.getValue( { fieldId : 'custentity_paqueteria' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_paqueteria' } ) },
 
                             priceList               : { id: currentRecord.getValue( { fieldId : 'pricelevel' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'pricelevel' } ) },
 
                             giro                    : { id: currentRecord.getValue( { fieldId : 'custentity_giro_cliente' } ) ,
                                                        txt: currentRecord.getText( { fieldId : 'custentity_giro_cliente' } ) },
                               latitud                 :currentRecord.getValue( { fieldId : 'custentityzindar_latitud' } ),
                               longitud				:currentRecord.getValue( { fieldId : 'custentityzindar_longitud' } )
               
                                     */
                         };
 
             log.debug( 'JSON CLIENTE', JSON.stringify( valoresCliente ) );
            // valoresCliente.lineInfo = { address : dirLineas, contacts: contactsLineas };
             valoresCliente          = JSON.stringify( valoresCliente );
             var archivo = generaArchivo(valoresCliente, currentRecord.getValue({ fieldId: 'entityid' }));
             try{
                 httpService.post('Customer​/ReceiveCustomer', valoresCliente );
             } catch ( ex ){
                 log.error( 'Error al subir el archivo en el servidor HTTP',ex );
                 var archivo = generaArchivo(valoresCliente, currentRecord.getValue({ fieldId: 'entityid' }));
             }
 
         }  catch ( ex ){
             log.error( 'Error en la creación y guardado del JSON en netsuite', ex );
         }
             ///--------------------------- consumir servicio FTP --------------------------//
 
         // try {
 
         //     var fileObj = file.load( { id: archivo } );
         //     indr_sftp.upLoad( fileObj, currentRecord.getValue( { fieldId : 'entityid' } ) +'.json', 'CUSTOMER' );
         //     var downLoad = indr_sftp.downLoad( currentRecord.getValue( { fieldId : 'entityid' } ) +'.json', 'CUSTOMER' );
         //     log.debug('DOWNLOAD', downLoad );
         //     currentRecord.setValue( { fieldId : 'custitem_nso_intgrcn_sncrnzd', value : true } );
 
         // } catch ( ex ) {
 
         //     currentRecord.setValue( { fieldId : 'custitem_nso_intgrcn_sncrnzd', value : false } );
         //     log.error( 'Error al subir el archivo en el servidor FTP',ex );
 
         // }
 
     }
 
      function generaArchivo( contenido, nombreArchivo) {
 
         var fileObjPDF = null,
             fileObj = file.create( {
                 name:        nombreArchivo + '.json',
                 fileType:    file.Type.PLAINTEXT,
                 contents:    contenido,
                 description: 'Archivo .json pra la inegración Clientes',
                 encoding:     file.Encoding.UTF8,
                 folder:       12557518,
                 isOnline:     true
             });
         return fileObj.save();
     }
 
     return {
         afterSubmit: getJsonPoBeforeSubmit
     };
 });