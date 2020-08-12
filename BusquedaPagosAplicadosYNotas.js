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


   handler.get = function( context )
 {
   try
   {
       var transfers = busqueda(context.zonaid);

       return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': transfers }};
    // return {'Documentos':arqueo};

   }   catch ( e ) {
       log.debug( 'GET', JSON.stringify( e ) );
       var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
       return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};

     }
   };
return handler;
} );