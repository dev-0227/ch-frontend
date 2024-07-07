
var _selectedid = 0

$(document).ready(function () {
    "use strict"
    var ins_type_table = $('#insurance-type-table').DataTable({
        "ajax": {
            "url": serviceUrl + "insurance/gettype",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') },
            "data": function(d) {
                d.filter = $('#insurance-type-search').val()
            }
        },
        "pageLength": 10,
        "order": [],
        "columns": [{
            data: 'display', 
            render: function(data, type, row) {
                return row.display;
            }
            }, {
            data: 'description',
            render: function (data, type, row) {
                return row.description;
            }  
        }, {
            data: 'id',
            render: function (data, type, row) {
                return `
                    <div class="btn-group align-top " idkey="`+row.id+`">
                        <button class="btn  btn-primary badge type-edit-btn" data-target="#user-form-modal" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
                        <button class="btn  btn-danger badge type-delete-btn" type="button"><i class="fa fa-trash"></i> Delete</button>
                    </div>
                `
            } 
        }]
    })

    $('#type-add-btn').click(() => {
        $('#type-edit-type').val('1')
        $('#insurance-type-display').val('')
        $('#insurance-type-desc').val('')

        $('#type-edit-modal').modal('show')
    })

    $(document).on('click', '.type-edit-btn',function() {
        $('#type-edit-type').val('0')
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        _selectedid = entry.id

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/chosentype', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length > 0) {
                    $('#insurance-type-display').val(result[0].display)
                    $('#insurance-type-desc').val(result[0].description)

                    $('#type-edit-modal').modal('show')
                }
            } else {
                toastr.error('A problem occurred with the server')
            }
        })
    })

    $('#type-save-btn').click(() => {
        var type = $('#type-edit-type').val()
        var entry = {
            id: _selectedid,
            display: $('#insurance-type-display').val(),
            description: $('#insurance-type-desc').val()
        }

        if (entry.display == '') {
            toastr.warning('Please input display!')
            $('#insurance-type-display').focus()
            return
        }

        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/addtype', (xhr, err) => {
                if (!err) {
                    ins_type_table.ajax.reload()
                    toastr.success('Success!')
                    $('#type-edit-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/updatetype', (xhr, err) => {
                if (!err) {
                    ins_type_table.ajax.reload()
                    toastr.success('Success!')
                    $('#type-edit-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        }
    })

    $(document).on('click', '.type-delete-btn', function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/deletetype", (xhr, err) => {
                    if (!err) {
                        ins_type_table.ajax.reload()
                        toastr.success('Success!')
                    } else {
                        return toastr.error("Action Failed")
                    }
                })
            }
        })
    })

    $("#insurance-type-search").on('keyup', function() {
        ins_type_table.search(this.value).draw();
    })
})
