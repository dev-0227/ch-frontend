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
let tmpupdatenote;
var hedisdata = [];
var tmpcolor = [];
var tmpchosenitem;
var optioncheck = 1;
var options = [];
var tmpall = [];
var tmpoutrange = [];
var checkview = 3;
let mySpreadsheet = null;
$(document).ready(function () {
  "use strict";
  let insid = getUrlVars();
  if(insid['status'] != null){
    optioncheck = 4;
    options.push(insid['status']);
    // $(".donenotdoneoption[value=3]").prop("checked",true);
  }
  else if(insid['m'] != null){
    optioncheck = 1;
    options.push(atob(insid['m']));
    checkview = insid['check'];
  }
  if(insid['ls'] == 1){
    optioncheck = 1;
    checkview = 5;
  }
  else if(insid['ls'] == 2){
    optioncheck = 1;
    checkview = 4;
  }
  else if(insid['ls'] == 3){
    optioncheck = 4;
    options.push("13");
  }
  else if(insid['ls'] == 4){
    optioncheck = 4;
    options.push("9");
  }
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
      $(".status-option").html(`
          <label class="custom-control custom-radio">
            <input type="radio" class="custom-control-input statusoption" name="statusoption" value="0">
            <span class="tag custom-control-label">None</span>
          </label>`);
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
          $(".status-option").append(`
          <label class="custom-control custom-radio">
            <input type="radio" class="custom-control-input statusoption" name="statusoption" value="`+result[i]['scheck']+`">
            <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
          </label>`);
          $(".color-sort-list").append(`
          <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="`+result[i]['scheck']+`">
            <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
          </label>`);
        }
        
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
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {insid:insid['insid']}, "setting/getoutputbtn", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".outputbtnsection").empty();
      for(var i = 0; i < result.length; i++){
        $(".outputbtnsection").append(`
        <button type="button" fileid="`+result[i]['id']+`" class="btn btn-sm btn-outline-primary outputbtn">`+(result[i]['filedefinition']==1?"Enc File":(result[i]['filedefinition']==2?"Lab File":(result[i]['filedefinition']==3?"ESD File":"")))+`</button>`);
      }
      $(".outputbtnsection").append(`
      <a href="../pages/hedismonthreport" target="_blank" class="btn btn-sm btn-outline-primary">Monthly Report</a>
      `);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),insid:insid['insid']}, "setting/getClinicins", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".hedis-title").html(result['clinic']+" | "+result['ins']+" Hedis Quality Tracking");
      $("#patient-modal-insurance").html(result['clinic']+" | "+result['ins']);
      $("#notes-modal-title").html(result['clinic']+" | "+result['ins']);
  } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(document).on("click",".outputbtn",function(){
    $("#fileid").val($(this).attr("fileid"));
    $("#output-modal").modal("show");
  });
  $(document).on("click",".generateoutfile",function(){
    $("body").append("<form id = 'outputform' action = '"+serviceUrl+"hedis/outputhedis' method = 'POST'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='userid' value='"+localStorage.getItem('userid')+"' /><input type='hidden' name='loginid' value='"+localStorage.getItem('loginid')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /><input type='hidden' name='fileid' value='"+$("#fileid").val()+"' /><input type='hidden' name='insid' value='"+insid['insid']+"' /><input type='hidden' name='trackoption' value='"+$(".trackoption:checked").val()+"' /></form>");
    $("#outputform").submit();
    $("#outputform").remove();
  })
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
  $(".emailoption").click(function(){
    if($(this).val() == 1){
      $(".customemailarea").addClass("d-none");
      $(".defaultemailarea").removeClass("d-none");
    }
    else{
      $(".customemailarea").removeClass("d-none");
      $(".defaultemailarea").addClass("d-none");
    }
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
  
  $("#emailsendbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),qid:$("#chosen_item").val(),emailtype:$(".emailoption:checked").val(),custombody:$("#customemailbody").val()}, "hedis/sendemail", (xhr, err) => {
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
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),userid:localStorage.getItem('userid'),qid:$("#chosen_item").val(),smstype:$(".smsoption:checked").val(),custombody:$("#customsmsbody").val(),number:$(".phoneitem:checked").val(),whatsapp:$(".whatsappoption:checked").val()}, "hedis/sendsms", (xhr, err) => {
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
    $(".sortoption[value='1']").prop("checked",true);
    $(".searchoption").prop("checked",false);
    $("#sort-modal").modal("show");
  });
  $(document).on("click",".statusbtn",function(){

    tmpchosenitem = $(this).parent().parent();
    var tmpvalue = $(this).parent().parent().children().eq(23).html();
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $(".statusoption[value='"+tmpvalue+"']").prop("checked",true);
    if(tmpvalue == 6){
      $(".appt_date_area").removeClass("d-none");
      $(".visit_date_area").addClass("d-none");
      $(".apptdate").val($(this).parent().parent().children().eq(25).html());
      $(".apptpcpname").val($(this).parent().parent().children().eq(29).html()==""?0:$(this).parent().parent().children().eq(29).html())
      $(".apptvisittype").val($(this).parent().parent().children().eq(30).html())
    }
    else if(tmpvalue == 4){
      $(".appt_date_area").addClass("d-none");
      $(".visit_date_area").removeClass("d-none");
      $(".nextdate").val($(this).parent().parent().children().eq(26).html())
      $(".lastdate").val($(this).parent().parent().children().eq(27).html())
      $(".apptpcpname").val(0)
      $(".apptvisittype").val("")
    }
    else{
      $(".appt_date_area").addClass("d-none");
      $(".visit_date_area").addClass("d-none");
      $(".apptdate").val("");
      $(".nextdate").val("");
      $(".lastdate").val("");
      $(".apptpcpname").val(0)
      $(".apptvisittype").val("")
    }
    $("#status-modal").modal("show");
  });
  $(document).on("click",".statusoption",function(){
    if($(this).val() == 6){
      $(".visit_date_area").addClass("d-none");
      $(".appt_date_area").removeClass("d-none");
      $(".apptdate").val(tmpchosenitem.children().eq(25).html())
    }
    else if($(this).val() == 4){
      $(".appt_date_area").addClass("d-none");
      $(".visit_date_area").removeClass("d-none");
      $(".nextdate").val(tmpchosenitem.children().eq(26).html())
      $(".lastdate").val(tmpchosenitem.children().eq(27).html())
    }
    else{
      $(".visit_date_area").addClass("d-none");
      $(".appt_date_area").addClass("d-none");
      $(".apptdate").val("");
      $(".nextdate").val("");
      $(".lastdate").val("");
    }
  });
  $(".exportexcelbtn").click(function(){
    var gettingData = mySpreadsheet.getData();
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "INS ID,EMR ID,First Name,Last Name,DOB,Phone,LOB,Measure,DOS,Value1,Value2,CPT1,CPT2,ICD" + "\r\n";
    gettingData.forEach(function(rowArray) {
        rowArray.splice(0,1);
        rowArray.splice(6,2);
        rowArray.splice(7,1);
        rowArray.splice(14,13);
    });
    gettingData.forEach(function(rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
  });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", $(".hedis-title").html()+".csv");
    document.body.appendChild(link); // Required for FF

    link.click();
  });
  $(".setstatusbtn").click(function(){
    var status = $(".statusoption:checked").val();
    if(status == 6){
      var apptdate = $(".apptdate").val();
      var apptpcp = $(".apptpcpname").val()==0?null:$(".apptpcpname").val();
      var apptvisittype = $(".apptvisittype").val()==""?null:$(".apptvisittype").val();
      var lastdate = null;
      var nextdate = null;
    }
    else if(status == 4){
      var lastdate = $(".lastdate").val();
      var nextdate = $(".nextdate").val();
      var apptdate = null;
      var apptpcp = null;
      var apptvisittype = null;
    }
    else{
      var apptdate = null;
      var lastdate = null;
      var nextdate = null;
      var apptpcp = null;
      var apptvisittype = null;
    }
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      userid:localStorage.getItem('userid'),
      loginid:localStorage.getItem("loginid"),
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
        tmpchosenitem.children().eq(23).html(status);
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
        $(".sort-done-notdone").removeClass('d-none')
    }
    else if($(this).attr("optiontype") == 3){
        optioncheck = 3;
        $(".sort-done-notdone").addClass('d-none')
    }
    else if($(this).attr("optiontype") == 4){
        optioncheck = 4;
        $(".sort-done-notdone").addClass('d-none')
    }
  });
  $(".sortsearchbtn").click(function(){
    options = [];
    if(optioncheck == 1){
        $.each($(".allcheck:checked"), function(){
            options.push($(this).val());
        });
        if($(".sortoption:checked").val() == 1){
          checkview = 1;
        }
        else if($(".sortoption:checked").val() == 2){
          checkview = 2;
        }
        else{
          checkview = 3;
        }
    }
    else if(optioncheck == 3){
        $.each($(".outrangecheck:checked"), function(){
            options.push($(this).val());
        });
        checkview = 1;
    }
    else{
        $.each($(".colorsort:checked"), function(){
            options.push($(this).val());
        });
        checkview = 1;
    }
    loadData();
  });
  $(".sortclearbtn").click(function(){
    checkview = 1;
    options = [];
    optioncheck = 1;
    loadData();
  });
  $("#print-patient-modal-btn").click(function(){
    printJS({
      printable:'patient-modal-print-area', 
      type:'html',
      css: [
          '../assets/css/style.css',
      ],
      style: [
          '@page { size: Letter landscape; }.completed-area{float:left;width:50%}.notcompleted-area{float:left;width:50%}',
      ]
  });
  });
  $(document).on("click",".notesbtn",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $("#notes-modal-name").html($(this).parent().parent().children().eq(4).html()+" "+$(this).parent().parent().children().eq(5).html());
    $("#notes-modal-mid").html($(this).parent().parent().children().eq(2).html());
    $("#notes-modal-dob").html($(this).parent().parent().children().eq(6).html());
    $("#notes-modal-phone").html($(this).parent().parent().children().eq(7).html());
    $("#notes-created").html(localStorage.getItem('username')+" : "+new Date().toLocaleString());
    $("#allviewnotes").empty();
    $("#allviewnotes").append('<a href="../pages/notesview?qid='+$("#chosen_item").val()+'" target="_blank" class="form-control-label text-primary">See More</a>');
    let noteentry = {
      mid:$(this).parent().parent().children().eq(2).html(),
      clinicid:localStorage.getItem('chosen_clinic'),
      userid:localStorage.getItem('userid'),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), noteentry, "hedis/getnotes", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $("#token_area").empty();
        for(var i = 0;i< data.length;i++){
          $("#token_area").append("<div><span class='text-primary'>"+data[i]['fname']+" "+data[i]['lname']+" "+new Date(data[i]['created']).toLocaleString()+" > </span><span class='notearea'>"+data[i]['note']+"</span>"+(data[i]['createduser']==localStorage.getItem('userid')?"&nbsp;<i class='fa fa-pencil text-info updatenotebtn' key='"+data[i]['id']+"'></i>&nbsp;<i class='fa fa-trash text-danger deletenotebtn' key='"+data[i]['id']+"'></i>":"")+"</div>")
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
    let entry = {
      mid:$(this).parent().parent().children().eq(2).html(),
      clinicid:localStorage.getItem('chosen_clinic'),
      cyear:$("#hedisdate").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getpatientchart", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $(".completednotemeasure").empty();
        $(".notcompletednotemeasure").empty();
        var completecnt = 0;
        for(var i=0;i<data.length;i++){
          if(data[i]['status'] == 1||data[i]['status'] == 2||data[i]['status'] == 3){
            $(".completednotemeasure").append(`
              <li class="p-1">
                <span class="list-label"></span>${data[i]['measure']} - ${DateFormat(new Date(data[i]['dos']))}
              </li>
            `);
            completecnt++;
          }
          else{
            $(".notcompletednotemeasure").append(`
              <li class="p-1">
                <span class="list-label"></span>`+data[i]['measure']+`
              </li>
            `);
          }
        }
        $(".completedpernote").html(Math.round(completecnt/data.length*100)+"%");
        $(".notcompletedpernote").html((100-Math.round(completecnt/data.length*100))+"%");
        $(".completedbarlengthnote").circleProgress({value: (Math.round(completecnt/data.length*100)/100),size:80});
        $(".notcompletedbarlengthnote").circleProgress({value: ((1-Math.round(completecnt/data.length*100)/100)),size:80});
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getavaiuserchosenclinic", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $("#notes-assuser").empty();
        $("#notes-assuser").append("<option value='0'>All</option>");
        for(var i = 0; i < data.length;i++){
          $("#notes-assuser").append("<option value='"+data[i]['id']+"'>"+data[i]['fname']+" "+data[i]['lname']+"</option>");
        }
        $("#notes-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".updatenotebtn",function(){
    tmpupdatenote = $(this).parent().find(".notearea");
    $("#notetext").val($(this).parent().find(".notearea").html())
    $("#chosen_note").val($(this).attr("key"));
    $("#update-note-modal").modal("show");
  });
  $("#editnotebtn").click(function(){
    let entry={
      id:$("#chosen_note").val(),
      note:$("#notetext").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/updatenote", (xhr, err) => {
      if (!err) {
        tmpupdatenote.html($("#notetext").val())
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".deletenotebtn",function(){
    let entry = {
      id: $(this).attr("key"),
    }
    var tmp = $(this).parent()
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/deletenote", (xhr, err) => {
          if (!err) {
            tmp.remove();
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });
  $(document).on("click",".viewresultbtn",function(){
    $("#patient-modal-title").html($(this).parent().parent().children().eq(4).html()+" "+$(this).parent().parent().children().eq(5).html());
    $("#patient-modal-name").html($(this).parent().parent().children().eq(4).html()+" "+$(this).parent().parent().children().eq(5).html());
    $("#patient-modal-mid").html($(this).parent().parent().children().eq(2).html());
    $("#patient-modal-dob").html($(this).parent().parent().children().eq(6).html());
    $("#patient-modal-phone").html($(this).parent().parent().children().eq(7).html());
    let entry = {
      mid:$(this).parent().parent().children().eq(2).html(),
      clinicid:localStorage.getItem('chosen_clinic'),
      cyear:$("#hedisdate").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getpatientchart", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $(".completedptmeasure").empty();
        $(".notcompletedptmeasure").empty();
        var completecnt = 0;
        for(var i=0;i<data.length;i++){
          if(data[i]['status'] == 1||data[i]['status'] == 2||data[i]['status'] == 3){
            $(".completedptmeasure").append(`
              <li class="p-1">
                <span class="list-label"></span>${data[i]['measure']} - ${DateFormat(new Date(data[i]['dos']))}
              </li>
            `);
            completecnt++;
          }
          else{
            $(".notcompletedptmeasure").append(`
              <li class="p-1">
                <span class="list-label"></span>`+data[i]['measure']+`
              </li>
            `);
          }
        }
        $(".completedper").html(Math.round(completecnt/data.length*100)+"%");
        $(".notcompletedper").html((100-Math.round(completecnt/data.length*100))+"%");
        $(".completedbarlength").circleProgress({value: (Math.round(completecnt/data.length*100)/100)});
        $(".notcompletedbarlength").circleProgress({value: ((1-Math.round(completecnt/data.length*100)/100))});
        $("#patient-chart-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  
  $("#notes-submit").click(function(){
    let entry = {
      qid:$("#chosen_item").val(),
      note:$("#notes-text").val(),
      assignuser:$("#notes-assuser").val(),
      status:$(".notes-status:checked").val(),
      createduser:localStorage.getItem('userid'),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/writenotes", (xhr, err) => {
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
  $(document).on("click",".viewmlogbtn",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      id:$("#chosen_item").val(),
      insid:insid['insid']
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
  $(document).on("click",".viewrlogbtn",function(){
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      insid:insid['insid']
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getractionlog", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length == 0){
          return $.growl.notice({
            message: "No Action"
          });
        }
        $("#accordion").empty();
        for(var i = 0; i < result.length;i++){
          $("#accordion").append(`
            <div class="panel panel-default">
              <div class="panel-heading" role="tab" id="headingOne">
                <h4 class="panel-title">
                  <a ${result[i]['rdate']==null?" role='button' data-toggle='collapse' data-parent='#accordion' href='#collapseOne"+result[i]['id']+"' aria-expanded='true' aria-controls='collapseOne'":""}>
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1 text-primary">${result[i]['filename']} - Total : ${result[i]['total']} <i class="ti-pencil-alt reviewdonebtn" idkey="${result[i]['id']}"></i> <i class="ti-download regeneratebtn" idkey="${result[i]['id']}"></i></h5>
                      <div><small class="text-muted">Generated</small><div class="mt-2" style="font-size:14px">${DateFormat(new Date(result[i]['date']))} ${new Date(result[i]['date']).toLocaleTimeString()}</div></div>
                      ${result[i]['rdate']==null?"":'<div><small class="text-muted">Reported&nbsp;&nbsp;<i class="ti-pencil-alt" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne'+result[i]['id']+'" aria-expanded="true" aria-controls="collapseOne"></i></small><div class="mt-2" style="font-size:14px">'+DateFormat(new Date(result[i]['rdate']))+(result[i]['rby']==1?" - FTP":(result[i]['rby']==2?" - Email":(result[i]['rby']==3?" - Portal":"")))+'</div></div>'}
                    </div>
                    <small class="text-muted">${result[i]['name']==null?"None":result[i]['name']} - By ${result[i]['fname']} ${result[i]['lname']}</small>
                  </a>
                </h4>
              </div>
              <div id="collapseOne${result[i]['id']}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                <div class="panel-body">
                  <div class="row">
                    <div class="col-lg-4">
                      <label class="form-control-label">Reported Date:</label>
                      <div class="input-group">
                        <div class="input-group-prepend">
                          <div class="input-group-text">
                            <i class="fa fa-calendar tx-16 lh-0 op-6"></i>
                          </div>
                        </div><input class="form-control fc-datepicker reporteddate" placeholder="MM/DD/YYYY" type="text" value="${result[i]['rdate']==null?"":DateFormat(new Date(result[i]['rdate']))}">
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <label class="form-control-label d-block">Reported By:</label>
                      <div class="input-group">
                        <select class="form-control reportedby">
                          <option value = "0" ${result[i]['rby']==null?"selected":""}>Nothing Selected</option>
                          <option value = "1" ${result[i]['rby']==1?"selected":""}>FTP</option>
                          <option value = "2" ${result[i]['rby']==2?"selected":""}>Email</option>
                          <option value = "3" ${result[i]['rby']==3?"selected":""}>Portal</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <button class="btn btn-${result[i]['rdate']==null?"primary":"warning"} updatereported" style="position:absolute;bottom:0" idkey="${result[i]['id']}">${result[i]['rdate']==null?"Save":"Update"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `);
        }
        $(".reporteddate").datepicker({
          showOtherMonths: true,
		      selectOtherMonths: true
        });
        $("#rlog-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".updatereported",function(){
    let entry = {
      id:$(this).attr("idkey"),
      rdate:$(this).parent().parent().find(".reporteddate").val(),
      rby:$(this).parent().parent().find(".reportedby").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/updatereported", (xhr, err) => {
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
  $(document).on("click",".regeneratebtn",function(){
    $("body").append("<form id = 'outputform' action = '"+serviceUrl+"hedis/outputhedis' method = 'POST'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='userid' value='"+localStorage.getItem('userid')+"' /><input type='hidden' name='loginid' value='"+localStorage.getItem('loginid')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /><input type='hidden' name='fileid' value='"+$("#fileid").val()+"' /><input type='hidden' name='insid' value='"+insid['insid']+"' /><input type='hidden' name='trackoption' value='2' /><input type='hidden' name='reoption' value='1' /><input type='hidden' name='reidkey' value='"+$(this).attr("idkey")+"' /></form>");
    $("#outputform").submit();
    $("#outputform").remove();
  });
  $(document).on("click",".reviewdonebtn",function(){
    $("#rlog-modal").modal("hide");
    optioncheck = 5;
    checkview = 6;
    $(".donenotdoneoption[value=4]").prop("checked",true);
    options = $(this).attr("idkey");
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$(this).attr("idkey")}, "hedis/chosenreported", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $(".generatedfilename").html(data[0]['filename']);
        $(".generatedfiledate").html(data[0]['date']==null?"":DateFormat(new Date(data[0]['date'])));
        $(".reportedfile").html(data[0]['rdate']==null?"":" | Reported : "+(data[0]['rby']==1?"FTP":(data[0]['rby']==2?"Email":"Portal"))+" "+DateFormat(new Date(data[0]['rdate'])));
        loadData()
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  })
  $(".donenotdoneoption").click(function(){
    if($(this).val() == 2){
      checkview = 2;
      options = [];
      optioncheck = 1;
      // options = ["1","2","3","8","9","13"];
    }
    else if($(this).val() == 3){
      checkview = 3;
      options = [];
      optioncheck = 1;
      // options = ["4","5","6","7","10","12","14"];
    }
    else if($(this).val() == 4){
      checkview = 6;
      options = [];
      optioncheck = 1;
      // options = ["4","5","6","7","10","12","14"];
    }
    else{
      checkview = 1;
      options = [];
      optioncheck = 1;
    }
    loadData();
  });
});
let changed = function(instance, cell, x, y, value) {
  var cellName = jexcel.getColumnNameFromId([0,y]);
  var cellName1 = jexcel.getColumnNameFromId([1,y]);
  var cellName2 = jexcel.getColumnNameFromId([23,y]);
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
let selectionActive = function(instance, x1, y1, x2, y2, origin) {
  // var key = $('#hedisreport').jexcel('getHeader',x1);
  // var cellName = jexcel.getColumnNameFromId([0,y1]);
  // var cellName1 = jexcel.getColumnNameFromId([1,y1]);
  // var fnamecell = jexcel.getColumnNameFromId([3,y1]);
  // var lnamecell = jexcel.getColumnNameFromId([4,y1]);
  // var dobcell = jexcel.getColumnNameFromId([5,y1]);
  // var phonecell = jexcel.getColumnNameFromId([6,y1]);
  // var id = $('#hedisreport').jexcel('getValue',cellName);
  // var mid = $('#hedisreport').jexcel('getValue',cellName1);
  // var fname = $('#hedisreport').jexcel('getValue',fnamecell);
  // var lname = $('#hedisreport').jexcel('getValue',lnamecell);
  // var dob = $('#hedisreport').jexcel('getValue',dobcell);
  // var phone = $('#hedisreport').jexcel('getValue',phonecell);
  // if(key == "First Name" || key == "Last Name"){
  //   $("#patient-modal-title").html(fname+" "+lname);
  //   $("#patient-modal-name").html(fname+" "+lname);
  //   $("#patient-modal-mid").html(mid);
  //   $("#patient-modal-dob").html(dob);
  //   $("#patient-modal-phone").html(phone);
  //   let entry = {
  //     mid:mid,
  //     clinicid:localStorage.getItem('chosen_clinic'),
  //     cyear:$("#hedisdate").val(),
  //   }
  //   sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getpatientchart", (xhr, err) => {
  //     if (!err) {
  //       let data = JSON.parse(xhr.responseText)['data'];
  //       $(".completedptmeasure").empty();
  //       $(".notcompletedptmeasure").empty();
  //       var completecnt = 0;
  //       for(var i=0;i<data.length;i++){
  //         if(data[i]['status'] == 1||data[i]['status'] == 2||data[i]['status'] == 3){
  //           $(".completedptmeasure").append(`
  //             <li class="p-1">
  //               <span class="list-label"></span>${data[i]['measure']} - ${DateFormat(new Date(data[i]['dos']))}
  //             </li>
  //           `);
  //           completecnt++;
  //         }
  //         else{
  //           $(".notcompletedptmeasure").append(`
  //             <li class="p-1">
  //               <span class="list-label"></span>`+data[i]['measure']+`
  //             </li>
  //           `);
  //         }
  //       }
  //       $(".completedper").html(Math.round(completecnt/data.length*100)+"%");
  //       $(".notcompletedper").html((100-Math.round(completecnt/data.length*100))+"%");
  //       $(".completedbarlength").circleProgress({value: (Math.round(completecnt/data.length*100)/100)});
  //       $(".notcompletedbarlength").circleProgress({value: ((1-Math.round(completecnt/data.length*100)/100))});
  //       $("#patient-chart-modal").modal("show");
  //     } else {
  //       return $.growl.error({
  //         message: "Action Failed"
  //       });
  //     }
  //   });
  // }
}
async function loadData(){
  hedisdata = [];
  tmpall = [];
  tmpoutrange = [];
  $(".allcheckoption").empty()
  $(".outrangeoption").empty()
 
  let insid = getUrlVars();
  let entry = {
    clinicid:localStorage.getItem('chosen_clinic'),
    cyear:$("#hedisdate").val(),
    insid:insid['insid'],
    options:options,
    optioncheck:optioncheck
  }
  let tmpdate = null;
  $(".progress-load").removeClass("d-none");
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getData", (xhr, err) => {
    if (!err) {
      $(".progress-load").addClass("d-none");
      let data = JSON.parse(xhr.responseText)['data'];
      let ptcnt = JSON.parse(xhr.responseText)['ptcnt'];
      let measurecnt = JSON.parse(xhr.responseText)['measurecnt'];
      $(".totalptcnt").html(ptcnt)
      $(".totalmeasurecnt").html(measurecnt)
      let tmpmid = "";
      let tmpclass = "";
      let tmpnoteclass = "";
      let tmpemrid = "";
      let tmpptfname = "";
      for(var i=0;i<data.length;i++){
        if(data[i]['multicheck'] == 1){
          if(data[i]['emr_id'] == tmpemrid&&data[i]['ptfname'] == tmpptfname){
            if(data[i]['Rates'] == tmprate){
                tmpcnt ++;
                tmpmeasure = data[i]['measure']+(parseInt(data[i]['quantity']==null?0:data[i]['quantity']) > 1?' #'+tmpcnt+(data[i]['measureid']==81&&tmpcnt<=6?" - 15":""):"");
            }
            else{
                tmpcnt = tmpfirstcnt==1?2:1;
                tmpmeasure = data[i]['measure']+(parseInt(data[i]['quantity']==null?0:data[i]['quantity']) > 1?' #'+tmpcnt+(data[i]['measureid']==81&&tmpcnt<=6?" - 15":""):"");
                tmprate = data[i]['measure'];
            }
            tmpfirstcnt = 0;
          }
          else{
            var tmprate = "";
            var tmpfirstcnt = 1;
            tmpemrid =  data[i]['emr_id'];
            tmpptfname =  data[i]['ptfname'];
            var tmpmeasure = data[i]['measure']+(parseInt(data[i]['quantity']==null?0:data[i]['quantity']) > 1?' #'+tmpfirstcnt+(data[i]['measureid']==81&&tmpfirstcnt<=6?" - 15":""):"");
          }
        }
        else{
          var tmpmeasure = data[i]['measure'];
        }
        if(tmpmid != data[i]['mid']){
          tmpclass = "";
          tmpmid = data[i]['mid'];
        }
        else{
          tmpclass = "d-none";
        }
        if(data[i]['notecheck'] != null){
          tmpnoteclass = "notesavailbtn";
        }
        else{
          tmpnoteclass = "";
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
          data[i]['mid'],
          (data[i]['emr_id']!=0&&data[i]['emr_id']!="")?data[i]['emr_id']:null, 
          data[i]['ptfname'], 
          data[i]['ptlname'], 
          dob, 
          data[i]['phone'], 
          "<i class='fa fa-file-text-o viewresultbtn "+tmpclass+"'>&nbsp;</i><i class='fa fa-sticky-note"+(data[i]['notecheck'] != null?"":"-o")+" notesbtn "+tmpclass+" "+tmpnoteclass+"'></i>", 
          "<i class='ti-printer printletter "+tmpclass+"'></i>&nbsp;"+((data[i]['email']!=null&&data[i]['email']!="")?"<i class='ti-email sendemail "+tmpclass+"'></i>":"")+"&nbsp;<i class='ti-mobile sendsms "+tmpclass+"'></i>", 
          data[i]['mlob'], 
          "<i class='ti-eye statusbtn'></i>&nbsp;<i class='mdi mdi-apps viewmlogbtn'></i>", 
          tmpmeasure, 
          tmpdate, 
          (data[i]['value1']==""||data[i]['value1']==null)?"":(data[i]['dos']==null?"":data[i]['value1']), 
          (data[i]['value2']==""||data[i]['value2']==null)?"":(data[i]['dos']==null?"":data[i]['value2']), 
          (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['cpt1'], 
          (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['cpt2'],
          (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['icd1'], 
          ((data[i]['dos']!=null&&data[i]['dos']!="")&&(data[i]['value1']!=null&&data[i]['value1']!=""))?"done":"notdone",
          (data[i]['status'] == 4?"NONC":(data[i]['status'] == 5?"NEVER":(data[i]['status'] == 6?"IAPPT":(data[i]['status'] == 7?"PTR":(data[i]['status'] == 8?"MR":(data[i]['status'] == 9?"INSA":(data[i]['status'] == 10?"MHIGH":(data[i]['status'] == 11?"CNINS":data[i]['status'] == 12?"DEC":(data[i]['status'] == 13?"FileG":(data[i]['status'] == 14?"PCPC":"")))))))))),
          (data[i]['notesflag']!=null)?"notesflag":"",
          (data[i]['flag']==1)?"marked":"notmarked",
          data[i]['status'],
          data[i]['measureid'],
          data[i]['apptdate']==null?null:DateFormat(new Date(data[i]['apptdate'])),
          data[i]['nextdate'],
          data[i]['lastdate']==null?null:DateFormat(new Date(data[i]['lastdate'])),
          data[i]['gstatus']==1?"Generated":"",
          data[i]['apptpcp'],
          data[i]['apptvisit'],
          data[i]['rstatus']==1?"Reported":"",
        ];
        if(checkview == 1)
          hedisdata.push(tmpdata);
        else if(checkview == 2){
          if((data[i]['status'] == 1 || data[i]['status'] == 2 || data[i]['status'] == 3 || data[i]['status'] == 8 || data[i]['status'] == 9 || data[i]['status'] == 13) && data[i]['gstatus'] != 1) hedisdata.push(tmpdata);
        }
        else if(checkview == 3){
          if((data[i]['status'] == 0 || data[i]['status'] == 4 || data[i]['status'] == 5 || data[i]['status'] == 6 || data[i]['status'] == 7 || data[i]['status'] == 10 || data[i]['status'] == 12 || data[i]['status'] == 14) && data[i]['gstatus'] != 1) hedisdata.push(tmpdata);
        }
        else if(checkview == 4){
          if(data[i]['hstatus'] == 3) hedisdata.push(tmpdata);
        }
        else if(checkview == 5){
          if(data[i]['hstatus'] == 2) hedisdata.push(tmpdata);
        }
        else if(checkview == 6){
          if((data[i]['status'] == 1 || data[i]['status'] == 2 || data[i]['status'] == 3 || data[i]['status'] == 8 || data[i]['status'] == 9 || data[i]['status'] == 13) && data[i]['gstatus'] == 1) hedisdata.push(tmpdata);
        }
        if(jQuery.inArray(data[i]['measure'], tmpall) === -1){
            $(".allcheckoption").append(
                `
                <label class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input searchoption allcheck" name="allcheck" value="`+data[i]['measure']+`">
                  <span class="custom-control-label">`+data[i]['measure']+`</span>
                </label>
                `
            );
            tmpall.push(data[i]['measure']);
        }
        if(jQuery.inArray(data[i]['measure'], tmpoutrange) === -1){
            if((data[i]['outcomecheck']=="1")&&(data[i]['status']=="4")){
                $(".outrangeoption").append(
                    `
                    <label class="custom-control custom-checkbox">
                      <input type="checkbox" class="custom-control-input searchoption outrangecheck" name="outrangecheck" value="`+data[i]['measure']+`">
                      <span class="custom-control-label">`+data[i]['measure']+`</span>
                    </label>
                    `
                );
                tmpoutrange.push(data[i]['measure']);
            }
        }
      }
      $("#hedisreport").empty();
        mySpreadsheet = jexcel(document.getElementById('hedisreport'), {
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
              title:'INS ID',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'EMR ID',
              width:100
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
              type: 'text',
              title:'Phone',
              width:100
          },
          {
              type: 'html',
              title:'View & Notes',
              readOnly:true,
              width:80
          },
          {
              type: 'html',
              title:'Contact',
              readOnly:true,
              width:80
          },
          {
              type: 'text',
              title:'LOB',
              readOnly:true,
              width:80
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
              width:300
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
              width:80
          },
          {
              type: 'text',
              title:'Value2',
              width:80
          },
          {
              type: 'text',
              title:'CPT1',
              width:80
          },
          {
              type: 'text',
              title:'CPT2',
              width:80
          },
          {
              type: 'text',
              title:'ICD',
              width:80
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
              title:'nextdate',
              width:50
          },
          {
              type: 'hidden',
              title:'lastdate',
              width:50
          },
          {
              type: 'hidden',
              title:'Generated',
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
          },
          {
              type: 'hidden',
              title:'Reported',
              width:50
          }
        ],
        filters: true,
        allowComments:true,
        updateTable:function(instance, cell, col, row, val, label, cellName) {
          if (cell.innerHTML == 'notesflag') {
              cell.parentNode.childNodes[8].classList.add("notesflag");
          }
          if (cell.innerHTML == 'done') {
              cell.parentNode.style.color = tmpcolor[0]["tcolor"];
              cell.parentNode.childNodes[11].childNodes[0].style.display = 'none';
              cell.parentNode.childNodes[11].childNodes[0].disabled = true;
          }
          if (cell.innerHTML == 'NONC') {
              cell.parentNode.style.color = tmpcolor[3]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[3]["bcolor"];
          }
          if (cell.innerHTML == 'NEVER') {
              cell.parentNode.style.color = tmpcolor[4]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[4]["bcolor"];
          }
          if (cell.innerHTML == 'IAPPT') {
              cell.parentNode.style.color = tmpcolor[5]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[5]["bcolor"];
          }
          if (cell.innerHTML == 'PTR') {
            cell.parentNode.style.color = tmpcolor[6]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[6]["bcolor"];
          }
          if (cell.innerHTML == 'MR') {
              cell.parentNode.style.color = tmpcolor[7]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[7]["bcolor"];
          }
          if (cell.innerHTML == 'INSA') {
            cell.parentNode.style.color = tmpcolor[8]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[8]["bcolor"];
          }
          if (cell.innerHTML == 'MHIGH') {
              cell.parentNode.style.color = tmpcolor[9]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[9]["bcolor"];
          }
          if (cell.innerHTML == 'CNINS') {
              cell.parentNode.style.color = tmpcolor[10]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[10]["bcolor"];
          }
          if (cell.innerHTML == 'DEC') {
              cell.parentNode.style.color = tmpcolor[11]["tcolor"];
              cell.parentNode.style.backgroundColor = tmpcolor[11]["bcolor"];
          }
          if (cell.innerHTML == 'FileG') {
            cell.parentNode.style.color = tmpcolor[12]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[12]["bcolor"];
          }
          if (cell.innerHTML == 'PCPC') {
            cell.parentNode.style.color = tmpcolor[13]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[13]["bcolor"];
          }
          if (cell.innerHTML == 'Generated') {
            cell.parentNode.style.color = tmpcolor[12]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[12]["bcolor"];
          }
          if (cell.innerHTML == 'Reported') {
            cell.parentNode.style.color = tmpcolor[7]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[7]["bcolor"];
          }
        },
        onchange: changed,
        onselection: selectionActive
      });
      if(optioncheck == 5){
        $(".generatetitle").removeClass("d-none");
      }
      else{
        $(".generatetitle").addClass("d-none");
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
