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
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
function countOccurences(string, word) {
  return string.split(word).length - 1;
}

$(document).ready(function () {
  "use strict";
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
      loadData();
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
});
async function loadData(){
  let insid = getUrlVars();
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {cyear:$("#hedisdate").val(),clinicid:localStorage.getItem('chosen_clinic'),insid:insid['insid']}, "hedis/gethedispopulation", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
