/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  enviar fecha de confirmacion a la factura desde el embarque
 */

define( ['N/file','N/task','N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function(file,task, error, record, format, search, query ) {

    var handler = {};


    handler.post = function( context )
    {
      try
      {
            /*
        var customerCSVImport = nlapiCreateCSVImport();

        customerCSVImport.setMapping("1");
        // setMapping(id) – id (parameter): Internal ID of the Field Map created Step 1.
        // Navigate to: Setup > Import/Export > Saved CSV Imports.
        customerCSVImport.setPrimaryFile(nlapiLoadFile(2766));
        /*
        setPrimaryFile(file) – file {string} (parameter):
        The internal ID, as shown in the file cabinet, of the CSV file containing data to be imported, referenced by nlapiLoadFile. For example: setPrimaryFile(nlapiLoadFile(73)
        Or 
        Raw string of the data to be imported. For Example
        fileString = "company name, isperson, subsidiary, externalid\ncompanytest001, FALSE, Parent Company, companytest001";
        setPrimaryFile(fileString);
        */
       /*
        customerCSVImport.setOption("jobName", "job1Import");
        nlapiSubmitCSVImport(customerCSVImport);*/
        var fileObj = file.create({
            name:  context.name+'.csv', //'embarqueTest.csv',
            fileType: file.Type.CSV,
            contents: context.content,
            description: 'Archivo embarques',
            encoding: file.Encoding.UTF8,
            folder: 17309,
            isOnline: true
            });
            var fileId = fileObj.save();
                log.debug('IDARCHIVO',fileId);

        var scriptTask = task.create({taskType: task.TaskType.CSV_IMPORT});
        scriptTask.mappingId = 199;
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