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
  
    function busqueda(ids)
    {
                var json=[];
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters:
                    [
                       ["type","anyof","CustInvc","SalesOrd"], 
                       "AND", 
                       ["mainline","is","T"], 
                       "AND", 
                       [["createdfrom","anyof",ids],"OR",["internalid","anyof",ids]]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "ordertype",
                          sort: search.Sort.ASC,
                          label: "Order Type"
                       }),
                       search.createColumn({name: "datecreated", label: "Date"}),
                       search.createColumn({name: "tranid", label: "Document Number"}),
                       search.createColumn({name: "createdfrom", label: "Created From"}),
                       search.createColumn({name: "type", label: "Type"}),
                       search.createColumn({name: "statusref", label: "Status"}),
                       search.createColumn({name: "custbody_fe_uuid_cfdi_33", label: "UUID CFDI v3.3"}),
                       search.createColumn({name: "custbody_fe_sf_mensaje_respuesta", label: "Mensaje de Respuesta"}),
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
                      
                        "tranid": r.getValue({name:'tranid'}),
                        "trandate": r.getValue({name:'datecreated'}),
                        "createdfrom": r.getValue({name:'createdfrom'}),
                        "type": r.getValue({name:'type'}),
                        "statusref": r.getValue({name: 'statusref'}),
                        "custbody_fe_uuid_cfdi_33": r.getValue({name:'custbody_fe_uuid_cfdi_33'}),
                        "custbody_fe_sf_mensaje_respuesta": r.getValue({name:'custbody_fe_sf_mensaje_respuesta'}),
                        'internalid': r.getValue({name:'internalid'})

                        

                });
            });
        });
        return  json;
    }


    handler.post = function( context )
  {
    try
    {
        var transfers = busqueda(context.ids);

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