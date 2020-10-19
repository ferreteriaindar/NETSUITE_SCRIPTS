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

define( ['SuiteScripts/INDAR SCRIPTS/httpService','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

function( httpService, error, log, runtime, file, record ) {

    function getJsonPoAfterSubmit( context ) {

        log.debug( 'context.type: ' + context.type );

       

        try {
            var currentRecordAux = context.newRecord;
            var currentRecord    = record.load( { type:currentRecordAux.type,id:currentRecordAux.id } );
            var valoresArticulos = {};
           // var tamañoItemVendor = currentRecord.getLineCount( { sublistId: 'itemvendor' } );
           // var lineasItemVendor = [];
          
            var price1Tamaño     = currentRecord.getLineCount( { sublistId: 'price1' } );
            var price1Lineas     = [];

          
            for ( var i = 0 ; i < price1Tamaño ; i++) {

                price1Lineas.push( {

                  // currency       : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'currency' } ),
                   price_1        : currentRecord.getMatrixSublistValue( { sublistId: 'price1',  fieldId: 'price', column: 0, line: i } ),
                   price_2        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 1, line: i } ),
                   price_3        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 2, line: i } ),
                   price_4        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 3, line: i } ),
                   price_5        : currentRecord.getMatrixSublistValue( { sublistId: 'price1', line: i, fieldId: 'price', column: 4, line: i } ),
                   pricelevel     : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'pricelevel' } ),
                   pricelevelname : obtieneNombre(i),
                   //discount       : currentRecord.getSublistValue( { sublistId: 'price1', line: i, fieldId: 'discount' } ),

                } );
            } 
            /*
            for ( var i = 0 ; i < tamañoItemVendor ; i++) {

                lineasItemVendor.push( {

                   itemvendorprice      : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'itemvendorprice' } ),
                   preferredvendor      : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'preferredvendor' } ),
                   purchaseprice        : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'purchaseprice' } ),
                   subsidiary           : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'subsidiary' } ),
                   subsidiary_display   : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'subsidiary_display' } ),
                   sys_id               : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'sys_id' } ),
                   vendor               : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'vendor' } ),
                   vendorcurrencyid     : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'vendorcurrencyid' } ),
                   vendorcurrencyname   : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'vendorcurrencyname' } ),
                   vendorprices         : currentRecord.getSublistValue( { sublistId: 'itemvendor', line: i, fieldId: 'vendorprices' } ),
                });
            }*/

          

            valoresArticulos = {

                          
                            isinactive                        : currentRecord.getValue( { fieldId : 'isinactive' } ),
                            custitem_nso_indr_sales_min_price : currentRecord.getValue( { fieldId : 'custitem_nso_indr_sales_min_price' } ),
                            minimumquantity                   : currentRecord.getValue( { fieldId : 'minimumquantity' } ),
                            maximumquantity                   : currentRecord.getValue( { fieldId : 'maximumquantity' } ),
                            custitem_clave_prod_serv          : currentRecord.getValue( { fieldId : 'custitem_prod_serv_fe_33' } ),
                            custitem_presentacion_individual  : currentRecord.getValue( { fieldId : 'custitem_presentacion_individual' } ),
                            custitem_presentacion_inner       : currentRecord.getValue( { fieldId : 'custitem_presentacion_inner' } ),
                            custitem_presentacion_semimaster  : currentRecord.getValue( { fieldId : 'custitem_presentacion_semimaster' } ),
                            custitem_presentacion_master      : currentRecord.getValue( { fieldId : 'custitem_presentacion_master' } ),
                          //  custitem_presentacion_pallet      : currentRecord.getValue( { fieldId : 'custitem_presentacion_pallet' } ),

                            cogsaccount                       :  currentRecord.getValue( { fieldId : 'cogsaccount' } ) ,
                                                                
                            assetaccount                      :  currentRecord.getValue( { fieldId : 'assetaccount' } ) ,
                                                                 
                            incomeaccount                     : currentRecord.getValue( { fieldId : 'incomeaccount' } ) ,
                                                                 
                            custitem_tipo_clasif_art          :  currentRecord.getValue( { fieldId : 'custitem_tipo_clasif_art' } ) ,                                                               
                                                                                            
                            custitem_rama_articulo           :  currentRecord.getValue( { fieldId : 'custitem_rama_articulo' } ) ,
                                                                 

                            custitem_grupo_articulo           :  currentRecord.getValue( { fieldId : 'custitem_grupo_articulo' } ) ,
                                                                
                            custitem_familia_articulo           : currentRecord.getValue( { fieldId : 'custitem_familia_articulo' } ) ,                                                                

                            custitem_nivel_indar           :  currentRecord.getValue( { fieldId : 'custitem_nivel_indar' } ) ,
                                                                
                            custitem_temporada_articulo           :  currentRecord.getValue( { fieldId : 'custitem_temporada_articulo' } ) ,                                                                 

                            custitem_ranking_pza              : currentRecord.getValue( { fieldId : 'custitem_ranking_pza' } ),
                            custitem_ranking_imp              : currentRecord.getValue( { fieldId : 'custitem_ranking_imp' } ),
                            custitem_indar_excepcion          : currentRecord.getValue( { fieldId : 'custitem_indar_excepcion' } ),
                            custitem_indar_explicacion        : currentRecord.getValue( { fieldId : 'custitem_indar_explicacion' } ),
                            custitem_costo_estandar           : currentRecord.getValue( { fieldId : 'custitem_costo_estandar' } ),
                            custitem_sustitutos               : currentRecord.getValue( { fieldId : 'custitem_sustitutos' } ),
                            custitem_codigo_sustituto         : currentRecord.getValue( { fieldId : 'custitem_codigo_sustituto' } ),
                            custitem_multiplos_ordenar        : currentRecord.getValue( { fieldId : 'custitem_multiplos_ordenar' } ),
                            custitem_mensaje_emergente        : currentRecord.getValue( { fieldId : 'custitem_mensaje_emergente' } ),
                            id                                : currentRecord.getValue( { fieldId : 'id' } ),
                            type                              : currentRecord.getValue( { fieldId : 'type' } ),
                            itemid                            : currentRecord.getValue( { fieldId : 'itemid' } ),
                            
                            unitstype                         : { id: currentRecord.getValue( { fieldId : 'unitstype' } ) ,
                                                                 txt: currentRecord.getText( { fieldId : 'unitstype' } ) },

                            stockunit                         : currentRecord.getValue( { fieldId : 'stockunit' } ) ,
                                                               
                            purchaseunit                      :  currentRecord.getValue( { fieldId : 'purchaseunit' } ) ,
                                                               
                            saleunit                          :  currentRecord.getValue( { fieldId : 'saleunit' } ) ,
                                                               
                            baseunit                          :  currentRecord.getValue( { fieldId : 'baseunit' } ) ,
                                                              
                           
                          //  vendorname                        : currentRecord.getValue( { fieldId : 'vendorname' } ),
                            upccode                           : currentRecord.getValue( { fieldId : 'upccode' } ),                       
                           
                            department                        :  currentRecord.getValue( { fieldId : 'department' } ) ,
                                                               
                             class                            : currentRecord.getValue( { fieldId : 'class' } ) ,                                                               

                             location                         :  currentRecord.getValue( { fieldId : 'location' } ) ,
                                                                                                                                 
                            averagecost                       : currentRecord.getValue( { fieldId : 'averagecost' } ),
                            cost                              : currentRecord.getValue( { fieldId : 'cost' } ),
                           // lastpurchaseprice                 : currentRecord.getValue( { fieldId : 'lastpurchaseprice' } ),
                            purchasedescription               : currentRecord.getValue( { fieldId : 'salesdescription' } ),
                           
                            taxschedule                        :  currentRecord.getValue( { fieldId : 'taxschedule' } ) ,                                                              
                            custitem_tipo_articulo            : currentRecord.getValue( { fieldId : 'custitem_tipo_articulo' } ) ,                                                               

                            custitem_fabricante_articulo      : currentRecord.getValue( { fieldId : 'custitem_fabricante_articulo' } ),

                            custitem_linea_articulo           : currentRecord.getValue( { fieldId : 'custitem_linea_articulo' } ) ,                                                                

                            custitem_categoria_articulo       :  currentRecord.getValue( { fieldId : 'custitem_categoria_articulo' } ) ,
                            clavefabricante                   : currentRecord.getValue( { fieldId : 'mpn' } ),
                            competitividad                      : currentRecord.getValue({fieldId:'custitem_indicador_competitividad'}),
                            fechaALta                         : currentRecord.getValue({fieldId:'createddate'}),
                            moneda                            : currentRecord.getValue({fieldId:'custitem2'}),
                            fechaAltaIndar                     : currentRecord.getValue({fieldId:'custitem_zindar_fecha_alta'}),
                            balas                               : currentRecord.getValue({fieldId:'custitem_zindar_balas'})

                          


                        };
                      
            valoresArticulos.lineInfo = {  price: price1Lineas };
            valoresArticulos          = JSON.stringify( valoresArticulos );
         // generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
           generaArchivo(valoresArticulos,'LWS');
 
           

        }  catch ( ex ){
           // var archivo               = generaArchivo( valoresArticulos, currentRecord.getValue( { fieldId : 'itemid' } ) );
            log.error( 'Error en la creación y guardado del JSON en netsuite', ex );
        }
            ///--------------------------- consumir servicio FTP --------------------------//

        try {

            //var fileObj = file.load( { id: archivo } );
          //  indr_sftp.upLoad( fileObj, currentRecord.getValue( { fieldId : 'itemid' } ) +'.json', 'ITEM' );
		log.error('EnviaIWS','inicia');
         // httpService.post('api/Item/Insert', valoresArticulos ); 
           


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
                folder:       57,
                isOnline:     true
            });
        return fileObj.save();
    }

    return {
        afterSubmit: getJsonPoAfterSubmit
    };
});
