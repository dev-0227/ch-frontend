function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
$(document).ready(function () {
  "use strict";
  let id = getUrlVars();
  if(typeof id['t'] == "undefined")
    window.location.replace("../404");
  if(id['t'] == 0)
    window.location.replace("../404");
  $("#resetbtn").click(function(){
    let entry = {
      id: id['t'],
      pwd: document.getElementById('password').value,
    }
    if($("#password").val()==""){
      return $.growl.error({
        message: "Please enter new password."
      });
    }
    else if($("#password").val() != $("#cpassword").val()){
      return $.growl.notice({
        message: "Please check your new password again"
      });
    }
    else{
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "login/updatepwd", (xhr, err) => {
        if (!err) {
          window.location.replace("../");
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
    }
  });
});
