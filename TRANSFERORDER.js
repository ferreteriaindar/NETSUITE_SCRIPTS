/**
- Descripción: Manda a IWS el transer order despues de ser aprovado.
- Autor: ROBERTO VELASCO LARIOS

- FechaCreación: 2019/NOVIEMBRE/15
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

define( [ 'SuiteScripts/INDAR SCRIPTS/httpService','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

function( httpService, error, log, runtime, file, record ) {


    function getJsonSoAfterSubmit( context ) {
        if ( context.type !== context.UserEventType.CREATE &&  context.type !== context.UserEventType.EDIT && context.type !== context.UserEventType.APPROVE ) {

            return true;
        }

        var current_record    = context.newRecord;
            var currentRecord = record.load( { type: record.Type.TRANSFER_ORDER, id: current_record.id } );
            var estatus       = currentRecord.getValue( { fieldId : 'orderstatus' } );

            if(estatus!='B')
           { return true;}
            else
            {
                var valoresOv     = {};
                var tamaño        = currentRecord.getLineCount( { sublistId: 'item' } );
                var lineas          = [];
                for ( var i = 0 ; i < tamaño ; i++) {

                    lineas.push( {
                        item                                : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'item' } ),
                        itemText                            : currentRecord.getSublistText( { sublistId: 'item', line: i, fieldId: 'item' } ),
                        quantity                            : currentRecord.getSublistValue( { sublistId: 'item', line: i, fieldId: 'quantity' } )
                    });

                }

                valoresOv = {
                    baserecordtype                     : currentRecord.getValue( { fieldId : 'baserecordtype' } ),
                    tranid                             : currentRecord.getValue( { fieldId : 'tranid' } ),
                    vendor                             : 'POSTVENTA'


                };

                valoresOv.lineitems = { item:lineas };
                valoresOv           = JSON.stringify( valoresOv );
                //var archivo         = generaArchivo( valoresOv, currentRecord.getValue( { fieldId : 'tranid' } ) );
                try {

                    //var fileObj = file.load( { id: archivo } );
                  //  indr_sftp.upLoad( fileObj, currentRecord.getValue( { fieldId : 'itemid' } ) +'.json', 'ITEM' );
                  httpService.post('api/Inventory/DevolutionToReceipt', valoresOv );

                } catch ( ex ) {
                    var archivo         = generaArchivo( valoresOv, currentRecord.getValue( { fieldId : 'tranid' } ) );

                    log.error( 'Error al enviar JSON',ex );

                }




            }

    }


    function generaArchivo( contenido, nombreArchivo ) {

        try {

          var fileObjPDF = null,
              fileObj = file.create( {
                  name:        nombreArchivo + '.json',
                  fileType:    file.Type.PLAINTEXT,
                  contents:    contenido,
                  description: 'Archivo .json TRANSITO POSTVENTA',
                  encoding:     file.Encoding.UTF8,
                  folder:       420,
                  isOnline:     true
              });

        } catch( e ){

              log.error('Error al guardar el archivo', e );
              return null;

        }

          return fileObj.save();
      }

    return {
        afterSubmit: getJsonSoAfterSubmit
    };
});