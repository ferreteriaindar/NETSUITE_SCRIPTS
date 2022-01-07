/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @Autor ROBERTO VELASCO LARIOS
 * @NModuleScope Public
 * @Company INDAR
 * @NModuleScope Public
 *
*/


define(['SuiteScripts/INDAR SCRIPTS/httpService',"N/runtime",'N/record','N/file','N/encode'], function (httpService,runtime,record,file,encode) {

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
            if(codigoRepuesta=='200.0')
            {

            var idXML=nuevo.getValue({fieldId : 'custbody_fe_sf_xml_sat' });

                var xml=  file.load({
                    id : idXML
                });


                
                        valoresIF =
                        {
                            InternalId : nuevo.getValue({fieldId : 'id' }),
                            createdfrom : nuevo.getValue({fieldId : 'createdfrom'}),
                            XML : fromBase64( xml.getContents())



                        };
                     
                     //   valoresIF          = JSON.stringify( valoresIF );
                     /*   log.error({
                            title : 'valoresIF',
                            details : valoresIF
                        });
                        */

                       httpService.post('api/Embarque/CartaPorteGetXmlModel', valoresIF );
                    // return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': PDF.getContents()}, 'internalId': 0};
            }

        }catch(e)
        {
            log.debug( 'GET', JSON.stringify( e ) );

        }            
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