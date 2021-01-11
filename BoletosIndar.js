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
                       //   FIN DE AÑO
                       ["type","anyof","CustInvc"], 
                       "AND",                        
                       ["datecreated","within","yesterday"],               
                       "AND", 
                       ["name","noneof","31967","29650","32008","2"], 
                       "AND", 
                       ["item","anyof","@NONE@"], 
                       "AND", 
                       ["createdfrom.datecreated","after","29/11/2020 11:59 pm"]
                      /*
                     ["type","anyof","CustInvc"], 
                     "AND", 
                     ["datecreated","within","30/6/2020 12:00 am","30/6/2020 11:59 pm"], 
                     "AND", 
                     ["createdfrom.custbody_eventos","anyof","194","195","200","196","199","197","198","208","209","214","210","213","211","212","201","202","207","238","203","206","204","205","239","215","216","221","240","217","220","218","219","241","222","223","227","234","226","224","225","228","229","233","236","232","230","231","237","235"], 
                     "AND", 
                     ["name","noneof","31967","29650","32008","2"], 
                     "AND", 
                     ["item","anyof","@NONE@"]
                     */
                      
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