/**
 *@NApiVersion 2.x
 *@NModuleScope Public
 *@NScriptType Suitelet
 */
define(['N/log', 'N/ui/serverWidget', 'N/record', 'N/search'],
    function(log, serverWidget, record, search) {

        function onRequest(context) {

            var objClass = {};

            if (context.request.method === 'GET') {

		
				log.error('JSON',context.request.parameters.data);
                var fields = context.request.parameters.data.split('.');
                var recordType = fields[0];
                var idRecord = fields[1];     
                var Aprobado=fields[2];
                           
                recordType=recordType=='exprept'?'expensereport':'purchaseorder';
                var campoEstado=recordType=='exprept'?'approvalstatus':'approvalstatus';
                var TipoEstatusNuevo=recordType=='exprept'?'2':'2';
               // var currentRecord = record.load({ type:  recordType, id: idRecord });
               if(Aprobado=='NO')
               TipoEstatusNuevo=recordType=='exprept'?'3':'3';
               
                

                //var SO = record.load({ type: record.Type.SALES_ORDER, id: context.request.parameters.data,isDynamic: true });
                var SO = record.load({ type:  recordType, id: idRecord ,isDynamic: true});
                SO.setValue({fieldId:campoEstado,value:TipoEstatusNuevo});
              //  SO.setValue({fieldId:'memo',value: 'HOLA4'})
               // SO.setValue({fieldId:'memo',value:'B'});
                SO.save({ ignoreMandatoryFields: true });
               // context.response.writePage('HOLA');
                var form = buildForm(context);


                 context.response.writePage(form);

            }
        }

        function buildForm(context) {

            var fields = context.request.parameters.data.split('.');
                var recordType = fields[0];
                var idRecord = fields[1];     
                var Aprobado=fields[2];

                var titulo= Aprobado=='SI'?'Aprobación por EMAIL con exito':'Rechazado por Email con exito';
            var form = serverWidget.createForm({title: titulo});
          

            var customerField = form.addField({
                id: 'custpage_customer',
                type: 'text',
                label: 'ID DEL PEDIDO'
            }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

            customerField.defaultValue =context.request.parameters.data

            

           
            return form;
        }

        return {
            onRequest: onRequest
        };
    });