/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener inventario del almacen
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
                  ["location","anyof",["25"]]

              ],
              columns:
              [
                 // search.createColumn({name: "Item", label: "ITEM"}),
                  search.createColumn({name: "Available", label: "disponible"}),
                  search.createColumn({
                      name: "name",
                      join: "item",
                      label: "nombre"
                  }),
                  search.createColumn({
                    name: "purchasedescription",
                    join: "item",
                    label: "descripcion"
                }),
                search.createColumn({
                  name: "internalid",
                  join: "item",
                  label: "internalid"
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
                      "disponible": r.getValue({name:"Available"}),
                      "nombre": r.getValue({name:"name",join:"item"}),
                      "almacen": r.getValue({name:"Location"}),
                      "descripcion": r.getValue({name:"purchasedescription",join:"item"}),
                      "internalid": r.getValue({name:"internalid",join:"item"})



              });
          });
      });
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