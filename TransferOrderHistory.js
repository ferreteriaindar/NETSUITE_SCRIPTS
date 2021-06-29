/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor L&L
 *@Company Indar
 *@NModuleScope Public
  *@Description Script encargado de obtener las historia de inventory transfer para compararlar con el WMS
 */

  define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

   var handler = {};
 
   function busqueda(FechaIni)
   {
                  var FECHA =  format.parse({
                     value: FechaIni,
                     type: format.Type.DATE
                  });
                  

                  log.error({
                     title: 'FECHA',
                     details: FECHA
                  });
                  FECHA.setDate(FECHA.getDate()-10);
               var fechaInicio=format.format({ value: FECHA,type: format.Type.DATE });
               log.error({
                  title: 'FechaInicio',
                  details: fechaInicio
               });
               FECHA.setDate(FECHA.getDate()+20);
               var fechaFinal=format.format({ value: FECHA,type: format.Type.DATE });
               log.error({
                  title: 'FechaFinal',
                  details: fechaFinal
               });
               var json=[];
               var transactionSearchObj = search.create({
                   type: "inventorytransfer",
                   filters:
                   [
                       ["type","anyof","InvTrnfr"], 
                       "AND", 
                       ["systemnotes.name","anyof","34"], 
                       "AND", 
                       ["trandate","within",fechaInicio,fechaFinal], 
                       "AND", 
                       ["item","noneof","@NONE@"]
                      
                    ],
                   columns:
                   [
                       search.createColumn({
                          name: "tranid",
                          summary: "GROUP",
                          label: "Document Number"
                       }),
                       search.createColumn({
                          name: "formulatext",
                          summary: "MAX",
                          formula: "CASE WHEN {quantity} < -0.1 THEN {location} WHEN {quantity} IS NULL THEN NULL ELSE NULL END",
                          label: "FROM_LOCATION"
                       }),
                       search.createColumn({
                          name: "formulatext_1",
                          summary: "MAX",
                          formula: "CASE WHEN {quantity} > 0.01 THEN {location} WHEN {quantity} IS NULL THEN NULL ELSE NULL END",
                          label: "TO_LOCATION"
                       }),
                       search.createColumn({
                          name: "item",
                          summary: "GROUP",
                          label: "Item"
                       }),
                       search.createColumn({
                          name: "formulanumeric_2",
                          summary: "GROUP",
                          formula: "ABS({quantity})",
                          label: "Formula (Numeric)"
                       }),
                       search.createColumn({
                          name: "trandate",
                          summary: "GROUP",
                          label: "Date"
                       }),
                       search.createColumn({
                          name: "custbody_zindar_id_wms",
                          summary: "GROUP",
                          label: "IDWMS"
                         
                       })
                    ]
                 });
               
               var contar = transactionSearchObj.runPaged().count;
               log.error(" count",contar);
             var resultados=  transactionSearchObj.runPaged({
               pageSize: 1000
             });
            
             var k = 0;
             resultados.pageRanges.forEach(function(pageRange) {
               var pagina = resultados.fetch({ index: pageRange.index });
               pagina.data.forEach(function(r) {
                   k++
               json.push({
                     //  "articulo": r.getValue({name:"Item"}),
                       "tranid": r.getValue({name:'tranid',summary:'GROUP'}),
                       "from_location": r.getValue({name:'formulatext',summary:'MAX'}),
                       "to_location": r.getValue({name:'formulatext_1',summary:'MAX'}),
                       "item": r.getText({name:'item',summary:'GROUP'}),
                       "quantity": r.getValue({name: 'formulanumeric_2',summary:'GROUP'})==''?0:r.getValue({name: 'formulanumeric_2',summary:'GROUP'}),                   
                       "trandate": r.getValue({name:'trandate',summary:'GROUP'}),
                       "idwms": r.getValue({name:'custbody_zindar_id_wms',summary:'GROUP'})==''?0:r.getValue({name:'custbody_zindar_id_wms',summary:'GROUP'})

                       

               });
           });
       });
       return  json;
   }


   handler.post = function( context )
 {
   try
   {
       
     
   var transfers = busqueda(context.FechaIni);

       return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': transfers }};
    // return {'Documentos':arqueo};

   }   catch ( e ) {
       log.error( 'CATCH', JSON.stringify( e ) );
       var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
       return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};

     }
   };
return handler;
} );