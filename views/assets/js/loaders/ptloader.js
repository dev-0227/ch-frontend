$(document).ready(async function () {
  "use strict";
  if(!localStorage.getItem('chosen_clinic') || localStorage.getItem('chosen_clinic') != 'undefined'){
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic')
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/getTotal", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $(".totalcount").html(data[0]['total']);
        $('.managername').html(localStorage.getItem('username'));
      } else {
        toastr.error('Credential is invalid');
      }
    });
  }

  $("#ptloadbtn").click(function(){
    var formData = new FormData();
    formData.append("clinicid", localStorage.getItem('chosen_clinic'));
    formData.append("userid", localStorage.getItem('userid'));
    var qualityentry = document.getElementById('ptfile').files.length;
    if (qualityentry != 0) {
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      $(".pt-loader").removeClass("d-none");
      for (let i = 0; i < qualityentry; i++) {
          formData.append("ptfile", document.getElementById('ptfile').files[i]);
      }
      $(".progress-load").removeClass("d-none");
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "patientlist/ptloader", (xhr, err) => {
          if (!err) {
            $(".pt-loader").addClass("d-none");
            let data = JSON.parse(xhr.responseText)['data'];
            // $(".totalcount").html(data[0]['total']);
            // $(".newptcnt").html(data[0]['updated']);

            const countup_curpt = new countUp.CountUp("kt-countup-curpt");
            const countup_newpt = new countUp.CountUp("kt-countup-newpt");
            const countup_total = new countUp.CountUp("kt-countup-total");
            countup_curpt.update(data[0]['total'] - data[0]['updated'])
            countup_newpt.update(data[0]['updated'])
            countup_total.update(data[0]['total'])
            $("#load-result-modal").modal("show");
          } else {
            $(".pt-loader").addClass("d-none");
            return toastr.error('Action Failed');
          }
      });
    } else {
      return toastr.info('Please load file');
    }
  });
});
