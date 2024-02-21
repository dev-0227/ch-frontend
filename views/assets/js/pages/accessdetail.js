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
  return year+month+dt;
}
function difDays(sdate,edate){
  var date1 = new Date(sdate);
  var date2 = new Date(edate);
    
  // To calculate the time difference of two dates
  var Difference_In_Time = date2.getTime() - date1.getTime();
    
  // To calculate the no. of days between two dates
  return Difference_In_Time / (1000 * 3600 * 24);
}
function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " Hr, " : " Hrs, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " Min, " : " Mins ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay; 
}
$(document).ready(async function () {
  "use strict";
  let firstdate = new Date($("#sdate").val()).getDay();
  let lastdate = new Date($("#edate").val()).getDay();
  let days = difDays($("#sdate").val(),$("#edate").val());
  $("#maintable tbody").empty();
  for(var i = 0;i < firstdate;i++){
    $("#maintable tbody").append(`<td class="inactive"></td>`);
  }
  for(var i = 0;i < days+1;i++){
    var tmp = new Date(new Date($("#sdate").val()).getTime() + 24 * 60 * 60 * 1000 * i);
    if(tmp.getDay() == 0){
      if(i != 0)
      $("#maintable tbody").append(`<td class="weektotal"></td>`);
      $("#maintable tbody").append(`<tr></tr>`);
      $("#maintable tbody").append(`<td><div class="item"><p class="datevalue text-right">${tmp.getDate()}</p><div class="text-right" id="${DateFormat(tmp)}"></div></div></td>`);
    }
    else{
      $("#maintable tbody").append(`<td><div class="item"><p class="datevalue text-right">${tmp.getDate()}</p><div class="text-right" id="${DateFormat(tmp)}"></div></div></td>`);
    }
  }
  for(var i = 0;i < 6-lastdate;i++){
    $("#maintable tbody").append(`<td class="inactive"></td>`);
  }
  $("#maintable tbody").append(`<td class="weektotal"></td>`);

  sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$("#userid").val()}, "manager/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".fullname").html(result[0]['fname']+" "+result[0]['lname']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid:$("#userid").val(),clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").val(),edate:$("#edate").val()}, "hedis/getaccessdetail", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      Object.entries(result).forEach(([key, value]) => {
        $("#"+key).append(`<p class="text-primary">${secondsToHms(value.total)}</p>`);
        for(var i = 0;i < value.values.length;i++){
          if(typeof value.values[i - 1] != "undefined" && value.values[i - 1]['insName'] == value.values[i]['insName']){
            $("#"+key).append(`<p class="mb-0 text-muted">${value.values[i]['name']} ${value.values[i]['total']}</p>`);
          }
          else{
            $("#"+key).append(`<p class="mb-0">${value.values[i]['insName']}</p>`);
            $("#"+key).append(`<p class="mb-0 text-muted">${value.values[i]['name']} ${value.values[i]['total']}</p>`);
          }
        }
      });
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
});
