function FE_SF_ST(request, response, dataExternal) {
    var Base64 = new MainBase64();
    var data = null;
    if ( request ) {
        data = returnBlank(request.getParameter('data'));
    } else {
        data = dataExternal;
    }

//	var data			 	= returnBlank(request.getParameter('data'));
    data = Base64.decode(data);
    data = JSON.parse(data);
  nlapiLogExecution('DEBUG', 'data', data);
    var recordType = returnBlank(data.recordType);
    var recordId = returnBlank(data.recordId);
    var titleForm = returnBlank(data.titleForm);
    var _fe_sf_masiva_id = returnBlank(data._fe_sf_masiva_id);
    var _enviar_email_fe_el = returnFalse(data._enviar_email_fe_el);
    var _fe_portal_cliente = returnFalse(data._fe_portal_cliente);
    var context = nlapiGetContext();
    try {
        validatedBundle(207479);
        var filters = [];
        filters.push(new nlobjSearchFilter('internalid', null, 'is', recordId));
        var results_fe_sf_st = returnBlank(nlapiSearchRecord(recordType, 'customsearch_fe_sf_st_33', filters, null));
        if ( results_fe_sf_st != '' ) {
            var internalid = recordId;
            var trandate = returnBlank(results_fe_sf_st[0].getValue('trandate'));
            var entity = returnBlank(results_fe_sf_st[0].getValue('entity'));
            var customer = returnBlank(results_fe_sf_st[0].getText('entity'));
            var createdfrom = returnBlank(results_fe_sf_st[0].getText('createdfrom'));
            var tranid = returnBlank(results_fe_sf_st[0].getValue('tranid'));
            var duedate = returnBlank(results_fe_sf_st[0].getValue('duedate'));
            var amount = returnNumber(results_fe_sf_st[0].getValue('amount'));
            var amountpaid = returnNumber(results_fe_sf_st[0].getValue('amountpaid'));
            var amountremaining = returnNumber(results_fe_sf_st[0].getValue('amountremaining'));
            var _fe_sf_se_destinatario = returnBlank(results_fe_sf_st[0].getValue('custentity_fe_sf_se_destinatario', 'customer'));
            var _fe_sf_se_cc = returnBlank(results_fe_sf_st[0].getValue('custentity_fe_sf_se_cc', 'customer'));
            var _fe_sf_se_bcc = returnBlank(results_fe_sf_st[0].getValue('custentity_fe_sf_se_bcc', 'customer'));
            var _razon_social = returnBlank(results_fe_sf_st[0].getValue('custentity_razon_social', 'customer'));
            var _fe_addenda = returnBlank(results_fe_sf_st[0].getText('custbody_fe_addenda')) || 'Generica';
            var _fe_addenda_notificar_a = returnBlank(results_fe_sf_st[0].getValue('custrecord_fe_addenda_notificar_a', 'custbody_fe_addenda'));
            var _fe_addenda_script_id = returnBlank(results_fe_sf_st[0].getValue('custrecord_fe_addenda_script_id', 'custbody_fe_addenda')) || 'customscript_imr_fe_generic_addenda';
            var _fe_addenda_deployment_id = returnBlank(results_fe_sf_st[0].getValue('custrecord_fe_addenda_deployment_id', 'custbody_fe_addenda')) || 'customdeploy_imr_fe_generic_addenda';
            var _fe_sf_json_comprobante = returnBlank(results_fe_sf_st[0].getValue('custbody_json_fe_comprobante_33'));
            var json_comprobante = JSON.parse(_fe_sf_json_comprobante);
            var currency = returnBlank(results_fe_sf_st[0].getValue('currency'));
            var _ce_tip_camb = returnBlank(results_fe_sf_st[0].getValue('exchangerate'));
            var subsidiaryInfo = {};
            var companyInfo = {};
            var companyname = "";
            var legalname = "";
            var NetSuite = new MainNetSuite();
            var isOneWorld = NetSuite.isOneWorld;
            var subsidiaries = NetSuite.subsidiaries;
            var subsidiary = "";
            if ( isOneWorld == true ) {
                subsidiary = returnBlank(results_fe_sf_st[0].getValue('subsidiary'));
                subsidiaryInfo = nlapiLoadRecord('subsidiary', subsidiary);
                companyname = returnBlank(subsidiaryInfo.getFieldValue('name'));
                legalname = returnBlank(subsidiaryInfo.getFieldValue('legalname'));
            } else {
                subsidiary = subsidiaries[0];
                companyInfo = nlapiLoadConfiguration('companyinformation');
                companyname = returnBlank(companyInfo.getFieldValue('companyname'));
                legalname = returnBlank(companyInfo.getFieldValue('legalname'));
            }
            var filters_fe_sf_config = [];
            filters_fe_sf_config.push(new nlobjSearchFilter('internalid', null, 'is', subsidiary));
            var _fe_sf_config = returnBlank(nlapiSearchRecord('customrecord_fe_sf_config', 'customsearch_fe_sf_config', filters_fe_sf_config, null));
            var value_user_pruebas = returnBlank(_fe_sf_config[0].getValue('custrecord_user_pruebas'));
            var value_password_pruebas = returnBlank(_fe_sf_config[0].getValue('custrecord_password_pruebas'));
            var value_url_timbrado_pruebas = returnBlank(_fe_sf_config[0].getValue('custrecord_url_timbrado_pruebas'));
            var value_user_produccion = returnBlank(_fe_sf_config[0].getValue('custrecord_user_produccion'));
            var value_password_produccion = returnBlank(_fe_sf_config[0].getValue('custrecord_password_produccion'));
            var value_url_timbrado_produccion = returnBlank(_fe_sf_config[0].getValue('custrecord_url_timbrado_produccion'));
            var value_ambiente_seleccion = returnBlank(_fe_sf_config[0].getValue('custrecord_ambiente_seleccion'));
            var value_ce_timbrado_activar = returnFalse(_fe_sf_config[0].getValue('custrecord_ce_timbrado_activar'));
            var value_ce_timbrado_author = returnBlank(_fe_sf_config[0].getValue('custrecord_ce_timbrado_author'));
            var value_ce_timbrado_cc = returnBlank(_fe_sf_config[0].getValue('custrecord_ce_timbrado_cc'));
            var value_ce_timbrado_bcc = returnBlank(_fe_sf_config[0].getValue('custrecord_ce_timbrado_bcc'));
            var value_ce_timbrado_asunto = returnBlank(_fe_sf_config[0].getValue('custrecord_ce_timbrado_asunto'));
            var value_ce_timbrado_mensaje = returnBlank(_fe_sf_config[0].getValue('custrecord_ce_timbrado_mensaje'));
            var value_mslna_script_id_pdf = returnBlank(_fe_sf_config[0].getValue('custrecord_mslna_script_id_pdf'));
            var value_mslna_deployment_id_pdf = returnBlank(_fe_sf_config[0].getValue('custrecord_mslna_deployment_id_pdf'));
            var value_num_certificacion_pruebas = returnBlank(_fe_sf_config[0].getValue('custrecord_numero_certificado_pruebas'));
            var value_num_certificacion_produccion = returnBlank(_fe_sf_config[0].getValue('custrecord_numero_certificado_produccion'));
            var value_campo_folio_pago = returnBlank(_fe_sf_config[0].getValue('custrecord_campo_folio_pago'));
            var value_mslna_no_tim_pag_sin_aplicar = returnFalse(_fe_sf_config[0].getValue('custrecord_mslna_no_tim_pag_sin_aplicar')) || 'F';
            var configFE = {};
            configFE.custrecord_campo_folio_pago = value_campo_folio_pago;
            var tranType = "";
            var tranTypeFE = "";
            var _fe_xml_ntst = "";
            var _fe_xml_ntst_name = "";
            var _fe_xml_ntst_file = "";
            var _fe_xml_ntst_id = "";
            var faultcode = "";
            var faultstring = "";
            var _fe_sf_masiva_det = {};
            var startName = "";
            var endName = "";
            var extension = '.xml';
            var folderID = new Number();
            var _fe_sf_general_preferences_url = nlapiResolveURL('SUITELET', 'customscript_fe_sf_gen_pre_st', 'customdeploy_fe_sf_gen_pre_st', true);
            var _fe_sf_general_preferences_request = nlapiRequestURL(_fe_sf_general_preferences_url);
            var _fe_sf_general_preferences_body = _fe_sf_general_preferences_request.getBody();
            var _fe_sf_general_preferences = Base64.decode(_fe_sf_general_preferences_body);
            _fe_sf_general_preferences = JSON.parse(_fe_sf_general_preferences);
            var custscript_fe_sf_gen_pre_folder_id_fc_em = _fe_sf_general_preferences.custscript_fe_sf_gen_pre_folder_id_fc_em;
            var custscript_fe_sf_gen_pre_folder_id_nc_em = _fe_sf_general_preferences.custscript_fe_sf_gen_pre_folder_id_nc_em;
            var custscript_fe_sf_gen_pre_folder_id_pc_em = _fe_sf_general_preferences.custscript_fe_sf_gen_pre_folder_id_pc_em;
            var custscript_fe_sf_gen_pre_folder_id_ot_em = _fe_sf_general_preferences.custscript_fe_sf_gen_pre_folder_id_ot_em;
            var custscript_fe_sf_gen_pre_env_adj_zip = _fe_sf_general_preferences.custscript_fe_sf_gen_pre_env_adj_zip_2;
            nlapiLogExecution('DEBUG', 'JSON', '4')

            switch ( recordType ) {
                case 'invoice':
                    tranType = 'Factura';
                    tranTypeFE = 'Factura Electrónica';
                    folderID = custscript_fe_sf_gen_pre_folder_id_fc_em;
                    break;
                case 'creditmemo':
                    tranType = 'Nota de Crédito';
                    tranTypeFE = 'Nota de crédito';
                    folderID = custscript_fe_sf_gen_pre_folder_id_nc_em;
                    break;
                case 'customerpayment':
                    tranType = 'Pago';
                    tranTypeFE = 'Recibo de pago';
                    folderID = custscript_fe_sf_gen_pre_folder_id_pc_em;
                    if ( value_mslna_no_tim_pag_sin_aplicar == 'T' ) {
                        var recordTimbre = nlapiLoadRecord(recordType, recordId);
                        var unapplied = returnNumber(recordTimbre.getFieldValue("unapplied"));
                        if ( unapplied != 0 ) {
                            throw nlapiCreateError("ERROR_TRANSACCION_UNAPPLIED", "La transacción no esta totalmente aplicada");
                        }
                    }
                    break;
                case 'transferorder':
                case 'inventorytransfer':

                    tranType = 'Traslado';
                    tranTypeFE = 'Carta porte';
                    folderID = custscript_fe_sf_gen_pre_folder_id_ot_em;
                    break;
                default:
                    tranType = 'othertransaction';
                    folderID = custscript_fe_sf_gen_pre_folder_id_fc_em;
            }
            var usuario = "";
            var password = "";
            var url = "";
            var num_certificado = '';
            if ( context.getEnvironment() != 'PRODUCTION' ) {
                value_ambiente_seleccion = 'A';
            }
            if ( value_ambiente_seleccion == 'A' ) {
                usuario = value_user_pruebas;
                password = value_password_pruebas;
                url = value_url_timbrado_pruebas;
                num_certificado = value_num_certificacion_pruebas;
            }
            if ( value_ambiente_seleccion == 'B' ) {
                usuario = value_user_produccion;
                password = value_password_produccion;
                url = value_url_timbrado_produccion;
                num_certificado = value_num_certificacion_produccion;
            }
            var requestXML = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="' + url + '">' +
                '<soapenv:Header/>' +
                '<soapenv:Body>' +
                '<soap:requestTimbrarCFDI soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                '<request xsi:type="xsd:anyType">' +
                '<text2CFDI>' + Base64.encode(getFormat(_fe_sf_json_comprobante, tranType, recordId, recordType, num_certificado, configFE)) + '</text2CFDI>' +
                '<UserID>' + usuario + '</UserID>' +
                '<UserPass>' + password + '</UserPass>' +
                '<generarTXT>false</generarTXT>' +
                '<generarPDF>false</generarPDF>' +
                '<generarCBB>false</generarCBB>' +
                '<emisorRFC>' + json_comprobante.Emisor.rfc + '</emisorRFC>' +
                '</request>' +
                '</soap:requestTimbrarCFDI>' +
                '</soapenv:Body>' +
                '</soapenv:Envelope>';
            var requestHeaders = [];
            requestHeaders['Content-Type'] = 'text/xml; charset=utf-8';
//requestHeaders['SOAPAction'] 	= 'http://tempuri.org/IEmisionTimbrado/EmitirTimbrarCFDI';
//requestHeaders['Host'] 			= 'sufacturacionservicios.azurewebsites.net';
            var response_sf = nlapiRequestURL(url, requestXML, requestHeaders, null);
            var response_sf_code = returnNumber(response_sf.getCode());
            var response_sf_body = returnBlank(response_sf.getBody());
            var response_sf_xml_obj = nlapiStringToXML(response_sf_body);
            nlapiLogExecution('DEBUG', 'response_sf_code', response_sf_code);
            nlapiLogExecution('DEBUG', 'xml', response_sf_body);
            nlapiLogExecution('DEBUG', 'JSON', '5');
            switch ( response_sf_code ) {
                case 200:
                    var value_ContentB64 = nlapiSelectValues(response_sf_xml_obj, '//xml');

                    nlapiLogExecution('DEBUG', 'JSON', '6')
                    startName = ('EXITO' + '|' + recordType + '|' + recordId);
                    _fe_xml_ntst = requestXML;
                    _fe_xml_ntst_name = getFileName(startName, endName, extension);
                    _fe_xml_ntst_file = nlapiCreateFile(_fe_xml_ntst_name, 'XMLDOC', _fe_xml_ntst);
                    _fe_xml_ntst_file.setEncoding('UTF-8');
                    _fe_xml_ntst_file.setFolder(folderID);
                    _fe_xml_ntst_id = nlapiSubmitFile(_fe_xml_ntst_file);
                    nlapiLogExecution('DEBUG', 'JSON', '7')
                    var _fe_xml_sat = Base64.decode(value_ContentB64[0]);
                    var _fe_xml_sat_obj = nlapiStringToXML(_fe_xml_sat);
                    var _fe_timbre_digital = nlapiSelectNode(_fe_xml_sat_obj, '//tfd:TimbreFiscalDigital');
                    var value_FileName = nlapiSelectValue(_fe_timbre_digital, '@UUID');
                    var _fe_xml_sat_name = returnBlank(value_FileName + '.xml');
                    var _fe_xml_sat_file = nlapiCreateFile(_fe_xml_sat_name, 'XMLDOC', _fe_xml_sat);
                    nlapiLogExecution('DEBUG', 'JSON', '8')
                    _fe_xml_sat_file.setEncoding('UTF-8');
                    _fe_xml_sat_file.setFolder(folderID);
                    var _fe_xml_sat_file_id = nlapiSubmitFile(_fe_xml_sat_file);
                    nlapiLogExecution('DEBUG', 'JSON', '9')
                    var urlPDF = nlapiResolveURL("SUITELET", value_mslna_script_id_pdf, value_mslna_deployment_id_pdf, true);
                    var dataPDF = {};
                    dataPDF.recordType = recordType;
                    dataPDF.recordId = recordId;
                    dataPDF.subsidiary = subsidiary;
                    dataPDF.titleForm = 'cfdi-pdf';
                    dataPDF.mode = 'cfdi-pdf';
                    dataPDF.preview = 'F';
                    dataPDF.fileIdXML = _fe_xml_sat_file_id;
                    dataPDF = JSON.stringify(dataPDF);
                    dataPDF = Base64.encode(dataPDF);
                    urlPDF += "&data=" + dataPDF;
                    var responsePDF = nlapiRequestURL(urlPDF, null, null, null);
                    var responsePDFBody = returnBlank(responsePDF.getBody());
                    var _fe_pdf = returnBlank(responsePDFBody);
                    var _fe_pdf_name = returnBlank(value_FileName + '.pdf');
                    nlapiLogExecution('ERROR', 'PDF nombre', _fe_pdf_name)
                    nlapiLogExecution('ERROR', 'PDF', _fe_pdf)
                    var _fe_pdf_file = nlapiCreateFile(_fe_pdf_name, 'PDF', _fe_pdf);
                    _fe_pdf_file.setFolder(folderID);
                    var _fe_pdf_file_id = nlapiSubmitFile(_fe_pdf_file);
                    nlapiLogExecution('ERROR', 'JSON', '10')
                    var _ce_uuid_cfdi = "";
                    var _ce_rfc = "";
                    var _ce_monto_total = "";
                    var _ce_moneda = returnBlank(nlapiLookupField('currency', currency, 'symbol', false));
                    var _fe_expresion_impresa = "";
                    var _fe_val_cfdi_codigo_status = "";
                    var _fe_val_cfdi_estado = "";
                    var _fe_permitir_regenerar_addenda = 'F';

                    if ( _fe_xml_sat != '' ) {
                        var _fe_sf_xml_sat_file = nlapiLoadFile(_fe_xml_sat_file_id);
                        var _fe_sf_xml_sat_value = _fe_sf_xml_sat_file.getValue();
                        var _fe_sf_xml_sat_xml_obj = nlapiStringToXML(_fe_sf_xml_sat_value);
                        var cfdi_Receptor = nlapiSelectNode(_fe_sf_xml_sat_xml_obj, '//cfdi:Receptor');
                        var cfdi_Emisor = nlapiSelectNode(_fe_sf_xml_sat_xml_obj, '//cfdi:Emisor');
                        var re = nlapiSelectValue(cfdi_Emisor, '@Rfc');
                        var rr = nlapiSelectValue(cfdi_Receptor, '@Rfc');
                        var _fe_timbre_digital = nlapiSelectNode(_fe_sf_xml_sat_xml_obj, '//tfd:TimbreFiscalDigital');
                        _ce_uuid_cfdi = nlapiSelectValue(_fe_timbre_digital, '@UUID');
                        _ce_monto_total = returnNumber(nlapiSelectValue(_fe_sf_xml_sat_xml_obj, '//@total'));
                        _ce_rfc = (recordType == 'vendorbill' || recordType == 'vendorcredit') ? nlapiSelectValue(cfdi_Emisor, '@rfc') : nlapiSelectValue(cfdi_Receptor, '@Rfc');
                        _ce_moneda = returnBlank(nlapiLookupField('currency', currency, 'symbol', false));
//_ce_tip_camb									= returnNumber(record.getFieldValue('exchangerate'));
                        _fe_expresion_impresa += '?re=' + re;
                        _fe_expresion_impresa += '&rr=' + rr;
                        _fe_expresion_impresa += '&tt=' + _ce_monto_total;
                        _fe_expresion_impresa += '&id=' + _ce_uuid_cfdi;
                        _fe_expresion_impresa = Base64.encode(_fe_expresion_impresa);
                    }
                    if ( _fe_addenda != '' ) {
                        try {
                            var data_fe_st_addenda = {};
                            data_fe_st_addenda.recordType = recordType;
                            data_fe_st_addenda.recordId = recordId;
                            data_fe_st_addenda._fe_permitir_regenerar_addenda = 'F';
                            data_fe_st_addenda._fe_xml_sat_name = _fe_xml_sat_name;
                            data_fe_st_addenda._fe_xml_sat_file_id = _fe_xml_sat_file_id;
                            data_fe_st_addenda = JSON.stringify(data_fe_st_addenda);
                            data_fe_st_addenda = Base64.encode(data_fe_st_addenda);
                            var url_fe_st_addenda = nlapiResolveURL("SUITELET", _fe_addenda_script_id, _fe_addenda_deployment_id, true);
                            url_fe_st_addenda += "&data=" + data_fe_st_addenda;
                            var response_fe_st_addenda_obj = nlapiRequestURL(url_fe_st_addenda);
                            var response_fe_st_addenda_body = response_fe_st_addenda_obj.getBody();
                            var data_response = Base64.decode(response_fe_st_addenda_body);
                            data_response = JSON.parse(data_response);
                            _fe_xml_sat_file_id = returnBlank(data_response._fe_xml_sat_file_id);
                            _fe_permitir_regenerar_addenda = returnFalse(data_response._has_error);
                        } catch (e) {
                            _fe_permitir_regenerar_addenda = 'T';
                        }
                        if ( _fe_permitir_regenerar_addenda == 'F' ) {
                            _fe_xml_sat_file = nlapiLoadFile(_fe_xml_sat_file_id);
                        } else {
                            var currentURL = request.getURL();
                            var index = currentURL.indexOf("/app");
                            var host = currentURL.substring(0, index);
                            var urlRECORD = host + nlapiResolveURL("RECORD", recordType, recordId, 'VIEW');
                            var addenda_subject = 'ERROR EN ADDENDA: ' + _fe_addenda;
                            var addenda_body = "";
                            addenda_body += '<html>';
                            addenda_body += '   <head>';
                            addenda_body += '       <body>';
                            addenda_body += '           <font size="2">Ha ocurrido un error en al generación de la addenda ' + _fe_addenda + ' en la ' + tranType + ' #' + tranid + ', haga click <a href=' + urlRECORD + '>aquí</a> para ver la transacción.</font>';
                            addenda_body += '           <br><br>';
                            addenda_body += '           <font size="2"><b>IMPORTANTE</b>: el XML (CFDI) fue generado, no así la addenda.</font>';
                            addenda_body += '           <br><br>';
                            addenda_body += '           <font size="2">Consulte a Soporte T&eacute;cnico y mueste este mensaje.</font>';
                            addenda_body += '       </body>';
                            addenda_body += '   </head>';
                            addenda_body += '</html>';
                            if ( _fe_addenda_notificar_a )
                                nlapiSendEmail(_fe_addenda_notificar_a, _fe_addenda_notificar_a, addenda_subject, addenda_body, null, null, null, null);
                        }
                    }
                    if ( _fe_sf_masiva_id == '' ) {
                        nlapiSetRedirectURL('RECORD', recordType, recordId, false, null);
                    } else {
                        _fe_sf_masiva_det = nlapiCreateRecord('customrecord_fe_sf_masiva_det');
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_fecha', trandate);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_transaccion', recordId);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_cliente', entity);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_codigo_resp', response_sf_code);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_mensaje_resp', 'Timbrado exitoso.');
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_xml_netsuite', _fe_xml_ntst_id);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_xml_sat', _fe_xml_sat_file_id);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_pdf', _fe_pdf_file_id);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_cabecera', _fe_sf_masiva_id);
                        nlapiSubmitRecord(_fe_sf_masiva_det);
                    }
                    var fecha_timb = new Date();
                    var fields_200 = [];
                    fields_200.push('custbody_fe_sf_xml_netsuite');
                    fields_200.push('custbody_fe_sf_xml_sat');
                    fields_200.push('custbody_fe_sf_pdf');
                    fields_200.push('custbody_fe_sf_codigo_respuesta');
                    fields_200.push('custbody_fe_sf_mensaje_respuesta');
                    if ( recordType != 'customerpayment' )
                        fields_200.push('custbody_ce_tipo_de_poliza');
                    fields_200.push('custbody_ce_moneda');
                    fields_200.push('custbody_ce_monto_total');
                    fields_200.push('custbody_ce_rfc');
                    fields_200.push('custbody_ce_tip_camb');
                    fields_200.push('custbody_ce_uuid_cfdi');
                    fields_200.push('custbody_fe_expresion_impresa');
                    fields_200.push('custbody_fe_val_cfdi_codigo_status');
                    fields_200.push('custbody_fe_val_cfdi_estado');
                    fields_200.push('custbody_fe_permitir_regenerar_addenda');
                    fields_200.push('custbody_fecha_de_timbrado');
                    fields_200.push('custbody_fe_emitida_portal_cliente');
                    fields_200.push('custbody_imr_fe_cancelado');

                    var values_200 = [];
                    values_200.push(_fe_xml_ntst_id);
                    values_200.push(_fe_xml_sat_file_id);
                    values_200.push(_fe_pdf_file_id);
                    values_200.push(response_sf_code);
                    values_200.push('Timbrado exitoso.');
                    if ( recordType != 'customerpayment' )
                        values_200.push(2);
                    values_200.push(_ce_moneda);
                    values_200.push(_ce_monto_total);
                    values_200.push(_ce_rfc);
                    values_200.push(_ce_tip_camb);
                    values_200.push(_ce_uuid_cfdi);
                    values_200.push(_fe_expresion_impresa);
                    values_200.push(_fe_val_cfdi_codigo_status);
                    values_200.push(_fe_val_cfdi_estado);
                    values_200.push(_fe_permitir_regenerar_addenda);
                    values_200.push(nlapiDateToString(fecha_timb, 'date'));
                    values_200.push(_fe_portal_cliente);
                    values_200.push('F');
                    nlapiSubmitField(recordType, recordId, fields_200, values_200);
                    if ( (value_ce_timbrado_activar == 'T' || _enviar_email_fe_el == 'T') && _fe_permitir_regenerar_addenda == 'F' ) {
                        var CC = [];
                        var BCC = [];
                        if ( _fe_sf_se_cc != '' ) {
                            CC.push(_fe_sf_se_cc);
                        }
                        if ( value_ce_timbrado_cc != '' ) {
                            CC.push(value_ce_timbrado_cc);
                        }
                        if ( _fe_sf_se_bcc != '' ) {
                            BCC.push(_fe_sf_se_bcc);
                        }
                        if ( value_ce_timbrado_bcc != '' ) {
                            BCC.push(value_ce_timbrado_bcc);
                        }
                        if ( CC.length == 0 ) {
                            CC = null;
                        }
                        if ( BCC.length == 0 ) {
                            BCC = null;
                        }
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[recordtype_fe]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(tranTypeFE);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[recordtype]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(tranType);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[internalid]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(internalid);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[tranid]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(tranid);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[trandate]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(trandate);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[razonsocial]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(_razon_social);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[customer]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(customer);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[duedate]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(duedate);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[amount]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(amount);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[amountpaid]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(amountpaid);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[amountremaining]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(amountremaining);
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.split('[companyname]');
                        value_ce_timbrado_asunto = value_ce_timbrado_asunto.join(companyname);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[applyingdocuments]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(getAplicaciones(recordId));
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[recordtype_fe]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(tranTypeFE);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[recordtype]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(tranType);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[internalid]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(internalid);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[tranid]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(tranid);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[trandate]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(trandate);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[razonsocial]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(_razon_social);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[customer]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(customer);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[createdfrom]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(createdfrom);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[duedate]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(duedate);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[amount]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(amount);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[amountpaid]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(amountpaid);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[amountremaining]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(amountremaining);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[companyname]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(companyname);
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.split('[legalname]');
                        value_ce_timbrado_mensaje = value_ce_timbrado_mensaje.join(legalname);
                        var records = [];
                        records['transaction'] = recordId;
                        var attachments = [];
                        if ( custscript_fe_sf_gen_pre_env_adj_zip == 'T' ) {
                            var zip_object = new JSZip();
                            zip_object.add(_fe_xml_sat_file.getName(), _fe_xml_sat_file.getValue(), {base64: isBase64Coded(_fe_xml_sat_file.getValue())});
                            zip_object.add(_fe_pdf_file.getName(), _fe_pdf_file.getValue(), {base64: isBase64Coded(_fe_pdf_file.getValue())});
                            var zip_file_content = zip_object.generate();
                            var zip_file_name = getFileName('Archivos_Adjuntos', '', '.zip');
                            var zip_file_object = nlapiCreateFile(zip_file_name, 'ZIP', zip_file_content);
                            attachments.push(zip_file_object);
                        } else {
                            attachments.push(_fe_pdf_file);
                            attachments.push(_fe_xml_sat_file);
                        }
                        if ( value_ce_timbrado_author != '' && _fe_sf_se_destinatario != '' && value_ce_timbrado_asunto != '' && value_ce_timbrado_mensaje != '' ) {
                            nlapiSendEmail(value_ce_timbrado_author, _fe_sf_se_destinatario, value_ce_timbrado_asunto, value_ce_timbrado_mensaje, CC, BCC, records, attachments);
                        }
                    }
                    break;
                case 500:

                    faultcode = nlapiSelectValue(response_sf_xml_obj, '//faultcode');
                    faultstring = nlapiSelectValue(response_sf_xml_obj, '//faultstring');
                    startName = ('ERROR' + '|' + recordType + '|' + recordId);
                    _fe_xml_ntst = requestXML;
                    _fe_xml_ntst_name = getFileName(startName, endName, extension);
                    _fe_xml_ntst_file = nlapiCreateFile(_fe_xml_ntst_name, 'XMLDOC', _fe_xml_ntst);
                    _fe_xml_ntst_file.setFolder(folderID);
                    _fe_xml_ntst_id = nlapiSubmitFile(_fe_xml_ntst_file);
                    var fields_500 = [];
                    fields_500.push('custbody_fe_sf_xml_netsuite');
                    fields_500.push('custbody_fe_sf_xml_sat');
                    fields_500.push('custbody_fe_sf_pdf');
                    fields_500.push('custbody_fe_sf_codigo_respuesta');
                    fields_500.push('custbody_fe_sf_mensaje_respuesta');
                    if ( recordType != 'customerpayment' ) {
                        fields_500.push('custbody_ce_moneda');
                        fields_500.push('custbody_ce_monto_total');
                        fields_500.push('custbody_ce_rfc');
                        fields_500.push('custbody_ce_tip_camb');
                        fields_500.push('custbody_ce_tipo_de_poliza');
                        fields_500.push('custbody_ce_uuid_cfdi');
                    }
                    fields_500.push('custbody_fe_expresion_impresa');
                    fields_500.push('custbody_fe_val_cfdi_codigo_status');
                    fields_500.push('custbody_fe_val_cfdi_estado');
                    fields_500.push('custbody_fe_permitir_regenerar_addenda');
                    var values_500 = [];
                    values_500.push(_fe_xml_ntst_id);
                    values_500.push('');
                    values_500.push('');
                    values_500.push(faultcode);
                    values_500.push(faultstring);
                    if ( recordType != 'customerpayment' ) {
                        values_500.push('');
                        values_500.push('');
                        values_500.push('');
                        values_500.push('');
                        values_500.push(1);
                        values_500.push('');
                    }
                    values_500.push('');
                    values_500.push('');
                    values_500.push('');
                    values_500.push('F');
                    nlapiSubmitField(recordType, recordId, fields_500, values_500);
                    if ( _fe_sf_masiva_id == '' ) {
                        nlapiSetRedirectURL('RECORD', recordType, recordId, false, null);
                    } else {
                        _fe_sf_masiva_det = nlapiCreateRecord('customrecord_fe_sf_masiva_det');
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_fecha', trandate);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_transaccion', recordId);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_cliente', entity);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_codigo_resp', faultcode);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_mensaje_resp', faultstring);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_xml_netsuite', _fe_xml_ntst_id);
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_xml_sat', '');
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_pdf', '');
                        _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_cabecera', _fe_sf_masiva_id);
                        nlapiSubmitRecord(_fe_sf_masiva_det);
                    }
                    break;
                default:

            }
        } else {
            if ( _fe_sf_masiva_id == '' ) {
                nlapiSetRedirectURL('RECORD', recordType, recordId, false, null);
            } else {
                var filters_empty = [];
                filters_empty.push(new nlobjSearchFilter('internalid', null, 'is', recordId));
                filters_empty.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
                var columns_empty = [];
                columns_empty.push(new nlobjSearchColumn('trandate'));
                columns_empty.push(new nlobjSearchColumn('entity'));
                columns_empty.push(new nlobjSearchColumn('custbody_fe_sf_codigo_respuesta'));
                columns_empty.push(new nlobjSearchColumn('custbody_fe_sf_mensaje_respuesta'));
                columns_empty.push(new nlobjSearchColumn('custbody_fe_sf_xml_netsuite'));
                columns_empty.push(new nlobjSearchColumn('custbody_fe_sf_xml_sat'));
                columns_empty.push(new nlobjSearchColumn('custbody_fe_sf_pdf'));
                var searchResults_empty = returnBlank(nlapiSearchRecord(recordType, null, filters_empty, columns_empty));
                var trandate_empty = returnBlank(searchResults_empty[0].getValue('trandate'));
                var entity_empty = returnBlank(searchResults_empty[0].getValue('entity'));
                var _fe_sf_codigo_respuesta = returnBlank(searchResults_empty[0].getValue('custbody_fe_sf_codigo_respuesta'));
                var _fe_sf_mensaje_respuesta = returnBlank(searchResults_empty[0].getValue('custbody_fe_sf_mensaje_respuesta'));
                +String.fromCharCode(10) + String.fromCharCode(10) + 'Factura omitida, timbrado previamente realizado.';
                var _fe_sf_xml_netsuite = returnBlank(searchResults_empty[0].getValue('custbody_fe_sf_xml_netsuite'));
                var _fe_sf_xml_sat = returnBlank(searchResults_empty[0].getValue('custbody_fe_sf_xml_sat'));
                var _fe_sf_pdf = returnBlank(searchResults_empty[0].getValue('custbody_fe_sf_pdf'));
                _fe_sf_masiva_det = nlapiCreateRecord('customrecord_fe_sf_masiva_det');
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_fecha', trandate_empty);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_transaccion', recordId);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_cliente', entity_empty);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_codigo_resp', _fe_sf_codigo_respuesta);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_mensaje_resp', _fe_sf_mensaje_respuesta);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_xml_netsuite', _fe_sf_xml_netsuite);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_xml_sat', _fe_sf_xml_sat);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_pdf', _fe_sf_pdf);
                _fe_sf_masiva_det.setFieldValue('custrecord_fe_sf_masiva_det_cabecera', _fe_sf_masiva_id);
                nlapiSubmitRecord(_fe_sf_masiva_det);
            }
        }
    } catch (error) {
        var customscript = 'customscript_fe_sf_he';
        var customdeploy = 'customdeploy_fe_sf_he';
        var HE_Catch_UE = Generic_HE_Catch_UE(error, recordType, recordId, titleForm, request);
        var HE_Params = [];
        HE_Params['data'] = HE_Catch_UE;
        nlapiSetRedirectURL('SUITELET', customscript, customdeploy, false, HE_Params);
    }
}


