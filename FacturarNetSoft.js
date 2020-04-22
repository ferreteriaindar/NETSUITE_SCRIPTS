//==============================================================================
// Script File	: nso_indr_timbrarAlCrear.js
// Script Type	: User Event
// Description	: Timbra automaticamente facturas al ser creadas.
// Author		: Miguel E. Rodríguez Coleote
// Date			: 07/04/2020
//==============================================================================

var context = nlapiGetContext();
var IDIOMA  = context.getPreference( 'LANGUAGE' ).split( '_' )[ 0 ];

function cfdi_aftersubmit( type ){
	
	nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'Type: ' + type);
	var timbrada  = nlapiGetFieldValue('custbody_cfdi_timbrada')||'F';
	
	//Solo ejecuta este script cuando la factura es creada.
	if( type != 'create' || timbrada == 'T'){
		return;
	}

	try {
		var cartaporte      = nlapiGetFieldValue('custbody_cfdi_carta_porte')||'F';
		var idinvoice       = nlapiGetFieldValue("id");
		var type           = nlapiGetRecordType();
		var invoice         = nsoGetTranRecord(idinvoice);
		var tranid          = invoice.getFieldValue("tranid");
		var subsidiary      = invoice.getFieldValue("subsidiary");
		var location        = invoice.getFieldValue("location");
		var IdSetupCFDi     = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_cli_tc'))||'NONE';
		var IdSetupCFDiNum  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_num_tc'))||'NONE';
		var setupcfdi       = nlapiLoadRecord(IdSetupCFDi, IdSetupCFDiNum)||'NONE';
		var oneworld        = setupcfdi.getFieldValue('custrecord_cfdi_oneworld')||'NONE';
		var billforlocation = setupcfdi.getFieldValue('custrecord_cfdi_location_testing')||'NONE';
		var testing         = setupcfdi.getFieldValue('custrecord_cfdi_testing')||'NONE';
		var folder          = setupcfdi.getFieldValue('custrecord_cfdi_pdf_files')||'NONE';
		var setup           = null;
		var ScriptSuit      = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_script_suitelet_cfdi_tc'))||'NONE';
		var ScriptSuitDepl  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_script_suitelet_dep_tc'))||'NONE';
		var SaveXMLinDisk   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_save_xml_tc'))||'NONE';
		var IdXMLBody       = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_cli_tc'))||'NONE';
		var bodytext        = "";
		var context         = nlapiGetContext().getEnvironment();
		var newline     	= "[new line]";

		if(oneworld == 'T' ) {
			if(billforlocation == 'T') {
				setup = nlGetSetupRecord(subsidiary, location);
			}
			else {
				setup = nlGetSetupRecord(subsidiary, null);
			}
		}else {
			if(type != 'itemfulfillment'){
				if(billforlocation == 'T') {
					setup = nlGetSetupRecord(null, location);
				}
				else {
					setup = nlGetSetupRecord(null , null);
				}
			}
		}

		if( !setup ){
			nlapiLogExecution('Error', 'cfdi_aftersubmit', 'No existe una configuración para esta subsidiaria y/o ubicación.');
			return;
		}

		if (context != 'PRODUCTION' || testing == 'T'){
			var sRequestor  = setupcfdi.getFieldValue('custrecord_cfdi_testrequestor');
			var sEntity		= setupcfdi.getFieldValue('custrecord_cfdi_entity_testing');
			var sUser 		= setupcfdi.getFieldValue('custrecord_cfdi_testrequestor');
			var sUserName   = setupcfdi.getFieldValue('custrecord_cfdi_username_testing');
		}
		else {
			var sRequestor  = setup.getFieldValue('custrecord_cfdi_requestor');
			var sEntity		= setup.getFieldValue('custrecord_cfdi_entity');
			var sUser 		= setup.getFieldValue('custrecord_cfdi_user');
			var sUserName   = setup.getFieldValue('custrecord_cfdi_username');
		}

		var IdPath          = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_field_path_tc'));
		if(IdPath != null && IdPath != ''){
			var path      = setup.getFieldValue(IdPath) + "\\" + tranid + ".xml";
		}
		else{
			var path      = setup.getFieldValue('custrecord_cfdi_path') + "\\" + tranid + ".xml";
		}
		var xml       = invoice.getFieldValue(IdXMLBody);
		var validaTimbrado  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_valida_timbrado_tc'));

		nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'xml: ' + xml)
		nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'path: ' + path)
		nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'validaTimbrado: ' + validaTimbrado)

		// Validaciones para las addendas -------------

		var custid      = invoice.getFieldValue("entity");
		var tipoAdenda = ( custid ) ? nlapiLookupField( 'customer', custid, 'custentity_nso_cfdi_type_addendum') : 0;
		var getValidaCampos = ( tipoAdenda != 0 ) ? validaCampos( invoice, tipoAdenda ) : null ;
		var bandera = false ;
		var faltantes = [];
		if ( getValidaCampos ) {
			getValidaCampos.getCampos();
			bandera    = getValidaCampos.bandera;
			faltantes = getValidaCampos.faltantes;
		}
		
		nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'bandera: ' + bandera)
		nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'faltantes: ' + JSON.stringify(faltantes))

		if ( bandera  ) {
			var msg = '';
			msg = ( IDIOMA == 'es' ) ? 'Por favor llenar los siguientes campos y guarde la transacción: '+ JSON.stringify( faltantes )  : 'Please fill in the following fields and save the transaction: '+ JSON.stringify( faltantes )  ; 
			nlapiLogExecution('Audit', 'cfdi_aftersubmit', msg);
			// return;
		}

		// Fin validaciones addendas --------------------------------

		if((xml == null || xml == '' )){
			try	{
				if ( (ScriptSuit != null && ScriptSuit != '')&&(ScriptSuitDepl!= null && ScriptSuitDepl != '') ){
					var url         = nlapiResolveURL("SUITELET", ScriptSuit, ScriptSuitDepl, true) + "&invoiceid=" + idinvoice + "&idsetup=" + setup.getId() + "&type=" + nlapiGetRecordType();
					var objResponse = nlapiRequestURL(url, null, null, null);
					bodytext        = (objResponse.getBody());
				}
			}
			catch(e) {
				nlapiLogExecution('Error', 'cfdi_aftersubmit','Error al obtener la respeusta del PAC.' + JSON.stringify(e));
				return;
			}
	
			if( SaveXMLinDisk == 'T' && (bodytext != null && bodytext != '') ){
				var res          = nlCreateTextFileToEInvoice(path, bodytext, newline);
			}

			if( bodytext ){
				var valida = '';
				var docXml       = nsoSendToWS(0, bodytext, 'XML PDF', idinvoice, type, sRequestor, sEntity, sUser, sUserName, invoice);
				if (docXml == null || docXml == '')	{
					nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'Proceso terminado.');
				}else{
					nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'Hubo un error al timbrar su trasacción.');
					nlapiSubmitField(type, idinvoice, 'custbody_cfdi_timbrada', 'F');
				}	
			}
		}

	} catch(err){
		nlapiLogExecution('Debug', 'cfdi_aftersubmit', 'Error: ' + err);
	}

}

