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
  else{
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {sid:params['s']}, "ffs/setsid", (xhr, err) => {
      if (!err) {
        
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
    var clinicname = atob(params['t']);
    $("#clinic_name").html(clinicname)
  }
});
