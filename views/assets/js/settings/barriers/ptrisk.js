$(document).ready(function() {
    "use strict";
    // PT Risk Level Table
    var pt_risk_level_table = $('#pt_risk_level_table').DataTable({
        "ajax": {
            "url": serviceUrl + "barriers/getPTRiskLevel",
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
                    <button class="btn btn-sm btn-primary badge pt_risk_level_edit_btn" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge pt_risk_level_del_btn" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#pt_risk_level_search_input').on('keyup', function () {
        pt_risk_level_table.search(this.value).draw();
    });
    
    $(document).on('click', '#addPTRiskLevelBtn', function() {
        $('#pt_risk_level_add_modal').modal('show');
    });

    $(document).on('click', '#save_pt_risk_level_btn', function() {
        var code = $('#add_pt_risk_level_code').val();
        var display = $('#add_pt_risk_level_display').val();

        if ( code == '' || display == '' ) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                code: code, 
                display: display
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/addPTRiskLevel", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        pt_risk_level_table.ajax.reload();
                    }, 1000 );
                    $('#add_pt_risk_level_code').val('');
                    $('#add_pt_risk_level_display').val('');
                    $('#pt_risk_level_add_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".pt_risk_level_del_btn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/delPTRiskLevel", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        pt_risk_level_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.pt_risk_level_edit_btn', function() {
        $('#pt_risk_level_edit_modal').modal('show');

        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/getPTRiskLevelById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                
                $('#edit_pt_risk_level_id').val(result[0]['id']);
                $('#edit_pt_risk_level_code').val(result[0]['code']);
                $('#edit_pt_risk_level_display').val(result[0]['display']);               
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#update_pt_risk_level_btn', function() {      
        let entry = {
            id: $('#edit_pt_risk_level_id').val(),        
            code: $('#edit_pt_risk_level_code').val(),
            display: $('#edit_pt_risk_level_display').val(),        
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/updatePTRiskLevelById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    pt_risk_level_table.ajax.reload();
                }, 1000 );
                $('#edit_pt_risk_level_id').val(''),           
                $('#edit_pt_risk_level_code').val('');
                $('#edit_pt_risk_level_display').val('');            
                $('#pt_risk_level_edit_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });      
});