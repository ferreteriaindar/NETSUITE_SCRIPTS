/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor Ivan Macias
 *@Company Netsoft
 *@NModuleScope Public
 *@Name INDR | Inventory Transfer
 *@Description
 */

define( ['N/error', 'N/record', 'N/format', 'N/runtime', 'N/search'], function( error, record, format, runtime, search ) {

    var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD : {name: 'NSO_NULL_FIELD', message: 'El campo es requerido'}
    };

    function addInventoryAdjsLines( inventoryAdjustment, context ) {
        var lines = context.inventory;
        for ( var i = 0; i < lines.length; i ++ ) {
            inventoryAdjustment.selectNewLine( 'inventory' );
            inventoryAdjustment.setCurrentSublistValue( 'inventory',  'item', lines[i].item );
            inventoryAdjustment.setCurrentSublistValue( 'inventory',  'adjustqtyby', lines[i].adjustqtyby );
            var isLot = search.lookupFields({type: search.Type.ITEM, id: lines[i].item, columns: ['islotitem']}).islotitem;
			log.debug( 'ES LOTE', isLot );
            if(isLot){
              /*  if(lines[i].hasOwnProperty('inventorydetail') && lines[i].inventorydetail.length > 0){
                    var inventoryDetail = inventoryAdjustment.getCurrentSublistSubrecord( 'inventory', 'inventorydetail' );
                    for ( var j = 0; j < lines[i].inventorydetail.length; j++ ) {
                        inventoryDetail.selectNewLine( 'inventoryassignment' );
                        inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', lines[i].inventorydetail[j].inventorynumber );
                        inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', lines[i].inventorydetail[j].quantity );
                        inventoryDetail.commitLine( 'inventoryassignment' );
                    }
                }else{
                    var numbers = getNumbers(lines[i].item, context.location);
                    var lineQuantity = lines[i].adjustqtyby;

                    for(var x = 0; x < numbers.length; x++){
                        var quantityOnHand = numbers[x].quantityonhand;
                        log.debug('QTYONHAND', quantityOnHand);
                        log.debug('lineQuantity', lineQuantity);
                        log.debug('NUMBERS', numbers[x]);
                        if(lineQuantity <= quantityOnHand){
                            var inventoryDetail = inventoryAdjustment.getCurrentSublistSubrecord( 'inventory', 'inventorydetail' );
                            inventoryDetail.selectNewLine( 'inventoryassignment' );
                            inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', numbers[x].id );
                            inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', lineQuantity );
                            inventoryDetail.commitLine( 'inventoryassignment' );
                            break;
                        }else{
                            var inventoryDetail = inventoryAdjustment.getCurrentSublistSubrecord( 'inventory', 'inventorydetail' );
                            inventoryDetail.selectNewLine( 'inventoryassignment' );
                            inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', numbers[x].id );
                            inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', quantityOnHand );
                            inventoryDetail.commitLine( 'inventoryassignment' );
                            lineQuantity -= quantityOnHand;
                        }
                    }
                }
            }

            inventoryAdjustment.commitLine( 'inventory' );*/
                var inventoryDetail = inventoryAdjustment.getCurrentSublistSubrecord( 'inventory', 'inventorydetail' );
							var ItemActual=inventoryAdjustment.getCurrentSublistValue( { sublistId: 'inventory', fieldId: 'item' } );
							var CantidadActual=inventoryAdjustment.getCurrentSublistValue( { sublistId: 'inventory', fieldId: 'quantity' } );
							var locationActual=context.location; //inventoryAdjustment.getCurrentSublistValue( { sublistId: 'inventory', fieldId: 'location' } ); 
							setLotNumbers_Indar(inventoryDetail,ItemActual,CantidadActual,locationActual);
            }   

        }
        inventoryAdjustment.commitLine( 'inventory' );
    }

    function getNumbers(item, location) {
        var numbersObj = [];
        search.create({type:'inventorynumber', filters:[['item', 'anyof', [item]],'AND',['location', 'anyof', [location]]],
            columns:['item', 'quantityonhand', 'quantityavailable', 'inventorynumber']}).run().each(function (r) {
                numbersObj.push({
                    id:r.id,
                    item:r.getValue('item'),
                    quantityonhand:r.getValue('quantityonhand'),
                    quantityavailable:r.getValue('quantityavailable'),
                    inventorynumber:r.getValue('inventorynumber'),
                });
        });
        return numbersObj;
    }

    function editInventoryAdjsLines( inventoryAdjustment, context ) {
        var lines = context.items;
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
                    if ( lines[i].bins[j].quantity ) {
                        inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', lines[i].bins[j].quantity );
                    }
                    inventoryDetail.commitLine( 'inventoryassignment' );
                }
            }
            inventoryAdjustment.commitLine( 'inventory' );
        }
    }

    function validateContext( context ) {
        var mandatoryFields = runtime.getCurrentScript().getParameter({ name:'custscript_indr_mandatory_fields_inv_tra' });
        mandatoryFields = JSON.parse(mandatoryFields);
        for(var x=0; x < mandatoryFields.header.length; x++){
            if(!context[mandatoryFields.header[x]]){
                throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message +' : '+
                        mandatoryFields.header[x] } );
            }
        }
        var subListKeys = Object.keys(mandatoryFields.detail);
        subListKeys.forEach(function (r) {
            var keysSublistIds = mandatoryFields.detail[r];
            for(var w = 0; w < context[r].length; w++){
                var fieldsSublistIds = Object.keys(context[r][w]);
                for(k = 0; k < fieldsSublistIds.length; k++){
                    if(!context[r][w][fieldsSublistIds[k]] && keysSublistIds.indexOf(fieldsSublistIds[k]) !== -1){
                        throw error.create( { name: ERRORS.NSO_NULL_FIELD.name, message: ERRORS.NSO_NULL_FIELD.message +' : '+
                                fieldsSublistIds[k] + ' Line : ' + w } );
                    }
                }
            }
        });
    }

  
  
  function setLotNumbers_Indar(inventoryDetail,Item,quantity,location)
	{
        log.debug('itembusqueda',Item);
        log.debug('locationbusqueda',location)
		var filters = [
			{ name: 'item', operator: 'anyof', values: Item },
			{ name: 'quantityavailable', operator: 'greaterthan', values: 0 },
			{ name: 'location', operator:'anyof', values: location}
		];
		var searchResults = search.create( {
			type: 'inventorynumber',
			filters: filters,
			columns: [ search.createColumn({name: "internalid", label: "Number"}),
			search.createColumn({name: "item", label: "Item"}),
			search.createColumn({name: "memo", label: "Memo"}),
			search.createColumn({name: "expirationdate", label: "Expiration Date"}),
			search.createColumn({name: "location", label: "Location"}),
			search.createColumn({name: "quantityavailable", label: "quantityavailable"}),
			search.createColumn({
			   name: "datecreated",
			   sort: search.Sort.ASC,
			   label: "Date Created"
			})]
		} );
		searchResults = getResults( searchResults );
   /* var resultadosCreditMemo=  searchResults.runPaged({
        pageSize: 1000
      });
     var k = 0;
     resultadosCreditMemo.pageRanges.forEach(function(pageRange) {
       var paginaCreditMemo = resultadosCreditMemo.fetch({ index: pageRange.index });
       paginaCreditMemo.data.forEach(function(r) {
           k++
         
           searchResults.push({
         "internalid": r.getValue({name:'internalid'}),
         "item": r.getValue({name:'item'}),
         "memo": r.getText({name:'memo'}),
         "expirationdate": r.getText({name:'expirationdate'}),
         "location": r.getText({name:'location'}),
         "quantityavailable":r.getText({name:'quantityavailable'}),
             "datecreated":r.getText({name:'datecreated'}),
         


       });
   });
   
   


});*/

		if ( searchResults.length > 0 ) {
				for (var i = 0; i < searchResults.length && quantity>0; i++ ) {

					var  cantidad_aux=searchResults[i].getValue( { name: 'quantityavailable' } ) ;
                    log.debug('CANTIDAD',cantidad_aux);
                    log.debug('numlote', searchResults[i].getValue( { name: 'internalid' } ));
					inventoryDetail.selectNewLine( 'inventoryassignment' );
					inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', searchResults[i].getValue( { name: 'internalid' } ) );
					inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', quantity>cantidad_aux?searchResults[i].getValue( { name: 'quantityavailable' } ):quantity  );
					inventoryDetail.commitLine( 'inventoryassignment' );
					quantity=quantity-cantidad_aux;
					
				}
		}


	}
  

    function getResults( searchResults ) {
		var k = 0;
		var searchResult = [];
		var result = searchResults.run().getRange  ( k * 100, ( k + 1 ) * 100 );
		searchResult = searchResult.concat( result );
		while ( result.length == 100 ) {
			k++;
			result = searchResults.run().getRange( k * 100, ( k + 1 ) * 100 );
			searchResult = searchResult.concat( result );
		}
		return searchResult;
	}
	
  
  
    handler.post = function( context ) {
        try {
            log.debug( 'CONTEXT', context );
            validateContext( context );
            var inventoryTransfer = record.create( { type: 'inventorytransfer', isDynamic: true } );

            if(context.hasOwnProperty('customform') && context.customform){
                inventoryTransfer.setValue( 'customform',  context.customform );
            }

            inventoryTransfer.setValue( 'location', context.location );
            inventoryTransfer.setValue( 'transferlocation', context.transferlocation );
            inventoryTransfer.setValue( 'department', context.department );
            inventoryTransfer.setValue('custbody_zindar_id_wms',context.Id_WMS);
          

            if(context.hasOwnProperty('trandate') && context.trandate){
                var trandate = format.parse( context.trandate, 'date' );
                inventoryTransfer.setValue( 'trandate',  context.trandate );
            }

            if(context.hasOwnProperty('memo') && context.memo){
                inventoryTransfer.setValue( 'memo',  context.memo );
            }

            if(context.hasOwnProperty('class') && context.class){
                inventoryTransfer.setValue( 'class',  context.class );
            }

            if(context.hasOwnProperty('trandid') && context.trandid){
                inventoryTransfer.setValue( 'trandid',  context.trandid );
            }

            addInventoryAdjsLines( inventoryTransfer, context );
            var idInvTransfer = inventoryTransfer.save();
            return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }, 'internalId': idInvTransfer };
        } catch ( e ) {
            log.debug( 'POST', e );
            var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'IVENTORY_TRANSFER_ERROR ' + errorText }, 'internalId': '' };
        }
    };

    handler.put = function( context ) {
        try {
            log.audit( 'CONTEXT', JSON.stringify( context ) );
            var inventoryTransfer = record.load( { type: 'inventorytransfer', id: context.internalId, isDynamic: true } );
            if ( context.account ) {
                inventoryTransfer.setValue( 'account',  context.account );
            }
            if ( context.location ) {
                inventoryTransfer.setValue( 'adjlocation', context.location );
            }
            if ( context.classification ) {
                inventoryTransfer.setValue( 'class', context.classification );
            }
            if ( context.department ) {
                inventoryTransfer.setValue( 'department', context.department );
            }
            if ( context.clientId ) {
                inventoryTransfer.setValue( 'customer', context.clientId );
            }
            if ( context.notes ) {
                inventoryTransfer.setValue( 'memo', context.notes );
            }
            if ( context.subsidiary ) {
                inventoryTransfer.setValue( 'subsidiary', context.subsidiary );
            }
            editInventoryAdjsLines( inventoryTransfer, context );
            var idInventoryTransferId = inventoryTransfer.save();
            log.audit( 'Inventory ID', JSON.stringify( context ) );
            return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }, 'internalId': idInventoryTransferId };
        } catch ( e ) {
            log.debug( 'PUT', JSON.stringify( e ) );
            var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_AJUSTES_INVENTARIO ' + errorText }, 'internalId': '' };

        }
    };

    handler.delete = function( context ) {
        try {
            log.audit( 'CONTEXT', JSON.stringify( context ) );
            var salesOrderRecord = record.delete({ type: 'inventorytransfer', id: context.internalId });
        } catch ( e ) {
            log.debug( 'DELETE', JSON.stringify( e ) );
            var errorText = 'ERROR CODE: ' + e.name + '\nDESCRIPTION: ' + e.message;
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR_CREA_AJUSTES_INVENTARIO ' + errorText }, 'internalId': '' };

        }
    };

    return handler;
} );