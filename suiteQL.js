/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor L&L
 *@Company Indar
 *@NModuleScope Public
  *@Description Script encargado de obtener las historia de inventory transfer para compararlar con el WMS
 */

  define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

    var handler = {};
  
    function busqueda(querys)
    {

       
        var results = query.runSuiteQL(querys);
                

            var response = {               
                resultSuiteQL: results.asMappedResults()
                };

        return  JSON.stringify(response);
    }
 
 
    handler.post = function( context )
  {
    try
    {
        
      
    var resultado = busqueda(context.sql);
 
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': resultado }};
     // return {'Documentos':arqueo};
 
    }   catch ( e ) {
        log.error( 'CATCH', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
 
      }
    };
 return handler;
 } );