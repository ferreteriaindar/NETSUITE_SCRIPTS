/**
- NombreArchivo: NSO_integracionpowms_ue.js
- NombreScript: NSO | integación SO - WMS
- IdScript: customscript_nso_ue_integ_sowms
- Implementación: customdeploy_nso_ue_integ_sowms
- Descripción: Genera un Json con los valores de la orden de venta y los almacena en un archivo
- RVELASCO :  Se modifica  para mandar por web service en vez del FTP , y si hay error se genera archivo JSON en el FILECABINET
- Autor: Itzadiana Morales Rivera
- Biblioteca:
- Lenguaje: Javascript
- FechaCreación: 2019/Febrero/26
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

define( [ 'SuiteScripts/INDAR SCRIPTS/httpService','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

function( httpService, error, log, runtime, file, record ) {

    function getJsonSoAfterSubmit( context ) {

            log.debug( 'context.type: ',context.type );

        if ( context.type !== context.UserEventType.CREATE &&  context.type !== context.UserEventType.EDIT && context.type !== context.UserEventType.APPROVE ) {

            return true;
        }

        try {

            var current_record    = context.newRecord;
            var currentRecord = record.load( { type: record.Type.SALES_ORDER, id: current_record.id } );
            var estatus       = currentRecord.getValue( { fieldId : 'orderstatus' } );

            log.debug( 'estatus: ', estatus );

            if ( estatus == 'A' ) {
              return true;
            }
            var valoresOv     = {};
            var tamaño        = currentRecord.getLineCount( { sublistId: 'item' } );
            var lineas          = [];
            for ( var i = 0 ; i < tamaño ; i++) {

                lineas.push( {

                   amount                              : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'amount' } ),
                   custcol_nso_indr_sales_min_price    : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'custcol_nso_indr_sales_min_price' } ),
                   grossamt                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'grossamt' } ),
                   isclosed                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'isclosed' } ),
                   item                                : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } ),
                   itemText                            : currentRecord.getSublistText( { sublistId: 'item', line: i, fieldId: 'item' } ),
                   itempacked                          : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itempacked' } ),
                   itempicked                          : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itempicked' } ),
                   itemsubtype                         : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itemsubtype' } ),
                   itemtype                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'itemtype' } ),
                   line                                : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'line' } ),
                   lineuniquekey                       : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'lineuniquekey' } ),
                   linked                              : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'linked' } ),
                   linkedordbill                       : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'linkedordbill' } ),
                   linkedshiprcpt                      : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'linkedshiprcpt' } ),
                   quantity                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ),
                   quantitybilled                      : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantitybilled' } ),
                   rate                                : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'rate' } ),
                   tax1amt                             : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'tax1amt' } ),
                   taxcode                             : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode' } ),
                   taxcode_display                     : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode_display' } ),
                   taxrate1                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxrate1' } ),
                   units                               : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'units' } ),
                   units_display                       : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'units_display' } ),
                   unitslist                           : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'unitslist' } ),
                   quantitybackordered                 : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantitybackordered' } ),
                   quantitycommitted                   : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantitycommitted' } ),
                   quantityfulfilled                   : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } ),

                });
            }

            valoresOv = {
                            baserecordtype                     : currentRecord.getValue( { fieldId : 'baserecordtype' } ),

                            currency                         : { id: currentRecord.getValue( { fieldId : 'currency' } ) ,
                                                                 txt: currentRecord.getText( { fieldId : 'currency' } ) },

                            currencysymbol                     : currentRecord.getValue( { fieldId : 'currencysymbol' } ),
                            custbody_cancelcfdi                : currentRecord.getValue( { fieldId : 'custbody_cancelcfdi' } ),
                            custbody_cfdi_anticipo             : currentRecord.getValue( { fieldId : 'custbody_cfdi_anticipo' } ),
                            custbody_cfdi_carta_porte          : currentRecord.getValue( { fieldId : 'custbody_cfdi_carta_porte' } ),
                            custbody_cfdi_comercio_exterior    : currentRecord.getValue( { fieldId : 'custbody_cfdi_comercio_exterior' } ),
                            custbody_cfdi_confimacion          : currentRecord.getValue( { fieldId : 'custbody_cfdi_confimacion' } ),
                            custbody_cfdi_timbrada             : currentRecord.getValue( { fieldId : 'custbody_cfdi_timbrada' } ),
                            custbody_cfdi_xml_valido           : currentRecord.getValue( { fieldId : 'custbody_cfdi_xml_valido' } ),
                            custbody_nsapc_antp_aplicado       : currentRecord.getValue( { fieldId : 'custbody_nsapc_antp_aplicado' } ),
                            custbody_nsapc_aplicar_descuento   : currentRecord.getValue( { fieldId : 'custbody_nsapc_aplicar_descuento' } ),
                            custbody_nsme_nobalanceimpact      : currentRecord.getValue( { fieldId : 'custbody_nsme_nobalanceimpact' } ),
                            custbody_nso_due_condition         : currentRecord.getValue( { fieldId : 'custbody_nso_due_condition' } ),
                            custbody_nso_entity_type           : currentRecord.getValue( { fieldId : 'custbody_nso_entity_type' } ),
                            custbody_nso_indr_discount_approval: currentRecord.getValue( { fieldId : 'custbody_nso_indr_discount_approval' } ),
                            custbody_nso_payment_terms         : currentRecord.getValue( { fieldId : 'custbody_nso_payment_terms' } ),
                            class                              : currentRecord.getValue( { fieldId : 'class' } ),

                            department                         : { id: currentRecord.getValue( { fieldId : 'department' } ) ,
                                                                 txt: currentRecord.getText( { fieldId : 'department' } ) },
                                                                 
                            discounttotal                      : currentRecord.getValue( { fieldId : 'discounttotal' } ),
                            duedays                            : currentRecord.getValue( { fieldId : 'duedays' } ),
                            entity                             : currentRecord.getValue( { fieldId : 'entity' } ),
                            entityname                         : currentRecord.getValue( { fieldId : 'entityname' } ),
                            exchangerate                       : currentRecord.getValue( { fieldId : 'exchangerate' } ),
                            id                                 : currentRecord.getValue( { fieldId : 'id' } ),
 
                            location                           : { id: currentRecord.getValue( { fieldId : 'location' } ) ,
                                                                 txt: currentRecord.getText( { fieldId : 'location' } ) },

                            orderstatus                        : currentRecord.getValue( { fieldId : 'orderstatus' } ),
                            shipdate                           : currentRecord.getValue( { fieldId : 'shipdate' } ),
                            status                             : currentRecord.getValue( { fieldId : 'status' } ),
                            statusRef                          : currentRecord.getValue( { fieldId : 'statusRef' } ),

                            subsidiary                         : { id: currentRecord.getValue( { fieldId : 'subsidiary' } ) ,
                                                                 txt: currentRecord.getText( { fieldId : 'subsidiary' } ) },

                            custbody_forma_de_envio            : { id: currentRecord.getValue( { fieldId : 'custbody_forma_de_envio' } ) ,
                                                                 txt: currentRecord.getText( { fieldId : 'custbody_forma_de_envio' } ) },

                            custbody_paqueteria                : { id: currentRecord.getValue( { fieldId : 'custbody_paqueteria' } ) ,
                                                                 txt: currentRecord.getText( { fieldId : 'custbody_paqueteria' } ) },

                            subtotal                           : currentRecord.getValue( { fieldId : 'subtotal' } ),
                            taxtotal                           : currentRecord.getValue( { fieldId : 'taxtotal' } ),
                            terms                              : currentRecord.getValue( { fieldId : 'terms' } ),
                            total                              : currentRecord.getValue( { fieldId : 'total' } ),
                            trandate                           : currentRecord.getValue( { fieldId : 'trandate' } ),
                            tranid                             : currentRecord.getValue( { fieldId : 'tranid' } ),
                            transactionnumber                  : currentRecord.getValue( { fieldId : 'transactionnumber' } ),
                            type                               : currentRecord.getValue( { fieldId : 'type' } ),
                            unbilledorders                     : currentRecord.getValue( { fieldId : 'unbilledorders' } ),
                            shipaddress                        : currentRecord.getValue( { fieldId : 'shipaddress' } ),
                            billaddress                        : currentRecord.getValue( { fieldId : 'billaddress' } ),
                        }; 

            valoresOv.lineitems = { item:lineas };
            valoresOv           = JSON.stringify( valoresOv );
           
      
            httpService.post('api/SaleOrder/Insert', valoresOv );        

           


        }  catch ( ex ){
            log.error( ex );
           generaArchivo( valoresOv, currentRecord.getValue( { fieldId : 'tranid' } ) );
        }
    }

     function generaArchivo( contenido, nombreArchivo ) {

      try {

        var fileObjPDF = null,
            fileObj = file.create( {
                name:        nombreArchivo + '.json',
                fileType:    file.Type.PLAINTEXT,
                contents:    contenido,
                description: 'Archivo .json pra la inegración de órdenes de Venta',
                encoding:     file.Encoding.UTF8,
                folder:       64,
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