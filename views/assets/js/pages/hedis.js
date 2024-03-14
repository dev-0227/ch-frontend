$(document).ready(function () {
  "use strict";
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
      let getinsentry = {
        clinicid:localStorage.getItem('chosen_clinic'),
        cyear:$("#hedisdate").val(),
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), getinsentry, "hedis/getinsheislist", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          $(".inshedislist").empty();
          $(".inshedispoplutaion").empty();
          for(var i = 0;i < result.length;i++){
            $(".inshedislist").append(`<a href="../pages/hedisreport?insid=`+result[i]['insid']+`" class="btn btn-outline btn-outline-dashed btn-outline-secondary btn-active-light-secondary me-2 mb-2" target='_blank'>`+result[i]['insName']+`</a>`);
            $(".inshedispoplutaion").append(`<a href="../pages/hedispopulation?insid=`+result[i]['insid']+`" class="btn btn-outline btn-outline-dashed btn-outline-secondary btn-active-light-secondary me-2 mb-2" target='_blank'>`+result[i]['insName']+`</a>`);
          }
        } else {
          return $.growl.warning({
            message: "Action Failed"
          });
        }
      });
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  // sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid:localStorage.getItem('userid')}, "hedis/getavailabledaily", (xhr, err) => {
  //   if (!err) {
  //     let result = JSON.parse(xhr.responseText)['data'];
  //     $(".dailylist").empty();
  //     if(result == "success")
  //       $(".dailylist").append(`<a href="../pages/hedisdaily" target="_blank" class="btn btn-radius btn-success">Daily List</a>`);
  //   } else {
  //     return $.growl.warning({
  //       message: "Action Failed"
  //     });
  //   }
  // });
  // sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid:localStorage.getItem('userid')}, "hedis/getavailablencompliant", (xhr, err) => {
  //   if (!err) {
  //     let result = JSON.parse(xhr.responseText)['data'];
  //     $(".ncompliantlist").empty();
  //     if(result == "success")
  //       $(".ncompliantlist").append(`<a href="../pages/hedisnoncompliant" target="_blank" class="btn btn-radius btn-info">Non-Compliant List</a>`);
  //   } else {
  //     return $.growl.warning({
  //       message: "Action Failed"
  //     });
  //   }
  // });
  $(".hedisworkreport").click(function(){
    $("#hedis_work_date_modal").modal("show");
  });
  $("#submireportlogbtn").click(function(){
    $("body").append("<form id = 'hedisaccessform' action = '../pages/hedisaccess' method = 'POST'><input type='hidden' name='sdate' value='"+$("#sdate").val()+"' /><input type='hidden' name='edate' value='"+$("#edate").val()+"' /></form>");
    $("#hedisaccessform").submit();
    $("#hedisaccessform").remove();
  });
});
