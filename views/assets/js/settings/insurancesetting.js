
$(document).ready(async function() {

    "use strict"

    // Load All clinics
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, "clinic/getByStatus", (xhr, err) => {
        var options = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value=${item.id}>${item.name}</option>`
            })
        }
        $('#insurance-clinics').html(`<option value = '0'>All Clinics</option>` + options)
        $('#insurance-add-clinics').html(options)
    })

    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance/", (xhr, err) => {
        var options = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value=${item.id}>${item.insName}</option>`
            })
        }
        $('#insurance-insurance').html(`<option value = '0'>All Insurances</option>` + options)
        $('#insurance-add-insurance').html(options)
    })

    var insTable = $('#insurance-table').DataTable({
        "ajax": {
            "url": serviceUrl + "setting/map/get",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') },
            "data": function(d) {
                d.clinicid = $('#insurance-clinics').val() ? $('#insurance-clinics').val() : '0'
                d.insid = $('#insurance-insurance').val() ? $('#insurance-insurance').val() : '0'
            }
        },
        "processing": true,
        "autoWidth": false,
        "columns": [
            { data: 'insName'},
            { data: 'emrid'},
            { data: 'fhirid'},
            { data: 'clinicid'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top " idkey="`+row.id+`">
                    <button class="btn  btn-primary badge edit-button" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
                    <button class="btn  btn-danger badge delete-button" type="button"><i class="fa fa-trash"></i> Delete</button>
                  </div>
                `
              } 
            }
        ]
    })

    $(document).on('change', '#insurance-clinics', (e) => {
    })

    $(document).on('click', '#insurance-add', () => {
        $("#edit-type").val('1')

        $('#insurance-add-emrid').val('')
        $('#insurance-add-fhirid').val('')

        $("#insurance-add-modal").modal('show')
    })

    $(document).on('click', '#insurance-save', () => {
        var type = $('#edit-type').val()
        var entry = {
            clinicid: $('#insurance-add-clinics').val(),
            insid: $('#insurance-add-insurance').val(),
            emrid: $('#insurance-add-emrid').val(),
            fhirid: $('#insurance-add-fhirid').val()
        }
        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/map/add', (xhr, err) => {
                if (!err) {
                    toastr.success('Successfully!')
                } else {
                    toastr.error('Action Failed!')
                }
                insTable.ajax.reload()
                $("#insurance-add-modal").modal('hide')
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/map/update', (xhr, err) => {
                if (!err) {
                    toastr.success('Successfully!')
                } else {
                    toastr.error('Action Failed!')
                }
                insTable.ajax.reload()
                $("#insurance-add-modal").modal('hide')
            })
        }
    })

    $(document).on('click', '.edit-button', function() {
        $('#edit-type').val('0')

        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/map/get", (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length) {
                    $('#insurance-add-clinics').val(result[0].clinicid).trigger('change')
                    $('#insurance-add-insurance').val(result[0].insid).trigger('change')
                    $('#insurance-add-emrid').val(result[0].emrid)
                    $('#insurance-add-fhirid').val(result[0].fhirid)

                    $("#insurance-add-modal").modal('show')
                }
            }
        })
    })

    $(document).on('click', '.delete-button', function() {
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        Swal.fire({
            text: "Are you sure you would like to delete?",
            icon: "error",
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/map/delete", (xhr, err) => {
                    if (!err) {
                        toastr.success('Success!')
                        insTable.ajax.reload()
                    } else {
                        toastr.error("Action Failed")
                    }
                })
            }
        })
    })

    $(document).on('change', '#insurance-clinics', () => {
        insTable.ajax.reload()
    })

    $(document).on('change', '#insurance-insurance', () => {
        insTable.ajax.reload()
    })
})