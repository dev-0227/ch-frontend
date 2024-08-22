
let _interval = null
let _value = 0
let _isReceivedRequest = true

function uploadCSVFile() {
  var formData = new FormData()
  formData.append("clinicid", localStorage.getItem('chosen_clinic'))
  formData.append("userid", localStorage.getItem('userid'))
  formData.append("labid", $('#lab-select').val())
  var qualityentry = document.getElementById('labfile').files.length
  if (qualityentry != 0) {
    $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
    $(".lab-loader").removeClass("d-none")
    for (let i = 0; i < qualityentry; i++) {
        formData.append("labfile", document.getElementById('labfile').files[i])
    }
    
    KTApp.showPageLoading()
    sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "setting/labloader", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)
        const countup_curlab = new countUp.CountUp("kt-countup-curlab")
        const countup_newlab = new countUp.CountUp("kt-countup-newlab")
        const countup_total = new countUp.CountUp("kt-countup-total")
        countup_curlab.update(data.readCount)
        countup_newlab.update(data.addCount)
        countup_total.update(data.total)
        $("#load-result-modal").modal("show")

        KTApp.hidePageLoading()
      } else {
        toastr.error('Action Failed')

        KTApp.hidePageLoading()
      }
    });
  } else {
    return toastr.info('Please load file')
  }
}

$(document).ready(async function () {
  "use strict";

  sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, 'setting/lab/get', (xhr, err) => {
    if (!err) {
      var result = JSON.parse(xhr.responseText)['data']
      var html = ``
      result.forEach(item => {
        html += `<option value='${item.id}'>${item.display}</option>`
      })
      $('#lab-select').html(html)
    }
  })

  // Excel Begin //
  $("#labloadbtn").click(function() {
    $('#verify-clinic-name').html('')
    $('#verify-check').prop('checked', false)
    $('#verify-lab').prop('checked', false)
    $('#verify-done').prop('disabled', true)

    $('#verify-lab-name').html($("#lab-select option:selected").text())

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
      if ($('#verify-lab').prop('checked') == true)
      $('#verify-done').prop('disabled', false)
    }
  })

  $(document).on('change', '#verify-lab', (e) => {
    if (e.target.checked == false) {
      $('#verify-done').prop('disabled', true)
    } else {
      if ($('#verify-check').prop('checked') == true)
      $('#verify-done').prop('disabled', false)
    }
  })
  // Excel End //
  // ECW Bulk Begin //

  // $('#labloader_ecwbulk_btn').click(async function() {
  //   KTApp.showPageLoading()
  //   var url = `https://${$('#labloader_ecwbulk_url').val()}`
  //   var key = $('#labloader_ecwbulk_key').val()

  //   sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid: localStorage.getItem('userid'), url: url, key: key}, 'setting/lab/ecwbulk', (xhr, err) => {
  //     if (!err) {
  //       var data = JSON.parse(xhr.responseText)
  //       const countup_gthpt = new countUp.CountUp("kt-countup-gthpt-ecwbulk");
  //       const countup_uptpt = new countUp.CountUp("kt-countup-uptpt-ecwbulk");
  //       const countup_newpt = new countUp.CountUp("kt-countup-newpt-ecwbulk");
  //       const countup_exist = new countUp.CountUp("kt-countup-exist-ecwbulk");
  //       countup_gthpt.update(data['total'])
  //       countup_newpt.update(data['new'])
  //       countup_uptpt.update(data['update'])
  //       countup_exist.update(data['total'] - data['count'])
  //       $("#gather-result-modal").modal("show");
  //     }
  //     KTApp.hidePageLoading()
  //   })
  // })

  // ECW Bulk End //
})
