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
  
    function busqueda(id)
    {
                var json=[];
                var transactionSearchObj = search.create({
                type: search.Type.INVENTORY_BALANCE,
                filters:
                [
                    ["location","anyof",["1","30"]]
                    
                ],
                columns:
                [
                   // search.createColumn({name: "Item", label: "ITEM"}),
                    search.createColumn({name: "Available", label: "disponble"}),
                    search.createColumn({
                        name: "name",
                        join: "item",
                        label: "nombre"
                    }),
                    search.createColumn({
                      name: "quantitycommitted",
                      join: "item",
                      label: "committed"
                  }),
                    search.createColumn({name: "Location", label: "almacen"})
                   
                   
                    
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
                        "disponible": (r.getValue({name:"Available"})-r.getValue({name:"quantitycommitted",join:"item"})),
                        "nombre": r.getValue({name:"name",join:"item"}),
                        "almacen": r.getValue({name:"Location"})

                        

                });
            });
        });


        //SE AGREGA LA  PARTE DEL INVENTARIO DE LOS KIT
        var kititemSearchObj = search.create({
          type: "kititem",
          filters:
          [
             ["type","anyof","Kit"], 
             "AND", 
             ["isinactive","is","F"]
          ],
          columns:
          [
             search.createColumn({
                name: "itemid",
                summary: "GROUP",
                sort: search.Sort.ASC,
                label: "Name"
             }),
             search.createColumn({
                name: "location",
                summary: "GROUP",
                label: "Location"
             }),
             search.createColumn({
                name: "formulanumeric",
                summary: "MIN",
                formula: "nvl(({memberitem.quantityavailable}/{memberquantity}),0)",
                label: "Formula (Numeric)"
             })
          ]
       });

       var contarKit = kititemSearchObj.runPaged().count;
       //   log.debug("transactionSearchObj result count",searchResultCount);
        var resultadoskit=  kititemSearchObj.runPaged({
          pageSize: 1000
        });


        var z = 0;
        resultadoskit.pageRanges.forEach(function(pageRange) {
          var paginakit = resultadoskit.fetch({ index: pageRange.index });
          paginakit.data.forEach(function(r) {
              z++
          json.push({
                //  "articulo": r.getValue({name:"Item"}),
                  "disponible":r.getValue({name:"formulanumeric",group:"MIN",}),
                  "nombre": r.getValue({name:"itemid",group:"GROUP"}),
                  "almacen": "1"

                  

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
        var arqueo = busqueda(context.id);
       
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