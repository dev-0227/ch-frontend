$(document).ready(function() {
    "use strict";
    
    // Medications Dispense Status Table
    var medReqStatusTable = $('#medReqStatusTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedReqStatus",
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
                    <button class="btn btn-sm btn-primary badge medReqStatusEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge medReqStatusDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#medReqStatus_search_input').on('keyup', function () {
        medReqStatusTable.search(this.value).draw();
    });

    $(document).on('click', '#addMedReqStatusBtn', function() {
        $('#medReqStatusAddModal').modal('show');
    });

    $(document).on('click', '#saveMedReqStatusBtn', function() {
        var code = $('#add_med_req_status_code').val();
        var system = $('#add_med_req_status_system').val();
        var display = $('#add_med_req_status_display').val();
        var definition = $('#add_med_req_status_definition').val();

        if (code == '' || system == '' || display == '' || definition == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                code: code, 
                system: system,
                display: display,
                definition: definition
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedReqStatus", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqStatusTable.ajax.reload();
                    }, 1000 );
    
                    $('#add_med_req_status_code').val('');
                    $('#add_med_req_status_system').val('');
                    $('#add_med_req_status_display').val('');
                    $('#add_med_req_status_definition').val('');
                    $('#medReqStatusAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medReqStatusEditBtn', function() {
        $('#medReqStatusEditModal').modal('show');
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedReqStatusById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_req_status_id').val(result[0]['id']);
                $('#edit_med_req_status_code').val(result[0]['code']);
                $('#edit_med_req_status_system').val(result[0]['system']);
                $('#edit_med_req_status_display').val(result[0]['display']);
                $('#edit_med_req_status_definition').val(result[0]['definition']);                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedReqStatusBtn', function() {      
        let entry = {
            id: $('#edit_med_req_status_id').val(),           
            code: $('#edit_med_req_status_code').val(),
            system: $('#edit_med_req_status_system').val(),
            display: $('#edit_med_req_status_display').val(),
            definition: $('#edit_med_req_status_definition').val()            
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedReqStatusById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medReqStatusTable.ajax.reload();
                }, 1000 );
                $('#edit_med_req_status_id').val(''),           
                $('#edit_med_req_status_code').val('');
                $('#edit_med_req_status_system').val('');
                $('#edit_med_req_status_display').val('');
                $('#edit_med_req_status_definition').val('');                
                $('#medReqStatusEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });   
    
    $(document).on("click", ".medReqStatusDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedReqStatus", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqStatusTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    // Medications Request Priority Table
    var medReqPriorityTable = $('#medReqPriorityTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedReqPriority",
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
                      <button class="btn btn-sm btn-primary badge medReqPriorityEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger badge medReqPriorityDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  `
                } 
            }
        ]
    });

    $('#medReqPriority_search_input').on('keyup', function () {
        medReqPriorityTable.search(this.value).draw();
    });

    $(document).on('click', '#addMedReqPriorityBtn', function() {
        $('#medReqPriorityAddModal').modal('show');
    });

    $(document).on('click', '#saveMedReqPriorityBtn', function() {
        var code = $('#add_med_req_priority_code').val();
        var system = $('#add_med_req_priority_system').val();
        var display = $('#add_med_req_priority_display').val();
        var definition = $('#add_med_req_priority_definition').val();

        if (code == '' || system == '' || display == '' || definition == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                code: code, 
                system: system,
                display: display,
                definition: definition
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedReqPriority", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqPriorityTable.ajax.reload();
                    }, 1000 );
    
                    $('#add_med_req_priority_code').val('');
                    $('#add_med_req_priority_system').val('');
                    $('#add_med_req_priority_display').val('');
                    $('#add_med_req_priority_definition').val('');
                    $('#medReqPriorityAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medReqPriorityEditBtn', function() {
        $('#medReqPriorityEditModal').modal('show');
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedReqPriorityById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_req_priority_id').val(result[0]['id']);
                $('#edit_med_req_priority_code').val(result[0]['code']);
                $('#edit_med_req_priority_system').val(result[0]['system']);
                $('#edit_med_req_priority_display').val(result[0]['display']);
                $('#edit_med_req_priority_definition').val(result[0]['definition']);                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedReqPriorityBtn', function() {      
        let entry = {
            id: $('#edit_med_req_priority_id').val(),           
            code: $('#edit_med_req_priority_code').val(),
            system: $('#edit_med_req_priority_system').val(),
            display: $('#edit_med_req_priority_display').val(),
            definition: $('#edit_med_req_priority_definition').val()            
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedReqPriorityById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medReqPriorityTable.ajax.reload();
                }, 1000 );
                $('#edit_med_req_priority_id').val(''),           
                $('#edit_med_req_priority_code').val('');
                $('#edit_med_req_priority_system').val('');
                $('#edit_med_req_priority_display').val('');
                $('#edit_med_req_priority_definition').val('');                
                $('#medReqPriorityEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });   
    
    $(document).on("click", ".medReqPriorityDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedReqPriority", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqPriorityTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    // Medications Request Intent Table
    var medReqIntentTable = $('#medReqIntentTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedReqIntent",
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
                      <button class="btn btn-sm btn-primary badge medReqIntentEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger badge medReqIntentDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  `
                } 
            }
        ]
    });

    $('#medReqIntent_search_input').on('keyup', function () {
        medReqIntentTable.search(this.value).draw();
    });

    $(document).on('click', '#addMedReqIntentBtn', function() {
        $('#medReqIntentAddModal').modal('show');
    });

    $(document).on('click', '#saveMedReqIntentBtn', function() {
        var code = $('#add_med_req_intent_code').val();
        var system = $('#add_med_req_intent_system').val();
        var display = $('#add_med_req_intent_display').val();
        var definition = $('#add_med_req_intent_definition').val();

        if (code == '' || system == '' || display == '' || definition == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                code: code, 
                system: system,
                display: display,
                definition: definition
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedReqIntent", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqIntentTable.ajax.reload();
                    }, 1000 );
    
                    $('#add_med_req_intent_code').val('');
                    $('#add_med_req_intent_system').val('');
                    $('#add_med_req_intent_display').val('');
                    $('#add_med_req_intent_definition').val('');
                    $('#medReqIntentAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medReqIntentEditBtn', function() {
        $('#medReqIntentEditModal').modal('show');
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedReqIntentById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_req_intent_id').val(result[0]['id']);
                $('#edit_med_req_intent_code').val(result[0]['code']);
                $('#edit_med_req_intent_system').val(result[0]['system']);
                $('#edit_med_req_intent_display').val(result[0]['display']);
                $('#edit_med_req_intent_definition').val(result[0]['definition']);                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedReqIntentBtn', function() {      
        let entry = {
            id: $('#edit_med_req_intent_id').val(),           
            code: $('#edit_med_req_intent_code').val(),
            system: $('#edit_med_req_intent_system').val(),
            display: $('#edit_med_req_intent_display').val(),
            definition: $('#edit_med_req_intent_definition').val()            
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedReqIntentById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medReqIntentTable.ajax.reload();
                }, 1000 );
                $('#edit_med_req_intent_id').val(''),           
                $('#edit_med_req_intent_code').val('');
                $('#edit_med_req_intent_system').val('');
                $('#edit_med_req_intent_display').val('');
                $('#edit_med_req_intent_definition').val('');                
                $('#medReqIntentEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });   
    
    $(document).on("click", ".medReqIntentDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedReqIntent", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqIntentTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    // Medications Request Course Therapy Table
    var medReqCourseTable = $('#medReqCourseTable').DataTable({
        "ajax": {
            "url": serviceUrl + "medadherance/getMedReqCourse",
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
                      <button class="btn btn-sm btn-primary badge medReqCourseEditBtn" type="button">
                        <i class="fa fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger badge medReqCourseDelBtn" type="button">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  `
                } 
            }
        ]
    });

    $('#medReqCourse_search_input').on('keyup', function () {
        medReqCourseTable.search(this.value).draw();
    });

    $(document).on('click', '#addMedReqCourseBtn', function() {
        $('#medReqCourseAddModal').modal('show');
    });

    $(document).on('click', '#saveMedReqCourseBtn', function() {
        var code = $('#add_med_req_course_code').val();
        var system = $('#add_med_req_course_system').val();
        var display = $('#add_med_req_course_display').val();
        var definition = $('#add_med_req_course_definition').val();

        if (code == '' || system == '' || display == '' || definition == '') {
            toastr.error("Action Failed");
        } else {
            let entry = {
                code: code, 
                system: system,
                display: display,
                definition: definition
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/addMedReqCourse", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqCourseTable.ajax.reload();
                    }, 1000 );
    
                    $('#add_med_req_course_code').val('');
                    $('#add_med_req_course_system').val('');
                    $('#add_med_req_course_display').val('');
                    $('#add_med_req_course_definition').val('');
                    $('#medReqCourseAddModal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.medReqCourseEditBtn', function() {
        $('#medReqCourseEditModal').modal('show');
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/getMedReqCourseById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_med_req_course_id').val(result[0]['id']);
                $('#edit_med_req_course_code').val(result[0]['code']);
                $('#edit_med_req_course_system').val(result[0]['system']);
                $('#edit_med_req_course_display').val(result[0]['display']);
                $('#edit_med_req_course_definition').val(result[0]['definition']);                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#updateMedReqCourseBtn', function() {      
        let entry = {
            id: $('#edit_med_req_course_id').val(),           
            code: $('#edit_med_req_course_code').val(),
            system: $('#edit_med_req_course_system').val(),
            display: $('#edit_med_req_course_display').val(),
            definition: $('#edit_med_req_course_definition').val()            
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/updateMedReqCourseById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    medReqCourseTable.ajax.reload();
                }, 1000 );
                $('#edit_med_req_course_id').val(''),           
                $('#edit_med_req_course_code').val('');
                $('#edit_med_req_course_system').val('');
                $('#edit_med_req_course_display').val('');
                $('#edit_med_req_course_definition').val('');                
                $('#medReqCourseEditModal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });   
    
    $(document).on("click", ".medReqCourseDelBtn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "medadherance/delMedReqCourse", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        medReqCourseTable.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });
    
});