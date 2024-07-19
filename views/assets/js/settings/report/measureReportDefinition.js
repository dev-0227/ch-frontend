$(document).ready(function() {
    "use strict";
    // Cut Point Table
    var cut_point_table = $('#cut_point_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetCutPointList",
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
    

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/getInsuranceList", (xhr, err) => {
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
        // program_OQS_table.ajax.reload(null, false); 
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

        sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/getInsuranceList", (xhr, err) => {
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









    //
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
    // specific_incentive_type_table
    
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
    //specific cutpoint measure

    var specific_cutpoint_measure_table = $('#specific_cutpoint_measure_table').DataTable({
        "ajax": {
            "url": serviceUrl + "reportBuilder/GetSpecificCutpointMeasureList",
            "type": "GET"
        },
        "order": [[0, 'asc']],
        "columns": [
            { 
                data: 'measure',
                render: function (data, type, row) {
                    var measure = row.measure;
                    var measure = measure.match(/.{1,40}/g).join('<br />');
                    return `<span>` + measure + `</span>`;
                } 
            },
            { data: 'quality_id'},
            { data: 'clinic'},
            { data: 'report'},
            { data: 'cutpoint'},
            { data: 'measure_range'},
            { data: 'active'},
            { data: 'created_date'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge update_specific_cutpoint_measure" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge del_specific_cutpoint_measure" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetMeasureNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#add_specific_cutpoint_measure_name').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    }); 

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetClinicNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#add_specific_cutpoint_measure_clinic').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    });       
    
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetReportNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#add_specific_cutpoint_measure_report').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    });  

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetCutpointNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#add_specific_cutpoint_measure_cutpoint').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    });  

    //
    $('#add_specific_cutpoint_measure_name').change(function() {         
        let params = {
            id: $('#add_specific_cutpoint_measure_name option:selected').val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/GetMeasureQualityId", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                 
                $('#add_specific_cutpoint_measure_quality_id').val(result[0].measureId);
            } else {  
                return toastr.error("Action Failed");
            }
        });
    });

    
    $(document).on('click', '#add_specific_cutpoint_measure', function() {        
        $('#add_specific_cutpoint_measure_modal').modal('show');
    });

    $(document).on('click', '#save_specific_cutpoint_measure', function() {

        var measure = $('#add_specific_cutpoint_measure_name').val();
        var clinic = $('#add_specific_cutpoint_measure_clinic').val();
        var report = $('#add_specific_cutpoint_measure_report').val();
        var cutpoint = $('#add_specific_cutpoint_measure_cutpoint').val();
        var range = $('#add_specific_cutpoint_measure_range').val();
        var active = $('#add_specific_cutpoint_measure_active').val();
        var created_date = $('#add_specific_cutpoint_measure_date').val();
        
        

        if ( measure == '' || clinic == '' || report == '' || cutpoint == '' || range == null || active == '' || created_date == '') {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                measure: measure, 
                clinic: clinic, 
                report: report,
                cutpoint: cutpoint,
                range: range,
                active: active,
                created_date: created_date
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/AddSpecificCutpointMeasureItem", (xhr, err) => {
                if (!err) {
                    // setTimeout( function () {
                    //     specific_cutpoint_measure_table.ajax.reload();
                    // }, 1000 );
                    specific_cutpoint_measure_table.ajax.reload();
                    $('#add_specific_cutpoint_measure_name').val(null);
                    $('#add_specific_cutpoint_measure_clinic').val(null);
                    $('#add_specific_cutpoint_measure_report').val(null);
                    $('#add_specific_cutpoint_measure_cutpoint').val(null);
                    $('#add_specific_cutpoint_measure_range').val('');
                    $('#add_specific_cutpoint_measure_active').val(null);
                    $('#add_specific_cutpoint_measure_date').val('')
                    $('#add_specific_cutpoint_measure_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".del_specific_cutpoint_measure", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/DelSpecificCutpointMeasureItem", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        specific_cutpoint_measure_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });


    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetMeasureNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#edit_specific_cutpoint_measure_name').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    }); 

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetClinicNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#edit_specific_cutpoint_measure_clinic').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    });       
    
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetReportNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#edit_specific_cutpoint_measure_report').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    });  

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "reportBuilder/GetCutpointNameList", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            let content = "";
            content += '<option></option>';
            result.forEach(r => {                               
                content += '<option value="'+ r.id +'">' + r.name + '</option>';                                        
            }); 
            $('#edit_specific_cutpoint_measure_cutpoint').html(content);

            
        } else {  
            return toastr.error("Action Failed");
        }
    });  

    $('#edit_specific_cutpoint_measure_name').change(function() {     
        let params = {
            id: $('#edit_specific_cutpoint_measure_name option:selected').val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/GetMeasureQualityId", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                 
                $('#edit_specific_cutpoint_measure_quality_id').val(result[0].measureId);
            } else {  
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '.update_specific_cutpoint_measure', function() {        

        var row = specific_cutpoint_measure_table.row($(this).parents('tr')).data();
        
        $('#edit_specific_cutpoint_measure_id').val(row.id);
        $('#edit_specific_cutpoint_measure_quality_id').val(row.quality_id);        

        let params = {
            id: row.id
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/GetSpecificCutpointMeasureById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                $('#edit_specific_cutpoint_measure_name').val(result[0]['measure_id']).trigger('change');
                $('#edit_specific_cutpoint_measure_clinic').val(result[0]['clinic_id']).trigger('change');
                $('#edit_specific_cutpoint_measure_report').val(result[0]['report_id']).trigger('change');
                $('#edit_specific_cutpoint_measure_cutpoint').val(result[0]['cutpoint_id']).trigger('change');
                $('#edit_specific_cutpoint_measure_range').val(result[0]['measure_range']);
                $('#edit_specific_cutpoint_measure_active').val(result[0]['active']).trigger('change');                
                $('#edit_specific_cutpoint_measure_date').val(result[0]['create_date']);       
                $('#edit_specific_cutpoint_measure_modal').modal('show');
                
            } else {  
                return toastr.error("Action Failed");
            }
        });         
    });

    $(document).on('click', '#update_specific_cutpoint_measure', function() {

        var id = $('#edit_specific_cutpoint_measure_id').val();
        var measure = $('#edit_specific_cutpoint_measure_name').val();
        var clinic = $('#edit_specific_cutpoint_measure_clinic').val();
        var report = $('#edit_specific_cutpoint_measure_report').val();
        var cutpoint = $('#edit_specific_cutpoint_measure_cutpoint').val();
        var range = $('#edit_specific_cutpoint_measure_range').val();
        var active = $('#edit_specific_cutpoint_measure_active').val();
        var created_date = $('#edit_specific_cutpoint_measure_date').val();
        
        if ( measure == '' || clinic == '' || report == '' || cutpoint == '' || range == '' || active == '' || created_date == '') {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                id: id,
                measure: measure,                 
                clinic: clinic, 
                report: report,
                cutpoint: cutpoint,
                range: range,
                active: active,
                created_date: created_date
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/UpdateSpecificCutpointMeasureItem", (xhr, err) => {
                if (!err) {
                    specific_cutpoint_measure_table.ajax.reload();
                    
                    $('#edit_specific_cutpoint_measure_id').val('');
                    $('#edit_specific_cutpoint_measure_name').val(null);
                    $('#edit_specific_cutpoint_measure_clinic').val(null);
                    $('#edit_specific_cutpoint_measure_report').val(null);
                    $('#edit_specific_cutpoint_measure_cutpoint').val(null);
                    $('#edit_specific_cutpoint_measure_range').val('');
                    $('#edit_specific_cutpoint_measure_active').val(null);
                    $('#edit_specific_cutpoint_measure_date').val('')
                    $('#edit_specific_cutpoint_measure_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });
});