function getAplicaciones(recordId) {
    var aplicaciones = '';
    var transactionSearch = nlapiSearchRecord("transaction", null,
        [
            ["internalid", "anyof", recordId],
            "AND",
            ["type", "anyof", "CustPymt", "CustCred"],
            "AND",
            ["appliedtotransaction", "noneof", "@NONE@"]
        ],
        [
            new nlobjSearchColumn("appliedtotransaction", null, "GROUP")
        ]
    );
    if ( transactionSearch && transactionSearch.length > 0 ) {
        var documentos = [];
        aplicaciones += "Documentos aplicados: ";
        for (var i = 0; i < transactionSearch.length; i++) {
            documentos.push(transactionSearch[i].getText("appliedtotransaction", null, "GROUP"));
        }
        aplicaciones += documentos.join(",")
    }
    return aplicaciones;
}

function getFormat(json, tranType, recordId, recordType, num_certificado, configFE) {
    var json = JSON.parse(json);
    var complementos = json.Complementos || [];
    var format = '';
    var mapCurrency = getMapCurrency()
    if ( json.tipoDeComprobante != 'P' ) {
//Encabezado
        format = '[ComprobanteFiscalDigital]\n';
        format += getValueJson(json, 'version', 'Version');
        format += getValueJson(json, 'serie', 'Serie');
        format += getValueJson(json, 'folio', 'Folio');
        format += getValueJson(json, 'fecha', 'Fecha');
        if ( json.tipoDeComprobante != 'T' )
            format += getValueJson(json, 'metodoDePago', 'FormaPago');
        format += 'NoCertificado=' + num_certificado + '\n';//getValueJson(json,'noCertificado','NoCertificado');
        format += getValueJson(json, 'condicionesDePago', 'CondicionesDePago');
        format += getValueJson(json, 'subTotal', 'SubTotal');
        if ( json.tipoDeComprobante != 'T' ) {
            format += getValueJson(json, 'descuento', 'Descuento');
        }
        format += getValueJson(json, 'Moneda');
        format += getValueJson(json, 'total', 'Total');
        format += getValueJson(json, 'tipoDeComprobante', 'TipoDeComprobante');
        if ( json.tipoDeComprobante != 'T' )
            format += getValueJson(json, 'FormaPago', 'MetodoPago');
        format += getValueJson(json, 'LugarExpedicion');
        if ( 'MXN' == json.Moneda ) {
            format += 'TipoCambio=1\n';
        } else {
            format += getValueJson(json, 'TipoCambio');
        }
        var decimalsCurrency = mapCurrency[json.Moneda];
        json.UUID = getUUIDS(recordType, recordId, 1, json.TipoRelacion);
        nlapiLogExecution('DEBUG', 'UUID', json.UUID);
        if ( json.UUID && json.UUID.length > 0 ) {
            format += '\n[CfdiRelacionados]\n';
            if ( json.TipoRelacion ) {
                format += getValueJson(json, 'TipoRelacion');
            }
            if ( json.UUID.length > 0 ) {
                format += 'UUID=[' + json.UUID.join(',') + ']\n';
            }
        }


//Datos Adicionales
//format			+= '\n[DatosAdicionales]\n';
//format			+= formatXML(tranType,'tipoDocumento');

//Emisor
        var emisor = json.Emisor;
        format += '\n[Emisor]\n';
        format += getValueJson(emisor, 'rfc', 'Rfc');
        format += getValueJson(emisor, 'nombre', 'Nombre');
        format += getValueJson(emisor, 'RegimenFiscal');


        /*
        //DomicilioFiscal
        var domicilioFiscal	= emisor.DomicilioFiscal;
        format			+= '\n\n[DomicilioFiscal]\n\n';
        format			+= getValueJson(domicilioFiscal,'calle');
        format			+= getValueJson(domicilioFiscal,'noExterior');
        format			+= getValueJson(domicilioFiscal,'noInterior');
        format			+= getValueJson(domicilioFiscal,'colonia');
        format			+= getValueJson(domicilioFiscal,'localidad');
        format			+= getValueJson(domicilioFiscal,'municipio');
        format			+= getValueJson(domicilioFiscal,'estado');
        format			+= getValueJson(domicilioFiscal,'pais');
        format			+= getValueJson(domicilioFiscal,'codigoPostal');
        //ExpedidoEn
        format			+= '\n\n[ExpedidoEn]\n\n';
        format			+= getValueJson(domicilioFiscal,'calle');
        format			+= getValueJson(domicilioFiscal,'noExterior');
        format			+= getValueJson(domicilioFiscal,'noInterior');
        format			+= getValueJson(domicilioFiscal,'colonia');
        format			+= getValueJson(domicilioFiscal,'localidad');
        format			+= getValueJson(domicilioFiscal,'municipio');
        format			+= getValueJson(domicilioFiscal,'estado');
        format			+= getValueJson(domicilioFiscal,'pais');
        format			+= getValueJson(domicilioFiscal,'codigoPostal');
        */
//Receptor
        var receptor = json.Receptor;
        format += '\n\n[Receptor]\n';
        format += getValueJson(receptor, 'rfc', 'Rfc');
        format += getValueJson(receptor, 'nombre', 'Nombre');
        format += getValueJson(receptor, 'UsoCFDI');
        if ( complementos.indexOf('1') != -1 ) {
            format += getValueJson(receptor, 'ResidenciaFiscal');
            format += getValueJson(receptor, 'NumRegIdTrib');
        }
        /*
        //Domicilio
        var domicilio	= receptor.Domicilio;
        format			+= '\n\n[Domicilio]\n\n';
        format			+= getValueJson(domicilio,'calle');
        format			+= getValueJson(domicilio,'noExterior');
        format			+= getValueJson(domicilio,'noInterior');
        format			+= getValueJson(domicilio,'colonia');
        format			+= getValueJson(domicilio,'localidad');
        format			+= getValueJson(domicilio,'municipio');
        format			+= getValueJson(domicilio,'estado');
        format			+= getValueJson(domicilio,'pais');
        format			+= getValueJson(domicilio,'codigoPostal');
        */

//Conceptos
        var Conceptos = json.Conceptos;
        for (var i = 0; i < Conceptos.length; i++) {
            var concepto = Conceptos[i];
            format += '\n\n[Concepto#' + (i + 1) + ']\n';
            format += getValueJson(concepto, 'ClaveProdServ');
            format += getValueJson(concepto, 'noIdentificacion', 'NoIdentificacion');
            format += getValueJson(concepto, 'cantidad', 'Cantidad');
            format += getValueJson(concepto, 'unidad', 'ClaveUnidad');
            format += getValueJson(concepto, 'unidadtext', 'Unidad');
            format += getValueJson(concepto, 'descripcion', 'Descripcion');
            format += getValueJson(concepto, 'valorUnitario', 'ValorUnitario');
            format += getValueJson(concepto, 'importe', 'Importe');
            if ( json.tipoDeComprobante != 'T' ) {
                format += getValueJson(concepto, 'descuento', 'Descuento');
            }

//Pedimentos
            var Pedimentos = [];
            if ( concepto.Parte && concepto.Parte.length > 0 ) {
                for (var h = 0; h < concepto.Parte.length; h++) {
                    if ( concepto.Parte[h].InformacionAduanera && concepto.Parte[h].InformacionAduanera.length > 0 ) {
                        for (var j = 0; j < concepto.Parte[h].InformacionAduanera.length; j++) {
                            var pedimento = concepto.Parte[h].InformacionAduanera[j];
                            Pedimentos.push(pedimento.numero);
                        }
                    }
                }
            }

            if ( concepto.InformacionAduanera && concepto.InformacionAduanera.length > 0 ) {
                for (var j = 0; j < concepto.InformacionAduanera.length; j++) {
                    var pedimento = concepto.InformacionAduanera[j];
                    Pedimentos.push(pedimento.numero);
                }

            }
            if ( Pedimentos.length > 0 && complementos.indexOf('1') == -1 )
                format += '\nInformacionAduanera.NumeroPedimento=[' + Pedimentos.join(',') + ']';

            try {
                var Predial = concepto.CuentaPredial.Numero;
                if ( Predial ) {
                    format += '\nCuentaPredial.Numero=' + Predial + '';
                }
            } catch (e) {
            }
            ;

//Partes
            var ClaveProdServ = []
            var NoIdentificacion = []
            var Cantidad = []
            var Unidad = []
            var Descripcion = []
            if ( concepto.Parte && concepto.Parte.length > 0 ) {
                for (var j = 0; j < concepto.Parte.length; j++) {
                    var parte = concepto.Parte[j];
                    ClaveProdServ.push(parte.ClaveProdServ);
                    NoIdentificacion.push(getFormatINI(parte.noIdentificacion));
                    Cantidad.push(parte.cantidad);
                    Unidad.push(parte.unidad);
                    Descripcion.push(getFormatINI(parte.descripcion));
                }
                format += '\nParte.ClaveProdServ=[' + ClaveProdServ.join(',') + ']\n';
                format += 'Parte.NoIdentificacion=[' + NoIdentificacion.join(',') + ']\n';
                format += 'Parte.Cantidad=[' + Cantidad.join(',') + ']\n';
                format += 'Parte.Unidad=[' + Unidad.join(',') + ']\n';
                format += 'Parte.Descripcion=[' + Descripcion.join(',') + ']\n';
            }

// Impuestos Traladados conceptos
            var Impuestos = concepto.impuestos || {};
            var Traslados = Impuestos.Traslados || [];
            var Retenidos = Impuestos.Retenidos || [];
            var Base = [];
            var claveImpuesto = [];
            var TipoFactor = [];
            var TasaOCuota = [];
            var Importes = [];
            if ( Traslados.length > 0 ) {
                for (var j = 0; j < Traslados.length; j++) {
                    var impuesto = Traslados[j];
                    Base.push(impuesto.Base);
                    claveImpuesto.push(impuesto.impuesto);
                    TipoFactor.push(impuesto.TipoFactor);
                    TasaOCuota.push(impuesto.TasaOCuota);
                    Importes.push(impuesto.importe);
                }
                format += '\nImpuestos.Traslados.Base=[' + Base.join(',') + ']\n';
                format += 'Impuestos.Traslados.Impuesto=[' + claveImpuesto.join(',') + ']\n';
                format += 'Impuestos.Traslados.TipoFactor=[' + TipoFactor.join(',') + ']\n';
                format += 'Impuestos.Traslados.TasaOCuota=[' + TasaOCuota.join(',') + ']\n';
                format += 'Impuestos.Traslados.Importe=[' + Importes.join(',') + ']\n';
            }
//Impuestos Retenidos concepto
            if ( Retenidos.length > 0 ) {
                var Base = [];
                var claveImpuesto = [];
                var TipoFactor = [];
                var TasaOCuota = [];
                var Importes = [];
                for (var j = 0; j < Retenidos.length; j++) {
                    var impuesto = Retenidos[j];
                    Base.push(impuesto.Base);
                    claveImpuesto.push(impuesto.impuesto);
                    TipoFactor.push(impuesto.TipoFactor);
                    TasaOCuota.push(impuesto.TasaOCuota);
                    Importes.push(impuesto.importe);
                }
                format += '\nImpuestos.Retenciones.Base=[' + Base.join(',') + ']\n';
                format += 'Impuestos.Retenciones.Impuesto=[' + claveImpuesto.join(',') + ']\n';
                format += 'Impuestos.Retenciones.TipoFactor=[' + TipoFactor.join(',') + ']\n';
                format += 'Impuestos.Retenciones.TasaOCuota=[' + TasaOCuota.join(',') + ']\n';
                format += 'Impuestos.Retenciones.Importe=[' + Importes.join(',') + ']\n';
            }
        }
        if ( json.Impuestos ) {
//Impuestos Trasladados
            var impuestosTrasladados = json.Impuestos.Traslados || [];
            var impuestosRetenciones = json.Impuestos.Retenciones || [];
            var claveImpuesto = [];
            var TipoFactor = [];
            var TasaOCuotas = [];
            var Importes = [];
            if ( impuestosTrasladados.length > 0 ) {
                format += '\n\n[Traslados]\n';
                var TotalTrasladado = 0;
                for (var i = 0; i < impuestosTrasladados.length; i++) {
                    var impuestoTrasladado = impuestosTrasladados[i];
                    var importe = returnNumber(impuestoTrasladado.importe);
                    var TasaOCuota = impuestoTrasladado.TasaOCuota;
                    var factor = impuestoTrasladado.factor;
                    var impuesto = impuestoTrasladado.impuesto
                    claveImpuesto.push(impuesto);
                    Importes.push(importe);
                    TasaOCuotas.push(TasaOCuota);
                    TipoFactor.push(factor);
                    TotalTrasladado += importe;
                }
                TotalTrasladado = TotalTrasladado.toFixed(decimalsCurrency);
                format += 'TotalImpuestosTrasladados=' + TotalTrasladado + '\n';
                format += 'Impuesto=[' + claveImpuesto.join(',') + ']\n';
                format += 'TipoFactor=[' + TipoFactor.join(',') + ']\n';
                format += 'TasaOCuota=[' + TasaOCuotas.join(',') + ']\n';
                format += 'Importe=[' + Importes.join(',') + ']\n';

            }

            if ( impuestosRetenciones.length > 0 ) {
                var claveImpuesto = [];
                var Importes = [];
                format += '\n\n[Retenciones]\n';
                var TotalRetenciones = 0;
                for (var i = 0; i < impuestosRetenciones.length; i++) {
                    var impuestoRetenciones = impuestosRetenciones[i];
                    var importe = returnNumber(impuestoRetenciones.importe);
                    var TasaOCuota = impuestoRetenciones.TasaOCuota;
                    var factor = impuestoRetenciones.factor;
                    var impuesto = impuestoRetenciones.impuesto
                    claveImpuesto.push(impuesto);
                    Importes.push(importe);
                    TotalRetenciones += importe;
                }
                TotalRetenciones = TotalRetenciones.toFixed(decimalsCurrency);
                format += 'TotalImpuestosRetenidos=' + TotalRetenciones + '\n';
                format += 'Impuesto=[' + claveImpuesto.join(',') + ']\n';
                format += 'Importe=[' + Importes.join(',') + ']\n';
            }
        }
        var resultLocalTax = nlapiSearchRecord('transaction', 'customsearch_impuestos_locales_fe', [new nlobjSearchFilter('internalid', null, 'is', recordId)]) || [];
        if ( resultLocalTax.length > 0 ) {
            var localTrasladado = {};
            localTrasladado.existe = false;
            localTrasladado.nombres = [];
            localTrasladado.tasa = [];
            localTrasladado.importe = [];
            var localRetenido = {};
            localRetenido.existe = false;
            localRetenido.nombres = [];
            localRetenido.tasa = [];
            localRetenido.importe = [];
            for (var i = 0; i < resultLocalTax.length; i++) {
                var result = resultLocalTax[i];
                var name = result.getValue('name', 'taxItem', 'group');
                var amount = result.getValue('amount', null, 'sum') || '0';
                var tasa = result.getValue('rate', 'taxItem', 'group');
                var type = result.getValue('custrecord_fe_clase_de_impuesto', 'taxItem', 'group');
                tasa = tasa.replace('%', '');
                tasa = returnNumber(tasa).toFixed(2);
                nlapiLogExecution('ERROR', 'type', type);
                if ( type == 1 ) {
                    localTrasladado.existe = true;
                    localTrasladado.nombres.push(name);
                    localTrasladado.tasa.push(tasa);
                    localTrasladado.importe.push(amount);
                } else if ( type == 2 ) {
                    localRetenido.existe = true;
                    localRetenido.nombres.push(name);
                    localRetenido.tasa.push(tasa);
                    localRetenido.importe.push(amount);
                } else {
                    continue;
                }

            }
            if ( localTrasladado.existe ) {
                format += '\n\n[TrasladosLocales]\n';
                format += 'ImpLocTrasladado=[' + localTrasladado.nombres.join(',') + ']\n';
                format += 'TasadeTraslado=[' + localTrasladado.tasa.join(',') + ']\n';
                format += 'Importe=[' + localTrasladado.importe.join(',') + ']\n';
            }
            if ( localRetenido.existe ) {
                format += '\n\n[RetencionesLocales]\n';
                format += 'ImpLocRetenido=[' + localRetenido.nombres.join(',') + ']\n';
                format += 'TasadeRetencion=[' + localRetenido.tasa.join(',') + ']\n';
                format += 'Importe=[' + localRetenido.importe.join(',') + ']\n';
            }
        }
        if ( complementos.indexOf('1') != -1 ) {
            format += '\n\n[ComercioExterior]\n';
            format += 'Version=1.1\n';
            format += getValueJson(json, 'MotivoTraslado');
            format += getValueJson(json, 'TipoOperacion');
            format += getValueJson(json, 'ClaveDePedimento');
            if ( json.NumCertificadoOrigen ) {
                format += 'CertificadoOrigen=1\n';
            } else {
                format += 'CertificadoOrigen=0\n';
            }
            format += getValueJson(json, 'NumCertificadoOrigen');
            format += getValueJson(json, 'NumeroExportadorConfiable');
            format += getValueJson(json, 'Incoterm');
            format += 'Subdivision=0\n';
            format += getValueJson(json, 'ObservacionesComExt');
            if ( json.TipoCambioCCE ) {
                format += getValueJson(json, 'TipoCambioCCE', 'TipoCambioUSD');
            } else {
                format += getValueJson(json, 'TipoCambio', 'TipoCambioUSD');
            }
            nlapiLogExecution('ERROR', 'json.subTotalCCE', json.subTotalCCE);
            nlapiLogExecution('ERROR', 'json.subTotal', json.subTotal);
            if ( json.subTotalCCE ) {
                format += getValueJson(json, 'subTotalCCE', 'TotalUSD');
            } else {
                format += getValueJson(json, 'subTotal', 'TotalUSD');
            }


            var Emisor = json.Emisor || {};
            var EmisorDomicilioCCE = Emisor.DomicilioCCE || {};

            format += '\n\n[EmisorDomicilioCCE]\n';
            format += getValueJson(EmisorDomicilioCCE, 'calle', 'Calle');
            format += getValueJson(EmisorDomicilioCCE, 'noExterior', 'NumeroExterior');
            format += getValueJson(EmisorDomicilioCCE, 'noInterior', 'NumeroInterior');
            format += getValueJson(EmisorDomicilioCCE, 'colonia', 'Colonia');
            format += getValueJson(EmisorDomicilioCCE, 'localidad', 'Localidad');
            format += getValueJson(EmisorDomicilioCCE, 'referencia', 'Referencia');
            format += getValueJson(EmisorDomicilioCCE, 'municipio', 'Municipio');
            format += getValueJson(EmisorDomicilioCCE, 'estado', 'Estado');
            format += getValueJson(EmisorDomicilioCCE, 'pais', 'Pais');
            format += getValueJson(EmisorDomicilioCCE, 'codigoPostal', 'CodigoPostal');

            if ( json.tipoDeComprobante == 'T' && json.MotivoTraslado == '05' ) {
                format += '\n\n[PropietarioCCE]\n';
                format += getValueJson(emisor, 'NumRegIdTrib');
                format += getValueJson(emisor, 'ResidenciaFiscal');
            }


            var Receptor = json.Receptor || {};
            var ReceptorDomicilioCCE = Receptor.DomicilioCCE || {};

            format += '\n\n[ReceptorDomicilioCCE]\n';
            format += getValueJson(ReceptorDomicilioCCE, 'calle', 'Calle');
            format += getValueJson(ReceptorDomicilioCCE, 'noExterior', 'NumeroExterior');
            format += getValueJson(ReceptorDomicilioCCE, 'noInterior', 'NumeroInterior');
            format += getValueJson(ReceptorDomicilioCCE, 'colonia', 'Colonia');
            format += getValueJson(ReceptorDomicilioCCE, 'localidad', 'Localidad');
            format += getValueJson(ReceptorDomicilioCCE, 'referencia', 'Referencia');
            format += getValueJson(ReceptorDomicilioCCE, 'municipio', 'Municipio');
            format += getValueJson(ReceptorDomicilioCCE, 'estado', 'Estado');
            format += getValueJson(ReceptorDomicilioCCE, 'pais', 'Pais');
            format += getValueJson(ReceptorDomicilioCCE, 'codigoPostal', 'CodigoPostal');
            /*
            format			+= '\n\n[DestinatarioCCE]\n';
            format			+= getValueJson(Receptor,'NumRegIdTrib');
            format			+= getValueJson(Receptor,'ResidenciaFiscal');

            format			+= '\n\n[DestinatarioDomicilioCCE]\n';
            format			+= getValueJson(ReceptorDomicilioCCE,'calle','Calle');
            format			+= getValueJson(ReceptorDomicilioCCE,'noExterior','NumeroExterior');
            format			+= getValueJson(ReceptorDomicilioCCE,'noInterior','NumeroInterior');
            format			+= getValueJson(ReceptorDomicilioCCE,'colonia','Colonia');
            format			+= getValueJson(ReceptorDomicilioCCE,'localidad','Localidad');
            format			+= getValueJson(ReceptorDomicilioCCE,'referencia','Referencia');
            format			+= getValueJson(ReceptorDomicilioCCE,'municipio','Municipio');
            format			+= getValueJson(ReceptorDomicilioCCE,'estado','Estado');
            format			+= getValueJson(ReceptorDomicilioCCE,'pais','Pais');
            format			+= getValueJson(ReceptorDomicilioCCE,'codigoPostal','CodigoPostal');
            */
            for (var i = 0; i < Conceptos.length; i++) {
                var concepto = Conceptos[i];
                format += '\n\n[MercanciaCCE#' + (i + 1) + ']\n';
                format += getValueJson(concepto, 'noIdentificacion', 'NoIdentificacion');
                format += getValueJson(concepto, 'FraccionArancelar', 'FraccionArancelaria');
                if ( concepto.cantidadAduanera ) {
                    format += getValueJson(concepto, 'cantidadAduanera', 'CantidadAduana');
                } else {
                    format += getValueJson(concepto, 'cantidad', 'CantidadAduana');
                }
                format += getValueJson(concepto, 'UnidadAduana', 'UnidadAduana');
                if ( concepto.valorUnitarioAduanero ) {
                    format += 'ValorUnitarioAduana=' + (returnNumber(concepto.valorUnitarioAduanero).toFixed(2)) + '\n';
                } else {
                    format += 'ValorUnitarioAduana=' + (returnNumber(concepto.valorUnitario).toFixed(2)) + '\n';
                }
                if ( concepto.importeAduanero ) {
                    format += 'ValorDolares=' + (returnNumber(concepto.importeAduanero).toFixed(2)) + '\n';
                } else {
                    format += 'ValorDolares=' + (returnNumber(concepto.importe).toFixed(2)) + '\n';
                }

            }

        }

//TODO: COMPLEMENTO CARTAPORTE

        if ( complementos.indexOf('7') != -1 ) {
            format += getCartaPorteModerna(json)
        }

        format += getComplemento(json, complementos);
        nlapiLogExecution("audit", "jsondetimbrado", format);
    } else {
//Encabezado
        format = '[ReciboPagos]\n';
        format += getValueJson(json, 'serie', 'Serie');
        format += getValueJson(json, 'folio', 'Folio');
        format += 'Fecha=' + stringDateTimeSFTimeZone(nlapiDateToString(new Date())) + '\n';//getValueJson(json,'fecha','Fecha');
        format += 'NoCertificado=' + num_certificado + '\n';//getValueJson(json,'noCertificado','NoCertificado');
        format += getValueJson(json, 'LugarExpedicion');

        json.UUID = getOldUUIDPayment(recordType, recordId);
        nlapiLogExecution('ERROR', 'UUID', json.UUID);
        if ( json.UUID && json.UUID.length > 0 ) {
            format += '\n[CfdiRelacionados]\n';
            if ( json.TipoRelacion ) {
                format += getValueJson(json, 'TipoRelacion');
            }
            if ( json.UUID.length > 0 ) {
                format += 'UUID=[' + json.UUID.join(',') + ']\n';
            }
        }

        format += '\n\n[Emisor]\n';
        var emisor = json.Emisor;
        format += getValueJson(emisor, 'rfc', 'Rfc');
        format += getValueJson(emisor, 'nombre', 'Nombre');
        format += getValueJson(emisor, 'RegimenFiscal');


        var receptor = json.Receptor;
        format += '\n\n[Receptor]\n';
        format += getValueJson(receptor, 'rfc', 'Rfc');
        format += getValueJson(receptor, 'nombre', 'Nombre');

        format += '\n\n[ComplementoPagos]\n';
        format += 'Version=1.0\n\n';

        var facturasResult = nlapiSearchRecord('transaction', 'customsearch_saldo_pago_fe', [new nlobjSearchFilter('internalid', null, 'is', recordId)], null);
        var facturasRela = [];
        var tipoCambioDRTran = returnNumber(nlapiLookupField(recordType, recordId, 'custbody_fe_tipo_cambio_dr'));
        for (var i = 0; i < facturasResult.length; i++) {
            var resultFac = facturasResult[i];
            var factura = resultFac.getValue('appliedToTransaction', null, 'group');
            facturasRela.push(factura);
        }
        var columns = [new nlobjSearchColumn('formulanumeric', null, 'max').setFormula('CASE WHEN {internalid} = ' + recordId + ' THEN (NVL({appliedtoforeignamount},0)/NVL({appliedtotransaction.custbody_tipo_cambio_usco},1))*NVL({custbody_pdm_record.custrecord_pdm_tipo_cambio},0) ELSE 0 END'),
            new nlobjSearchColumn('formulanumeric', null, 'sum').setFormula('CASE WHEN {internalid} = ' + recordId + ' THEN {appliedtoforeignamount} ELSE 0 END'),
            new nlobjSearchColumn('formulatext', null, 'count').setFormula("CASE WHEN {recordtype} = 'customerpayment' THEN {appliedToTransaction.internalid}||'_'||{internalid} END"),
            new nlobjSearchColumn('custbody_fe_tipo_cambio_dr', null, 'max')
        ];
        var indexMetodo = 16;
        if ( configFE.custrecord_campo_folio_pago ) {
            indexMetodo = 17;
            columns.push(new nlobjSearchColumn(configFE.custrecord_campo_folio_pago, 'appliedToTransaction', 'group'));
        }
        var pagos = nlapiSearchRecord('transaction', 'customsearch_saldo_pago_fe', [new nlobjSearchFilter('appliedToTransaction', null, 'anyof', facturasRela).setLeftParens(2),
            new nlobjSearchFilter('custbody_fe_sf_codigo_respuesta', null, 'is', 200).setFormula('TO_NUMBER(NVL({custbody_fe_sf_codigo_respuesta},0))').setOr(true).setRightParens(1),
            new nlobjSearchFilter('internalid', null, 'is', recordId).setRightParens(2).setLeftParens(1)], columns);

        var exchangeratePayment = returnNumber(nlapiLookupField(recordType, recordId, 'exchangerate'));
        var PDMExist = false;
        var PDM = '';
        try {
            PDM = nlapiLookupField(recordType, recordId, 'custbody_pdm_record');
        } catch (error) {
        }
        if ( PDM && PDM != '- None -' ) {
            var DataPDM = nlapiLookupField('customrecord_pdm', PDM, ['custrecord_pdm_codigo_moneda', 'custrecord_pdm_tipo_cambio', 'custrecord_pdm_importe_total_usd']);
            var PDMMoneda = DataPDM.custrecord_pdm_codigo_moneda;
            var PDMTipoCambio = DataPDM.custrecord_pdm_tipo_cambio;
            var PDMTotalUSD = returnNumber(DataPDM.custrecord_pdm_importe_total_usd);
            json.Moneda = PDMMoneda;
            json.TipoCambio = PDMTipoCambio;
            var decimalCurrencyHeader = mapCurrency[PDMMoneda] || '2'
            json.total = PDMTotalUSD.toFixed(decimalCurrencyHeader);
            PDMExist = true;
        }
        var documents = [];
        var series = [];
        var folios = [];
        var monedas = [];
        var tipoCambios = [];
        var metodos = [];
        var numParcials = [];
        var impsaldoAnt = [];
        var impPago = [];
        var impSaldo = [];
        var hashMoneda = {};
        var dataPagos = {};
        for (var i = 0; i < pagos.length; i++) {
            var pago = pagos[i];
            var columns = pago.getAllColumns();
            var document = pago.getValue('custbody_fe_uuid_cfdi_33', 'appliedToTransaction', 'group');
            var tipoCambioDR = tipoCambioDRTran;
            var saldo = returnNumber(pago.getValue('appliedtoforeignamount', null, 'sum'));
            var folio = pago.getValue('tranid', 'appliedToTransaction', 'group');
            if ( configFE.custrecord_campo_folio_pago ) {
                folio = pago.getValue(configFE.custrecord_campo_folio_pago, 'appliedToTransaction', 'group');
            }
            var serie = pago.getValue('custbody_fe_serie', 'appliedToTransaction', 'group');
            var moneda = pago.getValue('currency', 'appliedToTransaction', 'group');
            var currency_symbol = hashMoneda[moneda];
            if ( !currency_symbol ) {
                currency_symbol = returnBlank(nlapiLookupField('currency', moneda, 'symbol', false));
                hashMoneda[moneda] = currency_symbol;
            }
            var decimalCurrency = mapCurrency[currency_symbol] || '2';
            var tipoCambio = returnNumber(pago.getValue('exchangerate', 'appliedToTransaction', 'group'));
            var numParcial = pago.getValue('formulatext', null, 'count');
            var importe = returnNumber(pago.getValue('fxamount', 'appliedToTransaction', 'group'));
            var saldoImp = returnNumber((importe - saldo).toFixed(decimalCurrency));
            var pagoSaldo = returnNumber(pago.getValue('formulanumeric', null, 'sum'));
            if ( PDMExist ) {
                var saldoAnterior = importe - (saldo - pagoSaldo);
                pagoSaldo = returnNumber(pago.getValue(columns[0]));
                if ( (saldoAnterior - pagoSaldo) < 0 ) {
                    pagoSaldo = saldoAnterior;
                }
                saldoImp = returnNumber((saldoAnterior - pagoSaldo).toFixed(decimalCurrency));
            }
            var metodo = pago.getValue(columns[indexMetodo]);
            if ( document == '- None -' || document == '' ) {
                document = pago.getValue('custbody_ce_uuid_cfdi', 'appliedToTransaction', 'group');
            }
            if ( document == '- None -' || document == '' ) {
                throw    nlapiCreateError('ERROR_INVALID_UUID', 'UUID INVALID ' + folio, false);
            }
            documents.push(document);
            series.push(serie == '- None -' ? '' : serie);
            folios.push(folio == '- None -' ? '' : folio);
            monedas.push(currency_symbol);
            tipoCambios.push((json.Moneda == currency_symbol) ? '' : (tipoCambioDR ? tipoCambioDR : (returnNumber(json.TipoCambio) / exchangeratePayment)).toFixed(6));
            metodos.push(metodo);
            numParcials.push(numParcial);
            impsaldoAnt.push((saldoImp + pagoSaldo).toFixed(decimalCurrency));
            impPago.push(pagoSaldo.toFixed(decimalCurrency));
            impSaldo.push(saldoImp.toFixed(decimalCurrency));
            dataPagos[document] = dataPagos[document] || {};
            dataPagos[document].impsaldoAnt = returnNumber(impsaldoAnt[impsaldoAnt.length - 1]);
            dataPagos[document].impPago = returnNumber(impPago[impPago.length - 1]);
            dataPagos[document].impSaldo = returnNumber(impSaldo[impSaldo.length - 1]);
            dataPagos[document].numParcials = parseInt(numParcials[numParcials.length - 1]);

        }
        format += '\n\n[Pago#' + 1 + ']\n';
        format += getValueJson(json, 'fecha', 'FechaPago');
        format += getValueJson(json, 'metodoDePago', 'FormaDePagoP');
        format += getValueJson(json, 'Moneda', 'MonedaP');
        if ( json.Moneda != 'MXN' )
            format += getValueJson(json, 'TipoCambio', 'TipoCambioP');
        format += getValueJson(json, 'total', 'Monto');
        format += getValueJson(json, 'NumOperacion');
        format += getValueJson(json, 'RfcEmisorCtaOrd');
        format += getValueJson(json, 'NomBancoOrdExt');
        format += getValueJson(json, 'CtaOrdenante');
        format += getValueJson(json, 'RfcEmisorCtaBen');
        format += getValueJson(json, 'CtaBeneficiario');
        format += getValueJson(json, 'TipoCadPago');
        format += getValueJson(json, 'CertPago');
        format += getValueJson(json, 'CadPago');
        format += getValueJson(json, 'SelloPago');
        format += 'NumDoctosRelacionados=' + documents.length + '\n';

        format += '\nDoctoRelacionado.IdDocumento=[' + documents.join(',') + ']\n';
        format += 'DoctoRelacionado.Serie=[' + series.join(',') + ']\n';
        format += 'DoctoRelacionado.Folio=[' + folios.join(',') + ']\n';
        format += 'DoctoRelacionado.MonedaDR=[' + monedas.join(',') + ']\n';
//if(json.Moneda != 'MXN')
        format += 'DoctoRelacionado.TipoCambioDR=[' + tipoCambios.join(',') + ']\n';
        format += 'DoctoRelacionado.MetodoDePagoDR=[' + metodos.join(',') + ']\n';
        format += 'DoctoRelacionado.NumParcialidad=[' + numParcials.join(',') + ']\n';
        format += 'DoctoRelacionado.ImpSaldoAnt=[' + impsaldoAnt.join(',') + ']\n';
        format += 'DoctoRelacionado.ImpPagado=[' + impPago.join(',') + ']\n';
        format += 'DoctoRelacionado.ImpSaldoInsoluto=[' + impSaldo.join(',') + ']\n';


//Complemento de Facturage
        var pagosFactorage = nlapiSearchRecord("transaction", null, [
                new nlobjSearchFilter("mainline", null, 'is', 'T'),
                new nlobjSearchFilter("custbody_fe_imr_pago_prin_factoraje", null, 'anyof', [recordId])],
            [new nlobjSearchColumn("internalid"), new nlobjSearchColumn("custbody_json_fe_comprobante_33")]) || [];
        for (var p = 0; p < pagosFactorage.length; p++) {
            var result = pagosFactorage[p];
            var jsonFactorage = result.getValue("custbody_json_fe_comprobante_33") || '{}';
            jsonFactorage = JSON.parse(jsonFactorage);
            var idFactorage = result.getId();
            var recordTypeFactorage = result.getRecordType();
            var facturasResult = nlapiSearchRecord('transaction', 'customsearch_saldo_pago_fe', [new nlobjSearchFilter('internalid', null, 'is', recordId)], null);
            var facturasRela = [];
            var tipoCambioDRTran = returnNumber(nlapiLookupField(recordTypeFactorage, idFactorage, 'custbody_fe_tipo_cambio_dr'));
            for (var i = 0; i < facturasResult.length; i++) {
                var resultFac = facturasResult[i];
                var factura = resultFac.getValue('appliedToTransaction', null, 'group');
                facturasRela.push(factura);
            }
            var columns = [new nlobjSearchColumn('formulanumeric', null, 'max').setFormula('CASE WHEN {internalid} = ' + idFactorage + ' THEN (NVL({appliedtoforeignamount},0)/NVL({appliedtotransaction.custbody_tipo_cambio_usco},1))*NVL({custbody_pdm_record.custrecord_pdm_tipo_cambio},0) ELSE 0 END'),
                new nlobjSearchColumn('formulanumeric', null, 'sum').setFormula('CASE WHEN {internalid} = ' + idFactorage + ' THEN {appliedtoforeignamount} ELSE 0 END'),
                new nlobjSearchColumn('formulatext', null, 'count').setFormula("CASE WHEN {recordtype} = 'customerpayment' THEN {appliedToTransaction.internalid}||'_'||{internalid} END"),
                new nlobjSearchColumn('custbody_fe_tipo_cambio_dr', null, 'max')
            ];
            var indexMetodo = 16;
            if ( configFE.custrecord_campo_folio_pago ) {
                indexMetodo = 17;
                columns.push(new nlobjSearchColumn(configFE.custrecord_campo_folio_pago, 'appliedToTransaction', 'group'));
            }
            var pagos = nlapiSearchRecord('transaction', 'customsearch_saldo_pago_fe', [new nlobjSearchFilter('appliedToTransaction', null, 'anyof', facturasRela).setLeftParens(2),
                new nlobjSearchFilter('custbody_fe_sf_codigo_respuesta', null, 'is', 200).setFormula('TO_NUMBER(NVL({custbody_fe_sf_codigo_respuesta},0))').setOr(true).setRightParens(1),
                new nlobjSearchFilter('internalid', null, 'is', idFactorage).setRightParens(2).setLeftParens(1)], columns);

            var exchangeratePayment = returnNumber(nlapiLookupField(recordTypeFactorage, idFactorage, 'exchangerate'));
            var PDMExist = false;
            var PDM = '';
            try {
                PDM = nlapiLookupField(recordTypeFactorage, idFactorage, 'custbody_pdm_record');
            } catch (error) {
            }
            if ( PDM && PDM != '- None -' ) {
                var DataPDM = nlapiLookupField('customrecord_pdm', PDM, ['custrecord_pdm_codigo_moneda', 'custrecord_pdm_tipo_cambio', 'custrecord_pdm_importe_total_usd']);
                var PDMMoneda = DataPDM.custrecord_pdm_codigo_moneda;
                var PDMTipoCambio = DataPDM.custrecord_pdm_tipo_cambio;
                var PDMTotalUSD = returnNumber(DataPDM.custrecord_pdm_importe_total_usd);
                json.Moneda = PDMMoneda;
                json.TipoCambio = PDMTipoCambio;
                var decimalCurrencyHeader = mapCurrency[PDMMoneda] || '2'
                json.total = PDMTotalUSD.toFixed(decimalCurrencyHeader);
                PDMExist = true;
            }
            var documents = [];
            var series = [];
            var folios = [];
            var monedas = [];
            var tipoCambios = [];
            var metodos = [];
            var numParcials = [];
            var impsaldoAnt = [];
            var impPago = [];
            var impSaldo = [];
            var hashMoneda = {};
            for (var i = 0; i < pagos.length; i++) {
                var pago = pagos[i];
                var columns = pago.getAllColumns();
                var document = pago.getValue('custbody_fe_uuid_cfdi_33', 'appliedToTransaction', 'group');
                var tipoCambioDR = tipoCambioDRTran;
                var saldo = returnNumber(pago.getValue('appliedtoforeignamount', null, 'sum'));
                var folio = pago.getValue('tranid', 'appliedToTransaction', 'group');
                if ( configFE.custrecord_campo_folio_pago ) {
                    folio = pago.getValue(configFE.custrecord_campo_folio_pago, 'appliedToTransaction', 'group');
                }
                var serie = pago.getValue('custbody_fe_serie', 'appliedToTransaction', 'group');
                var moneda = pago.getValue('currency', 'appliedToTransaction', 'group');
                var currency_symbol = hashMoneda[moneda];
                if ( !currency_symbol ) {
                    currency_symbol = returnBlank(nlapiLookupField('currency', moneda, 'symbol', false));
                    hashMoneda[moneda] = currency_symbol;
                }
                var decimalCurrency = mapCurrency[currency_symbol] || '2';
                var tipoCambio = returnNumber(pago.getValue('exchangerate', 'appliedToTransaction', 'group'));
                var numParcial = pago.getValue('formulatext', null, 'count');
                var importe = returnNumber(pago.getValue('fxamount', 'appliedToTransaction', 'group'));
                var saldoImp = returnNumber((importe - saldo).toFixed(decimalCurrency));
                var pagoSaldo = returnNumber(pago.getValue('formulanumeric', null, 'sum'));
                if ( PDMExist ) {
                    var saldoAnterior = importe - (saldo - pagoSaldo);
                    pagoSaldo = returnNumber(pago.getValue(columns[0]));
                    if ( (saldoAnterior - pagoSaldo) < 0 ) {
                        pagoSaldo = saldoAnterior;
                    }
                    saldoImp = returnNumber((saldoAnterior - pagoSaldo).toFixed(decimalCurrency));
                }
                var metodo = pago.getValue(columns[indexMetodo]);
                if ( document == '- None -' || document == '' ) {
                    document = pago.getValue('custbody_ce_uuid_cfdi', 'appliedToTransaction', 'group');
                }
                if ( document == '- None -' || document == '' ) {
                    throw    nlapiCreateError('ERROR_INVALID_UUID', 'UUID INVALID ' + folio, false);
                }
                var documentoPadre = dataPagos[document] || {};
                if ( documentoPadre ) {
                    saldoImp = returnNumber((documentoPadre.impSaldo - pagoSaldo).toFixed(decimalCurrency));
                    numParcial = documentoPadre.numParcials ? (1 + parseInt(documentoPadre.numParcials)) : numParcial;
                }
                documents.push(document);
                series.push(serie == '- None -' ? '' : serie);
                folios.push(folio == '- None -' ? '' : folio);
                monedas.push(currency_symbol);
                tipoCambios.push((json.Moneda == currency_symbol) ? '' : (tipoCambioDR ? tipoCambioDR : (returnNumber(json.TipoCambio) / exchangeratePayment)).toFixed(6));
                metodos.push(metodo);
                numParcials.push(numParcial);
                impsaldoAnt.push((saldoImp + pagoSaldo).toFixed(decimalCurrency));
                impPago.push(pagoSaldo.toFixed(decimalCurrency));
                impSaldo.push(saldoImp.toFixed(decimalCurrency));
                if ( documentoPadre ) {
                    documentoPadre.impsaldoAnt = returnNumber(impsaldoAnt[impsaldoAnt.length - 1]);
                    documentoPadre.impPago = returnNumber(impPago[impPago.length - 1]);
                    documentoPadre.impSaldo = returnNumber(impSaldo[impSaldo.length - 1]);
                    documentoPadre.numParcials = parseInt(numParcials[numParcials.length - 1]);
                }
            }
            format += '\n\n[Pago#' + ((p + 2).toFixed(0)) + ']\n';
            format += getValueJson(jsonFactorage, 'fecha', 'FechaPago');
            format += getValueJson(jsonFactorage, 'metodoDePago', 'FormaDePagoP');
            format += getValueJson(jsonFactorage, 'Moneda', 'MonedaP');
            if ( jsonFactorage.Moneda != 'MXN' )
                format += getValueJson(jsonFactorage, 'TipoCambio', 'TipoCambioP');
            format += getValueJson(jsonFactorage, 'total', 'Monto');
            format += getValueJson(jsonFactorage, 'NumOperacion');
            format += getValueJson(jsonFactorage, 'RfcEmisorCtaOrd');
            format += getValueJson(jsonFactorage, 'NomBancoOrdExt');
            format += getValueJson(jsonFactorage, 'CtaOrdenante');
            format += getValueJson(jsonFactorage, 'RfcEmisorCtaBen');
            format += getValueJson(jsonFactorage, 'CtaBeneficiario');
            format += getValueJson(jsonFactorage, 'TipoCadPago');
            format += getValueJson(jsonFactorage, 'CertPago');
            format += getValueJson(jsonFactorage, 'CadPago');
            format += getValueJson(jsonFactorage, 'SelloPago');
            format += 'NumDoctosRelacionados=' + documents.length + '\n';

            format += '\nDoctoRelacionado.IdDocumento=[' + documents.join(',') + ']\n';
            format += 'DoctoRelacionado.Serie=[' + series.join(',') + ']\n';
            format += 'DoctoRelacionado.Folio=[' + folios.join(',') + ']\n';
            format += 'DoctoRelacionado.MonedaDR=[' + monedas.join(',') + ']\n';
//if(json.Moneda != 'MXN')
            format += 'DoctoRelacionado.TipoCambioDR=[' + tipoCambios.join(',') + ']\n';
            format += 'DoctoRelacionado.MetodoDePagoDR=[' + metodos.join(',') + ']\n';
            format += 'DoctoRelacionado.NumParcialidad=[' + numParcials.join(',') + ']\n';
            format += 'DoctoRelacionado.ImpSaldoAnt=[' + impsaldoAnt.join(',') + ']\n';
            format += 'DoctoRelacionado.ImpPagado=[' + impPago.join(',') + ']\n';
            format += 'DoctoRelacionado.ImpSaldoInsoluto=[' + impSaldo.join(',') + ']\n';
        }


    }
    nlapiLogExecution("DEBUG", "JSONFORMAT", format);
    return format;

}


