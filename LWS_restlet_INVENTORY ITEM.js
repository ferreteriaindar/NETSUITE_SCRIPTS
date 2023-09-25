/**
- NombreArchivo: LWS INVENTORY ITEM.JS
- NombreScript: ZINDAR INVENTORY ITEM.JS
- IdScript: customscript_zindar_inventory_item
- Descripción: Genera un Json con los valores del articulo de inventario
- Autor: ROBERTO VELASCO LARIOS
- FechaCreación: 2020/10/12
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

 define( ['SuiteScripts/INDAR SCRIPTS/LWS_HTTP_CONNECTION','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

 function( httpService, error, log, runtime, file, record ) {
 
     function getJsonPoAfterSubmit( context ) {
 
         log.debug( 'context.type: ' + context.type );
 
        
 
         try {

            var start = new Date();
             var currentRecordAux = context.newRecord;
             var currentRecord    = record.load( { type:currentRecordAux.type,id:currentRecordAux.id } );
             var valoresArticulos = {};
            // var tamañoItemVendor = currentRecord.getLineCount( { sublistId: 'itemvendor' } );
            // var lineasItemVendor = [];
           
             var price1Tamaño     = currentRecord.getLineCount( { sublistId: 'price1' } );
             var price1Lineas     = [];
                 var PrecioLista=0;
                   var Precio2=0;
                   var Precio3=0;
                   var Precio4=0;
                   var Precio7=0;
                   var Precio8=0;
                   var Precio10=0;
                   var pricelevel;
 
           
             for ( var i = 0 ; i < price1Tamaño ; i++) {
 
               /*  price1Lineas.push( {
 
                   // currency       : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'currency' } ),
                    Price1        : currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ),
                    Price2        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 1, line: i } ),
                    Price3        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 2, line: i } ),
                    Price4        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 3, line: i } ),
                    Price5        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 4, line: i } ),
                    pricelevel     : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'pricelevel' } ),
                    pricelevelname : obtieneNombre(i),
                    //discount       : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'discount' } ),
 
                 } );*/
                 pricelevel     = currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'pricelevel' } )
              // log.error('pricelevel_',pricelevel);
                 switch( pricelevel){
             case '1':  PrecioLista =currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ); break;
             case '7':   Precio10 = currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ); break;
             case '2':  Precio2 = currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ); break;
             case '3':  Precio3 = currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ); break;
             case '9':  Precio4 = currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ); break;
             case '4':  Precio7 = currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ); break;
             case '6':  Precio8 = currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ); break;
         }
 
             } 
       
 
           
 
             valoresArticulos = {
 
                           
                             Isinactive                        : currentRecord.getValue( { fieldId : 'isinactive' } ),
                             NsoIndrSalesMinPrice : currentRecord.getValue( { fieldId : 'custitem_nso_indr_sales_min_price' } ),
                             Minimumquantity                   : currentRecord.getValue( { fieldId : 'minimumquantity' } ),
                             Maximumquantity                   : currentRecord.getValue( { fieldId : 'maximumquantity' } ),
                             Claveprodserv          : currentRecord.getValue( { fieldId : 'custitem_prod_serv_fe_33' } ),
                             PresentacionIndividual  : currentRecord.getValue( { fieldId : 'custitem_presentacion_individual' } ),
                             PresentacionInner       : currentRecord.getValue( { fieldId : 'custitem_presentacion_inner' } ),
                             PresentacionSemimaster  : currentRecord.getValue( { fieldId : 'custitem_presentacion_semimaster' } ),
                             PresentacionMaster      : currentRecord.getValue( { fieldId : 'custitem_presentacion_master' } ),
                           //  custitem_presentacion_pallet      : currentRecord.getValue( { fieldId : 'custitem_presentacion_pallet' } ),
 
                             cogsaccount                       :  currentRecord.getValue( { fieldId : 'cogsaccount' } ) ,
                                                                 
                             Assetaccount                      :  currentRecord.getValue( { fieldId : 'assetaccount' } ) ,
                                                                  
                             incomeaccount                     : currentRecord.getValue( { fieldId : 'incomeaccount' } ) ,
                                                                  
                             TipoClasifArt         :  currentRecord.getValue( { fieldId : 'custitem_tipo_clasif_art' } ) ,                                                               
                                                                                             
                             RamaArticulo           :  currentRecord.getValue( { fieldId : 'custitem_rama_articulo' } ) ,
                                                                  
 
                             GrupoArticulo           :  currentRecord.getValue( { fieldId : 'custitem_grupo_articulo' } ) ,
                                                                 
                             FamiliaArticulo           : currentRecord.getValue( { fieldId : 'custitem_familia_articulo' } ) ,                                                                
 
                             NivelEindar           :  currentRecord.getValue( { fieldId : 'custitem_nivel_indar' } ) ,
                                                                 
                             TemporadaArticulo           :  currentRecord.getValue( { fieldId : 'custitem_temporada_articulo' } ) ,                                                                 
 
                             RankingPza              : currentRecord.getValue( { fieldId : 'custitem_ranking_pza' } ),
                             RankingImp              : currentRecord.getValue( { fieldId : 'custitem_ranking_imp' } ),
                             IndarExcepcion          : '', //currentRecord.getValue( { fieldId : 'custitem_indar_excepcion' } ),
                             IndarExplicacion        : '', //currentRecord.getValue( { fieldId : 'custitem_indar_explicacion' } ),
                             CostoEstandar           : currentRecord.getValue( { fieldId : 'custitem_costo_estandar' } ),
                             Sustitutos               : currentRecord.getValue( { fieldId : 'custitem_sustitutos' } ),
                             CodigoSustituto         : currentRecord.getValue( { fieldId : 'custitem_codigo_sustituto' } ),
                             custitem_multiplos_ordenar        : currentRecord.getValue( { fieldId : 'custitem_multiplos_ordenar' } ),
                             MensajeEmergente        : '',// currentRecord.getValue( { fieldId : 'custitem_mensaje_emergente' } ),
                             Id                                : currentRecord.getValue( { fieldId : 'id' } ),
                             Type                              : currentRecord.getValue( { fieldId : 'type' } ),
                             Itemid                            : currentRecord.getValue( { fieldId : 'itemid' } ),
                             
                             Unitstypeid                         : currentRecord.getValue( { fieldId : 'unitstype' }) ,
 
                             Stockunit                         : currentRecord.getValue( { fieldId : 'stockunit' } ) ,
                                                                
                             Purchaseunit                      :  currentRecord.getValue( { fieldId : 'purchaseunit' } ) ,
                                                                
                             Saleunit                          :  currentRecord.getValue( { fieldId : 'saleunit' } ) ,
                                                                
                             Baseunit                          :  currentRecord.getValue( { fieldId : 'baseunit' } ) ,
                                                               
                            
                           //  vendorname                        : currentRecord.getValue( { fieldId : 'vendorname' } ),
                             Upccode                           : currentRecord.getValue( { fieldId : 'upccode' } ),                       
                            
                             Department                        :  currentRecord.getValue( { fieldId : 'department' } ) ,
                                                                
                              class                            : currentRecord.getValue( { fieldId : 'class' } ) ,                                                               
 
                              Location                         :  currentRecord.getValue( { fieldId : 'location' } ) ,
                                                                                                                                  
                             Averagecost                       : currentRecord.getValue( { fieldId : 'averagecost' } ),
                             Cost                              : currentRecord.getValue( { fieldId : 'cost' } ),
                            // lastpurchaseprice                 : currentRecord.getValue( { fieldId : 'lastpurchaseprice' } ),
                             Purchasedescription               : currentRecord.getValue( { fieldId : 'salesdescription' } ),
                            
                             Taxschedule                        :  currentRecord.getValue( { fieldId : 'taxschedule' } ) ,                                                              
                             TipoArticulo            : currentRecord.getValue( { fieldId : 'custitem_tipo_articulo' } ) ,                                                               
 
                             FabricanteArticulo      : currentRecord.getValue( { fieldId : 'custitem_fabricante_articulo' } ),
 
                             LineaArticulo           : currentRecord.getValue( { fieldId : 'custitem_linea_articulo' } ) ,                                                                
 
                             CategoriaArticulo       :  currentRecord.getValue( { fieldId : 'custitem_categoria_articulo' } ) ,
                             Clavefabricante                   : currentRecord.getValue( { fieldId : 'mpn' } ),
                             Competitividad                      : currentRecord.getValue({fieldId:'custitem_indicador_competitividad'}),
                             FechaAlta                         : currentRecord.getValue({fieldId:'createddate'}),
                             moneda                            : currentRecord.getValue({fieldId:'custitem2'}),
                             FechaAltaIndar                     : currentRecord.getValue({fieldId:'custitem_zindar_fecha_alta'}),
                             Balas                               : currentRecord.getValue({fieldId:'custitem_zindar_balas'}),
                               PriceList:PrecioLista,
                               Price2:Precio2,
                               Price3:Precio3,
                               Price4:Precio4,
                              Price7:Precio7,
                               Price8:Precio8,
                               PrecioControlado                   :currentRecord.getValue({fieldId: 'custitem_nso_indr_controlled_price'}),
                               MargenControlado                   :currentRecord.getValue({fieldId: 'custitemcustitem_zindar_plazo_control' }),
                               MargenBajo                         : currentRecord.getValue({ fieldId: 'custitemcustitem_zindar_margen_bajo' }),
                               CP_MaterialPeligroso               : currentRecord.getValue({ fieldId: 'custitem_imr_cmcp_es_material_peligros' }),
                               CP_CodigoSTCC                      : currentRecord.getValue({ fieldId: 'custitem_imr_cmcp_codigo_stcc' }),
                               CP_ClaveMaterialPeligroso          : currentRecord.getValue({ fieldId: 'custitem_imr_cmcp_clave_material_pelig' }),
                               CP_PesoUnitario                    : currentRecord.getValue({ fieldId: 'custitem_imr_cmcp_peso_unitario' }),
                               CP_ClaveUnidadPeso                 : currentRecord.getValue({ fieldId: 'custitem_imr_cmcp_clave_unidad_peso' }),
                               CP_ClaveEmbalajePeligrosos         : currentRecord.getValue({ fieldId: 'custitem_imr_cmcp_clave_embalaje' }),
                               destacado                          : currentRecord.getValue({ fieldId: 'custitem_zindar_itemdestacado' }),
                               lanzamiento                          : currentRecord.getValue({ fieldId: 'custitem_zindar_lanzamiento' }),
                               Rama1                              : currentRecord.getValue({ fieldId: 'custitem_zindar_rama1' }), 
                               Rama2                              : currentRecord.getValue({ fieldId: 'custitem_zindar_rama2' }), 
                               Rama3                              : currentRecord.getValue({ fieldId: 'custitem_zindar_rama3' }), 
                               Rama1Descripcion                              : currentRecord.getValue({ fieldId: 'custitem_zindar_rama1_desc' }), 
                               Rama2Descripcion                              : currentRecord.getValue({ fieldId: 'custitem_zindar_rama2_desc' }), 
                               Rama2Descripcion                              : currentRecord.getValue({ fieldId: 'custitem_zindar_rama3_desc' }), 
                               
  
                           
                           
 
 
                         };
                       
             valoresArticulos.lineInfo = {  price: price1Lineas };
             valoresArticulos          = JSON.stringify( valoresArticulos );
          // generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
            generaArchivo(valoresArticulos,currentRecord.getValue( { fieldId : 'itemid' } ));
  
            
 
         }  catch ( ex ){
            // var archivo               = generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
             log.error( 'Error en la creación y guardado del JSON en netsuite', ex );
         }
             ///--------------------------- consumir servicio FTP --------------------------//
 
         try {
 
             //var fileObj = file.load( { id: archivo } );
           //  indr_sftp.upLoad( fileObj, currentRecord.getValue( { fieldId : 'itemid' } ) +'.json', 'ITEM' );
         log.error('EnviaIWS','inicia');
           httpService.post('Item/ItemInsertLWS', valoresArticulos ); 
            
           var time = new Date() - start;
           log.error({
               title: 'FIN',
               details: time
           });
 
 
         } catch ( ex ) {
             var archivo               = generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
             currentRecord.setValue( { fieldId : 'custitem_nso_intgrcn_sncrnzd', value : false } );
             log.error( 'Error al subir el archivo en el servidor FTP',ex );
 
         }
 
      
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
                 folder:       12115273,
                 isOnline:     true
             });
         return fileObj.save();
     }
 
     return {
         afterSubmit: getJsonPoAfterSubmit
     };
 });
 