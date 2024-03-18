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
let odevice


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
let bResetCheck = false;

let globalsmsarr;
let globalemailarr;
let calltimer ;
let startcalltime ;
let customnumber = false;
let customsmsnumber = false;
let otheremailnumber = false;

let  outputVolumeBar;
let  inputVolumeBar ;
let outgoingCallHangupButton;

let patientinsid =''
let patientemrid =''
let gcallnumber = ''

let insidlist = []
let inemrlist = []

$(document).ready(function () {
  "use strict";

  var moveLeft = 40;
  var moveDown = -10;

 
  let insid = getUrlVars();
  console.log(insid)
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

            $(".cstatus-measure").append(`
            <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="`+result[i]['scheck']+`">
            <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
            </label>`);
            
          }
          else if([5,6,12,14,16].includes(result[i]['scheck'])){
            $(".status-patient").append(`
            <label class="custom-control custom-radio">
              <input type="radio" class="custom-control-input statusoption" name="statusoption" value="`+result[i]['scheck']+`">
              <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
            </label>`);
            $(".cstatus-patient").append(`
            <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="`+result[i]['scheck']+`">
            <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
            </label>`);
          }
          else {
            $(".status-meas-rep").append(`
            <label class="custom-control custom-radio">
              <input type="radio" class="custom-control-input statusoption" name="statusoption" value="`+result[i]['scheck']+`">
              <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
            </label>`);
            $(".cstatus-meas-rep").append(`
            <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input searchoption colorsort" name="colorsort" value="`+result[i]['scheck']+`">
            <span class="tag custom-control-label" style="color:`+result[i]['tcolor']+`;background:`+result[i]['bcolor']+`">`+result[i]['name']+`</span>
          </label>`);
          }
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
      $("#hedis_clinic_name").val(result['clinic']);
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
    $(".eduemailarea").addClass('d-none')
    $(".emailoption[value='1']").prop("checked",true);
    let measureid = $(this).parent().parent().children().eq(24).html()
    let ptemail = $(this).parent().parent().children().eq(32).html()

    
   
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),qid:$("#chosen_item").val(),meauserid:measureid}, "hedis/checkemail", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        console.log("email result")
        console.log(result)

        let ptfname = $(this).parent().parent().children().eq(4).html()

        let eptinsid = $(this).parent().parent().children().eq(2).html()
        let eptemrid = $(this).parent().parent().children().eq(3).html()

        globalemailarr = result['edbody']

        $("#edu-email-body").empty()
          $("#edu-email-link").empty()
          
          $("#eptfname").val(ptfname)
          $("#ecliname").val(result['clinicname'])

          $("#eptinsid").val(eptinsid)
          $("#eptemrid").val(eptemrid)

          
        let bchecked = false
          if(globalemailarr.length > 0){
            let checkval = ''
            for(let i=0; i<globalemailarr.length ; i++){
              if(globalemailarr[i].active == 1) continue
              if(globalemailarr[i].langid == result['langcode']){
                if(bchecked == false){
                  checkval = 'checked'
                  bchecked = true
                }else{
                  checkval = ''
                }
                $("#edu-email-body").append('<div class="form-check form-check-radio form-check-inline"> <label class="custom-control custom-radio d-inline-flex"> <input type="radio" class="custom-control-input emailnamelist" name="emailnamelist" value="'+globalemailarr[i].id+'" '+checkval+'> <span class="tag custom-control-label">'+globalemailarr[i].subname+'</span> <i class="fa fa-eye showemailcontent popup" aria-hidden="true" ><input type="hidden" id="edemcategory'+globalemailarr[i].id+'" value="'+globalemailarr[i].category+'"><div class="popuptext" id="myePopup'+globalemailarr[i].id+'">'+result['clinicname'] +'<br>'+ globalemailarr[i].title +'<br><br>'+ ptfname +','+globalemailarr[i].content+'<br>'+globalemailarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'</div></i><a href="'+globalemailarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'" target="_blank" ><i class="fa fa-book mt-2"  aria-hidden="true"></i></a> </label> </div><br>')
              }else{
                $("#edu-email-link").append('<div class="form-check form-check-radio form-check-inline "> <label class="custom-control custom-radio d-inline-flex"> <input type="radio" class="custom-control-input emailnamelist" name="emailnamelist" value="'+globalemailarr[i].id+'"> <span class="tag custom-control-label">'+globalemailarr[i].subname+'</span> <i class="fa fa-eye showemailcontent popup" aria-hidden="true" ><input type="hidden" id="edemcategory'+globalemailarr[i].id+'" value="'+globalemailarr[i].category+'"><div class="popuptext" id="myePopup'+globalemailarr[i].id+'">'+result['clinicname'] +'<br>'+ globalemailarr[i].title +'<br><br>'+ ptfname +','+globalemailarr[i].content+'<br>'+globalemailarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'</div></i><a href="'+globalemailarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'" target="_blank" ><i class="fa fa-book mt-2"  aria-hidden="true"></i></a> </label> </div><br>')
              }
            }

          }else{
            $("#edu-email-body").html("")
          }

        $("#email-subject").html(result['subject']);    
        $("#email-body").html(result['body']);  
        $("#ptemailtag").html(ptemail)  
        $("#email-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  $('#showalleducation').click(function(){
    if($(this).prop("checked") == true){
        $("#edu-sms-link").removeClass("d-none");
    }else if($(this).prop("checked") == false){
      $("#edu-sms-link").addClass("d-none");

    }
});
$('#eshowalleducation').click(function(){
  if($(this).prop("checked") == true){
      $("#edu-email-link").removeClass("d-none");
  }else if($(this).prop("checked") == false){
    $("#edu-email-link").addClass("d-none");

  }
});



  $(document).on("click",".showsmscontent",function(){
    let seid = $(this).parent().children().eq(0).val()
   let index = ''
    for(let i=0 ; i< globalsmsarr.length ; i++){
      if(globalsmsarr[i].id == seid){
        
        document.getElementById("myPopup"+globalsmsarr[i].id).innerHTML =$("#cliname").val() +'<br>'+$("#ptfname").val() +','+globalsmsarr[i].content+'<br>'+globalsmsarr[i].link+'&id='+localStorage.getItem('chosen_clinic')
        index = i
        break
      }
    }
    var popup = document.getElementById("myPopup"+globalsmsarr[index].id);
    popup.classList.toggle("show");
  })

  $(document).on("click",".showemailcontent",function(){
    let seid = $(this).parent().children().eq(0).val()
   let index = ''
    for(let i=0 ; i< globalemailarr.length ; i++){
      if(globalemailarr[i].id == seid){
        
        document.getElementById("myePopup"+globalemailarr[i].id).innerHTML =$("#ecliname").val() +'<br>'+globalemailarr[i].title +'<br>'+$("#eptfname").val() +','+globalemailarr[i].content+'<br>'+globalemailarr[i].link+'&id='+localStorage.getItem('chosen_clinic')
        index = i
        break
      }
    }
    var popup = document.getElementById("myePopup"+globalemailarr[index].id);
    popup.classList.toggle("show");
  })

  

  $(document).on("click",".sendsms",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $(".customsmsarea").addClass("d-none");
    $(".defaultsmsarea").removeClass("d-none");
    $(".smsoption[value='1']").prop("checked",true);
    let measureid = $(this).parent().parent().children().eq(24).html()
    
    let ptname = $(this).parent().parent().children().eq(4).html() + " " +$(this).parent().parent().children().eq(5).html()
    let ptfname = $(this).parent().parent().children().eq(4).html()
    let ptinsid = $(this).parent().parent().children().eq(2).html()
    let ptemrid = $(this).parent().parent().children().eq(3).html()

    document.getElementById('sms-patient-name').innerHTML = ptname
    console.log("ptinsid")
    console.log(ptinsid)
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),qid:$("#chosen_item").val(),measureid:measureid}, "hedis/checksms", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
       
        console.log("resultjjjjjjjjjj")
        console.log(result)
        let bchecked= false
        if(result['status'] == "success"){
          $("#smscounts").html(result['counts']);    
          $("#sms-subject").html(result['subject']);    
          $("#sms-body").html(result['body']);
          $(".edusmsarea").addClass('d-none')
          globalsmsarr = result['edusms']
          $("#edu-sms-body").empty()
          $("#edu-sms-link").empty()
          
          $("#ptfname").val(ptfname)
          $("#cliname").val(result['clinicname'])
          $("#ptinsid").val(ptinsid)
          $("#ptemrid").val(ptemrid)
          if(globalsmsarr.length > 0){
            let checkval = ''
            for(let i=0; i<globalsmsarr.length ; i++){
              if(globalsmsarr[i].active == 1) continue
              if(globalsmsarr[i].langid == result['langcode']){
                if(bchecked == false){
                  checkval = 'checked'
                  bchecked = true
                }else{
                  checkval = ''
                }
                $("#edu-sms-body").append('<div class="form-check form-check-radio form-check-inline"> <label class="custom-control custom-radio d-inline-flex"> <input type="radio" class="custom-control-input smsnamelist" name="smsnamelist" value="'+globalsmsarr[i].id+'" '+checkval+'> <span class="tag custom-control-label">'+globalsmsarr[i].subname+'</span> <i class="fa fa-eye showsmscontent popup" aria-hidden="true" ><input type="hidden" id="edcategory'+globalsmsarr[i].id+'" value = "'+globalsmsarr[i].category+'"><div class="popuptext" id="myPopup'+globalsmsarr[i].id+'">'+result['clinicname'] +'<br>'+ ptfname +','+globalsmsarr[i].content+'<br>'+globalsmsarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'</div></i><a href="'+globalsmsarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'" target="_blank" ><i class="fa fa-book mt-2"  aria-hidden="true"></i></a> </label> </div><br>')
              }else{
                $("#edu-sms-link").append('<div class="form-check form-check-radio form-check-inline "> <label class="custom-control custom-radio d-inline-flex"> <input type="radio" class="custom-control-input smsnamelist" name="smsnamelist" value="'+globalsmsarr[i].id+'"> <span class="tag custom-control-label">'+globalsmsarr[i].subname+'</span> <i class="fa fa-eye showsmscontent popup" aria-hidden="true" ><input type="hidden" id="edcategory'+globalsmsarr[i].id+'" value = "'+globalsmsarr[i].category+'"><div class="popuptext" id="myPopup'+globalsmsarr[i].id+'">'+result['clinicname'] +'<br>'+ ptfname +','+globalsmsarr[i].content+'<br>'+globalsmsarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'</div></i><a href="'+globalsmsarr[i].link+'&id='+localStorage.getItem('chosen_clinic')+'" target="_blank" ><i class="fa fa-book mt-2"  aria-hidden="true"></i></a> </label> </div><br>')
              }
            }

          }else{
            $("#edu-sms-body").html("")
          }
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
          // $(".phonelist").append(
          //   `<label class="custom-control custom-radio d-inline-flex">
          //     <input type="radio" class="custom-control-input phoneitem" name="phoneitem" value="othersmsnum" >
          //     <input type="text" class = "form-control otsmsnumber" id ="othersmsnum" >
          //   </label>`
          // ); 
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
      $(".eduemailarea").addClass("d-none");
      
    }
    if($(this).val() == 2){
      $(".customemailarea").removeClass("d-none");
      $(".defaultemailarea").addClass("d-none");
      $(".eduemailarea").addClass("d-none");
    }
    if($(this).val() == 3){
      $(".customemailarea").addClass("d-none");
      $(".defaultemailarea").addClass("d-none");
      $(".eduemailarea").removeClass("d-none");
    }
  });
  $(".smsoption").click(function(){
    if($(this).val() == 1){
      $(".customsmsarea").addClass("d-none");
      $(".defaultsmsarea").removeClass("d-none");
      $(".edusmsarea").addClass("d-none");
      $("#edu-sms-body").addClass("d-none");
      
      
    }
    if($(this).val() == 2){
      $(".customsmsarea").removeClass("d-none");
      $(".defaultsmsarea").addClass("d-none");
      $(".edusmsarea").addClass("d-none");
      $("#edu-sms-body").addClass("d-none");

    }
    if($(this).val() == 3){
      $(".customsmsarea").addClass("d-none");
      $(".defaultsmsarea").addClass("d-none");
      $(".edusmsarea").removeClass("d-none");
      $("#edu-sms-body").removeClass("d-none");

    }
    
  });
  
  $("#emailsendbtn").click(function(){
    let slink = $(".emailnamelist:checked").val();
    
   

    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      qid:$("#chosen_item").val(),
      emailtype:$(".emailoption:checked").val(),
      custombody:$("#customemailbody").val(),
      edubody:$("#myePopup"+slink).html(),
      educategory:$("#edemcategory"+slink).val(),
      ptemrid : $("#eptemrid").val(),
      ptinsid : $("#eptinsid").val(),
      userid : localStorage.getItem('userid'),
      edtitle : $("input[name='emailnamelist']:checked").parent('label').children('span').text(),
      otheremail : $("#otheremail").val(),
      bemailtype : otheremailnumber
    }
    for(let i = 0; i <  globalemailarr.length ; i++){
      if(globalemailarr[i].id == slink){
        entry.edubody = globalemailarr[i].content
        entry.link = globalemailarr[i].link
        entry.rtitle = globalemailarr[i].title
      }
    }
    console.log(entry)
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/sendemail", (xhr, err) => {
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

    let slink = $(".smsnamelist:checked").val();

    let entry =  {
      clinicid:localStorage.getItem('chosen_clinic'),
      userid:localStorage.getItem('userid'),
      qid:$("#chosen_item").val(),
      smstype:$(".smsoption:checked").val(),
      custombody:$("#customsmsbody").val(),
      edusmsbody:$("#myPopup"+slink).html(),
      educategory : $("#edcategory"+slink).val(),
      number:$(".phoneitem:checked").val(),
      whatsapp:$(".whatsappoption:checked").val(),
      ptinsid:$("#ptinsid").val(),
      ptemrid:$("#ptemrid").val(),
      edtitle : $("input[name='smsnamelist']:checked").parent('label').children('span').text()
    }

   
    if(customsmsnumber == true){
      entry.number = $('#othsmsnumber').val()
    }
   
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/sendsms", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        console.log(result)
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
  $(".addnewpathbtn").click(function(){
    alert("now making code")
  })
  $(".getinsidbtn").click(function(){
    let tquery = ""
    for(let i=0; i<insidlist.length; i++){
       tquery += "'"+insidlist[i]+"', "
    }
    console.log(insidlist.length)
    let tmpname = ''
    for (let j=0; j < options.length; j++){
      tmpname += options[j]+" | "
    }
    $('#query-count').empty();
    $('#query-count').append("Insurance Ids for " + tmpname)
    $('.ins-id-list').empty();
    $('.ins-id-list').append(tquery.slice(0, -2))
    $("#ins-list-modal").modal("show");
  })
  $(".getemrdbtn").click(function(){
    let tquery = ""
    for(let i=0; i<inemrlist.length; i++){
      if(inemrlist[i] == null) continue
       tquery += "'"+inemrlist[i]+"', "
    }
    let tmpname = ''
    for (let j=0; j < options.length; j++){
      tmpname += options[j]+" | "
    }
    
    $('#query-count').empty();
    $('#query-count').append("Insurance Ids for " + tmpname)
    $('.ins-id-list').empty();
    $('.ins-id-list').append(tquery.slice(0, -2))
    $("#ins-list-modal").modal("show");
  })
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
    console.log("gettingData")
    console.log(gettingData)
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
    console.log("statussss")
    console.log(status)

     var apptdate
     var apptpcp
     var apptvisittype
     var lastdate
     var nextdate
    switch(status) {
      case '6':
        apptdate = $(".apptdate").val();
        apptpcp = $(".apptpcpname").val()==0?null:$(".apptpcpname").val();
        apptvisittype = $(".apptvisittype").val()==""?null:$(".apptvisittype").val();
        lastdate = null;
        nextdate = null;
        break;
      case '4':
        lastdate = $(".lastdate").val();
        nextdate = $(".nextdate").val();
        apptdate = null;
        apptpcp = null;
        apptvisittype = null;

        break;
      default:
        apptdate = null;
        lastdate = null;
        nextdate = null;
        apptpcp = null;
        apptvisittype = null;

    }

    // if(status == 6){
    //   var apptdate = $(".apptdate").val();
    //   var apptpcp = $(".apptpcpname").val()==0?null:$(".apptpcpname").val();
    //   var apptvisittype = $(".apptvisittype").val()==""?null:$(".apptvisittype").val();
    //   var lastdate = null;
    //   var nextdate = null;
    // }
    // else if(status == 4){
    //   var lastdate = $(".lastdate").val();
    //   var nextdate = $(".nextdate").val();
    //   var apptdate = null;
    //   var apptpcp = null;
    //   var apptvisittype = null;
    // }
    // else{
    //   var apptdate = null;
    //   var lastdate = null;
    //   var nextdate = null;
    //   var apptpcp = null;
    //   var apptvisittype = null;
    // }
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
  
  $(document).on("click",".updatenotebtn",function(){
    tmpupdatenote = $(this).parent().find(".notearea");
    $("#notetext").val($(this).parent().find(".notearea").html())
    $("#chosen_note").val($(this).attr("key"));
    $("#update-note-modal").modal("show");
  });

  function resetdelfunc (entry) {
    console.log(entry)
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/deleterowbyid", (xhr, err) => {
          if (!err) {
            bResetCheck = true
            if(entry.type == 0){
              $('#hedisreport').jexcel('setValueFromCoords',12, entry.tableid, '')
              $('#hedisreport').jexcel('setValueFromCoords',13, entry.tableid, '')
              $('#hedisreport').jexcel('setValueFromCoords',14, entry.tableid, '')
              $('#hedisreport').jexcel('setValueFromCoords',15, entry.tableid, '')
              $('#hedisreport').jexcel('setValueFromCoords',16, entry.tableid, '')
              $('#hedisreport').jexcel('setValueFromCoords',17, entry.tableid, '')
              $("#reset-del-modal").modal("hide");
              bResetCheck = false
            }
            if(entry.type == 1 ){
              $('#hedisreport').jexcel('deleteRow',entry.tableid)
              $("#reset-del-modal").modal("hide");
            }
            if(entry.type == 2 ){
              // $('#hedisreport').jexcel('deleteRow',entry.tableid)
              $("#reset-del-modal").modal("hide");
              loadData();

            }
          }
        })
			}
		});
  }
  $("#resetmeasure").click(function(){
    let entry = {
      rowid : $('#drowid').val(),
      tableid : $('#dtableid').val(),
      dos : $('#ddos').val(),
      measureid : $('#dmeasureid').val(),
      mid:$('#dmid').val(),
      clid:localStorage.getItem('chosen_clinic'),
      insid: insid['insid'],
      memid:$('#dinsmid').val(),
      type:0
    }
    
    resetdelfunc(entry)
  })
  $("#delmeasure").click(function(){
    let entry = {
      rowid : $('#drowid').val(),
      tableid : $('#dtableid').val(),
      dos : $('#ddos').val(),
      measureid : $('#dmeasureid').val(),
      mid:$('#dmid').val(),
      clid:localStorage.getItem('chosen_clinic'),
      insid: insid['insid'],
      memid:$('#dinsmid').val(),
      type:1
    }
    resetdelfunc(entry)
    

  })
  $("#delpatient").click(function(){
    let entry = {
      rowid : $('#drowid').val(),
      tableid : $('#dtableid').val(),
      dos : $('#ddos').val(),
      measureid : $('#dmeasureid').val(),
      mid:$('#dmid').val(),
      clid:localStorage.getItem('chosen_clinic'),
      insid: insid['insid'],
      memid:$('#dinsmid').val(),
      type:2
    }
    resetdelfunc(entry)

  })

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

  function addDeviceListeners(device) {
    device.on("registered", function () {
      console.log("Twilio.Device Ready to make and receive calls!");
      // callControlsDiv.classList.remove("hide");
    });

    device.on("error", function (error) {
      console.log("Twilio.Device Error: " + error.message);
    });

    // device.on("incoming", handleIncomingCall);

    device.audio.on("deviceChange", updateAllAudioDevices.bind(device));

    // Show audio selection UI if it is supported by the browser.
    if (device.audio.isOutputSelectionSupported) {
      // audioSelectionDiv.classList.remove("hide");
      console.log("isOutputSelectionSupported")
    }
  }
  function updateUIAcceptedOutgoingCall(call) {
    console.log("Call in progress ...");
    console.log(call)
    // callButton.disabled = true;
    // outgoingCallHangupButton.classList.remove("hide");
    // volumeIndicators.classList.remove("hide");

    let starttime = new Date().getTime();
    startcalltime = new Date().getTime();
    calltimer = setInterval(function() {

      // Get today's date and time
      var now = new Date().getTime();
    
      // Find the distance between now and the count down date
      var distance =  now - starttime;
    
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if(hours < 10) hours = '0'+hours
      if(minutes < 10) minutes = '0'+minutes
      if(seconds < 10) seconds = '0'+seconds
      // Display the result in the element with id="demo"
      document.getElementById("duration-demo").innerHTML =  hours + " : "
      + minutes + " : " + seconds + " s ";
    }, 1000);


    bindVolumeIndicators(call);
  }

  function bindVolumeIndicators(call) {
    call.on("volume", function (inputVolume, outputVolume) {
      var inputColor = "red";
      if (inputVolume < 0.5) {
        inputColor = "green";
      } else if (inputVolume < 0.75) {
        inputColor = "yellow";
      }

      inputVolumeBar.style.width = Math.floor(inputVolume * 300) + "px";
      inputVolumeBar.style.height = "5px";
      inputVolumeBar.style.background = inputColor;

      var outputColor = "red";
      if (outputVolume < 0.5) {
        outputColor = "green";
      } else if (outputVolume < 0.75) {
        outputColor = "yellow";
      }

      outputVolumeBar.style.width = Math.floor(outputVolume * 300) + "px";
      outputVolumeBar.style.height = "5px";
      outputVolumeBar.style.background = outputColor;
    });
  }
  function updateUIDisconnectedOutgoingCall() {
    console.log("Call disconnected.");
    $('.callringbtn').prop('disabled', false);
    $('.callringbtn').addClass('btn-success');
    $('.callringbtn').removeClass('bclicked');
    clearInterval(calltimer);
    let endcalltime = new Date().getTime();
    let gduration =  Math.floor((endcalltime - startcalltime ) / 1000);
    
    console.log("gduration")
    console.log(gduration)

    let entry ={
      ptinsid : patientinsid,
      ptemrid : patientemrid,
      clinicid : localStorage.getItem('chosen_clinic'),
      userid : localStorage.getItem('userid'),
      ptnum : gcallnumber,
      cmid : $("#callmid").val(),
      durat: gduration
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/gettingtwiliologlist", (xhr, err) => {
      if (!err) {
        console.log("clicked")
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
    
  }
  function updateDevices(selectEl, selectedDevices) {
    selectEl.innerHTML = "";

    odevice.audio.availableOutputDevices.forEach(function (odevice, id) {
      var isActive = selectedDevices.size === 0 && id === "default";
      selectedDevices.forEach(function (odevice) {
        if (odevice.deviceId === id) {
          isActive = true;
        }
      });

      // var option = document.createElement("option");
      // option.label = odevice.label;
      // option.setAttribute("data-id", id);
      // if (isActive) {
      //   option.setAttribute("selected", "selected");
      // }
      selectEl.appendChild(option);
    });
  }
  async function getAudioDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    updateAllAudioDevices.bind(odevice);
  }

  function updateAllAudioDevices() {
    if (odevice) {
      // updateDevices(speakerDevices, odevice.audio.speakerDevices.get());
      // updateDevices(ringtoneDevices, odevice.audio.ringtoneDevices.get());
    }
  }
  

  
  $('#othernumber').on('click',function(){
    if($(this).attr('data-click-state') == 1) {
        $(this).attr('data-click-state', 0);
        customnumber = true
        $("#patient-num").css("display", "none");
        $("#customphone").css("display", "block");
        $(this).html('<i class="fa fa-phone-square" aria-hidden="true" style="font-size: 25px;"></i> Patient Number ')
      }
    else {
      $(this).attr('data-click-state', 1);

      customnumber = false
      $("#patient-num").css("display", "block");
      $("#customphone").css("display", "none");
      $(this).html('<i class="fa fa-phone-square" aria-hidden="true" style="font-size: 25px;"></i> Call Number ')
    }
  });

  
  $('#sms-othernumber').on('click',function(){
    if($(this).attr('data-click-state') == 1) {
        $(this).attr('data-click-state', 0);
        customsmsnumber = true
        $(".phonelist").css("display", "none");
        $("#othsmsnumber").css("display", "block");
        $(this).html('<i class="fa fa-commenting" aria-hidden="true" style="font-size: 25px;"></i> Patient Number ')
      }
    else {
      $(this).attr('data-click-state', 1);

      customsmsnumber = false
      $(".phonelist").css("display", "block");
      $("#othsmsnumber").css("display", "none");
      $(this).html('<i class="fa fa-commenting" aria-hidden="true" style="font-size: 25px;"></i> Text Number ')
    }
  });
  $('#email-other').on('click',function(){
    if($(this).attr('data-click-state') == 1) {
        $(this).attr('data-click-state', 0);
        otheremailnumber = true
        $(".other-email").css("display", "block");
        $("#ptemailtag").css("display", "none");
        
      $(this).html('<i class="fa fa-envelope-o" aria-hidden="true" style="font-size: 25px;"></i> Patient Email ')
      }
    else {
      $(this).attr('data-click-state', 1);

      otheremailnumber = false
      $("#otheremail").val("")
      $(".other-email").css("display", "none");
      $("#ptemailtag").css("display", "block");

        $(this).html('<i class="fa fa-envelope-o" aria-hidden="true" style="font-size: 25px;"></i> Another  Email ')
      
    }
  });

  
  $(document).on("click",".callringbtn",function(){
    
  
    $('.callringbtn').prop('disabled', true);
    $('.callringbtn').addClass('bclicked');
    $('.callringbtn').removeClass('btn-success');

    if(customnumber == true){
      gcallnumber = document.getElementById('customphone').value 
    }else{
      let tmpnum = $("#patient-num").text();
      gcallnumber = '+1'+tmpnum.replaceAll('-','')
    }

    // let entry ={
    //   ptinsid : patientinsid,
    //   ptemrid : patientemrid,
    //   clinicid : localStorage.getItem('chosen_clinic'),
    //   userid : localStorage.getItem('userid'),
    //   ptnum : gcallnumber
    // }
    // sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/gettingtwiliologlist", (xhr, err) => {
    //   if (!err) {
    //     console.log("clicked")
    //   } else {
    //     return $.growl.error({
    //       message: "Action Failed"
    //     });
    //   }
    // });
  
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "hedis/getcalltoken", async (xhr, err) => {
          if (!err) {
            let token = JSON.parse(xhr.responseText)['token'];
            console.log(token)
            try {
              odevice = new Twilio.Device(token)
            } catch (error) {
              console.log(err);
              console.log("An error occurred. See your browser console for more information.");
            }
            addDeviceListeners(odevice);
            
            var params = {
              // get the phone number to call from the DOM
              // To: '+16464680123',
              To:gcallnumber
            };
        
            if (odevice) {
              console.log(`Attempting to call ${params.To} ...`);
              const call = await odevice.connect({ params });
        
              call.on('error', (error) => {
                console.log('An error has occurred: ', error);
              });
              
              call.on("accept", updateUIAcceptedOutgoingCall);
              call.on("disconnect", updateUIDisconnectedOutgoingCall);
              call.on("cancel", updateUIDisconnectedOutgoingCall);

             
              outgoingCallHangupButton.onclick = () => {
                console.log("Hanging up ...");
                $('.callringbtn').prop('disabled', false);
                $('.callringbtn').addClass('btn-success');
                $('.callringbtn').removeClass('bclicked');
                    clearInterval(calltimer);
                    call.disconnect();
              };
        
            } else {
              console.log("Unable to make call.");
            }
          }
          

    })
  })
 
  
 
  $(document).on("click",".phonecallbtn",function(){

    let ptname = $(this).parent().parent().children().eq(4).html() + " " +$(this).parent().parent().children().eq(5).html()
    let ptnum = $(this).parent().parent().children().eq(7).html()
    document.getElementById('patient-name').innerHTML = ptname
    document.getElementById('patient-num').innerHTML = ptnum

    let measureid = $(this).parent().parent().children().eq(24).html()
    $("#callmid").val( measureid) 

    outputVolumeBar = document.getElementById("output-volume");
    inputVolumeBar = document.getElementById("input-volume");
    outgoingCallHangupButton = document.getElementById("closeringbtn");

    patientemrid = $(this).parent().parent().children().eq(3).html()
    patientinsid = $(this).parent().parent().children().eq(2).html()

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "hedis/checkcalltime", (xhr, err) => {
      if (!err) {

        let result = JSON.parse(xhr.responseText);
        if(result['status'] == "success"){
          $("#callcounts").html(result['counts']);  
          
          if(result['counts'] < 5){
            $('.callringbtn').prop('disabled', true);
            $('.callringbtn').addClass('bclicked');
            $('.callringbtn').removeClass('btn-success');
            alert("you have to charge call time")
          }else{
         
            $('.callringbtn').prop('disabled', false);
            $('.callringbtn').addClass('btn-success');
            $('.callringbtn').removeClass('bclicked');
          }
        }  
        $("#call-patient-modal").modal({backdrop: 'static', keyboard: false},"show");


      } else {
        return $.growl.error({
          message: "Getting Available call time error"
        });
      }
    });
   
  })
  $(document).on("click",".delrowbtn",function(){
    
    let rowid = $(this).parent().parent().children().eq(1).html()
    let tableid = $(this).parent().parent().children().eq(1).attr("data-y")
    let dos = $(this).parent().parent().children().eq(13).html()
    let measureid = $(this).parent().parent().children().eq(24).html()
    let insmemid = $(this).parent().parent().children().eq(2).html()
    let clinicid = localStorage.getItem('chosen_clinic')
    let dinsid = insid['insid']
    let mid = $(this).parent().parent().children().eq(3).html()
    $('#drowid').val(rowid)
    $('#dtableid').val(tableid)
    $('#ddos').val(dos)
    $('#dmeasureid').val(measureid)
    $('#dmid').val(mid)
    $('#dinsmid').val(insmemid)
    console.log(rowid, tableid,dos,measureid,clinicid,mid,dinsid,insmemid)
    $("#reset-del-modal").modal("show");
  })
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
  if(bResetCheck) {
    return false;
  }
  
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
      console.log(data)
      let ptcnt = JSON.parse(xhr.responseText)['ptcnt'];
      let measurecnt = JSON.parse(xhr.responseText)['measurecnt'];
      $(".totalptcnt").html(ptcnt)
      $(".totalmeasurecnt").html(measurecnt)
      let tmpmid = "";
      let tmpclass = "";
      let tmpnoteclass = "";
      let tmpemrid = "";
      let tmpptfname = "";
      insidlist=[]
      inemrlist=[]
      for(var i=0;i<data.length;i++){

        if(!insidlist.includes(data[i]['mid'])){
          insidlist.push(data[i]['mid'])
        }
        if(!inemrlist.includes(data[i]['emr_id'])){
          inemrlist.push(data[i]['emr_id'])
        }
        
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
          if(data[i]['measureid'] == null){
            tmpmeasure = data[i]['measure']+"( X )";
          }
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
          "<i class='fa fa-file-text viewresultbtn "+tmpclass+"'>&nbsp;</i><i class='fa fa-sticky-note"+(data[i]['notecheck'] != null?"":"")+" notesbtn "+tmpclass+" "+tmpnoteclass+"'></i> <i class='fa fa-trash delrowbtn' ></i>", 
          "<i class='ti-printer printletter "+tmpclass+"'></i>&nbsp;"+((data[i]['email']!=null&&data[i]['email']!="")?"<i class='ti-email sendemail "+tmpclass+"'></i>":"")+"&nbsp;<i class='ti-mobile sendsms "+tmpclass+"'></i>&nbsp; <i class='fa fa-phone phonecallbtn' aria-hidden='true' value = 'dragon' style='cursor: pointer;'></i>", 
          data[i]['mlob'], 
          "<i class='fa fa-eye statusbtn'></i>&nbsp;<i class='mdi mdi-apps viewmlogbtn'></i>", 
          tmpmeasure, 
          tmpdate, 
          (data[i]['value1']==""||data[i]['value1']==null)?"":(data[i]['dos']==null?"":data[i]['value1']), 
          (data[i]['value2']==""||data[i]['value2']==null)?"":(data[i]['dos']==null?"":data[i]['value2']), 
          (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['cpt1'], 
          (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['cpt2'],
          (data[i]['dos']==null||(data[i]['value1']==null&&data[i]['value2']==null))?"":data[i]['icd1'], 
          ((data[i]['dos']!=null&&data[i]['dos']!="")&&(data[i]['value1']!=null&&data[i]['value1']!=""))?"done":"notdone",
          (data[i]['status'] == 4?"NONC":(data[i]['status'] == 5?"NEVER":(data[i]['status'] == 6?"IAPPT":(data[i]['status'] == 7?"PTR":(data[i]['status'] == 8?"MR":(data[i]['status'] == 9?"INSA":(data[i]['status'] == 10?"MHIGH":(data[i]['status'] == 11?"CNINS":data[i]['status'] == 12?"DEC":(data[i]['status'] == 13?"FileG":(data[i]['status'] == 14?"PCPC":(data[i]['status'] == 15?"EXCL":(data[i]['status'] == 16?"AWAY":"")))))))))))),
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
          data[i]['email']
        ];
        if(checkview == 1)
          hedisdata.push(tmpdata);
        else if(checkview == 2){
          if((data[i]['status'] == 1 || data[i]['status'] == 2 || data[i]['status'] == 3 || data[i]['status'] == 8 || data[i]['status'] == 9 || data[i]['status'] == 13 || data[i]['status'] == 11) && data[i]['gstatus'] != 1) hedisdata.push(tmpdata);
        }
        else if(checkview == 3){
          if((data[i]['status'] == 0 || data[i]['status'] == 4 || data[i]['status'] == 5 || data[i]['status'] == 6 || data[i]['status'] == 7 || data[i]['status'] == 10 || data[i]['status'] == 12 || data[i]['status'] == 14 || data[i]['status'] == 15 || data[i]['status'] == 16) && data[i]['gstatus'] != 1) 
          {
            hedisdata.push(tmpdata);
            
          }
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
          },
          {
            type: 'hidden',
            title:'email',
            readOnly:true,
            width:0
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
              // cell.parentNode.childNodes[11].childNodes[0].style.display = 'none';
              // cell.parentNode.childNodes[11].childNodes[0].disabled = true;
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
          if (cell.innerHTML == 'EXCL') {
            cell.parentNode.style.color = tmpcolor[14]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[14]["bcolor"];
          }
          if (cell.innerHTML == 'AWAY') {
            cell.parentNode.style.color = tmpcolor[15]["tcolor"];
            cell.parentNode.style.backgroundColor = tmpcolor[15]["bcolor"];
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

var patient_id = 0;

var encounter_table = $('#encounter_table').DataTable({
  "ajax": {
      "url": serviceUrl + "hedis/encounter",
      "type": "POST",
      "headers": { 'Authorization': localStorage.getItem('authToken') },
      "data":function (d) {
        d.clinic_id = localStorage.getItem('chosen_clinic'),
        d.patient_id = patient_id
      },
  },
  "pageLength": 10,
  "order": [],
  "bAutoWidth": false, 
  "columns": [
      { data: "enc_type"},
      { data: 'enc_start',
        render: function (data, type, row) {
          return new Date(row.enc_start).toLocaleString();;
        } 
      },
      { data: 'total_mins' },
      { data: "reason"},
      { data: 'status' },
      { data: 'id',
        render: function (data, type, row) {
          return `
            <div class="btn-group align-top " idkey="`+row.id+`">
              <button class="btn  btn-primary badge edit_btn"  data-toggle="modal" type="button"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>
            </div>
          `
        } 
      }
  ]
});

$(document).on("click",".notesbtn",function(){
  $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
  
  $("#encounter_clinic_id").val(localStorage.getItem('chosen_clinic'));
  $("#encounter_pcp_id").val(localStorage.getItem('userid'));
  $("#encounter_patient_id").val('');
  $("#encounter_emr_id").val('');
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $("#chosen_item").val()}, "hedis/getPatient", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length>0){
        $("#encounter_patient_id").val(result[0]['id']);
        $("#encounter_emr_id").val(result[0]['patientid']);
        
        $("#pt_gender").html(result[0]['GENDER']);
        $("#pt_name_icon").html(result[0]['FNAME'].substring(0,1)+result[0]['LNAME'].substring(0,1));
        $("#pt_fullname").html(result[0]['FNAME'] + " " + result[0]['LNAME'])
        $("#pt_address").html(result[0]['ADDRESS'] + ", " + result[0]['CITY'])
        $("#pt_dob").html(new Date(result[0]['DOB']).toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'})),
        $("#pt_telephone").html(result[0]['PHONE'])
        $("#pt_phone").html(result[0]['MOBILE'])
        $("#pt_email").html(result[0]['EMAIL']);
        $("#pt_language").html(result[0]['Language']);
        $("#pt_insid").html(result[0]['INS_ID']);
        $("#encounter_modal_fullname").html($("#pt_fullname").html());
        $("#encounter_modal_clinic").html($("#hedis_clinic_name").val());
        $("#encounter_modal_gender").html($("#pt_gender").html());
        $("#encounter_modal_dob").html($("#pt_dob").html());
        $("#encounter_modal_telephone").html($("#pt_telephone").html());
        $("#encounter_modal_phone").html($("#pt_phone").html());
        $("#encounter_modal_email").html($("#pt_email").html());
        patient_id = result[0]['id'];
        encounter_table.ajax.reload();
        $("#encounter_modal").modal("show");
      }
    }
  });
  
});

