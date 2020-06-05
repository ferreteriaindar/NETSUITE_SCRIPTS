
/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope Public
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERROS
 */

define(['N/error', 'N/record', 'N/format', 'N/search', 'N/log','N/file'], function (error, record, format, search, log,file) {

    var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
        NSO_LOST_PARAMETER: { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }
    };


    handler.post = function (context) {
        try {
            var factura = record.load({
                type: context.TranType,
                id: context.internalId,
                isDynamic: true,
                });

            var idFactura=factura.getValue( {  fieldId: 'custbody_fe_sf_pdf' } );
            var idXML=factura.getValue( {  fieldId: 'custbody_fe_sf_xml_sat' } );
                    log.error('idxml',idXML);
          var XML=  file.load({
                id: idXML
                });
           var PDF= file.load({
            id: idFactura
            });  

              //  return {'PDF':factura.getValue( {  fieldId: 'custbody_cfdi_pdf' } )};
           //   return { 'responseStructure': { 'codeStatus': 'OK', 'pdf': factura.getValue( {  fieldId: 'custbody_cfdi_pdf' } ),'type':factura.getValue({fieldId:'type'}),'tranid':factura.getValue({fieldId:'tranid'}) }, 'xml': factura.getValue({fieldId:'custbody_cfdixml'}) };
           return { 'responseStructure': { 'codeStatus': 'OK', 'pdf': PDF.getContents(),'type':factura.getValue({fieldId:'type'}),'tranid':factura.getValue({fieldId:'tranid'}) }, 'xml': XML.getContents() };

        } catch (e)
        {
            log.error('Error al Obtener PDF', e.message);
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al Obtener PDF' }, 'internalId': '' };
        }



    };

    return handler;
});