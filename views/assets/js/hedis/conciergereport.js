function DateFormat(serial) {
  let year = serial.getFullYear();
  let month = serial.getMonth() + 1;
  let dt = serial.getDate();

  if (dt < 10) {
      dt = '0' + dt;
  }
  if (month < 10) {
      month = '0' + month;
  }
  return month+'/'+dt+'/'+year;
}
$(document).ready(function () {
  "use strict";
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "hedis/conciergereport", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#conciergereporttable tbody").empty();
      let tmpins = "";
      for(var i = 0;i < result.length;i++){
        if(tmpins != result[i]['insName']){
          $("#conciergereporttable tbody").append(`
            <tr>
              <td>${result[i]['insName']}</td>
              <td>${result[i]['filename']}</td>
              <td>${result[i]['total']}</td>
              <td>${DateFormat(new Date(result[i]['date']))}</td>
              <td>${result[i]['rdate']!=null?result[i]['total']:""}</td>
              <td>${result[i]['rdate']!=null?(result[i]['rby']==1?"FTP":(result[i]['rby']==2?"Email":"Portal")):""}</td>
              <td>${result[i]['rdate']!=null?DateFormat(new Date(result[i]['rdate'])):""}</td>
            </tr>
          `);
          tmpins = result[i]['insName'];
        } 
        else{
          $("#conciergereporttable tbody").append(`
            <tr>
              <td></td>
              <td>${result[i]['filename']}</td>
              <td>${result[i]['total']}</td>
              <td>${DateFormat(new Date(result[i]['date']))}</td>
              <td>${result[i]['rdate']!=null?result[i]['total']:""}</td>
              <td>${result[i]['rdate']!=null?(result[i]['rby']==1?"FTP":(result[i]['rby']==2?"Email":"Portal")):""}</td>
              <td>${result[i]['rdate']!=null?DateFormat(new Date(result[i]['rdate'])):""}</td>
            </tr>
          `);
        }
       
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
});
});
