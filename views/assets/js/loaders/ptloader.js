
function uploadCSVFile() {
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
}

$(document).ready(async function () {
  "use strict";

  // Exce Begin //
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

  $("#ptloadbtn").click(function() {
    $('#verify-clinic-name').html('')
    $('#verify-check').prop('checked', false)
    $('#verify-done').prop('disabled', true)

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: localStorage.getItem('chosen_clinic')}, 'clinic/chosen', (xhr, err) => {
      if (!err) {
        var result = JSON.parse(xhr.responseText)['data']
        $('#verify-clinic-name').html(result[0].name)
      }
      $('#loader-verification').modal('show')
    })
  })

  $('#verify-done').click(function() {
    $('#loader-verification').modal('hide')
    uploadCSVFile()
  })

  $(document).on('change', '#verify-check', (e) => {
    if (e.target.checked == false) {
      $('#verify-done').prop('disabled', true)
    } else {
      $('#verify-done').prop('disabled', false)
    }
  })
  // Exce Begin //
  // ECW Bulk Begin //
  $('#ptloader_ecwbulk_btn').click(async function() {
    KTApp.showPageLoading()
    var url = `https://${$('#ptloader_ecwbulk_url').val()}`
    var key = $('#ptloader_ecwbulk_key').val()

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid: localStorage.getItem('userid'), url: url, key: key}, 'patientlist/ecwbulk', (xhr, err) => {
      if (!err) {
        var data = JSON.parse(xhr.responseText)
        const countup_gthpt = new countUp.CountUp("kt-countup-gthpt-ecwbulk");
        const countup_uptpt = new countUp.CountUp("kt-countup-uptpt-ecwbulk");
        const countup_newpt = new countUp.CountUp("kt-countup-newpt-ecwbulk");
        const countup_exist = new countUp.CountUp("kt-countup-exist-ecwbulk");
        countup_gthpt.update(data['total'])
        countup_newpt.update(data['new'])
        countup_uptpt.update(data['update'])
        countup_exist.update(data['total'] - data['count'])
        $("#gather-result-modal").modal("show");
      }
      KTApp.hidePageLoading()
    })
  })
  // ECW Bulk End //
})
