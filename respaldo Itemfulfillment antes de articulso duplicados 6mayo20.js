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
		log.error('itemsPosition',itemsPosition);
		var inventoryNumbers = getInventoryNumbers( Object.keys( itemsPosition ) ).item;
		log.error('inventoryNumbers',inventoryNumbers);
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
              /*Disc prov*/
            var total = billRecord.getValue({fieldId:'total'});
          	var disc = billRecord.getValue({fieldId:'custbody_nso_indr_client_discount'});
          	disc = parseFloat(disc)/100;
            var discAmount = total * disc;
          	log.debug('total: ', total);
          	log.debug('discount: ', disc);
            log.debug('discountAmount: ', discAmount.toFixed(4));
            billRecord.setValue('custbody_nso_indr_total_discount',discAmount.toFixed(4));
            billRecord.setValue('custbody_nso_indr_discount_16p',discAmount.toFixed(2));
              /*END Disc*/
			var idInvoice = billRecord.save({ ignoreMandatoryFields: true });
			log.debug('idInvoice', idInvoice);
			log.error('Antes de cerrar SO','');
			//AQUI   CERRAMOS EL PEDIDO SI ES QUE QUEDÓ PARCIAL Y GENERAMOS VENTAPERDIDA
			cerrarSaleOrder(context.createdfrom.id);
         
            } catch ( e ) {
                    log.error( 'POST', JSON.stringify( e ) );
                    var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
                    return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR AL FACTURAR' + errorText }, 'internalId': 0};
            } 




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
                      myvar=myvar+'  <li><strong>'+SaleOrder.getSublistText({sublistId: 'item', line: i, fieldId: 'item'})+'</strong>      '+SaleOrder.getSublistValue({sublistId: 'item', line: i, fieldId: 'quantity'})+' '+SaleOrder.getSublistText({sublistId: 'item', line: i, fieldId: 'units'})+'</li>'
                  }
      };
      myvar=myvar+'</ul>';

     var recipients=buscarecipients(SaleOrder.getValue('entity'));
      log.error('rrr',recipients);
      recipients.push(7); 

      email.send({
              author: 34,
              recipients: recipients,
              subject: "Partida cancelada en WMS - No Responder",
              body: myvar  
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