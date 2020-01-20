/**
 *@NApiVersion 2.x
 * @NModuleScope Public
 * @Company INDAR
 * @Author Roberto Velasco Larios
 * @Name timbradoIndarPruebas
 */

define([ 'N/record','N/log','N/runtime','N/search','N/url'], function (record, log,runtime,search,url) {

 var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
        NSO_LOST_PARAMETER: { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }
    };


       handler.post = function (context) {
            var invoice = record.load({
                type: record.Type.INVOICE,
                id: context.InternalId
                });

                click_cfdi(invoice)
           
       };


    function click_cfdi(invoice)
    {
        var timbrada        =  invoice.getValue({fieldId:'custbody_cfdi_timbrada'})// nlapiGetFieldValue('custbody_cfdi_timbrada')||'F';
        var cartaporte      =  invoice.getValue({fieldId:'custbody_cfdi_carta_porte'}) //nlapiGetFieldValue('custbody_cfdi_carta_porte')||'F';
        var idinvoice       = invoice.getValue({fieldId:'id'});
        var wtype           = invoice.type;
        //var invoice         = nsoGetTranRecord(idinvoice);
        var tranid          = invoice.getValue({fieldId:'tranid'});
        var subsidiary      = invoice.getValue({fieldId:'subsidiary'});
        var location        = invoice.getValue({fieldId:'location'});
        var IdSetupCFDi     = runtime.getCurrentScript().getParameter( 'SCRIPT' , 'custscript_id_setupcfdi_cli' );//isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_cli'));
        var IdSetupCFDiNum  = runtime.getCurrentScript().getParameter( 'SCRIPT' , 'custscript_id_setupcfdi_num');
        var setupcfdi       = record.load({type:IdSetupCFDi,id: IdSetupCFDiNum});
        var oneworld        = setupcfdi.getValue({fieldId:'custrecord_cfdi_oneworld'});
        var billforlocation = setupcfdi.getValue({fieldId:'custrecord_cfdi_location_testing'});
        var testing         = setupcfdi.getValue({fieldId:'custrecord_cfdi_testing'});
        var folder          = setupcfdi.getValue({fieldId:'custrecord_cfdi_pdf_files'});
        var setup           = null;
        var ScriptSuit      = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_script_suitelet_cfdi');
        var ScriptSuitDepl  = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_script_suitelet_dep');
        var SaveXMLinDisk   = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_save_xml');
        var IdXMLBody       = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_idxml_field_cli');
        var bodytext        = "";
        var context         =runtime.envType;
        var newline     	= "[new line]";
        if(oneworld == 'T' ) {
            if(billforlocation == 'T') {
                setup = nlGetSetupRecord(subsidiary, location);
            }
            else {
                setup = nlGetSetupRecord(subsidiary, null);
            }
        }
        else {
            if(wtype != 'itemfulfillment'){
                if(billforlocation == 'T') {
                    setup = nlGetSetupRecord(null, location);
                }
                else {
                    setup = nlGetSetupRecord(null , null);
                }
            }
        }

        if (context != 'PRODUCTION' || testing == 'T'){
            var sRequestor  = setupcfdi.getValue({fieldId:'custrecord_cfdi_testrequestor'});
            var sEntity		= setupcfdi.getValue({fieldId:'custrecord_cfdi_entity_testing'});
            var sUser 		= setupcfdi.getValue({fieldId:'custrecord_cfdi_testrequestor'});
            var sUserName   = setupcfdi.getValue({fieldId:'custrecord_cfdi_username_testing'});
        }
        else {
            var sRequestor  = setup.getValue({fieldId:'custrecord_cfdi_requestor'});
            var sEntity		= setup.getValue({fieldId:'custrecord_cfdi_entity'});
            var sUser 		= setup.getValue({fieldId:'custrecord_cfdi_user'});
            var sUserName   = setup.getValue({fieldId:'custrecord_cfdi_username'});
        }
        var IdPath          = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_id_field_path');
        if(IdPath != null && IdPath != ''){
            var path      = setup.getValue({fieldId:IdPath}) + "\\" + tranid + ".xml";
        }
        else{
            var path      = setup.getValue({fieldId:'custrecord_cfdi_path'}) + "\\" + tranid + ".xml";
        }
        var xml       = invoice.getValue({fieldId:IdXMLBody});
        var validaTimbrado  = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_valida_timbrado');
    
    // valida campos para addendas 

        var custid      = invoice.getValue({fieldId:'entity'});
        var tipoAdenda = ( custid ) ? search.lookupFields({type: search.type.CUSTOMER,id: custid,columns: ['custentity_nso_cfdi_type_addendum']}) : 0;
        var getValidaCampos = ( tipoAdenda != 0 ) ? validaCampos( invoice, tipoAdenda ) : null ;
        var bandera = false ;
        var faltantes = [];
        if ( getValidaCampos ) {
            getValidaCampos.getCampos();
            bandera    = getValidaCampos.bandera;
            faltantes = getValidaCampos.faltantes;
        }

        if ( bandera ) {

                ( IDIOMA == 'es' ) ? alert( 'Por favor llenar los siguientes campos y guardar la transacción: '+ JSON.stringify( faltantes ) ) : alert( 'Please fill in the following fields and save the transaction: '+ JSON.stringify( faltantes ) ) ; 
                return;
        }

        //

        if((xml == null || xml == '' )){
            try	{
                if ( (ScriptSuit != null && ScriptSuit != '')&&(ScriptSuitDepl!= null && ScriptSuitDepl != '') ){
                    var url         = rl.resolveScript({scriptId: ScriptSuit, deploymentId:ScriptSuitDepl}) + "&invoiceid=" + idinvoice + "&idsetup=" + setup.getId() + "&type=" + nlapiGetRecordType();
                nlapiLogExecution('ERROR', url); // RVELASCO BORRAR
                    var objResponse = nlapiRequestURL(url, null, null, null);
                    bodytext        = (objResponse.getBody());
                }
            }
            catch(e) {
                alert(e.description);
                alert(JSON.stringify(e));
                return;
            }

            if(SaveXMLinDisk == 'T' && (bodytext != null && bodytext != ''))	{
            var res          = nlCreateTextFileToEInvoice(path, bodytext, newline);
            }
            if(bodytext){
                if (validaTimbrado == 'T' || timbrada == 'T'){
                    var tipodedocumento = getTipoDocumento(wtype);
                    if(cartaporte == 'T'){tipodedocumento = 'TRASLADO'}
                    var doc             = tipodedocumento +': ' + tranid;
                    var valida          = nsoSendToWSRecupera(5, doc, '', idinvoice, wtype, sRequestor, sEntity, sUser, sUserName, '', folder);
                    alert('Folio ya generado anteriormente en el SAT: ' + valida);
                }
                else{
                        var valida = '';
                    }
                if (valida == null || valida == ''){
                    var docXml       = nsoSendToWS(0, bodytext, 'XML PDF', idinvoice, wtype, sRequestor, sEntity, sUser, sUserName, invoice);
                    window.location  = window.location;
                    if (docXml == null || docXml == '')	{
                        alert('Proceso Terminado.');
                        window.location = window.location;

                    }
                    else{
                        alert('Hubo un error al timbrar su trasacción. Vuelva a dar click en el botón Generar CFDi');
                        nlapiSubmitField(wtype, idinvoice, 'custbody_cfdi_timbrada', 'F');
                        window.location = window.location;
                    }
                }
                else{
                    valida = valida.split('-');
                    var folio = valida[0];
                    var serie = valida[1];
                    var transaccion = getTipoDocumento(wtype);
                    if(cartaporte == 'T'){tipodedocumento = 'TRASLADO'}
                    var tranid      = invoice.getFieldValue('tranid');
                    var wname       = transaccion + ': ' + tranid
                    //var docXml       = nsoSendToWS(3, folio, serie, id, wtype, sRequestor, sEntity, sUser, sUserName, invoice);
                    var docXml       = nsoSendToWSRecuperaXMLPDF(3, '', '', idinvoice, wtype, sRequestor, sEntity, sUser, sUserName, folio, serie, folder, wname);
                    window.location  = window.location;
                    if (docXml == null || docXml == '')	{
                        alert('Proceso Terminado, se recupero con éxito el timbrado.');
                        window.location = window.location;
                    }
                else{
                    alert('guarde su transaccion e intente nuevamente')
                    window.location = window.location;
                }
                }
            }//end if(bodytext){
        }//if(xml == null || xml == '' )
        else {
            alert('Factura ya enviada al SAT');
        }
    };



    function nlGetSetupRecord(subsidiary, location)
{
	var retval     = null;
	var index      = 0;
	var filters    = new Array();
	var registro   = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_id_setup_invoice');
	var subidrec   = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_id_subsidiary_regsetup');
	var locidrec   = runtime.getCurrentScript().getParameter('SCRIPT', 'custscript_id_location_regsetup');
	if(subsidiary != null && subsidiary != "") {
		if (subidrec != null && subidrec != ''){
			filters[index]  = search.createFilter({name:subidrec,join:null,operator:"anyof",values:subsidiary});//new nlobjSearchFilter(subidrec, null, "anyof", subsidiary);
			index += 1;
		}
		else{
			filters[index]  = search.createFilter({name:'custrecord_cfdi_subsidiary',join: null, operator: "anyof", values:subsidiary});
			index += 1;
		}
	}
	//Búsqueda del registro sólo por subsidiaria: para itemfulfillment
	if(location != null && location != "") {
		if (locidrec != null && locidrec != ''){
			filters[index]  = search.createFilter({name:locidrec, join:null, operator:"anyof",values: location});
			index += 1;
		}
		else{
			filters[index]  = search.createFilter({name:'custrecord_cfdi_location',join: null,operator: "anyof", values:location});
			index += 1;
		}
	}

	if (registro)	{
		var results = search.create({type:registro,id: null,filters: filters,columns: null});
		if(results != null && results.length > 0){
			retval =  record.load({type:results[0].type,id:results[0].id}) ;// nlapiLoadRecord(results[0].getRecordType(), results[0].getId()) ;
		}
		else{
			alert( "No se encontro el registro de configuracion de la factura electronica.")//+JSON.stringify(filters))
		}
	}
	return retval;
}







    return handler;
});