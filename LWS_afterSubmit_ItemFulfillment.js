/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @Autor ROBERTO VELASCO LARIOS
 * @NModuleScope Public
 * @Company INDAR
 * @NModuleScope Public
 *
*/


define(['SuiteScripts/INDAR SCRIPTS/LWS_HTTP_CONNECTION',"N/runtime",'N/record','N/file','N/encode'], function (httpService,runtime,record,file,encode) {

    var exports = {};
    function afterSubmit(scriptContext) {

        try
        {
        var valoresIF = {};
        var viejo = scriptContext.oldRecord;
        if(viejo)
       var nuevo = record.load({ type : viejo.type, id : viejo.id });
       log.error({
           title: 'ID',
           details: nuevo.getValue({ fieldId : 'id'})
       });
      
        var codigoRepuesta = nuevo.getValue({fieldId : 'custbody_fe_sf_codigo_respuesta' });
        var codigoRepuestaOld=viejo.getValue({fieldId : 'custbody_fe_sf_codigo_respuesta' });

        log.error('codigo',codigoRepuesta);
        log.error('codigoOLD',codigoRepuestaOld);
            if(codigoRepuesta=='200.0')
            {
                log.error('ENTRA','si');
            var idXML=nuevo.getValue({fieldId : 'custbody_fe_sf_xml_sat' });
            var idPDFL=nuevo.getValue({fieldId : 'custbody_fe_sf_pdf' });
                var xml=  file.load({
                    id : idXML
                });
                var pdf =file.load({
                    id : idPDFL
                });
              //  log.error('xml',xml);
               // var urls =regresarURLS(currentRecord.getValue({ fieldId: 'custbody_fe_sf_xml_sat' }),currentRecord.getValue({ fieldId: 'custbody_fe_sf_pdf' }));
                
                        valoresIF =
                        {
                            InternalId : nuevo.getValue({fieldId : 'id' }),
                            createdfrom : nuevo.getValue({fieldId : 'createdfrom'}),
                            XML : fromBase64( xml.getContents()),
                            PDF: 'https://5327814.app.netsuite.com'+pdf.url



                        };
                    
                 //       var archivo = generaArchivo(JSON.stringify( valoresIF ), nuevo.getValue({fieldId : 'id' }));
  log.error('response',JSON.stringify( valoresIF ))
                   var response=    httpService.post('Logistica/CartaPorteXML', valoresIF );
              log.error('response',JSON.stringify( response ));
                    // return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': PDF.getContents()}, 'internalId': 0};
            }

        }catch(e)
        {
            log.debug( 'GET', JSON.stringify( e ) );

        }            
    }


    function generaArchivo( contenido, nombreArchivo ) {
 
        try {
  
          var fileObjPDF = null,
              fileObj = file.create( {
                  name:     'CP_XML_'+ nombreArchivo + '.json',
                  fileType:    file.Type.PLAINTEXT,
                  contents:    contenido,
                  description: 'Archivo .json pra la inegración de órdenes de Venta',
                  encoding:     file.Encoding.UTF8,
                  folder:       68,
                  isOnline:     true
              });
  
        } catch( e ){
  
              log.error('Error al guardar el archivo', e );
              return null;
  
        }
  
          return fileObj.save();
      }

    function regresarURLS(idXML,idPDF)
    {
        var urlsaux=[]
        //log.error('regresaURLS','si');  
       
         var archivo= file.load({id:idXML});

         if(archivo.isOnline==false)
         {
           //  log.error('lo hace vivo', 'si')
             archivo.isOnline = true;
             idarchivo = archivo.save();
              archivo =  file.load({id:idarchivo});
         }
      //   log.error('archivourl',archivo.url);
        urlsaux.push("https://5327814.app.netsuite.com"+archivo.url);


        var archivo2= file.load({id:idPDF});
     //   log.error('esOFFILINE',archivo2.isOnline);
        if(archivo2.isOnline==false)
        {
        //    log.error('lo hace vivo', 'si')
            archivo2.isOnline = true;
            idarchivo2 = archivo2.save();
             archivo2 =  file.load({id:idarchivo2});
        }
      //  log.error('archivo2url',archivo2.url);
        urlsaux.push("https://5327814.app.netsuite.com"+archivo2.url);
        return urlsaux;
    

    }




    function fromBase64(stringInput){
        return encode.convert({
            string: stringInput,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64
        });
    }
    
  

    exports.afterSubmit = afterSubmit;
    return exports;
});