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
          
          if(j==0){
            var a = td[j].split('/a>');
            types[i-1] = a[1].replaceAll("&nbsp;","").replace(/^\s+|\s+$/g,'');
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "database/import_jurisdiction", (xhr, err) => {
          if (!err) {
            return toastr.success('database import successfully');
          } else {
            return toastr.error('Action Failed');
          }
      });

    });
  });
  