function getCartaPorteModerna(data) {
    var cartaportejson = data.CartaPorte;
    cartaportejson = cartaportejson.jsonCartaPorte;
    var txtFormat = "\n;Seccion Carta Porte V2.0\n" +
        "[CartaPorteV2]\n" +
        getJsonCompAtrib(cartaportejson) +
        "\n";

    var cpCont = 0;

    var cartaportejson = data.CartaPorte;
    cartaportejson = cartaportejson.jsonCartaPorte;


    for (var key in cartaportejson.Ubicaciones) {
        var Ubicacion = cartaportejson.Ubicaciones[key];
// origen
        if ( Ubicacion.Origen ) {
            cpCont++;
            txtFormat += '[CPUbicacion#' + cpCont + ']\n';
            txtFormat += getJsonCompAtrib(Ubicacion) + '' +
                getJsonCompAtrib(Ubicacion.Origen, "") + '' +
                getJsonCompAtrib(Ubicacion.Domicilio, "Domicilio") + '\n';
        }
// destino
        else if ( Ubicacion.Destino ) {
            cpCont++;
            txtFormat += '[CPUbicacion#' + cpCont + ']\n';
            txtFormat += getJsonCompAtrib(Ubicacion) + '';
            txtFormat += getJsonCompAtrib(Ubicacion.Destino, "") + '' +
                getJsonCompAtrib(Ubicacion.Domicilio, "Domicilio") + '\n';
        }
    }
    txtFormat += "";

// SECCION DE MERCANCIAS

    var cpCont = 0;
// SECCION DE MERCANCIAS
    txtFormat += '[CPMercancias]\n' + getJsonCompAtrib(cartaportejson.Mercancias) + '';

    for (var Mercancia in cartaportejson.Mercancias.Mercancia) {
        var dataMercancia = cartaportejson.Mercancias.Mercancia[Mercancia];
        cpCont++;
        txtFormat += '[CPMercancia#' + cpCont + ']\n';
        txtFormat += getJsonCompAtrib(dataMercancia) + '';
        if ( dataMercancia.CantidadTransporta ) {
            if ( dataMercancia.CantidadTransporta.Cantidad )
                txtFormat += "CantidadTransporta.Cantidad=[" + dataMercancia.CantidadTransporta.Cantidad + ']\n';
            if ( dataMercancia.CantidadTransporta.IDOrigen )
                txtFormat += "CantidadTransporta.IDOrigen=[" + dataMercancia.CantidadTransporta.IDOrigen + ']\n';
            if ( dataMercancia.CantidadTransporta.IDDestino )
                txtFormat += "CantidadTransporta.IDDestino=[" + dataMercancia.CantidadTransporta.IDDestino + ']\n';
            if ( dataMercancia.CantidadTransporta.CvesTransporte )
                txtFormat += "CantidadTransporta.CvesTransporte=[" + dataMercancia.CantidadTransporta.CvesTransporte + ']\n';


        }
        if ( dataMercancia.DetalleMercancia )
            txtFormat += getJsonCompAtrib(dataMercancia.DetalleMercancia, "DetalleMercancia") + '';

        txtFormat += "\n";
    }

    if ( cartaportejson.Mercancias.AutotransporteFederal ) {
        txtFormat += '[CPAutotransporte]\n';
        txtFormat += getJsonCompAtrib(cartaportejson.Mercancias.AutotransporteFederal) + '';
        txtFormat += getJsonCompAtrib(cartaportejson.Mercancias.AutotransporteFederal.IdentificacionVehicular, "IdentificacionVehicular") + '';
        txtFormat += getJsonCompAtrib(cartaportejson.Mercancias.AutotransporteFederal.Seguros, "Seguros") + '';
// parte de remolque
        if ( cartaportejson.Mercancias.AutotransporteFederal.Remolques ) {
            for (var remolque in cartaportejson.Mercancias.AutotransporteFederal.Remolques) {
                var dataRemolque = cartaportejson.Mercancias.AutotransporteFederal.Remolques[remolque];
                if ( dataRemolque.Remolque ) {
                    txtFormat += "Remolque.SubTipoRem=[" + dataRemolque.Remolque.SubTipoRem + ']\n';
                    txtFormat += "Remolque.Placa=[" + dataRemolque.Remolque.Placa + ']\n';
                }
            }
        }
        txtFormat += "\n";
    }

// SECCION de FIGUURA

    var cpCont = 0;
    if ( cartaportejson.FiguraTransporte ) {
        var cpCont = 0;
        for (var operador in cartaportejson.FiguraTransporte.TiposFigura) {
            cpCont++;
            var dataOperador = cartaportejson.FiguraTransporte.TiposFigura[operador];
            if ( dataOperador.PartesTransporte ) {
                txtFormat += '[CPFiguraTransporte#' + cpCont + ']\n' +
                    getJsonCompAtrib(dataOperador)+
                    "PartesTransporte.ParteTransporte="+dataOperador.PartesTransporte.ParteTransporte+"\n";
            } else {
                txtFormat += '[CPFiguraTransporte#' + cpCont + ']\n' +
                    getJsonCompAtrib(dataOperador);
            }
        }
    }
    return txtFormat;

}


