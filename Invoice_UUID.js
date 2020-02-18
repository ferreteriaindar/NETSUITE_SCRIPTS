/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @Autor ROBERTO VELASCO LARIOS
 * @NModuleScope Public
 * @Company INDAR
 * @NModuleScope Public
 *
*/


    define(['SuiteScripts/INDAR SCRIPTS/httpService',"N/runtime",'N/record','N/file'], function (httpService,runtime,record,file) {

    var exports = {};
    function afterSubmit(scriptContext) {
        notifySupervisor(scriptContext);
    }


    function notifySupervisor(scriptContext) {

        if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE) {

        var viejo = scriptContext.oldRecord;
        if(viejo)
      {  var nuevo = record.load({ type: viejo.type, id: viejo.id });

      /*  log.error('UUIDviejo', viejo);
        log.error('UUIDcurrent', nuevo);*/
        //log.error('executionContext', runtime);
                if(iguales(viejo,nuevo))
                {
                  //  log.error('detectaCambio', 'Es');
                    return; ///aqui  se manda la factura por IWS
                }
                else
                {
                    log.error('detectaCambio', 'SI timbra');
                  //  var pdf =file.load(nuevo.custbody_refpdf);
                  //SE GENERA JSON PARA   LA ACTUALIZAR TODOS LOS DATOs
                    var valoresFactura = {};
                    var tamaño        = nuevo.getLineCount( { sublistId: 'item' } );
                    var lineas          = [];
                    for ( var i = 0 ; i < tamaño ; i++) {

                        lineas.push( {
                            item                                :Number(nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } )),
                            amount                              : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'amount' } ),
                            rate                                : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'rate' } ),
                            tax1amt                             : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'tax1amt' } ),
                            taxcode                             : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode' } ),
                            taxcode_display                     : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxcode_display' } ),
                            taxrate1                            : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'taxrate1' } ),
                            quantity                            : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ),
                            grossamt                            : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'grossamt' } ), 
                            DiscountTotal                       : nuevo.getSublistValue( { sublistId: 'item', line: i,fieldId: 'custcol_nso_descuento'}),
                            isclosed                            : nuevo.getSublistValue( { sublistId: 'item', line: i, fieldId: 'isclosed' } )


                        });
                    }
                    valoresFactura = {
                        internalId: nuevo.getValue({fieldId:'id'}),
                        TranId:Number( nuevo.getValue({ fieldId: 'tranid' })),
                        TranType: nuevo.getValue({fieldId:'baserecordtype'}),
                        Status:        nuevo.getValue( { fieldId : 'orderstatus' } ),
                        Entity: Number(nuevo.getValue({fieldId:'entity'})),
                        TranDate: nuevo.getValue({fieldId:'trandate'}),
                        Memo: nuevo.getValue({fieldId:'memo'}),
                        SubTotal: nuevo.getValue({fieldId:'subtotal'}),
                        DiscountTotal: nuevo.getValue({fieldId:'discounttotal'}),
                        TaxTotal: nuevo.getValue({fieldId:'taxtotal'}),
                        Total: nuevo.getValue({fieldId:'total'}),
                        DescuentoTotalImporte: nuevo.getValue({fieldId:'custbody_nso_indr_total_discount'}),
                        DescuentoTotalPP: nuevo.getValue({fieldId:'custbody_nso_indr_client_discount'}),
                        DescuentoEspecial: nuevo.getValue({fieldId:'custbody_descuento_especial'}),
                        DescuentoEvento: nuevo.getValue({fieldId:'custbody_descuento_evento'}),
                        AutorizacionEspecial: nuevo.getValue({fieldId:'custbody_autorizacion_especial'}),
                        AmountDue: nuevo.getValue({fieldId:'amountremainingtotalbox'}),
                        SaleDate: nuevo.getValue({fieldId:'saleseffectivedate'}),
                        LeadSource: nuevo.getValue({fieldId:'leadsource'}),
                        DepartamentoCliente: nuevo.getValue({fieldId:'custbody2'}),
                        TipoPedido:Number( nuevo.getValue({fieldId:'custbody_tipo_pedido'})),
                        ClienteContado: Number( nuevo.getValue({fieldId:'custbody_tipo_pedido'})),
                        RFC: nuevo.getValue({fieldId:'custbody_rfc'}),
                        UUID: nuevo.getValue({fieldId:'custbody_uuid'}),
                        OrdenCompra: nuevo.getValue({fieldId:'custbody_orden_compra'}),
                        Usuario: nuevo.getValue({fieldId:'custbody_inter'}),
                        createdfrom:Number( nuevo.getValue({fieldId:'createdfrom'})),
                        ShipCarrier: nuevo.getValue({fieldId:'shipcarrier'}),
                        ShippingWay:Number( nuevo.getValue({fieldId:'custbody_forma_de_envio'})),
                        Paqueteria:Number( nuevo.getValue({fieldId:'custbody_paqueteria'})),
                        FechaRecepcionCliente: nuevo.getValue({fieldId:'custbody_nso_indr_receipt_date'}),
                        ShipAddress: nuevo.getValue({fieldId:'shipaddress'}),
                        TerminosPago:Number(nuevo.getValue({fieldId:'custbody_nso_payment_terms'})),
                        CondicionVencimiento:Number( nuevo.getValue({fieldId:'custbody_nso_due_condition'})),
                        FechaVencimiento: nuevo.getValue({fieldId:'duedate'}),
                        BillAddress: nuevo.getValue({fieldId:'billaddress'}),
                        ExchangeRate: nuevo.getValue({fieldId:'exchangerate'}),
                        Currency:Number( nuevo.getValue({fieldId:'currency'})),
                        FechaProntoPago:  nuevo.getValue({fieldId:'custbody_nso_indr_discount_date'}),
                        AprobacionDescuentos: nuevo.getValue({fieldId:'custbody_nso_indr_discount_approval'}),
                        custbody_refpdf: nuevo.getValue({fieldId: 'custbody_refpdf'})

                    };
                    valoresFactura.lineItems= { item:lineas };
                    var dosDiasMas=new Date();
                    dosDiasMas.setDate(dosDiasMas.getDate() + 2);
                    nuevo.setValue('custbody_nso_indr_receipt_date',dosDiasMas);
                    nuevo.save({ ignoreMandatoryFields: true });
                    valoresFactura = JSON.stringify(valoresFactura)
                    
                    log.error('json',valoresFactura);
                    httpService.post('api/Invoice/InsertInvoice', valoresFactura );
                    return;
                 }

        }
    }
        return;
    }

    function iguales(viejo,nuevo)
    {
        var UUIDNuevo= nuevo.getValue({fieldId : 'custbody_uuid'});
            var UUIDviejo=viejo.getValue({fieldId : 'custbody_uuid'});
            if(UUIDviejo==UUIDNuevo)
            return true;
            else return false;
    }
    exports.afterSubmit = afterSubmit;
    return exports;
});