/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor Maria Alejandra Blanco
 *@Company Netsoft
 *@NModuleScope Public
 *@Name INDR | Inventory Adjustment Creation
 *@Description
 * scriptName nso_indr_rs_InventoryAdjustment_Integration.js
 */

define( ['N/error', 'N/record', 'N/format','N/email'], function( error, record, format ,email) {
	
	var handler = {};
	
	const ERRORS = {
		NSO_NULL_FIELD : {name: 'NSO_NULL_FIELD', message: 'El campo es requerido'}
	};
	
	function addInventoryAdjsLines( inventoryAdjustment, context ) {
		var lines = context.items;
		for ( var i = 0; i < lines.length; i ++ ) {
			inventoryAdjustment.selectNewLine( 'inventory' );
			inventoryAdjustment.setCurrentSublistValue( 'inventory',  'item', lines[i].itemId );
			inventoryAdjustment.setCurrentSublistValue( 'inventory',  'location', lines[i].location );
			inventoryAdjustment.setCurrentSublistValue( 'inventory',  'adjustqtyby', lines[i].quantity );
			inventoryAdjustment.setCurrentSublistValue( 'inventory',  'unitcost', lines[i].unitCost );
			inventoryAdjustment.setCurrentSublistValue( 'inventory',  'department', lines[i].department );
			inventoryAdjustment.setCurrentSublistValue( 'inventory',  'class', lines[i].classification );
			inventoryAdjustment.setCurrentSublistValue( 'inventory',  'memo', lines[i].notes );
			if ( lines[i].bins ) {
				if ( lines[i].bins.length > 0 ) {
					var inventoryDetail = inventoryAdjustment.getCurrentSublistSubrecord( 'inventory', 'inventorydetail' );
					for ( var j = 0; j < lines[i].bins.length; j++ ) {
						inventoryDetail.selectNewLine( 'inventoryassignment' );
						inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'receiptinventorynumber', lines[i].bins[j].lotNumberName );
						inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'binnumber', lines[i].bins[j].binNumber );
						if ( lines[i].bins[j].expDate ) {
							var expDate = format.parse( lines[i].bins[j].expDate, 'date' );
							inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'expirationdate', expDate );
						}
						inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', lines[i].bins[j].quantity );
						inventoryDetail.commitLine( 'inventoryassignment' );
					}
				}
			}
			inventoryAdjustment.commitLine( 'inventory' );
		}
	}
	
	function validateContext( context ) {
		if ( !context.account || !context.account == null ) {
			throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': account' } );
		}
		if ( !context.subsidiary || !context.subsidiary == null ) {
			throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': subsidiary' } );
		}
		if ( !context.trandate || !context.subsidiary == null ) {
			throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message+=': trandate' } );
		}
	}
	
	handler.post = function( context ) {
		try {
			log.audit( 'CONTEXT', JSON.stringify( context ) );
			validateContext( context );
			var inventoryAdjustment = record.create( { type: 'inventoryadjustment', isDynamic: true } );
			inventoryAdjustment.setValue( 'account',  context.account );
			inventoryAdjustment.setValue( 'adjlocation', context.location );
			inventoryAdjustment.setValue( 'class', context.classification );
			inventoryAdjustment.setValue( 'customer', context.clientId );
			inventoryAdjustment.setValue( 'department', context.department );
			inventoryAdjustment.setValue( 'memo', context.notes );
			inventoryAdjustment.setValue( 'subsidiary', context.subsidiary  );
			var trandate = format.parse( context.trandate, 'date' );
			inventoryAdjustment.setValue( 'trandate', ( trandate || new Date() ) );
			inventoryAdjustment.setValue( 'trandid', context.transactionNumber );
			addInventoryAdjsLines( inventoryAdjustment, context );
			var ininventoryAdjustmentId = inventoryAdjustment.save();
			log.audit( 'Inventory ID', JSON.stringify( context ) );
			
			return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }, 'internalId': ininventoryAdjustmentId };
		} catch ( e ) {
			log.error( 'POST', JSON.stringify( e ) );
            var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
            if(errorText.search("negative count")>0)
            {
				RegistraInventarioNegativo(context);
                enviarEmail(errorText);  //Mandar a jloza y  nbeltran
            }
			return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_AJUSTES_INVENTARIO ' + errorText }, 'internalId': '' };
		}
    };
	
	
	function RegistraInventarioNegativo(context)
	{
		log.error({
			title: 'INICIO NEGATIVO',
			details: 'SI'
		});
		var lines = context.items;

		var InventarioNegativo = record.create({
            type: 'customrecord_zindar_inventarionegativo',
            isDynamic: true
            });

			var hoy = new Date();
            var receipt_date2 = format.parse( hoy, 'date' );
				log.error({
					title: 'fecha',
					details: receipt_date2
				});
			InventarioNegativo.setValue({fieldId:'custrecord_invnegativo_fecha',value:receipt_date2});

		for ( var i = 0; i < lines.length; i ++ ) {
				InventarioNegativo.setValue({fieldId:'custrecord_invnegativo_location',value:lines[i].location});
				InventarioNegativo.setValue({fieldId:'custrecord_invnegativo_cantidad',value:lines[i].quantity});
				InventarioNegativo.setValue({fieldId:'custrecord_invnegativo_item',value:lines[i].itemId});
		}
	var idInvNeg=	InventarioNegativo.save({ignoreMandatoryFields:true});
		log.error({
			title: 'ID INVENTARIONEGATIVO',
			details: idInvNeg
		});
	}

    function enviarEmail(body)
    {
        log.error({
            title: 'EMAIL',
            details: 'Si entra'
        });
        email.send({
            author: 34,
            recipients: 7,
            subject: 'Error  ajuste Inventario',
            body: body
            });

    }
	
	function editInventoryAdjsLines( inventoryAdjustment, context ) {
		var lines = context.items;
		if ( lines ) {
			for ( var i = 0; i < lines.length; i ++ ) {
				inventoryAdjustment.selectLine({ sublistId: 'inventory', line: lines[i].position });
				if ( lines[i].itemId  ) {
					inventoryAdjustment.setCurrentSublistValue( 'inventory',  'item', lines[i].itemId );
				}
				if ( lines[i].location  ) {
					inventoryAdjustment.setCurrentSublistValue( 'inventory',  'location', lines[i].location );
				}
				if ( lines[i].quantity  ) {
					inventoryAdjustment.setCurrentSublistValue( 'inventory',  'adjustqtyby', lines[i].quantity );
				}
				if ( lines[i].unitCost  ) {
					inventoryAdjustment.setCurrentSublistValue( 'inventory',  'unitcost', lines[i].unitCost );
				}
				if ( lines[i].department  ) {
					inventoryAdjustment.setCurrentSublistValue( 'inventory',  'department', lines[i].department );
				}
				if ( lines[i].classification  ) {
					inventoryAdjustment.setCurrentSublistValue( 'inventory',  'class', lines[i].classification );
				}
				if ( lines[i].notes  ) {
					inventoryAdjustment.setCurrentSublistValue( 'inventory',  'memo', lines[i].notes );
				}
				if ( lines[i].bins ) {
					var inventoryDetail = inventoryAdjustment.getCurrentSublistSubrecord( 'inventory', 'inventorydetail' );
					for ( var j = 0; j < lines[i].bins.length; j++ ) {
						inventoryDetail.selectLine( { sublistId: 'inventoryassignment', line: lines[i].bins[j].position } );
						if ( lines[i].bins[j].lotNumberName ) {
							inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'receiptinventorynumber', lines[i].bins[j].lotNumberName );
						}
						if ( lines[i].bins[j].binNumber ) {
							inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'binnumber', lines[i].bins[j].binNumber );
						}
						if ( lines[i].bins[j].expDate ) {
							var expDate = format.parse( lines[i].bins[j].expDate, 'date' );
							inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'expirationdate', expDate );
						}
						if ( lines[i].bins[j].quantity ) {
							inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', lines[i].bins[j].quantity );
						}
						inventoryDetail.commitLine( 'inventoryassignment' );
					}
				}
				inventoryAdjustment.commitLine( 'inventory' );
			}
		}
	}
	
	handler.put = function( context ) {
		try {
			log.audit( 'CONTEXT', JSON.stringify( context ) );
			var inventoryAdjustment = record.load( { type: 'inventoryadjustment', id: context.internalId, isDynamic: true } );
			if ( context.account ) {
				inventoryAdjustment.setValue( 'account',  context.account );
			}
			if ( context.location ) {
				inventoryAdjustment.setValue( 'adjlocation', context.location );
			}
			if ( context.classification ) {
				inventoryAdjustment.setValue( 'class', context.classification );
			}
			if ( context.department ) {
				inventoryAdjustment.setValue( 'department', context.department );
			}
			if ( context.clientId ) {
				inventoryAdjustment.setValue( 'customer', context.clientId );
			}
			if ( context.notes ) {
				inventoryAdjustment.setValue( 'memo', context.notes );
			}
			if ( context.subsidiary ) {
				inventoryAdjustment.setValue( 'subsidiary', context.subsidiary );
			}
			if ( context.trandate ) {
				var trandate = format.parse( context.trandate, 'date' );
				inventoryAdjustment.setValue( 'trandate', trandate );
			}
			editInventoryAdjsLines( inventoryAdjustment, context );
			var ininventoryAdjustmentId = inventoryAdjustment.save();
			log.audit( 'Inventory ID', JSON.stringify( context ) );
			return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }, 'internalId': ininventoryAdjustmentId };
		} catch ( e ) {
			log.debug( 'PUT', JSON.stringify( e ) );
			var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
			return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_AJUSTES_INVENTARIO ' + errorText }, 'internalId': '' };
			
		}
	};
	
	handler.delete = function( context ) {
		try {
			log.audit( 'CONTEXT', JSON.stringify( context ) );
			var salesOrderRecord = record.delete({ type: 'inventoryadjustment', id: context.internalId });
		} catch ( e ) {
			log.debug( 'DELETE', JSON.stringify( e ) );
			var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
			return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_AJUSTES_INVENTARIO ' + errorText }, 'internalId': '' };
			
		}
	};
	
	return handler;
} );