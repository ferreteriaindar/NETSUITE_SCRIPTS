/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope Public
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERROS
 */

define(['N/error', 'N/record', 'N/format', 'N/search', 'N/log','N/file','N/runtime','N/sftp'], function (error, record, format, search, log,file,runtime,sftp) {

    var handler = {};

    const ERRORS = {
        NSO_NULL_FIELD: { name: 'NSO_NULL_FIELD', message: 'El campo es requerido' },
        NSO_LOST_PARAMETER: { name: 'NSO_LOST_PARAMETER', message: 'Parámetro vacío' }
    };



    handler.post = function (context) {
        try{
            var embarque= record.create({
                type:'customrecordcustomrecord_embarque',
                isDynamic: true
            });
           embarque.setValue('custrecordcustomrecord_embarque_comentar',context.custrecordcustomrecord_embarque_comentar);
           embarque.setValue('custrecordcustomrecord_embarque_formaenv',context.custrecordcustomrecord_embarque_formaenv);
           embarque.setValue('custrecordcustomrecord_embarque_fletera',context.custrecordcustomrecord_embarque_fletera);
           embarque.setValue('custrecordcustomrecord_embarque_asignar',context.custrecordcustomrecord_embarque_asignar);
           embarque.setValue('custrecordcustomrecord_embarque_estatus',context.custrecordcustomrecord_embarque_estatus);
           embarque.setValue('custrecord151',context.custrecord151);
           if(context.custrecordcustomrecord_embarque_estatus=='CONCLUIDO')
           {
                embarque.setValue('custrecordcustomrecord_embarque_fechacon',context.custrecordcustomrecord_embarque_fechacon);
           }
           embarque.save({ ignoreMandatoryFields: true });
           insertaEmbarqueD(context,embarque);
           enviaFTP(embarque);
           return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'EMBARQUE REALIZADO' }, 'internalId': embarque.id };


        } catch (e) {
            // error("error creating sales order: " + salesOrderInternalId)
            log.error('POST2', JSON.stringify(e));
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR EMBRQUE .'+e.message }, 'internalId': '' };
        }
    };

    function insertaEmbarqueD(context,embarque)
    {
           // var tamaño=  context.getLineCount( { sublistId: 'lines' } );
           var lines = context.lines;
            for ( var i = 0 ; i < lines.length ; i++) {
                    var embarqueD= record.create({
                        type:'customrecordcustomrecord_embarqued',
                        isDynamic: true
                    });
                    embarqueD.setValue('custrecordcustomrecord_embarqued_embid',embarque.id);
                    embarqueD.setValue('custrecordcustomrecord_embarqued_factura',lines[i].custrecordcustomrecord_embarqued_factura);
                    embarqueD.setValue('custrecordcustomrecord_embarqued_status',lines[i].custrecordcustomrecord_embarqued_status);
                    if(lines[i].custrecordcustomrecord_embarqued_status=='ENTREGADO')
                    {
                        if(context.hasOwnProperty('custrecordcustomrecord_embarqued_fechah') && lines[i].custrecordcustomrecord_embarqued_fechah){
                            var receipt_date = format.parse( lines[i].custrecordcustomrecord_embarqued_fechah, 'date' );
                        embarqueD.setValue('custrecordcustomrecord_embarqued_fechah',receipt_date);
                        }
                    }
                    embarqueD.setValue('custrecordcustomrecord_embarqued_comenta',lines[i].custrecordcustomrecord_embarqued_comenta);
                    embarqueD.save({ ignoreMandatoryFields: true });
            }

    }

    function enviaFTP(embarque)
    {
            try{
        var embarqueIndar= record.load({
            type:'customrecordcustomrecord_embarque',
            id:embarque.id

        });

        var tamaño         = embarqueIndar.getLineCount({sublistId:'recmachcustrecordcustomrecord_embarqued_embid'});
          var lineas          = [];
          for ( var i = 0 ; i < tamaño ; i++) {

            lineas.push( {
                idEmbarque:     Number(embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'custrecordcustomrecord_embarqued_embid' } )),
                factura:        embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'custrecordcustomrecord_embarqued_factura' } ),
                estado:         embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'custrecordcustomrecord_embarqued_status' } ),
               persona:         embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'custrecordcustomrecord_embarqued_persona' } ),
               fechaHora:        embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'custrecordcustomrecord_embarqued_fechah' } ),
               comentarios:     embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'custrecordcustomrecord_embarqued_comenta' } ),
               idEmbarqueD:    embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'id' } )
            });
        }


        var embarqueJson={};
         embarqueJson={
             entity_id: embarqueIndar.getValue( { fieldId: 'custrecordcustomrecord_embarque_asignar' } ),
             fecha:     embarqueIndar.getValue( {  fieldId: 'custrecordcustomrecord_embarque_fecha' } ),
             comentarios: embarqueIndar.getValue( {  fieldId: 'custrecordcustomrecord_embarque_comentar' } ),
             idEmbarque: embarqueIndar.getValue( { fieldId: 'id' } ),
             estatus:   embarqueIndar.getValue( {  fieldId: 'custrecordcustomrecord_embarque_estatus' } ),
             idPaqueteria:  embarqueIndar.getValue( { fieldId: 'custrecordcustomrecord_embarque_fletera' } ),
             fechaConcluido: embarqueIndar.getValue( {  fieldId: 'custrecordcustomrecord_embarque_fechacon' } ),
             usuario: embarqueIndar.getValue( {fieldId: 'custrecord151' } )
            

          };
          
            embarqueJson.lineItems= { item:lineas };
            embarqueJson = JSON.stringify(embarqueJson);
            var archivo = generaArchivo(embarqueJson,embarque.id);

            /******************SERVICIO  FTP */
            //d8767df5fe904884a877a7eb4ba017af
            //AAAAB3NzaC1yc2EAAAABIwAAAIEA1JUi/fJG26oES9hJSWDrvw7CXvXJXmCUwSWqWMZqXHgrCKmAKZE+GfPpWCiMegFw1eXZslL4mO6tWRK6hprXfzQTmXFkERi7zbjMyPcNjcNvWxa6EjkRJkbkpTnMpqaG2c2MLIErwuUTa1xH1gntEyxJ0CjPuHmsZE/MMERTYbk=
            var myPswGuid = "5c6a41ed4df14ce296b7515516a07ad7";
            var myHostKey = "AAAAB3NzaC1yc2EAAAABIwAAAIEA1JUi/fJG26oES9hJSWDrvw7CXvXJXmCUwSWqWMZqXHgrCKmAKZE+GfPpWCiMegFw1eXZslL4mO6tWRK6hprXfzQTmXFkERi7zbjMyPcNjcNvWxa6EjkRJkbkpTnMpqaG2c2MLIErwuUTa1xH1gntEyxJ0CjPuHmsZE/MMERTYbk=";
            var conn = sftp.createConnection(//valoresFTP
                {
                    username: 'netsuite',
                    passwordGuid: myPswGuid,
                    url: 'indarftp.dyndns.org',
                    port: 7000,
                    directory: '/WMS/EMBARQUE',
                    hostKey: myHostKey,
                    hostKeyType: 'rsa'
                });

