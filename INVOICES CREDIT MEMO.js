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

	var DISCOUNT = 5;

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
		log.debug( 'getInvoicesInfo', invoicedIds )
		var information = {};
		if( invoicedIds.length < 25 ) {
			for( var i = 0; i < invoicedIds.length; i++ ) {
				var invoiceRec = record.load( { type: 'invoice', id: invoicedIds[ i ] } );
				var invoiceId = invoiceRec.id;
				information[ invoiceId ] = information[ invoiceRec.id ] || {};
				for( var j = 0; j < invoiceRec.getLineCount( 'item' ); j++ ) {
					var taxCode = invoiceRec.getSublistValue( 'item', 'taxcode', j );
					var discountPercent = invoiceRec.getSublistValue( 'item', 'custcol_nso_indr_early_payment_sales', j );
					var amount = invoiceRec.getSublistValue( 'item', 'grossamt', j );
					information[ invoiceId ].discount = information[ invoiceId ].discount || {};
					information[ invoiceId ].discount[ taxCode ] = information[ invoiceId ].discount[ taxCode ] || 0;
					information[ invoiceId ].discount[ taxCode] += discountPercent * amount;
					information[ invoiceId ].totalDiscount = information[ invoiceId ].totalDiscount || 0;
					information[ invoiceId ].totalDiscount += information[ invoiceId ].discount[taxCode];
				}
				information[invoiceId].eiGenerated = invoiceRec.getValue( 'custbody_cfdi_timbrada' );
				information[invoiceId].UUID = invoiceRec.getValue( 'custbody_uuid' );
				information[invoiceId].date = invoiceRec.getValue( 'custbody_nso_indr_discount_date' );
				information[invoiceId].date = format.parse( { value: information[invoiceId].date, type: format.Type.DATE } );
			}
		}
		log.debug( 'Invoices Info', JSON.stringify( information ) );
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

	function createCreditMemos( totalDiscount, vendorBillId ) {
      log.debug('enterCreate',totalDiscount);
		var creditMemo;
		creditMemo = record.transform( {
			fromType: record.Type.INVOICE,
			fromId: vendorBillId,
			toType: record.Type.CREDIT_MEMO,
			isDynamic: true
		} );
		creditMemo.setValue( 'custbody_motivos_notadecredito', DISCOUNT );
		creditMemo.setValue( 'custbody_cfdi_tipode_relacion', 1 );
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
		var j = 0;
		while ( creditMemo.getLineCount( 'item' ) > 0 ) {
			creditMemo.removeLine( { sublistId: 'item', line: j } );
		}
		var discount = nsoParseFloatOrZero( totalDiscount[10] ) + nsoParseFloatOrZero( totalDiscount[6] );
		if ( totalDiscount[10] > 0 ) {
			addLineToCreditMemo( creditMemo, totalDiscount[10], itemsDiscount[10], 10);
		}
		if ( totalDiscount[6] > 0 ) {
			addLineToCreditMemo( creditMemo, totalDiscount[6], itemsDiscount[6], 6);
		}

		for ( var j = 0; j < creditMemo.getLineCount( 'apply' ); j++ ) {
			if (  vendorBillId ==  creditMemo.getSublistValue( 'apply', 'internalid', j ) ) {
				creditMemo.selectLine( { sublistId: 'apply', line: j } );
				creditMemo.setCurrentSublistValue( 'apply', 'apply', true );
				creditMemo.setCurrentSublistValue( 'apply', 'amount', discount );
				creditMemo.commitLine( { sublistId: 'apply' } );
			}
		}
		var creditId = creditMemo.save();
      log.debug('credit memo Id', creditId);
		var relation = record.create( {
			type: 'customrecord_cfdis_relacion',
			isDynamic: true,
		} );
		relation.setValue( 'custrecord_cfdi_tabla_padre', creditId );
		relation.setValue( 'custrecord_cfdi_rel_tran', vendorBillId );
		var relationId = relation.save();
		log.audit( 'CREDIT ID:', creditId + ' ' + relationId );
		return creditId;
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

	handler.beforeSubmit = function ( context ) {
		try {
          log.debug('type',context.type );
          	log.debug( 'ctx', context);
			if ( context.type != 'create') {
              log.debug('salir','SI' );
				return;
			}
			initItemsDiscounts( SALE );
			var currentRecord = context.newRecord;
			var invoiceIds = [];
			for ( var i = 0; i < currentRecord.getLineCount( 'apply' ); i++ ) {
				if ( currentRecord.getSublistValue( 'apply', 'apply', i ) ) {
					invoiceIds.push( currentRecord.getSublistValue( 'apply', 'internalid', i ) );
				}
			}
			var invoicesInfo = getInvoicesInfo( invoiceIds );
			var creditMemo;
			for ( var invoiceId in invoicesInfo ) {
				//TIENE QUE ESTAR TIMBRADA LA FACTURA Y LA FECHA SER MENOR A LA FECHA DE PRONTO PAGO.
				log.debug('maxDate', invoicesInfo[invoiceId].date);
              	log.debug('minDate', currentRecord.getValue( 'trandate' ));
              	log.debug('eiGenerated', invoicesInfo[invoiceId].eiGenerated);
				if ( invoicesInfo[invoiceId].date >= currentRecord.getValue( 'trandate' ) && invoicesInfo[invoiceId].eiGenerated ) {
					invoicesInfo[invoiceId].creditMemo = createCreditMemos( invoicesInfo[invoiceId].discount, invoiceId );
				}
			}
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
			if ( creditMemos.length > 0 ) {
				var cmTask = task.create( {
					taskType: task.TaskType.SCHEDULED_SCRIPT,
					scriptId: 'customscript_nso_viv_timbrar_nc',
					params: { custscript_nso_viv_notas_credito: creditMemos.join( ',' ) }
				} );
				//var taskId = cmTask.submit();  NO SE QUIEREMOS QUE SE TIMBREN CON NETSOFT   2/07/2020 
			}

		} catch ( e ) {
			log.error( 'ERROR afterSubmit', JSON.stringify( e ) );
			if ( e.name.indexOf( 'NSO' ) > 0 ) {
				throw e;
			}
		}
	};
	return handler;
} );