String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * transforma todo los datos que no sean objetos en atributos
 * @param nodoCartaPorte
 * @param nodopapa
 * @param onlyvalue
 * @return {string}
 */
function getJsonCompAtrib(nodoCartaPorte, nodopapa, onlyvalue) {
    var attributes = [];
    for (var key in nodoCartaPorte) {
        var data = nodoCartaPorte[key];
        if ( !(data instanceof Object) && data ) {
            var label = nodopapa ? nodopapa + "." + key : key;
            attributes.push({label: label, field: key});
        }
    }
    return getAtributesTxt(attributes, nodoCartaPorte, nodopapa, onlyvalue)
}


function getAtributesTxt(atributes, object, nodopapa, onlyvalue) {
    var attr = "";
    for (var i = 0; i < atributes.length; i++) {
        var atribute = atributes[i];
        attr += "" + getValueJson(object, atribute.field, atribute.label, atribute.callback, onlyvalue);
    }
    return attr;
}

function getValueJson(json, field, label, callback, onlyvalue) {
    var value = json[field];
    if ( !callback ) {
        callback = function (value) {
            return value
        };
    }
    if ( Array.isArray(value) ) {
        var aux = [];
        for (var i = 0; i < value.length; i++) {
            aux.push(value[i]);
        }
        value = aux.join(',');
    }
    if ( onlyvalue )
        return value;
    return formatXML(value, field, label, callback);
}

