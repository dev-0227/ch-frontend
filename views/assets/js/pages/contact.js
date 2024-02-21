
$(document).ready(async function () {
  "use strict";
  // Create an instance of the Stripe object with your publishable API key
  $(".submitbtn").click(function(){
    let entry = {
      name:$("#name").val(),
      email:$("#email").val(),
      phone:$("#phone").val(),
      message:$("#message").val(),
    }
    $(this).prop("disabled",true);
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/contact", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        $(this).prop("disabled",false);
        if(result['status'] == "success")
          return $.growl.notice({
            message: "We will contact you soon. Thank you!"
          });
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
});