/*************************************************************  
*  
* ScriptName NSO| proceso facturas notas timbrado|U
* IdScriptName   
* Company NetSoft  
* Author Itzadiana Morales Rivera
 * Edit: Maria Alejandra Blanco Uribe 05/03/2019
* Fecha  13/08/2018   
* Email imorales@netsoft.com  
* Descripción Realiza el timbrado de las notas de crédito de pronto pago.
*************************************************************/

function timbraNotasDeCredito(context  ) {
    try {
		/*var creditMemos = nlapiGetContext().getSetting('SCRIPT', 'custscript_nso_viv_notas_credito').split( ',' );
		for ( var i = 0; i < creditMemos.length; i++ ) {
            generaTimbrado( creditMemos[i], 'creditmemo' );
     
        }*/
        nlapiLogExecution( 'ERROR', 'entrar', context.internalId );
      var resultado= generaTimbrado(context.internalId,'customerpayment')
      return resultado==null?'OK':resultado;
    } catch (e) {
        nlapiLogExecution( 'ERROR', 'timbraNotasDeCredito', JSON.stringify( e ) );
	}
}



function afterSubmit() {

    var viejo= nlapiGetOldRecord();
    var nuevo = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
    var tranid= nuevo.getFieldValue('tranid');
    var unApplied =nuevo.getFieldValue('unapplied');
    var cfd_timbrada=nuevo.getFieldValue('custbody_cfdi_timbrada');
    var metPago_SAT=nuevo.getFieldValue('custbody_cfdi_metpago_sat');
    var xml = nuevo.getFieldValue('custbody_cfdixml');
    var cobrador= nuevo.getFieldValue('custbody_cobrador');
    if(unApplied=='0.00' && cfd_timbrada=='F'  && metPago_SAT!='10' && xml !=null && cobrador=='20513') //    &&tranid==33068) //TIMBRAR  EL DOCUMENTO
    { 
       nlapiLogExecution( 'ERROR', 'Iniciar', tranid ) ;
       var resultado= generaTimbrado(nuevo.id,'customerpayment')
       resultado==null?'OK':resultado;
       resultado==' '?'OK':resultado;
       nlapiLogExecution( 'ERROR', 'resultado', resultado ) ;
    }
    else nlapiLogExecution( 'ERROR', 'No timbrar', 'Con aplicar o timbrada y/o metPago'+tranid ) ;
    
    

};

function generaTimbrado( id_transaction, type_transaction ) {
  
  //  nlapiLogExecution( 'ERROR', 'Inicio', 'si' ) ;
    var setupcfdi       = nlapiLoadRecord( 'customrecord_setup_cfdi', 1 );
    
    var oneworld        = setupcfdi.getFieldValue( 'custrecord_cfdi_oneworld' );
    var billforlocation = setupcfdi.getFieldValue( 'custrecord_cfdi_location_testing' );
  //  nlapiLogExecution( 'ERROR', 'oneworld', oneworld ) ;
 //   nlapiLogExecution( 'ERROR', 'billforlocation', billforlocation ) ;
    var testing         = setupcfdi.getFieldValue( 'custrecord_cfdi_testing' );
    var folder          = setupcfdi.getFieldValue( 'custrecord_cfdi_pdf_files' )||'';
    var setup           = null;
    var context         = 'PRODUCTION';
    var transaction     = nlapiLoadRecord( 'customerpayment', id_transaction );
  //  nlapiLogExecution( 'ERROR', 'idPAgo',transaction.getFieldValue( 'tranid' ) ) ;
    var tranid          = transaction.getFieldValue( 'tranid' );
    var subsidiary      = transaction.getFieldValue( 'subsidiary' );
    var location        = transaction.getFieldValue( 'location' );
    var ScriptSuit      = 'customscript_cfdi';
    var ScriptSuitDepl  = 'customdeploy_cfdi';
  //  nlapiLogExecution( 'ERROR', 'AntesOnewORD','SI') ;
    if ( oneworld == 'T' ) {
        if ( billforlocation == 'T' ) {
           // setup = nlGetSetupRecord( subsidiary, location );
          setup= nlapiLoadRecord('customrecord_cfdisetup', '2');
    //      nlapiLogExecution( 'ERROR', 'SETUP', 'si' ) ;
        }
        else {
            setup = nlGetSetupRecord( subsidiary, null );
        }
    }
    else {
        if( billforlocation == 'T' ) {
            setup = nlGetSetupRecord( null, location );
        }
        else {
            setup = nlGetSetupRecord( null, null );
        }
    }
    if ( context != 'PRODUCTION' || testing == 'T' ) {
        var sRequestor  = setupcfdi.getFieldValue( 'custrecord_cfdi_testrequestor' );
        var sEntity     = setupcfdi.getFieldValue( 'custrecord_cfdi_entity_testing' );
        var sUser       = setupcfdi.getFieldValue( 'custrecord_cfdi_testrequestor' );
        var sUserName   = setupcfdi.getFieldValue( 'custrecord_cfdi_username_testing' );
    }
    else {
        var sRequestor  = setup.getFieldValue( 'custrecord_cfdi_requestor' );
        var sEntity     = setup.getFieldValue( 'custrecord_cfdi_entity' );
        var sUser       = setup.getFieldValue( 'custrecord_cfdi_user' );
        var sUserName   = setup.getFieldValue( 'custrecord_cfdi_username' );
    }

    var IdPath          = '';
    if ( IdPath != null && IdPath != '' ) {
        var path      = setup.getFieldValue( IdPath ) + "\\" + tranid + ".xml";
    }
    else{
        var path      = setup.getFieldValue( 'custrecord_cfdi_path' ) + "\\" + tranid + ".xml";
    }
    var xml             =transaction.getFieldValue('custbody_cfdixml'); //nlapiGetFieldValue( 'custbody_cfdixml' );
    var validaTimbrado  = 'F';
//    nlapiLogExecution( 'ERROR', 'VAR XML',xml) ;
    if ( (xml == null || xml == '' ) ) {
        
            if ( ( ScriptSuit != null && ScriptSuit != '') && ( ScriptSuitDepl!= null && ScriptSuitDepl != '' ) ) {
    //            nlapiLogExecution( 'ERROR', 'mysuite', 'si' ) ;
                var url         = 'https://forms.na3.netsuite.com/app/site/hosting/scriptlet.nl?script=24&deploy=1&compid=5327814&h=c75e4ab15afca3bb36c7' + "&invoiceid=" + id_transaction + "&idsetup=" + setup.getId() + "&type=" + 'customerpayment';
                var objResponse = nlapiRequestURL( url, null, null, null );
                bodytext        = ( objResponse.getBody() );
              //  nlapiLogExecution( 'ERROR', 'xml', bodytext ) ;
                var docXml       = nsoSendToWS( 0, bodytext, 'XML PDF', id_transaction, type_transaction, sRequestor, sEntity, sUser, sUserName, transaction);
               // nlapiLogExecution( 'ERROR', 'docXml', docXml ) ;
                var bandera_timbrado = false;
                var num_linea   = 0;
                return docXml;               
              
            }
        
        }
   

    return bandera_timbrado;

}