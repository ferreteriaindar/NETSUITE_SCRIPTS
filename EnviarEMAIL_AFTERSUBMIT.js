/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope: Public
 */

//define( [ 'SuiteScripts/sftp/indr_sftp','N/error', 'N/log', 'N/runtime', 'N/file', 'N/record' ],

define(['N/email','N/util',  'N/error', 'N/log', 'N/runtime',  'N/record'],

    //function( indr_sftp, error, log, runtime, file, record ) {
    function (email,util,  error, log, runtime,  record) {
        function getJsonPoAfterSubmit(context) {

            log.error('context.type: ' , context.UserEventType);

           /* if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {

                return true;
            } */
            try {
               
                  
                var currentRecordAux = context.newRecord;
                var currentRecord = record.load({ type: currentRecordAux.type, id: currentRecordAux.id });
                log.error('estatus',currentRecord.getValue({fieldId: 'orderstatus'})=='A');
                log.error('emailenviadofield',currentRecord.getValue({fieldId: 'custbody_emailenviado'}));
                log.error('entity',currentRecord.getValue({fieldId: 'entity'}));
                if(currentRecord.getValue({fieldId: 'orderstatus'})=='A' & currentRecord.getValue({fieldId: 'custbody_emailenviado'})!='SI')
                {
                      log.error('ENTRAEMAIL' ,'si');
                    ENVIAREMAIL(currentRecord);
                    currentRecord.setValue({fieldId:'custbody_emailenviado',value:'SI'});
                    currentRecord.save({ ignoreMandatoryFields: true });
                    return;
                }

            } catch (ex) {
                log.error('Error en la creación y guardado del JSON en netsuite', ex);
                 var elapsedTime = (util.nanoTime() - startTime)/1000000000.0;
              log.error("ElapsedTime Catch",elapsedTime);
              //  var archivo = generaArchivo(Factura, currentRecord.getValue({ fieldId: 'tranid' }));
            }
      
        }

        function ENVIAREMAIL(context)
        {
            var myvar = '<h2 style="text-align: center;"><span style="color: #ff0000; background-color: #ffffff;">NOTIFICACIÓN</span></h2>'+
        '<p>El pedido '+context.getValue('tranid')+'('+context.getText('entity')+')  acaba de ser creado se necesita su aprobacion</p>'+
        '<p> <a href="https://6776158-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=928&deploy=1&compid=6776158_SB1&h=1dfd699ba3d59d5846f8&data='+context.getValue('id')+'"> APROBAR</a></p>'+
        '<p> </p>';
        email.send({
            author: 7,
            recipients: context.getValue('entity'),
            subject: 'Autorizar PEDIDO ',
            body: myvar
            });
                

        }
       

        

        return {
            afterSubmit: getJsonPoAfterSubmit
        };
    }
);