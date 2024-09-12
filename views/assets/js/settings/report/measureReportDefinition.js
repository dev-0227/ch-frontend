function singleCheck(checkbox) {
    let checkboxes = document.querySelectorAll('#measure_table .form-check-input');
    checkboxes.forEach(function(item) {
        if (item !== checkbox) {
            item.checked = false; // Uncheck other checkboxes
        }
    });
}

function GetInsurance(callback) {
    const authToken = localStorage.getItem('authToken');
    const requestData = {};
    const apiUrl = 'reportBuilder/insurances';
  
    sendRequestWithToken('GET', authToken, requestData, apiUrl, (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];  
        let resArr = [{id: '', text: 'Select Insurance'}];                      
        result.forEach(r => {                                                                              
            resArr.push({ id: r.id, text: r.insName });
        });    
          callback(resArr);        
      } else {  
          toastr.error("Get Insurances Failed");
          callback(null);
      }
    });
  }

function GetClinics(callback) {
    const authToken = localStorage.getItem('authToken');
    const requestData = {};
    const apiUrl = 'reportBuilder/clinics';

    sendRequestWithToken('GET', authToken, requestData, apiUrl, (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];  
            let resArr = [{id: '', text: 'Select Clinic'}];                             
            result.forEach(r => {                                                         
                resArr.push({ id: r.id, text: r.name });
            });               
              callback(resArr);        
        } else {  
              toastr.error("Get Clinic Name Failed");
              callback(null);
        }       
    });  
}

function GetReports(id, callback) {
    const authToken = localStorage.getItem('authToken');
    const requestData = {ins_id: id};
    const apiUrl = 'reportBuilder/reports';

    sendRequestWithToken('POST', authToken, requestData, apiUrl, (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];  
            let resArr = [{id: '', text: 'Select Quality Programs'}];                             
            result.forEach(r => {                                                         
                resArr.push({ id: r.id, text: r.name });
            });               
              callback(resArr);        
        } else {  
              toastr.error("Get Quality Programs Failed");
              callback(null);
        }       
    });  
}

