var skipvalue = 1;
var weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
$(document).ready(async function () {
  "use strict";
  let params = getUrlVars();
  if(params['t']==""||params['t']==null){
    window.location.replace("../404");
  }
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:atob(params['t'])}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".clinic-name").html(result['clinic']);
      $(".clinic-address").html(result['address']+" "+result['city']+" "+result['state']+" "+result['zip']);
      $(".clinic-phone").html(result['phone']);
     
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:atob(params['t'])}, "setting/getconnectiondesc", (xhr, err) => {
    if (!err) {
      let gdesc = JSON.parse(xhr.responseText)['gdesc'];
      let sdesc = JSON.parse(xhr.responseText)['sdesc'];
      if(sdesc.length > 0){
        if(sdesc[0]['age'] == 1)
          $("#sdesc").html(sdesc[0]['desc']);
        else
          $("#sdesc").html(gdesc[0]['desc']);
      }
      else{
        $("#sdesc").html(gdesc[0]['desc']);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  daterange();
  $("#contactwizard").steps({
    headerTag: "h4",
    bodyTag: "section",
    transitionEffect: "none",
    enableAllSteps: true,
    transitionEffectSpeed: 300,
    labels: {
        next: "Continue",
        previous: "Back",
        finish: 'Submit'
    },
    onStepChanging: function (event, currentIndex, newIndex) { 
      if(currentIndex == 2 && newIndex == 3 && $("#fname").val() == ""){
        $("#fname").addClass("invalid-field");
        return false;
      }
      else if(currentIndex == 2 && newIndex == 3 && $("#lname").val() == ""){
        $("#lname").addClass("invalid-field");
        return false;
      }
      else if(currentIndex == 2 && newIndex == 3 && $("#dob").val() == ""){
        $("#dob").addClass("invalid-field");
        return false;
      }
      else if(currentIndex == 3 && newIndex == 4 && $("#phone1").val() == ""){
        $("#phone1").addClass("invalid-field");
        return false;
      }
      else if(skipvalue == 1 && currentIndex == 5 && newIndex == 6 && ($(".item-active").length == 0 || $(".titem-active").length == 0)){
        $.growl.notice({
          message: "Should select appointment date and time"
        });
        return false;
      }
      else if(skipvalue == 0 && currentIndex == 3 && newIndex == 4 && $("#question").val() == ""){
        $.growl.notice({
          message: "Should write your question"
        });
        return false;
      }
      else{
        $(".form-control").removeClass("invalid-field");
        return true;
      }
    },
    onStepChanged: function (event, currentIndex, newIndex) { 
      // Suppress (skip) "Warning" step if the user is old enough and wants to the previous step.
      if(skipvalue == 1){
        
      }
      else{
        // Patient Selection Panel
        if (currentIndex === 1 && newIndex === 0)
        {
            $(this).steps("next");
        }
        if (currentIndex === 1 && newIndex === 2)
        {
          $(this).steps("previous");
          return;
        }


        // Patient Address Info Panel
        if (currentIndex === 4 && newIndex === 3)
        {
            $(this).steps("next");
        }
        if (currentIndex === 4 && newIndex === 5)
        {
          $(this).steps("previous");
          return;
        }

        // Date Picker Panel
        if (currentIndex === 5 && newIndex === 4)
        {
            $(this).steps("next");
        }
        if (currentIndex === 5 && newIndex === 6)
        {
          $(this).steps("previous");
          return;
        }
      }
    
    },
    onFinishing: function (event, currentIndex)
    {
      var dates = [];
      var times = [];
      for(var i = 0;i < $("#inputgroup input").length; i++){
        dates.push($("#inputgroup").children().eq(i).attr("name"));
        times.push($("#inputgroup").children().eq(i).val());
      }
      let entry = {
        clinicid:atob(params['t']),
        contacttype:$(".contacttype:checked").val(),
        pttype:$(".pttype:checked").val(),
        fname:$("#fname").val(),
        lname:$("#lname").val(),
        mname:$("#mname").val(),
        dob:$("#dob").val(),
        lang:$("#lang").val(),
        email:$("#email").val(),
        phone1:$("#phone1").val(),
        phone2:$("#phone2").val(),
        question:$("#question").val(),
        address1:$("#address1").val(),
        address2:$("#address2").val(),
        city:$("#city").val(),
        state:$("#state").val(),
        zip:$("#zip").val(),
        dates:dates,
        times:times,
      }
      $("#global-loader").css({"display":"block"});
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addconnection", (xhr, err) => {
        if (!err) {
          $("#global-loader").css({"display":"none"});
          $("#main").addClass("d-none");
          $("#result").removeClass("d-none");
          setTimeout( function () {
            location.reload();
          }, 2000 );
        } else {
          $("#global-loader").css({"display":"none"});
          $("#main").addClass("d-none");
          $("#result").removeClass("d-none");
          setTimeout( function () {
            location.reload();
          }, 2000 );
        }
      });
    },
    onFinished: function (event, currentIndex)
    {
        // console.log("111111111")
    }
  });
  $(".contacttype").click(function(){
    if($(this).val() == 1){
      skipvalue = 1;
      $(".appt-area").removeClass("d-none");
      $(".question-area").addClass("d-none");
    }
    else{
      skipvalue = 0;
      $(".appt-area").addClass("d-none");
      $(".question-area").removeClass("d-none");
    }
  });
  $(document).on("click",".item",function(){
    if($(this).hasClass("item-active")){
      $(this).removeClass("item-active");
      $("input#"+$(this).attr("key")).remove();
    }
    else{
      if($("#inputgroup").length > 0 && $("#inputgroup input:last-child").val() == ""){
        return $.growl.notice({
          message: "Please select time"
        });
      }
      if($('.item-active').length > 2){
        return $.growl.notice({
          message: "Only 3 Available Appt Dates"
        });
      }
      $(this).addClass("item-active");
      var container = document.getElementById("inputgroup");
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = $(this).attr("key");
      input.id = $(this).attr("key");
      container.appendChild(input);
    }
    $(".titem").removeClass("titem-active");
  });
  $(document).on("click",".titem",function(){
    if($('.item-active').length == 0){
      return $.growl.notice({
        message: "First Select Appt Date"
      });
    }

    if($(this).hasClass("titem-active")){
      $(this).removeClass("titem-active");
      $("#inputgroup input:last-child").val($("#inputgroup input:last-child").val().replace("|"+$(this).find("p").html(),""));
    }
    else{
      if($('.titem-active').length > 2){
        return $.growl.notice({
          message: "Only 3 Available Appt Times One Day"
        });
      }
      $(this).addClass("titem-active");
      $("#inputgroup input:last-child").val($("#inputgroup input:last-child").val()+"|"+$(this).find("p").html());
    }
  });
}); 
function getdateid(date){
  var d = new Date(date);
  var month = d.getMonth()+1;
  var day = d.getDate();
  
  return d.getFullYear()+"-"+(month<10 ? '0' : '')+month+"-"+(day<10 ? '0' : '')+day;
}
function daterange(){
  const cdate = new Date();
  $(".datepanelitem").empty();
  var ndate1 = new Date(cdate.getTime() + 24 * 60 * 60 * 1000);
  var ndate2 = new Date(cdate.getTime() + 2 * 24 * 60 * 60 * 1000);
  var ndate3 = new Date(cdate.getTime() + 3 * 24 * 60 * 60 * 1000);
  for(var i = 0;i < 30;i++){
    $(".datepanelitem").append(`
      <div class="carousel-item ${i == 0?"active":""}">
        <div class="row justify-content-center">
          <div class="col-auto">
            <div class="item" key="${getdateid(ndate1)}">
              <p class="itemweek">${weekday[ndate1.getDay()]}</p>
              <p class="itemdate">${ndate1.getDate()}</p>
              <p class="mb-0">${months[ndate1.getMonth()]}</p>
            </div>
          </div>
          <div class="col-auto">
            <div class="item" key="${getdateid(ndate2)}">
              <p class="itemweek">${weekday[ndate2.getDay()]}</p>
              <p class="itemdate">${ndate2.getDate()}</p>
              <p class="mb-0">${months[ndate2.getMonth()]}</p>
            </div>
          </div>
          <div class="col-auto">
            <div class="item" key="${getdateid(ndate3)}">
              <p class="itemweek">${weekday[ndate3.getDay()]}</p>
              <p class="itemdate">${ndate3.getDate()}</p>
              <p class="mb-0">${months[ndate3.getMonth()]}</p>
            </div>
          </div>
        </div>
      </div>
    `);
    ndate1 = new Date(ndate1.getTime() + 3 * 24 * 60 * 60 * 1000);
    ndate2 = new Date(ndate2.getTime() + 3 * 24 * 60 * 60 * 1000);
    ndate3 = new Date(ndate3.getTime() + 3 * 24 * 60 * 60 * 1000);
  }
}