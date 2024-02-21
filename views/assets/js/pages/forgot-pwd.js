$(document).ready(function () {
  "use strict";
  $("#resetpwdbtn").click(function(){
    let entry = {
      email:$("#email").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "login/resetpwdemail", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        if(result['message'] == "success")
          return $.growl.notice({
            message: "We sent email. Please check your email"
          });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
});
