/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado generar Journal netsuite, asiento contable, de efectivo a cuanta banamex
 */

define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

    var handler = {};
  
    function GeneraJournal(context)
    {           
            var Journal= record.create({
              type: record.Type.JOURNAL_ENTRY,
              isDynamic: true,
              
            });
            Journal.setValue({
              fieldId: "memo",
              value: context.memo, //"PRUEBA DESDE  LWS",
            });

            //FechaCaptura
            Journal.setValue({
              fieldId: "trandate",
              value: context.FechaCaptura, //"PRUEBA DESDE  LWS",
            });
//---------------------------------------------------------------------------
                      //start a new line  
                      //La cuenta efectivo Origen--es Credit
            Journal.selectNewLine({
              sublistId: "line",
            });

            Journal.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "account",
              value: context.CreditACC,
            });


            Journal.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "credit",
              value: context.CreditAmount,
            });
            
            Journal.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "memo",
              value: context.CreditMemo,
            });

            Journal.commitLine({
              sublistId: "line",
            });
//------------------------------------------------------------------------------------------
                      //start a new line  
                      //La cuenta efectivo DESTINO--es debit
            Journal.selectNewLine({
              sublistId: "line",
            });

            Journal.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "account",
              value: context.DebitACC, //1018,
            });


            Journal.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "debit",
              value: context.DebitAmount,
            });
            
            Journal.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "memo",
              value: context.DebitMemo,//"EFECTIVOS 2022",
            });

            Journal.commitLine({
              sublistId: "line",
            });
          


            Journal.setValue({
              fieldId: "approved",
              value: true,
            });
            var recordId = Journal.save();

           /* var JournalXAprobar=record.load({
              type: record.Type.JOURNAL_ENTRY,
              id: recordId,
              isDynamic: true,
              
            });
            JournalXAprobar.setValue({
              fieldId: "status",
              value: "B",
            });
            recordId = JournalXAprobar.save();*/
            return recordId;
    }


    handler.post = function( context )
  {
    try
    {
       
        var IDjournal = GeneraJournal(context);
        if(IDjournal!=null)
        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' },'internalId':IDjournal,'tranId':0}; //'Resultados': { 'CustomerID': context.id, 'Documentos': IDjournal }};
        else
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'internalId':0,'tranId':0};//'Resultados': { 'CustomerID': context.id, 'Documentos': IDjournal }};


    }   catch ( e ) {
        log.debug( 'GET', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
  
      }
    };
return handler;
} );