$(document).on("click",".edit_btn",function(){
  observation_id = null;
  $("#encounter_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#encounter_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#encounter_enc_type").val(result[0]['enc_type']);
      $("#encounter_status").val(result[0]['status']);
      $("#encounter_team_member").val(result[0]['team_member']);
      $("#encounter_assigned").val(result[0]['assigned']);
      $("#encounter_enc_start").val(new Date(result[0]['enc_start']));
      $("#encounter_total_mins").val(result[0]['total_mins']);
      $("#encounter_notes").val(result[0]['notes']);
      $("#encounter_action_taken").val(result[0]['action_taken']);
      $("#encounter_class").val(result[0]['class']);
      $("#encounter_priority").val(result[0]['priority']);
      $("#encounter_service_type").val(result[0]['service_type']);
      $("#encounter_participant_type").val(result[0]['participant_type']);
      $("#encounter_reason").val(result[0]['reason']);
      $("#encounter_reason_use").val(result[0]['reason_use']);
      $("#encounter_reason_codes").val(result[0]['reason_codes']);
      $("#encounter_edit_modal").modal("show");
    } else {
      return toastr.error("Action Failed");
    }
  });
});



$(document).on("click","#add_btn",function(){
  $("#encounter_id").val('');
  $("#encounter_enc_type").val('phone call');
  $("#encounter_status").val('');
  $("#encounter_team_member").val('');
  $("#encounter_assigned").val('');
  $("#encounter_total_mins").val('1');
  $("#encounter_notes").val('');
  $("#encounter_action_taken").val('');
  $("#encounter_enc_start").val('');
  $("#encounter_reason").val('');
  

  $("#encounter_edit_modal").modal("show");
});

