
// load bulk for patient
function loadBulkForPatient() {
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, 'setting/bulk/getForPatient', (xhr, err) => {
        if (!err) {
            var options = ''
            var result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.endpoint}</option>`
            })
            $('#bulk_patient_url').html(options)

            if (options.length > 0) {
                $('#bulk_patient_edit_btn').prop('disabled', false)
                $('#bulk_patient_delete_btn').prop('disabled', false)
            } else {
                $('#bulk_patient_edit_btn').prop('disabled', true)
                $('#bulk_patient_delete_btn').prop('disabled', true)
            }
        }
    })
}

// load bulk for encounter
function loadBulkForEncounter() {
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, 'setting/bulk/getForEncounter', (xhr, err) => {
        if (!err) {
            var options = ''
            var result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.endpoint}</option>`
            })
            $('#bulk_encounter_url').html(options)

            if (options.length > 0) {
                $('#bulk_encounter_edit_btn').prop('disabled', false)
                $('#bulk_encounter_delete_btn').prop('disabled', false)
            } else {
                $('#bulk_encounter_edit_btn').prop('disabled', true)
                $('#bulk_encounter_delete_btn').prop('disabled', true)
            }
        }
    })
}

$(document).ready(async function() {

    loadBulkForPatient()
    loadBulkForEncounter()

    // add
    $('#bulk_add_btn').click(() => {
        $('#bulk_modal_type').val('1')
        $('#bulk_modal_endpoint').val('')

        $('#bulk_edit_modal').modal('show')
    })

    // edit patient
    $('#bulk_patient_edit_btn').click(() => {
        $('#bulk_modal_type').val('0')

        $('#bulk_chosen').val($('#bulk_patient_url').val())
        $('#bulk_modal_scope').val('patient').trigger('change')
        $('#bulk_modal_endpoint').val($('#bulk_patient_url option:selected').text())

        $('#bulk_edit_modal').modal('show')
    })

    // edit encounter
    $('#bulk_encounter_edit_btn').click(() => {
        $('#bulk_modal_type').val('0')

        $('#bulk_chosen').val($('#bulk_encounter_url').val())
        $('#bulk_modal_scope').val('encounter').trigger('change')
        $('#bulk_modal_endpoint').val($('#bulk_encounter_url option:selected').text())

        $('#bulk_edit_modal').modal('show')
    })

    // save
    $('#bulk_modal_save').click(() => {
        var type = $('#bulk_modal_type').val()
        var entry = {
            id: $('#bulk_chosen').val(),
            scope: $('#bulk_modal_scope').val(),
            endpoint: $('#bulk_modal_endpoint').val()
        }
        if (type == '1') { // add
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/bulk/add', (xhr, err) => {
                if (!err) {
                    toastr.success('Success!')
                    $('#bulk_edit_modal').modal('hide')

                    loadBulkForPatient()
                    loadBulkForEncounter()
                } else {
                    toastr.error('Action Failed!')
                }
            })
        } else if (type == '0') { // edit
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/bulk/edit', (xhr, err) => {
                if (!err) {
                    toastr.success('Success!')
                    $('#bulk_edit_modal').modal('hide')

                    loadBulkForPatient()
                    loadBulkForEncounter()
                } else {
                    toastr.error('Action Failed!')
                }
            })
        }
    })

    // delete patient
    $('#bulk_patient_delete_btn').click(() => {
        Swal.fire({
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, return",
            customClass: {
                confirmButton: "btn btn-danger",
                cancelButton: "btn btn-primary"
            }
        }).then(function (result) {
            if (result.value) {
                sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $('#bulk_patient_url').val()}, "setting/bulk/delete", (xhr, err) => {
                    if (!err) {
                        toastr.success('Success!')
                        loadBulkForPatient()
                    } else {
                        return toastr.error('Action Failed')
                    }
                })
            }
        })
    })

    // delete encounter
    $('#bulk_encounter_delete_btn').click(() => {
        Swal.fire({
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, return",
            customClass: {
                confirmButton: "btn btn-danger",
                cancelButton: "btn btn-primary"
            }
        }).then(function (result) {
            if (result.value) {
                sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $('#bulk_encounter_url').val()}, "setting/bulk/delete", (xhr, err) => {
                    if (!err) {
                        toastr.success('Success!')
                        loadBulkForEncounter()
                    } else {
                        return toastr.error('Action Failed')
                    }
                })
            }
        })
    })
})
