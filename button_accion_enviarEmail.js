 /**
 * @NApiVersion 2.x 
 * @NScriptType ClientScript
 */
  define(['N/email','N/util',  'N/log', 'N/record','N/ui/dialog'],
  function(email,util,  log,   record,dialog) {
    var exports = {};
    function pageInit(context) {
        console.log("pageInit Triggered!");
       // return;
      }
        exports.pageInit=pageInit;
      function AccionenviarEmail(context)
      {
        try{
        console.log("pageInit Triggered!");
        var fields = context.split('.');
        var recordType = fields[0];
        var idRecord = fields[1];
        
        recordType=recordType=='expensereport'?recordType:'purchaseorder';
        var campoEstado=recordType=='expensereport'?'origstatus':'orderstatus';
        var TipoEstatus=recordType=='expensereport'?'B':'A';
        var currentRecord = record.load({ type:  recordType, id: idRecord });
       if(currentRecord.getValue({fieldId: campoEstado})!=TipoEstatus)
       dialog.alert({ 
		title: 'Atención', 
		message: 'Esta funcionalidad solo esta disponible para estatus por aprobar' 
	}).then(success).catch(failure); 

           if(currentRecord.getValue({fieldId: campoEstado})==TipoEstatus)
        {
              log.error('ENTRAEMAIL' ,'si');
            ENVIAREMAIL(currentRecord);
            dialog.alert({ 
                title: 'Confirmación', 
                message: 'El email a sido enviado' 
            }).then(success).catch(failure); 

           // currentRecord.setValue({fieldId:'custbody_emailenviado',value:'SI'});
           // currentRecord.save({ ignoreMandatoryFields: true });
            return;
        }  
 
      }catch(ex)
      {
        console.log(ex);
        console.log(JSON.stringify(ex));
        dialog.alert({ 
          title: 'Alert', 
          message: 'No se pudo enviar el email, favor de validar informacion' 
      }).then(success).catch(failure); 
      }
      }

      function success(result) { console.log('Success with value: ' + result) }
      function failure(reason) { console.log('Failure: ' + reason) }

      function ENVIAREMAIL(context)
      {
        console.log('CONTEXT:');
        console.log(context);
        var recordType=context.getValue({fieldId: 'type'});
        var idRecord=context.getValue({fieldId: 'id'});
        var solicitante =recordType=='exprept'?context.getValue('entityname'):context.getText('employee');
        var Documento=recordType=='exprept'?'Reporte de Gastos':'Pedido';

          var myvar = '<h2 style="text-align: center;"><span style="color: #ff0000; background-color: #ffffff;">NOTIFICACIÓN</span></h2>'+
      '<p>El pedido '+context.getValue('tranid')+'('+context.getText('entity')+')  acaba de ser creado se necesita su aprobacion</p>'+
      '<p> <a href="https://6776158.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=993&deploy=1&compid=6776158&h=63e10a48a343d349f44b&data='+recordType+'.'+idRecord+'"> APROBAR</a></p>'+
      '<p> </p>';


      myvar=  '<p>El siguiente documento acaba de ser creado y&nbsp; necesita su aprobacion</p>'+
      '<p>&nbsp;</p>'+
      '<table style="width: 100%; border-collapse: collapse; background-color: #e0e6ef;" border="1">'+
      '<tbody>'+
      '<tr>'+
      '<td style="width: 100%;"><span style="color: #5a6f8f;">Informacion Primaria</span></td>'+
      '</tr>'+
      '</tbody>'+
      '</table>'+
      '<table style="border-collapse: collapse; width: 99.858%; height: 108px;" border="1">'+
      '<tbody>'+
      '<tr style="height: 18px;">'+
      '<td style="width: 50%; height: 18px;"><span style="color: #808080;">DOCUMENTO</span></td>'+
      '<td style="width: 50%; height: 18px;"><span style="color: #999999;">FECHA</span></td>'+
      '</tr>'+
      '<tr style="height: 18px;">'+
      '<td style="width: 50%; height: 18px;">'+Documento+' '+context.getValue('tranid')+'</td>'+
      '<td style="width: 50%; height: 18px;">'+context.getValue('trandate')+'</td>'+
      '</tr>'+
      '<tr style="height: 18px;">'+
      '<td style="width: 50%; height: 18px;"><span style="color: #808080;">PROVEEDOR/EMPLEADO</span></td>'+
      '<td style="width: 50%; height: 18px;"><span style="color: #808080;">SOLICITANTE</span></td>'+
      '</tr>'+
      '<tr style="height: 18px;">'+
      '<td style="width: 50%; height: 18px;">'+context.getValue('entityname')+'</td>'+
      '<td style="width: 50%; height: 18px;">'+ solicitante+'</td>'+
      '</tr>'+
      '</tbody>'+
      '</table>'+
      '<tr>'+
      '<td style="width: 100%;"><strong><span style="color: #ffffff;">Items</span></strong></td>'+
      '</tr>'+
      '</tbody>'+
      '</table>'+
      '<table style="width: 100%; border-collapse: collapse; background-color: #607799;" border="1">'+
      '<tbody>'+
      '<tr>'+
      '<td style="width: 100%;"><strong><span style="color: #ffffff;">Items</span></strong></td>'+
      '</tr>'+
      '</tbody>'+
      '</table>'+
      '<table style="width: 100%; border-collapse: collapse; background-color: #e5e5e5;" border="1">'+
      '<tbody>'+
      '<tr>'+
      '<td style="width: 25%;">ARTICULO</td>'+
      '<td style="width: 25%;">QUANTITY</td>'+
      '<td style="width: 25%;">RATE</td>'+
      '<td style="width: 25%;">AMOUNT</td>'+
      '</tr>'+
      '</tbody>'+
      '</table>' ;

      //AQUI SE INGRESA EL DETALLE 
      if(recordType!='exprept')
      {
          var tamaño = context.getLineCount({ sublistId: 'item' });
   
          for (var i = 0; i < tamaño; i++) {
            var rateFix= context.getSublistText({ sublistId: 'item', line: i, fieldId: 'rate' });
            rateFix= Number.parseFloat(rateFix).toFixed(2);
            var  linea='<table style="border-collapse: collapse; width: 100%;" border="1">'+
                        '<tbody>'+
                        '<tr>'+
                        '<td style="width: 25%;">'+context.getSublistText({ sublistId: 'item', line: i, fieldId: 'item' })+'</td>'+
                        '<td style="width: 25%;">'+context.getSublistText({ sublistId: 'item', line: i, fieldId: 'quantity' })+'</td>'+
                        '<td style="width: 25%;">$'+rateFix+'</td>'+
                        '<td style="width: 25%;">$'+context.getSublistText({ sublistId: 'item', line: i, fieldId: 'amount' })+'</td>'+
                      '</tr>'+
                        '</tbody>'+
                        '</table>';
                        
                        myvar=myvar+linea;

          }
      }
      else
      {
        var tamaño = context.getLineCount({ sublistId: 'expense' });
        console.log('tamaño exprept'+tamaño);
        for (var i = 0; i < tamaño; i++) {
          var  linea2='<table style="border-collapse: collapse; width: 100%;" border="1">'+
                      '<tbody>'+
                      '<tr>'+
                      '<td style="width: 25%;">'+context.getSublistText({ sublistId: 'expense', line: i, fieldId: 'category' })+'</td>'+
                      '<td style="width: 25%;">'+context.getSublistText({ sublistId: 'expense', line: i, fieldId: 'quantity' })+'</td>'+
                      '<td style="width: 25%;">$'+context.getSublistText({ sublistId: 'expense', line: i, fieldId: 'exchangerate' })+'</td>'+
                      '<td style="width: 25%;">$'+context.getSublistText({ sublistId: 'expense', line: i, fieldId: 'amount' })+'</td>'+
                    '</tr>'+
                      '</tbody>'+
                      '</table>';
                      console.log(linea2);
                      
                      myvar=myvar+linea2;

        }


      }
      var bodyFooter='<p>&nbsp;</p>'+
      '<p>&nbsp;</p>'+
      '<p>&nbsp;</p>'+
      '<table style="height: 27px; width: 50.0001%; border-collapse: collapse; background-color: #607799;" border="1">'+
      '<tbody>'+
      '<tr>'+
      '<td style="width: 100%;"><span style="color: #ffffff;">RESUMEN</span></td>'+
      '</tr>'+
      '</tbody>'+
      '</table>'+
      '<table style="height: 26px; width: 50%; border-collapse: collapse; background-color: #e0e6ef;" border="1">'+
      '<tbody>'+
      '<tr>'+
      '<td style="width: 100%;">TOTAL&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<strong><span style="color: #36302a;">$'+context.getValue('total')+'</span></strong></td>'+
      '</tr>'+
      '</tbody>'+
      '</table>'+
      '<p>&nbsp;</p>'+
      '<p>&nbsp;</p>'+
      '<p> <a href="https://6776158.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=993&deploy=1&compid=6776158&h=63e10a48a343d349f44b&data='+recordType+'.'+idRecord+'.SI'+'"> APROBAR</a></p>'+
      '&nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;'+ '<p> <span style="color: #ff0000;"> <a style="color: #ff0000;" href="https://6776158.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=993&deploy=1&compid=6776158&h=63e10a48a343d349f44b&data='+recordType+'.'+idRecord+'.NO'+'"> RECHAZAR</a></p>'+
      '<p> </p>';
      myvar=myvar+bodyFooter;

        var autor=recordType=='exprept'?context.getValue('entity'):context.getValue('employee');
      email.send({
          author:autor, //9083, // context.getValue('employee'),
          recipients: context.getValue('custbodylh_aprobador'),    // recordType=='exprept'?context.getValue('nextapprover'):context.getValue('custbodylh_aprobador'),
          subject: 'Autorizar PEDIDO ',
          body: myvar,
          relatedRecords: {
            transactionId: context.getValue('id')
        }
          });
              

      }


      exports.AccionenviarEmail=AccionenviarEmail;
      return exports;
  });