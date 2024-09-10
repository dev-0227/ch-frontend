$(document).ready(function() {
    "use strict";
    // Medications Status Table
    var medStatusTable = $('#medStatusTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedStatus",
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
                    <button class="btn btn-sm btn-primary badge medStatusEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge medStatusDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#medstatus_search_input').on('keyup', function () {
        medStatusTable.search(this.value).draw();
    });

    // Medications Form Table
    var medFormTable = $('#medFormTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedForm",
            "type": "GET"
        },
        "order": [[3, 'asc']],
        "columns": [
            {data: 'code'},
            {data: 'system'},
            {data: 'display'},
            { data: 'id',
                render: function (data, type, row) {
                  return `
                    <div class="btn-group align-top" idkey="`+row.id+`">
                      <button class="btn btn-sm btn-primary badge medFormEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger badge medFormDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  `
                } 
            }
        ]
    });

    $('#medform_search_input').on('keyup', function () {
        medFormTable.search(this.value).draw();
    });

    // Medications Codes Table
    var medCodesTable = $('#medCodesTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedCodes",
            "type": "GET"
        },
        "order": [[3, 'asc']],
        "columns": [
            {data: 'code'},
            {data: 'system'},
            {data: 'display'},
            { data: 'id',
                render: function (data, type, row) {
                  return `
                    <div class="btn-group align-top" idkey="`+row.id+`">
                      <button class="btn btn-sm btn-primary badge medCodesEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger badge medCodesDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  `
                } 
            }
        ]
    });

    $('#medcodes_search_input').on('keyup', function () {
        medCodesTable.search(this.value).draw();
    });

    // Med Status 
    $(document).on('click', '#addMedStatusBtn', function() {
        $('#medStatusAddModal').modal('show');
    });

    $(document).on('click', '#saveMedStatusBtn', function() {
        var med_status_code = $('#add_med_status_code').val();
        var med_status_system = $('#add_med_status_system').val();
        var med_status_display = $('#add_med_status_display').val();
        var med_status_definition = $('#add_med_status_definition').val();
        if (med_status_code == '' || med_status_system == '' || med_status_display == '' || med_status_definition == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                med_status_code: $('#add_med_status_code').val(),
                med_status_system: $('#add_med_status_system').val(),
                med_status_display: $('#add_med_status_display').val(),
                med_status_definition: $('#add_med_status_definition').val()
            }
    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedStatus", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medStatusTable.ajax.reload();
                    }, 1000 );
    
                    $('#add_med_status_code').val('');
                    $('#add_med_status_system').val('');
                    $('#add_med_status_display').val('');
                    $('#add_med_status_definition').val('');
                    $('#medStatusAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medStatusEditBtn', function() {
        $('#medStatusEditModal').modal('show');
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedStatusById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_status_id').val(result[0]['id']);
                $('#edit_med_status_code').val(result[0]['code']);
                $('#edit_med_status_system').val(result[0]['system']);
                $('#edit_med_status_display').val(result[0]['display']);
                $('#edit_med_status_definition').val(result[0]['definition']);                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedStatusBtn', function() {      
        let entry = {
            id: $('#edit_med_status_id').val(),           
            code: $('#edit_med_status_code').val(),
            system: $('#edit_med_status_system').val(),
            display: $('#edit_med_status_display').val(),
            definition: $('#edit_med_status_definition').val()            
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedStatusById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medStatusTable.ajax.reload();
                }, 1000 );
                $('#edit_med_status_id').val(''),           
                $('#edit_med_status_code').val('');
                $('#edit_med_status_system').val('');
                $('#edit_med_status_display').val('');
                $('#edit_med_status_definition').val('');                
                $('#medStatusEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });   
    
    $(document).on("click", ".medStatusDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedStatus", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medStatusTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    // Med Form
    $(document).on('click', '#addMedFormBtn', function() {
        $('#medFormAddModal').modal('show');
    });

    $(document).on('click', '#saveMedFormBtn', function() {
        var code = $('#add_med_form_code').val();
        var system = $('#add_med_form_system').val();
        var display = $('#add_med_form_display').val();
        
        if (code == '' || system == '' || display == '') {
            toastr.error("Action Failed");
            alert()
        } else {
            let entry = {
                code: code,
                system: system,
                display: display,                
            }                
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedForm", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medFormTable.ajax.reload();
                    }, 1000 );    
                    $('#add_med_form_code').val('');
                    $('#add_med_form_system').val('');
                    $('#add_med_form_display').val('');
                    $('#medFormAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medFormEditBtn', function() {
        $('#medFormEditModal').modal('show');

        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedFormById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_form_id').val(result[0]['id']);
                $('#edit_med_form_code').val(result[0]['code']);
                $('#edit_med_form_system').val(result[0]['system']);
                $('#edit_med_form_display').val(result[0]['display']);
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedFormBtn', function() {      
        let entry = {
            id: $('#edit_med_form_id').val(),           
            code: $('#edit_med_form_code').val(),
            system: $('#edit_med_form_system').val(),
            display: $('#edit_med_form_display').val(),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedFormById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medFormTable.ajax.reload();
                }, 1000 );
                $('#edit_med_form_id').val(''),           
                $('#edit_med_form_code').val('');
                $('#edit_med_form_system').val('');
                $('#edit_med_form_display').val('');             
                $('#medFormEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    }); 

    $(document).on("click", ".medFormDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedForm", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medFormTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });
    
    // Med Codes
    $(document).on('click', '#addMedCodesBtn', function() {
        $('#medCodesAddModal').modal('show');        
    });
    $(document).on('click', '#saveMedCodesBtn', function() {
        var code = $('#add_med_codes_code').val();
        var system = $('#add_med_codes_system').val();
        var display = $('#add_med_codes_display').val();
        
        if (code == '' || system == '' || display == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                code: code,
                system: system,
                display: display,                
            }                
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedCodes", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medCodesTable.ajax.reload();
                    }, 1000 );    
                    $('#add_med_codes_code').val('');
                    $('#add_med_codes_system').val('');
                    $('#add_med_codes_display').val('');
                    $('#medCodesAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });
    $(document).on('click', '.medCodesEditBtn', function() {
        $('#medCodesEditModal').modal('show');
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedCodesById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_codes_id').val(result[0]['id']);
                $('#edit_med_codes_code').val(result[0]['code']);
                $('#edit_med_codes_system').val(result[0]['system']);
                $('#edit_med_codes_display').val(result[0]['display']);
            } else {
                return toastr.error("Action Failed");
            }
        });
    });
    $(document).on("click", ".medCodesDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedCodes", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medCodesTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });
    $(document).on('click', '#updateMedCodesBtn', function() {      
        let entry = {
            id: $('#edit_med_codes_id').val(),           
            code: $('#edit_med_codes_code').val(),
            system: $('#edit_med_codes_system').val(),
            display: $('#edit_med_codes_display').val(),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedCodesById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medCodesTable.ajax.reload();
                }, 1000 );
                $('#edit_med_codes_id').val(''),           
                $('#edit_med_codes_code').val('');
                $('#edit_med_codes_system').val('');
                $('#edit_med_codes_display').val('');             
                $('#medCodesEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });
    
    
});