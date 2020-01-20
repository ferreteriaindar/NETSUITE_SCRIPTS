//=================================================================================================================================
// Script File   : GRAL_NSOCFDi_cliente.js
// Script Type   : Client Event
// Description   :
// Author        : Ivan Gonzalez - Netsoft
// Date			 : 29-04-2015

//=================================================================================================================================


var context = nlapiGetContext();
var IDIOMA  = context.getPreference( 'LANGUAGE' ).split( '_' )[ 0 ];


//--> On Init-Page
///////////////////////////////////////////////////////////
// Set API Governance to MAX (HACK)
function setApiToMax() {
	try{
		nsContextObj = new nlobjContext();
		console.log('API restarted');
	}catch(e){ console.log(e); }
}
setInterval(setApiToMax, 60000);//1 min
//
/////////////////////////////////////////////////////////
function nsoDoNothing( type ){
  
     	nlapiLogExecution('DEBUG', 'type', type) ;


	if ( type == 'create' || type == 'edit' || type == 'copy'   ) {

		try{

			var cliente  = nlapiGetFieldValue( 'entity' );
			var tipoAdenda = ( cliente ) ? nlapiLookupField( 'customer', cliente, 'custentity_nso_cfdi_type_addendum') : 0;
			ocultaCamnpos( tipoAdenda );
		   
		}catch(e){
	    	nlapiLogExecution('DEBUG', 'ERROR', e) ;
		}
	}

	if ( type == 'copy'  ){

		nlapiSetFieldValue( 'custbody_nsme_cfdi_pedido_ahmsa', '' );
		nlapiSetFieldValue( 'custbody_uuid', '' );
	}
  
}

function ocultarcCamposFieldChanged(type , name, linenum ){

	if( name == 'entity' ) {

		var cliente  = nlapiGetFieldValue( 'entity' );
		var tipoAdenda = ( cliente ) ? nlapiLookupField( 'customer', cliente, 'custentity_nso_cfdi_type_addendum') : 0;
		ocultaCamnpos( tipoAdenda );

	}

}

function ocultaCamnpos( tipoAdenda ) { 

	 var aux = '_fs_lbl_uir_label';
	 var todosLosCampos = obtenerCampos();

    if ( tipoAdenda ) {

	    var camposAddenda = obtenerCampos( tipoAdenda );

	    for ( var i = 0 ; i < todosLosCampos.length ; i ++ ) {

	    	if ( camposAddenda.indexOf( todosLosCampos[ i ] ) == -1 ) {

	    		jQuery('#'+todosLosCampos[i]+aux).parent().parent().hide();
	    	} else {

	    		jQuery('#'+todosLosCampos[i]+aux).parent().parent().show();

	    	}
	    }
    } 
}

function obtenerCampos( tipoAdenda ) {

	var  columns  = [], filters = [], searchresults = [], allResults = [];

	columns     = [ 'custrecord_nso_cfdi_tad_mapped_fieldid' ].map( function( c ) {
		return new nlobjSearchColumn( c );
	} );

	if ( tipoAdenda ){

		filters.push( new nlobjSearchFilter( 'custrecord_nso_cfdi_tad_link', null, 'anyof', tipoAdenda ) );
	}

	var res       = nlapiCreateSearch( 'customrecord_nso_cfdi_tipo_adenda_d', filters, columns );
	var resultset =  res.runSearch();

	for ( var j = 0; resultset != null && j < 10; j++ ) {
		
		var ini = parseFloat( 1000 * j );
		var end = parseFloat( ini ) + 1000;
		var results = resultset.getResults( ini, end );

		if ( results ) {
			searchresults = searchresults.concat( results );
		} else {
			break;
		}
	}

	for ( var i = 0; searchresults && i < searchresults.length; i++ ) {

		allResults.push( searchresults[ i ].getValue( 'custrecord_nso_cfdi_tad_mapped_fieldid' ) );
	}
	return allResults;
}


