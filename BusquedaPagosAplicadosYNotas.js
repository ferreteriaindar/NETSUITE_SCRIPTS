/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener los pagos sin timbrar
 */

  define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

   var handler = {};
 
   function busqueda(zonaid)
   {
               var json=[];
               var transactionSearchObj  /*search.load({
                  id:'customsearch_pagostimbradossai'
               });*/ = search.create({
                   type: "customerpayment",
                   filters:
                   [
                       ["type","anyof","CustPymt"], 
                       "AND", 
                       ["systemnotes.field","anyof","CUSTBODY_REFJOURNALENTRY_IVA"], 
                       "AND",
                       ["systemnotes.date","within","daysago2","minutesfromnow1"], 
                       "AND",
                       ["customer.custentity_zona_cliente","anyof",zonaid], 
                       "AND",
                       ['formulanumeric: CASE WHEN sum(nvl({appliedtolinkamount},0)) = max(nvl({amount},0)) THEN 1 ELSE 0 END','is','1']
                    ],
                    columns:
                    [
                       search.createColumn({name: "tranid", label: "Document Number"}),
                       search.createColumn({name: "custbody_fe_uuid_cfdi_33", label: "UUID CFDI v3.3"}),
                       search.createColumn({name: "internalid", label: "IdPago"}),
                       search.createColumn({
                          name: "tranid",
                          join: "appliedToTransaction",
                          label: "Document Number"
                       }),
                       search.createColumn({
                          name: "internalid",
                          join: "appliedToTransaction",
                          label: "Internal ID"
                       }),
                       search.createColumn({
                        name: "custrecord_zonas_clientes",
                        join: "CUSTBODYZONA",
                        label: "Zona de ventas"
                     }),
                     search.createColumn({name: "custbody_fe_sf_mensaje_respuesta", label: "Mensaje de Respuesta"}),
                     search.createColumn({name:"type",label:"type"}),
                     search.createColumn({name: "entity", label: "Name"})
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
                     
                       "tranid": r.getValue({name:'tranid'}),
                       "uuid": r.getValue({name:'custbody_fe_uuid_cfdi_33'}),
                       "respuesta": r.getText({name:'internalid'}),
                       "factura": r.getValue({name:'tranid',join:'appliedToTransaction'}),
                       "facturaId": r.getValue({name: 'internalid',join:'appliedToTransaction'}),
                       "zona": r.getText({name:'custrecord_zonas_clientes',join:'CUSTBODYZONA'}),
                       "mensaje":r.getValue({name:'custbody_fe_sf_mensaje_respuesta'}) ,
                       "type":r.getText({name:'type'}),
                       "customer":r.getText({name:'entity'})           

               });
           });
       });

         

           //BUSQUEDA   DE  NOTAS  DE CREDITO 

                        var creditmemoSearchObj = search.create({
                           type: "creditmemo",
                           filters:
                           [
                              ["type","anyof","CustCred"], 
                              "AND", 
                              ["datecreated","within","daysago2","minutesfromnow1"], 
                              "AND", 
                              ["customer.custentity_zona_cliente","anyof",zonaid], 
                              "AND", 
                              ["status","noneof","CustCred:V"]
                           ],
                           columns:
                           [
                              search.createColumn({name: "tranid", label: "Document Number"}),
                              search.createColumn({name: "custbody_fe_uuid_cfdi_33", label: "UUID CFDI v3.3"}),
                              search.createColumn({name: "internalid", label: "IdNota"}),
                              search.createColumn({
                                 name: "tranid",
                                 join: "appliedToTransaction",
                                 label: "Document Number"
                              }),
                              search.createColumn({
                                 name: "internalid",
                                 join: "appliedToTransaction",
                                 label: "Internal ID"
                              }),
                              search.createColumn({
                                 name: "custrecord_zonas_clientes",
                                 join: "CUSTBODYZONA",
                                 label: "Zona de ventas"
                              }),
                              search.createColumn({name: "custbody_fe_sf_mensaje_respuesta", label: "Mensaje de Respuesta"}),
                              search.createColumn({name:"type",label:"type"}),
                              search.createColumn({name: "entity", label: "Name"})
                           ]
                
               });

               var contar = creditmemoSearchObj.runPaged().count;
               //   log.debug("transactionSearchObj result count",searchResultCount);
                var resultadosCreditMemo=  creditmemoSearchObj.runPaged({
                  pageSize: 1000
                });
               var k = 0;
               resultadosCreditMemo.pageRanges.forEach(function(pageRange) {
                 var paginaCreditMemo = resultadosCreditMemo.fetch({ index: pageRange.index });
                 paginaCreditMemo.data.forEach(function(r) {
                     k++
                   
                 json.push({
                   "tranid": r.getValue({name:'tranid'}),
                   "uuid": r.getValue({name:'custbody_fe_uuid_cfdi_33'}),
                   "respuesta": r.getText({name:'internalid'}),
                   "factura": r.getValue({name:'tranid',join:'appliedToTransaction'}),
                   "facturaId": r.getValue({name: 'internalid',join:'appliedToTransaction'}),
                   "zona": r.getText({name:'custrecord_zonas_clientes',join:'CUSTBODYZONA'}),
                       "mensaje":r.getValue({name:'custbody_fe_sf_mensaje_respuesta'}) ,
                       "type":r.getText({name:'type'}),
                       "customer":r.getText({name:'entity'})      
 
 
                 });
             });
             
             
 
 
         });


       return  json;
   }



   function busquedaNotas(cliente)
   {
      var json=[];
      var transactionSearchObj=search.create({
         type: "creditmemo",
         filters:
         [
            ["type","anyof","CustCred"], 
            "AND", 
            ["mainline","is","T"], 
            "AND", 
            ["status","anyof","CustCred:A"], 
            "AND", 
            ["customer.entityid","haskeywords",cliente]
         ],
         columns:
         [
            search.createColumn({name: "internalid", label: "Internal ID"}),
            search.createColumn({name: "tranid", label: "Document Number"}),
            search.createColumn({name: "entity", label: "Name"}),
            search.createColumn({name: "amountremaining", label: "Amount Remaining"}),
            search.createColumn({name: "datecreated", label: "Date Created"}),
            search.createColumn({name: "memo", label: "Memo"}),
            search.createColumn({name:"type",label:"type"}),
            search.createColumn({name:"custbody_fe_metodo_de_pago",label:"custbody_fe_metodo_de_pago"}),
            search.createColumn({name:"custbody_cfdi_tipo_relacion_33",label:"custbody_cfdi_tipo_relacion_33"}),
            search.createColumn({name: "amount", label: "amount"}),
            search.createColumn({name: "custbody_regimen_fiscal_fe_33", label: "regimencontribuyente"}),
         ]
      });
      var contar = transactionSearchObj.runPaged().count;
      var resultados=  transactionSearchObj.runPaged({
         pageSize: 1000
       });
               
               var k = 0;
               resultados.pageRanges.forEach(function(pageRange) {
                  var pagina = resultados.fetch({ index: pageRange.index });
                  pagina.data.forEach(function(r) {
                     k++
                  json.push({
                     "type":r.getText({name:'type'}),
                        "internalid":Number( r.getValue({name:'internalid'})),
                        "tranid": r.getValue({name:'tranid'}),
                        "entity": r.getText({name:'entity'}),
                        "amountremaining":Number( r.getValue({name:'amountremaining'})),
                        "datecreated":r.getValue({name:'datecreated'}),
                        "memo":r.getValue({name:'memo'}),
                        "formaPago": r.getValue({name:'custbody_fe_metodo_de_pago'}),
                        "tipoRelacion":r.getValue({name:'custbody_cfdi_tipo_relacion_33'}),
                        "amount" :Number( r.getValue({name:'amount'})),    
                        "regimenContribuyente": r.getValue({name:'custbody_regimen_fiscal_fe_33'})
                  });
            });
         });

         var InvoicesSearchObj= search.create({
            type: "invoice",
            filters:
            [
               ["type","anyof","CustInvc"], 
               "AND", 
               ["mainline","is","T"], 
               "AND", 
               ["status","anyof","CustInvc:A"], 
               "AND", 
               ["customer.entityid","haskeywords",cliente]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn({name: "tranid", label: "Document Number"}),
               search.createColumn({name: "entity", label: "Name"}),
               search.createColumn({name: "amountremaining", label: "Amount Remaining"}),
               search.createColumn({name: "datecreated", label: "Date Created"}),
               search.createColumn({name: "memo", label: "Memo"}),
               search.createColumn({name:"type",label:"type"}),
               search.createColumn({name: "amount", label: "amount"}),
               search.createColumn({name: "custbody_nso_indr_client_discount", label: "discount"}),
               search.createColumn({name: "custbody_nso_indr_discount_date", label: "dueDate"}),
            ]
         });

         var contarInvoices = InvoicesSearchObj.runPaged().count;
         var resultadosInvoices=  InvoicesSearchObj.runPaged({
            pageSize: 1000
          });


          var k = 0;
          resultadosInvoices.pageRanges.forEach(function(pageRange) {
             var paginaInvoices = resultadosInvoices.fetch({ index: pageRange.index });
             paginaInvoices.data.forEach(function(r) {
                k++
             var disc = r.getValue({name: 'custbody_nso_indr_client_discount'});
               disc = disc.substring(0, disc.length - 1);
             json.push({
               "type":r.getText({name:'type'}),
                   "internalid":Number( r.getValue({name:'internalid'})),
                   "tranid": r.getValue({name:'tranid'}),
                   "entity": r.getText({name:'entity'}),
                   "amountremaining":Number( r.getValue({name:'amountremaining'})),
                   "datecreated":r.getValue({name:'datecreated'}),
                   "memo":r.getValue({name:'memo'}),
                   "amount" :Number( r.getValue({name:'amount'})),
				   "discount" : Number(disc),
               	   "duedate": r.getValue({name: 'custbody_nso_indr_discount_date'})
             });
       });
    });
    return json;

   }


   handler.get = function( context )
 {
   try
   {
      if(context.zonaid)
       {
          var transfers = busqueda(context.zonaid);
         return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': transfers }};
    // return {'Documentos':arqueo};
       }
       else  
        {
            var Notas= busquedaNotas(context.cliente)
            return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'NOTAS DE CREDITO' }, 'Resultados': { 'CustomerID': 22, 'Documentos': Notas }};
         }

   }   catch ( e ) {
       log.debug( 'GET', JSON.stringify( e ) );
       var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
       return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};

     }
   };
return handler;
} );