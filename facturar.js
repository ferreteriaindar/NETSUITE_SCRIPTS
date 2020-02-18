/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope Public
 *@Autor ROBERTO VELASCO LARIOS & MISAEL LARIOS G
 *@Company INDAR PERROS
 */

define(['SuiteScripts/INDAR SCRIPTS/httpService','N/error', 'N/record', 'N/format', 'N/search', 'N/log'], function (httpService,error, record, format, search, log) {

    var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
        NSO_LOST_PARAMETER: { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }
    };



    handler.post = function (context) {
        //log("billing sales order: " + salesOrderInternalId);
        try {
            log.debug(context.salesOrderInternalId);
            // var billRecord = nlapiTransformRecord('salesorder', salesOrderInternalId, 'invoice', {'recordmode': 'dynamic'});
            var billRecord = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: context.salesOrderInternalId,
                toType: record.Type.INVOICE,
                isDynamic: true
            });


        } catch (e) {
            // error("error converting sales order to invoice: " + salesOrderInternalId);
            log.error('POST', JSON.stringify(e));
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_SALESORDER ' }, 'internalId': '' };
        }
        try {

            billRecord.setValue('custbody_nso_due_condition',3);
            var hoy = new Date();
            var receipt_date2 = format.parse( hoy, 'date' );
            billRecord.setValue('custbody_nso_indr_receipt_date',receipt_date2);
            var idInvoice = billRecord.save({ ignoreMandatoryFields: true });
            log.debug('NSO_ID_SALES_ORDER_CREATE', idInvoice);
            SendInvoice(idInvoice);
            return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Creación de la Orden de Venta Completada.' }, 'internalId': idInvoice };
        } catch (e) {
            // error("error creating sales order: " + salesOrderInternalId)
            log.error('POST2', JSON.stringify(e));
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_BILL.' }, 'internalId': '' };
        }
    };




    handler.put = function( context ) {

        try {

           // validateContext(context);
            var invoice = record.load( { type: 'invoice', id: context.internalId, isDynamic: true } );
            if(!invoice)
            throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message +' : No existe factura con ese internalId:'+context.internalId } );
            if(context.hasOwnProperty('custbody_nso_indr_receipt_date') && context.custbody_nso_indr_receipt_date){
                var receipt_date = format.parse( context.custbody_nso_indr_receipt_date, 'date' );
               invoice.setValue('custbody_nso_indr_receipt_date',receipt_date);
            }
           invoice.save();
          // SendInvoice(invoice.internalId);
           return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Fecha de Vencimiento Actualizada' }, 'internalId': invoice.internalId };

        } catch (error) {
            log.debug( 'PUT', JSON.stringify( error ) );
            var errorText = 'ERROR CODE: ' + error.name + '\nDESCRIPTION: ' + error.message;
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR insertar FECHA VENCIMIENTO' + errorText }, 'internalId': '' };
        }

    };


    function SendInvoice(idinvoice)
    {

        try
        {
        var invoice =  record.load( { type: 'invoice', id: idinvoice, isDynamic: true } );

            var valoresFactura = {};
            var tamaño        = invoice.getLineCount( { sublistId: 'item' } );
            var lineas          = [];
            for ( var i = 0 ; i < tamaño ; i++) {

                lineas.push( {
                    item                                :Number(invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } )),
                    amount                              : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'amount' } ),
                    rate                                : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'rate' } ),
                    tax1amt                             : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'tax1amt' } ),
                    taxcode                             : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode' } ),
                    taxcode_display                     : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode_display' } ),
                    taxrate1                            : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxrate1' } ),
                    quantity                            : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ),
                    grossamt                            : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'grossamt' } ), 
                    DiscountTotal                       : invoice.getSublistValue( { sublistId: 'item', line: i,fieldId: 'custcol_nso_descuento'}),
                    isclosed                            : invoice.getSublistValue( { sublistId: 'item', line: i, fieldId: 'isclosed' } )


                });
            }

            valoresFactura = {
                internalId: invoice.getValue({fieldId:'id'}),
                TranId:Number( invoice.getValue({ fieldId: 'tranid' })),
                TranType: invoice.getValue({fieldId:'baserecordtype'}),
                Status:        invoice.getValue( { fieldId : 'status' } ),
                Entity: Number(invoice.getValue({fieldId:'entity'})),
                TranDate: invoice.getValue({fieldId:'trandate'}),
                SubTotal: invoice.getValue({fieldId:'subtotal'}),
                DiscountTotal: invoice.getValue({fieldId:'discounttotal'}),
                TaxTotal: invoice.getValue({fieldId:'taxtotal'}),
                Total: invoice.getValue({fieldId:'total'}),
                DescuentoTotalImporte: invoice.getValue({fieldId:'custbody_nso_indr_total_discount'}),
                DescuentoTotalPP: invoice.getValue({fieldId:'custbody_nso_indr_client_discount'}),
                DescuentoEspecial: invoice.getValue({fieldId:'custbody_descuento_especial'}),
                DescuentoEvento: invoice.getValue({fieldId:'custbody_descuento_evento'}),
                AutorizacionEspecial: invoice.getValue({fieldId:'custbody_autorizacion_especial'}),
                AmountDue: invoice.getValue({fieldId:'amountremainingtotalbox'}),
                SaleDate: invoice.getValue({fieldId:'saleseffectivedate'}),
                LeadSource: invoice.getValue({fieldId:'leadsource'}),
                DepartamentoCliente: invoice.getValue({fieldId:'custbody2'}),
                TipoPedido:Number( invoice.getValue({fieldId:'custbody_tipo_pedido'})),
                ClienteContado: Number( invoice.getValue({fieldId:'custbody_tipo_pedido'})),
                RFC: invoice.getValue({fieldId:'custbody_rfc'}),
                UUID: invoice.getValue({fieldId:'custbody_uuid'}),
                OrdenCompra: invoice.getValue({fieldId:'custbody_orden_compra'}),
                Usuario: invoice.getValue({fieldId:'custbody_inter'}),
                createdfrom:Number( invoice.getValue({fieldId:'createdfrom'})),
                ShipCarrier: invoice.getValue({fieldId:'shipcarrier'}),
                ShippingWay:Number( invoice.getValue({fieldId:'custbody_forma_de_envio'})),
                Paqueteria:Number( invoice.getValue({fieldId:'custbody_paqueteria'})),
                FechaRecepcionCliente: invoice.getValue({fieldId:'custbody_nso_indr_receipt_date'}),
                ShipAddress: invoice.getValue({fieldId:'shipaddress'}),
                TerminosPago:Number(invoice.getValue({fieldId:'custbody_nso_payment_terms'})),
                CondicionVencimiento:Number( invoice.getValue({fieldId:'custbody_nso_due_condition'})),
                FechaVencimiento: invoice.getValue({fieldId:'duedate'}),
                BillAddress: invoice.getValue({fieldId:'billaddress'}),
                ExchangeRate: invoice.getValue({fieldId:'exchangerate'}),
                Currency:Number( invoice.getValue({fieldId:'currency'})),
                FechaProntoPago:  invoice.getValue({fieldId:'custbody_nso_indr_discount_date'}),
                AprobacionDescuentos: invoice.getValue({fieldId:'custbody_nso_indr_discount_approval'}),
                custbody_refpdf: invoice.getValue({fieldId: 'custbody_refpdf'}),
             	 custbody_cfdi_metpago_sat: invoice.getText({fieldId:'custbody_cfdi_metpago_sat'}),
                    custbody_cfdi_formadepago: invoice.getText({fieldId:'custbody_cfdi_formadepago'}),
                    custbody_uso_cfdi: invoice.getText({fieldId:'custbody_uso_cfdi'}),
                    currencysymbol: invoice.getText({fieldId:'currencysymbol'})
            };

            valoresFactura.lineItems= { item:lineas };
            valoresFactura = JSON.stringify(valoresFactura)

           // var archivo = generaArchivo(valoresFactura, currentRecord.getValue({ fieldId: 'tranid' }));
            httpService.post('api/Invoice/InsertInvoice', valoresFactura );
        }catch(e)
        {

            log.error('Error en la creación y guardado del JSON en netsuite', e.message);
        }
    }
    return handler;
});