function nlGetSetupRecord(subsidiary, location){
	var retval     = null;
	var index      = 0;
	var filters    = new Array();
	var registro   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setup_invoice_tc'));
	var subidrec   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_subsidiary_regsetup_tc'));
	var locidrec   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_location_regsetup_tc'));
	if(subsidiary != null && subsidiary != "") {
		if (subidrec != null && subidrec != ''){
			filters[index]  = new nlobjSearchFilter(subidrec, null, "anyof", subsidiary);
			index += 1;
		}
		else{
			filters[index]  = new nlobjSearchFilter("custrecord_cfdi_subsidiary", null, "anyof", subsidiary);
			index += 1;
		}
	}
	//Búsqueda del registro sólo por subsidiaria: para itemfulfillment
	if(location != null && location != "") {
		if (locidrec != null && locidrec != ''){
			filters[index]  = new nlobjSearchFilter(locidrec, null, "anyof", location);
			index += 1;
		}
		else{
			filters[index]  = new nlobjSearchFilter("custrecord_cfdi_location", null, "anyof", location);
			index += 1;
		}
	}

	if (registro)	{
		var results = nlapiSearchRecord(registro, null, filters, null);
		if(results != null && results.length > 0){
			retval = nlapiLoadRecord(results[0].getRecordType(), results[0].getId()) ;
		}
		else{
			alert( "No se encontro el registro de configuracion de la factura electronica.")//+JSON.stringify(filters))
		}
	}
	return retval;
}

