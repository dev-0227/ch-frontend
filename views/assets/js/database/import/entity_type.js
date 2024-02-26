$(document).ready(function () {
    "use strict";
    $(document).on("click",".import_btn",function(){
      var str = $('.table-body').html();
      var row = str.split('</tr>');
      var types = [];
      
      for(var i=1; i<row.length-1; i++){
        var td = row[i].split('</td>');
        for(var j=0; j< td.length-1; j++){
          
          if(j==0){
            var a = td[0].split('</a>');
            var b = a[1].split('>');
            types[i-1] = b[b.length-1];
          }else{
            var c = td[j].split('>');
            types[i-1] += ','+c[c.length-1].replace(/^\s+|\s+$/g,'');
          }
          
        }
      }

      

      let entry = {
        types: types
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "database/import_entity_types", (xhr, err) => {
          if (!err) {
            return toastr.success('database import successfully');
          } else {
            return toastr.error('Action Failed');
          }
      });

    });
  });
  