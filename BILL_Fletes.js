/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  generar el BILL de las facturas de distribucion
 */

define( ['N/file','N/task','N/error', 'N/record', 'N/format' , 'N/search'], function(file,task, error, record, format, search ) {

    var handler = {};


    handler.post = function( context )
    {
      try
      {
           //PRMERO SE GUARDA EL XML  EN EL FILE CABINET
        var fileObjxml = file.create({
            name:  context.name+'.xml', 
            fileType: file.Type.XMLDOC,
            contents: context.content,
            description: 'Xml fletera',
            encoding: file.Encoding.UTF8,
            folder: 2716641,
            isOnline: true
            });
            var fileIdxml = fileObjxml.save();
                log.debug('IDARCHIVO',fileIdxml);

            //SEGUNDO SE GUARDA  EL CSV PARA LA IMPORTACION
            log.error({
                title: 'encodigin',
                details: context.csv
            })

          /*  //var replaceCSSV= context.csv.replace('Ó','ó');
            log.error({
                title: 'depsues',
                details: replaceCSSV
            })*/
            var fileObjCSV = file.create({
                name:  'pruebaFlete.csv', 
                fileType: file.Type.CSV,
                contents: context.csv,
                description: 'Xml fletera',
                encoding: file.Encoding.UTF8,
                folder: 18084,
                isOnline: true
                });
                var fileIdcsv = fileObjCSV.save();
                    log.debug('IDARCHIVO',fileIdcsv);

        var scriptTask = task.create({taskType: task.TaskType.CSV_IMPORT});
        scriptTask.mappingId = 260;
        var f = file.load({id: fileIdcsv});
       
        scriptTask.importFile = f;
        
        var csvImportTaskId = scriptTask.submit();
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 1 }, 'internalId': 0};
  
      }   catch ( e ) {
          log.debug( 'GET', JSON.stringify( e ) );
          var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
          return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }, 'internalId': ''};
  
        }
      };
  return handler;
  } );