function formatXML(value, field, label, callback) {
    return (label || field) + '=' + (callback(getFormatINI(value))) + '\n';
}


function getFormatINI(value) {
    try {
        value = value.toString();
    } catch (error) {
        value = '';
    }
    return value.replaceAll('\r\n', ' ').replaceAll('\r', ' ').replaceAll('\n', ' ').replaceAll(',', ' ').replaceAll(';', ' ');
}


function stringDateTimeSFTimeZone(value, timezone, opc) {
    var f = nlapiStringToDate(value, 'datetimetz');
    if ( timezone )
        f = getZoneTimeZone(f, timezone);
    var y = f.getFullYear();
    var m = completarCeros(f.getMonth() + 1, 1);
    var d = completarCeros(f.getDate(), 1);
    var date = new Date();
    var hh = completarCeros(date.getHours(), 1);
    var mm = completarCeros(date.getMinutes(), 1);
    var ss = completarCeros(date.getSeconds(), 1);
    var DateTimeSF = "";
    switch ( opc ) {
        case 1:
            DateTimeSF = y + '-' + m + '-' + d;
            break;
        default:

            DateTimeSF = y + '-' + m + '-' + d + 'T' + hh + ':' + mm + ':' + ss;
            break;
    }
    return DateTimeSF;
}