function isNull(value) {
    return (value == null) ? '' : value;
}

function nsoGetTranRecord(id, dynamic){
	var itemrecord = null;

	if (id != null && id != "")
	{
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('internalid', null, 'is', id);
		filters[1] = new nlobjSearchFilter('mainline', null, 'is', "T");		
		var searchresults = nlapiSearchRecord('transaction', null, filters, null);
		
		if (searchresults != null && searchresults.length > 0)
		{
			itemrecord = nlapiLoadRecord(searchresults[0].getRecordType(), searchresults[0].getId(), dynamic == true ? {recordmode:'dynamic'} :  null);
		}
	}
	
	return itemrecord;
}

// Gral_NSOSendXMLtoWS.js ==============================================================================================

function nsoSendToWS(sAccion, sData1, sData2, wId, wtype, sRequestor, sEntity, sUser, sUserName, wrecord, fecha){
	var retval       = true;
	var sTransaction = '';
	var sData3       = "";
	var actualizo 	 = 0;
	var IdXMLBody    = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_cli'));
	var IdPDFBody    = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idpdf_field_cli'));
	if (IdPDFBody == null || IdPDFBody == ''){IdPDFBody = 'custbody_cfdi_pdf'}
	if (IdXMLBody == null || IdXMLBody == ''){IdXMLBody = 'custbody_cfdixml'}
	switch (sAccion){
		case 0:
			sTransaction = 'CONVERT_NATIVE_XML';
			break;
		case 1:
			sTransaction = 'CANCEL_DOCUMENT_2';
			break;
		case 2:
			sTransaction = 'GET_MONTHLY_REPORT';
			break;
		case 3:
			sTransaction = 'GET_DOCUMENT';
			break;
		/*case 4:
			sTransaction = 'VALIDATE_DOCUMENT';
			break;*/
		case 5:
			sTransaction = 'LOOKUP_ISSUED_INTERNAL_ID';
			break;
		case 6:
			sTransaction = 'RETRIEVE_DOCUMENT';
			break;
		case 4:
			sTransaction = 'VALIDATE_CERT';
			break;
		case 8:
			sTransaction = 'VALIDATE_DOCUMENT_EX';
			break;
		case 9:
			sTransaction = 'CONSULT_DOCUMENT';
			break;
	}

	if(sTransaction == 'GET_DOCUMENT' || sTransaction == 'RETRIEVE_DOCUMENT')	{
    	sData3 = 'XML PDF';
	}
	var sData1Encp = '';
	if (sData1){
		var uuid = sData1;
		if(sAccion==1){
			sData1 = '<Dictionary name="StoredXmlSelector">';
    		sData1 += '<Entry k="Store" v="iSSuEd"/>';
    		sData1 += '<Entry k="IssuerCountryCode" v="MX"/>';
    		sData1 += '<Entry k="IssuerTaxId" v="'+sEntity+'"/>'
    		sData1 += '<Entry k="DocumentGUID" v="'+uuid+'"/>'
    		sData1 += '<Entry k="Year" v="'+fecha+'"/>';
			sData1 += '</Dictionary>';
		}
		sData1 = sData1.replace(/\&/g,'&amp;');
		sData1 = sData1.replace(/</g,'&lt;');
		sData1 = sData1.replace(/>/g,'&gt;');
		var sData1Encp = sData1;
	}
	if(sAccion == 9){
		var uuid = sData1;
		nlapiLogExecution('Debug', 'nsosendWS','fecha: '+fecha)
		sData1 = {
			docType:'issued',
			emisor:sEntity,
			folioFiscal:uuid,
			year:fecha.substring(0, 4),
			month:fecha.substring(5,7)
		}
		sData1 = JSON.stringify(sData1)
		nlapiLogExecution('Debug', 'nsosendWS','sData1: '+sData1)
		var sData1Encp = nlapiEncrypt(sData1,'base64');
	}
	var sXml = '';
	sXml += '<?xml version=\"1.0\" encoding=\"utf-8\"?> ';
	sXml += '<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"> ';
	sXml += '<soap:Body> ';
	sXml += '<RequestTransaction xmlns=\"http://www.fact.com.mx/schema/ws\"> ';
	sXml += '<Requestor>' + sRequestor + '</Requestor> ';
	sXml += '<Transaction>' + sTransaction + '</Transaction> ';
	sXml += '<Country>MX</Country> ';
	sXml += '<Entity>' + sEntity + '</Entity> ';
	sXml += '<User>' + sUser + '</User> ';
	sXml += '<UserName>' + sUserName + '</UserName> ';
	sXml += '<Data1>' + sData1Encp + '</Data1> ';
	sXml += '<Data2>' + sData2 + '</Data2> ';
	sXml += '<Data3>' + sData3 + '</Data3> ';
	sXml += '</RequestTransaction> ';
	sXml += '</soap:Body> ';
	sXml += '</soap:Envelope> ';


	var headers = [];
	headers['Content-Type']   = 'text/xml; charset=utf-8';
	headers['Content-Length'] = '"' + sXml.length + '"';
	headers['SOAPAction']     = 'http://www.fact.com.mx/schema/ws/RequestTransaction';

	nlapiLogExecution('Debug', 'nsosendWS','XML : '+sXml)
	try{
		if (sEntity == 'AAA010101AAA'){
			var sURL = 'https://www.mysuitetest.com/mx.com.fact.wsfront/factwsfront.asmx';
		}
		else{
			var sURL = 'https://www.mysuitecfdi.com/mx.com.fact.wsfront/factwsfront.asmx';
		}

		nlapiLogExecution('Debug', 'nsosendWS','Datos : ---'+ (headers))
		var sResponse  = nlapiRequestURL( sURL, sXml, headers);
		nlapiLogExecution('Debug', 'nsosendWS','sResponse : '+sResponse)
		var valueBody  = sResponse.getBody();
		nlapiLogExecution('Debug', 'nsosendWS','value Body : '+ valueBody)
		var xmlResult = null;
	}
	catch (ex)
	{
		nlapiLogExecution('Debug', 'nsosendWS',ex)
		nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE",
				ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
	}
	//----> Valida que el resultado no de mensaje de Error
	if (sAccion != 3){
		retval = nsoValidaResponse(valueBody);
	}
	if(sAccion == 1){
		nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), ['custbody_nso_cfd_fecha_cancelacion'], [nlapiDateToString(new Date())]);
	}
	if(sAccion == 9){
		var oXml      = '';
		var nodeValue = '';
		oXml          = nlapiStringToXML(valueBody);
		nlapiLogExecution('Debug', 'nsosendWS','Respuesta : '+oXml);
		var nodeValue    = nlapiSelectValue(oXml,"//*[name()='ResponseData1']");
		if(nodeValue != null && nodeValue != ""){
			values1 = decode64(nodeValue);
			values1 = JSON.parse(values1);
			//values[0] = ChartDeCode( values[0]);
			nlapiLogExecution('Debug', 'nsosendWS','Cadena*****','---'+(values1))
			var codigostatus = values1['CodigoEstatus'];
			var esCancelable = values1['EsCancelable'];
			var estado = values1['Estado'];
			var estatusCancelacion = values1['EstatusCancelacion'];
			nlapiLogExecution('Debug', 'nsosendWS','Valores*****','---codigostatus'+(codigostatus)+'---esCancelable'+(esCancelable)+'---estado'+(estado)+'---estatusCancelacion'+(estatusCancelacion))

			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), ['custbody_nso_cfdi_status_canc','custbody_nso_cfdi_estado_cancelacion','custbody_nso_cfdi_es_cancelable','custbody_nso_cfdi_estado','custbody_nso_cfdc_response_mysuite'], [2,estatusCancelacion,esCancelable,estado,JSON.stringify(values1)]);

		}else{
			var nodeValue    = nlapiSelectValue(oXml,"//*[name()='Description']");
			if(nodeValue != null && nodeValue != ""){
				//alert(nodeValue);
				nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), ['custbody_nso_cfdi_status_canc','custbody_nso_cfdi_estado_cancelacion','custbody_nso_cfdc_response_mysuite','custbody_nso_cfdi_es_cancelable','custbody_nso_cfdi_estado'], [3,'Cancelado',valueBody,'','']);
				actualizo = 1;
			}

		}

	}

	if(retval == true){
		var check = true;
		try{
			if (wtype == 'customerpayment'){
				var payment = nlapiLoadRecord(wtype, wId);
				payment.setFieldValue('custbody_cfdi_timbrada', 'T');
				nlapiSubmitRecord(payment);//Es necesario para activar el script que genera parcialidades
			}
			else{
				nlapiSubmitField(wtype, wId, 'custbody_cfdi_timbrada', 'T' );
			}
		}
		catch (ex)
		{
			nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE",
					ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
			check = false;
		}

		if (sAccion == 5 ){
			var oXml = '';
			var nodeValue = '';
			oXml = nlapiStringToXML(valueBody);
			var retval    = nlapiSelectValue(oXml,"//*[name()='ResponseData1']");
			if (retval > 0){
				var values = new Array();
				nodeValue = nlapiSelectValue(oXml,"//*[name()='ResponseData2']");
				if(nodeValue != null && nodeValue != ""){
					var valXMl = decode64(nodeValue);
					valXMl = valXMl.replace(/\n/g, "");
					valXMl = nlapiStringToXML(valXMl);
					var uuid = nlapiSelectValue(valXMl,"//*[name()='uuid']");
					var batch  = nlapiSelectValue(valXMl,"//*[name()='batch']");
					var serial = nlapiSelectValue(valXMl,"//*[name()='serial']");
					if ( batch != null && batch != '' && serial != null && batch != ''){
						xmlResult = batch+'-'+serial;
					}
				}
			}
		}

		if(sAccion == 0 || sAccion == 3 || sAccion == 6)
		{
			var oXml      = '';
			var nodeValue = '';
			oXml          = nlapiStringToXML(valueBody);
			var values    = new Array();
			nodeValue     = nlapiSelectValue(oXml,"//*[name()='ResponseData1']");
			
			if(nodeValue != null && nodeValue != ""){
				var Folio = '',
				Serie = '',
				UUID = '';
				values[0] = decode64(nodeValue);
                values[0] = ChartDeCode( values[0]);
				try{
					if (values[0] != null && values[0] != ''){
						var wxml =  nlapiStringToXML(values[0]);
						if (wxml != null && wxml != ''){
							var Comprobante = nlapiSelectNodes(wxml, "//*" );
							var TimbreFiscalDigital = nlapiSelectNodes(wxml,"//*[name()='tfd:TimbreFiscalDigital']" );
							Folio = Comprobante[0].getAttribute('folio')||'';
                            if (Folio == ''){Folio = Comprobante[0].getAttribute('Folio')||'';}
							Serie = Comprobante[0].getAttribute('Serie')||'';
							if(Serie != ''){Serie = Serie+'-';}
							Folio = Serie + Folio;
							UUID = TimbreFiscalDigital[0].getAttribute('UUID')||'';
						}
						nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), [IdXMLBody, "custbody_foliosat", "custbody_uuid"],  [values[0], Folio, UUID ]);
					}
				}
				catch(ex){
					nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE",
				ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
					check = false;
				}
			}//end if(nodeValue != null && nodeValue != ""){

			values[1] = nlapiSelectValue(oXml,"//*[name()='ResponseData3']");

			if (values[1] != null && values[1] != '' && check == true){
				nlapiSubmitField(wtype, wId, IdPDFBody, values[1] );
			}
			if( check == false){
				try{
					wrecord.setFieldValue('custbody_cfdi_timbrada', 'T');
					if(Folio != null && Folio != ''){
						wrecord.setFieldValue("custbody_foliosat", Folio);
					}
					if (UUID != null && UUID != ''){
						wrecord.setFieldValue("custbody_uuid", UUID);
					}
					if (values[0] != null && values[0] != ''){
						wrecord.setFieldValue(IdXMLBody, values[0] );
					}
					if (values[1] != null && values[1] != ''){
						wrecord.setFieldValue(IdPDFBody, values[1] );
					}
					var saverec = nlapiSubmitRecord(wrecord, true, true);
					xmlResult = null;
				}
				catch(ex){
					nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE",
				ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
					alert(ex.getDetails())
					if(values[1] !='' || values[0] !='' || values[0] != null && values[0] != ''){
						xmlResult = null;
					}
				}
			}//if(check == false;){
            if(values[1] =='' || values[0] =='' || values[0] == null || values[0] == ''){alert('error, intente nuevamente.')}
		}//end if(sAccion == 0 || sAccion == 3)

		return xmlResult;
	}
	else{
		nlapiSubmitField('invoice', nlapiGetRecordId(), ['custbody_nso_cfdi_comentario'], [retval]);
        xmlResult = nsoValidaResponseError(valueBody);
		/*if(sAccion == 9 && actualizo = 1){
			xmlResult = 1;
		}*/
		return xmlResult;
   }


}

