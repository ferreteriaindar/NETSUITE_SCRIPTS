/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  cerrar el pedido,o una linea de un pedido
 */

  define( ['N/http','N/format', 'N/log', 'N/record',  'N/search','N/encode','N/file' ,'N/runtime'], function( http,format,log,record,  search,encode,file ,runtime) {

    var handler = {};


    handler.post = function( context )
    {
      
      var PDF=  generaCartaPorte(context);

      if(PDF!=null)
              //return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': PDF.getContents()}, 'internalId': 0};
              return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'OK'}, 'internalId': 0};
        else
        return { 'responseStructure': { 'codeStatus': 'NO K', 'descriptionStatus': ''}, 'internalId': 0};

       
    
  
    };

    function obtenerIDFulfillment(createdFrom)
    {
        var idFullfilment;
        var json=[];
        var customerSearchObj = search.create({
          type: "itemfulfillment",
          filters:
            [
                ["type","anyof","ItemShip"], 
                "AND", 
                ["mainline","is","T"], 
                "AND", 
                ["createdfrom","anyof",createdFrom]
            ],
            columns:
            [
                search.createColumn({name: "internalid", label: "Internal ID"})
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
          
         
                 idFullfilment= Number( r.getValue({name:'internalid'}));
         
          
            });
        });

        return idFullfilment;


    }


    function MandarJsonFulfillment(idFullfilment,rfc,idJson,json64Timbrar)
    {
        var Fulfillment = record.load({ type: record.Type.ITEM_FULFILLMENT, id: idFullfilment  });

        Fulfillment.setValue({fieldId:'custbody_fe_rfc_cfdi_33',value:rfc});
      /*  Fulfillment.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });*/
        Fulfillment.setValue({fieldId:'custbody_uso_cfdi_fe_imr_33',value:22});
        Fulfillment.setValue({fieldId:'custbody_fe_complementos_imr',value:7});
        Fulfillment.setValue({fieldId:'custbodyimr_complementocartaportejson',value:idJson});
         var hoy = new Date();
            var receipt_date2 = format.parse( hoy, 'date' );
            Fulfillment.setValue({fieldId:'custbody_fecha_de_timbrado',value:receipt_date2});

            //PARA EL  CFDI 4.0
            Fulfillment.setValue({fieldId:'custbody_fe_razon_social',value:'FERRETERIA INDAR'});
            Fulfillment.setValue({fieldId:'custbody_uso_cfdi_fe_imr_33',value:24});
            Fulfillment.setValue({fieldId:'custbody_domiciliofiscalreceptor',value:"45620"});
            Fulfillment.setValue({fieldId:'custbodyimr_regimenfiscalreceptor',value:601});

            var now = Date.now();
            Fulfillment.setValue({fieldId:'memo',value:now});

            //FIN DEL CFDI 4.0
      log.error('AntesGuardar','si');
        Fulfillment.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });
 log.error('AntesGuardar','si2');
    
        return Fulfillment.getValue( {  fieldId: 'custbody_fe_sf_pdf' } );








    }


   function generaCartaPorte(context)
   {
    var complementoCP = record.create({
        type: 'customrecordimr_fe_complementocartaporte',
        isDynamic: true
        });
     
     
     var userObj = runtime.getCurrentUser();
     log.error('USER',userObj);

        
            var json=fromBase64( context.json64);
            log.error({
                title: 'SIN 64',
                details: json
            });
        complementoCP.setValue({fieldId:'custrecordjson_complementocp',value:json});
      var idJson=  complementoCP.save({ignoreMandatoryFields:true});
      log.error({title: 'idJson', details: idJson });

      var idFullfilment=obtenerIDFulfillment(context.createdFrom);
      log.error({ title: 'idFullfilment',details: idFullfilment  });
      var idPDF=MandarJsonFulfillment(idFullfilment,context.rfc,idJson,context.json64Timbrar);
                log.error({
                    title: 'idPDF',
                    details: idPDF
                })
  
                /*
      var PDF= regresaPDF(idFullfilment);
      log.error({
          title: 'PDF',
          details: PDF
      });  
      return PDF; */
      return 'OK'
      

   }



   function regresaPDF(idFullfilment)
   {
    var Fulfillment = record.load({ type: 'ITEMFULFILLMENT', id: idFullfilment  });
  

     var IDpdf=     Fulfillment.getValue( {  fieldId: 'custbody_fe_sf_pdf' } );
     var PDF= file.load({
        id: IDpdf
        }); 

        return PDF;

   }

   function fromBase64(stringInput){
    return encode.convert({
        string: stringInput,
        inputEncoding: encode.Encoding.BASE_64,
        outputEncoding: encode.Encoding.UTF_8
    });
}

    return handler;
});