$(document).ready(function() {
    "use strict";
   
    $('#add_measure_program_cutpoint_report').select2({
        dropdownParent: $('#add_measure_program_cutpoint_modal')
    });
    // $('#loadingModal').modal('show');

    // window.onload = function() {
    //     $('#loadingModal').modal('hide');
    // };

    // Cut Point Table
    var cut_point_table = $('#cut_point_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetCutPointList",
            "type": "GET"
        },
        "order": [[0, 'asc']],
        "columns": [
            { data: 'display'},
            { data: 'active'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge update_cut_point_table" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge del_cut_point_table" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#cut_point_search_input').on('keyup', function () {
        cut_point_table.search(this.value).draw();
    });
    
    $(document).on('click', '#add_cut_point', function() {
        
        $('#add_cut_point_modal').modal('show');
    });

    $(document).on('click', '#save_cut_point', function() {
        var display = $('#add_cut_point_display').val();
        var target_rate = $('#add_cut_point_target_rate').val();
        var active = $('#add_cut_point_active').val();        

        if ( display == '' || target_rate == '' || active == null) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                display: display, 
                target_rate: target_rate,
                active: active
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/AddCutPointItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        cut_point_table.ajax.reload();
                    }, 1000 );
                    $('#add_cut_point_display').val('');
                    $('#add_cut_point_target_rate').val('');
                    $('#add_cut_point_active').val('');
                    $('#add_cut_point_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".del_cut_point_table", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/DelCutPointItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        cut_point_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.update_cut_point_table', function() {        
        var row = cut_point_table.row($(this).parents('tr')).data();
        
        $('#edit_cut_point_id').val(row.id); 
        $('#edit_cut_point_display').val(row.display);      
        $('#edit_cut_point_target_rate').val(row.target_rate); 
        $('#edit_cut_point_active').val(row.active);    
        $('#edit_cut_point_active').prop('selected', row.active).trigger('change');
        $('#edit_cut_point_modal').modal('show');

    });

    $(document).on('click', '#update_cut_point', function() {      
        let entry = {
            id: $('#edit_cut_point_id').val(),                             
            display: $('#edit_cut_point_display').val(),       
            target_rate: $('#edit_cut_point_target_rate').val(), 
            active: $('#edit_cut_point_active').val(), 
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/UpdateCutPointItem", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    cut_point_table.ajax.reload();
                }, 1000 );       
                $('#edit_cut_point_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });  

    // Overall Quality Score
    var overall_quality_score_table = $('#overall_quality_score_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetOverallQualityScoreList",
            "type": "GET"
        },
        "order": [[0, 'asc']],
        "columns": [
            { data: 'display'},
            { data: 'target_rate'},
            { data: 'active'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge update_overall_quality_score" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge del_overall_quality_score" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#overall_quality_score_search_input').on('keyup', function () {
        overall_quality_score_table.search(this.value).draw();
    });
    
    $(document).on('click', '#add_overall_quality_score', function() {
        $('#add_overall_quality_score_modal').modal('show');
    });

    $(document).on('click', '#save_overall_quality_score', function() {
        var display = $('#add_overall_quality_score_display').val();
        var target_rate = $('#add_overall_quality_score_target_rate').val();
        var active = $('#add_overall_quality_score_active').val();        

        if ( display == '' || target_rate == '' || active == null) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                display: display, 
                target_rate: target_rate,
                active: active
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/AddOverallQualityScoreItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        overall_quality_score_table.ajax.reload();
                    }, 1000 );
                    $('#add_overall_quality_score_display').val('');
                    $('#add_overall_quality_score_target_rate').val('');
                    $('#add_overall_quality_score_active').val(null).trigger('change');
                    $('#add_overall_quality_score_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".del_overall_quality_score", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/DelOverallQualityScoreItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        overall_quality_score_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.update_overall_quality_score', function() {        
        var row = overall_quality_score_table.row($(this).parents('tr')).data();
        
        $('#edit_overall_quality_score_id').val(row.id); 
        $('#edit_overall_quality_score_display').val(row.display);      
        $('#edit_overall_quality_score_target_rate').val(row.target_rate); 
        $('#edit_overall_quality_score_active').val(row.active);    
        $('#edit_overall_quality_score_active').prop('selected', row.active).trigger('change');
        $('#edit_overall_quality_score_modal').modal('show');

    });

    $(document).on('click', '#update_overall_quality_score', function() {      
        let entry = {
            id: $('#edit_overall_quality_score_id').val(),                             
            display: $('#edit_overall_quality_score_display').val(),       
            target_rate: $('#edit_overall_quality_score_target_rate').val(), 
            active: $('#edit_overall_quality_score_active').val(), 
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/UpdateOverallQualityScoreItem", (xhr, err) => {
            if (!err) {
                overall_quality_score_table.ajax.reload();
                $('#edit_overall_quality_score_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });  

    // Program Overall Quality Score    
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/insurances", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option value="0">Select Insurance</option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.insName + '</option>';                                        
            }); 
            $('#select_ins').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    });

    $('#select_ins').change(function() {        
        let params = {
            ins_id:  $('#select_ins').val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/getQualityProgramList", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                let content = "";
                content += '<option value="0">Select Program</option>';
                result.forEach(r => {                               
                    content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
                }); 
                $('#select_program').html(content);    
                
            } else {  
                return toastr.error("Action Failed");
            }
        });

    });
      
    $('#select_program').change(function() {        
        program_OQS_table.ajax.reload(null, false); 
    });

    var program_OQS_table = $('#program_OQS_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetProgramOQSList",
            "type": "POST",
            "data": function () {
                return {
                    quality_program_id: $('#select_program').val(),
                };
            }
        },
        // "order": [[0, 'asc']],
        "columns": [
            { data: 'program_name'},
            { data: 'overall_quality_score'},
            { data: 'target_rate'},
            { data: 'paid_OQS'},
            { data: 'date'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge update_program_OQS" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge del_program_OQS" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#program_OQS_search_input').on('keyup', function () {
        program_OQS_table.search(this.value).draw();
    });
    
    $(document).on('click', '#add_program_OQS', function() {
        // $('#add_OQS_program_name').val($('#select_program option:selected').text());
        // $('#add_OQS_program_ins_name').val($('#select_ins option:selected').text());

        sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/insurances", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                let content = "";
                content += '<option value="0">Select Insurance</option>';
                result.forEach(r => {                               
                    content += '<option value="'+ r.id +'">' + r.insName + '</option>';                                        
                }); 
                $('#add_OQS_program_ins_name').html(content);
            } else {  
                return toastr.error("Action Failed");
            }
        });
        
        sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetOverallQualityScoreList", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                let content = "";
                content += '<option value="0">Select Overall Quality Score</option>';
                result.forEach(r => {                               
                    content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
                }); 
                $('#add_OQS_overall_quality_score').html(content);
    
                
            } else {  
                return toastr.error("Action Failed");
            }
        });

        
        $('#add_program_OQS_modal').modal('show');
    });

    $('#add_OQS_program_ins_name').change(function() {        
        // program_OQS_table.ajax.reload(null, false); 
        let params = {
            ins_id:  $('#add_OQS_program_ins_name').val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/getQualityProgramList", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                let content = "";
                content += '<option value="0">Select Program</option>';
                result.forEach(r => {                               
                    content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
                }); 
                $('#add_OQS_program_name').html(content);    
                
            } else {  
                return toastr.error("Action Failed");
            }
        });

    });

    $('#add_OQS_overall_quality_score').change(function() { 
        // console.log($('#add_OQS_overall_quality_score option:selected').val());
        let params = {
            id: $('#add_OQS_overall_quality_score option:selected').val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/GetOverallQualityScoreItme", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                 
                $('#add_OQS_target_rate').val(result[0].target_rate);
            } else {  
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#save_program_OQS', function() {
        var quality_program_id = $('#add_OQS_program_name option:selected').val();
        var paid_OQS = $('#add_OQS_amount').val();
        var date = $('#add_OQS_date').val();
        var OQS_id =  $('#add_OQS_overall_quality_score option:selected').val();

        if ( $('#add_OQS_program_name').val() == '' ||  $('#add_OQS_target_rate').val() == '' ||  $('#add_OQS_date').val() == '' || $('#add_OQS_amount').val() == '') {
            toastr.error("Please enter complete information");
        } else {
            let params = {
                quality_program_id: quality_program_id, 
                paid_OQS: paid_OQS,
                date: date,
                OQS_id: OQS_id
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/AddProgramOQSItem", (xhr, err) => {
                if (!err) {
                    program_OQS_table.ajax.reload();
                    $('#add_OQS_amount').val('');
                    $('#add_OQS_program_name').val('');                    
                    $('#add_OQS_overall_quality_score').val(null);
                    $('#add_OQS_target_rate').val('');
                    $('#add_OQS_date').val('');
                    $('#add_program_OQS_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".del_program_OQS", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/DelProgramOQSItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        program_OQS_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.update_program_OQS', function() {       
        
        sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetOverallQualityScoreList", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                let content = "";
                content += '<option value="0">Select Overall Quality Score</option>';
                result.forEach(r => {                               
                    content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
                }); 
                $('#edit_OQS_overall_quality_score').html(content);
            } else {  
                return toastr.error("Action Failed");
            }
        }); 

        var row = program_OQS_table.row($(this).parents('tr')).data();

        $('#edit_OQS_id').val(row.id); 
        $('#edit_OQS_program_ins_name').val($('#select_ins option:selected').text());

        $('#edit_OQS_program_name').val($('#select_program option:selected').text());

        $('#edit_overall_quality_score_display').val(row.display);      
       
        $('#edit_OQS_overall_quality_score').val(4).trigger('change');
        
        $('#edit_OQS_target_rate').val(row.target_rate); 
        $('#edit_OQS_amount').val(row.paid_OQS); 
        $('#edit_OQS_date').val(row.date); 
        
        $('#edit_program_OQS_modal').modal('show');
    });
    
    $('#edit_OQS_overall_quality_score').change(function() { 
        // console.log($('#add_OQS_overall_quality_score option:selected').val());
        let params = {
            id: $('#edit_OQS_overall_quality_score option:selected').val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/GetOverallQualityScoreItme", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                 
                $('#edit_OQS_target_rate').val(result[0].target_rate);
            } else {  
                return toastr.error("Action Failed");
            }
        });
    })

    // $(document).on('click', '#update_overall_quality_score', function() {      
    //     let entry = {
    //         id: $('#edit_overall_quality_score_id').val(),                             
    //         display: $('#edit_overall_quality_score_display').val(),       
    //         target_rate: $('#edit_overall_quality_score_target_rate').val(), 
    //         active: $('#edit_overall_quality_score_active').val(), 
    //     }
    //     sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/UpdateOverallQualityScoreItem", (xhr, err) => {
    //         if (!err) {
    //             overall_quality_score_table.ajax.reload();
    //             $('#edit_overall_quality_score_modal').modal('hide');
    //         } else {
    //             return toastr.error("Action Failed");
    //         }
    //     });
    // });


    // Quarterly Measure Table
    var quarterly_measure_table = $('#quarterly_measure_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetQuarterlyMeasureList",
            "type": "GET"
        },
        "order": [[0, 'asc']],
        "columns": [
            { data: 'display'},
            { data: 'description'},
            { data: 'target_rate'},
            { data: 'active'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge update_quarterly_measure" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge del_quarterly_measure" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#quarterly_measure_search_input').on('keyup', function () {
        quarterly_measure_table.search(this.value).draw();
    });
    
    $(document).on('click', '#add_quarterly_measure', function() {
        $('#add_quarterly_measure_modal').modal('show');
    });

    $(document).on('click', '#save_quarterly_measure', function() {
        var display = $('#add_quarterly_measure_display').val();
        var description = $('#add_quarterly_measure_description').val();        
        var target_rate = $('#add_quarterly_measure_target_rate').val();
        var active = $('#add_quarterly_measure_active').val();        

        if ( display == '' || description == '' || target_rate == '' || active == null) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                display: display, 
                description: description,
                target_rate: target_rate,
                active: active
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/AddQuarterlyMeasureItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        quarterly_measure_table.ajax.reload();
                    }, 1000 );
                    $('#add_quarterly_measure_display').val('');
                    $('#add_quarterly_measure_description').val('');
                    $('#add_quarterly_measure_target_rate').val('');
                    $('#add_quarterly_measure_active').val(null);
                    $('#add_quarterly_measure_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".del_quarterly_measure", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/DelQuarterlyMeasureItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        quarterly_measure_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.update_quarterly_measure', function() {        
        var row = quarterly_measure_table.row($(this).parents('tr')).data();
        
        $('#edit_quarterly_measure_id').val(row.id); 
        $('#edit_quarterly_measure_display').val(row.display);      
        $('#edit_quarterly_measure_description').val(row.description); 
        $('#edit_quarterly_measure_target_rate').val(row.target_rate);    
        $('#edit_quarterly_measure_active').val(row.active);    
        $('#edit_quarterly_measure_active').prop('selected', row.active).trigger('change');
        $('#edit_quarterly_measure_modal').modal('show');

    });

    $(document).on('click', '#update_quarterly_measure', function() {      
        let entry = {
            id: $('#edit_quarterly_measure_id').val(),                             
            display: $('#edit_quarterly_measure_display').val(),       
            description: $('#edit_quarterly_measure_description').val(),       
            target_rate: $('#edit_quarterly_measure_target_rate').val(), 
            active: $('#edit_quarterly_measure_active').val(), 
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/UpdateQuarterlyMeasureItem", (xhr, err) => {
            if (!err) {
                quarterly_measure_table.ajax.reload();
                $('#edit_quarterly_measure_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    }); 

    // Specific Incentive Type Table    
    var specific_incentive_type_table = $('#specific_incentive_type_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetSpecificIncentiveTypeList",
            "type": "GET"
        },
        "order": [[0, 'asc']],
        "columns": [
            { data: 'code'},
            { data: 'display'},
            { data: 'description'},
            { data: 'formula'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge update_specific_incentive_type" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge del_specific_incentive_type" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#specific_incentive_type_search_input').on('keyup', function () {
        specific_incentive_type_table.search(this.value).draw();
    });
    
    $(document).on('click', '#add_specific_incentive_type', function() {
        $('#add_specific_incentive_type_modal').modal('show');
    });

    $(document).on('click', '#saveSpecificIncentiveType', function() {
        var code = $('#add_specific_incentive_type_code').val();
        var display= $('#add_specific_incentive_type_display').val();        
        var description = $('#add_specific_incentive_type_description').val();
        var formula = $('#add_specific_incentive_type_formula').val();        

        if ( code == '' || display == '' || description == '' || formula == null) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                code: code, 
                display: display, 
                description: description,
                formula: formula,
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/AddSpecificIncentiveTypeItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        specific_incentive_type_table.ajax.reload();
                    }, 1000 );
                    $('#add_specific_incentive_type_code').val('');
                    $('#add_specific_incentive_type_display').val('');
                    $('#add_specific_incentive_type_description').val('');
                    $('#add_specific_incentive_type_formula').val(null);
                    $('#add_specific_incentive_type_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".del_specific_incentive_type", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/DelSpecificIncentiveTypeItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        specific_incentive_type_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.update_specific_incentive_type', function() {        
        var row = specific_incentive_type_table.row($(this).parents('tr')).data();
        
        $('#edit_specific_incentive_type_id').val(row.id); 
        $('#edit_specific_incentive_type_code').val(row.code);
        $('#edit_specific_incentive_type_display').val(row.display);
        $('#edit_specific_incentive_type_description').val(row.description);
        $('#edit_specific_incentive_type_formula').val(row.formula);

        $('#edit_specific_incentive_type_modal').modal('show');

    });

    $(document).on('click', '#updateSpecificIncentiveType', function() {      
        let entry = {
            id: $('#edit_specific_incentive_type_id').val(),                             
            code: $('#edit_specific_incentive_type_code').val(),       
            display: $('#edit_specific_incentive_type_display').val(),       
            description: $('#edit_specific_incentive_type_description').val(), 
            formula: $('#edit_specific_incentive_type_formula').val(), 
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/UpdateSpecificIncentiveTypeItem", (xhr, err) => {
            if (!err) {
                specific_incentive_type_table.ajax.reload();
                $('#edit_specific_incentive_type_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    }); 

    // Get Report Name List 
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/reportName", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";            
            content += '<option value="" disabled selected>Select Quality Program</option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#add_specific_cutpoint_measure_report').html(content);   
            $('#edit_specific_cutpoint_measure_report').html(content);    
            $('#add_measure_program_cutpoint_report').html(content);      
            $('#edit_measure_program_cutpoint_report').html(content);  

        } else {  
            return toastr.error("Action Failed");
        }
    });  

    // Get Cutpoint Name List
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetCutpointNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";            
            content += '<option value="" disabled selected>Select CutPoint</option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#add_specific_measure_cutpoint_1').html(content);
            $('#add_specific_measure_cutpoint_2').html(content);
            $('#add_specific_measure_cutpoint_3').html(content);
            $('#add_specific_measure_cutpoint_4').html(content); 
            $('#add_specific_measure_cutpoint_5').html(content);

            $('#edit_specific_measure_cutpoint_1').html(content);
            $('#edit_specific_measure_cutpoint_2').html(content);
            $('#edit_specific_measure_cutpoint_3').html(content);
            $('#edit_specific_measure_cutpoint_4').html(content);
            $('#edit_specific_measure_cutpoint_5').html(content);

            $('#add_measure_program_cutpoint_1').html(content);   
            $('#add_measure_program_cutpoint_2').html(content);   
            $('#add_measure_program_cutpoint_3').html(content);   
            $('#add_measure_program_cutpoint_4').html(content);   
            $('#add_measure_program_cutpoint_5').html(content);   

            $('#edit_measure_program_cutpoint_1').html(content);   
            $('#edit_measure_program_cutpoint_2').html(content);   
            $('#edit_measure_program_cutpoint_3').html(content);   
            $('#edit_measure_program_cutpoint_4').html(content);   
            $('#edit_measure_program_cutpoint_5').html(content);   

        } else {  
            return toastr.error("Action Failed");
        }
    }); 

    // Measure Select
    var measure_table = $('#measure_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetMeasureNameList",
            "type": "GET"
        },
        "order": [[0, 'asc']],
        "columns": [
            { 
                data: 'id',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top" idkey="${row.id}">
                            <input class="form-check-input" type="checkbox" value="${row.id}" id="checkbox_${row.id}" onclick="singleCheck(this)">
                        </div>
                    `;
                }
            },
            { data: 'quality_id' },
            { data: 'name' }
        ]
    });

    $('#measure_search_input').on('keyup', function () {
        measure_table.search(this.value).draw();
    });

    let edit_flag = false;
    let specific_flag = true;

    $(document).on('click', '#add_specific_cutpoint_measure_select', function() {
        $('#select_measure_name_modal').modal('show');
        $("#add_specific_cutpoint_measure_modal").modal('hide');
        edit_flag = false;
        specific_flag = true;
    });

    $(document).on('click', '#edit_specific_cutpoint_measure_select', function() {
        $('#select_measure_name_modal').modal('show');
        $("#edit_specific_cutpoint_measure_modal").modal('hide');
        edit_flag = true;
        specific_flag = true;
    });

    $(document).on('click', '#add_measure_program_cutpoint_select', function() {     
        $('#select_measure_name_modal').modal('show');
        $("#add_measure_program_cutpoint_modal").modal('hide');
        edit_flag = false;
        specific_flag = false;
    });

    $(document).on('click', '#edit_measure_program_cutpoint_select', function() {
        $('#select_measure_name_modal').modal('show');
        $("#edit_measure_program_cutpoint_modal").modal('hide');
        edit_flag = true;
        specific_flag = false;
    });    
    
    $(document).on("click", "#measure_select_btn", function() {    
        var checkedRowData = null;
        $('#measure_table .form-check-input:checked').each(function() {
            var row = measure_table.row($(this).closest('tr')).data();
            checkedRowData = row;
        });
        if (checkedRowData) {      
            if (specific_flag) {
                if (edit_flag) {
                    $('#edit_specific_cutpoint_measure_name_id').val(checkedRowData.id);
                    $('#edit_specific_cutpoint_measure_name').val(checkedRowData.name);
                    $('#edit_specific_cutpoint_measure_quality_id').val(checkedRowData.quality_id);
                    $('#select_measure_name_modal').modal('hide');
                    $("#edit_specific_cutpoint_measure_modal").modal('show');
                } else {
                    $('#add_specific_measure_cutpoint_name_id').val(checkedRowData.id);
                    $('#add_specific_measure_cutpoint_name').val(checkedRowData.name);
                    $('#add_specific_measure_cutpoint_quality_id').val(checkedRowData.quality_id);
                    $('#select_measure_name_modal').modal('hide');
                    $("#add_specific_measure_cutpoint_modal").modal('show');
                }
            } else {
                if (edit_flag) {
                    $('#edit_measure_program_cutpoint_name_id').val(checkedRowData.id);
                    $('#edit_measure_program_cutpoint_name').val(checkedRowData.name);
                    $('#edit_measure_program_cutpoint_quality_id').val(checkedRowData.quality_id);
                    $('#select_measure_name_modal').modal('hide');
                    $("#edit_measure_program_cutpoint_modal").modal('show');
                   
                } else {
                    $('#add_measure_program_cutpoint_name_id').val(checkedRowData.id);
                    $('#add_measure_program_cutpoint_name').val(checkedRowData.name);
                    $('#add_measure_program_cutpoint_quality_id').val(checkedRowData.quality_id);
                    $('#select_measure_name_modal').modal('hide');
                    $("#add_measure_program_cutpoint_modal").modal('show');
                }
            }

            let checkboxes = document.querySelectorAll('#measure_table .form-check-input');
            checkboxes.forEach(function(item) {
                item.checked = false; 
            });

        } else {
            toastr.error("No Measure selected");
        }           
    });
    
    $(document).on('click', '#add_specific_measure_cutpoint_select', function() {     
        $('#select_measure_name_modal').modal('show');
        $("#add_specific_measure_cutpoint_modal").modal('hide');
        edit_flag = false;
        specific_flag = true;
    });


    // Specific Cutpoint Measure
    let specific_measure_cutpoint_table = $('#specific_measure_cutpoint_table').DataTable({
        ajax: {
            url: serviceUrl + "reportBuilder/specificMeasureCutpoint",
            type: "GET"
        },
        stripeClasses: [],
        paging: false,        
        // responsive: true,       
        // columnDefs: [
        //     { responsivePriority: 1, targets: 0 },
        //     { responsivePriority: 2, targets: -1 }
        // ],
        processing: true,
        responsive: {
            details: {
                renderer: function (api, rowIdx, columns) {
                    var data = $.map(columns, function (col, i) {
                        return col.hidden ?
                            '<tr data-dt-row="'+ col.rowIndex +'" data-dt-column="'+ col.columnIndex +'">'+
                                '<td style="width:25%; padding: 10px;"><strong>'+ col.title +'</strong></td>'+
                                '<td style="border-left: 1px solid #F1F1F4; text-align:center">'+ col.data +'</td>'+
                            '</tr>' : '';
                    }).join(''); 

                    return data ? $('<table/>').append(data) : false;
                }
            }
        },             
        "columns": [            
            { data: 'measure' },
            { data: 'quality_id' },
            { data: 'clinic' },
            { data: 'report' },            
            { data: 'cutpoint_1',
                render: function (data, type, row) {
                    if (row.cutpoint_1_range == null || row.cutpoint_1_range == '' || row.cutpoint_1_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_1}</span> | ${row.cutpoint_1_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_2',
                render: function (data, type, row) {
                    if (row.cutpoint_2_range == null || row.cutpoint_2_range == '' || row.cutpoint_2_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_2}</span> | ${row.cutpoint_2_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_3',
                render: function (data, type, row) {
                    if (row.cutpoint_3_range == null || row.cutpoint_3_range == '' || row.cutpoint_3_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_3}</span> | ${row.cutpoint_3_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_4',
                render: function (data, type, row) {
                    if (row.cutpoint_4_range == null || row.cutpoint_4_range == '' || row.cutpoint_4_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_4}</span> | ${row.cutpoint_4_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_5',
                render: function (data, type, row) {
                    if (row.cutpoint_5_range == null || row.cutpoint_5_range == '' || row.cutpoint_5_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_5}</span> | ${row.cutpoint_5_range}%`;
                    }                    
                } 
            },
            { data: 'payment_1_score'},
            { data: 'payment_2_score'},
            { data: 'payment_3_score'},
            { data: 'payment_4_score'},
            { data: 'payment_5_score'},          
            { data: 'active', 
                render: function (data, type, row) {
                    let active = row.active;                    
                    if (active == 'Enable') {
                        return `<span class="badge badge-success"> Active </span>`;
                    } else if (active == 'Disable'){
                        return `<span class="badge badge-danger"> Inactive </span>`;
                    }                    
                } 
            },
            { data: 'date'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="${row.id}">
                    <button class="btn btn-sm btn-primary badge update_specific_measure_cutpoint" type="button">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge delete_specific_measure_cutpoint" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });
    
    $('#specific_measure_cutpoint_search').on('keyup', function () {
        specific_measure_cutpoint_table.search(this.value).draw();
    });

    $(document).on("click", "#reload_specific_measure_cutpoint", function() {        
        specific_measure_cutpoint_table.ajax.reload();       
    });  
    
    $(document).on("change", "#add_insurance_name", function() {    
        $('#add_specific_measure_cutpoint_report').val(null).trigger('change'); 
        // let id = $(this).val();
        GetReports($(this).val(), (options) => {
          if (options) {        
            //   $('#add_quality_program_ins_lob').html(options);          
              $('#add_specific_measure_cutpoint_report').select2({
                
                data: options,
                dropdownParent: $('#add_specific_measure_cutpoint_modal .modal-body')
              }); 
          }
        });      
      });
    
    $(document).on('click', '#add_specific_measure_cutpoint', function() {        
        GetClinics((options) => {
            if (options) {        
                $('#add_specific_measure_cutpoint_clinic').select2({
                  data: options,
                  dropdownParent: $('#add_specific_measure_cutpoint_modal .modal-body')
                });         
            }
        });
        GetReports((options) => {
            if (options) {        
                $('#add_specific_measure_cutpoint_report').select2({
                  data: options,
                  dropdownParent: $('#add_specific_measure_cutpoint_modal .modal-body')
                });         
            }
        });

        GetInsurance((options) => {
            if (options) {        
                $('#add_insurance_name').select2({
                  data: options,
                  dropdownParent: $('#add_specific_measure_cutpoint_modal .modal-body')
                });         
            }
        });        
        

        $('#add_specific_measure_cutpoint_modal').modal('show');
    });

    $(document).on('click', '#save_specific_measure_cutpoint', function() {

        let clinic = $('#add_specific_measure_cutpoint_clinic').val();
        let measure = $('#add_specific_measure_cutpoint_name_id').val();
        let report = $('#add_specific_measure_cutpoint_report').val();
        let insurance = $('#add_insurance_name').val();
        
        let cutpoint1 = $('#add_specific_measure_cutpoint_1').val();
        let cutpoint1_range = $('#add_specific_measure_cutpoint_1_range').val();        
        
        let cutpoint2 = $('#add_specific_measure_cutpoint_2').val();
        let cutpoint2_range = $('#add_specific_measure_cutpoint_2_range').val();        
        
        let cutpoint3 = $('#add_specific_measure_cutpoint_3').val();
        let cutpoint3_range = $('#add_specific_measure_cutpoint_3_range').val();        
        
        let cutpoint4 = $('#add_specific_measure_cutpoint_4').val();
        let cutpoint4_range = $('#add_specific_measure_cutpoint_4_range').val();        
        
        let cutpoint5 = $('#add_specific_measure_cutpoint_5').val();
        let cutpoint5_range = $('#add_specific_measure_cutpoint_5_range').val();

        let payment1 = $('#add_specific_measure_payment_1_score').val();
        let payment2 = $('#add_specific_measure_payment_2_score').val();        
        let payment3 = $('#add_specific_measure_payment_3_score').val();
        let payment4 = $('#add_specific_measure_payment_4_score').val();
        let payment5 = $('#add_specific_measure_payment_5_score').val();
        
        let active = $('#add_specific_measure_cutpoint_active').val();
        let date = $('#add_specific_measure_cutpoint_date').val();
        
        if (measure == '') toastr.error('Please select Measure');        
        else if (clinic == null) toastr.error('Please select Clinic');        
        else if(report == null) toastr.error('Please select Report Name');
        else if(cutpoint1 == null) toastr.error('Please select Cutpoint 1');
        else if(cutpoint1_range == '') toastr.error('Please Input Range 1');
        else if(payment1 == '') toastr.error('Please Input Payment 1');
        else if(cutpoint2 == null) toastr.error('Please select Cutpoint 2');
        else if(cutpoint2_range == '') toastr.error('Please Input Range 2');
        else if(payment2 == '') toastr.error('Please Input Payment 2');
        else if(cutpoint3 == null) toastr.error('Please select Cutpoint 3');
        else if(cutpoint3_range == '') toastr.error('Please Input Range 3');
        else if(payment3 == '') toastr.error('Please Input Payment 3');
        else if(cutpoint4 == null) toastr.error('Please select Cutpoint 4');
        else if(cutpoint4_range == '') toastr.error('Please Input Range 4');
        else if(payment4 == '') toastr.error('Please Input Payment 4');
        else if(cutpoint5 == null) toastr.error('Please select Cutpoint 5');
        else if(cutpoint5_range == '') toastr.error('Please Input Range 5');
        else if(payment5 == '') toastr.error('Please Input Payment 5');
        else if(active == null) toastr.error('Please select Active');
        else if(date == '') toastr.error('Please select Date');               
        else {
            let entry = {
                clinic: clinic,
                measure: measure, 
                report: report,
                insurance: insurance,
                cutpoint1: cutpoint1,
                cutpoint1_range: cutpoint1_range,
                payment1: payment1,
                cutpoint2: cutpoint2,
                cutpoint2_range: cutpoint2_range,
                payment2: payment2,
                cutpoint3: cutpoint3,
                cutpoint3_range: cutpoint3_range,
                payment3: payment3,
                cutpoint4: cutpoint4,
                cutpoint4_range: cutpoint4_range,
                payment4: payment4,
                cutpoint5: cutpoint5,
                cutpoint5_range: cutpoint5_range,
                payment5: payment5,
                active: active,
                date: date
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/specificMeasureCutpoint", (xhr, err) => {
                if (!err) {
                    specific_measure_cutpoint_table.ajax.reload();

                    $('#add_measure_program_cutpoint_name_id').val('');
                    $('#add_measure_program_cutpoint_name').val('');
                    $('#add_measure_program_cutpoint_quality_id').val('');                    
                    $('#add_measure_program_cutpoint_report').val(null).trigger('change');

                    $('#add_measure_program_cutpoint_1').val(null).trigger('change');
                    $('#add_measure_program_cutpoint_range_1').val('');
                    $('#add_measure_program_cutpoint_payment_1').val('');
                    $('#add_measure_program_cutpoint_2').val(null).trigger('change');
                    $('#add_measure_program_cutpoint_range_2').val('');
                    $('#add_measure_program_cutpoint_payment_2').val('');
                    $('#add_measure_program_cutpoint_3').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_range_3').val('');
                    $('#add_measure_program_cutpoint_payment_3').val('');
                    $('#add_measure_program_cutpoint_4').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_range_4').val('');
                    $('#add_measure_program_cutpoint_payment_4').val('');
                    $('#add_measure_program_cutpoint_5').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_range_5').val('');
                    $('#add_measure_program_cutpoint_payment_5').val('');                  
                    $('#add_measure_program_cutpoint_active').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_date').val('');

                    $('#add_specific_measure_cutpoint_modal').modal('hide');

                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".delete_specific_measure_cutpoint", function() {
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
                sendRequestWithToken('DELETE', localStorage.getItem('authToken'), entry, "reportBuilder/specificMeasureCutpoint", (xhr, err) => {
                if (!err) {                    
                    specific_measure_cutpoint_table.ajax.reload();
                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $('#edit_insurance_name').on('change', function(){
        
        $('#edit_specific_measure_cutpoint_report').select2({                          
            data: [],
            dropdownParent: $('#edit_specific_measure_cutpoint_modal .modal-body')
          }); 

        GetReports($(this).val(), (options) => {
            if (options) {        
              //   $('#add_quality_program_ins_lob').html(options);          
                $('#edit_specific_measure_cutpoint_report').select2({                          
                  data: options,
                  dropdownParent: $('#edit_specific_measure_cutpoint_modal .modal-body')
                }); 
            }
        });
    });

    $(document).on('click', '.update_specific_measure_cutpoint', function() {

        let row = specific_measure_cutpoint_table.row($(this).parents('tr')).data();        
        
        $('#edit_specific_cutpoint_measure_id').val(row.id);
        $('#edit_specific_cutpoint_measure_quality_id').val(row.quality_id);        

        // let params = { id: row.id }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, `reportBuilder/specificMeasureCutpoint/${row.id}`, (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    

                $('#edit_specific_measure_cutpoint_id').val(result[0]['id']);       
                $('#edit_specific_measure_cutpoint_name_id').val(result[0]['measure_id']);  
                $('#edit_specific_measure_cutpoint_name').val(result[0]['title']);
                $('#edit_specific_measure_cutpoint_quality_id').val(result[0]['measureId']);
                
                GetClinics((options) => {
                    if (options) {        
                        $('#edit_specific_measure_cutpoint_clinic').select2({
                          data: options,
                          dropdownParent: $('#edit_specific_measure_cutpoint_modal .modal-body')
                        });         
                    }        
                      
                    $('#edit_specific_measure_cutpoint_clinic').val(result[0]['clinic_id']).trigger('change');      
                });

                GetInsurance((options) => {
                    if (options) {        
                        $('#edit_insurance_name').select2({
                          data: options,
                          dropdownParent: $('#edit_specific_measure_cutpoint_modal .modal-body')
                        });         
                    }        
                      
                    $('#edit_insurance_name').val(result[0]['insurance_id']).trigger('change');      
                });
                
                GetReports(result[0]['insurance_id'], (options) => {
                    if (options) {        
                      //   $('#add_quality_program_ins_lob').html(options);          
                        $('#edit_specific_measure_cutpoint_report').select2({                          
                          data: options,
                          dropdownParent: $('#edit_specific_measure_cutpoint_modal .modal-body')
                        }); 
                    }
                    $('#edit_specific_measure_cutpoint_report').val(result[0]['report_id']).trigger('change');  
                }); 

                
                $('#edit_specific_measure_cutpoint_1').val(result[0]['cutpoint_1_id']).trigger('change');
                $('#edit_specific_measure_cutpoint_1_range').val(result[0]['cutpoint_1_range']);
                $('#edit_specific_measure_cutpoint_2').val(result[0]['cutpoint_2_id']).trigger('change');
                $('#edit_specific_measure_cutpoint_2_range').val(result[0]['cutpoint_2_range']);
                $('#edit_specific_measure_cutpoint_3').val(result[0]['cutpoint_3_id']).trigger('change');
                $('#edit_specific_measure_cutpoint_3_range').val(result[0]['cutpoint_3_range']);
                $('#edit_specific_measure_cutpoint_4').val(result[0]['cutpoint_4_id']).trigger('change');
                $('#edit_specific_measure_cutpoint_4_range').val(result[0]['cutpoint_4_range']);
                $('#edit_specific_measure_cutpoint_5').val(result[0]['cutpoint_5_id']).trigger('change');
                $('#edit_specific_measure_cutpoint_5_range').val(result[0]['cutpoint_5_range']);

                $('#edit_specific_measure_payment_1_score').val(result[0]['payment_1_score']);
                $('#edit_specific_measure_payment_2_score').val(result[0]['payment_2_score']);
                $('#edit_specific_measure_payment_3_score').val(result[0]['payment_3_score']);
                $('#edit_specific_measure_payment_4_score').val(result[0]['payment_4_score']);
                $('#edit_specific_measure_payment_5_score').val(result[0]['payment_5_score']);
                

                $('#edit_specific_measure_cutpoint_active').val(result[0]['active']).trigger('change');                
                $('#edit_specific_measure_cutpoint_date').val(result[0]['date']);       

                $('#edit_specific_measure_cutpoint_modal').modal('show');                
            } else {  
                return toastr.error("Action Failed");
            }
        });         
    });

    $(document).on('click', '#update_specific_measure_cutpoint', function() {
        
        let id = $('#edit_specific_measure_cutpoint_id').val();
        let clinic = $('#edit_specific_measure_cutpoint_clinic').val();        
        let report = $('#edit_specific_measure_cutpoint_report').val();
        let insurance = $('#edit_insurance_name').val();
        
        let cutpoint1 = $('#edit_specific_measure_cutpoint_1').val();
        let cutpoint1_range = $('#edit_specific_measure_cutpoint_1_range').val();        
        
        let cutpoint2 = $('#edit_specific_measure_cutpoint_2').val();
        let cutpoint2_range = $('#edit_specific_measure_cutpoint_2_range').val();        
        
        let cutpoint3 = $('#edit_specific_measure_cutpoint_3').val();
        let cutpoint3_range = $('#edit_specific_measure_cutpoint_3_range').val();        
        
        let cutpoint4 = $('#edit_specific_measure_cutpoint_4').val();
        let cutpoint4_range = $('#edit_specific_measure_cutpoint_4_range').val();        
        
        let cutpoint5 = $('#edit_specific_measure_cutpoint_5').val();
        let cutpoint5_range = $('#edit_specific_measure_cutpoint_5_range').val();

        let payment1 = $('#edit_specific_measure_payment_1_score').val();
        let payment2 = $('#edit_specific_measure_payment_2_score').val();        
        let payment3 = $('#edit_specific_measure_payment_3_score').val();
        let payment4 = $('#edit_specific_measure_payment_4_score').val();
        let payment5 = $('#edit_specific_measure_payment_5_score').val();
        
        let active = $('#edit_specific_measure_cutpoint_active').val();
        let date = $('#edit_specific_measure_cutpoint_date').val();

        
        
        if (clinic == null) toastr.error('Please select Clinic');        
        else if(report == null) toastr.error('Please select Report Name');
        else if(insurance == null) toastr.error('Please select insurance Name');
        else if(cutpoint1 == null) toastr.error('Please select Cutpoint 1');
        else if(cutpoint1_range == '') toastr.error('Please Input Range 1');
        else if(payment1 == '') toastr.error('Please Input Payment 1');
        else if(cutpoint2 == null) toastr.error('Please select Cutpoint 2');
        else if(cutpoint2_range == '') toastr.error('Please Input Range 2');
        else if(payment2 == '') toastr.error('Please Input Payment 2');
        else if(cutpoint3 == null) toastr.error('Please select Cutpoint 3');
        else if(cutpoint3_range == '') toastr.error('Please Input Range 3');
        else if(payment3 == '') toastr.error('Please Input Payment 3');
        else if(cutpoint4 == null) toastr.error('Please select Cutpoint 4');
        else if(cutpoint4_range == '') toastr.error('Please Input Range 4');
        else if(payment4 == '') toastr.error('Please Input Payment 4');
        else if(cutpoint5 == null) toastr.error('Please select Cutpoint 5');
        else if(cutpoint5_range == '') toastr.error('Please Input Range 5');
        else if(payment5 == '') toastr.error('Please Input Payment 5');
        else if(active == null) toastr.error('Please select Active');
        else if(date == '') toastr.error('Please select Date');               
        else {
            let entry = {
                clinic: clinic,                
                report: report,
                insurance: insurance,
                cutpoint1: cutpoint1,
                cutpoint1_range: cutpoint1_range,
                payment1: payment1,
                cutpoint2: cutpoint2,
                cutpoint2_range: cutpoint2_range,
                payment2: payment2,
                cutpoint3: cutpoint3,
                cutpoint3_range: cutpoint3_range,
                payment3: payment3,
                cutpoint4: cutpoint4,
                cutpoint4_range: cutpoint4_range,
                payment4: payment4,
                cutpoint5: cutpoint5,
                cutpoint5_range: cutpoint5_range,
                payment5: payment5,
                active: active,
                date: date
            }    
            sendRequestWithToken('PUT', localStorage.getItem('authToken'), entry, `reportBuilder/specificMeasureCutpoint/${id}`, (xhr, err) => {
                if (!err) {
                    specific_measure_cutpoint_table.ajax.reload();
                    
                    $("#edit_specific_measure_cutpoint_id").val('');
                    $("#edit_specific_measure_cutpoint_name_id").val('');                    
                    
                    $("#edit_specific_measure_cutpoint_name").val('');
                    $("#edit_specific_measure_cutpoint_quality_id").val('');

                    $("#edit_specific_measure_cutpoint_clinic").val(null).trigger('change');
                    $("#edit_insurance_name").val(null).trigger('change');
                    $("#edit_specific_measure_cutpoint_report").val(null).trigger('change');      

                    $("#edit_specific_measure_cutpoint_1").val(null).trigger('change');
                    $("#edit_specific_measure_cutpoint_2").val(null).trigger('change');
                    $("#edit_specific_measure_cutpoint_3").val(null).trigger('change');
                    $("#edit_specific_measure_cutpoint_4").val(null).trigger('change');
                    $("#edit_specific_measure_cutpoint_5").val(null).trigger('change');

                    $("#edit_specific_measure_cutpoint_1_range").val('');
                    $("#edit_specific_measure_cutpoint_2_range").val('');
                    $("#edit_specific_measure_cutpoint_3_range").val('');
                    $("#edit_specific_measure_cutpoint_4_range").val('');
                    $("#edit_specific_measure_cutpoint_5_range").val('');

                    $("#edit_specific_measure_payment_1_score").val('');
                    $("#edit_specific_measure_payment_2_score").val('');
                    $("#edit_specific_measure_payment_3_score").val('');
                    $("#edit_specific_measure_payment_4_score").val('');
                    $("#edit_specific_measure_payment_5_score").val('');

                    $("#edit_specific_measure_cutpoint_active").val(null).trigger('change');
                    $("#edit_specific_measure_cutpoint_date").val('');

                    $("#edit_specific_measure_cutpoint_modal").modal('hide');
                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    
      
    // Measure Program Cutpoint
    let measure_program_cutpoint_table = $('#measure_program_cutpoint_table').DataTable({
        ajax: {
            url: serviceUrl + "reportBuilder/measureProgramCutpoint",
            type: "GET"
        },
        stripeClasses: [],
        paging: false,        
        // responsive: true,       
        // columnDefs: [
        //     { responsivePriority: 1, targets: 0 },
        //     { responsivePriority: 2, targets: -1 }
        // ],
        processing: true,
        responsive: {
            details: {
                renderer: function (api, rowIdx, columns) {
                    var data = $.map(columns, function (col, i) {
                        return col.hidden ?
                            '<tr data-dt-row="'+ col.rowIndex +'" data-dt-column="'+ col.columnIndex +'">'+
                                '<td style="width:25%; padding: 10px;"><strong>'+ col.title +'</strong></td>'+
                                '<td style="border-left: 1px solid #F1F1F4; text-align:center">'+ col.data +'</td>'+
                            '</tr>' : '';
                    }).join(''); 

                    return data ? $('<table/>').append(data) : false;
                }
            }
        },             
        "columns": [
            { data: 'measure' },
            { data: 'quality_id' },
            { data: 'report' },            
            { data: 'cutpoint_1',
                render: function (data, type, row) {
                    if (row.cutpoint_1_range == null || row.cutpoint_1_range == '' || row.cutpoint_1_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_1}</span> | ${row.cutpoint_1_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_2',
                render: function (data, type, row) {
                    if (row.cutpoint_2_range == null || row.cutpoint_2_range == '' || row.cutpoint_2_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_2}</span> | ${row.cutpoint_2_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_3',
                render: function (data, type, row) {
                    if (row.cutpoint_3_range == null || row.cutpoint_3_range == '' || row.cutpoint_3_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_3}</span> | ${row.cutpoint_3_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_4',
                render: function (data, type, row) {
                    if (row.cutpoint_4_range == null || row.cutpoint_4_range == '' || row.cutpoint_4_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_4}</span> | ${row.cutpoint_4_range}%`;
                    }                    
                } 
            },
            { data: 'cutpoint_5',
                render: function (data, type, row) {
                    if (row.cutpoint_5_range == null || row.cutpoint_5_range == '' || row.cutpoint_5_range == 0) {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px;">${row.cutpoint_5}</span> | ${row.cutpoint_5_range}%`;
                    }                    
                } 
            },
            { data: 'payment_1_score'},
            { data: 'payment_2_score'},
            { data: 'payment_3_score'},
            { data: 'payment_4_score'},
            { data: 'payment_5_score'},          
            { data: 'active', 
                render: function (data, type, row) {
                    let active = row.active;                    
                    if (active == 'Enable') {
                        return `<span class="badge badge-success"> Active </span>`;
                    } else if (active == 'Disable'){
                        return `<span class="badge badge-danger"> Inactive </span>`;
                    }                    
                } 
            },
            { data: 'date'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="${row.id}">
                    <button class="btn btn-sm btn-primary badge update_measure_program_cutpoint" type="button">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge del_measure_program_cutpoint" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#measure_program_cutpoint_search_input').on('keyup', function () {
        measure_program_cutpoint_table.search(this.value).draw();
    });

    $(document).on('click', '#add_measure_program_cutpoint', function() {
        
        $('#add_measure_program_cutpoint_report').select2({
            dropdownParent: $('#add_measure_program_cutpoint_modal')
        });   

        $("#add_measure_program_cutpoint_modal").modal('show');
    });

    // $(document).on("change", "#add_measure_program_cutpoint_OQS", function() {
    //     var inputDiv = document.getElementById('add_OQS_weight_tag');
        
    //     if (this.checked) {
    //         inputDiv.style.display = 'block';            
    //     } else {
    //         inputDiv.style.display = 'none';
    //         $('#add_measure_program_cutpoint_OQS_weight').val('');            
    //     }
    // });

    $(document).on("change", "#edit_measure_program_cutpoint_OQS", function() {
        var inputDiv = document.getElementById('edit_OQS_weight_tag');
        
        if (this.checked) {
            inputDiv.style.display = 'block';            
        } else {
            inputDiv.style.display = 'none';            
            $('#edit_measure_program_cutpoint_OQS_weight').val('');            
        }
    });

    
    $(document).on('click', '#save_measure_program_cutpoint', function() {

        let measure = $('#add_measure_program_cutpoint_name_id').val();
        let report = $('#add_measure_program_cutpoint_report').val();
        
        let cutpoint1 = $('#add_measure_program_cutpoint_1').val();
        let cutpoint1_range = $('#add_measure_program_cutpoint_range_1').val();        
        
        let cutpoint2 = $('#add_measure_program_cutpoint_2').val();
        let cutpoint2_range = $('#add_measure_program_cutpoint_range_2').val();        
        
        let cutpoint3 = $('#add_measure_program_cutpoint_3').val();
        let cutpoint3_range = $('#add_measure_program_cutpoint_range_3').val();        
        
        let cutpoint4 = $('#add_measure_program_cutpoint_4').val();
        let cutpoint4_range = $('#add_measure_program_cutpoint_range_4').val();        
        
        let cutpoint5 = $('#add_measure_program_cutpoint_5').val();
        let cutpoint5_range = $('#add_measure_program_cutpoint_range_5').val();

        let payment1 = $('#add_measure_program_cutpoint_payment_1').val();
        let payment2 = $('#add_measure_program_cutpoint_payment_2').val();        
        let payment3 = $('#add_measure_program_cutpoint_payment_3').val();
        let payment4 = $('#add_measure_program_cutpoint_payment_4').val();
        let payment5 = $('#add_measure_program_cutpoint_payment_5').val();
        
        let active = $('#add_measure_program_cutpoint_active').val();
        let date = $('#add_measure_program_cutpoint_date').val();
        
        if (measure == '') toastr.error('Please select Measure');        
        else if(report == null) toastr.error('Please select Report Name');
        else if(cutpoint1 == null) toastr.error('Please select Cutpoint 1');
        else if(cutpoint1_range == '') toastr.error('Please Input Range 1');
        else if(payment1 == '') toastr.error('Please Input Payment 1');
        else if(cutpoint2 == null) toastr.error('Please select Cutpoint 2');
        else if(cutpoint2_range == '') toastr.error('Please Input Range 2');
        else if(payment2 == '') toastr.error('Please Input Payment 2');
        else if(cutpoint3 == null) toastr.error('Please select Cutpoint 3');
        else if(cutpoint3_range == '') toastr.error('Please Input Range 3');
        else if(payment3 == '') toastr.error('Please Input Payment 3');
        else if(cutpoint4 == null) toastr.error('Please select Cutpoint 4');
        else if(cutpoint4_range == '') toastr.error('Please Input Range 4');
        else if(payment4 == '') toastr.error('Please Input Payment 4');
        else if(cutpoint5 == null) toastr.error('Please select Cutpoint 5');
        else if(cutpoint5_range == '') toastr.error('Please Input Range 5');
        else if(payment5 == '') toastr.error('Please Input Payment 5');
        else if(active == null) toastr.error('Please select Active');
        else if(date == '') toastr.error('Please select Date');               
        else {
            let entry = {
                measure: measure, 
                report: report,
                cutpoint1: cutpoint1,
                cutpoint1_range: cutpoint1_range,
                payment1: payment1,
                cutpoint2: cutpoint2,
                cutpoint2_range: cutpoint2_range,
                payment2: payment2,
                cutpoint3: cutpoint3,
                cutpoint3_range: cutpoint3_range,
                payment3: payment3,
                cutpoint4: cutpoint4,
                cutpoint4_range: cutpoint4_range,
                payment4: payment4,
                cutpoint5: cutpoint5,
                cutpoint5_range: cutpoint5_range,
                payment5: payment5,
                active: active,
                date: date
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/measureProgramCutpoint", (xhr, err) => {
                if (!err) {
                    measure_program_cutpoint_table.ajax.reload();

                    $('#add_measure_program_cutpoint_name_id').val('');
                    $('#add_measure_program_cutpoint_name').val('');
                    $('#add_measure_program_cutpoint_quality_id').val('');                    
                    $('#add_measure_program_cutpoint_report').val(null).trigger('change');

                    $('#add_measure_program_cutpoint_1').val(null).trigger('change');
                    $('#add_measure_program_cutpoint_range_1').val('');
                    $('#add_measure_program_cutpoint_payment_1').val('');
                    $('#add_measure_program_cutpoint_2').val(null).trigger('change');
                    $('#add_measure_program_cutpoint_range_2').val('');
                    $('#add_measure_program_cutpoint_payment_2').val('');
                    $('#add_measure_program_cutpoint_3').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_range_3').val('');
                    $('#add_measure_program_cutpoint_payment_3').val('');
                    $('#add_measure_program_cutpoint_4').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_range_4').val('');
                    $('#add_measure_program_cutpoint_payment_4').val('');
                    $('#add_measure_program_cutpoint_5').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_range_5').val('');
                    $('#add_measure_program_cutpoint_payment_5').val('');                  
                    $('#add_measure_program_cutpoint_active').val(null).trigger('change');;
                    $('#add_measure_program_cutpoint_date').val('');

                    $('#add_measure_program_cutpoint_modal').modal('hide');

                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });
    
    $(document).on('click', '.update_measure_program_cutpoint', function() {
        let row = measure_program_cutpoint_table.row($(this).parents('tr')).data();        
        
        $('#edit_measure_program_cutpoint_id').val(row.id);
        $('#edit_measure_program_cutpoint_quality_id').val(row.quality_id);        

        

        sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, `reportBuilder/measureProgramCutpoint/${row.id}`, (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];  
                
                $('#edit_measure_program_cutpoint_id').val(result[0]['id']);
                $('#edit_measure_program_cutpoint_name_id').val(result[0]['measure_id']).trigger('change');
                $('#edit_measure_program_cutpoint_name').val(result[0]['title']);
                $('#edit_measure_program_cutpoint_quality_id').val(result[0]['measureId']);                
                $('#edit_measure_program_cutpoint_report').val(result[0]['report_id']).trigger('change');
                $('#edit_measure_program_cutpoint_1').val(result[0]['cutpoint_1_id']).trigger('change');
                $('#edit_measure_program_cutpoint_range_1').val(result[0]['cutpoint_1_range']);
                $('#edit_measure_program_cutpoint_payment_1').val(result[0]['payment_1_score']);
                $('#edit_measure_program_cutpoint_2').val(result[0]['cutpoint_2_id']).trigger('change');
                $('#edit_measure_program_cutpoint_range_2').val(result[0]['cutpoint_2_range']);
                $('#edit_measure_program_cutpoint_payment_2').val(result[0]['payment_2_score']);
                $('#edit_measure_program_cutpoint_3').val(result[0]['cutpoint_3_id']).trigger('change');
                $('#edit_measure_program_cutpoint_range_3').val(result[0]['cutpoint_3_range']);
                $('#edit_measure_program_cutpoint_payment_3').val(result[0]['payment_3_score']);
                $('#edit_measure_program_cutpoint_4').val(result[0]['cutpoint_4_id']).trigger('change');
                $('#edit_measure_program_cutpoint_range_4').val(result[0]['cutpoint_4_range']);
                $('#edit_measure_program_cutpoint_payment_4').val(result[0]['payment_4_score']);
                $('#edit_measure_program_cutpoint_5').val(result[0]['cutpoint_5_id']).trigger('change');
                $('#edit_measure_program_cutpoint_range_5').val(result[0]['cutpoint_5_range']);
                $('#edit_measure_program_cutpoint_payment_5').val(result[0]['payment_5_score']);             
                $('#edit_measure_program_cutpoint_active').val(result[0]['active']).trigger('change');                
                $('#edit_measure_program_cutpoint_date').val(result[0]['date']);       

                $('#edit_measure_program_cutpoint_modal').modal('show');                
            } else {  
                return toastr.error("Action Failed");
            }
        });         
    });
    
    $(document).on('click', '#update_measure_program_cutpoint', function() {
        let id = $('#edit_measure_program_cutpoint_id').val();
        let measure = $('#edit_measure_program_cutpoint_name_id').val();
        let report = $('#edit_measure_program_cutpoint_report').val();
        let cutpoint1 = $('#edit_measure_program_cutpoint_1').val();
        let range1 = $('#edit_measure_program_cutpoint_range_1').val();
        let payment1 = $('#edit_measure_program_cutpoint_payment_1').val();
        let cutpoint2 = $('#edit_measure_program_cutpoint_2').val();
        let range2 = $('#edit_measure_program_cutpoint_range_2').val();
        let payment2 = $('#edit_measure_program_cutpoint_payment_3').val();
        let cutpoint3 = $('#edit_measure_program_cutpoint_3').val();
        let range3 = $('#edit_measure_program_cutpoint_range_3').val();
        let payment3 = $('#edit_measure_program_cutpoint_payment_3').val();
        let cutpoint4 = $('#edit_measure_program_cutpoint_4').val();
        let range4 = $('#edit_measure_program_cutpoint_range_4').val();
        let payment4 = $('#edit_measure_program_cutpoint_payment_4').val();
        let cutpoint5 = $('#edit_measure_program_cutpoint_5').val();
        let range5 = $('#edit_measure_program_cutpoint_range_5').val();
        let payment5 = $('#edit_measure_program_cutpoint_payment_5').val();
        
        let active = $('#edit_measure_program_cutpoint_active').val();
        let date = $('#edit_measure_program_cutpoint_date').val();
        
        if ( measure == '') toastr.error('Please select Measure');        
        else if(report == null) toastr.error('Please select Report Name');
        else if(cutpoint1 == null) toastr.error('Please select Cutpoint 1');
        else if(range1 == '') toastr.error('Please Input Range 1');
        else if(payment1 == '') toastr.error('Please Input Payment 1');
        else if(cutpoint2 == null) toastr.error('Please select Cutpoint 2');
        else if(range2 == '') toastr.error('Please Input Range 2');
        else if(payment2 == '') toastr.error('Please Input Payment 2');
        else if(cutpoint3 == null) toastr.error('Please select Cutpoint 3');
        else if(range3 == '') toastr.error('Please Input Range 3');
        else if(payment3 == '') toastr.error('Please Input Payment 3');
        else if(cutpoint4 == null) toastr.error('Please select Cutpoint 4');
        else if(range4 == '') toastr.error('Please Input Range 4');
        else if(payment4 == '') toastr.error('Please Input Payment 4');
        else if(cutpoint5 == null) toastr.error('Please select Cutpoint 5');
        else if(range5 == '') toastr.error('Please Input Range 5');
        else if(payment5 == '') toastr.error('Please Input Payment 5');
        else if(active == null) toastr.error('Please select Active');
        else if(date == '') toastr.error('Please select Date');              
        else {
            let params = {
                measure: measure, 
                report: report,
                cutpoint1: cutpoint1,
                range1: range1,
                payment1: payment1,
                cutpoint2: cutpoint2,
                range2: range2,
                payment2: payment2,
                cutpoint3: cutpoint3,
                range3: range3,
                payment3: payment3,
                cutpoint4: cutpoint4,
                range4: range4,
                payment4: payment4,
                cutpoint5: cutpoint5,
                range5: range5,
                payment5: payment5,
                active: active,
                date: date
            }    
            sendRequestWithToken('PUT', localStorage.getItem('authToken'), params, `reportBuilder/measureProgramCutpoint/${id}`, (xhr, err) => {
                if (!err) {
                    measure_program_cutpoint_table.ajax.reload();
                    
                    $("#edit_specific_cutpoint_measure_id").val('');
                    $("#edit_measure_program_cutpoint_name_id").val('');
                    $("#edit_measure_program_cutpoint_name").val('');
                    $("#edit_measure_program_cutpoint_report").val(null).trigger('change');;                    
                    $("#edit_measure_program_cutpoint_1").val(null).trigger('change');
                    $("#edit_measure_program_cutpoint_range_1").val('');
                    $("#edit_measure_program_cutpoint_payment_1").val('');
                    $("#edit_measure_program_cutpoint_2").val(null).trigger('change');
                    $("#edit_measure_program_cutpoint_range_2").val('');
                    $("#edit_measure_program_cutpoint_payment_2").val('');
                    $("#edit_measure_program_cutpoint_3").val(null).trigger('change');
                    $("#edit_measure_program_cutpoint_range_3").val('');
                    $("#edit_measure_program_cutpoint_payment_3").val('');
                    $("#edit_measure_program_cutpoint_4").val(null).trigger('change');
                    $("#edit_measure_program_cutpoint_range_4").val('');
                    $("#edit_measure_program_cutpoint_payment_4").val('');
                    $("#edit_measure_program_cutpoint_5").val(null).trigger('change');
                    $("#edit_measure_program_cutpoint_range_5").val('');
                    $("#edit_measure_program_cutpoint_payment_5").val('');
                    $("#edit_measure_program_cutpoint_active").val(null).trigger('change');
                    $("#edit_measure_program_cutpoint_date").val('');

                    $("#edit_measure_program_cutpoint_modal").modal('hide');

                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".del_measure_program_cutpoint", function() {
        // let entry = {
        //     id: $(this).parent().attr("idkey"),
        // }
        let id = $(this).parent().attr("idkey");

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
                sendRequestWithToken('DELETE', localStorage.getItem('authToken'), {}, `reportBuilder/measureProgramCutpoint/${id}`, (xhr, err) => {
                if (!err) {                    
                    measure_program_cutpoint_table.ajax.reload();
                    toastr.success("Action Success");
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    
    $(document).on("click", "#reload_measure_program_cutpoint", function() {        
        measure_program_cutpoint_table.ajax.reload();       
    });   

    // Measure Attribution
    let measure_attr_table = $('#measure_attr_table').DataTable({
        ajax: {
            url: serviceUrl + "reportBuilder/GetMeasureAttrList",
            type: "GET"
        },
        stripeClasses: [],
        paging: false,
        ordering: false,
        info: false,
        layout: {
            topStart: {
                buttons: ['searchBuilder']
            }
        },
        order: [[2, 'desc']],
        columns: [
            { data: 'display'},
            { data: 'description'},
            { data: 'id',                
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+ row.id +`">
                    <button class="btn btn-sm btn-primary badge update_measure_attr" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge delete_measure_attr" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#measure_attr_search_input').on('keyup', function () {
        measure_attr_table.search(this.value).draw();
    });

    $(document).on("click", "#reload_measure_attr_btn", function() {
        measure_attr_table.ajax.reload();
    });

    $(document).on('click', '#new_measure_attr_btn', function() {
        $("#new_measure_attr_modal").modal('show');
    });
    
    $(document).on('click', '#new_measure_attr', function() {
        let display = $('#new_measure_attr_display').val();
        let description = $('#new_measure_attr_desc').val();
        
        if ( display == '' || description == '') {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                display: display, 
                description: description
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/NewMeasureAttrItem", (xhr, err) => {
                if (!err) {
                    measure_attr_table.ajax.reload();
                    $('#new_measure_attr_display').val('');
                    $('#new_measure_attr_desc').val('');
                    $('#new_measure_attr_modal').modal('hide');
                    toastr.success("Action Success");
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });
    

    $(document).on('click', '.update_measure_attr', function() {
        let row = measure_attr_table.row($(this).parents('tr')).data();
        
        $('#edit_measure_attr_id').val(row.id);
        $('#edit_measure_attr_display').val(row.display);
        $('#edit_measure_attr_desc').val(row.description);

        $("#edit_measure_attr_modal").modal('show');
    });

    $(document).on('click', '#update_measure_attr', function() {
        let id = $('#edit_measure_attr_id').val();
        let display = $('#edit_measure_attr_display').val();
        let description = $('#edit_measure_attr_desc').val();
        
        if ( display == '' || description == '') {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                id: id,
                display: display, 
                description: description
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/UpdateMeasureAttrItem", (xhr, err) => {
                if (!err) {
                    measure_attr_table.ajax.reload();                    
                    $('#edit_measure_attr_id').val('');
                    $('#edit_measure_attr_display').val('');
                    $('#edit_measure_attr_desc').val('');                    
                    $('#edit_measure_attr_modal').modal('hide');
                    toastr.success("Action Success");
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on('click', '.delete_measure_attr', function() {
        let params = {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/DeleteMeasureAttrItem", (xhr, err) => {
                if (!err) {                    
                    measure_attr_table.ajax.reload();
                    toastr.success("Action Success");
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

   
    
    
});