/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener PDF y/o xml de una factura ,pago, NC
 */

  define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/file','N/util'], function( error, record, format, search, file,util ) {

   var handler = {};
 
   function busqueda(data)
   {
    var fields = data.split('.');
        var  type=fields[0];
        var  DocumentNumber=fields[1];
        var  formato=fields[2]
        log.error('campos', type+"*"+DocumentNumber+"*"+formato)
        var contarResultado=0;
    //TYPE   "CustInvc", CustPymt,CustCred
               var json=[];
               var transactionSearchObj   = search.create({
                        type: "transaction",
                        filters:
                        [
                            ["type","anyof",type], 
                            "AND", 
                            ["number","equalto",DocumentNumber], 
                            "AND", 
                            ["mainline","is","T"]
                        ],
                        columns:
                        [
                            search.createColumn({name: "custbody_fe_sf_xml_sat", label: "XML - SAT"}),
                            search.createColumn({name: "custbody_fe_sf_pdf", label: "PDF"})
                        ]
                        });
               var contarResultado = transactionSearchObj.runPaged().count;
            //   log.debug("transactionSearchObj result count",searchResultCount);
             var resultados=  transactionSearchObj.runPaged({
               pageSize: 1000
             });
            
             var k = 0;
             resultados.pageRanges.forEach(function(pageRange) {
               var pagina = resultados.fetch({ index: pageRange.index });
               pagina.data.forEach(function(r) {
                   k++
               json.push({
                     
                       "xml": r.getValue({name:'custbody_fe_sf_xml_sat'}),
                       "xmlText": r.getText({name:'custbody_fe_sf_xml_sat'}),
                       "pdf": r.getValue({name:'custbody_fe_sf_pdf'}),
                       "pdfText": r.getText({name:'custbody_fe_sf_pdf'}),
                                

               });
           });
       });


       log.error('json',json);
      
       log.error('contarResultado',contarResultado);
         if(contarResultado>0)
         {
       if(json[0].xml!='' || json[0].xml!=null) // valido  si hay id de archivo
       {
           log.error('entra','si');
           var idarchivo=formato=='xml'?json[0].xml:json[0].pdf;
           log.error('idarchivo',idarchivo);
            var archivo= file.load({id:idarchivo});
            log.error('esOFFILINE',archivo.isOnline);
            if(archivo.isOnline==false)
            {
                log.error('lo hace vivo', 'si')
                archivo.isOnline = true;
                idarchivo = archivo.save();
                 archivo =  file.load({id:idarchivo});
            }
            log.error('archivourl',archivo.url);
            return "https://5327814.app.netsuite.com"+archivo.url;
       }
       else return "NOK";
        }
        else return "NOK";
   
         


   }



   


   handler.get = function( context )
 {
   try
   {
      log.error('context',context);
          var transfers = busqueda(context.data);
         return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': transfers }};
    

   }   catch ( e ) {
       log.debug( 'GET', JSON.stringify( e ) );
       var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
       return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};

     }
   };
return handler;
} );