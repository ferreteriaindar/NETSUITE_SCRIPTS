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
  
    function busqueda()
    {
                var json=[];
                var transactionSearchObj = search.create({
                    type: "customerpayment",
                    filters:
                    [
                       ["type","anyof","CustPymt"], 
                       "AND", 
                       ["mainline","is","F"], 
                       "AND", 
                       ["amountremaining","lessthanorequalto","3.00"], 
                       "AND", 
                       ["custbody_cfdixml","isempty",""]
                      
                    ],
                    columns:
                    [
                       search.createColumn({name: "internalid", label: "Internal ID"}),
                       search.createColumn({
                          name: "entityid",
                          join: "customer",
                          label: "Cliente"
                       }),
                       search.createColumn({name: "type", label: "Documento"}),
                       search.createColumn({name: "tranid", label: "NumDoc"}),
                       search.createColumn({name: "createdfrom", label: "Origen"}),
                       search.createColumn({name: "trandate", label: "Fecha"}),
                       search.createColumn({name: "amount", label: "ImporteBruto"}),
                       search.createColumn({name: "amountremaining", label: "SaldoPendiente"}),
                       search.createColumn({name: "statusref", label: "Status"}),
                       search.createColumn({name: "custbody_cfdi_metpago_sat", label: "Método de Pago (SAT)"}),
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
                        "Tipo": r.getValue({name:'type'}),
                        "NumDoc": r.getValue({name:'tranid'}),
                        "Origen": r.getText({name:'custbody_cfdi_metpago_sat'}),
                        "Fecha": r.getValue({name:'trandate'}),
                        "Monto": r.getValue({name: 'amount'}),
                        "MontoRestante": r.getValue({name:'amountremaining'}),
                        "Estatus": r.getValue({name:'statusref'}),
                        'internalid': r.getValue({name:'internalid'})

                        

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