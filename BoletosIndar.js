/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener el pedido para cancelarlo en NETSUITE Y  WMS
 */

define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query','N/log'], function( error, record, format, search, query,log ) {

    var handler = {};
  
    function busqueda()
    {
     
                var json=[];
                var transactionSearchObj = search.create({
                    type: "invoice",
                    filters:
                    [
                       //   OFERTA RELAMPAGO
                     /*  ["type","anyof","CustInvc"], 
                       "AND", 
                        ["createdfrom.datecreated","within","4/6/2020 9:00 am","4/6/2020 7:00 pm"], 
                        "AND", 
                        ["createdfrom.custbody_eventos","anyof","190","191"], 
                        "AND", 
                        ["name","noneof","31967","29650","32008","2"], 
                        "AND", 
                        ["item","anyof","20720","20724","20725","21058","21066","22455","22819","16508","34267","8240","8243","8545","8547","8242"]
                       */
                      ["type","anyof","CustInvc"], 
                        "AND", 
                        ["createdfrom.datecreated","within","4/6/2020 12:00 am","4/6/2020 11:00 pm"], 
                        "AND", 
                        ["createdfrom.custbody_eventos","anyof","194","195","200","196","199","197","198","208","209","214","210","213","211","212","222","223","227","226","224","225","228","229","233","232","230","231","201","202","207","203","206","204","205","215","216","221","217","220","218","219"], 
                        "AND", 
                        ["name","noneof","31967","29650","32008","2"]
                     ],
                    columns:
                    [
                       search.createColumn({
                          name: "tranid",
                          summary: "GROUP",
                          label: "Document Number"
                       }),
                       search.createColumn({
                          name: "formulanumeric",
                          summary: "SUM",
                          formula: "CASE WHEN {taxitem}='IVA 16%' THEN {grossamount}*1.16 else {grossamount} END",
                          label: "Formula (Numeric)"
                       }),
                       search.createColumn({
                          name: "email",
                          join: "customer",
                          summary: "GROUP",
                          label: "Email"
                       }),
                       search.createColumn({
                          name: "entity",
                          summary: "GROUP",
                          label: "Name"
                       }),
                       search.createColumn({
                          name: "custrecord_apoyo_ventas",
                          join: "CUSTBODYZONA",
                          summary: "GROUP",
                          label: "Apoyo de ventas"
                       }),
                       search.createColumn({
                          name: "custrecord_representante_vtas",
                          join: "CUSTBODYZONA",
                          summary: "GROUP",
                          label: "Representante ventas"
                       }),
                       search.createColumn({
                        name: "custbody_eventos",
                        summary: "GROUP",
                        label: "Evento"
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
                      
                        'tranid': r.getValue({name:'tranid',summary:'GROUP'}),
                        "formulanumeric": r.getValue({name:'formulanumeric',summary:'SUM'}),
                        "email": r.getValue({name:'email',join:'customer',summary:'GROUP'}),                      
                        "entity": r.getText({name: 'entity',summary:'GROUP'}),
                        "custrecord_apoyo_ventas": r.getValue({name:'custrecord_apoyo_ventas',join:'CUSTBODYZONA',summary:'GROUP'}),
                        "custrecord_representante_vtas": r.getValue({name:'custrecord_representante_vtas',join:'CUSTBODYZONA',summary:'GROUP'}),
                        "custbody_eventos": r.getText({name:'custbody_eventos',summary:'GROUP'})
                                           

                });
            });
        });
        return  json;
    }

   
    handler.post = function( context )
  {
    try
    {
       
        var pedido = busqueda();

        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': pedido }};
     // return {'Documentos':arqueo};

    }   catch ( e ) {
        log.debug( 'GET', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};

      }
    };
return handler;
} );