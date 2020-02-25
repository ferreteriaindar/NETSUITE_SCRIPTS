/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener ARQUEO A CXC
 */

define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

    var handler = {};
  
    function busqueda(id)
    {           

                var json=[];
                var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                    ["amountremaining","greaterthan","0.00"], 
                    "AND", 
                    ["type","anyof","CustInvc","CustCred"], 
                    "AND", 
                    ["customer.custentity_zona_cliente","anyof",[id]]
                ],
                columns:
                [
                    search.createColumn({
                        name: "custentity_zona_cliente",
                        join: "customer",
                        label: "Zona Indar"
                    }),
                    search.createColumn({
                        name: "entityid",
                        join: "customer",
                        label: "ID"
                    }),
                    search.createColumn({
                        name: "companyname",
                        join: "customer",
                        label: "Company Name"
                    }),
                    search.createColumn({name: "type", label: "Type"}),
                    search.createColumn({name: "tranid", label: "Document Number"}),
                    search.createColumn({name: "trandate", label: "Fecha"}),
                    search.createColumn({name: "duedate", label: "Fecha Vencimiento"}),
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "ROUND({today}-{duedate},0)",
                        label: "Dias Vencidos"
                    }),
                    search.createColumn({name: "amount", label: "Amount"}),
                    search.createColumn({name: "amountremaining", label: "Amount Remaining"}),
                    search.createColumn({
                        name: "formulapercent",
                        formula: "{amountremaining}/{amount}",
                        label: "Porcentaje"
                    }),
                    search.createColumn({name: "memo", label: "Memo"})
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
                        "zona": r.getText({name:"custentity_zona_cliente",join:"customer"}),
                        "cliente": r.getValue({name:"entityid",join:"customer"}),
                        "nombre": r.getValue({name:"companyname",join:"customer"}),
                        "type": r.getText({name:"type"}),
                        "numero":  r.getValue({name:"tranid"}),
                        "fecha": r.getValue({name:"trandate"}),
                        "vencimiento": r.getValue({name:"duedate"}),
                        "Dias": r.getValue({name:"formulanumeric"}),
                        "importe": r.getValue({name:"amount"}),
                        "saldo": r.getValue({name:"amountremaining"}),
                        "porcentaje": r.getValue({name:"formulapercent"}),
                        "memo": r.getValue({name:"memo"})

                });
            });
        });
        return  json;
    }


    handler.get = function( context )
  {
    try
    {
        log.error('zona',context.zonaid);
        var arqueo = busqueda(context.zonaid);
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': context.id, 'Documentos': arqueo }};

    }   catch ( e ) {
        log.debug( 'GET', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
  
      }
    };
return handler;
} );