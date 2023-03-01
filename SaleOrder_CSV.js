/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  generar SUBIR PEDIDOS EN CSV DESDE LA NUEVA PAGINA
 */

  define( ['N/file','N/task','N/error', 'N/record', 'N/format' , 'N/search'], function(file,task, error, record, format, search ) {

    var handler = {};
  
  
    handler.post = function( context )
    {
      try
      {
        
        log.error('context',context);
            var fileObjCSV = file.create({
                name:  context.name+'.csv', 
                fileType: file.Type.CSV,
                contents: context.content,
                description: 'CSV SALEORDER',
                encoding: file.Encoding.UTF8,
                folder: 21810225,
                isOnline: true
                });
                var fileIdcsv = fileObjCSV.save();
                    log.debug('IDARCHIVO',fileIdcsv);
  
        var scriptTask = task.create({taskType: task.TaskType.CSV_IMPORT});
        scriptTask.mappingId = 308;
        var f = file.load({id: fileIdcsv});
       
        scriptTask.importFile = f;
        
        var csvImportTaskId = scriptTask.submit();

        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 1 }, 'internalId': 0};
  
      }   catch ( e ) {
          log.error( 'GET', JSON.stringify( e ) );
          var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
          return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }, 'internalId': ''};
  
        }
      };
  return handler;
  } );