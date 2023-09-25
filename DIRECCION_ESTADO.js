/**
 *@NApiVersion 2.x
 *@NScriptType MassUpdateScript
 *@Autor ROBERTO VELASCO LARIOS
 *@Company INDAR PERRROS
 *@NModuleScope Public
  *@Description Script encargado de  cerrar el pedido,o una linea de un pedido
 */

  define( ['N/http','N/format', 'N/log', 'N/record',  'N/search','N/encode','N/file' ,'N/runtime'], function( http,format,log,record,  search,encode,file ,runtime) {

    function each(params) {



      
      // Load the record.
      var rec = record.load({
        type: record.Type.CUSTOMER,
        id: params.id,
        isDynamic: false
    });


     for (var i = 0; i < rec.getLineCount( 'addressbook' ); i++) {
      
       /* rec.selectLine( { sublistId: 'addressbook', line: i } );
        var addressSubrecord = rec.getCurrentSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress'
        });
        var state=addressSubrecord.getValue('state');
        var addre=addressSubrecord.getValue('addr1');
        log.error('STATE',state);
        log.error('addre',addre);*/
        var subrec2 = rec.getSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress',
            line: i
        });
    
        var state=subrec2.getValue('state');
        var IDDireccion=subrec2.getValue('id');
        var city=subrec2.getValue('city');
        log.error('STATE',state);
        log.error('acityddre',city);
        log.error('IDDireccion',IDDireccion);

        if((state==null || state=='' || state.toUpperCase()=='JALISCO') && ( city.toUpperCase()=='TONALA' || city.toUpperCase()=='EL SALTO' ))
        {
            log.error('ENTRA','SI');
            subrec2.setValue({ fieldId: 'state', value: 'JAL' });
            subrec2.setValue({ fieldId: 'dropdownstate_initialvalue', value: 'JAL' });
            subrec2.setValue({ fieldId: 'state_initialvalue', value: 'JAL' });
            subrec2.setValue({ fieldId: 'displaystate_initialvalue', value: 'Jalisco' });
           // subrec2.commitLine( 'addressbook' );
           // rec.save();
        }


     }
 
    // Retrieve the subrecord to be modified.
   

    // Change a field on the subrecord.

    // Save the record.
    try {
      var  recId= rec.save();
        return "ok";
    } catch (e) {
         
        log.error({
            title: e.name,
            details: e.message
        });
    }

}
///
    
  

   
  
return {
    each: each
};
});