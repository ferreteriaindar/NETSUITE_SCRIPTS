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
                        ["type","anyof","InvTrnfr"], 
                        "AND", 
                        ["systemnotes.name","anyof","34"], 
                        "AND", 
                        ["trandate","within","26/4/2021","26/4/2021"], 
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
                        })
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
                        "tranid": r.getValue({name:'tranid'}),
                        "from_location": r.getValue({name:'formulatext'}),
                        "to_location": r.getValue({name:'formulatext_1'}),
                        "item": r.getValue({name:'item'}),
                        "quantity": r.getValue({name: 'formulanumeric_2'}),
                        "memo": r.getValue({name:'memomain'}),
                        "trandate": r.getValue({name:'trandate'})

                        

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