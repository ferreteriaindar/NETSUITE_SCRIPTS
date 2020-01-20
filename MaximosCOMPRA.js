/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */


define(['SuiteScripts/INDAR SCRIPTS/httpService', 'N/search', 'N/error', 'N/log', 'N/runtime', 'N/file', 'N/record'],


    function (httpService, search, error, log, runtime, file, record) {
        function getJsonPoAfterSubmit(context) {

            log.debug('context.type: ' + context.UserEventType);

           /* if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {

                return true;
            } */
            try {
                
            var current_record    = context.newRecord;
            var currentRecord = record.load( { type: 'customrecord_nso_indr_mult_max', id: current_record.id } );
            var  Maximo={}
                Maximo={
                    itemid          : currentRecord.getValue( { fieldId : 'custrecord_mmp_item' } ),
                    maximoCompra    : currentRecord.getValue( { fieldId : 'custrecord_mmp_purc_max' } ),
                    multiploCompra  : currentRecord.getValue( { fieldId : 'custrecord_mmp_purc_mult'} ),
                    multiploVenta   : currentRecord.getValue( { fieldId : 'custrecord_mmp_sale_mult'} ),
                    isInavtice      : currentRecord.getValue( { fieldId : 'isinactive'} ),
                    idMaximo        : currentRecord.getValue( { fieldId : 'id'} )

                } ;   
                Maximo =  JSON.stringify( Maximo );
                log.error('JSON',Maximo);

               

            } catch (ex) {
                log.error('Error en la creación y guardado del JSON en netsuite', ex);
                var archivo = generaArchivo(Maximo, currentRecord.getValue({ fieldId: 'id' }));
            }
            
        }


        function generaArchivo(contenido, nombreArchivo) {

            var fileObjPDF = null,
                fileObj = file.create({
                    name: 'Maximo'+ nombreArchivo + '.json',
                    fileType: file.Type.PLAINTEXT,
                    contents: contenido,
                    description: 'Archivo .json Maximo Compras',
                    encoding: file.Encoding.UTF8,
                    folder: 57,
                    isOnline: true
                });
            return fileObj.save();
        }

        return {
            afterSubmit: getJsonPoAfterSubmit
        };
    }
);