function getMapCurrency() {
    var mapCurrency = {};
    var searchCurrencySat = nlapiSearchRecord('customrecord_fe_monedas_sat', null, null, [new nlobjSearchColumn('name'), new nlobjSearchColumn('custrecord_fe_moneda_decimales')]) || [];
    for (var i = 0; i < searchCurrencySat.length; i++) {
        var resultCurrency = searchCurrencySat[i];
        var currency = resultCurrency.getValue('name');
        var decimal = resultCurrency.getValue('custrecord_fe_moneda_decimales') || '2';
        mapCurrency[currency] = decimal;
    }
    return mapCurrency;
}

function getTotalTraslado(Conceptos, tipoCambioCCE) {
    var total = 0;
    for (var i = 0; i < Conceptos.length; i++) {
        var concepto = Conceptos[i];
        total += returnNumber(concepto.importe);
    }
    return (total / tipoCambioCCE).toFixed(2);
}


function getJSONComplemento() {
    return {
        2: {
            name: 'INE',
            nameTemplate: 'ComplementoINE',
            fields: [{jsonField: 'TipoProceso', templateField: 'TipoProceso', callback: null}, {
                jsonField: 'TipoComite',
                templateField: 'TipoComite',
                callback: null
            }, {jsonField: 'IdContabilidad', templateField: 'IdContabilidad', callback: null}],
            fieldsLine: [{
                jsonField: 'Entidades',
                templateField: 'Entidad',
                incluirNum: true,
                prefijo: '#',
                fields: [{jsonField: 'ClaveEntidad', templateField: 'ClaveEntidad', callback: null}, {
                    jsonField: 'Ambito',
                    templateField: 'Ambito',
                    callback: null
                }, {
                    jsonField: 'IdContabilidad', templateField: 'IdContabilidad', callback: function (value) {
                        return (value || '').split(' ').join(',')
                    }
                }]
            }]
        }
    }
}

