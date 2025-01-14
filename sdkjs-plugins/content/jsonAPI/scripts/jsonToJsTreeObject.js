     function jsonToJsTreeObject( json_data_object, final_array = new Array() )
    {
        Object.keys(json_data_object).forEach( function( data ) {
            // console.log("Key:" + data);
            if( Array.isArray(json_data_object[data]) || json_data_object[data] instanceof Object )
            {
                final_array.push( { text: `${data}`, children: jsonToJsTreeObject( json_data_object[data], new Array() ) } );
                // using state attribute 
                // final_array.push( { text: `${data}`, state : {  'opened' : false, 'selected' : false }, children: jsonToJsTreeObject( json_data_object[data], new Array() ) } );
            }
            else
            {
                final_array.push( { text: `${data}`, children: [{ text: `${json_data_object[data]}`, icon: "jstree-file" }] } );
                // using state attribute
                // final_array.push( { text: `${data}`, state : {  'opened' : false, 'selected' : false }, children: [{ text: `${json_data_object[data]}` }] } );
            }
        });

        return final_array;
    };