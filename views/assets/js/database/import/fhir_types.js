$(document).ready(function () {
    "use strict";
    $(document).on("click",".import_btn",function(){
      var str = $('.table-body').html();
      var row = str.split('</tr>');
      var types = [];
      
      for(var i=1; i<row.length-1; i++){
        var td = row[i].split('</td>');
        types[i-1] = '';
        for(var j=0; j< td.length-1; j++){
          
          if(j==1){
            var a = td[j].split('<a');
            var b = a[1].split('</a');
            var c = b[0].split('>');
            var d = c[0].split('"');
            types[i-1] += ','+d[1].replace(/^\s+|\s+$/g,'');
            types[i-1] += ','+c[1].replace(/^\s+|\s+$/g,'');
          }else if(j==4){
            var a = td[j].split('<p>');
            var b = a[1].split('</p>');
            types[i-1] += ','+b[0].replace(/^\s+|\s+$/g,'');
          }else{
            var c = td[j].split('>');
            if(types[i-1]!='')types[i-1] += ',';
            types[i-1] += c[c.length-1].replace(/^\s+|\s+$/g,'');
          }
          
        }
      }

      console.log(types);

      let entry = {
        types: types
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "database/import_fhir_types", (xhr, err) => {
          if (!err) {
            return toastr.success('database import successfully');
          } else {
            return toastr.error('Action Failed');
          }
      });

    });
  });
  