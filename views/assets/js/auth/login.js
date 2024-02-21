
$(document).ready(function () {
  "use strict";
  $('#email').keypress(function(e){
    if (e.which === 13) {
      $('#password').focus();
    }
  })

  $('#password').keypress(function(e){
    if (e.which === 13) {
      $("#login").trigger("click");
    }
  })

  $('#email').focus();
  $("#login").click(function(){
    let entry = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    }
    if(entry.email == ""){
      toastr.info('Please enter your email');
      $("#email").focus();
      return;
    }
    if(entry.password == ""){
      toastr.info('Please enter your password');
      $("#password").focus();
      return;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "login/login", (xhr, err) => {
      let result = JSON.parse(xhr.responseText);
      if (!err) {
        if(result.status == "success"){
          localStorage.setItem('userid', result.userid);
          localStorage.setItem('usertype', result.type);
          localStorage.setItem('userclinic', result.clinic);
          localStorage.setItem('username', result.fname+" "+result.lname);
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('redirectkey', $("#redirectkey").val());
          window.location.replace("./security");
        }
        else if(result.status == "approve"){
          toastr.info('You are not approved by system. Please wait for some time');
        }
        else{
          toastr.error('Credential is invalid');
        }
        
      }
      else {
        toastr.error('Credential is invalid');
      }
    });
  });
});
