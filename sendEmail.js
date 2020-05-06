/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  enviar Email
 */

define( ['N/email','N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( email,error, record, format, search, query ) {

  var handler = {};

 function buscarecipients(internalid)
 {
              var json=[];
              var customerSearchObj = search.create({
                type: "customer",
                filters:
                [
                  ["internalid","anyof",internalid]
                ],
                columns:
                [
                  search.createColumn({name: "custentity_apoyo_vtas", label: "Apoyo ventas"}),
                  search.createColumn({name: "custentity_representaventas", label: "Representante vtas"})
                ]
            });
            var resultados=  customerSearchObj.runPaged({
              pageSize: 1000
            });
            var k = 0;
              resultados.pageRanges.forEach(function(pageRange) {
                var pagina = resultados.fetch({ index: pageRange.index });
                pagina.data.forEach(function(r) {
                    k++
                json.push(
                      //  "articulo": r.getValue({name:"Item"}),
                        Number( r.getValue({name:'custentity_apoyo_vtas'}))
                );
                json.push(
                 Number( r.getValue({name:'custentity_representaventas'})  )
                )
            });
        });

        return json;
 }


  handler.post = function( context )
  {
    try
    {
      

     
        
      var SaleOrder = record.load({ type: record.Type.SALES_ORDER, id: context.saleOrderID    });
  
      var myvar = '<h3 style="text-align: center;"><span style="background-color: #ff9900; color: #ffffff;">AVISO</span></h3>'+
      '<p style="text-align: left;">Este correo es para avisarte  que algunas partidas  del pedido <strong> '+SaleOrder.getValue('tranid')+' </strong> del cliente <strong>'+SaleOrder.getText('entity')+' </strong> no fueron surtidas. El resto de artículos de este pedido seguira su proceso normal de surtido. Según creas conveniente, avisa a tu cliente. Este correo es informativo, favor de no contestarlo. </p>'+
      '<p style="text-align: left;"></p>'+
      '<ul>'+
      '';
      log.error('LINEAS',SaleOrder.getLineCount({sublistId: 'item'}));
      log.error('apoyo',SaleOrder.getValue('custbody_nso_indr_apoyo_ventas'));
      log.error('vendedor',SaleOrder.getValue('custbody_vendedor'));
      for (var i = 0; i < SaleOrder.getLineCount({sublistId: 'item'}); i++) {
        log.error('cerrado',SaleOrder.getSublistValue( { sublistId: 'item', line: i, fieldId: 'isclosed' } ));
        log.error('cerradoText',SaleOrder.getSublistText( { sublistId: 'item', line: i, fieldId: 'isclosed' } ));
        if(SaleOrder.getSublistText( { sublistId: 'item', line: i, fieldId: 'isclosed' } )=='T')
                  {
                    log.error('entra','si');
                      myvar=myvar+'  <li><strong>'+SaleOrder.getSublistText({sublistId: 'item', line: i, fieldId: 'item'})+'</strong>      '+SaleOrder.getSublistValue({sublistId: 'item', line: i, fieldId: 'quantity'})+' '+SaleOrder.getSublistText({sublistId: 'item', line: i, fieldId: 'units'})+'</li>'
                  }
      };
      myvar=myvar+'</ul>';

     var recipients=buscarecipients(SaleOrder.getValue('entity'));
      log.error('rrr',recipients);
      recipients.push(7); 
      
          var  id=context.id;
      email.send({
              author: 34,
              recipients: recipients,
              subject: "Partida cancelada en WMS - No Responder",
              body: myvar
  
      });
      return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': '' }};

    }   catch ( e ) {
        log.debug( 'GET', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};

      }
    };
return handler;
} );