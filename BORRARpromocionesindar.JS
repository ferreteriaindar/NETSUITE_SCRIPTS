/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@Autor Marco Antonio Benitez
 *@Company Netsoft
 *@NModuleScope Public
 *@Name NSO | INDR | Promociones y descuentos
 *@Description: Script que calcula los descuentos en los articulos al crear una orden de venta (INDAR-PEDIDO MANUAL).
 * scriptName: nso_indr_promociones_descuentos.js
 * idScript: customscript_nso_promociones_descuentos
 * idDeploy: customdeploy_nso_promociones_descuentos
 */

 define([ 'N/error', 'N/record', 'N/search', 'N/format' ],
  function( error, record, search, format ) {

      var handler = {};

      //calculos
      function calculos(arrPorcDesc, precioUnitario, cantidad, tipoDesc, i, newRecord, original) {
         var valPorcDesc = arrPorcDesc[0];

         //si viene vacio el porcentaje de descuento le asigno cero
         if(valPorcDesc == '') {
             valPorcDesc = 0;
           log.debug('NO ENCONTRÓ PROMO','EMPIEZA');
           log.debug('arreglo descuento', JSON.stringify( arrPorcDesc));
           log.debug('JSON', JSON.stringify( newRecord));
           
         }

         //log.debug('antesFloat', 'aaaaa');

         
         var precioUnitConDesc = precioUnitario - (parseFloat(precioUnitario) * parseFloat(valPorcDesc) / 100);

         //se aplica a dos decimales
         precioUnitConDesc = parseFloat(precioUnitConDesc.toFixed(2));

         log.debug('precioUnitConDesc a 2 decimales', precioUnitConDesc);

         var importe = parseFloat(cantidad) * parseFloat(precioUnitario) * parseFloat(valPorcDesc) / 100;

         //llenamos porcentaje descuento, importe y descuento aplicado
         newRecord.setSublistValue({sublistId:'item', fieldId:'rate', line:i , value: precioUnitConDesc});
         newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_descuento', line:i , value: valPorcDesc});
         newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_descuento_aplicado', line:i , value: tipoDesc});
         newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_importe_descuento', line:i , value: importe});

         //log.debug('importe', importe);
         //log.debug('amount', newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'amount' }));

         var montoSinDesc = cantidad * original;

         //log.debug('montoSD', montoSinDesc);

         newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_indr_monto_sin_descuento', line:i , value: montoSinDesc});

      }

      //busqueda promociones
      function busqueda_promociones(articulos) {

          var resul = [];
           //log.debug('arregloparabusqueda', articulos);

          //Crea busqueda
          var promoSearch = search.create({

              type: 'customrecord_nso_promotions_indar',
              filters:
              [
                  ['isinactive', 'is', 'F'], 'and',
                  ['custrecord_nso_articulo_promocion', 'anyof', articulos], 'and',
                  [
                      [
                         ['custrecord_nso_valido_desde', 'onorbefore', 'today'], 'and',
                         ['custrecord_nso_valido_hasta', 'onorafter', 'today']
                      ], 'or',
                      [
                         ['custrecord_nso_valido_desde_p2', 'onorbefore', 'today'], 'and',
                         ['custrecord_nso_valido_hasta_p2', 'onorafter', 'today']
                      ]
                  ]
              ],
               columns:
              [
                  {name: 'id'},
                  {name: 'name'},
                  {name: 'custrecord_nso_articulo_promocion'},
                  {name: 'custrecord_nso_valido_desde'},
                  {name: 'custrecord_nso_valido_hasta'},
                  {name: 'custrecord_nso_cantidad_min'},
                  {name: 'custrecord_nso_cantidad_max'},
                  {name: 'custrecord_nso_porcentaje_desc'},
                  {name: 'custrecord_nso_cantidad_min_2'},
                  {name: 'custrecord_nso_cantidad_max_2'},
                  {name: 'custrecord_nso_porcentaje_desc_2'},
                  {name: 'custrecord_nso_cantidad_min_3'},
                  {name: 'custrecord_nso_cantidad_max_3'},
                  {name: 'custrecord_nso_porcentaje_desc_3'},
                  {name: 'custrecord_nso_valido_hasta_p2'},
                  {name: 'custrecord_nso_valido_desde_p2'},
                  {name: 'custrecord_nso_cantidad_min_p2'},
                  {name: 'custrecord_nso_cantidad_max_p2'},
                  {name: 'custrecord_nso_porcentaje_desc_p2'},
                  {name: 'custrecord_nso_cantidad_min2_p2'},
                  {name: 'custrecord_nso_cantidad_max2_p2'},
                  {name: 'custrecord_nso_porcentaje_desc2_p2'},
                  {name: 'custrecord_nso_cantidad_min3_p2'},
                  {name: 'custrecord_nso_cantidad_max3_p2'},
                  {name: 'custrecord_nso_porcentaje_desc3_p2'},

              ]
          });

          //log.debug({title:"busqueda",details:promoSearch});

          var singleresults = promoSearch.runPaged({
              pageSize: 1000
          });

          singleresults.pageRanges.forEach(function(pageRange) {
              var pagina = singleresults.fetch({ index: pageRange.index });
              pagina.data.forEach(function(r) {

                   //log.debug({title:"las rrr",details:r});

                  resul.push({

                      "idPromocion": r.getValue({name: 'id' }),
                      "name": r.getValue({name: 'name' }),
                      "articulo": r.getValue({name: 'custrecord_nso_articulo_promocion' }),
                      //fechas promocion 1
                      "val_desde": r.getValue({name: 'custrecord_nso_valido_desde' }),
                      "val_hasta": r.getValue({name: 'custrecord_nso_valido_hasta' }),
                      //cantidades promocion 1
                      "cant_min": r.getValue({name: 'custrecord_nso_cantidad_min' }),
                      "cant_max": r.getValue({name: 'custrecord_nso_cantidad_max' }),
                      "porc_desc": r.getValue({name: 'custrecord_nso_porcentaje_desc' }),
                      "cant_min2": r.getValue({name: 'custrecord_nso_cantidad_min_2' }),
                      "cant_max2": r.getValue({name: 'custrecord_nso_cantidad_max_2' }),
                      "porc_desc2": r.getValue({name: 'custrecord_nso_porcentaje_desc_2' }),
                      "cant_min3": r.getValue({name: 'custrecord_nso_cantidad_min_3' }),
                      "cant_max3": r.getValue({name: 'custrecord_nso_cantidad_max_3' }),
                      "porc_desc3": r.getValue({name: 'custrecord_nso_porcentaje_desc_3' }),
                      //fechas promocion 2
                      "val_hasta_P2": r.getValue({name: 'custrecord_nso_valido_hasta_p2' }),
                      "val_desde_P2": r.getValue({name: 'custrecord_nso_valido_desde_p2' }),
                      //cantidades promocion 2
                      "cant_min_P2": r.getValue({name: 'custrecord_nso_cantidad_min_p2' }),
                      "cant_max_P2": r.getValue({name: 'custrecord_nso_cantidad_max_p2' }),
                      "porc_desc_P2": r.getValue({name: 'custrecord_nso_porcentaje_desc_p2' }),
                      "cant_min2_P2": r.getValue({name: 'custrecord_nso_cantidad_min2_p2' }),
                      "cant_max2_P2": r.getValue({name: 'custrecord_nso_cantidad_max2_p2' }),
                      "porc_desc2_P2": r.getValue({name: 'custrecord_nso_porcentaje_desc2_p2' }),
                      "cant_min3_P2": r.getValue({name: 'custrecord_nso_cantidad_min3_p2' }),
                      "cant_max3_P2": r.getValue({name: 'custrecord_nso_cantidad_max3_p2' }),
                      "porc_desc3_P2": r.getValue({name: 'custrecord_nso_porcentaje_desc3_p2' })

                  });
              });
          });

          return resul;
      }

      handler.beforeSubmit = function beforeSubmitDescuentos(context) {

          try {

              var newRecord = context.newRecord;
              var campo = newRecord.getValue({fieldId: 'customform'});
           
              
         
              var entraDesarrollo = newRecord.getValue({fieldId: 'custbody_nso_no_promo'});

              log.debug('No promo', entraDesarrollo);
            if(newRecord.getValue({fieldId: 'billaddresslist'})=="344336")
            {
              log.error('ROBERTO','MI PEDIDO')
            }
             if(newRecord.getValue({fieldId: 'entity'})==41473)
            {
              log.error('ROBERTO','MI PEDIDO')
              log.debug('json',newRecord);
              const start = new Date();
              var hours = start.getHours();
              var minutes = start.getMinutes();
              var seconds = start.getSeconds();
              var miliseconds =start.getMilliseconds();
              log.debug('HORA EXACTA',hours + ":" + minutes + ":" + seconds + ":" +miliseconds);
            }

              if(entraDesarrollo)  {
                log.debug('Entra no promo', entraDesarrollo);
                return;
              }

              if(context.type != 'create' && context.type != 'edit') {
                return;
              }
      
              if(newRecord.getValue({fieldId: 'entity'})==41473)
              {
              log.debug('yaaplicopromos PRIMERA',newRecord.getValue('custbody_zindar_yaaplicopromos')+'**'+ newRecord.getValue('id'));
              }
              if(newRecord.getValue('entity')==518869)
              {
                log.debug('ORIGSTATUS',newRecord.getValue('origstatus'));
                log.debug('ORDERSTATUS',newRecord.getValue('orderstatus'));

              }
              if(newRecord.getValue('entity')==518869 && (newRecord.getValue('origstatus')=='D'|| newRecord.getValue('origstatus')=='E'))
              {
                log.debug('ME SALÍ','SI');
              return;
              }

                if(newRecord.getValue({fieldId: 'entity'})==41473)
                {
                    newRecord.setValue({fieldId:'custbody_zindar_yaaplicopromos',value:true});
                    log.debug('yaaplicopromos SEGUNDA',newRecord.getValue('custbody_zindar_yaaplicopromos')+'**'+ newRecord.getValue('id'));
                }
              //preguntamos si es form INDAR-PEDIDO MANUAL
              if(campo == 104)
              {
                 //log.debug({title:"entro al if", details:"if"});

                 lineas = newRecord.getLineCount({sublistId:'item'});

                 //log.debug({title:"num lineas", details:lineas});

                 var arrItems = [];

                 //obtengo todos los items que agregó en la orden de venta
                 for( var i = 0; i < lineas; i++ ) {

                     var articulo = newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' });
                     //log.debug({title:'articulo',details:articulo});

                     arrItems.push(articulo);
                 }

                 // log.debug({title:"arreglo a busqueda", details:arrItems});

                 //busco las promociones que contengan esos articulos
                 busquedaPromociones = busqueda_promociones(arrItems);

                 //log.debug({title:'paso busqueda',details:busquedaPromociones});

                 //recorro los articulos de la linea de SO para llenar los campos con la informacion de la busqueda
                 for( var i = 0; i < lineas; i++ ) {

                    //pregunto si es un descuento
                    var descuentoLinea = newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'itemtype'});

                    if(descuentoLinea == 'Discount') {
                      continue;
                    }

                     //datos de la orden de venta

                     //reinicio valores
                     newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_descuento', line:i , value: ""});
                     newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_descuento_aplicado', line:i , value: ""});
                     newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_importe_descuento', line:i , value: ""});
                     newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_indr_monto_sin_descuento', line:i , value: ""});
                     newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_indr_original_unitprice', line:i , value: ""});

                     //linea item
                     var articulo = newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'item' });
                     var cantidad = newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'quantity' });
                     var precioUnitario = newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'rate' });
                     var originalUnitPrice = newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'custcol_nso_indr_original_unitprice' });

                     //llenamos el OriginalUnitPrice si se encuentra vacio
                     if(originalUnitPrice == '') {
                         newRecord.setSublistValue({sublistId:'item', fieldId:'custcol_nso_indr_original_unitprice', line:i , value: parseFloat(precioUnitario)});
                     } else {
                         newRecord.setSublistValue({sublistId:'item', fieldId:'rate', line:i , value: originalUnitPrice});
                         precioUnitario = newRecord.getSublistValue({ sublistId: 'item', line: i, fieldId: 'rate' });
                     }

                     //fecha
                     var fechaOrdenCampo = newRecord.getValue({fieldId: 'trandate'});
                     var fechaOrdenDate = format.parse({ value:fechaOrdenCampo, type:format.Type.DATE });

                     //log.debug("fechaOrdenDate" + fechaOrdenDate);

                     //ciclamos la busqueda
                     for( var j = 0; j < busquedaPromociones.length; j++) {

                         //si encuentro el articulo
                         if( articulo == busquedaPromociones[j]['articulo']) {

                             //reviso que en promocion1 las fechas no vengan vacias, sino paso a promocion2
                             //if( parseInt(busquedaPromociones[j]['val_desde']) != '' && parseInt(busquedaPromociones[j]['val_hasta']) != '' ) {

                                 var valDesde = format.parse({ value:busquedaPromociones[j]['val_desde'], type:format.Type.DATE });
                                 var valHasta = format.parse({ value:busquedaPromociones[j]['val_hasta'], type:format.Type.DATE });

                                 log.debug("P1 fechas ",valDesde + "---" +  valHasta);

                                 //valida que la fecha de orden de venta entre en el rango de fechas de la promocion
                                 if(fechaOrdenDate >= valDesde && fechaOrdenDate <= valHasta) {
                                     log.debug("entro", "P1");
                                     if(busquedaPromociones[j]['cant_min'] != '') {
                                         if(busquedaPromociones[j]['cant_max'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_max'])) {
                                               log.error('PARTE1','SI');
                                                 calculos(busquedaPromociones[j]['porc_desc'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (busquedaPromociones[j]['cant_min2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_min2']) - 1) {
                                                log.error('PARTE1','SI');
                                                  calculos(busquedaPromociones[j]['porc_desc'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                  break;
                                             }
                                         } else if (busquedaPromociones[j]['cant_min3'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_min3']) - 1) {
                                                 calculos(busquedaPromociones[j]['porc_desc'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min'])) {
                                             calculos(busquedaPromociones[j]['porc_desc'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                             break;
                                         }
                                     }

                                     if(busquedaPromociones[j]['cant_min2'] != '') {
                                         if(busquedaPromociones[j]['cant_max2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_max2'])) {
                                                 calculos(busquedaPromociones[j]['porc_desc2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (busquedaPromociones[j]['cant_min3'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_min3']) - 1) {
                                                 calculos(busquedaPromociones[j]['porc_desc2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min2'])) {
                                             calculos(busquedaPromociones[j]['porc_desc2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                             break;
                                         }
                                     }

                                     if(busquedaPromociones[j]['cant_min3'] != '') {
                                         if(busquedaPromociones[j]['cant_max3'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min3']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_max3'])) {
                                                 calculos(busquedaPromociones[j]['porc_desc3'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min3'])) {
                                             calculos(busquedaPromociones[j]['porc_desc3'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                             break;
                                         }
                                     }
                                 }

                             //} else if (busquedaPromociones[j]['val_desde_P2'] != '' && busquedaPromociones[j]['val_hasta_P2'] != '') {

                                 //promocion 2
                                 var valDesdeP2 = format.parse({ value:busquedaPromociones[j]['val_desde_P2'], type:format.Type.DATE });
                                 var valHastaP2 = format.parse({ value:busquedaPromociones[j]['val_hasta_P2'], type:format.Type.DATE });

                                 //log.debug("P2 fechas ",valDesdeP2 + "---" +  valHastaP2);

                                 if(fechaOrdenDate >= valDesdeP2 && fechaOrdenDate <= valHastaP2) {
                                     //log.debug("entro", "P2");
                                     if(busquedaPromociones[j]['cant_min_P2'] != '') {
                                         if(busquedaPromociones[j]['cant_max_P2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min_P2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_max_P2'])) {
                                                 calculos(busquedaPromociones[j]['porc_desc_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (busquedaPromociones[j]['cant_min2_P2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min_P2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_min2_P2']) - 1) {
                                                  calculos(busquedaPromociones[j]['porc_desc_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                  break;
                                             }
                                         } else if (busquedaPromociones[j]['cant_min3_P2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min_P2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_min3_P2']) - 1) {
                                                 calculos(busquedaPromociones[j]['porc_desc_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min_P2'])) {
                                             calculos(busquedaPromociones[j]['porc_desc_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                             break;
                                         }
                                     }

                                     if(busquedaPromociones[j]['cant_min2_P2'] != '') {
                                         if(busquedaPromociones[j]['cant_max2_P2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min2_P2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_max2_P2'])) {
                                                 calculos(busquedaPromociones[j]['porc_desc2_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (busquedaPromociones[j]['cant_min3_P2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min2_P2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_min3_P2']) - 1) {
                                                 calculos(busquedaPromociones[j]['porc_desc2_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min2_P2'])) {
                                             calculos(busquedaPromociones[j]['porc_desc2_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                             break;
                                         }
                                     }

                                     if(busquedaPromociones[j]['cant_min3_P2'] != '') {
                                         if(busquedaPromociones[j]['cant_max3_P2'] != '') {
                                             if(parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min3_P2']) && parseInt(cantidad) <= parseInt(busquedaPromociones[j]['cant_max3_P2'])) {
                                                 calculos(busquedaPromociones[j]['porc_desc3_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                                 break;
                                             }
                                         } else if (parseInt(cantidad) >= parseInt(busquedaPromociones[j]['cant_min3_P2'])) {
                                             calculos(busquedaPromociones[j]['porc_desc3_P2'].split(/%/), precioUnitario, cantidad, busquedaPromociones[j]['idPromocion'], i, newRecord, originalUnitPrice);
                                             break;
                                         }
                                     }
                                 }


                            //} //fin del if fechas vacias

                         } //fin del if si encuentra articulo
                     } //fin de for busqueda
                 } //fin de for articulos

              }

          } catch (e) {
              log.debug({title:"error",details:e.name + e.message});
          }

      }

      return handler;

 });
