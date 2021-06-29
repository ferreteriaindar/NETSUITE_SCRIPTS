/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INIDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener Pagos y Facturas para aplicarlas
 */

  define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

   var handler = {};
 
   function busqueda(id)
   {           
				log.error('busquedaInvoice',id);
            var filtroClienteZona=id.search("C")==-1?"customer.custentity_zona_cliente":"name";
            var filtroAndAnyOF=filtroClienteZona.search("customer.entityid")==-1?"anyof":"is";
            log.error({
               title: 'pARAMETROSFacturas',
               details: filtroClienteZona+','+filtroAndAnyOF+','+id
            })

            id=id.search("C")==-1?id:id.substring(1);
               var json=[];
               var transactionSearchObj = search.create({
                   type: "invoice",
                   filters:
                   [
                       ["type","anyof","CustInvc"], 
                      "AND", 
                      ["mainline","is","T"], 
                      "AND", 
                      ["amountremaining","greaterthan","0.01"],
                      "AND", 
                      [filtroClienteZona,"anyof",[id]]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "creditlimit",
                         join: "customer",
                         label: "LimiteCredito"
                      }),
                      search.createColumn({
                         name: "custentity_auxiliar_cobranza",
                         join: "customer",
                         label: "Cobrador"
                      }),
                      search.createColumn({
                         name: "custentity_representaventas",
                         join: "customer",
                         label: "Vendedor"
                      }),
                      search.createColumn({
                         name: "custentity_zona_cliente",
                         join: "customer",
                         label: "Zona"
                      }),
                      search.createColumn({
                         name: "entityid",
                         join: "customer",
                         label: "Cliente"
                      }),
                      search.createColumn({
                         name: "companyname",
                         join: "customer",
                         label: "NombreCliente"
                      }),
                      search.createColumn({name: "type", label: "Documento"}),
                      search.createColumn({name: "tranid", label: "NumDoc"}),
                      search.createColumn({name: "memo", label: "Nota"}),
                     // search.createColumn({name: "createdfrom", label: "Origen"}),
                      search.createColumn({name: "trandate", label: "Fecha"}),
                      search.createColumn({name: "custbody_nso_indr_receipt_date", label: "FechaRecibo"}),
                      search.createColumn({name: "custbody_nso_indr_discount_date", label: "FechaVencimiento"}),
                      search.createColumn({name: "custbody_nso_payment_terms", label: "Terminos"}),
                      search.createColumn({name: "custbody_nso_indr_client_discount", label: "DescuentoCliente"}),
                      search.createColumn({
                         name: "formulanumeric",
                         formula: "	ROUND({today}-{duedate},0)",
                         label: "Vencimiento"
                      }),
                      search.createColumn({name: "amount", label: "ImporteBruto"}),
                      search.createColumn({name: "amountremaining", label: "SaldoPendiente"}),
                      search.createColumn({
                         name: "formulanumeric_3",
                         formula: "ROUND({amountremaining}/{amount}*100,2)",
                         label: "Porcentaje"
                      }),
                      search.createColumn({
                         name: "formulanumeric_1",
                         formula: "{custbody_nso_indr_client_discount}*{amount}",
                         label: "DescuentoTotal"
                      }),
                      search.createColumn({
                         name: "formulanumeric_2",
                         formula: "{custbody_nso_indr_client_discount}/100*{amount}-{amount}",
                         label: "A_pagar"
                      }),
                     // search.createColumn({name: "custbody_paqueteria", label: "Paqueteria"}),
                      search.createColumn({name: "internalid", label: "Internal ID"}),
                      search.createColumn({name: "custbody_fe_metodo_de_pago", label: "Método de Pago (SAT)"}),
                      search.createColumn({name:"custbody_nso_indr_discount_16p",label:"discount16"}),
                      search.createColumn({name:"custbody_nso_indr_zero_tax_discount",label:"discount0"})
                      
                   ]
                });
               var contar = transactionSearchObj.runPaged().count;
            //   log.debug("transactionSearchObj result count",searchResultCount);
             var resultados=  transactionSearchObj.runPaged({
               pageSize: 1000
             });
          
             var k = 0;
             resultados.pageRanges.forEach(function(pageRange) {
               var pagina = resultados.fetch({ index: pageRange.index });
               pagina.data.forEach(function(r) {
                   k++
                 
               json.push({
                       "LimiteCredito": r.getValue({name:"creditlimit",join:"customer"}),
                       "Cobrador": r.getText({name:"custentity_auxiliar_cobranza",join:"customer"}),
                       "Vendedor": r.getText({name:"custentity_representaventas",join:"customer"}),
                       "Zona": r.getText({name:"custentity_zona_cliente",join:"customer"}),
                       "Cliente": r.getValue({name:"entityid",join:"customer"}),
                       "Cliente": r.getValue({name:"companyname",join:"customer"}),
                       "Documento":  r.getValue({name:"type"}),
                       "NumDoc": r.getValue({name:"tranid"}),
                       "Nota": r.getValue({name:"memo"}),
                       "Origen":'',// r.getValue({name:"createdfrom"}),
                       "Fecha": r.getValue({name:"trandate"}),
                       "FechaRecibo": r.getValue({name:"custbody_nso_indr_receipt_date"}),
                       "FechaVencimiento":r.getValue({name:"custbody_nso_indr_discount_date"}), // r.getValue({name:"duedate"}),
                       "Terminos": r.getText({name:"custbody_nso_payment_terms"}),
                       "DescuentoCliente": r.getValue({name:"custbody_nso_indr_client_discount"}),
                       "Vencimiento": r.getValue({name:'formulanumeric'}),
                       "ImporteBruto":r.getValue({name:'amount'}),
                       "SaldoPendiente": r.getValue({name:'amountremaining'}),
                       "Porcentaje":r.getValue({name:'formulanumeric_3'}),
                       "DescuentoTotal": r.getValue({name:'formulanumeric_1'}),
                       "A_pagar": 0, // r.getValue({name:'formulanumeric_2',label:'A_pagar'}),
                       "custbody_paqueteria":'',// r.getText({name:'custbody_paqueteria'}),
                       "internalId": r.getValue({name:'internalid'}),
                       "metodoPago": r.getValue({name:'custbody_fe_metodo_de_pago'}),
                       "discount6": r.getValue({name:'custbody_nso_indr_discount_16p'})==''?0:r.getValue({name:'custbody_nso_indr_discount_16p'}),
                       "discount10": r.getValue({name:'custbody_nso_indr_zero_tax_discount'})==''?0:r.getValue({name:'custbody_nso_indr_zero_tax_discount'})

               });
           });

           


       });
               ///SE GENERA LA BUSQUEDA DE LOS PAGOS Y SE  INSERTAN EN EL MISMO JSON
                  log.error({
                     title: 'pARAMETROSPAGOS',
                     details: filtroClienteZona+','+filtroAndAnyOF+','+id
                  })
              
               var customerpaymentSearchObj = search.create({
                   type: "customerpayment",
                   filters:
                   [
                      ["type","anyof","CustPymt"], 
                      "AND", 
                      ["mainline","is","F"], 
                      "AND", 
                      ["amountremaining","greaterthan","3.0"], 
                      "AND",
                    //  ["custbodyzona","anyof",[id]]
                  //  ["customer.custentity_zona_cliente","anyof",[id]]
                  [filtroClienteZona,"anyof",[id]]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "creditlimit",
                         join: "customer",
                         label: "LimiteCredito"
                      }),
                      search.createColumn({
                         name: "custentity_auxiliar_cobranza",
                         join: "customer",
                         label: "Cobrador"
                      }),
                      search.createColumn({
                         name: "custentity_representaventas",
                         join: "customer",
                         label: "Vendedor"
                      }),
                      search.createColumn({
                         name: "custentity_zona_cliente",
                         join: "customer",
                         label: "Zona"
                      }),
                      search.createColumn({
                         name: "entityid",
                         join: "customer",
                         label: "Cliente"
                      }),
                      search.createColumn({
                         name: "companyname",
                         join: "customer",
                         label: "NombreCliente"
                      }),
                      search.createColumn({name: "type", label: "Documento"}),
                      search.createColumn({name: "tranid", label: "NumDoc"}),
                      search.createColumn({name: "memo", label: "Nota"}),
                     // search.createColumn({name: "createdfrom", label: "Origen"}),
                      search.createColumn({name: "trandate", label: "Fecha"}),
                      search.createColumn({name: "custbody_nso_indr_receipt_date", label: "FechaRecibo"}),
                      search.createColumn({name: "duedate", label: "FechaVencimiento"}),
                      search.createColumn({name: "custbody_nso_payment_terms", label: "Terminos"}),
                      search.createColumn({name: "custbody_nso_indr_client_discount", label: "DescuentoCliente"}),
                      search.createColumn({
                       name: "formulanumeric",
                       formula: "	ROUND({today}-{duedate},0)",
                       label: "Vencimiento"
                    }),
                    search.createColumn({name: "amount", label: "ImporteBruto"}),
                    search.createColumn({name: "amountremaining", label: "SaldoPendiente"}),
                    search.createColumn({
                       name: "formulanumeric_3",
                       formula: "ROUND({amountremaining}/{amount}*100,2)",
                       label: "Porcentaje"
                    }),
                    search.createColumn({
                       name: "formulanumeric_1",
                       formula: "{custbody_nso_indr_client_discount}*{amount}",
                       label: "DescuentoTotal"
                    }),
                    search.createColumn({
                       name: "formulanumeric_2",
                       formula: "{custbody_nso_indr_client_discount}/100*{amount}-{amount}",
                       label: "A_pagar"
                    }),
                 //   search.createColumn({name: "custbody_paqueteria", label: "Paqueteria"}),
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "custbody_fe_metodo_de_pago", label: "Método de Pago (SAT)"}),
                  //  search.createColumn({name:"custbody_nso_indr_discount_16p",label:"discount16"}),
                   // search.createColumn({name:"custbody_nso_indr_zero_tax_discount",label:"discount0"})
                 ]
                });

                var contar = customerpaymentSearchObj.runPaged().count;
                //   log.debug("transactionSearchObj result count",searchResultCount);
                 var resultadosPayment=  customerpaymentSearchObj.runPaged({
                   pageSize: 1000
                 });
                var k = 0;
                resultadosPayment.pageRanges.forEach(function(pageRange) {
                  var paginaPayment = resultadosPayment.fetch({ index: pageRange.index });
                  paginaPayment.data.forEach(function(r) {
                      k++
                    
                  json.push({
                          "LimiteCredito": r.getValue({name:"creditlimit",join:"customer"}),
                          "Cobrador": r.getText({name:"custentity_auxiliar_cobranza",join:"customer"}),
                          "Vendedor": r.getText({name:"custentity_representaventas",join:"customer"}),
                          "Zona": r.getText({name:"custentity_zona_cliente",join:"customer"}),
                          "Cliente": r.getValue({name:"entityid",join:"customer"}),
                          "Cliente": r.getValue({name:"companyname",join:"customer"}),
                          "Documento":  r.getValue({name:"type"}),
                          "NumDoc": r.getValue({name:"tranid"}),
                          "Nota": r.getValue({name:"memo"}),
                          "Origen":'',// r.getValue({name:"createdfrom"}),
                          "Fecha": r.getValue({name:"trandate"}),
                          "FechaRecibo": r.getValue({name:"custbody_nso_indr_receipt_date"}),
                          "FechaVencimiento": r.getValue({name:"duedate"}),
                          "Terminos": r.getText({name:"custbody_nso_payment_terms"}),
                          "DescuentoCliente": r.getValue({name:"custbody_nso_indr_client_discount"}),
                          "Vencimiento": r.getValue({name:'formulanumeric'}),
                          "ImporteBruto":r.getValue({name:'amount'}),
                          "SaldoPendiente": r.getValue({name:'amountremaining'}),
                          "Porcentaje":r.getValue({name:'formulanumeric_3'}),
                          "DescuentoTotal": r.getValue({name:'formulanumeric_1'}),
                          "A_pagar": r.getValue({name:'formulanumeric_2',label:'A_pagar'}),
                          "custbody_paqueteria":'',// r.getText({name:'custbody_paqueteria'}),
                          "internalId": r.getValue({name:'internalid'}),
                     //  "metodoPago": r.getText({name:'custbody_fe_metodo_de_pago'})
                     "metodoPago": r.getText({name:'custbody_fe_metodo_de_pago'})
                     //,
                   //  "discount6":0, //r.getValue({name:'custbody_nso_indr_discount_16p'}),
                   //  "discount10":0// r.getValue({name:'custbody_nso_indr_zero_tax_discount'})
                     
                     
  
  
  
  
  
                  });
                  
              });

              
  
 
          });




            

       return  json;
   }


   handler.get = function( context )
 {
   try
   {
       log.error('zona',context.zonaid);
       var pagos = busqueda(context.zonaid);
       return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 'SINDATO', 'Documentos': pagos }};

   }   catch ( e ) {
       log.debug( 'GET', JSON.stringify( e ) );
       var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
       return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};
 
     }
   };
return handler;
} );