function nsoValidaResponseError(valueBody){
	var retval = '';
	var oXml = nlapiStringToXML(valueBody);
	retval	 = nlapiSelectValue(oXml,"//*[name()='Data']");
	return retval;
}


function nsoValidaResponse(valueBody){
	var retval  = true;
	var sMsgbox = '';
	var oXml    = nlapiStringToXML(valueBody);
	var sResult  = nlapiSelectValue(oXml,"//*[name()='Result']");
	var sDescrip = nlapiSelectValue(oXml,"//*[name()='Description']");
	var Data	 = nlapiSelectValue(oXml,"//*[name()='Data']");

	if( sResult == 'false' ){
		sMsgbox += 'Descripcion: ' + Data + '\n';
		// alert('Se ha generado el siguiente mensaje: \n' + sMsgbox);
		retval = sMsgbox;
	}
	return retval;
}

//--------------------------------------------------------------------------------------------------------------------
//Function
//Description: convert base64 Encoding/Decoding
//--------------------------------------------------------------------------------------------------------------------

var keyStr = "ABCDEFGHIJKLMNOP" +
               "QRSTUVWXYZabcdef" +
               "ghijklmnopqrstuv" +
               "wxyz0123456789+/" +
               "=";

function encode64(input) {
	input = escape(input);
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	do {
	chr1 = input.charCodeAt(i++);
	chr2 = input.charCodeAt(i++);
	chr3 = input.charCodeAt(i++);

	enc1 = chr1 >> 2;
	enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	enc4 = chr3 & 63;

	if (isNaN(chr2)) {
		enc3 = enc4 = 64;
	} else if (isNaN(chr3)) {
		enc4 = 64;
	}

	output = output +
		keyStr.charAt(enc1) +
		keyStr.charAt(enc2) +
		keyStr.charAt(enc3) +
		keyStr.charAt(enc4);
	chr1 = chr2 = chr3 = "";
	enc1 = enc2 = enc3 = enc4 = "";
	} while (i < input.length);

	return output;
}

  function decode64(input) {
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	var base64test = /[^A-Za-z0-9\+\/\=]/g;
	if (base64test.exec(input)) {
	alert("There were invalid base64 characters in the input text.\n" +
			"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
			"Expect errors in decoding.");
	}
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	do {
	enc1 = keyStr.indexOf(input.charAt(i++));
	enc2 = keyStr.indexOf(input.charAt(i++));
	enc3 = keyStr.indexOf(input.charAt(i++));
	enc4 = keyStr.indexOf(input.charAt(i++));

	chr1 = (enc1 << 2) | (enc2 >> 4);
	chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	chr3 = ((enc3 & 3) << 6) | enc4;

	output = output + String.fromCharCode(chr1);

	if (enc3 != 64) {
		output = output + String.fromCharCode(chr2);
	}
	if (enc4 != 64) {
		output = output + String.fromCharCode(chr3);
	}

	chr1 = chr2 = chr3 = "";
	enc1 = enc2 = enc3 = enc4 = "";

	} while (i < input.length);

	return unescape(output);
}


