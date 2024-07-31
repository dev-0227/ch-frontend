
function uploadCSVFile() {
  var formData = new FormData()
  formData.append("clinicid", localStorage.getItem('chosen_clinic'))
  formData.append("userid", localStorage.getItem('userid'))
  formData.append('vtype', $('#vital-select').val())
  var qualityentry = document.getElementById('vitalfile').files.length
  if (qualityentry != 0) {
    $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
    
    for (let i = 0; i < qualityentry; i++) {
      formData.append("vitalfile", document.getElementById('vitalfile').files[i])
    }

    KTApp.showPageLoading()
    sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "vital/vitalloader", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)
        KTApp.hidePageLoading()

        var type = $('#vital-select option:selected').text()
        $('#curvital-text').html(`${new Date(Date.now()).getFullYear()} Loaded ${type}`)
        $('#newvital-text').html(`New Loaded ${type}`)
        $('#totalvital-text').html(`Total PT Vital`)

        const countup_curvital = new countUp.CountUp("kt-countup-curvital")
        const countup_newvital = new countUp.CountUp("kt-countup-newvital")
        const countup_total = new countUp.CountUp("kt-countup-total")
        countup_curvital.update(data.readCount)
        countup_newvital.update(data.addCount)
        countup_total.update(data.total)

        $("#load-result-modal").modal("show")
      } else {
        return toastr.error('Action Failed')
      }
    })
  } else {
    return toastr.info('Please load file')
  }
}
  
  $(document).ready(async function () {
    "use strict";
  
    // Excel Begin //
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'vital/', (xhr, err) => {
      if (!err) {
        var _selectedid = 0
        var options = ``
        var result = JSON.parse(xhr.responseText)['data']
        result.forEach(item => {
          if (item.vname == 'BP') _selectedid = item.id
          options += `<option value = '${item.id}'>${item.vname}</option>`
        })
        $('#vital-select').html(options)
        $('#vital-select').val(_selectedid).trigger('change')
      }
    })

    $('#vitalloadbtn').click(function() {
      $('#verify-vital-name').html('Correct Vital Type is ' + $('#vital-select option:selected').text())
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: localStorage.getItem('chosen_clinic')}, 'clinic/chosen', (xhr, err) => {
        if (!err) {
          var result = JSON.parse(xhr.responseText)['data']
          $('#verify-clinic-name').html('Correct Clinic is ' + result[0].name)
        }
        $('#loader-verification').modal('show')
      })
    })

    $(document).on('change', '#verify-check-clinic', (e) => {
      if (e.target.checked == true && $('#verify-check-vital').prop('checked') == true) {
        $('#verify-done').prop('disabled', false)
      } else {
        $('#verify-done').prop('disabled', true)
      }
    })

    $(document).on('change', '#verify-check-vital', (e) => {
      if (e.target.checked == true && $('#verify-check-clinic').prop('checked') == true) {
        $('#verify-done').prop('disabled', false)
      } else {
        $('#verify-done').prop('disabled', true)
      }
    })

    $('#verify-done').click(function() {
      $('#loader-verification').modal('hide')
      uploadCSVFile()
    })
    // Excel End //
    // ECW Bulk Begin //
    $('#vitalloader_ecwbulk_btn').click(async function() {
      KTApp.showPageLoading()
      var url = `https://${$('#vitalloader_ecwbulk_url').val()}`
      var key = $('#vitalloader_ecwbulk_key').val()
  
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid: localStorage.getItem('userid'), url: url, key: key}, 'vital/ecwbulk', (xhr, err) => {
        if (!err) {
          var data = JSON.parse(xhr.responseText)
          const countup_gthvital = new countUp.CountUp("kt-countup-gthvital-ecwbulk");
          const countup_uptvital = new countUp.CountUp("kt-countup-uptvital-ecwbulk");
          const countup_newvital = new countUp.CountUp("kt-countup-newvital-ecwbulk");
          const countup_exist = new countUp.CountUp("kt-countup-exist-ecwbulk");
          countup_gthvital.update(data['total'])
          countup_newvital.update(data['new'])
          countup_uptvital.update(data['update'])
          countup_exist.update(data['total'] - data['count'])
          $("#gather-result-modal").modal("show");
        }
        KTApp.hidePageLoading()
      })
    })
    // ECW Bulk End //
  })
  