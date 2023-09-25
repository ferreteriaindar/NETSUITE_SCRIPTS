/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  cerrar el pedido,o una linea de un pedido
 */

  define( ['N/http','N/format', 'N/log', 'N/record',  'N/search','N/encode','N/file' ,'N/runtime'], function( http,format,log,record,  search,encode,file ,runtime) {

    var handler = {};


    handler.post = function( context )
    {
      
    var regresa=   GENERARETURNAUTH(context);
        return regresa;
     /* if(PDF!=null)
              //return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': PDF.getContents()}, 'internalId': 0};
              return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK'}, 'internalId': 0};
        else
        return { 'responseStructure': { 'codeStatus': 'NO K', 'descriptionStatus': ''}, 'internalId': 0};
*/
       
    
  
    };
	handler.put = function( context )
    {
      
    var regresa=   GENERAR_CREDIT_MEMO(context);
        return regresa;
     /* if(PDF!=null)
              //return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': PDF.getContents()}, 'internalId': 0};
              return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK'}, 'internalId': 0};
        else
        return { 'responseStructure': { 'codeStatus': 'NO K', 'descriptionStatus': ''}, 'internalId': 0};
*/
       
    
  
    };

	function GENERAR_CREDIT_MEMO(context)
	{
		try{
            var Cremo = record.transform({
              fromType: record.Type.RETURN_AUTHORIZATION,
              fromId: context.createdfrom.id,
              toType: record.Type.CREDIT_MEMO,
              isDynamic: true
          });

			Cremo.setValue({fieldId:'memo',value:context.memo});	
			Cremo.setValue({fieldId:'custbody_regimen_fiscal_fe_33',value:null});
			Cremo.setValue({fieldId:'custbody_motivos_notadecredito',value: context.motivo});
			var resultadoID=  Cremo.save();
			return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'TERMINADO' }, 'internalId': resultadoID };

		} catch ( e ) {
			log.error( 'POST', JSON.stringify( e ) );
			var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
			return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR CREACION CREDIT MEMO' + errorText }, 'internalId': 0 };
		}
	}

   
    function GENERARETURNAUTH(context) {


        try{
            var ReAuth = record.transform({
              fromType: record.Type.INVOICE,
              fromId: context.createdfrom.id,
              toType: record.Type.RETURN_AUTHORIZATION,
              isDynamic: true
          });

          ReAuth.setValue({fieldId:'memo',value:context.memo});

          var LineasContext=[];
          for ( var z = 0; z < context.lines.length; z ++ ) {
			LineasContext.push({ itemId: context.lines[z].itemId, quantity:context.lines[z].quantity, location:context.lines[z].location});

		}


        log.error('context',JSON.stringify(LineasContext));

      //   for ( var i = ReAuth.getLineCount( 'item' ); i >=1 ; i -- )
         //   {
               /* var bandera=0;
                ReAuth.selectLine( { sublistId: 'item', line: i } );
                for ( var j = 0; j < LineasContext.length; j ++ ) 
                {
                    var  itemId=ReAuth.getCurrentSublistValue('item','item');
                    log.error('ITEM-contexitem',itemId+'*'+LineasContext[j].itemId+'='+LineasContext[j].quantity);
                    
                    if(LineasContext[j].itemId===itemId)
                    {
                        log.error('ITEM-contexitem',itemId+'*'+LineasContext[j].itemId+'='+LineasContext[j].quantity);
                        bandera=1;
                        ReAuth.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: LineasContext[j].quantity } );
                       // ReAuth.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantityreceived', value: LineasContext[j].quantity } );
                        ReAuth.commitLine( 'item' );
                    }
                    else
                    {
                        ReAuth.setCurrentSublistValue( 'item', 'apply', 'F' );
                        ReAuth.setCurrentSublistValue( { sublistId: 'item', fieldId: 'quantity', value: '' } );
                    }*/
                    var i = 0;
                    while ( ReAuth.getLineCount( 'item' ) > 0 ) {
                        ReAuth.removeLine( { sublistId: 'item', line: i } );
                    }
                


                
             

              /*  if(bandera==0)
                {
                    ReAuth.removeLine( { sublistId: 'item', line: i, ignoreRecalc: false } );
                    //ReAuth.commitLine( 'item' );
                }*/
                    
         //   }

   
            for ( var j = 0; j < LineasContext.length; j ++ ) 
            {
                log.error('linea',LineasContext[j].itemId);
                ReAuth.selectNewLine({ sublistId: 'item' });
                ReAuth.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: LineasContext[j].itemId,forceSyncSourcing:false });
                ReAuth.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: LineasContext[j].quantity, forceSyncSourcing:false  });
                    ReAuth.commitLine({sublistId: 'item'});
            }


            ReAuth.setValue({fieldId:'orderstatus',value:'B'});
           var resultadoID= ReAuth.save();


           //AHORA EMPIEZA EL FULFILLMENT DE LA  RETURN AUTHORIZATION
           var itemFulfillMent = record.transform( {
            fromType: record.Type.RETURN_AUTHORIZATION,
            fromId: resultadoID,
            toType: record.Type.ITEM_RECEIPT,
            isDynamic: true,
        } );
            itemFulfillMent.setValue({fieldId:'memo',value:context.memo});
            itemFulfillMent.setValue( 'shipstatus', 'C' );
			itemFulfillMent.setValue( 'status', 'Shipped' );
        addItemFulfillMentLines(itemFulfillMent,LineasContext)
        itemFulfillMent.save();


           return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'TERMINADO' }, 'internalId': resultadoID };

        } catch ( e ) {
			log.error( 'POST', JSON.stringify( e ) );
			var errorText = 'ERROR CODE: ' + e.name + 'DESCRIPTION: ' + e.message;
			return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR FULFILMMENT' + errorText }, 'internalId': 0 };
		}
        
    }


    function addItemFulfillMentLines( itemFulfillMent, LineasContext ) {

   
		var itemsPosition = {};
		var LineasFulfillMent=[];
		//var LineasContext=[];
		//Se llena arreglo  de la lista de articulos y cantidad que tiene  Fulfillmnet
		for ( var i = 0; i < itemFulfillMent.getLineCount( 'item' ); i ++ ) {
			itemsPosition[ itemFulfillMent.getSublistValue( 'item',  'item', i ) ] = i;
			LineasFulfillMent.push({itemId: itemFulfillMent.getSublistValue( 'item',  'item', i ),quantity: itemFulfillMent.getSublistValue( 'item',  'quantity', i ), line:itemFulfillMent.getSublistValue( 'item',  'line', i ),idweb:itemFulfillMent.getSublistValue( 'item',  'custcol_zindar_idweb_det', i )});
		}
		//Se llena arreglo de la lista de articulos del context

	
		log.error('itemsPosition',itemsPosition);
		log.error('LineasFulfillMent',LineasFulfillMent);
		//var inventoryNumbers = getInventoryNumbers( Object.keys( itemsPosition ) ).item;
	
	/*	var lines = context.lines;
		for ( var i = 0; i < lines.length; i ++ ) {
			LineasContext.push({ itemId: lines[i].itemId,quantity:lines[i].quantity,location:lines[i].location,inventorydetail:lines.inventorydetail});

		}*/
		log.error('LineasContext',LineasContext);
		for(var i=0;i<LineasFulfillMent.length;i++)
		{
			//log.error('LineaFulfill',LineasFulfillMent[i].line);
			itemFulfillMent.selectLine( { sublistId: 'item', line: i } );
			
			itemFulfillMent.setCurrentSublistValue( 'item', 'apply', 'T' );
			var  itemId=itemFulfillMent.getCurrentSublistValue('item','item');
			//var  IDWEB=itemFulfillMent.getCurrentSublistValue('item','custcol_zindar_idweb_det');
			
			//log.error('itemActual',itemId);
			// se recorre  el context por cada linea del fulfillment
			for(var j=0;j<LineasContext.length;j++)
			{
				if(itemId==LineasContext[j].itemId )
				{
					log.error('LINEA',LineasContext[j].itemId+'*');
					itemFulfillMent.setCurrentSublistValue( { sublistId: 'item', fieldId: 'location', value: LineasContext[j].location } );
					
					if(LineasFulfillMent[i].quantity==0) //SIGNIFICA QUE EN ESE MOMENTO NO HAY MERCANCIA RESERVADO EN NETSUITE Y MANDAMOS ERROR EN EL SAI
					{

						return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'INVENTARIO INCORRECTO REVISAR' }, 'internalId': 0 };
					}

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
					if(	itemFulfillMent.getSublistValue( 'item',  'item', i )==LineasContext[j].itemId && itemFulfillMent.getSublistValue( 'item',  'custcol_zindar_idweb_det', i )==LineasContext[j].idweb )
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

   

    return handler;
});