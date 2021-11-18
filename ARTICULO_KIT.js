/**

- Descripción: Genera un Json con los valores del articulo de inventario, lo almacena en un archivo y lo sube al servidor FTP
- Autor: Itzadiana Morales Rivera
- Biblioteca:
- Lenguaje: Javascript
- FechaCreación: 2021/11/17
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

 define( ['SuiteScripts/INDAR SCRIPTS/httpService','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

 function( httpService, error, log, runtime, file, record ) {
 
     function getJsonPoAfterSubmit( context ) {
 
         log.debug( 'context.type: ' + context.type );
 
         if ( context.type !== context.UserEventType.CREATE &&  context.type !== context.UserEventType.EDIT ) {
 
             return true;
         }
 
         try {
             var currentRecordAux = context.newRecord;
             var currentRecord    = record.load( { type:currentRecordAux.type,id:currentRecordAux.id } );
             var valoresArticulos = {};    
            
             var price1Tamaño     = currentRecord.getLineCount( { sublistId: 'price1' } );
             var price1Lineas     = [];
             var memberTamaño     = currentRecord.getLineCount( { sublistId: 'member' } );
             var memberLineas     = [];
           
             for ( var i = 0 ; i < price1Tamaño ; i++) {
 
                 price1Lineas.push( {
 
                    currency       : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'currency' } ),
                    price_1        : currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ),
                    price_2        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 1, line: i } ),
                    price_3        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 2, line: i } ),
                    price_4        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 3, line: i } ),
                    price_5        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 4, line: i } ),
                    pricelevel     : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'pricelevel' } ),
                    pricelevelname : obtieneNombre(i),
                    discount       : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'discount' } ),
 
                 } );
             } 
            for (var i=0;i<memberTamaño;i++)
            {
                    memberLineas.push({
                             id          : currentRecord.getSublistValue({sublistId: 'member',fieldId: 'item',line: i }),
                             memberunit  : currentRecord.getSublistValue({sublistId: 'member',fieldId: 'memberunit',line: i }),
                             quantity    : currentRecord.getSublistValue({sublistId: 'member',fieldId: 'quantity',line: i }),

                    })

            }
             
 
             valoresArticulos = {
 
                             baserecordtype                    : currentRecord.getValue( { fieldId : 'baserecordtype' } ),
                             isinactive                        : currentRecord.getValue( { fieldId : 'isinactive' } ),
                             custitem_nso_indr_sales_min_price : currentRecord.getValue( { fieldId : 'custitem_nso_indr_sales_min_price' } ),
                             minimumquantity                   : currentRecord.getValue( { fieldId : 'minimumquantity' } ),
                             maximumquantity                   : currentRecord.getValue( { fieldId : 'maximumquantity' } ),
                             custitem_clave_prod_serv          : currentRecord.getValue( { fieldId : 'custitem_prod_serv_fe_33' } ),
                             custitem_presentacion_individual  : currentRecord.getValue( { fieldId : 'custitem_presentacion_individual' } ),
                             custitem_presentacion_inner       : currentRecord.getValue( { fieldId : 'custitem_presentacion_inner' } ),
                             custitem_presentacion_semimaster  : currentRecord.getValue( { fieldId : 'custitem_presentacion_semimaster' } ),
                             custitem_presentacion_master      : currentRecord.getValue( { fieldId : 'custitem_presentacion_master' } ),
                             custitem_presentacion_pallet      : currentRecord.getValue( { fieldId : 'custitem_presentacion_pallet' } ),
 
                             cogsaccount                       : { id: currentRecord.getValue( { fieldId : 'cogsaccount' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'cogsaccount' } ) },
 
                             assetaccount                      : { id: currentRecord.getValue( { fieldId : 'assetaccount' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'assetaccount' } ) },
 
                             incomeaccount                     : { id: currentRecord.getValue( { fieldId : 'incomeaccount' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'incomeaccount' } ) },
 
                             custitem_tipo_clasif_art          : { id: currentRecord.getValue( { fieldId : 'custitem_tipo_clasif_art' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_tipo_clasif_art' } ) },
 
                             currency                          : { id: currentRecord.getValue( { fieldId : 'currency' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'currency' } ) },
 
                             custitem_rama_articulo           : { id: currentRecord.getValue( { fieldId : 'custitem_rama_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_rama_articulo' } ) },
 
                             custitem_grupo_articulo           : { id: currentRecord.getValue( { fieldId : 'custitem_grupo_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_grupo_articulo' } ) },
 
                             custitem_familia_articulo           : { id: currentRecord.getValue( { fieldId : 'custitem_familia_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_familia_articulo' } ) },
 
                             custitem_nivel_indar           : { id: currentRecord.getValue( { fieldId : 'custitem_nivel_indar' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_nivel_indar' } ) },
 
                             custitem_temporada_articulo           : { id: currentRecord.getValue( { fieldId : 'custitem_temporada_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_temporada_articulo' } ) },
 
                             custitem_ranking_pza              : currentRecord.getValue( { fieldId : 'custitem_ranking_pza' } ),
                             custitem_ranking_imp              : currentRecord.getValue( { fieldId : 'custitem_ranking_imp' } ),
                             custitem_indar_excepcion          : currentRecord.getValue( { fieldId : 'custitem_indar_excepcion' } ),
                             custitem_indar_explicacion        : currentRecord.getValue( { fieldId : 'custitem_indar_explicacion' } ),
                             custitem_costo_estandar           : currentRecord.getValue( { fieldId : 'custitem_costo_estandar' } ),
                             custitem_costo_estandar           : currentRecord.getValue( { fieldId : 'custitem_costo_estandar' } ),
                             custitem_sustitutos               : currentRecord.getValue( { fieldId : 'custitem_sustitutos' } ),
                             custitem_codigo_sustituto         : currentRecord.getValue( { fieldId : 'custitem_codigo_sustituto' } ),
                             custitem_multiplos_ordenar        : currentRecord.getValue( { fieldId : 'custitem_multiplos_ordenar' } ),
                             custitem_mensaje_emergente        : currentRecord.getValue( { fieldId : 'custitem_mensaje_emergente' } ),
                             exchangerate                      : currentRecord.getValue( { fieldId : 'exchangerate' } ),
                             id                                : currentRecord.getValue( { fieldId : 'id' } ),
                             subsidiary                        : currentRecord.getValue( { fieldId : 'subsidiary' } ),
                             type                              : currentRecord.getValue( { fieldId : 'type' } ),
                             itemid                            : currentRecord.getValue( { fieldId : 'itemid' } ),
                             displayname                       : currentRecord.getValue( { fieldId : 'displayname' } ),
 
                             unitstype                         : { id: currentRecord.getValue( { fieldId : 'unitstype' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'unitstype' } ) },
 
                             stockunit                         : { id: currentRecord.getValue( { fieldId : 'stockunit' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'stockunit' } ) },
 
                             purchaseunit                      : { id: currentRecord.getValue( { fieldId : 'purchaseunit' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'purchaseunit' } ) },
 
                             saleunit                          : { id: currentRecord.getValue( { fieldId : 'saleunit' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'saleunit' } ) },
 
                             baseunit                          : { id: currentRecord.getValue( { fieldId : 'baseunit' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'baseunit' } ) },
                            
                             vendorname                        : currentRecord.getValue( { fieldId : 'vendorname' } ),
                             upccode                           : currentRecord.getValue( { fieldId : 'upccode' } ),
                             parent                            : currentRecord.getValue( { fieldId : 'parent' } ),
                             includechildren                   : currentRecord.getValue( { fieldId : 'includechildren' } ),
 
                             department                        : { id: currentRecord.getValue( { fieldId : 'department' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'department' } ) },
 
                              class                            : { id: currentRecord.getValue( { fieldId : 'class' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'class' } ) },
 
                              location                         : { id: currentRecord.getValue( { fieldId : 'location' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'location' } ) },
                                                                  
                             tracklandedcost                   : currentRecord.getValue( { fieldId : 'tracklandedcost' } ),
                             costingmethoddisplay              : currentRecord.getValue( { fieldId : 'costingmethoddisplay' } ),
                             totalvalue                        : currentRecord.getValue( { fieldId : 'totalvalue' } ),
                             averagecost                       : currentRecord.getValue( { fieldId : 'averagecost' } ),
                             cost                              : currentRecord.getValue( { fieldId : 'cost' } ),
                             lastpurchaseprice                 : currentRecord.getValue( { fieldId : 'lastpurchaseprice' } ),
                             purchasedescription               : currentRecord.getValue( { fieldId : 'description' } ),
                             stockdescription                  : currentRecord.getValue( { fieldId : 'stockdescription' } ),
                             gainlossaccount                   : currentRecord.getValue( { fieldId : 'gainlossaccount' } ),
                             billpricevarianceacct             : currentRecord.getValue( { fieldId : 'billpricevarianceacct' } ),
                             billqtyvarianceacct               : currentRecord.getValue( { fieldId : 'billqtyvarianceacct' } ),
                             billexchratevarianceacct          : currentRecord.getValue( { fieldId : 'billexchratevarianceacct' } ),
                             custreturnvarianceaccount         : currentRecord.getValue( { fieldId : 'custreturnvarianceaccount' } ),
                             vendreturnvarianceaccount         : currentRecord.getValue( { fieldId : 'vendreturnvarianceaccount' } ),
 
                             taxschedule                        : { id: currentRecord.getValue( { fieldId : 'taxschedule' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'taxschedule' } ) },
 
                             isonline                          : currentRecord.getValue( { fieldId : 'isonline' } ),
                             storedisplayname                  : currentRecord.getValue( { fieldId : 'storedisplayname' } ),
                             storedescription                  : currentRecord.getValue( { fieldId : 'storedescription' } ),
                             storedetaileddescription          : currentRecord.getValue( { fieldId : 'storedetaileddescription' } ),
                             featureddescription               : currentRecord.getValue( { fieldId : 'featureddescription' } ),
                             storeitemtemplate                 : currentRecord.getValue( { fieldId : 'storeitemtemplate' } ),
                             storedisplayimage                 : currentRecord.getValue( { fieldId : 'storedisplayimage' } ),
                             storedisplaythumbnail             : currentRecord.getValue( { fieldId : 'storedisplaythumbnail' } ),
                             isdonationitem                    : currentRecord.getValue( { fieldId : 'isdonationitem' } ),
                             showdefaultdonationamount         : currentRecord.getValue( { fieldId : 'showdefaultdonationamount' } ),
                             maxdonationamount                 : currentRecord.getValue( { fieldId : 'maxdonationamount' } ),
                             dontshowprice                     : currentRecord.getValue( { fieldId : 'dontshowprice' } ),
                             nopricemessage                    : currentRecord.getValue( { fieldId : 'nopricemessage' } ),
 
 
                             custitem_tipo_articulo            : { id: currentRecord.getValue( { fieldId : 'custitem_tipo_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_tipo_articulo' } ) },
 
                             custitem_fabricante_articulo      : { id: currentRecord.getValue( { fieldId : 'custitem_fabricante_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_fabricante_articulo' } ) },
 
                             custitem_linea_articulo           : { id: currentRecord.getValue( { fieldId : 'custitem_linea_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_linea_articulo' } ) },
 
                             custitem_categoria_articulo       : { id: currentRecord.getValue( { fieldId : 'custitem_categoria_articulo' } ) ,
                                                                  txt: currentRecord.getText( { fieldId : 'custitem_categoria_articulo' } ) },
                             clavefabricante                   : currentRecord.getValue( { fieldId : 'mpn' } ),
                             competitividad                      : currentRecord.getValue({fieldId:'custitem_indicador_competitividad'}),
                             fechaALta                         : currentRecord.getValue({fieldId:'createddate'}),
                             moneda                            : currentRecord.getValue({fieldId:'custitem2'}),
                             fechaAltaIndar                     : currentRecord.getValue({fieldId:'custitem_zindar_fecha_alta'}),
                             balas                               : currentRecord.getValue({fieldId:'custitem_zindar_balas'}),
                           precioControlado                   :currentRecord.getValue({fieldId: 'custitem_nso_indr_controlled_price'}),
                             margenControlado                   :currentRecord.getValue({fieldId: 'custitemcustitem_zindar_plazo_control' }),
                             margenBajo                         : currentRecord.getValue({ fieldId: 'custitemcustitem_zindar_margen_bajo' }),
                            iskit:          true
 
                           
 
 
                         };
                       
             valoresArticulos.lineInfo = {  price: price1Lineas ,member:memberLineas };
             valoresArticulos          = JSON.stringify( valoresArticulos );
           generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
  
            
 
         }  catch ( ex ){
             var archivo               = generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
             log.error( 'Error en la creación y guardado del JSON en netsuite', ex );
         }
             ///--------------------------- consumir servicio FTP --------------------------//
 
         try {
                log.error('json',valoresArticulos);
             //var fileObj = file.load( { id: archivo } );
           //  indr_sftp.upLoad( fileObj, currentRecord.getValue( { fieldId : 'itemid' } ) +'.json', 'ITEM' );
         log.error('EnviaIWS','inicia');
         //  httpService.post('api/Item/Insert', valoresArticulos ); 
             currentRecord.setValue( { fieldId : 'custitem_nso_intgrcn_sncrnzd', value : true } );
 
 
         } catch ( ex ) {
             var archivo               = generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
             currentRecord.setValue( { fieldId : 'custitem_nso_intgrcn_sncrnzd', value : false } );
             log.error( 'Error al subir el archivo en el servidor FTP',ex );
 
         }
 
         currentRecord.save();
 
     }
 
     function obtieneNombre( num ){
 
        var nombre = '';
         switch( num ){
             case 0:  nombre = 'Precio lista (base)'; break;
             case 1:  nombre = 'Precio10'; break;
             case 2:  nombre = 'Precio2'; break;
             case 3:  nombre = 'Precio3'; break;
             case 4:  nombre = 'Precio7'; break;
             case 5:  nombre = 'Precio8'; break;
             case 6:  nombre = 'descuento'; break;
         }
 
         return  nombre;
     }
 
      function generaArchivo( contenido, nombreArchivo) {
 
         var fileObjPDF = null,
             fileObj = file.create( {
                 name:        nombreArchivo + '.json',
                 fileType:    file.Type.PLAINTEXT,
                 contents:    contenido,
                 description: 'Archivo .json pra la inegración Artículos de inventario',
                 encoding:     file.Encoding.UTF8,
                 folder:       57,
                 isOnline:     true
             });
         return fileObj.save();
     }
 
     return {
         afterSubmit: getJsonPoAfterSubmit
     };
 });