$(document).on("click",".delete_btn",function(){
  let entry = {
    id: $(this).parent().attr("idkey"),
  }
  Swal.fire({
    text: "Are you sure you would like to delete?",
    icon: "error",
    showCancelButton: true,
    buttonsStyling: false,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, return",
    customClass: {
      confirmButton: "btn btn-danger",
      cancelButton: "btn btn-primary"
    }
  }).then(function (result) {
    if (result.value) {
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/delete", (xhr, err) => {
        if (!err) {
          setTimeout( function () {
            encounter_table.ajax.reload();
          }, 1000 );
        } else {
          return toastr.error("Action Failed");
        }
      });
    }
  });

});

sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: localStorage.getItem('chosen_clinic')}, "user/getUsersByClinic", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    options += '<option value="" ></option>';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['id']+'" >'+result[i]['fname'] +' '+result[i]['lname']+'</option>';
    }
    $("#encounter_assigned").html(options);
  }
});



sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterStatus", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_status").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterClass", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_class").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterPriority", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_priority").html(options);
  }
});

// sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterType", (xhr, err) => {
//   if (!err) {
//     let result = JSON.parse(xhr.responseText)['data'];
//     var options = '';
//     for(var i=0; i<result.length; i++){
//       options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
//     }
//     $("#encounter_enc_type").html(options);
//   }
// });

// sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterServiceType", (xhr, err) => {
//   if (!err) {
//     let result = JSON.parse(xhr.responseText)['data'];
//     var options = '';
//     for(var i=0; i<result.length; i++){
//       options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
//     }
//     $("#encounter_service_type").html(options);
//   }
// });

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterSubjectStatus", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_subject_status").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterParticipantType", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_participant_type").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterReasonUse", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_reason_use").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterReasonCodes", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    options += '<option value="" ></option>';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_reason_codes").html(options);
  }
});

new tempusDominus.TempusDominus(document.getElementById("encounter_enc_start"), {
  
});


$("#update_btn").click(function (e) {
  if($("#encounter_enc_start").val() == ""){
    toastr.info('Please enter Start Time');
    $("#encounter_enc_start").focus();
    return;
  }
  if($("#encounter_total_mins").val() == ""){
    toastr.info('Please enter correctly Total Mins');
    $("#encounter_total_mins").focus();
    return;
  }
  let entry = {}

  $('.form-control').each(function() {
    if($(this).data('field')!==undefined){
        entry[$(this).data('field')] = $(this).val();
    }
  });

  if($("#encounter_id").val()==""){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/create", (xhr, err) => {
      if (!err) {
        $("#encounter_edit_modal").modal("hide");
        toastr.success("Encounter is added successfully");
      } else {
        return toastr.error("Action Failed");
      }
    });
  }else{
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/update", (xhr, err) => {
      if (!err) {
        $("#encounter_edit_modal").modal("hide");
        toastr.success("Diagnostic Report is updated successfully");
      } else {
        return toastr.error("Action Failed");
      }
    });
  }
  
  setTimeout( function () {
    encounter_table.ajax.reload();
  }, 1000 );
});

