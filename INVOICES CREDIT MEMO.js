/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @ScriptName NSO | UE | Sales Credit Memos
 * @NModuleScope Public
 * @Company NetSoft
 * @Author María Alejandra Blanco Uribe
 * @external define
 * @Description Este script crea las notas de crédito al momento de realizar un pago de factura.
 * @file indr_nso_ue_sales_credit_memos.js
 */

define( ['N/error', 'N/search', 'N/format', 'N/record', 'N/task'], function ( error, search, format, record, task ) {

	var DISCOUNT = 9;

	var handler = {};

	var itemsDiscount = {};
	var SALE = 2;

	var NO_TAX = 11;

	function getParent( dictionary, id ) {
		var parent;
		var keys = Object.keys( dictionary );
		for ( var i = 0; i < keys.length && !parent ; i++ ) {
			if ( dictionary[ keys[ i ] ] == id ) {
				parent = keys[i];
			}
		}
		return parent;
	}

	function getResults( searchResults ) {
		var k = 0;
		var searchResult = [];
		var result = searchResults.run().getRange( k * 100, ( k + 1 ) * 100 );
		searchResult = searchResult.concat( result );
		while ( result.length == 100 ) {
			k++;
			result = searchResults.run().getRange( k * 100, ( k + 1 ) * 100 );
			searchResult = searchResult.concat( result );
		}
		return searchResult;
	}

	/*function getInvoicesInfo( invoicedIds ) {
		var information = {};
		var columns = ['custcol_nso_indr_early_payment_sales', 'custbody_nso_indr_discount_date',
			'custbody_cfdi_timbrada', 'custbody_uuid', 'item', 'amount', 'taxcode', 'tax1amt'];
		var filters = [ { name: 'internalid', operator: 'anyof', values: invoicedIds },
			{ name: 'type', operator: 'anyof', values: ['CustInvc'] },
			{ name: 'taxline', operator: 'is', values: false },
			{ name: 'mainline', operator: 'is', values: false }];
		var searchResults = search.create( { type: 'transaction', filters: filters, columns: columns } );
		searchResults = getResults( searchResults );
		for ( var i = 0; i < searchResults.length; i++ ) {
			var invoiceId = searchResults[0].id;
			var taxCode = searchResults[i].getValue( 'taxcode' );
			var discountPercent = parseFloat( searchResults[i].getValue( 'custcol_nso_indr_early_payment_sales' ) );
			var amount = parseFloat( searchResults[i].getValue( 'amount' ) );
			var taxAmount = parseFloat( searchResults[i].getValue( 'amount' ) );
			amount += taxAmount;
			information[invoiceId] = information[searchResults[0].id] || {};
			information[invoiceId].discount = information[invoiceId].discount || {};
			information[invoiceId].discount[taxCode] = information[invoiceId].discount[taxCode] || 0;
			information[invoiceId].discount[taxCode] += discountPercent * amount;
			information[invoiceId].totalDiscount = information[invoiceId].totalDiscount || 0;
			information[invoiceId].totalDiscount += information[invoiceId].discount[taxCode];
			information[invoiceId].eiGenerated = searchResults[i].getValue( 'custbody_cfdi_timbrada' );
			information[invoiceId].UUID = searchResults[i].getValue( 'custbody_uuid' );
			information[invoiceId].date = searchResults[i].getValue( 'custbody_nso_indr_discount_date' );
			information[invoiceId].date = format.parse( { value: information[searchResults[0].id].date, type: format.Type.DATE } );
		}
		log.debug( 'Invoices Info', JSON.stringify( information ) );
		return information;
	}*/

	function getInvoicesInfo( invoicedIds ) {
		var information = {};
		if( invoicedIds.length < 50 ) {
			for( var i = 0; i < invoicedIds.length; i++ ) {
				var invoiceRec = record.load( { type: 'invoice', id: invoicedIds[ i ] } );
				var invoiceId = invoiceRec.id;
				information[ invoiceId ] = information[ invoiceRec.id ] || {};
				information[ invoiceId ].discount = {};
				information[ invoiceId ].discount[ 6 ] = invoiceRec.getValue( 'custbody_nso_indr_discount_16p' );
				information[ invoiceId ].discount[ 10 ] = invoiceRec.getValue( 'custbody_nso_indr_zero_tax_discount' );
				information[ invoiceId ].totalDiscount = invoiceRec.getValue( 'custbody_nso_indr_total_discount' );
				information[invoiceId].eiGenerated = invoiceRec.getValue( 'custbody_cfdi_timbrada' );
				information[invoiceId].UUID = invoiceRec.getValue( 'custbody_fe_uuid_cfdi_33' );
				information[invoiceId].total = invoiceRec.getValue({ fieldId: 'total' });
                information[invoiceId].date = invoiceRec.getValue( 'custbody_nso_indr_discount_date' );
                var numLines = invoiceRec.getLineCount({
                    sublistId: 'links'
                });
                information[invoiceId].paymentApplied = 0;
                for(var j = 0;j < numLines;j++){
                    var type = invoiceRec.getSublistValue({
                        sublistId: 'links',
                        fieldId: 'type',
                        line: j
                    });
                    if(type == 'Pago' || type == 'Payment')
                    {
                        var total = invoiceRec.getSublistValue({
                            sublistId: 'links',
                            fieldId: 'total',
                            line: j
                        });
                        information[invoiceId].paymentApplied += total;
                    }
                }
				information[invoiceId].date = format.parse( { value: information[invoiceId].date, type: format.Type.DATE } );
			}
		}
		return information;
	}

	function addLineToCreditMemo( creditMemo, discountPerTaxCode, item, taxCode ) {
		if ( taxCode == 6 ) {
			discountPerTaxCode/=1.16;
		}
		var classification = creditMemo.getValue( 'class' );
		var locationId = creditMemo.getValue( 'location' );
		creditMemo.selectNewLine( 'item' );
		creditMemo.setCurrentSublistValue( 'item', 'item', item );
		creditMemo.setCurrentSublistValue( 'item', 'class', classification );
		creditMemo.setCurrentSublistValue( 'item', 'location', locationId );
		creditMemo.setCurrentSublistValue( 'item', 'rate', discountPerTaxCode );
		creditMemo.setCurrentSublistValue( 'item', 'taxcode', taxCode );
		creditMemo.commitLine( 'item' );
		return creditMemo;
	}

	function nsoParseFloatOrZero( f ) {
		var r = parseFloat( f );
		return isNaN( r ) ? 0 : r;
	}

	function createCreditMemos( creditMemos, invoiceId ) {
        try{
            var creditMemo;
            creditMemo = record.transform( {
                fromType: record.Type.INVOICE,
                fromId: invoiceId,
                toType: record.Type.CREDIT_MEMO,
                isDynamic: true
            } );
            creditMemo.setValue( 'custbody_motivos_notadecredito', DISCOUNT );
            creditMemo.setValue( 'custbody_cfdi_tipode_relacion', 1 );
            creditMemo.setValue( 'custbody_cfdi_formadepago', 1 );
          	creditMemo.setValue( 'custbody_uso_cfdi', 2 );
            creditMemo.setValue( 'custbody_cfdi_timbrada', false );
            creditMemo.setValue( 'custbody_massive_processid', '' );
            creditMemo.setValue( 'custbody_uuid', '' );
            creditMemo.setValue( 'custbody_nso_cfdi_estado_cancelacion', '' );
            creditMemo.setValue( 'custbody_nso_cfdi_es_cancelable', '' );
            creditMemo.setValue( 'custbody_nso_cfdi_estado', '' );
            creditMemo.setValue( 'custbody_nso_cfdc_response_mysuite', '' );
            creditMemo.setValue( 'custbody_nso_cfdi_status_canc', '' );
            creditMemo.setValue( 'custbody_nso_cfd_fecha_cancelacion', '' );
            creditMemo.setValue( 'custbody_cancelcfdi', false );
            creditMemo.setValue( 'custbody_cfdixml', '' );
            creditMemo.setValue( 'custbody_cfdi_pdf', '' );
            creditMemo.setValue( 'custbody_xml_file', '' );
            creditMemo.setValue( 'custbody_refpdf', '' );
            creditMemo.setValue( 'location', 34 );
          	creditMemo.setValue("custbody_fe_sf_xml_sat", "");
            creditMemo.setValue("custbody_fe_sf_pdf", "");
            creditMemo.setValue("custbody_fe_sf_codigo_respuesta", "");
            creditMemo.setValue("custbody_fe_uuid_cfdi_33", "");
            creditMemo.setValue("custbody_json_fe_comprobante_33", "");
            creditMemo.setValue("custbody_fe_sf_xml_netsuite", "");
            creditMemo.setValue("custbody_fe_sf_mensaje_respuesta", "");
            creditMemo.setValue("custbody_fe_metodo_de_pago", 99);
            creditMemo.setValue("custbody_forma_pago_fe_imr_33", 1);
            creditMemo.setValue("custbody_uso_cfdi_fe_imr_33", 2);
            creditMemo.setValue("custbody_cfdi_tipo_relacion_33", 1);
            creditMemo.setValue("custbody_regimen_fiscal_fe_33", 601);

            var j = 0;
            while ( creditMemo.getLineCount( 'item' ) > 0 ) {
                creditMemo.removeLine( { sublistId: 'item', line: j } );
			}
			var totalDiscount = {};
			for ( var invoiceId in creditMemos ) {
                //var difference = creditMemos[invoiceId].total - (creditMemos[invoiceId].pay   mentApplied + creditMemos[invoiceId].discount[10] + creditMemos[invoiceId].discount[6]);
              	var difference = ((creditMemos[invoiceId].total*100) - (creditMemos[invoiceId].paymentApplied + creditMemos[invoiceId].discount[10] + creditMemos[invoiceId].discount[6])*100)/100;
              log.debug(invoiceId + ': total', creditMemos[invoiceId].total);
              log.debug(invoiceId + ': paymentApplied', creditMemos[invoiceId].paymentApplied);
              log.debug(invoiceId + ': disc 0', creditMemos[invoiceId].discount[10]);
              log.debug(invoiceId + ': disc 16', creditMemos[invoiceId].discount[6]);
              log.debug(invoiceId + ': diff', difference);

                if(creditMemos[invoiceId].paymentApplied >= creditMemos[invoiceId].total  //No se aplica la nota de credito por que pasa lo aplicado o mas o menos 3 peseos
                    || difference > 3){
                        creditMemos[invoiceId].discount[10] = 0;
                        creditMemos[invoiceId].discount[6] = 0;
                }
                else if(difference <= 3 /*&& difference >= -3*/){
                    if(creditMemos[invoiceId].discount[6] > 0)
                        creditMemos[invoiceId].discount[6] += difference;
                    else if(creditMemos[invoiceId].discount[10] > 0)
                        creditMemos[invoiceId].discount[10] += difference;
                }
                totalDiscount[10] = totalDiscount[10] || 0;
                totalDiscount[10] += creditMemos[invoiceId].discount[10];
                totalDiscount[6] = totalDiscount[6] || 0;
                totalDiscount[6] += creditMemos[invoiceId].discount[6];
			}
			if ( totalDiscount[10] > 0 ) {
				addLineToCreditMemo( creditMemo, totalDiscount[10], itemsDiscount[10], 10);
			}
			if ( totalDiscount[6] > 0 ) {
				addLineToCreditMemo( creditMemo, totalDiscount[6], itemsDiscount[6], 6);
			}
			for ( var invoiceId in creditMemos ) {
				var lineNumber = creditMemo.findSublistLineWithValue({
					sublistId: 'apply',
					fieldId: 'internalid',
					value: invoiceId
				});
				var discount = nsoParseFloatOrZero( creditMemos[invoiceId].discount[10] ) + nsoParseFloatOrZero( creditMemos[invoiceId].discount[6]);
				if(lineNumber != -1 && discount > 0){
					creditMemo.selectLine( { sublistId: 'apply', line: lineNumber } );
					creditMemo.setCurrentSublistValue( 'apply', 'apply', true );
					creditMemo.setCurrentSublistValue( 'apply', 'amount', discount );
					creditMemo.commitLine( { sublistId: 'apply' } );
				}
				j++;
			}
            log.debug('credit memo', creditMemo);

            var creditId = creditMemo.save();
            log.debug('credit memo Id', creditId);
			return creditId;
        } catch ( e ) {
			log.error( 'ERROR createCreditMemos', JSON.stringify( e ) );
		}
	}

	function initItemsDiscounts( type ) {
		var configurationsSearch = search.create( { type: 'customrecord_nso_indr_items_per_tax',
			filters: [['isinactive', 'is', 'F'], 'AND', ['custrecord_nso_indr_item_type', 'is', type]],
			columns: ['custrecord_nso_indr_tax_code', 'custrecord_nso_indr_item_per_tax'] } ).run().getRange( 0, 2 );
		configurationsSearch.forEach( function ( configuration ) {
			var taxCode = configuration.getValue( 'custrecord_nso_indr_tax_code' );
			var item = configuration.getValue( 'custrecord_nso_indr_item_per_tax' );
			itemsDiscount[taxCode] = item;
		} );
	}

	handler.afterSubmit = function ( context ) {
		try {
			if ( /* context.type != 'create' && */ context.type != 'edit') {
                return;
			}
			initItemsDiscounts( SALE );
			var currentRecord = context.newRecord;
			var oldRecord = record.load({ type: currentRecord.type, id: currentRecord.id });
            var invoiceIds = [];
            log.debug('paymentId: ', currentRecord.id );
			for ( var i = 0; i < currentRecord.getLineCount( 'apply' ); i++ ) {
				if ( currentRecord.getSublistValue( 'apply', 'apply', i ) ) {
					/*var lineNumber = oldRecord.findSublistLineWithValue({
						sublistId: 'apply',
						fieldId: 'internalid',
						value: currentRecord.getSublistValue( 'apply', 'internalid', i )
					});
					log.debug('linenumber', lineNumber);
					log.debug('value', oldRecord.getSublistValue( 'apply', 'apply', lineNumber ));
					if(lineNumber == -1 || !oldRecord.getSublistValue( 'apply', 'apply', lineNumber )){
						invoiceIds.push( currentRecord.getSublistValue( 'apply', 'internalid', i ) );
					}*/
					var information = {};
					var columns = ['internalid'];
					var filters = 	[	{ 	name:"internalid",
											join:"appliedtotransaction",
											operator:"anyof",
											values:[ 
												currentRecord.getSublistValue( 'apply', 'internalid', i )
											]
										},
										{ name: 'type', operator: 'anyof', values: ['CustCred'] }
									];
					var searchQuery = search.create( { type: 'transaction', filters: filters, columns: columns } );
					var exist;
					var searchResults = searchQuery.run().each(function(result) {
						exist = result.getValue({
							name: 'internalid'
						});
					});
					if(!exist){
						invoiceIds.push( currentRecord.getSublistValue( 'apply', 'internalid', i ) );
					}
				}
			}
			var invoicesInfo = getInvoicesInfo( invoiceIds );
			log.debug('invoicesInfo', invoicesInfo);
			var creditMemo = {};
			var first = -1;
			for ( var invoiceId in invoicesInfo ) {
				//TIENE QUE ESTAR TIMBRADA LA FACTURA Y LA FECHA SER MENOR A LA FECHA DE PRONTO PAGO.
				if ( invoicesInfo[invoiceId].date >= currentRecord.getValue( 'trandate' ) && invoicesInfo[invoiceId].UUID ) {
					creditMemo[invoiceId] = {};
					creditMemo[invoiceId].discount = {};
					creditMemo[invoiceId].discount[6] = invoicesInfo[invoiceId].discount[6] || 0;
					creditMemo[invoiceId].discount[10] = invoicesInfo[invoiceId].discount[10] || 0;
					creditMemo[invoiceId].total = invoicesInfo[invoiceId].total || 0;
					creditMemo[invoiceId].paymentApplied = invoicesInfo[invoiceId].paymentApplied || 0;
					first = first == -1 ? invoiceId : first;
				}
			}
			log.debug('creditMemo', creditMemo);
          var id = 0;
          var creditMemos = [];
			if(first != -1)
				id = createCreditMemos( creditMemo, first );
          if(id > 0){
            creditMemos.push( id );
          }

			/*
			var creditMemos = [];
			for ( var i = 0; i < currentRecord.getLineCount( 'apply' ); i++ ) {
				var amount = currentRecord.getSublistValue( 'apply', 'amount', i );
				var invoiceId = currentRecord.getSublistValue( 'apply', 'internalid', i );
              log.debug('apply', i + ': ' +currentRecord.getSublistValue( 'apply', 'apply', i ));
				if ( currentRecord.getSublistValue( 'apply', 'apply', i ) ) {
					if ( invoicesInfo[invoiceId].creditMemo ) {
						creditMemos.push( invoicesInfo[invoiceId].creditMemo );
						//currentRecord.setSublistValue( 'apply', 'amount', i, amount - invoicesInfo[invoiceId].totalDiscount );
					}
				}
			}
			*/
            // TIMBRADO DE NOTAS DE CREDITO IMR
            try{
                if ( creditMemos.length > 0 ) {
					var cmTask = task.create( {
                      taskType: task.TaskType.SCHEDULED_SCRIPT,
                      scriptId: 'customscript_imr_viv_timbrar_nc',
                      params: { custscript_imr_viv_notas_credito: creditMemos.join( ',' ) }
                  } );
                  var taskId = cmTask.submit();
              	}
            }catch(e){}
			
          /*   TIMBRADO DE NOTAS DE CREDITO MISAEL LARIOS
			if ( creditMemos.length > 0 ) {
				var cmTask = task.create( {
					taskType: task.TaskType.SCHEDULED_SCRIPT,
					scriptId: 'customscript_nso_viv_timbrar_nc',
					params: { custscript_nso_viv_notas_credito: creditMemos.join( ',' ) }
				} );
				var taskId = cmTask.submit();
			}
          */
       /*             
          //***********AGREGADO   ROBERTO VELASCO LARIOS TIMBRAR  PAGOS*********************
            log.debug('TRANID', currentRecord.getText( 'tranid' ));
           //  log.debug('Antes de schedule cfd', currentRecord.getText( 'custbody_cfdi_timbrada' ));
         //  log.debug('Antes de schedule unapplied', currentRecord.getValue( 'unapplied' ));
              log.debug('Cobrador', currentRecord.getText( 'custbody_cobrador' ));
          if( currentRecord.getText( 'custbody_cfdi_timbrada' )=='F' && currentRecord.getValue('unapplied')==0 && currentRecord.getValue('custbody_cfdi_metpago_sat')!='10')// && (currentRecord.getValue( 'custbody_cobrador' )==20521||currentRecord.getValue( 'custbody_cobrador' )==20520) )
            {
              log.debug('TIMBRAR PAGO SCHEDULE', 'SI');
              	var cpTask = task.create( {
					taskType: task.TaskType.SCHEDULED_SCRIPT,
					scriptId: 'customscript_zindar_timbrarpagoschedule',
					params: { custscript_zindar_id_payment: currentRecord.getValue( 'id' ) }
				} );
				var taskIdcp = cpTask.submit();

            }      
                //*********** FIN  AGREGADO   ROBERTO VELASCO LARIOS TIMBRAR  PAGOS*********************
*/
		} catch ( e ) {
			log.error( 'ERROR afterSubmit', JSON.stringify( e ) );
			if ( e.name.indexOf( 'NSO' ) > 0 ) {
				throw e;
			}
		}
	};
	return handler;
} );