//===============================================================================================
//it is a private function for internal use in utf8Encode function

/* UTF8 encoding/decoding functions
 * Copyright (c) 2006 by Ali Farhadi.
 * released under the terms of the Gnu Public License.
 * see the GPL for details.
 *
 * Email: ali[at]farhadi[dot]ir
 * Website: http://farhadi.ir/
 */

//an alias of String.fromCharCode
function chr(code){
	return String.fromCharCode(code);
}

//returns utf8 encoded charachter of a unicode value.
//code must be a number indicating the Unicode value.
//returned value is a string between 1 and 4 charachters.
function code2utf(code){
	if (code < 128) return chr(code);
	if (code < 2048) return chr(192+(code>>6)) + chr(128+(code&63));
	if (code < 65536) return chr(224+(code>>12)) + chr(128+((code>>6)&63)) + chr(128+(code&63));
	if (code < 2097152) return chr(240+(code>>18)) + chr(128+((code>>12)&63)) + chr(128+((code>>6)&63)) + chr(128+(code&63));
}

//it is a private function for internal use in utf8Encode function
function _utf8Encode(str){
	var utf8str = new Array();
	for (var i=0; i<str.length; i++) {
		utf8str[i] = code2utf(str.charCodeAt(i));
	}
	return utf8str.join('');
}

