/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

//define( [ 'SuiteScripts/sftp/indr_sftp','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

define(['SuiteScripts/INDAR SCRIPTS/httpService','N/util', 'N/search', 'N/error', 'N/log', 'N/runtime', 'N/file', 'N/record'],

    //function( indr_sftp, error, log, runtime, file, record ) {
    function (httpService,util, search, error, log, runtime, file, record) {
        function getJsonPoAfterSubmit(context) {

         //   log.debug('context.type: ' + context.UserEventType);

           /* if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {

                return true;
            } */
            try {
                log.debug('entraProceso');
                var currentRecordAux = context.newRecord;
                var currentRecord = record.load({ type: currentRecordAux.type, id: currentRecordAux.id });
                var valoresFactura = {};
                var tamaño        = currentRecord.getLineCount( { sublistId: 'item' } );
                var lineas          = [];
                for ( var i = 0 ; i < tamaño ; i++) {

                    var LoteAux='';
                  //log.error('LOTE',currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'inventorydetailreq' } ));
                  if(currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'inventorydetailreq' } )=='T')
                    {
                      log.error('Lote','ENTRA');
                  LoteAux=RegresaLotes(currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'inventorydetail' } ));
                    }
                    
                    //LOTE VALIDA  SI  TIENEN INFORMACION SI NO PONE  VACIO
                    lineas.push( {
                        item                                :Number(currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } )),
                        amount                              : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'amount' } ),
                        rate                                : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'rate' } ),
                        tax1amt                             : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'tax1amt' } ),
                        taxcode                             : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode' } ),
                        taxcode_display                     : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode_display' } ),
                        taxrate1                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxrate1' } ),
                        quantity                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ),
                        grossamt                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'grossamt' } ), 
                        DiscountTotal                       : currentRecord.getSublistValue( { sublistId: 'item', line: i,fieldId: 'custcol_nso_descuento'}),
                        isclosed                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'isclosed' } ),
                        lote                                : LoteAux

                    });
                            
                    
                }
               log.debug('TRANID',Number( currentRecord.getValue({ fieldId: 'tranid' })));
                valoresFactura = {
                    internalId: currentRecord.getValue({fieldId:'id'}),
                    TranId:Number( currentRecord.getValue({ fieldId: 'tranid' })),
                    TranType: currentRecord.getValue({fieldId:'baserecordtype'}),
                    Status:        currentRecord.getValue( { fieldId : 'status' } ),
                    Entity: Number(currentRecord.getValue({fieldId:'entity'})),
                    TranDate: currentRecord.getValue({fieldId:'createddate'}),
                    Memo: currentRecord.getValue({fieldId:'memo'}),
                    SubTotal: currentRecord.getValue({fieldId:'subtotal'}),
                    DiscountTotal: currentRecord.getValue({fieldId:'discounttotal'}),
                    TaxTotal: currentRecord.getValue({fieldId:'taxtotal'}),
                    Total: currentRecord.getValue({fieldId:'total'}),
                    DescuentoTotalImporte: currentRecord.getValue({fieldId:'custbody_nso_indr_total_discount'}),
                    DescuentoTotalPP: currentRecord.getValue({fieldId:'custbody_nso_indr_client_discount'}),
                    DescuentoEspecial: currentRecord.getValue({fieldId:'custbody_descuento_especial'}),
                    DescuentoEvento: currentRecord.getValue({fieldId:'custbody_descuento_evento'}),
                    AutorizacionEspecial: currentRecord.getValue({fieldId:'custbody_autorizacion_especial'}),
                    AmountDue: currentRecord.getValue({fieldId:'amountremainingtotalbox'}),
                    SaleDate: currentRecord.getValue({fieldId:'saleseffectivedate'}),
                    LeadSource: currentRecord.getValue({fieldId:'leadsource'}),
                    DepartamentoCliente: currentRecord.getValue({fieldId:'custbody2'}),
                    TipoPedido:Number( currentRecord.getValue({fieldId:'custbody_tipo_pedido'})),
                   // ClienteContado: Number( currentRecord.getValue({fieldId:'custbody_tipo_pedido'})),
                   ClienteContado:  currentRecord.getValue({fieldId:'custbody_cte_contado'})=='Crédito'?0:1,
                    RFC: currentRecord.getValue({fieldId:'custbody_rfc'}),
                   // UUID: currentRecord.getValue({fieldId:'custbody_uuid'}),
                     UUID: currentRecord.getValue({fieldId:'custbody_fe_uuid_cfdi_33'}),
                    OrdenCompra: currentRecord.getValue({fieldId:'custbody_orden_compra'}),
                    Usuario: currentRecord.getValue({fieldId:'custbody_inter'}),
                    createdfrom:Number( currentRecord.getValue({fieldId:'createdfrom'})),
                    ShipCarrier: currentRecord.getValue({fieldId:'shipcarrier'}),
                    ShippingWay:Number( currentRecord.getValue({fieldId:'custbody_forma_de_envio'})),
                    Paqueteria:Number( currentRecord.getValue({fieldId:'custbody_paqueteria'})),
                    FechaRecepcionCliente: currentRecord.getValue({fieldId:'custbody_nso_indr_receipt_date'}),
                    ShipAddress: currentRecord.getValue({fieldId:'shipaddress'}),
                    TerminosPago:Number(currentRecord.getValue({fieldId:'custbody_nso_payment_terms'})),
                    CondicionVencimiento:Number( currentRecord.getValue({fieldId:'custbody_nso_due_condition'})),
                    FechaVencimiento: currentRecord.getValue({fieldId:'duedate'}),
                    BillAddress: currentRecord.getValue({fieldId:'billaddress'}),
                    ExchangeRate: currentRecord.getValue({fieldId:'exchangerate'}),
                    Currency:Number( currentRecord.getValue({fieldId:'currency'})),
                    FechaProntoPago:  currentRecord.getValue({fieldId:'custbody_nso_indr_discount_date'}),
                    AprobacionDescuentos: currentRecord.getValue({fieldId:'custbody_nso_indr_discount_approval'}),
                    custbody_refpdf: currentRecord.getValue({fieldId: 'custbody_refpdf'}),
                  	custbody_cfdi_metpago_sat: currentRecord.getText({fieldId:'custbody_cfdi_metpago_sat'}),
                    custbody_cfdi_formadepago: currentRecord.getText({fieldId:'custbody_cfdi_formadepago'}),
                    custbody_uso_cfdi: currentRecord.getText({fieldId:'custbody_uso_cfdi'}),
                    currencysymbol: currentRecord.getText({fieldId:'currencysymbol'}),
                    cfdiComentario: currentRecord.getValue({fieldId:'custbody_fe_sf_codigo_respuesta'}),
                    responseCfdi: currentRecord.getValue({fieldId:'custbody_fe_sf_mensaje_respuesta'}),
                    wmsclave: currentRecord.getValue({fieldId:'custbody_zindar_wmsclave'})
                };
                valoresFactura.lineItems= { item:lineas };
                valoresFactura = JSON.stringify(valoresFactura)
            //   log.debug('JSON',valoresFactura);
                //var archivo = generaArchivo(valoresFactura, currentRecord.getValue({ fieldId: 'tranid' }));
                var startTime = util.nanoTime();
              if(currentRecord.getValue({fieldId:'id'})>77535)
               {log.error('id','no es SI')
                 httpService.post('api/Invoice/InsertInvoice', valoresFactura );
               }
              var elapsedTime = (util.nanoTime() - startTime)/1000000000.0;
              log.error("ElapsedTimer",elapsedTime);
               generaArchivo(valoresFactura, currentRecord.getValue({ fieldId: 'tranid' }));

            } catch (ex) {
                log.error('Error en la creación y guardado del JSON en netsuite', ex);
                 var elapsedTime = (util.nanoTime() - startTime)/1000000000.0;
              log.error("ElapsedTime Catch",elapsedTime);
                var archivo = generaArchivo(valoresFactura, currentRecord.getValue({ fieldId: 'tranid' }));
            }
            ///--------------------------- consumir servicio FTP --------------------------//


            /*
            var myPswGuid = "1a92c243a88b41ec8834a550303460cd";
            var myHostKey = "AAAAB3NzaC1yc2EAAAABIwAAAIEA1JUi/fJG26oES9hJSWDrvw7CXvXJXmCUwSWqWMZqXHgrCKmAKZE+GfPpWCiMegFw1eXZslL4mO6tWRK6hprXfzQTmXFkERi7zbjMyPcNjcNvWxa6EjkRJkbkpTnMpqaG2c2MLIErwuUTa1xH1gntEyxJ0CjPuHmsZE/MMERTYbk=";
            var conn = sftp.createConnection(//valoresFTP
                {
                    username: 'netsuite',
                    passwordGuid: myPswGuid,
                    url: 'indarftp.dyndns.org',
                    port: 7000,
                    directory: '/WMS/INVOICE',
                    hostKey: myHostKey,
                    hostKeyType: 'rsa'
                });


            conn.upload({
                'file': file.load( { id: archivo } ),
                'replaceExisting': true
            });
                */
        }



        function  RegresaLotes(inventorydetailId)
        {
            var cadenafinal='';
            var searchLot = search.create({
                type: 'inventorydetail',
                filters: [ ["internalid","anyof",inventorydetailId]],
                columns: ['inventorynumber','quantity']
            });
            searchLot.run().each(function(result) {
                var id = result.getText({
                name: 'inventorynumber'
                });
                var cant=result.getValue({
                    name: 'quantity'
                    });
                log.error('Lote','No. Lote '+id+' Cant.='+cant);
                cadenafinal=cadenafinal+'No. Lote '+id+' Cant.='+cant+' ';
                });
			return cadenafinal;

        }

        function getSFTPConf(directory) {

            // log.debug('directory', directory);
            var setupSFTPRec = search.create({
                type: 'customrecord_indar_sftp_configuracion',
                filters: [['isinactive', 'is', 'F'], 'AND', ['custrecord_sftppd_parent.name', 'is', directory]],
                columns: ['custrecord_indar_sftp_username', 'custrecord_indar_sftp_passguid', 'custrecord_indar_sftp_url',
                    'custrecord_indar_sftp_hostkey', 'custrecord_indar_sftp_hostkeytype', 'custrecord_indar_sftp_portnumber',
                    'custrecord_sftppd_parent.custrecord_sftppd_directory', 'custrecord_sftppd_parent.name']
            }).
                run().getRange({ start: 0, end: 1 })[0]

            if (setupSFTPRec) {
                return {
                    username: setupSFTPRec.getValue('custrecord_indar_sftp_username'),
                    passwordGuid: "c7e20831f1e5414fbb78b3706953fea1",//setupSFTPRec.getValue('custrecord_indar_sftp_passguid'),
                    url: setupSFTPRec.getValue('custrecord_indar_sftp_url'),
                    hostKey: setupSFTPRec.getValue('custrecord_indar_sftp_hostkey'),
                    hostKeyType: setupSFTPRec.getValue('custrecord_indar_sftp_hostkeytype'),
                    port: Number(setupSFTPRec.getValue('custrecord_indar_sftp_portnumber')),
                    directory: setupSFTPRec.getValue({ join: 'custrecord_sftppd_parent', name: 'custrecord_sftppd_directory' })
                };
            }
            return {};
        }

        function generaArchivo(contenido, nombreArchivo) {

            var fileObjPDF = null,
                fileObj = file.create({
                    name: nombreArchivo + '.json',
                    fileType: file.Type.PLAINTEXT,
                    contents: contenido,
                    description: 'Archivo .json pra la inegración Artículos de inventario',
                    encoding: file.Encoding.UTF8,
                    folder: 57,
                    isOnline: true
                });
            return fileObj.save();
        }

        return {
            afterSubmit: getJsonPoAfterSubmit
        };
    }
);