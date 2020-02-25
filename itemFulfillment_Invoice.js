/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRORS
 *@NModuleScope Public
 */

define( ['N/error', 'N/record', 'N/format', 'N/search'], function( error, record, format, search ) {
	
	var handler = {};
	
	var ERRORS = {
		NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
		NSO_INVALID_ITEM: { name: 'NSO_INVALID_ITEM', message: 'El item no se puede agregar a la transacción' },
	};
	
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
	
	function getInventoryNumbers( items ) {
		var invNumbers = {};
		invNumbers.item = {};
		invNumbers.name = {};
		var filters = [
			{ name: 'item', operator: 'anyof', values: items },
			{ name: 'quantityavailable', operator: 'greaterthan', values: 0 }
		];
		var searchResults = search.create( {
			type: 'inventorynumber',
			filters: filters,
			columns: ['item', 'quantityavailable', 'location', 'inventorynumber']
		} );
		searchResults = getResults( searchResults );
		if ( searchResults.length > 0 ) {
			var item, location, name;
			for ( var i = 0; i < searchResults.length; i++ ) {
				location = searchResults[i].getValue( { name: 'location' } );
				item = searchResults[i].getValue( { name: 'item' } );
				name = searchResults[i].getValue( { name: 'inventorynumber' } );
				invNumbers.item[item] = invNumbers.item[item] || {};
				invNumbers.item[item][location] = invNumbers.item[item][location] || [];
				invNumbers.item[item][location].push( {
					id: searchResults[i].id,
					qty: parseInt( searchResults[i].getValue( { name: 'quantityavailable' } ) )
				} );
				invNumbers.name[name] = searchResults[i].id;
			}
		}
		return invNumbers;
	}
	
	function setLotNumbers( inventoryDetail, inventoryNumbers, quantity, lineInfo ) {
		for ( var i = 0; i < inventoryNumbers.length  && quantity > 0; i++ ) {
			inventoryDetail.selectNewLine( 'inventoryassignment' );
			inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', inventoryNumbers[i].id );
			inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', inventoryNumbers[i].qty > quantity ? quantity : inventoryNumbers[i].qty );
			inventoryDetail.commitLine( 'inventoryassignment' );
			quantity = quantity - inventoryNumbers[i].qty;
		}
	}
	
	function addItemFulfillMentLines( itemFulfillMent, context ) {
		var itemsPosition = {};
		for ( var i = 0; i < itemFulfillMent.getLineCount( 'item' ); i ++ ) {
			itemsPosition[ itemFulfillMent.getSublistValue( 'item',  'item', i ) ] = i;
		}
		var inventoryNumbers = getInventoryNumbers( Object.keys( itemsPosition ) ).item;
		var lines = context.lines;
		for ( var i = 0; i < lines.length; i ++ ) {
			if ( itemsPosition[lines[i].itemId] != null ) {
				itemFulfillMent.selectLine( { sublistId: 'item', line: itemsPosition[lines[i].itemId] } );
				itemFulfillMent.setCurrentSublistValue( 'item', 'apply', 'T' );
				itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'location', value: lines[i].location } );
				itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: lines[i].quantity } );
				if ( itemFulfillMent.getCurrentSublistValue( { sublistId: 'item', fieldId: 'inventorydetailreq' } ) == 'T' && context.createdfrom.recordType == 'salesorder' ) {
					if ( inventoryNumbers[lines[i].itemId][lines[i].location ] ) {
						var inventoryDetail = itemFulfillMent.getCurrentSublistSubrecord( 'item', 'inventorydetail' );
						setLotNumbers( inventoryDetail, inventoryNumbers[lines[i].itemId][lines[i].location ], lines[i].quantity );
					} else {
						if ( lines[i].inventorydetail ) {
							if ( lines[i].inventorydetail.length > 0 ) {
								for ( var j = 0; j < lines[i].inventorydetail.length; j++ ) {
									inventoryDetail.selectNewLine( 'inventoryassignment' );
									if ( lines[i].inventorydetail[j].binNumber ) {
										inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'binnumber', lines[i].inventorydetail[j].binNumber );
									}
									inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', lines[i].inventorydetail[j].quantity );
									inventoryDetail.commitLine( 'inventoryassignment' );
								}
							}
						}
					}
				}
				itemFulfillMent.commitLine( 'item' );
			}
			delete itemsPosition[lines[i].itemId];
		}
		for ( var key in itemsPosition ) {
			itemFulfillMent.selectLine( { sublistId: 'item', line: itemsPosition[key] } );
			itemFulfillMent.setCurrentSublistValue( 'item', 'apply', 'F' );
			itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: '' } );
			itemFulfillMent.commitLine( 'item' );
		}
	}
	
	handler.post = function( context ) {
		try {
			log.audit( 'CONTEXT', JSON.stringify( context ) );
			var itemFulfillMent = record.transform( {
				fromType: context.createdfrom.recordType,
				fromId: context.createdfrom.id,
				toType: 'itemfulfillment',
				isDynamic: true,
			} );
			itemFulfillMent.setValue( 'tranid', context.tranid );
			var trandate;
			if ( context.trandate ) {
				trandate = format.parse( context.trandate, 'date' );
			}
			itemFulfillMent.setValue( 'trandate', ( trandate || new Date() ) );
			if ( context.postingperiod ) {
				itemFulfillMent.setValue( 'postingperiod', context.postingperiod.id  );
			}
			itemFulfillMent.setValue( 'memo', context.notes );
			itemFulfillMent.setValue( 'shipstatus', context.shipstatus.value );
			itemFulfillMent.setValue( 'status', context.shipstatus.txt );
			itemFulfillMent.setValue( 'shipcarrier', context.shipCarrier );
			itemFulfillMent.setValue( 'shipaddress', context.shipAddress );
			itemFulfillMent.setValue( 'shipcountry', context.shipcountry );
			itemFulfillMent.setValue( 'shipzip', context.shipzip );
			addItemFulfillMentLines( itemFulfillMent, context );
			var itemFulfillMentId = itemFulfillMent.save();
            log.audit( 'itemFulfillMent ID', JSON.stringify( itemFulfillMentId ) );
            //SE  FACTURA  EL PEDIDO  YA QUE SE TERMINA EL ITEMFULFILLMENT

            try{
            var billRecord = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: context.createdfrom.id,
                toType: record.Type.INVOICE,
                isDynamic: true
            });
            billRecord.setValue('custbody_nso_due_condition',3);
            var hoy = new Date();
            var receipt_date2 = format.parse( hoy, 'date' );
            billRecord.setValue('custbody_nso_indr_receipt_date',receipt_date2);
            var idInvoice = billRecord.save({ ignoreMandatoryFields: true });
            } catch ( e ) {
                    log.error( 'POST', JSON.stringify( e ) );
                    var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
                    return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR AL FACTURAR' + errorText }, 'internalId': idInvoice};
            } 




			return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }, 'internalId': idInvoice };
		} catch ( e ) {
			log.error( 'POST', JSON.stringify( e ) );
			var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
			return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR FULFILMMENT' + errorText }, 'internalId': itemFulfillMentId };
		}
	};
	
	function editItemFulfillLines( itemFulfillMent, context ) {
		var itemsPosition = {};
		for ( var i = 0; i < itemFulfillMent.getLineCount( 'item' ); i ++ ) {
			itemsPosition[ itemFulfillMent.getSublistValue( 'item',  'item', i ) ] = i;
		}
		var inventoryNumbers = getInventoryNumbers( Object.keys( itemsPosition ) ).name;
		var lines = context.lines;
		for ( var i = 0; i < lines.length; i ++ ) {
			if ( itemsPosition[lines[i].itemId] != null ) {
				itemFulfillMent.selectLine( { sublistId: 'item', line: itemsPosition[lines[i].itemId] } );
				itemFulfillMent.setCurrentSublistValue( 'item', 'apply', 'T' );
				if ( lines[i].location ) {
					itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'location', value: lines[i].location } );
				}
				if ( lines[i].quantity ) {
					itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: lines[i].quantity } );
				}
				if ( lines[i].inventorydetail ) {
					if ( lines[i].inventorydetail.length > 0 ) {
						var inventoryDetail = itemFulfillMent.getCurrentSublistSubrecord( 'item', 'inventorydetail' );
						for ( var j = 0; j < lines[i].inventorydetail.length; j++ ) {
							inventoryDetail.selectLine( { sublistId: 'inventoryassignment', line: lines[i].inventorydetail[j].position } );
							var lotName = lines[i].inventorydetail[j].lotNumberName;
							if ( lotName &&  inventoryNumbers[lotName] ) {
								inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', inventoryNumbers[lotName] );
							}
							if ( lines[i].inventorydetail[j].binNumber ) {
								inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'binnumber', lines[i].inventorydetail[j].binNumber );
							}
							if ( lines[i].inventorydetail[j].quantity ) {
								inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', lines[i].inventorydetail[j].quantity );
							}
							inventoryDetail.commitLine( 'inventoryassignment' );
						}
					}
				}
				itemFulfillMent.commitLine( 'item' );
			}
		}
	}
	
		
	
	return handler;
} );