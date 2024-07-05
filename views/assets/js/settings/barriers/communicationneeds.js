$(document).ready(function() {
    "use strict";
    // PT Communication Needs Table
    var pt_comm_needs_table = $('#pt_comm_needs_table').DataTable({
        "ajax": {
            "url": serviceUrl + "barriers/getPTCommNeeds",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        "order": [[0, 'asc']],
        "columns": [
            { data: 'id'},
            { data: 'code'},
            { data: 'display'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge pt_comm_needs_edit_btn" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge pt_comm_needs_del_btn" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#pt_comm_needs_search_input').on('keyup', function () {
        pt_comm_needs_table.search(this.value).draw();
    });
    
    $(document).on('click', '#addPTCommNeedsBtn', function() {
        $('#pt_comm_needs_add_modal').modal('show');
    });

    $(document).on('click', '#save_pt_comm_needs_btn', function() {
        
        var code = $('#add_pt_comm_needs_code').val();
        var display = $('#add_pt_comm_needs_display').val();

        if ( code == '' || display == '' ) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                code: code, 
                display: display
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/addPTCommNeeds", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        pt_comm_needs_table.ajax.reload();
                    }, 1000 );
                    $('#add_pt_comm_needs_code').val('');
                    $('#add_pt_comm_needs_display').val('');
                    $('#pt_comm_needs_add_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".pt_comm_needs_del_btn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/delPTCommNeeds", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        pt_comm_needs_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.pt_comm_needs_edit_btn', function() {
        $('#pt_comm_needs_edit_modal').modal('show');

        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/getPTCommNeedsById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_pt_comm_needs_id').val(result[0]['id']);
                $('#edit_pt_comm_needs_code').val(result[0]['code']);
                $('#edit_pt_comm_needs_display').val(result[0]['display']);               
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#update_pt_comm_needs_btn', function() {      
        let entry = {
            id: $('#edit_pt_comm_needs_id').val(),                 
            code: $('#edit_pt_comm_needs_code').val(),
            display: $('#edit_pt_comm_needs_display').val(),        
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/updatePTCommNeedsById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    pt_comm_needs_table.ajax.reload();
                }, 1000 );
                $('#edit_pt_comm_needs_id').val('')           
                $('#edit_pt_comm_needs_code').val('');
                $('#edit_pt_comm_needs_display').val('');            
                $('#pt_comm_needs_edit_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });  
    
});