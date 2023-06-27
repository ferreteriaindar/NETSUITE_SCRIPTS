/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRORS
 *@NModuleScope Public
 */

 define( ['N/error', 'N/record', 'N/format', 'N/search','N/email'], function( error, record, format, search,email ) {
	
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
			log.error('inventorynumber',inventoryNumbers[i].id)
			inventoryDetail.selectNewLine( 'inventoryassignment' );
			inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', inventoryNumbers[i].id );
			inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', inventoryNumbers[i].qty > quantity ? quantity : inventoryNumbers[i].qty );
			inventoryDetail.commitLine( 'inventoryassignment' );
			quantity = quantity - inventoryNumbers[i].qty;
		}
	}


	function setLotNumbers_Indar(inventoryDetail,Item,quantity,location)
	{
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
		if ( searchResults.length > 0 ) {
				for (var i = 0; i < searchResults.length && quantity>0; i++ ) {

					var  cantidad_aux=searchResults[i].getValue( { name: 'quantityavailable' } ) ;
					inventoryDetail.selectNewLine( 'inventoryassignment' );
					inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'issueinventorynumber', searchResults[i].getValue( { name: 'internalid' } ) );
					inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', quantity>cantidad_aux?searchResults[i].getValue( { name: 'quantityavailable' } ):quantity  );
					inventoryDetail.commitLine( 'inventoryassignment' );
					quantity=quantity-cantidad_aux;
					
				}
		}


	}
	
	function addItemFulfillMentLines( itemFulfillMent, context ) {
		var itemsPosition = {};
		var LineasFulfillMent=[];
		var LineasContext=[];
		//Se llena arreglo  de la lista de articulos y cantidad que tiene  Fulfillmnet
		for ( var i = 0; i < itemFulfillMent.getLineCount( 'item' ); i ++ ) {
			itemsPosition[ itemFulfillMent.getSublistValue( 'item',  'item', i ) ] = i;
			LineasFulfillMent.push({itemId: itemFulfillMent.getSublistValue( 'item',  'item', i ),quantity: itemFulfillMent.getSublistValue( 'item',  'quantity', i ), line:itemFulfillMent.getSublistValue( 'item',  'line', i )});
		}
		//Se llena arreglo de la lista de articulos del context

	
		//log.error('itemsPosition',itemsPosition);
		//log.error('LineasFulfillMent',LineasFulfillMent);
		var inventoryNumbers = getInventoryNumbers( Object.keys( itemsPosition ) ).item;
	
		var lines = context.lines;
		for ( var i = 0; i < lines.length; i ++ ) {
			LineasContext.push({ itemId: lines[i].itemId,quantity:lines[i].quantity,location:lines[i].location,inventorydetail:lines.inventorydetail});

		}
		//log.error('LineasContext',LineasContext);
		for(var i=0;i<LineasFulfillMent.length;i++)
		{
		//	log.error('LineaFulfill',LineasFulfillMent[i].line);
			itemFulfillMent.selectLine( { sublistId: 'item', line: i } );
			itemFulfillMent.setCurrentSublistValue( 'item', 'apply', 'T' );
			var  itemId=itemFulfillMent.getCurrentSublistValue('item','item');
		//	log.error('itemActual',itemId);
			// se recorre  el context por cada linea del fulfillment
			for(var j=0;j<LineasContext.length;j++)
			{
				if(itemId==LineasContext[j].itemId )
				{
				//	log.error('Entra'+itemId,'si');
					itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'location', value: LineasContext[j].location } );
					
					if(LineasFulfillMent[i].quantity<LineasContext[j].quantity)
					{
						//log.error('entraResta','si');
						itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: LineasFulfillMent[i].quantity } );
						LineasContext[j].quantity=Number(LineasContext[j].quantity)-Number(LineasFulfillMent[i].quantity);
						//log.error('ContextResultado',LineasContext);
					}
					else  
						{
							if(LineasContext[j].quantity==0)
							{
								itemFulfillMent.setCurrentSublistValue( 'item', 'apply', 'F' );
								itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: '' } );
							}
							else
								{itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: LineasContext[j].quantity } );}
								if(LineasFulfillMent[i].quantity>LineasContext[j].quantity)
								{
									 LineasContext[j].quantity=0;
								}
							//	log.error('ContextResultado2',LineasContext);	
						}
								
					//TEMA  DE NUMEROS DE SERIE Y LOTE   NO ESTA PROBADO POR QUE NO LO USAMOS EN INDAR
					if ( itemFulfillMent.getCurrentSublistValue( { sublistId: 'item', fieldId: 'inventorydetailreq' } ) == 'T' && context.createdfrom.recordType == 'salesorder' ) {
						/*if ( inventoryNumbers[LineasFulfillMent[i].itemId][LineasFulfillMent[i].location ] ) {
							var inventoryDetail = itemFulfillMent.getCurrentSublistSubrecord( 'item', 'inventorydetail' );
							setLotNumbers( inventoryDetail, inventoryNumbers[LineasFulfillMent[i].itemId][LineasFulfillMent[i].location ] ,LineasFulfillMent[i].quantity );
						} else {  // ESTOS ES EL TEMA LOS NUMEROS DE  SERIE /  BIN_NUMBER
							if ( LineasContext[j].inventorydetail ) {
								if ( LineasContext[j].inventorydetail.length > 0 ) {
									for ( var z = 0; z< LineasContext[j].inventorydetail.length; z++ ) {
										inventoryDetail.selectNewLine( 'inventoryassignment' );
										if ( LineasContext[j].inventorydetail[z].binNumber ) {
											inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'binnumber', LineasContext[j].inventorydetail[z].binNumber );
										}
										inventoryDetail.setCurrentSublistValue( 'inventoryassignment', 'quantity', LineasContext[j].inventorydetail[z].quantity );
										inventoryDetail.commitLine( 'inventoryassignment' );
									}
								}
							}
							
						}*/
							//AGREGADO RVELASCO 26/04/2022 SOLO PARA  NUMERO DE LOTE /PEDIMENTO, NO PARA  BIN O NUMERO DE SERIE
							var inventoryDetail = itemFulfillMent.getCurrentSublistSubrecord( 'item', 'inventorydetail' );
							var ItemActual=itemFulfillMent.getCurrentSublistValue( { sublistId: 'item', fieldId: 'item' } );
							var CantidadActual=itemFulfillMent.getCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity' } );
							var locationActual=itemFulfillMent.getCurrentSublistValue( { sublistId: 'item', fieldId: 'location' } ); 
							setLotNumbers_Indar(inventoryDetail,ItemActual,CantidadActual,locationActual);

					}	
					////FIN DE  NUMEROS DE SERIE
					itemFulfillMent.commitLine( 'item' );
				}
			
		
			}
			//PROCESO PARA CERRAR NO LO SURTIDO
			
		}
		//log.error('contextFinal',LineasContext);
		for ( var i = 0; i < itemFulfillMent.getLineCount( 'item' ); i ++ ) 
			{
				var bandera=0
				for (var j = 0; j < LineasContext.length; j++) {
					if(	itemFulfillMent.getSublistValue( 'item',  'item', i )==LineasContext[j].itemId)
					bandera=1;
					
				}
				if(bandera==0)
				{
					itemFulfillMent.selectLine( { sublistId: 'item', line: i } );
					itemFulfillMent.setCurrentSublistValue( 'item', 'apply', 'F' );
					itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: '' } );
					itemFulfillMent.commitLine( 'item' );

				}
			
			}
		/*for ( var i = 0; i < lines.length; i ++ ) {
			if ( itemsPosition[lines[i].itemId] != null ) {
	
				itemFulfillMent.selectLine( { sublistId: 'item', line: itemsPosition[lines[i].itemId] } );
			
				log.error('item','Renglon:'+itemFulfillMent.getCurrentSublistValue( 'item',  'line' )+':'+itemFulfillMent.getCurrentSublistValue( 'item',  'item' )+'LINES: '+lines[i].itemId+':'+lines[i].quantity);
				
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

				log.error('fulfillment',JSON.stringify( itemFulfillMent.getSublist({sublistId: 'item'}) ));
			}
		
			delete itemsPosition[lines[i].itemId];
		} */
		
	}


	function sumaCantidadTotal(lines)
	{
				var suma= 0;
				

				for ( var i = 0; i < lines.length; i ++ ) 
					{
						//log.error({title: 'item',details: lines[i].itemId});
						suma=suma+ Number( lines[i].quantity);
					}
					log.error({title: 'suma',details: suma});

						if (suma>0)
						return true;
						else return false;
				
	}
	
	function SepuedeFacturar (internalId)
	{
		 // Define search filters to find the sales order record
		 var filters = [
			["internalid", "anyof", internalId]
		  ];
		
		  // Define search columns to retrieve the sales order status
		  var columns = [
			search.createColumn({
			  name: "status",
			  label: "Status"
			})
		  ];
		
		  // Execute the search
		  var searchResults = search.create({
			type: search.Type.SALES_ORDER,
			filters: filters,
			columns: columns
		  }).run().getRange({ start: 0, end: 1 });
		
		  // Extract the sales order status from the search results
		  var status = "";
		  if (searchResults.length > 0) {
			status = searchResults[0].getValue(columns[0]);
		  }
		log.error('statuspedido',status);
		  if(status=='fullyBilled')
          { 
            log.error('DUPLICADO','si');
            return true;  //NO SE PUEDE FACTURAR POR QUE YA EXISTE FACTURA
          }
		  else return false;  //SI PUEDE FACTURAR POR QU ENO HAY FACTUEA

	}


	handler.post = function( context ) {

	log.error({
		title: 'INICIA SCRIPT',
		details: context.createdfrom.id
	});
      log.error('WMS',context.wms);
		try {
					
			if(sumaCantidadTotal(context.lines))
			{
						//ARGREADO 30/03/2023 PARA VALIDAR SI YA TIENE FACTURA
					if( SepuedeFacturar(context.createdfrom.id))
					return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'FACTURA REPETIDA' }, 'internalId': 0 };
					//ARGREADO 30/03/2023 PARA VALIDAR SI YA TIENE FACTURA

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
				
				try
				{
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
					///*Disc prov
					var total = billRecord.getValue({fieldId:'total'});
					var disc = billRecord.getValue({fieldId:'custbody_nso_indr_client_discount'});
					disc = parseFloat(disc)/100;
					var discAmount = total * disc;
					log.debug('total: ', total);
					log.error('discount: ', disc);
					log.debug('discountAmount: ', discAmount.toFixed(4));
					billRecord.setValue('custbody_zindar_wmsclave',context.wms);
					billRecord.setValue('custbody_nso_indr_total_discount',discAmount.toFixed(4));
					billRecord.setValue('custbody_nso_indr_discount_16p',discAmount.toFixed(2));
					billRecord.setValue('custbody_nso_indr_zero_tax_discount', 0);
					// /*END Disc
					log.debug('AntesGuardarInvoice', 'ENTRA');
					var idInvoice = billRecord.save({ ignoreMandatoryFields: true });
					log.debug('DespuesGuardarInvoice', 'ENTRA');
					log.debug('idInvoice', idInvoice);
					log.error('Antes de cerrar SO','');
					//AQUI   CERRAMOS EL PEDIDO SI ES QUE QUEDÓ PARCIAL Y GENERAMOS VENTAPERDIDA
				
				
			
				} catch ( e ) {
						log.error( 'POST', JSON.stringify( e ) );
						var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
						return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR AL FACTURAR' + errorText }, 'internalId': 0};
				} 
			}
			cerrarSaleOrder(context.createdfrom.id);  


			return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }, 'internalId': idInvoice };
		} catch ( e ) {
			log.error( 'POST', JSON.stringify( e ) );
			var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
			return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR FULFILMMENT' + errorText }, 'internalId': 0 };
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
	
	function cerrarSaleOrder(saleOrderID)
    {
        try
        {
             
        var SaleOrder = record.load({ type: record.Type.SALES_ORDER, id: saleOrderID    });
  
          if(SaleOrder.getValue('orderstatus')=='D' ||SaleOrder.getValue('orderstatus')=='D')
          {
			  log.error('si entra a cerrar SO','');
              var VentaPerdidaLineas= [];
              log.error('LINEAS',SaleOrder.getLineCount({sublistId: 'item'}));
              for (var i = 0; i < SaleOrder.getLineCount({sublistId: 'item'}); i++) {
              
                  /*if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } )==0)
                  {
                      
                  SaleOrder.setSublistValue({
                                                  sublistId: 'item',
                                                  fieldId: 'isclosed',
                                                  line: i,
                                                  value: true
                                              });
                  }*/
                  if(SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } )<SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } ))
                  {
                      log.error('Detecta Parcial','si'+SaleOrder.getSublistText({ sublistId: 'item', line: i, fieldId: 'item' }));
                      SaleOrder.setSublistValue({
                          sublistId: 'item',
                          fieldId: 'isclosed',
                          line: i,
                          value: true
                      });
                      VentaPerdidaLineas.push( {
                          articulo:  SaleOrder.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' }),
                          cantidad:  (SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } )-SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } ))
                      });
                  }
              }
             
              SaleOrder.save({ ignoreMandatoryFields: true });
              generaVentaPerdida(SaleOrder,VentaPerdidaLineas);
            
  
              
  
          }
          else
          {
              log.error('No es STATUSd',SaleOrder.getValue('orderstatus'));
          }
        
      
        }
           catch ( e ) {
            log.error( 'GET', JSON.stringify( e ) );
            var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }, 'internalId': ''};
    
          }

	};
	function generaVentaPerdida(saleOrder,lineas)
     {
         log.error('generaVentaPerdida','si');
        var ventaPerdida = record.create({
            type: 'customrecord_zindarventaperdida',
            isDynamic: true
            });

            ventaPerdida.setValue({fieldId:'custrecord_ventaperdida_pedido',value:saleOrder.getValue('id')});
            ventaPerdida.setValue({fieldId:'name',value:saleOrder.getValue('tranid').toString()});
            ventaPerdida.setValue({fieldId:'custrecord_ventaperdida_forma',value:saleOrder.getValue('custbody_forma_de_envio')});
            var hoy = new Date();
            var receipt_date2 = format.parse( hoy, 'date' );
            ventaPerdida.setValue('custrecord_ventaperdida_fecha',receipt_date2);
            ventaPerdida.setValue({fieldId:'custrecord_ventaperdida_cliente',value:saleOrder.getValue('entity')});
           var idVentaperdida= ventaPerdida.save({ignoreMandatoryFields:true});
           // log.error( 'vp json', JSON.stringify( ventaPerdida ) );
           // log.error( 'name', ventaPerdida.getValue('name') );
           // log.error( 'id', idVentaperdida);
            for (var i = 0; i < lineas.length; i++) {
                var ventaPerdidaART = record.create({
                    type: 'customrecord_ventaperdida_articulorecord',
                    isDynamic: true
                    }); 
                    ventaPerdidaART.setValue('custrecord_articulorecord_articulo',lineas[i].articulo);
                    ventaPerdidaART.setValue('custrecord_articulorecord_cantidad',lineas[i].cantidad);
                    ventaPerdidaART.setValue('custrecord_articulorecord_pedidoid',idVentaperdida);
                    ventaPerdidaART.save({ignoreMandatoryFields:true});
                   
			}
			enviarEmail(saleOrder.getValue('id'));
			
	 };
	 
	 function enviarEmail(SaleOrderID)
	 {

		var SaleOrder=record.load({ type: record.Type.SALES_ORDER, id: SaleOrderID,isDynamic: true  });

		log.error('ENVIAR EMAIL','SI');
  
      var myvar = '<h3 style="text-align: center;"><span style="background-color: #ff9900; color: #ffffff;">AVISO</span></h3>'+
      '<p style="text-align: left;">Este correo es para avisarte  que algunas partidas  del pedido <strong> '+SaleOrder.getValue('tranid')+' </strong> del cliente <strong>'+SaleOrder.getText('entity')+' </strong> no fueron surtidas. El resto de artículos de este pedido seguira su proceso normal de surtido. Según creas conveniente, avisa a tu cliente. Este correo es informativo, favor de no contestarlo. </p>'+
      '<p style="text-align: left;"></p>'+
      '<ul>'+
      '';
      log.error('LINEAS',SaleOrder.getLineCount({sublistId: 'item'}));
     
      for (var i = 0; i < SaleOrder.getLineCount({sublistId: 'item'}); i++) {
        log.error('cerrado',SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'isclosed' } ));
        log.error('cerradoText',SaleOrder.getSublistText( { sublistId: 'item', line: i, fieldId: 'isclosed' } ));
        if(SaleOrder.getSublistText( { sublistId: 'item', line: i, fieldId: 'isclosed' } )=='T')
                  {
					 
                    log.error('entra','si');
                      myvar=myvar+'  <li><strong>'+SaleOrder.getSublistText({sublistId: 'item', line: i, fieldId: 'item'})+'</strong>      '+(SaleOrder.getSublistValue({sublistId: 'item', line: i, fieldId: 'quantity'})-SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantityfulfilled' } ))+'  '+SaleOrder.getSublistText({sublistId: 'item', line: i, fieldId: 'units'})+'</li>'
                  }
      };
      myvar=myvar+'</ul>';

	 var recipients=buscarecipients(SaleOrder.getValue('entity'));
	
    //  log.error('rrr',recipients);
    //  recipients.push(7); 

      email.send({
              author: 34,
              recipients: recipients,
              subject: "Partida cancelada en WMS - No Responder",
			  body: myvar  ,
			  relatedRecords: {transactionId:SaleOrder.id}
    		  });

	 };
	

	 function buscarecipients(internalid)
	 {
				  var json=[];
				  var customerSearchObj = search.create({
					type: "customer",
					filters:
					[
					  ["internalid","anyof",internalid]
					],
					columns:
					[
					  search.createColumn({name: "custentity_apoyo_vtas", label: "Apoyo ventas"}),
					  search.createColumn({name: "custentity_representaventas", label: "Representante vtas"})
					]
				});
				var resultados=  customerSearchObj.runPaged({
				  pageSize: 1000
				});
				var k = 0;
				  resultados.pageRanges.forEach(function(pageRange) {
					var pagina = resultados.fetch({ index: pageRange.index });
					pagina.data.forEach(function(r) {
						k++
					json.push(
						  //  "articulo": r.getValue({name:"Item"}),
							Number( r.getValue({name:'custentity_apoyo_vtas'}))
					);
					json.push(
					 Number( r.getValue({name:'custentity_representaventas'})  )
					)
				});
			});
	
			return json;
	 }


	 
	return handler;
} );