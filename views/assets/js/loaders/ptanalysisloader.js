
function uploadCSVFile() {
    var formData = new FormData();
    formData.append("clinicid", localStorage.getItem('chosen_clinic'));
    formData.append("userid", localStorage.getItem('userid'));
    var qualityentry = document.getElementById('ptfile').files.length;
    if (qualityentry != 0) {
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      for (let i = 0; i < qualityentry; i++) {
          formData.append("ptfile", document.getElementById('ptfile').files[i]);
      }
      KTApp.showPageLoading()
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "ptanalysisloader/upload", (xhr, err) => {
          if (!err) {
            let data = JSON.parse(xhr.responseText)['data'];
            $("#load-result-modal").modal("show");
            KTApp.hidePageLoading()
          } else {
            KTApp.hidePageLoading()
            return toastr.error('Action Failed');
          }
      });
    } else {
        KTApp.hidePageLoading()
      return toastr.info('Please load file');
    }
  }
  
  $(document).ready(async function () {
    "use strict";
  
    // Excel Begin //
    if(!localStorage.getItem('chosen_clinic') || localStorage.getItem('chosen_clinic') != 'undefined'){
      let entry = {
        clinicid:localStorage.getItem('chosen_clinic')
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "ptanalysisloader/getTotal", (xhr, err) => {
        if (!err) {
          // let data = JSON.parse(xhr.responseText)['data'];
          // $(".totalcount").html(data[0]['total']);
          // $('.managername').html(localStorage.getItem('username'));
        } else {
          toastr.error('Credential is invalid');
        }
      });
    }
  
    $("#ptloadbtn").click(function() {
        uploadCSVFile()
    })
    // Excel End //
  })
  