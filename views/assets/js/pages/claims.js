var lang = "en-US";
var year = new Date().getFullYear();
var month = new Date().getMonth();
var date = new Date().getDate();

function dateToTS (date) {
    return date.valueOf();
}

function tsToDate (ts) {
    var d = new Date(ts);

    return d.toLocaleDateString(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
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
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "ffs/getdaterange", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".date_range").ionRangeSlider({
        type: "double",
        grid: true,
        min: result[0]['min'] ==null?dateToTS(new Date(year-1, 0, 1)):dateToTS(new Date(result[0]['min'])),
        max: result[0]['max'] ==null?dateToTS(new Date(year, month, date)):dateToTS(new Date(result[0]['max'])),
        from: dateToTS(new Date(year, 0, 1)),
        to: result[0]['max'] ==null?dateToTS(new Date(year, month, date)):dateToTS(new Date(result[0]['max'])),
        prettify: tsToDate
      });
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
});
