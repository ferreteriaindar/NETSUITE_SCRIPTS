
/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope Public
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERROS
 */

define(['N/error', 'N/record', 'N/format', 'N/search', 'N/log'], function (error, record, format, search, log) {

    var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
        NSO_LOST_PARAMETER: { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }
    };


    handler.post = function (context) {
        try {
            var factura = record.load({
                type: record.Type.INVOICE,
                id: context.internalId,
                isDynamic: true,
                });
              //  return {'PDF':factura.getValue( {  fieldId: 'custbody_cfdi_pdf' } )};
              return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': factura.getValue( {  fieldId: 'custbody_cfdi_pdf' } ) }, 'internalId': '' };

        } catch (e)
        {
            log.error('Error al Obtener PDF', e.message);
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al Obtener PDF' }, 'internalId': '' };
        }



    };

    return handler;
});