//Encodes a unicode string to UTF8 format.
function utf8Encode(str){
	var utf8str = new Array();
	var pos,j = 0;
	var tmpStr = '';

	while ((pos = str.search(/[^\x00-\x7F]/)) != -1) {
		tmpStr = str.match(/([^\x00-\x7F]+[\x00-\x7F]{0,10})+/)[0];
		utf8str[j++] = str.substr(0, pos);
		utf8str[j++] = _utf8Encode(tmpStr);
		str = str.substr(pos + tmpStr.length);
	}

	utf8str[j++] = str;
	return utf8str.join('');
}

//it is a private function for internal use in utf8Decode function
function _utf8Decode(utf8str){
	var str = new Array();
	var code,code2,code3,code4,j = 0;
	for (var i=0; i<utf8str.length; ) {
		code = utf8str.charCodeAt(i++);
		if (code > 127) code2 = utf8str.charCodeAt(i++);
		if (code > 223) code3 = utf8str.charCodeAt(i++);
		if (code > 239) code4 = utf8str.charCodeAt(i++);

		if (code < 128) str[j++]= chr(code);
		else if (code < 224) str[j++] = chr(((code-192)<<6) + (code2-128));
		else if (code < 240) str[j++] = chr(((code-224)<<12) + ((code2-128)<<6) + (code3-128));
		else str[j++] = chr(((code-240)<<18) + ((code2-128)<<12) + ((code3-128)<<6) + (code4-128));
	}
	return str.join('');
}

