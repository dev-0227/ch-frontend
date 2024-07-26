$(document).ready(function () {
    "use strict"

    // Clinic
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'clinic/', (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data']
            var options = ''
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.name}</option>`
            })
            $('#affiliation-ins-clinic').html(options)
        }
    })

    // Insurance
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'insurance/', (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data']
            var options = ''
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.insName}</option>`
            })
            $('#affiliation-ins-insurance').html(options)
        }
    })

    // Affiliation
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, 'affiliation/list', (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data']
            var options = ''
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.name}</option>`
            })
            $('#affiliation-ins-affiliation').html(options)
        }
    })

    // Insurance Type
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'insurance/gettype', (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data']
            var options = ''
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.display}</option>`
            })
            $('#affiliation-ins-instype').html(options)
        }
    })

    // Insurance Payment Method
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'insurance/getPaymentMethod', (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data']
            var options = ''
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.display}</option>`
            })
            $('#affiliation-ins-paymethod').html(options)
        }
    })
  
    var affiliation_ins_table = $('#affiliation-ins-table').DataTable({
        "ajax": {
            "url": serviceUrl + "affiliation/ins/",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        serverSide: true,
        "pageLength": 10,
        "order": [],
        "columns": [
            { data: 'clinic' ,
                render: function(data, type, row) {
                    return row.clinic;
                }
            },
            { data: 'insurance',
                render: function (data, type, row) {
                return row.insurance;
                } 
            },
            { data: 'affiliation', 
                render: function(data, type, row) {
                    return row.affiliation;
                }
            },
            { data: 'insType',
            render: function (data, type, row) {
                return row.insType;
            }  
            },
            { data: 'payMethod',
                render: function (data, type, row) {
                    return row.payMethod;
                }  
            },
            { data: 'id',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top " idkey="`+row.id+`">
                        <button class="btn btn-primary badge" id='affiliation-ins-edit' data-target="#user-form-modal" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-danger badge" id='affiliation-ins-delete' type="button"><i class="fa fa-trash"></i></button>
                        </div>
                    `
                } 
            }
        ]
    })
  
    $('#table_search_input').on('keyup', function () {
        affiliation_ins_table.search(this.value).draw()
    })
  
    $(document).on("click", "#affiliation-ins-add", function() {
        var type = $('#affiliation-ins-modal-type').val('1')
      $('#affiliation-ins-modal').modal('show')
    })

    $(document).on('click', '#affiliation-ins-edit', function() {
        $('#affiliation-ins-modal-type').val('0')
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'affiliation/ins/chosen', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length > 0) {
                    $('#affiliation-ins-chosen').val(result[0].id)
                    $('#affiliation-ins-clinic').val(result[0].clinicid).trigger('change')
                    $('#affiliation-ins-insurance').val(result[0].insid).trigger('change')
                    $('#affiliation-ins-affiliation').val(result[0].affiliationid).trigger('change')
                    $('#affiliation-ins-instype').val(result[0].instypeid).trigger('change')
                    $('#affiliation-ins-paymethod').val(result[0].paymethodid).trigger('change')
                    
                    $('#affiliation-ins-modal').modal('show')
                }
            } else {
                toastr.error('A problem occurred with the server')
            }
        })
    })

    $('#affiliation-ins-save').click(function() {
        var type = $('#affiliation-ins-modal-type').val()
        var entry = {
            id: $('#affiliation-ins-chosen').val(),
            clinicid: $('#affiliation-ins-clinic').val(),
            insid: $('#affiliation-ins-insurance').val(),
            affiliationid: $('#affiliation-ins-affiliation').val(),
            instypeid: $('#affiliation-ins-instype').val(),
            paymethodid: $('#affiliation-ins-paymethod').val(),
        }

        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'affiliation/ins/add', (xhr, err) => {
                if (!err) {
                    affiliation_ins_table.ajax.reload()
                    toastr.success('Success!')
                    $('#affiliation-ins-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'affiliation/ins/update', (xhr, err) => {
                if (!err) {
                    affiliation_ins_table.ajax.reload()
                    toastr.success('Success!')
                    $('#affiliation-ins-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        }
    })

    $(document).on('click', '#affiliation-ins-delete', function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "affiliation/ins/delete", (xhr, err) => {
                    if (!err) {
                        affiliation_ins_table.ajax.reload()
                        toastr.success('Success!')
                    } else {
                        return toastr.error("Action Failed")
                    }
                })
            }
        })
    })
})
