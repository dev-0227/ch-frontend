$(document).ready(function () {
  "use strict";
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid:localStorage.getItem('userid')}, "login/getsecurity", (xhr, err) => {
    let result = JSON.parse(xhr.responseText)['data'];
    if (!err) {
      if(typeof result == "undefined" || result == null){
        localStorage.removeItem("userid");
        localStorage.removeItem("usertype");
        localStorage.removeItem('username');
        localStorage.removeItem("redirectkey");
        window.location.replace("./");
      }
      else{
        $("#qdesc").html(result['question']);
        $("#qid").val(result['id']);
      }
      
    }
    else {
      toastr.error('Credential is invalid');
    }
  });

  


  $('#answer').keypress(function(e){
    if (e.which === 13) {
      $("#security_submit").trigger("click");
    }
  })
  $('#answer').focus();
  $("#security_submit").click(function(){
    let entry = {
      userid: localStorage.getItem('userid'),
      qid: document.getElementById('qid').value,
      answer: document.getElementById('answer').value
    }
    if(entry.answer == ""){
      toastr.info('Please enter answer');
      $("#answer").focus();
      return;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "login/checksecurity", (xhr, err) => {
      let result = JSON.parse(xhr.responseText);
      if (!err) {
        if(result.status == "success"){
          localStorage.setItem("chosen_clinic",result.chosen_clinic);
          localStorage.setItem("loginid",result.loginid);
          if(localStorage.getItem('redirectkey') == 1){
            window.location.replace("./pages/hedisdaily");
          }
          else if(localStorage.getItem('redirectkey') == 2){
            window.location.replace("./pages/hedismonthreport");
          }
          else{
            window.location.replace("./pages/dash");
          }
        }
        else{
          localStorage.removeItem("userid");
          localStorage.removeItem("usertype");
          localStorage.removeItem('username');
          localStorage.removeItem("redirectkey");
          window.location.replace("./");
        }
      }
      else {
        localStorage.removeItem("userid");
        localStorage.removeItem("usertype");
        localStorage.removeItem('username');
        localStorage.removeItem("redirectkey");
        window.location.replace("./");
      }
    });
  });
});
