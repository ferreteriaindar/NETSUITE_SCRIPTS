/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener inventario
 */

  define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

    var handler = {};
  
    function busqueda(context)
    {
                var json=[];
                var transactionSearchObj = search.create({
                    type: "invoice",
                    filters:
                    [
                       ["type","anyof","CustInvc"], 
                       "AND", 
                       ["trandate","within",fechaIni,FechaFin], 
                       "AND", 
                       ["taxline","is","F"]
                    ],
                    columns:
                    [
                       search.createColumn({name: "trandate", label: "Date"}),
                       search.createColumn({name: "type", label: "Type"}),
                       search.createColumn({name: "tranid", label: "Document Number"}),
                       search.createColumn({name: "entity", label: "Name"}),
                       search.createColumn({name: "item", label: "Item"}),
                       search.createColumn({name: "quantity", label: "Quantity"}),
                       search.createColumn({name: "custbody_zindar_wmsclave", label: "wmsclave"}),
                       search.createColumn({name: "custbodycustbody_num_cotizacion", label: "NÚMERO DE COTIZACIÓN"}),
                       search.createColumn({name: "custbody_nso_id_web", label: "ID WEB"})
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
                      //  "articulo": r.getValue({name:"Item"}),
                        "trandate":r.getValue({name:"trandate"}),
                        "type": r.getValue({name:"type"}),
                        "tranid": r.getValue({name:"tranid"}),
                        "entity": r.getValue({name:"entity"}),
                        "item": r.getValue({name:"item"}),
                        "quantity": r.getValue({name:"quantity"}),
                        "wmsclave": r.getValue({name:"custbody_zindar_wmsclave"}),
                        "cotizacion": r.getValue({name:"custbodycustbody_num_cotizacion"}),
                        "idweb": r.getValue({name:"custbody_nso_id_web"})

                        

                });
            });
       


        
  });


        /// FIN DE LA PARTE DE INVENTARIO DE LOS KIT
        return  json;
    }


    handler.get = function( context )
  {
    try
    {
        var arqueo = busqueda(context);
       
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': arqueo }};
     // return {'Documentos':arqueo};

    }   catch ( e ) {
        log.debug( 'GET', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
  
      }
    };
return handler;
} );