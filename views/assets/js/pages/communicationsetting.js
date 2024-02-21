$(document).ready(async function () {
  "use strict";
  if(localStorage.getItem('usertype') == 0){
    $(".tmpfirstclass").removeClass("active");
  }
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPriceSMS", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length > 0)
        $("#pricevalue").val(result[0]['value']);
      else
        $("#pricevalue").val("0.07");
      } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getAutoAmountSMS", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length > 0){
        $("#repamount").val(result[0]['autoamount']);
        $("#repcounts").val(result[0]['counts']);
      }
      else{
        $("#repamount").val("");
        $("#repcounts").val("");
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getAutopayment", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result[0]['auto'] == 1){
        $("#autopaycheck").prop("checked",true);
      }
      else{
        $("#autopaycheck").prop("checked",false);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPhone", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result[0]['age'] == 1){
        $("#activatecheck").prop("checked",true);
      }
      else{
        $("#activatecheck").prop("checked",false);
      }
      $("#phonenumber").val(result[0]['name']);
      $("#phoneprice").val(result[0]['desc']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  var paymenthistorytable = $('#paymenthistorytable').DataTable({
    "order": [[ 0, 'desc' ]],
    "ajax": {
        "url": serviceUrl + "setting/getcredithistory",
        "type": "POST",
        "data":{clinicid:localStorage.getItem('chosen_clinic')}
    },
    "columns": [
        { data: "date",
          render: function (data, type, row) {
            return new Date(row.date).toLocaleDateString();
          } 
        },
        { data: "rec_id"},
        { data: 'name' },
        { data: 'email'},
        { data: 'amount'},
        { data: 'counts'},
        { data: 'type',
          render: function (data, type, row) {
            if(row.type == 1)
              return "<span class='tag tag-green'>One Time</span>";
            else
              return "<span class='tag tag-info'>Auto</span>";
          } 
        },
    ]
  });
  $("#updatepricebtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#pricevalue").val()}, "setting/updatePriceSMS", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#updaterepamountbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#repamount").val()}, "setting/updateRepAmountSMS", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#updaterepcountsbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#repcounts").val()}, "setting/updateRepCountsSMS", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#updatephonebtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#phoneprice").val(),number:$("#phonenumber").val()}, "setting/updatePhone", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#activatecheck").change(function(){
    var checkvalue = 0;
    if($(this).prop("checked")){
      checkvalue = 1;
    }
    else{
      checkvalue = 0;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:checkvalue}, "setting/updateActivatesms", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#autopaycheck").change(function(){
    var checkvalue = 0;
    if($(this).prop("checked")){
      checkvalue = 1;
    }
    else{
      checkvalue = 0;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:checkvalue}, "setting/updateAutopayment", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $('#hedis_alert_body').summernote({
		tabsize: 3,
		height: 300
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getLanguage", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedis_alert_language").empty();
      for(var i = 0;i < result.length;i++){
        $("#hedis_alert_language").append("<option value='"+result[i]['id']+"'>"+result[i]['name']+"</option>");
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {type:$("#hedis_alert_type").val(),langid:$("#hedis_alert_language").val()}, "setting/getHedisalerts", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          if(result.length > 0){
            $("#hedis_alert_id").val(result[0]['id']);
            $("#hedis_alert_subject").val(result[0]['name']);
            $("#hedis_alert_body").summernote("code", result[0]['desc']);
          }
          else{
            $("#hedis_alert_id").val(0);
            $("#hedis_alert_subject").val("");
            $("#hedis_alert_body").summernote("code","");
          }
        } else {
          return $.growl.error({
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
  
  $("#hedis_alert_type").change(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {type:$("#hedis_alert_type").val(),langid:$("#hedis_alert_language").val()}, "setting/getHedisalerts", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length > 0){
          $("#hedis_alert_id").val(result[0]['id']);
          $("#hedis_alert_subject").val(result[0]['name']);
          $("#hedis_alert_body").summernote("code", result[0]['desc']);
        }
        else{
          $("#hedis_alert_id").val(0);
          $("#hedis_alert_subject").val("");
          $("#hedis_alert_body").summernote("code","");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#hedis_alert_language").change(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {type:$("#hedis_alert_type").val(),langid:$("#hedis_alert_language").val()}, "setting/getHedisalerts", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length > 0){
          $("#hedis_alert_id").val(result[0]['id']);
          $("#hedis_alert_subject").val(result[0]['name']);
          $("#hedis_alert_body").summernote("code", result[0]['desc']);
        }
        else{
          $("#hedis_alert_id").val(0);
          $("#hedis_alert_subject").val("");
          $("#hedis_alert_body").summernote("code","");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#hedisalertbtn").click(function(){
    let entry = {
      type:$("#hedis_alert_type").val(),
      langid:$("#hedis_alert_language").val(),
      id:$("#hedis_alert_id").val(),
      subject:$("#hedis_alert_subject").val(),
      body:$("#hedis_alert_body").summernote("code")
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/setHedisalerts", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
});
