/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  enviar Email
 */

define( ['N/email','N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( email,error, record, format, search, query ) {

    var handler = {};


    handler.post = function( context )
    {
      try
      {
        //var newOrder = context.
            var  id=context.id;
        email.send({
                author: 7,
                recipients: "rvelasco@indar.com.mx",
                subject: "mail from netsuite",
                body: context.body,
              /*  relatedRecords:{
                    transactionId:1179559

                } //"test body email order id: " + id*/
        });
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }};
  
      }   catch ( e ) {
          log.debug( 'GET', JSON.stringify( e ) );
          var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
          return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
  
        }
      };
  return handler;
  } );