//Decodes a UTF8 formated string
function utf8Decode(utf8str){
	var str = new Array();
	var pos = 0;
	var tmpStr = '';
	var j=0;
	while ((pos = utf8str.search(/[^\x00-\x7F]/)) != -1) {
		tmpStr = utf8str.match(/([^\x00-\x7F]+[\x00-\x7F]{0,10})+/)[0];
		str[j++]= utf8str.substr(0, pos) + _utf8Decode(tmpStr);
		utf8str = utf8str.substr(pos + tmpStr.length);
	}

	str[j++] = utf8str;
	return str.join('');
}

function _utf8Encode(str){
	var utf8str = new Array();
	for (var i=0; i<str.length; i++) {
		utf8str[i] = code2utf(str.charCodeAt(i));
	}
	return utf8str.join('');
}

function isNull(value) {
    return (value == null) ? '' : value;
}

// GRAL_chartDeCode.js ==================================================

function ChartDeCode(bodytext){
	if(bodytext){
		bodytext = bodytext.replace(/Ã¡/g, "á");
		bodytext = bodytext.replace(/Ã©/g, "é");
		bodytext = bodytext.replace(/Ã­/g, "í");
		bodytext = bodytext.replace(/Ã³/g, "ó");
		bodytext = bodytext.replace(/Ãº/g, "ú");
		bodytext = bodytext.replace(/Ã/g, "Á");
		bodytext = bodytext.replace(/Ã/g, "É");
		bodytext = bodytext.replace(/Ã/g, "Í");
		bodytext = bodytext.replace(/Ã/g, "Ó");
		bodytext = bodytext.replace(/Ã/g, "Ú");
		bodytext = bodytext.replace(/Ã±/g, "ñ");
		bodytext = bodytext.replace(/Ã/g, "Ñ");
		bodytext = bodytext.replace(/Ã¤/g, "ä");
		bodytext = bodytext.replace(/Ã«/g, "ë");
		bodytext = bodytext.replace(/Ã¯/g, "ï");
		bodytext = bodytext.replace(/Ã¶/g, "ö");
		bodytext = bodytext.replace(/Ã¼/g, "ü");
		bodytext = bodytext.replace(/Â¿/g, "¿");
		bodytext = bodytext.replace(/Â©/g, "©");
		bodytext = bodytext.replace(/Â®/g, "®");
		bodytext = bodytext.replace(/Â/g, "™");
		bodytext = bodytext.replace(/ÁÂ/g, "Ø");
		bodytext = bodytext.replace(/Âª/g, "ª");
		bodytext = bodytext.replace(//g, "%");
		bodytext = bodytext.replace(/ÁÂ/g, "Ç");
		bodytext = bodytext.replace(/Â¢/g, "¢");
		bodytext = bodytext.replace(/Â£/g, "£");
		bodytext = bodytext.replace(/Â¤/g, "¤");
		bodytext = bodytext.replace(/Â¥/g, "¥");
		bodytext = bodytext.replace(/Â¦/g, "¦");
		bodytext = bodytext.replace(/Â§/g, "§");
		bodytext = bodytext.replace(/Â¨/g, "¨");
		bodytext = bodytext.replace(/Ã/g, "Ç");
		bodytext = bodytext.replace(/Ã/g, "È");
		bodytext = bodytext.replace(/Ã/g, "Ê");
		bodytext = bodytext.replace(/Ã/g, "Ë");
		bodytext = bodytext.replace(/Ã/g, "Ì");
		bodytext = bodytext.replace(/Ã/g, "Î");
		bodytext = bodytext.replace(/Ã/g, "Ï");
		bodytext = bodytext.replace(/Ã/g, "Ð");
		bodytext = bodytext.replace(/Ã/g, "Ò");
		bodytext = bodytext.replace(/Ã/g, "Ô");
		bodytext = bodytext.replace(/Ã/g, "Õ");
		bodytext = bodytext.replace(/Ã/g, "Ö");
		bodytext = bodytext.replace(/Ã/g, "×");
		bodytext = bodytext.replace(/Ã/g, "Ø");
		bodytext = bodytext.replace(/Ã/g, "Ù");
		bodytext = bodytext.replace(/Ã/g, "Û");
		bodytext = bodytext.replace(/Ã/g, "Ü");
		bodytext = bodytext.replace(/Ã/g, "Ý");
		bodytext = bodytext.replace(/Ã/g, "Þ");
		bodytext = bodytext.replace(/Ã/g, "ß");
		bodytext = bodytext.replace(/Ã /g, "à");
		bodytext = bodytext.replace(/Ã¢/g, "â");
		bodytext = bodytext.replace(/Ã£/g, "ã");
		bodytext = bodytext.replace(/Ã¥/g, "å");
		bodytext = bodytext.replace(/Ã¦/g, "æ");
		bodytext = bodytext.replace(/Ã§/g, "ç");
		bodytext = bodytext.replace(/Ã¨/g, "è");
		bodytext = bodytext.replace(/Ãª/g, "ê");
		bodytext = bodytext.replace(/Ã¬/g, "ì");
		bodytext = bodytext.replace(/Ã®/g, "î");
		bodytext = bodytext.replace(/Ã°/g, "ð");
		bodytext = bodytext.replace(/Ã²/g, "ò");
		bodytext = bodytext.replace(/Ã´/g, "ô");
		bodytext = bodytext.replace(/Ãµ/g, "õ");
		bodytext = bodytext.replace(/Ã·/g, "÷");
		bodytext = bodytext.replace(/Ã¸/g, "ø");
		bodytext = bodytext.replace(/Ã¹/g, "ù");
		bodytext = bodytext.replace(/Ã»/g, "û");
		bodytext = bodytext.replace(/Ã½/g, "ý");
		bodytext = bodytext.replace(/Ã¾/g, "þ");
		bodytext = bodytext.replace(/Ã¿/g, "ÿ");
		bodytext = bodytext.replace(/Å/g, "Œ");
		bodytext = bodytext.replace(/Å/g, "œ");
		bodytext = bodytext.replace(/Å /g, "Š");
		bodytext = bodytext.replace(/Å¡/g, "š");
		bodytext = bodytext.replace(/Â/g, "Ÿ");
		bodytext = bodytext.replace(/Æ/g, "ƒ");
		bodytext = bodytext.replace(/â/g, "–");
		bodytext = bodytext.replace(/â/g, "—");
		bodytext = bodytext.replace(/â/g, "„");
		bodytext = bodytext.replace(/â /g, "†");
		bodytext = bodytext.replace(/â¡/g, "‡");
		bodytext = bodytext.replace(/â¢/g, "…");
		bodytext = bodytext.replace(/â¦/g, "•");
		bodytext = bodytext.replace(/â°/g, "‰");
		bodytext = bodytext.replace(/â¬/g, "€");
		bodytext = bodytext.replace(/Â°/g, "°");
		//bodytext = bodytext.replace(/&amp;/g, "&");
	}
	return bodytext;
}