$(document).ready(function () {
    "use strict";

    
    sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "hedissetting/qppMeasuresData", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
  

        $("#data_list").html(html);
        for(var i=0; i<result.length; i++){
          var html = JSON.stringify(result[i], undefined, 4).replace(/\n( *)/g, function (match, p1) {
            return '<br>' + '&nbsp;'.repeat(p1.length);
          });
          $("#data_list").append('<div>'+(i+1)+'. '+result[i]['title']+'</div>');
          // $("#data_list").append('<div style="padding-left: 10px;">'+html+'</div>');
        }
      } else {
        return toastr.error('Action Failed');
      }
  });
    $(document).on("click",".import_btn",function(){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), [], "database/import_qpp_measures_data", (xhr, err) => {
        if (!err) {
          return toastr.success('database import successfully');
        } else {
          return toastr.error('Action Failed');
        }
    });

    });
  });
  