/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  aplicar  facturas a un pago
 */

define( ['N/log','N/error', 'N/record', 'N/format' , 'N/search', 'N/email'], function( log,error, record, format, search, email ) {

    var handler = {};
    handler.post = function( context )
    {
        /*var lines = context.lineItems;
        for ( var i = 0; i < lines.length; i ++ ) {
            cerrarSaleOrder(lines[i]);
        }*/
        editarFactura(context.tranid);
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK' }, 'internalId': 0};
    
    };

    function editarFactura(tranid)
    {
        var json=[];
        var transactionSearchObj =  search.create({
            type: "invoice",
            filters:
            [
               ["type","anyof","CustInvc"], 
               "AND", 
               ["numbertext","is","72986"], 
               "AND", 
               ["mainline","is","F"]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn({
                  name: "vatregnumber",
                  join: "customer",
                  label: "Tax Number"
               }),
               search.createColumn({
                  name: "custentity_metodo_pago",
                  join: "customer",
                  label: "Forma de Pago (2)"
               }),
               search.createColumn({
                  name: "custentity_uso_cfdi",
                  join: "customer",
                  label: "Uso del CFDi"
               }),
               search.createColumn({
                  name: "custentity_fe_metodo_pago_33",
                  join: "customer",
                  label: "Metodo de Pago"
               }),
               search.createColumn({
                  name: "custitem_prod_serv_fe_33",
                  join: "item",
                  label: "Producto o Servicio"
               }),
               search.createColumn({name: "item", label: "Item"})
            ]
         });

         var contar = transactionSearchObj.runPaged().count;
         //   log.debug("transactionSearchObj result count",searchResultCount);
          var resultados=  transactionSearchObj.runPaged({
            pageSize: 1000
          });
         
          var k = 0;
          resultados.pageRanges.forEach(function(pageRange) {
            var pagina = resultados.fetch({ index: pageRange.index });
            pagina.data.forEach(function(r) {
                k++
            json.push({
              
                'id': r.getValue({name:'internalid'})  ,
                'rfc': r.getValue({name:'vatregnumber',join:'customer'}),
                'FormaPago': r.getValue({name:'custentity_metodo_pago',join:'customer'}),
                'UsoCFDI' : r.getValue({name:'custentity_uso_cfdi',join:'customer'}),
                'MetodoPago': r.getValue({name:'custentity_fe_metodo_pago_33',join:'customer'}),
                'item':r.getValue({name:'item'}),
                'sat': r.getValue({name:'custitem_prod_serv_fe_33',join:'item'}) 
                     });
                });
            }); 

            var factura= record.load({
                type:record.Type.INVOICE,
                id: json[0].id,
                isDynamic: true,
                enableSourcing:false
            });

          /*  log.error('factura',factura);

            //Se   agregan los valores  a la factur cuando hacen falta

            var  rfc= factura.getValue('vatregnum');

            var MetodoPago= factura.getValue('custbody_forma_pago_fe_imr_33');
            var FormaPago=factura.getValue('custbody_uso_cfdi_fe_imr_33');
            var UsoCFDI= factura.getValue('custbody_uso_cfdi_fe_imr_33');
           // if(!rfc)
           log.error('rfc',json[0].rfc);
             factura.setValue({fieldId:'vatregnum',value:json[0].rfc});
            //if(!MetodoPago)
            factura.setValue({fieldId:'custbody_forma_pago_fe_imr_33',value:json[0].MetodoPago});
            //if(!FormaPago)
            factura.setValue({fieldId:'custbody_fe_metodo_de_pago',value:json[0].FormaPago});
            //if(!UsoCFDI)
            factura.setValue({fieldId:'custbody_uso_cfdi_fe_imr_33',value:json[0].UsoCFDI});

            for (var i = 0; i < factura.getLineCount({sublistId: 'item'}); i++) {
                if(factura.getSublistValue( { sublistId: 'item', line: i, fieldId: 'ClaveProdServText' } )=='')
                {
                    factura.setSublistValue({sublistId:'item',fieldId:'ClaveProdServText',line:i,value:regresaClaveProd(factura.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } ))});
                }
            }*/
            factura.save();

            


    }


    function regresaClaveProd(articulo)
    {
        var jsonResult=[];
        var transactionSearchObj = search.create({
            type: "item",
            filters:
            [
               ["name","haskeywords","U3 4052"]
            ],
            columns:
            [
               search.createColumn({
                  name: "itemid",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({name: "custitem_prod_serv_fe_33", label: "Producto o Servicio"})
            ]
         });


         var contar = transactionSearchObj.runPaged().count;
         //   log.debug("transactionSearchObj result count",searchResultCount);
          var resultados=  transactionSearchObj.runPaged({
            pageSize: 1000
          });
         
          var k = 0;
          resultados.pageRanges.forEach(function(pageRange) {
            var pagina = resultados.fetch({ index: pageRange.index });
            pagina.data.forEach(function(r) {
                k++
            json.push({
              
                'sat' :r.getValue({name:'custitem_prod_serv_fe_33'})
                     });
                });
            }); 

            return json[0].sat;
    }

  return handler;

  } );