function getComplemento(json, complementos) {
    var template = '';
    var jsonComplementosMap = getJSONComplemento();
    for (var i = 0; i < complementos.length; i++) {
        var complemento = complementos[i];
        var jsonComplemento = jsonComplementosMap[complemento];
        if ( jsonComplemento ) {
            var dataJson = json[jsonComplemento.name] || {};
            template += '\n';
            template += '[' + jsonComplemento.nameTemplate + ']\n';
            for (var j = 0; j < jsonComplemento.fields.length; j++) {
                var field = jsonComplemento.fields[j];
                template += getValueJson(dataJson, field.jsonField, field.templateField || field.jsonField, field.callback);
            }
            template += '\n';
            for (var j = 0; j < jsonComplemento.fieldsLine.length; j++) {
                var List = jsonComplemento.fieldsLine[j];
                var ListData = dataJson[List.jsonField] || [];
                for (var r = 0; r < ListData.length; r++) {
                    template += '[' + List.templateField + (List.prefijo || '') + (List.incluirNum ? (r + 1) : '') + ']\n\n';
                    var data = ListData[r];
                    for (var n = 0; n < List.fields.length; n++) {
                        var field = List.fields[n];
                        template += getValueJson(data, field.jsonField, field.templateField || field.jsonField, field.callback);
                    }
                }
            }
        }
    }
    nlapiLogExecution("ERROR", "JSONFORMATCOMPLEMENTOS", template);
    return template;
}
