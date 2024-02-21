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
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "paid/getdaterange", (xhr, err) => {
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
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "paid/getgroups", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#group-area").empty();
      $("#group-area").append(`<option value='0'>All</option>`);
      for(var i = 0; i < result.length;i++){
        $("#group-area").append(`<option value = '`+result[i]['id']+`'>`+result[i]['name']+`</option>`)
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "paid/getclinicspec", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#spec-area").empty();
      $("#super-spec-area").empty();
      for(var i = 0; i < result.length;i++){
        $("#spec-area").append(`<option value = '`+result[i]['id']+`'>`+result[i]['name']+`</option>`)
        $("#super-spec-area").append(`<option value = '`+result[i]['id']+`'>`+result[i]['name']+`</option>`)
      }
      // $("#spec-area").select2().trigger("change");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "paid/getins", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#ins-area").empty();
      for(var i = 0; i < result.length; i++){
        $("#ins-area").append(`
            <option value = "`+result[i]['InsName']+`">`+result[i]['InsName']+`</option>
        `);
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  $(".defaultview").click(function(){
    var datearr = $(".date_range").val().split(";");
    var startdate = DateFormat(new Date(parseInt(datearr[0])));
    var enddate = DateFormat(new Date(parseInt(datearr[1])));
    $("body").append("<form id = 'defaultviewform' action = '../pages/defpaidview' method = 'POST' target='_blank'><input type='hidden' name='sdate' value='"+startdate+"' /><input type='hidden' name='edate' value='"+enddate+"' /></form>");
    $("#defaultviewform").submit();
    $("#defaultviewform").remove();
  });
  $(".avgview").click(function(){
    var datearr = $(".date_range").val().split(";");
    var startdate = DateFormat(new Date(parseInt(datearr[0])));
    var enddate = DateFormat(new Date(parseInt(datearr[1])));
    $("body").append("<form id = 'avgviewform' action = '../pages/avgpaidview' method = 'POST' target='_blank'><input type='hidden' name='sdate' value='"+startdate+"' /><input type='hidden' name='edate' value='"+enddate+"' /></form>");
    $("#avgviewform").submit();
    $("#avgviewform").remove();
  });
  $(".pcpview").click(function(){
    var datearr = $(".date_range").val().split(";");
    var startdate = DateFormat(new Date(parseInt(datearr[0])));
    var enddate = DateFormat(new Date(parseInt(datearr[1])));
    $("body").append("<form id = 'pcpviewform' action = '../pages/pcppaidview' method = 'POST' target='_blank'><input type='hidden' name='sdate' value='"+startdate+"' /><input type='hidden' name='edate' value='"+enddate+"' /></form>");
    $("#pcpviewform").submit();
    $("#pcpviewform").remove();
  });
  $(".cptview").click(function(){
    var datearr = $(".date_range").val().split(";");
    var startdate = DateFormat(new Date(parseInt(datearr[0])));
    var enddate = DateFormat(new Date(parseInt(datearr[1])));
    $("body").append("<form id = 'cptviewform' action = '../pages/cptpaidview' method = 'POST' target='_blank'><input type='hidden' name='sdate' value='"+startdate+"' /><input type='hidden' name='edate' value='"+enddate+"' /></form>");
    $("#cptviewform").submit();
    $("#cptviewform").remove();
  });
  $(".areacptpaidview").click(function(){
    $("#area-cpt-modal").modal("show");
  });
  $("#viewcptbillbtn").click(function(){
    var datearr = $(".date_range").val().split(";");
    var startdate = DateFormat(new Date(parseInt(datearr[0])));
    var enddate = DateFormat(new Date(parseInt(datearr[1])));
    $("body").append("<form id = 'areacptpaidviewform' action = '../pages/areacptpaidview' method = 'POST' target='_blank'><input type='hidden' name='sdate' value='"+startdate+"' /><input type='hidden' name='edate' value='"+enddate+"' /><input type='hidden' name='group' value='"+$("#group-area").val()+"' /><input type='hidden' name='spec' value='"+$("#spec-area").val()+"' /><input type='hidden' name='type' value='"+$(".areareporttype:checked").val()+"' /></form>");
    $("#areacptpaidviewform").submit();
    $("#areacptpaidviewform").remove();
  })
  $(".superview").click(function(){
    $("#super-cpt-modal").modal("show");
  });
  $("#viewsuperbillbtn").click(function(){
    var datearr = $(".date_range").val().split(";");
    var startdate = DateFormat(new Date(parseInt(datearr[0])));
    var enddate = DateFormat(new Date(parseInt(datearr[1])));
    $("body").append("<form id = 'superpaidviewform' action = '../pages/superbillview' method = 'POST' target='_blank'><input type='hidden' name='sdate' value='"+startdate+"' /><input type='hidden' name='edate' value='"+enddate+"' /><input type='hidden' name='ins' value='"+$("#ins-area").val()+"' /><input type='hidden' name='spec' value='"+$("#super-spec-area").val()+"' /><input type='hidden' name='type' value='"+$(".superbilltype:checked").val()+"' /></form>");
    $("#superpaidviewform").submit();
    $("#superpaidviewform").remove();
  })
});
