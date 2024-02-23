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
function deDateFormat(serial) {
  let year = serial.getFullYear();
  let month = serial.getMonth() + 1;
  let dt = serial.getDate();

  if (dt < 10) {
      dt = '0' + dt;
  }
  if (month < 10) {
      month = '0' + month;
  }
  return year+'-'+month+'-'+dt;
}
function countOccurences(string, word) {
  return string.split(word).length - 1;
}
var hedisdata = [];
var tmpcolor = [];
var tmpchosenitem;
var optioncheck = 1;
var options = [];
var weekcheck = 0;
$(document).ready(function () {
  "use strict";
  $("#currentdate").html(DateFormat(new Date()));
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "hedis/getPCP", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".apptpcpname").empty();
      $(".apptpcpname").append(`<option value='0'>Nothing Selected</option>`);
      for(var i = 0;i < result.length;i++){
        $(".apptpcpname").append(`<option value='${result[i]['userid']}'>${result[i]['fullname'].trim()}</option>`)
      }
  } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethediscolor", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".color-list").empty();
      $(".color-sort-list").html(`
          <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="0">
            <span class="tag custom-control-label">None</span>
          </label>
          <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="-1">
            <span class="tag custom-control-label" style="color:blue">Measure Complaint</span>
          </label>`);
      for(var i = 0; i < result.length; i++){
        $(".color-list").append(`<p style='padding: 5px;border-radius: 5px;color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`'>`+result[i]['description']+`</p>`);
        tmpcolor.push({"tcolor":result[i]['tcolor'],"bcolor":result[i]['bcolor']});
        if(![1,2,3].includes(result[i]['scheck'])){
          if([4,10,7,15].includes(result[i]['scheck'])){
            $(".status-measure").append(`
            <label class="custom-control custom-radio">
              <input type="radio" class="custom-control-input statusoption" name="statusoption" value="`+result[i]['scheck']+`">
              <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
            </label>`);
          }
          else if([5,6,12,14,16].includes(result[i]['scheck'])){
            $(".status-patient").append(`
            <label class="custom-control custom-radio">
              <input type="radio" class="custom-control-input statusoption" name="statusoption" value="`+result[i]['scheck']+`">
              <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
            </label>`);
          }
          else {
            $(".status-meas-rep").append(`
            <label class="custom-control custom-radio">
              <input type="radio" class="custom-control-input statusoption" name="statusoption" value="`+result[i]['scheck']+`">
              <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
            </label>`);
          }
          $(".color-sort-list").append(`
          <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="`+result[i]['scheck']+`">
            <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
          </label>`);
        }

        // $(".color-list").append(`<p style='padding: 5px;border-radius: 5px;color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`'>`+result[i]['description']+`</p>`);
        // tmpcolor.push({"tcolor":result[i]['tcolor'],"bcolor":result[i]['bcolor']});
        // if(![1,2,3].includes(result[i]['scheck'])){
        //   $(".status-option").append(`
        //   <label class="custom-control custom-radio">
        //     <input type="radio" class="custom-control-input statusoption" name="statusoption" value="`+result[i]['scheck']+`">
        //     <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
        //   </label>`);
        //   $(".color-sort-list").append(`
        //   <label class="custom-control custom-checkbox">
        //     <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="`+result[i]['scheck']+`">
        //     <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
        //   </label>`);
        // }
        
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
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
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".hedis-title").html(result['clinic']+" Hedis Quality Tracking | Daily List | <span id='chosen-date'>"+DateFormat(new Date()))+"</span>";
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(document).on("click",".printletter",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $("body").append("<form id = 'printletterform' action = '"+serviceUrl+"hedis/printletter' method = 'POST' target='_blank'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='qid' value='"+$("#chosen_item").val()+"' /></form>");
    $("#printletterform").submit();
    $("#printletterform").remove();
  });
  $(document).on("click",".sendemail",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $(".customemailarea").addClass("d-none");
    $(".defaultemailarea").removeClass("d-none");
    $(".emailoption[value='1']").prop("checked",true);
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),qid:$("#chosen_item").val()}, "hedis/checkemail", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        $("#email-subject").html(result['subject']);    
        $("#email-body").html(result['body']);    
        $("#email-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".sendsms",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $(".customsmsarea").addClass("d-none");
    $(".defaultsmsarea").removeClass("d-none");
    $(".smsoption[value='1']").prop("checked",true);
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),qid:$("#chosen_item").val()}, "hedis/checksms", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        if(result['status'] == "success"){
          $("#smscounts").html(result['counts']);    
          $("#sms-subject").html(result['subject']);    
          $("#sms-body").html(result['body']);
          $(".phonelist").empty();
          var pcheck = "";
          var mcheck = "";
          if(result['pflag']&&result['mflag']) pcheck = "checked";
          if(!result['pflag']&&result['mflag']) mcheck = "checked";
          if(result['pflag']&&!result['mflag']) pcheck = "checked";
          if(!result['pflag']&&!result['mflag']) pcheck = "checked";
          $(".phonelist").append((result['phone'] == ""||result['phone'] == null?'':
            `<label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input phoneitem" name="phoneitem" value="`+result['phone']+`" `+pcheck+`>
              <span class="tag custom-control-label">`+result['phone']+`</span>
            </label>`)+
            (result['mobile'] == ""||result['mobile'] == null?'':
            `<label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input phoneitem" name="phoneitem" value="`+result['mobile']+`" `+mcheck+`>
              <span class="tag custom-control-label">`+result['mobile']+`</span>
            </label>`)
          );  
          $("#sms-modal").modal("show");
        }
        else if(result['status'] == "pending"){
          return $.growl.notice({
            message: "Need to be activated with sending SMS"
          });
        }
        else if(result['status'] == "no credit"){
          return $.growl.notice({
            message: "Need to add credit"
          });
        }
        else{
          return $.growl.error({
            message: "Action Failed"
          });
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(".smsoption").click(function(){
    if($(this).val() == 1){
      $(".customsmsarea").addClass("d-none");
      $(".defaultsmsarea").removeClass("d-none");
    }
    else{
      $(".customsmsarea").removeClass("d-none");
      $(".defaultsmsarea").addClass("d-none");
    }
  });
  $(".emailoption").click(function(){
    if($(this).val() == 1){
      $(".customemailarea").addClass("d-none");
      $(".defaultemailarea").removeClass("d-none");
    }
    else{
      $(".customemailarea").removeClass("d-none");
      $(".defaultemailarea").addClass("d-none");
    }
  })
  $("#emailsendbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),qid:$("#chosen_item").val(),emailtype:$(".emailoption:checked").val(),custombody:$("#custombody").val()}, "hedis/sendemail", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        if(result['message'] == "success")
          return $.growl.notice({
            message: "Sent Successfully"
          });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#smssendbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),userid:localStorage.getItem('userid'),qid:$("#chosen_item").val(),smstype:$(".smsoption:checked").val(),custombody:$("#customsmsbody").val(),number:$(".phoneitem:checked").val()}, "hedis/sendsms", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        if(result['message'] == "pending")
          return $.growl.notice({
            message: "Need to purchase Phone number"
          });
        else if(result['message'] == "no credit"){
          return $.growl.notice({
            message: "Need to add credit"
          });
        }
        else if(result['message'] == "success")
          return $.growl.notice({
            message: "Sent Successfully"
          });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(".colormodalbtn").click(function(){
    $("#color-modal").modal("show");
  });
  $(".refreshbtn").click(function(){
    loadData();
  });
  $(".sortbtn").click(function(){
    $(".searchoption").prop("checked",false);
    $("#sort-modal").modal("show");
  });
  $(document).on("click",".statusbtn",function(){

    tmpchosenitem = $(this).parent().parent();
    var tmpvalue = $(this).parent().parent().children().eq(24).html();
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $(".statusoption[value='"+tmpvalue+"']").prop("checked",true);
    if(tmpvalue == 6){
      $(".appt_date_area").removeClass("d-none");
      $(".visit_date_area").addClass("d-none");
      $(".apptdate").val($(this).parent().parent().children().eq(26).html())
      $(".apptpcpname").val($(this).parent().parent().children().eq(27).html()==""?0:$(this).parent().parent().children().eq(27).html())
      $(".apptvisittype").val($(this).parent().parent().children().eq(28).html())
    }
    else if(tmpvalue == 4){
      $(".appt_date_area").addClass("d-none");
      $(".visit_date_area").removeClass("d-none");
      $(".next-date").val("");
      $(".last-date").val("");
      $(".apptpcpname").val(0)
      $(".apptvisittype").val("")
    }
    else{
      $(".appt_date_area").addClass("d-none");
      $(".visit_date_area").addClass("d-none");
      $(".apptdate").val("");
      $(".next-date").val("");
      $(".last-date").val("");
      $(".apptpcpname").val(0)
      $(".apptvisittype").val("")
    }
    $("#status-modal").modal("show");
  });
  $(document).on("click",".statusoption",function(){
    if($(this).val() == 6){
      $(".visit_date_area").addClass("d-none");
      $(".appt_date_area").removeClass("d-none");
      $(".apptdate").val(tmpchosenitem.children().eq(26).html())
    }
    else if($(this).val() == 4){
      $(".appt_date_area").addClass("d-none");
      $(".visit_date_area").removeClass("d-none");
      $(".next-date").val("");
      $(".last-date").val("");
    }
    else{
      $(".visit_date_area").addClass("d-none");
      $(".appt_date_area").addClass("d-none");
      $(".apptdate").val("");
      $(".next-date").val("");
      $(".last-date").val("");
    }
  });
  
  $(document).on("click",".printbtn",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $("body").append("<form id = 'printdailyform' action = '"+serviceUrl+"hedis/printdaily' method = 'POST' target='_blank'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /><input type='hidden' name='cdate' value='"+$("#currentdate").html()+"' /><input type='hidden' name='weekcheck' value='"+weekcheck+"' /></form>");
    $("#printdailyform").submit();
    $("#printdailyform").remove();
  });
  $(".emailbtn").click(function(){
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val(),cdate:$("#currentdate").html(),weekcheck:weekcheck}, "hedis/dailyemail", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText);
            if(result['message'] == "success")
              return $.growl.notice({
                message: "Sent Successfully"
              });
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });
  $(".exportexcelbtn").click(function(){
    $("body").append("<form id = 'excelexportform' action = '"+serviceUrl+"hedis/exportdailyexcel' method = 'POST'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /><input type='hidden' name='optioncheck' value='"+optioncheck+"' /><input type='hidden' name='options' value='"+options+"' /><input type='hidden' name='cdate' value='"+$("#currentdate").html()+"' /><input type='hidden' name='weekcheck' value='"+weekcheck+"' /></form>");
    $("#excelexportform").submit();
    $("#excelexportform").remove();
  });
  $(".setstatusbtn").click(function(){
    var status = $(".statusoption:checked").val();
    switch(status) {
      case 6:
        var apptdate = $(".apptdate").val();
        var apptpcp = $(".apptpcpname").val()==0?null:$(".apptpcpname").val();
        var apptvisittype = $(".apptvisittype").val()==""?null:$(".apptvisittype").val();
        var lastdate = null;
        var nextdate = null;
        break;
      case 4:
        var lastdate = $(".lastdate").val();
        var nextdate = $(".nextdate").val();
        var apptdate = null;
        var apptpcp = null;
        var apptvisittype = null;
        break;
      default:
        var apptdate = null;
        var lastdate = null;
        var nextdate = null;
        var apptpcp = null;
        var apptvisittype = null;
    }
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      userid:localStorage.getItem('userid'),
      loginid:localStorage.getItem('loginid'),
      id:$("#chosen_item").val(),
      status:$(".statusoption:checked").val(),
      apptdate:apptdate,
      apptpcp:apptpcp,
      apptvisittype:apptvisittype,
      lastdate:lastdate,
      nextdate:nextdate,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/updateStatus", (xhr, err) => {
      if (!err) {
        if(parseInt(status) > 1)
          tmpchosenitem.css({"color":tmpcolor[parseInt(status)-1]["tcolor"],"background":tmpcolor[parseInt(status)-1]["bcolor"]});
        else
          tmpchosenitem.css({"color":"#3c4858","background":"#FFF"});
        tmpchosenitem.children().eq(24).html(status);
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(".optiontype").click(function(){
    if($(this).attr("optiontype") == 1){
        optioncheck = 1;
    }
    else if($(this).attr("optiontype") == 2){
        optioncheck = 2;
    }
    else if($(this).attr("optiontype") == 3){
        optioncheck = 3;
    }
    else if($(this).attr("optiontype") == 4){
        optioncheck = 4;
    }
  });
  $(".sortsearchbtn").click(function(){
    options = [];
    if(optioncheck == 1){
        $.each($(".allcheck:checked"), function(){
            options.push($(this).val());
        });
    }
    else if(optioncheck == 2){
        $.each($(".notcompletedcheck:checked"), function(){
            options.push($(this).val());
        });
    }
    else if(optioncheck == 3){
        $.each($(".outrangecheck:checked"), function(){
            options.push($(this).val());
        });
    }
    else{
        $.each($(".colorsort:checked"), function(){
            options.push($(this).val());
        });
    }
    loadData();
  });
  $(".sortclearbtn").click(function(){
    options = [];
    optioncheck = 1;
    loadData();
  });
  $(".prevdate").click(function(){
    var currentDate = new Date(new Date($("#currentdate").html()).getTime() - 24 * 60 * 60 * 1000);
    $("#currentdate").html(DateFormat(new Date(currentDate)));
    $("#chosen-date").html($("#currentdate").html())
    loadData();
  });
  $(".prevmonthdate").click(function(){
    var now = new Date($("#currentdate").html());
    if (now.getMonth() == 0) {
        var current = new Date(now.getFullYear() - 1, 11, now.getDate());
    } else {
        var current = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    $("#currentdate").html(DateFormat(current));
    $("#chosen-date").html($("#currentdate").html())
    loadData();
  });
  $(".nextdate").click(function(){
    var currentDate = new Date(new Date($("#currentdate").html()).getTime() + 24 * 60 * 60 * 1000);
    $("#currentdate").html(DateFormat(new Date(currentDate)));
    $("#chosen-date").html($("#currentdate").html())
    loadData();
  });
  $(".nextmonthdate").click(function(){
    var now = new Date($("#currentdate").html());
    if (now.getMonth() == 11) {
        var current = new Date(now.getFullYear() + 1, 0, now.getDate());
    } else {
        var current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
    $("#currentdate").html(DateFormat(current));
    $("#chosen-date").html($("#currentdate").html())
    loadData();
  });
  $(".nextweekoption").click(function(){
    if($(this).val() == 1)
      weekcheck = 1;
    else if($(this).val() == 2)
      weekcheck = 2;
    else if($(this).val() == 3)
      weekcheck = 3;
    else
      weekcheck = 0;
    loadData();
  })
  $(document).on("click",".viewmlogbtn",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      id:$("#chosen_item").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getmactionlog", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length == 0){
          return $.growl.notice({
            message: "No Action"
          });
        }
        $("#log_list").empty();
        for(var i = 0; i < result.length;i++){
          $("#log_list").append(`
            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start disabled">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1 text-primary">${result[i]['name']==null?"None":result[i]['name']}</h5>
                <small class="text-muted">${DateFormat(new Date(result[i]['date']))} ${new Date(result[i]['date']).toLocaleTimeString()}</small>
              </div>
              <small class="text-muted">By ${result[i]['fname']} ${result[i]['lname']}</small>
            </a>
          `);
        }
        $("#mlog-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  })
});
let changed = function(instance, cell, x, y, value) {
  var cellName = jexcel.getColumnNameFromId([0,y]);
  var cellName1 = jexcel.getColumnNameFromId([2,y]);
  var cellName2 = jexcel.getColumnNameFromId([24,y]);
  var id = $('#hedisreport').jexcel('getValue',cellName);
  var insid = $('#hedisreport').jexcel('getValue',cellName1);
  var measureid = $('#hedisreport').jexcel('getValue',cellName2);
  var key = $('#hedisreport').jexcel('getHeader',x);
  var count=countOccurences(value,"/"); 
  if(value.includes("/") && count == 1){
      var res = value.split("/");
      var entry = {
        id:id,key:key,value1:res[0],value2:res[1],insid:insid,measureid:measureid,clinicid:localStorage.getItem('chosen_clinic'),userid:localStorage.getItem('userid'),loginid:localStorage.getItem('loginid')
      };
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/updateValueBP", (xhr, err) => {
        if (!err) {
          
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
  }
  else{
    var entry = {
      id:id,key:key,value:value,insid:insid,measureid:measureid,clinicid:localStorage.getItem('chosen_clinic'),userid:localStorage.getItem('userid'),loginid:localStorage.getItem('loginid')
    };
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/updateValue", (xhr, err) => {
      if (!err) {
        
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  }
}
async function loadData(){
  hedisdata = [];
  let entry = {
    clinicid:localStorage.getItem('chosen_clinic'),
    cyear:$("#hedisdate").val(),
    options:options,
    optioncheck:optioncheck,
    cdate:$("#currentdate").html(),
    weekcheck:weekcheck,
  }
  let tmpdate = null;
  $(".progress-load").removeClass("d-none");
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getDaily", (xhr, err) => {
    if (!err) {
      $(".progress-load").addClass("d-none");
      let data = JSON.parse(xhr.responseText)['data'];
      let tmpmid = "";
      let tmpclass = "";
      $(".allcheckoption").empty()
      $(".notcompletedoption").empty()
      $(".outrangeoption").empty()
      console.log(data)
      for(var i=0;i<data.length;i++){
        if(tmpmid != data[i]['mid']){
          tmpclass = "";
          tmpmid = data[i]['mid'];
        }
        else{
          tmpclass = "d-none";
        }
        if(data[i]['dos']==""||data[i]['dos']==null){
          tmpdate = null;
        }
        else{
          tmpdate = deDateFormat(new Date(data[i]['dos']));
        }
        var dob = DateFormat(new Date(data[i]['dob']));
        
        var tmpdata = [
          data[i]['id'],
          data[i]['insName'],
          data[i]['mid'],
          (data[i]['emr_id']!=0&&data[i]['emr_id']!="")?data[i]['emr_id']:null, 
          data[i]['ptfname'], 
          data[i]['ptlname'], 
          dob, 
          "<i class='ti-printer printletter "+tmpclass+"'></i>&nbsp;"+((data[i]['email']!=null&&data[i]['email']!="")?"<i class='ti-email sendemail "+tmpclass+"'></i>":"")+"&nbsp;<i class='ti-mobile sendsms "+tmpclass+"'></i>", 
          data[i]['mlob'], 
          "<i class='ti-eye statusbtn'></i>&nbsp;<i class='mdi mdi-apps viewmlogbtn'></i>", 
          data[i]['measure'], 
          data[i]['fullname']==null?null:data[i]['fullname'].trim(), 
          DateFormat(new Date(data[i]['apptdate'])),
          (data[i]["status"] == 4 ? tmpdate : null), 
          (data[i]["status"] == 4 ? (data[i]['value1']==""||data[i]['value1']==null)?"":(data[i]['dos']==null?"":data[i]['value1']) : null), 
          (data[i]["status"] == 4 ? (data[i]['value2']==""||data[i]['value2']==null)?"":(data[i]['dos']==null?"":data[i]['value2']) : null), 
          (data[i]["status"] == 4 ? (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['cpt1'] : null), 
          (data[i]["status"] == 4 ? (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['cpt2'] : null), 
          (data[i]["status"] == 4 ? (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['icd1'] : null), 
         
          ((data[i]['dos']!=null&&data[i]['dos']!="")&&(data[i]['value1']!=null&&data[i]['value1']!=""))?"done":"notdone",
          (data[i]['status'] == 4?"NONC":(data[i]['status'] == 5?"NEVER":(data[i]['status'] == 6?"IAPPT":(data[i]['status'] == 7?"PTR":(data[i]['status'] == 8?"MR":(data[i]['status'] == 9?"INSA":(data[i]['status'] == 10?"MHIGH":(data[i]['status'] == 11?"CNINS":data[i]['status'] == 12?"DEC":(data[i]['status'] == 13?"FileG":(data[i]['status'] == 14?"PCPC":"")))))))))),
          (data[i]['notesflag']!=null)?"notesflag":"",
          (data[i]['flag']==1)?"marked":"notmarked",
          data[i]['status'],
          data[i]['measureid'],
          DateFormat(new Date(data[i]['apptdate'])),
          data[i]['apptpcp'],
          data[i]['apptvisit'],
        ];
        hedisdata.push(tmpdata);
      }
      $("#hedisreport").empty();
      jexcel(document.getElementById('hedisreport'), {
        data:hedisdata,
        search:true,
        pagination: 50,
        paginationOptions: [10,25,50,100],
        columns: [
          {
              type: 'hidden',
              title:'ID',
              readOnly:true,
              width:0
          },
          {
              type: 'text',
              title:'INS Name',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'INS ID',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'EMR ID',
              width:80
          },
          {
              type: 'text',
              title:'First Name',
              width:100
          },
          {
              type: 'text',
              title:'Last Name',
              width:100
          },
          {
              type: 'text',
              title:'DOB',
              readOnly:true,
              width:100
          },
          {
              type: 'html',
              title:'Contact',
              readOnly:true,
              width:60
          },
          {
              type: 'text',
              title:'LOB',
              readOnly:true,
              width:50
          },
          {
              type: 'html',
              title:'Status & Log',
              readOnly:true,
              width:80
          },
          {
              type: 'text',
              title:'Measure',
              readOnly:true,
              width:250
          },
          {
              type: 'text',
              title:'Appt PCP',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'APPT Date',
              readOnly:true,
              width:100
          },
          {
              type: 'calendar',
              title:'DOS',
              options: { format:'MM/DD/YYYY'},
              width:100
          },
          {
              type: 'text',
              title:'Value1',
              width:50
          },
          {
              type: 'text',
              title:'Value2',
              width:50
          },
          {
              type: 'text',
              title:'CPT1',
              width:50
          },
          {
              type: 'text',
              title:'CPT2',
              width:50
          },
          {
              type: 'text',
              title:'ICD',
              width:50
          },
          {
              type: 'hidden',
              title:'Done',
              width:50
          },
          {
              type: 'hidden',
              title:'Missing',
              width:50
          },
          {
              type: 'hidden',
              title:'Notesflag',
              width:50
          },
          {
              type: 'hidden',
              title:'Marked',
              width:50
          },
          {
              type: 'hidden',
              title:'scheck',
              width:50
          },
          {
              type: 'hidden',
              title:'measureid',
              width:50
          },
          {
              type: 'hidden',
              title:'apptdate',
              width:50
          },
          {
              type: 'hidden',
              title:'apptpcpname',
              width:50
          },
          {
              type: 'hidden',
              title:'apptvisit',
              width:50
          }
        ],
        filters: true,
        allowComments:true,
        updateTable:function(instance, cell, col, row, val, label, cellName) {
          if (cell.innerHTML == 'notesflag') {
              cell.parentNode.childNodes[8].classList.add("notesflag");
          }
          // if (cell.innerHTML == 'done') {
          //   cell.parentNode.style.color = tmpcolor[0]["tcolor"];
          //   cell.parentNode.childNodes[11].childNodes[0].style.display = 'none';
          //   cell.parentNode.childNodes[11].childNodes[0].disabled = true;
          // }
          if (cell.innerHTML == 'NONC') {
              cell.parentNode.style.color = tmpcolor[3]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[3]["bcolor"];
          }
          // if (cell.innerHTML == 'NEVER') {
          //     cell.parentNode.style.color = tmpcolor[4]["tcolor"];
          //     cell.parentNode.style.backgroundColor = tmpcolor[4]["bcolor"];
          // }
          if (cell.innerHTML == 'IAPPT') {
              cell.parentNode.style.color = tmpcolor[5]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[5]["bcolor"];
          }
          // if (cell.innerHTML == 'PTR') {
          //   cell.parentNode.style.color = tmpcolor[6]["tcolor"];
          //   cell.parentNode.style.backgroundColor = tmpcolor[6]["bcolor"];
          // }
          // if (cell.innerHTML == 'MR') {
          //     cell.parentNode.style.color = tmpcolor[7]["tcolor"];
          //     cell.parentNode.style.backgroundColor = tmpcolor[7]["bcolor"];
          // }
          // if (cell.innerHTML == 'INSA') {
          //   cell.parentNode.style.color = tmpcolor[8]["tcolor"];
          //   cell.parentNode.style.backgroundColor = tmpcolor[8]["bcolor"];
          // }
          // if (cell.innerHTML == 'MHIGH') {
          //     cell.parentNode.style.color = tmpcolor[9]["tcolor"];
          //     cell.parentNode.style.backgroundColor = tmpcolor[9]["bcolor"];
          // }
          // if (cell.innerHTML == 'CNINS') {
          //     cell.parentNode.style.color = tmpcolor[10]["tcolor"];
          //     cell.parentNode.style.backgroundColor = tmpcolor[10]["bcolor"];
          // }
          // if (cell.innerHTML == 'DEC') {
          //     cell.parentNode.style.color = tmpcolor[11]["tcolor"];
          //     cell.parentNode.style.backgroundColor = tmpcolor[11]["bcolor"];
          // }
          // if (cell.innerHTML == 'FileG') {
          //   cell.parentNode.style.color = tmpcolor[12]["tcolor"];
          //   cell.parentNode.style.backgroundColor = tmpcolor[12]["bcolor"];
          // }
          // if (cell.innerHTML == 'PCPC') {
          //   cell.parentNode.style.color = tmpcolor[13]["tcolor"];
          //   cell.parentNode.style.backgroundColor = tmpcolor[13]["bcolor"];
          // }
          // if (cell.innerHTML == 'Generated') {
          //   cell.parentNode.style.color = tmpcolor[12]["tcolor"];
          //   cell.parentNode.style.backgroundColor = tmpcolor[12]["bcolor"];
          // }
          // if (cell.innerHTML == 'Reported') {
          //   cell.parentNode.style.color = tmpcolor[7]["tcolor"];
          //   cell.parentNode.style.backgroundColor = tmpcolor[7]["bcolor"];
          // }
        },
        onchange: changed
      });
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
