
$(document).ready(function () {
    'use strict'

    // load specimen type begin //
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'valueset/specimenType', (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data']
            var html = ''
            result.forEach(item => {
                html += `<option value='${item.id}'>${item.display}</option>`
            })
            $('#lab-modal-specimen').html(html)
        }
    })
    // load specimen type end //

    // lab table begin //
    var labTable = $('#lab-table').DataTable({
        'ajax': {
            'url': serviceUrl + 'setting/lab',
            'type': 'GET',
            'headers': { 'Authorization': localStorage.getItem('authToken') }
        },
        serverSide: true,
        "pageLength": 10,
        "order": [],
        'columns': [
            { data: 'loinc_id' },
            { data: 'display' },
            { data: 'description' },
            { data: 'units' },
            { data: 'sdisplay' },
            { data: 'id',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top" idkey="`+row.id+`">
                            <button class="btn btn-sm btn-primary badge" type="button" id="lab-table-edit"><i class="fa fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger badge" type="button" id="lab-table-delete"><i class="fa fa-trash"></i></button>
                        </div>
                    `
                }
            }
        ]
    })
    // lab table end //

    // add new button begin //
    $('#lab-add-btn').click(() => {
        $('#lab-modal-type').val('0')

        $('#lab-modal-loinc').val('')
        $('#lab-modal-display').val('')
        $('#lab-modal-description').val('')
        $('#lab-modal-unit').val('')

        $('#lab-edit-modal').modal('show')
    })
    // add new button end //

    // edit button begin //
    $(document).on('click', '#lab-table-edit', function() {
        $("#chosen-lab").val($(this).parent().attr("idkey"))
        $('#lab-modal-type').val('1')

        sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $(this).parent().attr("idkey")}, 'setting/lab/chosen', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length) {
                    $('#lab-modal-loinc').val(result[0].loinc_id)
                    $('#lab-modal-display').val(result[0].display)
                    $('#lab-modal-description').val(result[0].description)
                    $('#lab-modal-unit').val(result[0].units)
                    $('#lab-modal-specimen').val(result[0].specimen_id).trigger('change')

                    $('#lab-edit-modal').modal('show')
                }
            } else {
                toastr.error('Action falied!')
            }
        })
    })
    // edit button end //

    // save lab begin //
    $('#lab-modal-save').click(() => {
        var entry = {
            id: $('#chosen-lab').val(),
            loinc_id: $('#lab-modal-loinc').val(),
            display: $('#lab-modal-display').val(),
            description: $('#lab-modal-description').val(),
            units: $('#lab-modal-unit').val(),
            specimen_id: $('#lab-modal-specimen').val(),
            snomed_id: '',
            fhir_id: '',
            type: null,
            normal_range_min: '',
            normal_range_max: '',
            clia: ''
        }
        if (entry.display == '') {
            toastr.warning('Please enter display.')
            $('#lab-modal-display').focus()
            return
        }

        if ($('#lab-modal-type').val() == '0') { // add
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/lab/add', (xhr, err) => {
                if (!err) {
                    toastr.success('A lab is added successfully!')
                    $('#lab-edit-modal').modal('hide')
                    labTable.ajax.reload()
                } else {
                    toastr.error('Action failed!')
                }
            })
        } else { // update
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/lab/update', (xhr, err) => {
                if (!err) {
                    toastr.success('A lab is updated successfully!')
                    $('#lab-edit-modal').modal('hide')
                    labTable.ajax.reload()
                } else {
                    toastr.error('Action failed!')
                }
            })
        }
    })
    // save lab end //

    // delete lab begin //
    $(document).on('click', '#lab-table-delete', function() {
        var entry = {
            id: $(this).parent().attr("idkey")
        }
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/lab/delete', (xhr, err) => {
                    if (!err) {
                        toastr.success('The lab was deleted successfully!')
                        labTable.ajax.reload()
                    } else {
                        toastr.error('Action failed!')
                    }
                })
            }
        })
    })
    // delete lab end //

    // search input begin //
    $(document).on('keyup', '#table-search-input', (e) => {
        labTable.search(e.target.value).draw()
    })
    // search input end //
})