function click_cfdi()
{
	var timbrada        = nlapiGetFieldValue('custbody_cfdi_timbrada')||'F';
	var cartaporte      = nlapiGetFieldValue('custbody_cfdi_carta_porte')||'F';
	var idinvoice       = nlapiGetFieldValue("id");
	var wtype           = nlapiGetRecordType();
	var invoice         = nsoGetTranRecord(idinvoice);
	var tranid          = invoice.getFieldValue("tranid");
	var subsidiary      = invoice.getFieldValue("subsidiary");
	var location        = invoice.getFieldValue("location");
	var IdSetupCFDi     = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_cli'));
	var IdSetupCFDiNum  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_num'));
	var setupcfdi       = nlapiLoadRecord(IdSetupCFDi, IdSetupCFDiNum);
	var oneworld        = setupcfdi.getFieldValue('custrecord_cfdi_oneworld');
	var billforlocation = setupcfdi.getFieldValue('custrecord_cfdi_location_testing');
	var testing         = setupcfdi.getFieldValue('custrecord_cfdi_testing');
	var folder          = setupcfdi.getFieldValue('custrecord_cfdi_pdf_files')||'';
	var setup           = null;
	var ScriptSuit      = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_script_suitelet_cfdi'));
	var ScriptSuitDepl  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_script_suitelet_dep'));
	var SaveXMLinDisk   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_save_xml'));
	var IdXMLBody       = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_cli'));
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
	var IdPath          = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_field_path'));
	if(IdPath != null && IdPath != ''){
		var path      = setup.getFieldValue(IdPath) + "\\" + tranid + ".xml";
	}
	else{
		var path      = setup.getFieldValue('custrecord_cfdi_path') + "\\" + tranid + ".xml";
	}
	var xml       = invoice.getFieldValue(IdXMLBody);
	var validaTimbrado  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_valida_timbrado'));
  
  // valida campos para addendas 

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

	if ( bandera ) {

			( IDIOMA == 'es' ) ? alert( 'Por favor llenar los siguientes campos y guardar la transacción: '+ JSON.stringify( faltantes ) ) : alert( 'Please fill in the following fields and save the transaction: '+ JSON.stringify( faltantes ) ) ; 
			return;
	}

	//

	if((xml == null || xml == '' )){
		try	{
			if ( (ScriptSuit != null && ScriptSuit != '')&&(ScriptSuitDepl!= null && ScriptSuitDepl != '') ){
				var url         = nlapiResolveURL("SUITELET", ScriptSuit, ScriptSuitDepl, null) + "&invoiceid=" + idinvoice + "&idsetup=" + setup.getId() + "&type=" + nlapiGetRecordType();
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
		var res          = nlCreateTextFileToEInvoice(path, bodytext, newline);}
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
				//var docXml       = nsoSendnsoSendToWSRecuperaXMLPDFToWS(3, folio, serie, id, wtype, sRequestor, sEntity, sUser, sUserName, invoice);
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
}

function click_cfdi_recupera(){
	var idinvoice       = nlapiGetFieldValue("id");
	var cartaporte      = nlapiGetFieldValue('custbody_cfdi_carta_porte')||'F';
	var wtype           = nlapiGetRecordType();
	var invoice         = nsoGetTranRecord(idinvoice);
	var tranid          = invoice.getFieldValue("tranid");
	var subsidiary      = invoice.getFieldValue("subsidiary");
	var location        = invoice.getFieldValue("location");
	var IdSetupCFDi     = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_cli'));
	var IdSetupCFDiNum  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_num'));
	var setupcfdi       = nlapiLoadRecord(IdSetupCFDi, IdSetupCFDiNum);
	var oneworld        = setupcfdi.getFieldValue('custrecord_cfdi_oneworld');
	var billforlocation = setupcfdi.getFieldValue('custrecord_cfdi_location_testing');
	var testing         = setupcfdi.getFieldValue('custrecord_cfdi_testing');
	var folder          = setupcfdi.getFieldValue('custrecord_cfdi_pdf_files')||'';
	var setup           = null;
	var IdXMLBody       = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_cli'));
	var bodytext        = "";
	var context         = nlapiGetContext().getEnvironment();
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

	var xml             = invoice.getFieldValue(IdXMLBody)||'';
	var transaccion     = getTipoDocumento(wtype);
	if(cartaporte == 'T'){tipodedocumento = 'TRASLADO'}
	var tranid          = invoice.getFieldValue('tranid');
	var valida          = '';
	if (xml != ''){
		var oXml      = '';
		var nodeValue = '';
		oXml          = nlapiStringToXML(xml);
		var Comprobante = nlapiSelectNodes(oXml,"//*[name()='cfdi:Comprobante']");
		var Serie =  Comprobante[0].getAttribute('serie')||'';
		if (Serie == ''){Serie = Comprobante[0].getAttribute('Serie')||'';}
		var Folio = Comprobante[0].getAttribute('folio')||'';
		if (Folio == ''){Folio = Comprobante[0].getAttribute('Folio')||'';}
		if (Folio != ''){
			alert('Folio ya generado anteriormente en el SAT: ' + Serie + Folio);
			valida = Serie + '-' + Folio;
		}
	}
	else{
		var doc             = transaccion +': ' + tranid;
		var valida          = nsoSendToWSRecupera(5, doc, '', idinvoice, wtype, sRequestor, sEntity, sUser, sUserName, '', folder)||'';
		if (valida != ''){
			alert('Folio ya generado anteriormente en el SAT: ' + valida);
		}
	}
	if (valida != ''){
		valida = valida.split('-');
		var folio        = valida[0];
		var serie        = valida[1];
		var wname        = transaccion + ': ' + tranid
		var docXml       = nsoSendToWSRecuperaXMLPDF(3, '', '', idinvoice, wtype, sRequestor, sEntity, sUser, sUserName, folio, serie, folder, wname, invoice);
		window.location  = window.location;
		if (docXml == null || docXml == '')	{
			alert('Proceso Terminado, se recuperaron las cadenas con éxito, guarde la transaccion para generar los archivos');
			window.location = window.location;
		}
		else{
			alert('Sin coincidencia para recuperacion de archivos.')
			window.location = window.location;
		}
	}//if (valida != ''){
}

function click_validaCancel(){
	//alert('Entre a cliente')
	var wtype              = nlapiGetRecordType();
	var idinvoice          = nlapiGetFieldValue('id');
	var invoice            = nsoGetTranRecord(idinvoice);
	var subsidiary 		   = invoice.getFieldValue("subsidiary");
	var location           = invoice.getFieldValue("location");
	var IdBodyCancelField  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_cancel_field'));
	var IdXMLBody          = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_cli'));
	var IdSetupCFDi        = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_cli'));
	var IdSetupCFDiNum     = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_num'));
	var setupcfdi          = nlapiLoadRecord(IdSetupCFDi, IdSetupCFDiNum);
	var oneworld           = setupcfdi.getFieldValue('custrecord_cfdi_oneworld');
	var billforlocation    = setupcfdi.getFieldValue('custrecord_cfdi_location_testing');
	var testing            = setupcfdi.getFieldValue('custrecord_cfdi_testing');
	var setup              = null;
	var t_xml 			   = invoice.getFieldValue(IdXMLBody);
		t_xml 			   = t_xml.replace(/&/g, '&amp;');
	var wxml               = nlapiStringToXML(t_xml);
	if (wxml){
	    var Comprobante     = nlapiSelectNodes(wxml, "//*" );
		var Folio           = (Comprobante[0].getAttribute('folio'))||'';
		if (Folio == '')    {Folio = Comprobante[0].getAttribute('Folio')||'';}
		var Serie           = (Comprobante[0].getAttribute('serie'))||'';
		if (Serie == '')    {Serie = Comprobante[0].getAttribute('Serie')||'';}
		var Complemento     = nlapiSelectNodes(wxml ,"//*[name()='tfd:TimbreFiscalDigital']" );
		var UUID            = (Complemento[0].getAttribute('UUID'))||'';
		var Fecha           = (Complemento[0].getAttribute('FechaTimbrado'))||'';
			//Fecha 			= Fecha.substring(0, 4);
	}
	if(oneworld == 'T' ) {
		if(billforlocation == 'T') {
			setup = nlGetSetupRecord(subsidiary, location);
		}
		else {
			setup = nlGetSetupRecord(subsidiary, null);
		}
	}
	else {
		if(billforlocation == 'T') {
			setup = nlGetSetupRecord(null, location);
		}
		else {
			setup = nlGetSetupRecord(null , null);
		}
	}

	if(testing == 'T')	{
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


		try{
			if (UUID != null && UUID != ''){
				Serie = UUID;
				Folio = '';
			}
			var lResult = nsoSendToWS(9, Serie, Folio , idinvoice, wtype, sRequestor, sEntity, sUser, sUserName, null, Fecha);
			if (lResult == null || lResult == ''){
				//invoice.setFieldValue(IdBodyCancelField, 'T');
				//nlapiSubmitRecord(invoice, true, true);
				alert('Proceso de Estatus CFDi Terminado.');
				window.location = window.location;
			}
		}
		catch(e){
			alert(e.description);
			return;
		}

}


//--> On Click-Button Cancel Button
function click_cancelcfd()
{
	var wtype              = nlapiGetRecordType();
	var idinvoice          = nlapiGetFieldValue('id');
	var invoice            = nsoGetTranRecord(idinvoice);
	var subsidiary 		   = invoice.getFieldValue("subsidiary");
	var location           = invoice.getFieldValue("location");
	var IdBodyCancelField  = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_cancel_field'));
	var IdXMLBody          = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_cli'));
	var IdSetupCFDi        = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_cli'));
	var IdSetupCFDiNum     = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setupcfdi_num'));
	var setupcfdi          = nlapiLoadRecord(IdSetupCFDi, IdSetupCFDiNum);
	var oneworld           = setupcfdi.getFieldValue('custrecord_cfdi_oneworld');
	var billforlocation    = setupcfdi.getFieldValue('custrecord_cfdi_location_testing');
	var testing            = setupcfdi.getFieldValue('custrecord_cfdi_testing');
	var setup              = null;
	var t_xml 			   = invoice.getFieldValue(IdXMLBody);
		t_xml 			   = t_xml.replace(/&/g, '&amp;');
	var wxml               = nlapiStringToXML(t_xml);
	if (wxml){
	    var Comprobante     = nlapiSelectNodes(wxml, "//*" );
		var Folio           = (Comprobante[0].getAttribute('folio'))||'';
		if (Folio == '')    {Folio = Comprobante[0].getAttribute('Folio')||'';}
		var Serie           = (Comprobante[0].getAttribute('serie'))||'';
		if (Serie == '')    {Serie = Comprobante[0].getAttribute('Serie')||'';}
		var Complemento     = nlapiSelectNodes(wxml ,"//*[name()='tfd:TimbreFiscalDigital']" );
		var UUID            = (Complemento[0].getAttribute('UUID'))||'';
		var Fecha           = (Complemento[0].getAttribute('FechaTimbrado'))||'';
			Fecha 			= Fecha.substring(0, 4);
	}
	if(oneworld == 'T' ) {
		if(billforlocation == 'T') {
			setup = nlGetSetupRecord(subsidiary, location);
		}
		else {
			setup = nlGetSetupRecord(subsidiary, null);
		}
	}
	else {
		if(billforlocation == 'T') {
			setup = nlGetSetupRecord(null, location);
		}
		else {
			setup = nlGetSetupRecord(null , null);
		}
	}

	if(testing == 'T')	{
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


	if(confirm('Esta por Cancelar la Factura con Folio Sat : ' + Serie + Folio + ', Desea Continuar?') ==  true){
		try{
			if (UUID != null && UUID != ''){
				Serie = UUID;
				Folio = '';
			}
			var lResult = nsoSendToWS(1, Serie, Folio , idinvoice, wtype, sRequestor, sEntity, sUser, sUserName, null, Fecha);
			if (lResult == null || lResult == ''){
				invoice.setFieldValue(IdBodyCancelField, 'T');
				nlapiSubmitRecord(invoice, true, true);
				alert('Proceso de Cancelacion del CFDi Terminado.');
				window.location = window.location;
			}
		}
		catch(e){
			alert(e.description);
			return;
		}
	}
}


function nlCreateTextFileToEInvoice(path, text, newline)
{
	var retval = false;

	try
	{
		var objFSO = new NSObjFSO();
		var folder = objFSO.getParentFolderName(path);
		var file   = objFSO.getFileName(path);

		if(objFSO.folderExists(folder)){
			if(file != ''){
				nlCreateTextFile(path, text, newline);
				retval = true;
			}
			else{
				alert('Nombre de archivo no especificado!');
			}
		}
		else{
			alert('La ruta especificada no existe!');
		}
	}
	catch(err){
		alert('Error: ' + err.number + ' - ' + err.description);
		var txt = text.replace(/\[new line\]/g, String.fromCharCode(13));
		alert(txt);
	}

	return retval;
}


function nlCreateTextFile(path, text, newline)
{
	var fso, f, ts, s;
	var arr_text = text.split(newline);
	fso = new ActiveXObject("Scripting.FileSystemObject");
	fso.createTextFile(path, true);
	f = fso.GetFile(path);
	ts = f.OpenAsTextStream(ForWriting, TristateUseDefault);
	ts.Write(nsoReplace(text, newline, "\r\n"));
	ts.Close( );
	fso = null;
}

function nlGetSetupRecord(subsidiary, location)
{
	var retval     = null;
	var index      = 0;
	var filters    = new Array();
	var registro   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_setup_invoice'));
	var subidrec   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_subsidiary_regsetup'));
	var locidrec   = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_id_location_regsetup'));
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



function getTipoDocumento(recordtype) {
    var retval = '';

    switch (recordtype) {

        case 'creditmemo':
            retval = 'NOTA_DE_CREDITO'
            break;
		case  'invoice':
			retval = 'FACTURA';
			break;
		case  'customerpayment':
			retval = 'PAGO';
			break;
		case  'itemfulfillment':
			retval = 'TRASLADO'
			break;
    }

    return retval;
}


function nsoSendToWSRecupera(sAccion, sData1, sData2, wId, wtype, sRequestor, sEntity, sUser, sUserName, wrecord, folder){
	var retval       = true;
	var sTransaction = '';
	var sData3       = "";
	var arrayIds     = new Array();
	var count        = 0;
	var idxmlfield   = nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_sch')||'';
	switch (sAccion){
		case 5:
			sTransaction = 'LOOKUP_ISSUED_INTERNAL_ID';
			break;
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
	sXml += '<Data1>' + sData1 + '</Data1> ';
	sXml += '<Data2>' + sData2 + '</Data2> ';
	sXml += '<Data3>' + sData3 + '</Data3> ';
	sXml += '</RequestTransaction> ';
	sXml += '</soap:Body> ';
	sXml += '</soap:Envelope> ';


	var headers = new Array();
	headers['Content-Type']   = 'text/xml; charset=utf-8';
	headers['Content-Length'] = '"' + sXml.length + '"';
	headers['SOAPAction']     = 'http://www.fact.com.mx/schema/ws/RequestTransaction';



	if (sEntity == 'AAA010101AAA'){
		var sURL = 'https://www.mysuitetest.com/mx.com.fact.wsfront/factwsfront.asmx';
	}
	else{
		var sURL = 'https://www.mysuitecfdi.com/mx.com.fact.wsfront/factwsfront.asmx';
	}

	var sResponse = nlapiRequestURL( sURL, sXml, headers);
	var valueBody = sResponse.getBody()||'';
	var xmlResult = null;

	if(valueBody){
		var retval = nsoValidaResponse(valueBody);
	}else{retval = false;}

	if(retval == true){

		var oXml      = '';
		var nodeValue = '';
		oXml          = nlapiStringToXML(valueBody)||'';
		var nodexml   = '';
		if(oXml){
			var values    = new Array();
			nodeValue     = nlapiSelectValue(oXml,"//*[name()='ResponseData1']")||'0';
			var nodexml   = nlapiSelectValue(oXml,"//*[name()='ResponseData2']")||'';
		}

		if(nodexml != null && nodexml != ""){
			nlapiLogExecution('DEBUG','sData1',sData1);
			arrayIds[count] = sData1;
			count += 1;
			values[0] = decode64(nodexml);
			try{
				if (values[0] != null && values[0] != ''){
					var arraynodes = values[0].replace(/\,/g, "");
					var arraynodes = values[0].replace(/\n/g, "");
					var wxml       = nlapiStringToXML(arraynodes);
					var UUID  	   = nlapiSelectValue(wxml,"//*[name()='uuid']");
					var check      = true;
					var folio      = nlapiSelectValue(wxml,"//*[name()='batch']")||'';
					var serial     = nlapiSelectValue(wxml,"//*[name()='serial']")||'';
					xmlResult      = folio + '-'+ serial ;
					if (UUID != null && UUID != ''){
						try{
							nlapiSubmitField(wtype, wId, 'custbody_uuid',  UUID );
							if(idxmlfield != ''){
								nlapiSubmitField(wtype, wId, idxmlfield,  wxml );
							}
                       }
						catch (ex){
							nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE",
									ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
							check = false;
						}
					}//if (UUID != null && UUID != ''){
					if( check == false){
						wrecord.setFieldValue(idxmlfield,  wxml);
						wrecord.setFieldValue('custbody_uuid',  UUID );
						//var saverec = nlapiSubmitRecord(wrecord, true, true);
					}
				}//if (values[0] != null && values[0] != ''){
			}
			catch(ex){
				nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE",
			ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
			}
		}//end if(nodeValue != null && nodeValue != ""){
		return xmlResult;
	}
	else{
		xmlResult = nsoValidaResponseError(valueBody);
		return xmlResult;
	}
}

function nsoSendToWSRecuperaXMLPDF(sAccion, sData1, sData2, wId, wtype, sRequestor, sEntity, sUser, sUserName, folio, serial, folder, name, wrecord){
	var retval       = false;
	var sTransaction = '';
	var sData3       = "";
	var bandera      = true;
	var fileXML      = '';
	var filePDF      = '';
	var IdXMLBody    = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxml_field_cli'));
	var IdPDFBody    = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idpdf_field_cli'));
	var IdXMLFile    = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idxmlfile_cli'));
	var IdPDFFile    = isNull(nlapiGetContext().getSetting('SCRIPT', 'custscript_idpdffile_cli'));
	if (IdPDFBody == null || IdPDFBody == ''){IdPDFBody = 'custbody_cfdi_pdf'}
	if (IdXMLBody == null || IdXMLBody == ''){IdXMLBody = 'custbody_cfdixml'}
	if (IdXMLFile == null || IdXMLFile == ''){IdXMLFile = 'custbody_refxml'}
	if (IdPDFFile == null || IdPDFFile == ''){IdPDFFile = 'custbody_refpdf'}
	switch (sAccion){
		case 0:
			sTransaction = 'CONVERT_NATIVE_XML';
			break;
		case 1:
			sTransaction = 'CANCEL_XML';
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
	}

	if(sTransaction == 'GET_DOCUMENT' )	{
    	sData3 = 'XML PDF';
	}


	var sXml = '';
	sXml += '<?xml version=\"1.0\" encoding=\"utf-8\"?> ';
	sXml += '<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"> ';
	sXml += '<soap:Body> ';
	sXml += '<RequestTransaction xmlns=\"http://www.fact.com.mx/schema/ws\"> ';
	sXml += '<Requestor>' + sRequestor + '</Requestor> ';
	sXml += '<Transaction> ' + sTransaction + '</Transaction> ';
	sXml += '<Country>MX</Country> ';
	sXml += '<Entity>' + sEntity + '</Entity> ';
	sXml += '<User>' + sUser + '</User> ';
	sXml += '<UserName>' + sUserName + '</UserName> ';
	sXml += '<Data1>' + folio + '</Data1> ';
	sXml += '<Data2>' + serial + '</Data2> ';
	sXml += '<Data3>' + sData3 + '</Data3> ';
	sXml += '</RequestTransaction> ';
	sXml += '</soap:Body> ';
	sXml += '</soap:Envelope> ';


	var headers = new Array();
	headers['Content-Type']   = 'text/xml; charset=utf-8';
	headers['Content-Length'] = '"' + sXml.length + '"';
	headers['SOAPAction']     = 'http://www.fact.com.mx/schema/ws/RequestTransaction';

	if (sEntity == 'AAA010101AAA'){
		var sURL = 'https://www.mysuitetest.com/mx.com.fact.wsfront/factwsfront.asmx';
	}
	else{
		var sURL = 'https://www.mysuitecfdi.com/mx.com.fact.wsfront/factwsfront.asmx';
	}
    nlapiLogExecution('ERROR','sURL',sURL);
    nlapiLogExecution('ERROR','sXml',sXml);
    nlapiLogExecution('ERROR','headers',headers);
	var sResponse = nlapiRequestURL( sURL, sXml, headers);
	var valueBody = sResponse.getBody();
	var xmlResult = null;

	//----> Valida que el resultado no de mensaje de Error
	if (valueBody != ''){
		retval = nsoValidaResponse(valueBody);
	}
	if(retval == true){
		var oXml       = '';
		var finalfolio = '';
		var UUID       = '';
		oXml           = nlapiStringToXML(valueBody);
		var values     = new Array();
		var nodeValue  = nlapiSelectValue(oXml,"//*[name()='ResponseData1']")||'';
		var cadenaPDF  = nlapiSelectValue(oXml,"//*[name()='ResponseData3']")||'';
		var cadenaXML  = '';

		if(nodeValue != null && nodeValue != ""){
			values[0] = decode64(nodeValue);
			values[0] = ChartDeCode(values[0]);

			try{
				if (values[0] != null && values[0] != ''){
					var wxml  =  nlapiStringToXML(values[0]);
					cadenaXML = values[0];
					if (wxml != null && wxml != ''){
						var Comprobante = nlapiSelectNodes(wxml, "//*" );
						var TimbreFiscalDigital = nlapiSelectNodes(wxml,"//*[name()='tfd:TimbreFiscalDigital']" );
						var Folio = Comprobante[0].getAttribute('folio')||'';
						if (Folio == ''){Folio = Comprobante[0].getAttribute('Folio')||'';}
						var Serie = Comprobante[0].getAttribute('serie')||'';
						if (Serie == ''){Serie = Comprobante[0].getAttribute('Serie')||'';}
						var UUID = TimbreFiscalDigital[0].getAttribute('UUID')||'';
						var finalfolio = Serie+Folio;
					}//if (wxml != null && wxml != ''){
				}//if (values[0] != null && values[0] != ''){
			}
			catch(ex){
				nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE",
			ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
			}
		}//end if(nodeValue != null && nodeValue != ""){
		try{
			//nlapiSubmitField(wtype, wId, [IdXMLBody, IdPDFBody, "custbody_foliosat", "custbody_uuid"], [cadenaXML, cadenaPDF, finalfolio, UUID] );
			nlapiSubmitField(wtype, wId, [IdXMLBody, IdPDFBody, "custbody_foliosat", "custbody_uuid", 'custbody_nso_cfdi_folio_factura_mysuit'], [cadenaXML, cadenaPDF, finalfolio, UUID, 'SAT' + finalfolio] );
		}
		catch(ex){
			nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE", ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
			bandera = false;
		}

		if(bandera == false){
			try{
				if(Folio != null && Folio != ''){
					wrecord.setFieldValue("custbody_foliosat", finalfolio);
					//wrecord.setFieldValue("custbody_nso_cfdi_folio_factura_mysuit", 'SAT' + finalfolio);
				}
				if (UUID != null && UUID != ''){
					wrecord.setFieldValue("custbody_uuid", UUID);
				}
				if (values[0] != null && values[0] != ''){
					wrecord.setFieldValue(IdXMLBody, cadenaXML );
				}
				if (cadenaPDF != null && cadenaPDF != ''){
					wrecord.setFieldValue(IdPDFBody, cadenaPDF );
				}
				var saverec = nlapiSubmitRecord(wrecord, true, true);

			}
			catch(ex){
				nlapiLogExecution('ERROR', ex instanceof nlobjError ? ex.getCode() : "CUSTOM_ERROR_CODE", ex instanceof nlobjError ? ex.getDetails() : 'JavaScript Error: ' + (ex.message != null ? ex.message : ex));
				alert('Salve la transaccion para que se generen los archivos.')
			}
		}//if(bandera == false){

	}
	else{
		xmlResult = nsoValidaResponseError(valueBody);
		return xmlResult;
	}
}
