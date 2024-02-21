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
$(document).ready(async function () {
  "use strict";
  let entry = {
    clinicid:localStorage.getItem('chosen_clinic'),
    sdate:$("#sdate").html(),
    edate:$("#edate").html(),
  }
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "ffs/getdeductiblereport", (xhr, err) => {
    if (!err) {
      let pcp = JSON.parse(xhr.responseText)['pcp'];
      let ins = JSON.parse(xhr.responseText)['ins'];
      $(".pcpareatable tbody").empty();
      for(var i = 0;i < pcp.length;i++){
        $(".pcpareatable tbody").append(`
          <tr>
            <td>${pcp[i]['fullname'].trim()}</td>
            <td>$${Math.round(pcp[i]['totalded'])}</td>
            <td>$${Math.round(pcp[i]['totalpaid'])}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        `);
      }
      $(".insareatable tbody").empty();
      for(var i = 0;i < ins.length;i++){
        $(".insareatable tbody").append(`
          <tr>
            <td>${ins[i]['InsName'].trim()}</td>
            <td>$${Math.round(ins[i]['totalded'])}</td>
            <td>$${Math.round(ins[i]['totalpaid'])}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        `);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  }); 
});