///c7e20831f1e5414fbb78b3706953fea1
//AAAAB3NzaC1yc2EAAAABIwAAAIEA1JUi/fJG26oES9hJSWDrvw7CXvXJXmCUwSWqWMZqXHgrCKmAKZE+GfPpWCiMegFw1eXZslL4mO6tWRK6hprXfzQTmXFkERi7zbjMyPcNjcNvWxa6EjkRJkbkpTnMpqaG2c2MLIErwuUTa1xH1gntEyxJ0CjPuHmsZE/MMERTYbk=
            conn.upload({
                'file': file.load( { id: archivo } ),
                'replaceExisting': true
            });


        }catch(e)
        {
            log.error('POST2', JSON.stringify(e));
            return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'ERROR JSON Y/O  FTP .'+e.message }, 'internalId': '' };

        }


            /****FIN DEL SERVICIO  FTP */

    }

    function generaArchivo(contenido, nombreArchivo) {

        var fileObjPDF = null,
            fileObj = file.create({
                name: nombreArchivo + '.json',
                fileType: file.Type.PLAINTEXT,
                contents: contenido,
                description: 'Archivo .json integracion  EMBARQUES',
                encoding: file.Encoding.UTF8,
                folder: 202,
                isOnline: true
            });
        return fileObj.save();
    }



    handler.put = function (context) {

        try{
        var embarqueIndar= record.load({
            type:'customrecordcustomrecord_embarque',
            id:context.idEmbarque

        });

        if(context.estatus)
        embarqueIndar.setValue({fieldId:'custrecordcustomrecord_embarque_estatus', value: context.estatus})
        if(context.fechaConcluido)
        embarqueIndar.setValue({fieldId:'custrecordcustomrecord_embarque_fechacon', value: context.fechaConcluido})
       
       


        var tamaño         = embarqueIndar.getLineCount({sublistId:'recmachcustrecordcustomrecord_embarqued_embid'});
        var detalle= context.lines;
        for ( var i = 0 ; i < detalle.length ; i++) {
                /*
            if(detalle[i].custrecordcustomrecord_embarqued_status)
            embarqueIndar.setCurrentSublistValue('recmachcustrecordcustomrecord_embarqued_embid','custrecordcustomrecord_embarqued_status',detalle[i].custrecordcustomrecord_embarqued_status);
            if(detalle[i].custrecordcustomrecord_embarqued_persona)
            embarqueIndar.setCurrentSublistValue('recmachcustrecordcustomrecord_embarqued_embid','custrecordcustomrecord_embarqued_persona',detalle[i].custrecordcustomrecord_embarqued_persona);
            if(detalle[i].custrecordcustomrecord_embarqued_fechah)
            embarqueIndar.setCurrentSublistValue('recmachcustrecordcustomrecord_embarqued_embid','custrecordcustomrecord_embarqued_fechah',detalle[i].custrecordcustomrecord_embarqued_fechah);
            if(detalle[i].custrecordcustomrecord_embarqued_comenta)
            embarqueIndar.setCurrentSublistValue('recmachcustrecordcustomrecord_embarqued_embid','custrecordcustomrecord_embarqued_comenta',detalle[i].custrecordcustomrecord_embarqued_comenta);
            embarqueIndar.commitLine('recmachcustrecordcustomrecord_embarqued_embid');
            // log.error('id embarqueD',embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'id' } ) );
                    */
           var embarqueD = record.load({
            type:'customrecordcustomrecord_embarqued',
            id:embarqueIndar.getSublistValue( { sublistId: 'recmachcustrecordcustomrecord_embarqued_embid', line: i, fieldId: 'id' } )

        });
                embarqueD.setValue({fieldId:'custrecordcustomrecord_embarqued_status', value: detalle[i].custrecordcustomrecord_embarqued_status});
                if(context.custrecordcustomrecord_embarqued_comenta)
                embarqueD.setValue({fieldId:'custrecordcustomrecord_embarqued_comenta', value: detalle[i].custrecordcustomrecord_embarqued_comenta});
                
                embarqueD.save({ignoreMandatoryFields:true})


        }
            embarqueIndar.save({ ignoreMandatoryFields: true });
            enviaFTP(embarqueIndar);
            return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'EMBARQUE ACTUALIZADO' }, 'internalId': embarqueIndar.id };

    }catch(e)
    {
        log.error('POST2', JSON.stringify(e));
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al Actualizar .'+e.message }, 'internalId': embarqueIndar.id };

    }

    }
        return handler;


});