/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  generar el PAGOS DE CONTABILIDAD
 */

  define( ['N/file','N/task','N/error', 'N/record', 'N/format' , 'N/search'], function(file,task, error, record, format, search ) {

    var handler = {};
  


    function ApplyCreditMemo(context)
    {
      var creditMemo = record.load( { type: record.Type.CREDIT_MEMO, id: context.internalId, isDynamic: true } );
      var invoices = context.invoices;

      creditMemo.setValue({fieldId:'custbody_regimen_fiscal_fe_33',value:"601"});

      for ( var i = 0; i < invoices.length; i++ ) {
          log.debug('invoice', invoices[i].Id);
          var lineNumber = creditMemo.findSublistLineWithValue({
              sublistId: 'apply',
              fieldId: 'internalid',
              value: ''+invoices[i].Id+''
          });
          log.debug('lineNumber', lineNumber);
          var discount = nsoParseFloatOrZero( invoices[i].discount );
          if(lineNumber != -1 && discount > 0){
              log.debug('lineNumber invoice '+ invoices[i].Id, lineNumber);
              log.debug('discount invoice '+ invoices[i].Id, discount);
              creditMemo.selectLine( { sublistId: 'apply', line: lineNumber } );
              creditMemo.setCurrentSublistValue( 'apply', 'apply', true );
              creditMemo.setCurrentSublistValue( 'apply', 'amount', discount );
              creditMemo.commitLine( { sublistId: 'apply' } );
          }
          else if (lineNumber == -1) {
              log.debug( 'Factura invalida', invoices[i].Id );
          }
          else if (discount <= 0) {
              log.debug( 'Descuento invalido', invoices[i].Id + ": el descueto debe de ser mayor a 0");
          }
      }
      
      log.debug('credit memo', creditMemo);
      var creditId = creditMemo.save();
      log.debug('credit memo Id', creditId);
        return true;
    }
  

    function nsoParseFloatOrZero( f ) {
      var r = parseFloat( f );
      return isNaN( r ) ? 0 : r;
    }

    
    handler.post = function( context )
    {
      try
      {
        log.error( 'NOTAS CREDITO', context.csv_notas);
        log.error( 'FACTURAS', context.csv_Facturas);
          var invoices,internalIds;
           const invoiceses = [];
        if(context.csv_notas!='')
        {
          const words = context.csv_notas.split('\r\n');
          for (var index = 1; index < words.length; index++)
          {
                    log.error('csvCM',words[index]);
                    var element = words[index];
                    const wordscm=element.split(',');
                    internalIds=wordscm[0];
                    const firstInvoice =
                     {
                      Id: wordscm[1],
                      discount: wordscm[2]                     
                     };

            invoiceses.push(firstInvoice);
            
          }
          const Enviar = 
          {
            internalId: internalIds,
            invoices: invoiceses
          };
          log.error('contextCM',Enviar);
          ApplyCreditMemo(Enviar);
        
                       var fileObjCSV_notas = file.create({
                          name:  context.csv_notas+'_'+context.csvName+'.csv', 
                          fileType: file.Type.CSV,
                          contents: context.csv_notas,
                          description: 'CSV RECIBOCOBRO_notas',
                          encoding: file.Encoding.UTF8,
                          folder: 18763624,
                          isOnline: true
                          });
                          var fileIdcsv_notas = fileObjCSV_notas.save();
                          log.error('IDARCHIVO',fileIdcsv_notas);


                            
                      var scriptTask_notas = task.create({taskType: task.TaskType.CSV_IMPORT});
                      scriptTask_notas.mappingId = 306;
                    
                      var f_notas = file.load({id: fileIdcsv_notas});
                    
                      scriptTask_notas.importFile = f_notas;
                      
                      var csvImportTaskId = scriptTask_notas.submit();

        }
        
            if(context.csv_Facturas!='')
            {
              var fileObjCSV_facturas = file.create({
                name:  context.csvName_facturas+'.csv', 
                fileType: file.Type.CSV,
                contents: context.csv_Facturas,
                description: 'CSV RECIBOCOBRO_facturas',
                encoding: file.Encoding.UTF8,
                folder: 18763624,
                isOnline: true
                });
                var fileIdcsv_facturas = fileObjCSV_facturas.save();
                    log.error('IDARCHIVO',fileIdcsv_facturas);

                    var scriptTask_facturas = task.create({taskType: task.TaskType.CSV_IMPORT});
                    scriptTask_facturas.mappingId = 305;
                    var f_f = file.load({id: fileIdcsv_facturas});
                   
                    scriptTask_facturas.importFile = f_f;
                    
                    var csvImportTaskId_facturas = scriptTask_facturas.submit();
                    log.error( 'FACTURAS', csvImportTaskId_facturas);

            }

         
            var fileObjCSV = file.create({
                name:  context.csvName+'.csv', 
                fileType: file.Type.CSV,
                contents: context.csv,
                description: 'CSV RECIBOCOBRO',
                encoding: file.Encoding.UTF8,
                folder: 18763624,
                isOnline: true
                });
                var fileIdcsv = fileObjCSV.save();
                    log.debug('IDARCHIVO',fileIdcsv);
  
        var scriptTask = task.create({taskType: task.TaskType.CSV_IMPORT});
        scriptTask.mappingId =context.csv_solopago=="1"?310: 304;
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