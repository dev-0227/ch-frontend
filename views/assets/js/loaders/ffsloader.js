$(document).ready(function () {
  "use strict";
  $("#ffsloadbtn").click(function(){
    var formData = new FormData();
    formData.append("clinicid", localStorage.getItem('chosen_clinic'));
    formData.append("userid", localStorage.getItem('userid'));
    var qualityentry = document.getElementById('ffsfile').files.length;
    if (qualityentry != 0) {
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      $(".payment-loader").removeClass("d-none");
      for (let i = 0; i < qualityentry; i++) {
          formData.append("ffsfile", document.getElementById('ffsfile').files[i]);
      }
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "ffs/ffsloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".payment-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return $.growl.warning({
              message: "Action Failed"
            });
          }
      });
    } else {
      return $.growl.warning({
        message: "Please load file"
      });
    }
  });
});
