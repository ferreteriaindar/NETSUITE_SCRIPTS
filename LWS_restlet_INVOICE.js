/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

//define( [ 'SuiteScripts/sftp/indr_sftp','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

define(['SuiteScripts/INDAR SCRIPTS/LWS_HTTP_CONNECTION','N/util',  'N/error', 'N/log', 'N/runtime', 'N/file', 'N/record','N/search'],

    //function( indr_sftp, error, log, runtime, file, record ) {
    function (httpService,util,  error, log, runtime, file, record,search) {
        function getJsonPoAfterSubmit(context) {

            log.debug('context.type: ' + context.UserEventType);

           /* if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {

                return true;
            } */
            try {
                log.debug('entraProceso');
                var currentRecordAux = context.newRecord;
                var currentRecord = record.load({ type: currentRecordAux.type, id: currentRecordAux.id });
                var Invoice = {};
                var Factura={};

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
                    //busca los pdf y xml

                    var urls =regresarURLS(currentRecord.getValue({ fieldId: 'custbody_fe_sf_xml_sat' }),currentRecord.getValue({ fieldId: 'custbody_fe_sf_pdf' }));
                   // log.error('urls 0',urls[0]);
                   // log.error('urls 1',urls[1]);
                    log.error('urls',urls);
                Invoice = {
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
                    TipoPedido:Number( currentRecord.getValue({fieldId:'custbody_nso_tipo_orden'})),
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
                    CustbodyRefpdf: currentRecord.getValue({fieldId: 'custbody_fe_sf_pdf'}),
                    CfdiMetPagoSat: currentRecord.getText({fieldId:'custbody_cfdi_metpago_sat'}),
                    CFDIFormaDePago: currentRecord.getText({fieldId:'custbody_cfdi_formadepago'}),
                    UsoCFDI: currentRecord.getText({fieldId:'custbody_uso_cfdi'}),
                    currencysymbol: currentRecord.getText({fieldId:'currencysymbol'}),
                    cfdiComentario: currentRecord.getValue({fieldId:'custbody_fe_sf_codigo_respuesta'}),
                    responseCfdi: currentRecord.getValue({fieldId:'custbody_fe_sf_mensaje_respuesta'}),
                    wmsclave: currentRecord.getValue({fieldId:'custbody_zindar_wmsclave'}),
                    urlXML:     urls.length>0? urls[0]:'',
                    urlPDF:    urls.length>0? urls[1]:'',
                  TipoEntrega: currentRecord.getValue({fieldId:'custbody_zindar_tipo_entrega'})
                   
                };
              //  Invoice.lineItems= { item:lineas };
              log.error('XML',Invoice.urlXML);
              log.error('PDF',Invoice.urlsPDF);
              Factura.Invoice=Invoice; // JSON.stringify(Invoice);
              Factura.InvoicesDetail=lineas;
      // log.error('json',JSON.stringify(Factura));
       Factura=JSON.stringify(Factura);
                var startTime = util.nanoTime();
           
                 httpService.post('Invoice​/InvoiceInsertLWS', Factura );
               
              var elapsedTime = (util.nanoTime() - startTime)/1000000000.0;
              log.error("ElapsedTimer",elapsedTime);
               generaArchivo(Factura, currentRecord.getValue({ fieldId: 'tranid' }));

            } catch (ex) {
                log.error('Error en la creación y guardado del JSON en netsuite', ex);
                 var elapsedTime = (util.nanoTime() - startTime)/1000000000.0;
              log.error("ElapsedTime Catch",elapsedTime);
               // var archivo = generaArchivo(Factura, currentRecord.getValue({ fieldId: 'tranid' }));
            }
      
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
                var idLot = result.getText({
                name: 'inventorynumber'
                });
                var cant=result.getValue({
                    name: 'quantity'
                    });
                log.error('Lote','No. Lote '+idLot+' Cant.='+cant);
                cadenafinal=cadenafinal+'No. Ped. '+idLot+' Cant.='+cant+' ';
                });
                return cadenafinal;

        }



        function regresarURLS(idXML,idPDF)
        {
            var urlsaux=[]
            //log.error('regresaURLS','si');  
            if(idXML!='' && idPDF!='')
           {
                var archivo= file.load({id:idXML});
                log.error('esOFFILINE',archivo.isOnline);
                if(archivo.isOnline==false)
                {
                //  log.error('lo hace vivo', 'si')
                    archivo.isOnline = true;
                    idarchivo = archivo.save();
                    archivo =  file.load({id:idarchivo});
                }
            //   log.error('archivourl',archivo.url);
                urlsaux.push("https://5327814.app.netsuite.com"+archivo.url);


                var archivo2= file.load({id:idPDF});
            //   log.error('esOFFILINE',archivo2.isOnline);
                if(archivo2.isOnline==false)
                {
                //    log.error('lo hace vivo', 'si')
                    archivo2.isOnline = true;
                    idarchivo2 = archivo2.save();
                    archivo2 =  file.load({id:idarchivo2});
                }
            //  log.error('archivo2url',archivo2.url);
                urlsaux.push("https://5327814.app.netsuite.com"+archivo2.url);
            }
            return urlsaux;
        

        }

        function generaArchivo(contenido, nombreArchivo) {

            /*
                fileObj = file.create({
                    name: nombreArchivo + '.json',
                    fileType: file.Type.PLAINTEXT,
                    contents: contenido,
                    description: 'Archivo .json pra la inegración Artículos de inventario',
                    encoding: file.Encoding.UTF8,
                    folder: 12538682,
                    isOnline: true
                });
            return fileObj.save();*/
            
         var   fileObj = file.create({
                name: nombreArchivo + '.json',
                fileType: file.Type.PLAINTEXT,
                contents: contenido,
                description: 'Archivo .json pra la inegración Artículos de inventario',
                encoding: file.Encoding.UTF8,
                folder: 12538682,
                isOnline: true
            });
        return fileObj.save();
        }

        return {
            afterSubmit: getJsonPoAfterSubmit
        };
    }
);