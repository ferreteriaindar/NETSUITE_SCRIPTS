/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener inventario
 */

  define( ['N/http','N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( http,error, record, format, search, query ) {

    var handler = {};
  
   

    handler.post = function( context )
  {
    try
    {
        var myRequest = {};
        myRequest.headers = {};
        myRequest.headers["User-Agent"] = "Mozilla/5.0";
        myRequest.url = '/app/site/hosting/scriptlet.nl?script=1034&deploy=1&compid=5327814_SB1&data=eyJyZWNvcmRUeXBlIjoiaXRlbWZ1bGZpbGxtZW50IiwicmVjb3JkSWQiOiI3ODkzODg1IiwidGl0bGVGb3JtIjoiRmFjdHVyYSBFbGVjdHLDs25pY2EifQ=='; //Suitelet External URL
        var myResponse = http.get({
            url:  myRequest.url,
            headers: myRequest.headers
        }).get(myRequest);
       
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': myResponse }, 'Resultados': { 'CustomerID': 22, 'Documentos': 0 }};
     

    }   catch ( e ) {
        log.debug( 'GET', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
  
      }
    };
return handler;
} );