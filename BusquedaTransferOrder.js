/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener las transfers order para surtirlas en  WMS
 */

define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

    var handler = {};
  
    function busqueda()
    {
                var json=[];
                var transactionSearchObj = search.create({
                    type: "transferorder",
                    filters:
                    [
                       ["type","anyof","TrnfrOrd"], 
                       "AND", 
                       ["status","anyof","TrnfrOrd:B"], 
                       "AND", 
                       ["mainline","is","F"], 
                       "AND", 
                       ["location","anyof","1"], 
                       "AND", 
                       ["quantitycommitted","isnotempty",""]
                    ],
                    columns:
                    [
                       search.createColumn({name: "trandate", label: "Date"}),
                       search.createColumn({name: "tranid", label: "Document Number"}),
                       search.createColumn({name: "item", label: "Item"}),
                       search.createColumn({name: "quantitycommitted", label: "Quantity Committed"}),
                       search.createColumn({name: "createdby", label: "Creado"}),
                       search.createColumn({name: "memomain", label: "Memo (Main)"}),
                       search.createColumn({name: "internalid", label: "Internal ID"})
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
                        "fecha": r.getValue({name:'trandate'}),
                        "tranid": r.getValue({name:'tranid'}),
                        "articulo": r.getText({name:'item'}),
                        "cantidad": r.getValue({name:'quantitycommitted'}),
                        "creadopor": r.getText({name: 'createdby'}),
                        "memo": r.getValue({name:'memomain'}),
                        "internalid": r.getValue({name:'internalid'})

                        

                });
            });
        });
        return  json;
    }


    handler.get = function( context )
  {
    try
    {
        var transfers = busqueda();

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