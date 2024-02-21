$(document).ready(function () {
  "use strict";
  let entry = {
    id: localStorage.getItem('userid'),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "profile/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#profilename").html(result[0]['fname']+" "+result[0]['lname']);
      $(".firstLetter").html(result[0]['fname'].charAt(0))
      $("#profiletype").html((result[0]['type']==0?"Superadmin":(result[0]['type']==1?"Administrator":(result[0]['type']==2?"Manager":(result[0]['type']==3?"Specialist":(result[0]['type']==4?"Staff":"Doctor"))))));
      $("#profilefname").val(result[0]['fname']);
      $("#profilelname").val(result[0]['lname']);
      $("#profileemail").val(result[0]['email']);
      $("#profilephone").val(result[0]['phone']);
      $("#profileaddress").val(result[0]['address']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getquestions", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#question").empty();
      for(var i = 0; i < result.length; i++){
        $("#question").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['question']+`</option>
        `);
      }
      $("#manager-question-modal").modal("show");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $("#mquestionbtn").click(function (e) {
    if($("#answer").val()==""){
      return $.growl.error({
        message: "Please enter answer."
      });
    }
    let entry = {
      id: localStorage.getItem('userid'),
      question_id: document.getElementById('question').value,
      answer: document.getElementById('answer').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "profile/updateanswer", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Security is updated successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#mpwdbtn").click(function (e) {
    if($("#pwd").val()==""){
      return $.growl.error({
        message: "Please enter new password."
      });
    }
    else if($("#pwd").val() === $("#cpwd").val()){
      let entry = {
        id: localStorage.getItem('userid'),
        opwd: document.getElementById('opwd').value,
        pwd: document.getElementById('pwd').value,
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "profile/updatepwd", (xhr, err) => {
        let result = JSON.parse(xhr.responseText);
        if (!err) {
          if(result.status == "failed"){
            return $.growl.notice({
              message: "Please enter correct current password"
            });
          }
          else{
            return $.growl.notice({
              message: "Password is updated successfully"
            });
          }
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
    }
    else{
      return $.growl.error({
        message: "Please confirm password again."
      });
    }
  });
  $("#meditbtn").click(function (e) {
    if($("#profilefname").val()==""){
      return $.growl.error({
        message: "Please enter first name."
      });
    }
    if($("#profilelname").val()==""){
      return $.growl.error({
        message: "Please enter last name."
      });
    }
    if($("#profileemail").val()==""){
      return $.growl.error({
        message: "Please enter email."
      });
    }
    let entry = {
      id: localStorage.getItem('userid'),
      fname: document.getElementById('profilefname').value,
      lname: document.getElementById('profilelname').value,
      email: document.getElementById('profileemail').value,
      phone: document.getElementById('profilephone').value,
      address: document.getElementById('profileaddress').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "profile/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    managertable();
  });
  $(document).on("click",".usereditbtn",function(){
    $("#user-edit-modal").modal("show");
  });
  
});
