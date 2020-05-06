/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de obtener el pedido para cancelarlo en NETSUITE Y  WMS
 */

define( ['N/error', 'N/record', 'N/format' , 'N/search', 'N/query'], function( error, record, format, search, query ) {

    var handler = {};
  
    function busqueda(tranid)
    {
        log.error('tranid',tranid);
                var json=[];
                var transactionSearchObj = search.create({
                    type: "salesorder",
                    filters:
                    [
                       ["type","anyof","SalesOrd"], 
                       "AND", 
                       ["numbertext","is",tranid], 
                       "AND", 
                       ["mainline","is","F"], 
                       "AND", 
                       ["item.name","doesnotcontain","IVA 16%"]
                    ],
                    columns:
                    [
                       search.createColumn({name: "internalid", label: "Internal ID"}),
                       search.createColumn({name: "type", label: "Type"}),
                       search.createColumn({name: "tranid", label: "Document Number"}),
                       search.createColumn({name: "statusref", label: "Status"}),
                       search.createColumn({name:"trandate",label:"trandate"}),
                       search.createColumn({
                          name: "companyname",
                          join: "customer",
                          label: "Company Name"
                       }),
                       search.createColumn({
                          name: "entityid",
                          join: "customer",
                          label: "ID"
                       }),
                       search.createColumn({
                          name: "itemid",
                          join: "item",
                          label: "Name"
                       }),
                       search.createColumn({
                          name: "custitem_categoria_articulo",
                          join: "item",
                          label: "Categoría"
                       }),
                       search.createColumn({
                          name: "custrecord_representante_vtas",
                          join: "CUSTBODYZONA",
                          label: "Representante ventas"
                       }),
                       search.createColumn({
                          name: "custrecord_apoyo_ventas",
                          join: "CUSTBODYZONA",
                          label: "Apoyo de ventas"
                       }),
                       search.createColumn({name: "quantity", label: "Quantity"}),
                       search.createColumn({name: "quantitycommitted", label: "Quantity Committed"}),
                       search.createColumn({name: "custbody_tipo_pedido",label:"custbody_tipo_pedido"})
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
                  //  var mydate = new Date(r.getValue({name:'trandate'}));
                    //log.error('fecha',mydate);
                    var fecha=formatNSDate( r.getValue({name:'trandate'}));
                json.push({
                      //  "articulo": r.getValue({name:"Item"}),
                        "internalid": r.getValue({name:'internalid'}),
                        "type": r.getText({name:'custbody_tipo_pedido'}),
                        "tranid": r.getValue({name:'tranid'}),                      
                        "statusText": r.getText({name: 'statusref'}),
                        "companyname": r.getValue({name:'companyname',join:'customer'}),
                        "entityid": r.getValue({name:'entityid',join:'customer'}),
                        "itemid": r.getValue({name:'itemid',join:'item'}),
                        "custitem_categoria_articulo": r.getText({name:'custitem_categoria_articulo',join:'item'}),
                        "custrecord_representante_vtas": r.getValue({name:'custrecord_representante_vtas',join:'CUSTBODYZONA'}),
                        "custrecord_representante_vtasText": r.getText({name:'custrecord_representante_vtas',join:'CUSTBODYZONA'}),
                        "custrecord_apoyo_ventas": r.getValue({name:'custrecord_apoyo_ventas',join:'CUSTBODYZONA'}),
                        "custrecord_apoyo_ventasText": r.getText({name:'custrecord_apoyo_ventas',join:'CUSTBODYZONA'}),
                        "trandate": fecha,
                        "quantity": r.getValue({name:'quantity'}),
                        "quantitycommitted": r.getValue({name:'quantitycommitted'}) //r.getValue({name:'trandate'})
                


                        

                });
            });
        });
        return  json;
    }

    function addZeros(num,len){
        var str=num.toString();
        while(str.length<len){str='0'+str;}
        return str;
      }
      
      // function to format date object into NetSuite's mm/dd/yyyy format.
      function formatNSDate(dateObj){
        if(dateObj){ 
            var parts =dateObj.split('/');
            var nsFormatDate=parts[0]+'/'+addZeros(parts[1],2)+'/'+parts[2]; //addZeros(dateObj.getMonth()+1,2)+'/'+addZeros(dateObj.getDate(),2)+'/'+dateObj.getFullYear();
          return nsFormatDate;
        }
        return null;
      }

    handler.post = function( context )
  {
    try
    {
        log.error('antes',context);
        var pedido = busqueda(context.tranid);

        return { 'responseStructure': { 'codeStatus': 'OK', 'descriptionStatus': 'Datos obtenidos con éxito' }, 'Resultados': { 'CustomerID': 22, 'Documentos': pedido }};
     // return {'Documentos':arqueo};

    }   catch ( e ) {
        log.debug( 'GET', JSON.stringify( e ) );
        var errorText = 'ERROR CODE: ' + e.name + ' \n DESCRIPTION: ' + e.message;
        return { 'responseStructure': { 'codeStatus': 'NOK', 'descriptionStatus': 'Error al obtener datos ' + errorText }};

      }
    };
return handler;
} );