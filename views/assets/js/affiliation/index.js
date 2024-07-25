$(document).ready(function () {
    "use strict"
  
    var affiliation_table = $('#affiliation-table').DataTable({
        "ajax": {
            "url": serviceUrl + "affiliation/",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        serverSide: true,
        "pageLength": 10,
        "order": [],
        "columns": [
            { data: 'name' ,
                render: function(data, type, row) {
                    return row.name;
                }
            },
            { data: 'tel',
                render: function (data, type, row) {
                return row.tel;
                } 
            },
            { data: 'fax', 
                render: function(data, type, row) {
                    return row.fax;
                }
            },
            { data: 'email',
            render: function (data, type, row) {
                return row.email;
            }  
            },
            { data: 'state',
                render: function (data, type, row) {
                    return row.state;
                }  
            },
            { data: 'city',
                render: function (data, type, row) {
                    return row.city;
                }  
            },
            { data: 'status',
                render: function (data, type, row) {
                    if(row.status == 1)
                    return '<div class="badge badge-success fw-bold badge-lg">Active</span>'
                    else
                    return '<div class="badge badge-danger fw-bold badge-lg">Inactive</span>'
                }  
            },
            { data: 'id',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top " idkey="`+row.id+`">
                        <button class="btn btn-primary badge" id='affiliation-edit' data-target="#user-form-modal" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-danger badge" id='affiliation-delete' type="button"><i class="fa fa-trash"></i></button>
                        </div>
                    `
                } 
            }
        ]
    })
  
    $('#table_search_input').on('keyup', function () {
        affiliation_table.search(this.value).draw()
    })
  
    $(document).on("click", "#affiliation-add", function() {
      $("#affiliation-modal-type").val('1')
      $("#affiliation-name").val('')
      $("#affiliation-tel").val('')
      $("#affiliation-fax").val('')
      $("#affiliation-email").val('')
      $("#affiliation-city").val('')
      $("#affiliation-state").val('New York').trigger('change')
      $("#astatus").val(1).trigger('change')

      $('#affiliation-modal').modal('show')
    })

    $(document).on('click', '#affiliation-edit', function() {
        $('#affiliation-modal-type').val('0')
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'affiliation/chosen', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length > 0) {
                    $('#affiliation-chosen').val(result[0].id)
                    $('#affiliation-name').val(result[0].name)
                    $('#affiliation-tel').val(result[0].tel)
                    $('#affiliation-fax').val(result[0].fax)
                    $('#affiliation-email').val(result[0].email)
                    $('#affiliation-state').val(result[0].state).trigger('change')
                    $('#affiliation-city').val(result[0].city)
                    $('#affiliation-status').val(result[0].status).trigger('change')

                    $('#affiliation-modal').modal('show')
                }
            } else {
                toastr.error('A problem occurred with the server')
            }
        })
    })

    $('#affiliation-save').click(function() {
        var type = $('#affiliation-modal-type').val()
        var entry = {
            id: $('#affiliation-chosen').val(),
            name: $('#affiliation-name').val(),
            tel: $('#affiliation-tel').val(),
            fax: $('#affiliation-fax').val(),
            email: $('#affiliation-email').val(),
            state: $('#affiliation-state').val(),
            city: $('#affiliation-city').val(),
            status: $('#affiliation-status').val()
        }

        if (entry.name == '') {
            toastr.warning('Please input affiliation name!')
            $('#affiliation-name').focus()
            return
        }

        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'affiliation/add', (xhr, err) => {
                if (!err) {
                    affiliation_table.ajax.reload()
                    toastr.success('Success!')
                    $('#affiliation-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'affiliation/update', (xhr, err) => {
                if (!err) {
                    affiliation_table.ajax.reload()
                    toastr.success('Success!')
                    $('#affiliation-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        }
    })

    $(document).on('click', '#affiliation-delete', function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "affiliation/delete", (xhr, err) => {
                    if (!err) {
                        affiliation_table.ajax.reload()
                        toastr.success('Success!')
                    } else {
                        return toastr.error("Action Failed")
                    }
                })
            }
        })
    })
})
