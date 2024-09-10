$(document).ready(async function() {
    "use strict";
    
    // Medications Dispense Status Table
    var medDispStatusTable = $('#medDispStatusTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedDispStatus",
            "type": "GET"
        },
        "order": [[4, 'asc']],
        "columns": [
            { data: 'code'},
            { data: 'system'},
            { data: 'display'},
            { data: 'definition'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge medDispStatusEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge medDispStatusDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#medDispStatus_search_input').on('keyup', function () {
        medDispStatusTable.search(this.value).draw();
    });

    $(document).on('click', '#addMedDispStatusBtn', function() {
        $('#medDispStatusAddModal').modal('show');
    });

    $(document).on('click', '#saveMedDispStatusBtn', function() {
        var code = $('#add_med_disp_status_code').val();
        var system = $('#add_med_disp_status_system').val();
        var display = $('#add_med_disp_status_display').val();
        var definition = $('#add_med_disp_status_definition').val();

        if (code == '' || system == '' || display == '' || definition == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                code: code, 
                system: system,
                display: display,
                definition: definition
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedDispStatus", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medDispStatusTable.ajax.reload();
                    }, 1000 );
    
                    $('#add_med_disp_status_code').val('');
                    $('#add_med_disp_status_system').val('');
                    $('#add_med_disp_status_display').val('');
                    $('#add_med_disp_status_display').val('');
                    $('#medDispStatusAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medDispStatusEditBtn', function() {
        $('#medDispStatusEditModal').modal('show');
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedDispStatusById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_disp_status_id').val(result[0]['id']);
                $('#edit_med_disp_status_code').val(result[0]['code']);
                $('#edit_med_disp_status_system').val(result[0]['system']);
                $('#edit_med_disp_status_display').val(result[0]['display']);
                $('#edit_med_disp_status_definition').val(result[0]['definition']);                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedDispStatusBtn', function() {      
        let entry = {
            id: $('#edit_med_disp_status_id').val(),           
            code: $('#edit_med_disp_status_code').val(),
            system: $('#edit_med_disp_status_system').val(),
            display: $('#edit_med_disp_status_display').val(),
            definition: $('#edit_med_disp_status_definition').val()            
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedDispStatusById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medDispStatusTable.ajax.reload();
                }, 1000 );
                $('#edit_med_disp_status_id').val(''),           
                $('#edit_med_disp_status_code').val('');
                $('#edit_med_disp_status_system').val('');
                $('#edit_med_disp_status_display').val('');
                $('#edit_med_disp_status_definition').val('');                
                $('#medDispStatusEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });   
    
    $(document).on("click", ".medDispStatusDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedDispStatus", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medDispStatusTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    // Medications Dispense Performer Table
    var medDispPerformerTable = $('#medDispPerformerTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedDispPerformer",
            "type": "GET"
        },
        "order": [[3, 'asc']],
        "columns": [
            { data: 'code'},
            { data: 'system'},
            { data: 'display'},
            { data: 'definition'},
            { data: 'id',
                render: function (data, type, row) {
                  return `
                    <div class="btn-group align-top" idkey="`+row.id+`">
                      <button class="btn btn-sm btn-primary badge medDispPerformerEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger badge medDispPerformerDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  `
                } 
            }
        ]
    });

    $('#medDispPerformer_search_input').on('keyup', function () {
        medDispPerformerTable.search(this.value).draw();
    });

    $(document).on('click', '#addMedDispPerformerBtn', function() {
        $('#medDispPerformerAddModal').modal('show');
    });

    $(document).on('click', '#saveMedDispPerformerBtn', function() {
        var code = $('#add_med_disp_performer_code').val();
        var system = $('#add_med_disp_performer_system').val();
        var display = $('#add_med_disp_performer_display').val();
        var definition = $('#add_med_disp_performer_definition').val();

        if (code == '' || system == '' || display == '' || definition == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                code: code, 
                system: system,
                display: display,
                definition: definition
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedDispPerformer", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medDispPerformerTable.ajax.reload();
                    }, 1000 );
    
                    $('#add_med_disp_performer_code').val('');
                    $('#add_med_disp_performer_system').val('');
                    $('#add_med_disp_performer_display').val('');
                    $('#add_med_disp_performer_definition').val('');
                    $('#medDispPerformerAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medDispPerformerEditBtn', function() {
        $('#medDispPerformerEditModal').modal('show');
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedDispPerformerById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_disp_performer_id').val(result[0]['id']);
                $('#edit_med_disp_performer_code').val(result[0]['code']);
                $('#edit_med_disp_performer_system').val(result[0]['system']);
                $('#edit_med_disp_performer_display').val(result[0]['display']);
                $('#edit_med_disp_performer_definition').val(result[0]['definition']);                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedDispPerformerBtn', function() {      
        let entry = {
            id: $('#edit_med_disp_performer_id').val(),           
            code: $('#edit_med_disp_performer_code').val(),
            system: $('#edit_med_disp_performer_system').val(),
            display: $('#edit_med_disp_performer_display').val(),
            definition: $('#edit_med_disp_performer_definition').val()            
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedDispPerformerById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medDispPerformerTable.ajax.reload();
                }, 1000 );
                $('#edit_med_disp_performer_id').val(''),           
                $('#edit_med_disp_performer_code').val('');
                $('#edit_med_disp_performer_system').val('');
                $('#edit_med_disp_performer_display').val('');
                $('#edit_med_disp_performer_definition').val('');                
                $('#medDispPerformerEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });   
    
    $(document).on("click", ".medDispPerformerDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedDispPerformer", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medDispPerformerTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    
});