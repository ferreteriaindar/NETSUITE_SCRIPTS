/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  aplicar  facturas a un pago
 */

define( ['N/file','N/task','N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function(file,task, error, record, format, search, query ) {

    var handler = {};


    handler.post = function( context )
    {
      try
      {
           
        var fileObj = file.create({
            name:  context.name+'.csv', 
            fileType: file.Type.CSV,
            contents: context.content,
            description: 'Archivo pago',
            encoding: file.Encoding.UTF8,
            folder: 18084,
            isOnline: true
            });
            var fileId = fileObj.save();
                log.debug('IDARCHIVO',fileId);

        var scriptTask = task.create({taskType: task.TaskType.CSV_IMPORT});
        scriptTask.mappingId = 201;
        var f = file.load({id: fileId});
       
        scriptTask.importFile = f;
        
        var csvImportTaskId = scriptTask.submit();
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': csvImportTaskId }, 'internalId': 0};
  
      }   catch ( e ) {
          log.debug( 'GET', JSON.stringify( e ) );
          var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
          return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }, 'internalId': ''};
  
        }
      };
  return handler;
  } );