function singleCheck(checkbox) {
    let checkboxes = document.querySelectorAll('#measure_table .form-check-input');
    checkboxes.forEach(function(item) {
        if (item !== checkbox) {
            item.checked = false; 
        }
    });
}

function initCheck() {
    let checkboxes = document.querySelectorAll('#measure_table .form-check-input');
    checkboxes.forEach(function(item) {
        item.checked = false;
    });
}

function GetQualityProgram(callback) {
    const authToken = localStorage.getItem('authToken');
    const requestData = {};
    const apiUrl = 'reportBuilder/reportName';

    sendRequestWithToken('GET', authToken, requestData, apiUrl, (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];  
            let resArr = [{id: '', text: 'Select Quality Program'}];                             
            result.forEach(r => {                                                         
                resArr.push({ id: r.id, text: r.name });
            });               
              callback(resArr);        
        } else {  
              toastr.error("Get Quality Program Failed");
              callback(null);
        }       
    });  
}

function GetIncentiveType(callback) {
    const authToken = localStorage.getItem('authToken');
    const requestData = {};
    const apiUrl = 'reportBuilder/GetIncentiveType';

    sendRequestWithToken('GET', authToken, requestData, apiUrl, (xhr, err) => {   
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];  
            let resArr = [{id: '', text: 'Select Incentive Type'}];                             
            result.forEach(r => {                                                         
                resArr.push({ id: r.id, text: r.name });
            });               
              callback(resArr);        
          } else {  
              toastr.error("Get Incentive Type Failed");
              callback(null);
          }
    });
}

function GetMeasureCategory(callback) {
    const authToken = localStorage.getItem('authToken');
    const requestData = {};
    const apiUrl = 'reportBuilder/measureCategories';

    sendRequestWithToken('GET', authToken, requestData, apiUrl, (xhr, err) => {   
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];  
            let resArr = [{id: '', text: 'Select Measure Categories'}];                             
            result.forEach(r => {                                                         
                resArr.push({ id: r.id, text: r.name });
            });               
              callback(resArr);        
          } else {  
              toastr.error("Get Measure Categories Failed");
              callback(null);
          }
    });
}

function GetMeasureAttribute(callback) {
    const authToken = localStorage.getItem('authToken');
    const requestData = {};
    const apiUrl = 'reportBuilder/measureAttr';

    sendRequestWithToken('GET', authToken, requestData, apiUrl, (xhr, err) => {   
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];  
            let resArr = [{id: '', text: 'Select Measure Attribution'}];                             
            result.forEach(r => {                                                         
                resArr.push({ id: r.id, text: r.name });
            });               
              callback(resArr);        
          } else {  
              toastr.error("Get  Measure Attribution Failed");
              callback(null);
          }
    });
}

$(document).ready(function() {
    "use strict";


    var authToken = localStorage.getItem('authToken');
    
    let measure_table = $('#measure_table').DataTable({
        ajax: {
            url: serviceUrl + "reportBuilder/GetMeasureNameList",
            type: "GET"
        },        
        order: [[0, 'asc']],
        columns: [
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
    
    let edit_flag = 0;
    $(document).on('click', '#select_measure_name_btn', function() {
        $('#new_measure_modal').modal('hide');
        $('#select_measure_name_modal').modal('show');        
        edit_flag = 0;
    });

    $(document).on('click', '#edit_select_measure_name_btn', function() {
        $('#edit_measure_modal').modal('hide');
        $('#select_measure_name_modal').modal('show');
        edit_flag = 1;
    });
    
    $(document).on("click", "#measure_select_btn", function() {    
        let checkedRowData = null;
        $('#measure_table .form-check-input:checked').each(function() {
            let row = measure_table.row($(this).closest('tr')).data();
            checkedRowData = row;
        });

        console.log(checkedRowData);
        
        let params = {
            report_id: $('#hedis_report_builder_report_id').val(),
            measure_id: checkedRowData.id
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/CheckMeasureForSelect", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                 
                console.log(result[0].count);
                if (result[0].count > 0) {
                    toastr.error("Duplicate Measure");  
                } else {
                    if (checkedRowData) {   
                        if (edit_flag == 1) {
                            $('#edit_select_measure_id').val(checkedRowData.id);
                            $('#edit_select_measure_name').val(checkedRowData.name);
                            $('#edit_select_measure_quality_id').val(checkedRowData.quality_id);
                            $('#select_measure_name_modal').modal('hide');
                            $('#edit_measure_modal').modal('show');
                        } else {
                            $('#select_measure_id').val(checkedRowData.id);
                            $('#select_measure_name').val(checkedRowData.name);
                            $('#select_measure_quality_id').val(checkedRowData.quality_id);
                            $('#select_measure_name_modal').modal('hide');
                            $('#new_measure_modal').modal('show');
                            let checkboxes = document.querySelectorAll('#measure_table .form-check-input');
                            checkboxes.forEach(function(item) {
                                item.checked = false;
                            });
                        }                   
                    } else {
                        toastr.error("No Measure selected");
                    } 
                }
            } else {  
                return toastr.error("Action Failed");
            }
        });
        
    });    

    // done
    $(document).on("change", "#minimum_denominator_active", function() {        
        if (this.checked) {
            $('#minimum_denominator_value').prop('disabled', false);
        } else {            
            $('#minimum_denominator_value').prop('disabled', true);
            $('#minimum_denominator_value').val('');
        }
    });
    // done
    $(document).on("change", "#edit_minimum_denominator_active", function() {        
        if (this.checked) {
            $('#edit_minimum_denominator_value').prop('disabled', false);
        } else {            
            $('#edit_minimum_denominator_value').prop('disabled', true);
            $('#edit_minimum_denominator_value').val('');
        }
    });
    // done
    $(document).on("change", "#patient_incentive_active", function() {                
        if (this.checked) {
            $('#patient_incentive_value').prop('disabled', false);            
        } else {
            $('#patient_incentive_value').prop('disabled', true);
            $('#patient_incentive_value').val('');
        }
    });
    // done
    $(document).on("change", "#edit_patient_incentive_active", function() {                
        if (this.checked) {
            $('#edit_patient_incentive_value').prop('disabled', false);            
        } else {
            $('#edit_patient_incentive_value').prop('disabled', true);
            $('#edit_patient_incentive_value').val('');
        }
    });
    // done
    $(document).on("change", "#check_cutpoint_active", function() {        
        if (this.checked) {
            const params = {
                report_id: $('#quality_program_id').val(),
                measure_id: $('#select_measure_id').val()
            }
            sendRequestWithToken('POST', authToken, params, "reportBuilder/CheckMeasureCutpoint", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];          
                    if (result[0].count > 0) {                                                
                        $('.cpt').removeClass('d-none'); 
                        $('.cpt').addClass('d-block'); 
                        $('#cutpoint_1_value').val(result[0].cutpoint_1_range); 
                        $('#cutpoint_2_value').val(result[0].cutpoint_2_range); 
                        $('#cutpoint_3_value').val(result[0].cutpoint_3_range); 
                        $('#cutpoint_4_value').val(result[0].cutpoint_4_range); 
                        $('#cutpoint_5_value').val(result[0].cutpoint_5_range);                                                 
                    } else {          
                        $('#check_cutpoint_active').prop('checked', false);              
                        toastr.warning("No Data");                      
                    }    
                } else {  
                    $('#check_cutpoint_active').prop('checked', false); 
                    return toastr.error("Action Failed");                    
                }
            });      
        } else {
            $('.cpt').removeClass('d-block'); 
            $('.cpt').addClass('d-none'); 
            $('#cutpoint_1_value').val('');
            $('#cutpoint_1_active').prop('checked', false);
            $('#cutpoint_2_value').val('');
            $('#cutpoint_2_active').prop('checked', false);
            $('#cutpoint_3_value').val('');
            $('#cutpoint_3_active').prop('checked', false);
            $('#cutpoint_4_value').val('');
            $('#cutpoint_4_active').prop('checked', false);
            $('#cutpoint_5_value').val('');
            $('#cutpoint_5_active').prop('checked', false);
        }        
    });
    // done
    $(document).on("change", "#check_payment_active", function() {
        if (this.checked) {            
            const params = {
                report_id: $('#quality_program_id').val(),
                measure_id: $('#select_measure_id').val()
            }
            sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/CheckMeasureCutpoint", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];                                     
                    if (result[0].count > 0) {
                        $('.pay').removeClass('d-none'); 
                        $('.pay').addClass('d-block'); 
                        $('#pay_score_1_value').val(result[0].payment_1_score); 
                        $('#pay_score_2_value').val(result[0].payment_2_score); 
                        $('#pay_score_3_value').val(result[0].payment_3_score); 
                        $('#pay_score_4_value').val(result[0].payment_4_score); 
                        $('#pay_score_5_value').val(result[0].payment_5_score);                         
                    } else {          
                        $('#check_payment_active').prop('checked', false);              
                        toastr.warning("No Data");                      
                    }    
                } else {  
                    $('#check_payment_active').prop('checked', false); 
                    return toastr.error("Action Failed");                    
                }
            });            
        } else {
            $('.pay').removeClass('d-block'); 
            $('.pay').addClass('d-none'); 
            $('#pay_score_1_value').val('');
            $('#pay_score_1_active').prop('checked', false);
            $('#pay_score_2_value').val('');
            $('#pay_score_2_active').prop('checked', false);
            $('#pay_score_3_value').val('');
            $('#pay_score_3_active').prop('checked', false);
            $('#pay_score_4_value').val('');
            $('#pay_score_4_active').prop('checked', false);
            $('#pay_score_5_value').val('');
            $('#pay_score_5_active').prop('checked', false);
        }  
    });
    // done
    $(document).on("change", "#specific_improvement_active", function() {        
        if (this.checked) {
            const params = {
                report_id: $('#quality_program_id').val()
            }
            sendRequestWithToken('POST', authToken, params, "reportBuilder/CheckSpecificCutpointMeasure", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];                 
                    if (result[0].count > 0) {
                        $("#specific_improvement_value").val(result[0].name);   
                    } else {                        
                        $('#specific_improvement_active').prop('checked', false);                        
                        toastr.warning("No Data");  
                    }
                } else {  
                    return toastr.error("Action Failed");
                }
            });            
        } else {
            $("#specific_improvement_value").val('');
        }
    });
    // done
    $(document).on("change", "#cutpoint_score_active", function() {        
        if (this.checked) {
            const params = {
                report_id: $('#quality_program_id').val()
            }
            sendRequestWithToken('POST', authToken, params, "reportBuilder/CheckMeasureProgramCutpoint", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];                 
                    if (result[0].count > 0) {
                        $("#cutpoint_score_value").val(result[0].name);
                    } else {          
                        $('#cutpoint_score_active').prop('checked', false);              
                        toastr.warning("No Data");                      
                    }
                } else {  
                    return toastr.error("Action Failed");
                }
            });
        } else {
            $("#cutpoint_score_value").val('');
        }
    });  

    $(document).on("change", "#edit_specific_improvement_active", function() {        
        if (this.checked) {
            const params = {
                report_id: $('#quality_program_id').val()
            }
            sendRequestWithToken('POST', authToken, params, "reportBuilder/CheckSpecificCutpointMeasure", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];                 
                    if (result[0].count > 0) {
                        $("#edit_specific_improvement_value").val(result[0].name);   
                    } else {                        
                        $('#edit_specific_improvement_active').prop('checked', false);                        
                        toastr.warning("No Data");  
                    }
                } else {  
                    return toastr.error("Action Failed");
                }
            });            
        } else {
            $("#edit_specific_improvement_value").val('');
        }
    });

    $(document).on("change", "#edit_cutpoint_score_active", function() {        
        if (this.checked) {
            const params = {
                report_id: $('#quality_program_id').val()
            }
            sendRequestWithToken('POST', authToken, params, "reportBuilder/CheckMeasureProgramCutpoint", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];                 
                    if (result[0].count > 0) {
                        $("#edit_cutpoint_score_value").val(result[0].name);
                    } else {          
                        $('#edit_cutpoint_score_active').prop('checked', false);              
                        toastr.warning("No Data");                      
                    }
                } else {  
                    return toastr.error("Action Failed");
                }
            });
        } else {
            $("#edit_cutpoint_score_value").val('');
        }
    }); 

    $(document).on("change", "#edit_check_cutpoint_active", function() {        
        if (this.checked) {
            const params = {
                report_id: $('#quality_program_id').val(),
                measure_id: $('#edit_select_measure_id').val()
            }
            sendRequestWithToken('POST', authToken, params, "reportBuilder/CheckMeasureCutpoint", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];          
                    if (result[0].count > 0) {                                                
                        $('.edit_cpt').removeClass('d-none'); 
                        $('.edit_cpt').addClass('d-block'); 
                        $('#edit_cutpoint_1_value').val(result[0].cutpoint_1_range); 
                        $('#edit_cutpoint_2_value').val(result[0].cutpoint_2_range); 
                        $('#edit_cutpoint_3_value').val(result[0].cutpoint_3_range); 
                        $('#edit_cutpoint_4_value').val(result[0].cutpoint_4_range); 
                        $('#edit_cutpoint_5_value').val(result[0].cutpoint_5_range);                                                 
                    } else {          
                        $('#edit_check_cutpoint_active').prop('checked', false);              
                        toastr.warning("No Data");                      
                    }    
                } else {  
                    $('#edit_check_cutpoint_active').prop('checked', false); 
                    return toastr.error("Action Failed");                    
                }
            });      
        } else {
            $('.edit_cpt').removeClass('d-block'); 
            $('.edit_cpt').addClass('d-none'); 
            $('#edit_cutpoint_1_value').val('');
            $('#edit_cutpoint_1_active').prop('checked', false);
            $('#edit_cutpoint_2_value').val('');
            $('#edit_cutpoint_2_active').prop('checked', false);
            $('#edit_cutpoint_3_value').val('');
            $('#edit_cutpoint_3_active').prop('checked', false);
            $('#edit_cutpoint_4_value').val('');
            $('#edit_cutpoint_4_active').prop('checked', false);
            $('#edit_cutpoint_5_value').val('');
            $('#edit_cutpoint_5_active').prop('checked', false);

            $('#edit_tier_1_active').prop('checked', false);
            $('#edit_tier_2_active').prop('checked', false);
            $('#edit_tier_3_active').prop('checked', false);
            $('#edit_tier_4_active').prop('checked', false);
            $('#edit_tier_5_active').prop('checked', false);
        }        
    });
    // done
    $(document).on("change", "#edit_check_payment_active", function() {
        if (this.checked) {            
            const params = {
                report_id: $('#quality_program_id').val(),
                measure_id: $('#edit_select_measure_id').val()
            }
            sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/CheckMeasureCutpoint", (xhr, err) => {
                if (!err) {
                    const result = JSON.parse(xhr.responseText)['data'];                                     
                    if (result[0].count > 0) {
                        $('.edit_pay').removeClass('d-none'); 
                        $('.edit_pay').addClass('d-block'); 
                        $('#edit_pay_score_1_value').val(result[0].payment_1_score); 
                        $('#edit_pay_score_2_value').val(result[0].payment_2_score); 
                        $('#edit_pay_score_3_value').val(result[0].payment_3_score); 
                        $('#edit_pay_score_4_value').val(result[0].payment_4_score); 
                        $('#edit_pay_score_5_value').val(result[0].payment_5_score);                         
                    } else {          
                        $('#edit_check_payment_active').prop('checked', false);              
                        toastr.warning("No Data");                      
                    }    
                } else {  
                    $('#edit_check_payment_active').prop('checked', false); 
                    return toastr.error("Action Failed");                    
                }
            });            
        } else {
            $('.edit_pay').removeClass('d-block'); 
            $('.edit_pay').addClass('d-none'); 
            $('#edit_pay_score_1_value').val('');
            $('#edit_pay_score_1_active').prop('checked', false);
            $('#edit_pay_score_2_value').val('');
            $('#edit_pay_score_2_active').prop('checked', false);
            $('#edit_pay_score_3_value').val('');
            $('#edit_pay_score_3_active').prop('checked', false);
            $('#edit_pay_score_4_value').val('');
            $('#edit_pay_score_4_active').prop('checked', false);
            $('#edit_pay_score_5_value').val('');
            $('#edit_pay_score_5_active').prop('checked', false);
        }  
    });
     
    // done
    let quality_program_table = $('#quality_program_table').DataTable({
        ajax: {
            url : serviceUrl + "reportBuilder/hedisQualityProgram",
            type : "GET"
        },
        order: [[6, 'desc']],
        processing: true,
        paging: false,        
        stripeClasses: [],
        columns: [
            {   
                data: "insurance"
            },
            {   
                data: "name"
            },
            { 
                data : "start_date",
                width: '10%',
            },
            {
                data: "end_date",
                width: '10%',
            },
            {   
                data : "report_OQS",
                width: '8%',
                render: function (data, type, row) {
                    let report_OQS = row.report_OQS;                    
                    if (report_OQS == 1) {
                        return `<span class="badge badge-success">Active</span>`;
                    } else {
                        return `<span class="badge badge-danger">Inactive</span>`;
                    }                    
                } 
            },
            {   
                data : "OQS_used",
                width: '8%',
                render: function (data, type, row) {
                    let OQS_used = row.OQS_used;                    
                    if (OQS_used == 1) {
                        return `<span class="badge badge-success">Active</span>`;
                    } else {
                        return `<span class="badge badge-danger">Inactive</span>`;
                    }                    
                } 
            },
            {   
                data: 'id',
                width: '10%',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top" idkey="`+row.id+`">
                            <button class="btn btn-sm btn-primary badge show_report" type="button">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary badge show_measure" type="button">
                                <i class="fa fa-sitemap"></i>
                            </button>
                            <button class="btn btn-sm btn-primary badge update_hedis_report" type="button">
                                <i class="fa fa-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger badge delete_hedis_report" type="button">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    `
                } 
            }           
        ],
    });
    // done
    $('#hedis_quality_program_search').on('keyup', function () {
        quality_program_table.search(this.value).draw();
    });
    // done
    $(document).on("click", "#reload_quality_program", function() {        
        quality_program_table.ajax.reload();                
    });        
    // done
    $(document).on("click", "#add_quality_program", function() {               
        GetQualityProgram((options) => {
            if (options) {        
                $('#select_report_name').select2({
                  data: options,
                  dropdownParent: $('#New_report_modal')
                });         
            }
        });

        $('#New_report_modal').modal('show');             
    });
    // done 
    $(document).on("click", "#save_hedis_report", function() {                    
        let quality_program_id = $('#select_report_name').val();
        let start_date = $('#new_start_date').val();
        let end_date = $('#new_end_date').val();        
        let report_OQS = 0;
        let OQS_used = 0;
        
        if ($('#report_calculates_oqs').prop('checked')) {
            report_OQS = 1;
        } 

        if ($('#report_oqs_used').prop('checked')) {
            OQS_used = 1;
        } 

        if (quality_program_id == null) toastr.error('Please Select Report Name');        
        else if(start_date == '') toastr.error('Please Input Start Date');
        else if(end_date == '') toastr.error('Please Input End Date');
        else {
            let params = {
                quality_program_id: quality_program_id,
                start_date: start_date,
                end_date: end_date,
                report_OQS: report_OQS,
                OQS_used: OQS_used
            }        
            sendRequestWithToken('POST', authToken, params, "reportBuilder/hedisQualityProgram", (xhr, err) => {
                if (!err) {
                    quality_program_table.ajax.reload();             
                    $('#select_report_name').val(null).trigger('change');                
                    $('#new_start_date').val('');
                    $('#new_end_date').val('');
                    $('#report_calculates_oqs').prop('checked', false);
                    $('#report_oqs_used').prop('checked', false);
                    $('#New_report_modal').modal('hide');                    
                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }
    });
    // done
    $(document).on('click', '.update_hedis_report', function() {      
        let row = quality_program_table.row($(this).parents('tr')).data();             
        $('#edit_hedis_report_id').val(row.id); 
        GetQualityProgram((options) => {
            if (options) {        
                $('#edit_select_report_name').select2({
                  data: options,
                  dropdownParent: $('#edit_report_modal')
                });   

                $("#edit_select_report_name").val(row.quality_program_id).trigger('change');
            }
        });                
        $('#edit_start_date').val(row.start_date);
        $('#edit_end_date').val(row.end_date);
        if (row.report_OQS == 1) $('#edit_report_calculates_oqs').prop("checked", true);
        else $('#edit_report_calculates_oqs').prop("checked", false);
        if (row.OQS_used == 1) $('#edit_report_oqs_used').prop("checked", true);
        else $('#edit_report_oqs_used').prop("checked", false);      
        $('#edit_report_modal').modal('show');
    });
    // done
    $(document).on("click", "#update_hedis_report", function() {    
        let id = $('#edit_hedis_report_id').val(); 
        let report_id = $('#edit_select_report_name').val();
        let start_date = $('#edit_start_date').val();
        let end_date = $('#edit_end_date').val();        
        let report_OQS = 0;
        let OQS_used = 0;
        
        if ($('#edit_report_calculates_oqs').prop('checked')) {
            report_OQS = 1;
        } 

        if ($('#edit_report_oqs_used').prop('checked')) {
            OQS_used = 1;
        } 

        if ( report_id == null) toastr.error('Please select Report Name');        
        else if(start_date == '') toastr.error('Please Input Start Date');
        else if(end_date == '') toastr.error('Please Input End Date');
        else {
            let params = {
                report_id: report_id,
                start_date: start_date,
                end_date: end_date,
                report_OQS: report_OQS,
                OQS_used: OQS_used
            }        
            sendRequestWithToken('PUT', authToken, params, `reportBuilder/hedisQualityProgram/${id}`, (xhr, err) => {
                if (!err) {
                    quality_program_table.ajax.reload();             
                    $('#edit_select_report_name').val(null).trigger('change');                
                    $('#edit_start_date').val('');
                    $('#edit_end_date').val('');
                    $('#edit_report_calculates_oqs').prop('checked', false);
                    $('#edit_report_oqs_used').prop('checked', false);
                    $('#edit_report_modal').modal('hide');
                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }
    });   
    // done
    $(document).on("click", ".delete_hedis_report", function() {       
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
                sendRequestWithToken('DELETE', authToken, {}, `reportBuilder/hedisQualityProgram/${id}`, (xhr, err) => {
                    if (!err) {                    
                        quality_program_table.ajax.reload();                    
                        toastr.success("Action Success");
                    } else {
                        return toastr.error("Action Failed");
                    }
                });
            }
        });
    });   
    //done 
    $(document).on("click", ".show_measure", function() {     
        let row = quality_program_table.row($(this).parents('tr')).data();
        $('#report_name').html(row.name); 
        $('#hedis_report_builder_report_id').val(row.id); 
        $('#quality_program_id').val(row.quality_program_id);         
        quality_program_measure_table.ajax.reload();
        $('#report_part').css('display', 'none');
        $('#measure_part').css('display', 'block');
    });
    
    // done
    let quality_program_measure_table = $('#quality_program_measure_table').DataTable({        
        ajax: {
            url : serviceUrl + `reportBuilder/hedisMeasure`,            
            type : "POST",
            data : function () {
                return {
                    hedis_report_builder_report_id : $('#hedis_report_builder_report_id').val(), 
                };
            }          
        },
        processing: true,
        order: [[9, 'desc']],
        responsive: true,
        responsive: {
            details: {
                renderer: function (api, rowIdx, columns) {
                    var data = $.map(columns, function (col, i) {
                        return col.hidden ?
                            '<tr data-dt-row="'+ col.rowIndex +'" data-dt-column="'+ col.columnIndex +'">'+
                                '<td style="width:50%; padding: 10px;"><strong>'+ col.title +'</strong></td>'+
                                '<td style="border-left: 1px solid #F1F1F4; padding: 10px;">'+ col.data +'</td>'+
                            '</tr>' : '';
                    }).join(''); 
      
                    return data ? $('<table/>').append(data) : false;
                }
            }
          },
        columnDefs: [
            { responsivePriority: 1, targets: 0 },
            { responsivePriority: 2, targets: -1 }
        ],
        columns: [
            { 
                data : "measure"                
            },
            {
                data: "quality_id"
            },
            {
                data: "minimum_denominator_active",
                render: function(data, type, row) {
                    if (row.minimum_denominator_active == 1) {
                        return ` <span class="badge badge-success"> Active </span> | ${row.minimum_denominator_value}`
                    } else {
                        return ` <span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {   
                data : "dual_improvement_active",
                render: function (data, type, row) {
                    if (row.dual_improvement_active == 1) {
                        return `<span class="badge badge-success"> Active </span>`;
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`;
                    }                    
                } 
            },
            {
                data: "patient_incentive_active",
                render: function(data, type, row) {
                    if (row.patient_incentive_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | ${row.patient_incentive_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },            
            {
                data: "incentive_type",
                render: function(data, type, row) {
                    if (row.incentive_type == null || row.incentive_type == '') {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px">${row.incentive_type}</span>`
                    }
                }
            },           
            {
                data: "cutpoint_1_active",
                render: function(data, type, row) {
                    if (row.cutpoint_1_active == 1) {
                        return `<span class="badge badge-success"> Active </span> ${row.tier_1_active == 1 ? '| <span class="badge badge-primary"> Tier 1 </span>' : ''} | ${row.cutpoint_1_value == 0 ? '' : row.cutpoint_1_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "cutpoint_2_active",
                render: function(data, type, row) {
                    if (row.cutpoint_2_active == 1) {
                        return `<span class="badge badge-success"> Active </span> ${row.tier_2_active == 1 ? '| <span class="badge badge-primary"> Tier 2 </span>' : ''} | ${row.cutpoint_2_value == 0 ? '' : row.cutpoint_2_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "cutpoint_3_active",
                render: function(data, type, row) {
                    if (row.cutpoint_3_active == 1) {
                        return `<span class="badge badge-success"> Active </span> ${row.tier_3_active == 1 ? '| <span class="badge badge-primary"> Tier 3 </span>' : ''} | ${row.cutpoint_3_value == 0 ? '' : row.cutpoint_3_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "cutpoint_4_active",
                render: function(data, type, row) {
                    if (row.cutpoint_4_active == 1) {
                        return `<span class="badge badge-success"> Active </span> ${row.tier_4_active == 1 ? '| <span class="badge badge-primary"> Tier 4 </span>' : ''} | ${row.cutpoint_4_active == 0 ? '' : row.cutpoint_4_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "cutpoint_5_active",
                render: function(data, type, row) {
                    if (row.cutpoint_5_active == 1) {
                        return `<span class="badge badge-success"> Active </span> ${row.tier_5_active == 1 ? '| <span class="badge badge-primary"> Tier 5 </span>' : ''} | ${row.cutpoint_5_active == 0 ? '' : row.cutpoint_5_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "pay_score_1_active",
                render: function(data, type, row) {
                    if (row.pay_score_1_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | ${row.pay_score_1_value == 0 ? '' : row.pay_score_1_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "pay_score_2_active",
                render: function(data, type, row) {
                    if (row.pay_score_2_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | ${row.pay_score_2_value == 0 ? '' : row.pay_score_2_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "pay_score_3_active",
                render: function(data, type, row) {
                    if (row.pay_score_3_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | ${row.pay_score_3_value == 0 ? '' : row.pay_score_3_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "pay_score_4_active",
                render: function(data, type, row) {
                    if (row.pay_score_4_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | ${row.pay_score_4_value == 0 ? '' : row.pay_score_4_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "pay_score_5_active",
                render: function(data, type, row) {
                    if (row.pay_score_5_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | ${row.pay_score_5_value == 0 ? '' : row.pay_score_5_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "pay_per_numberator_active",
                render: function(data, type, row) {
                    if (row.pay_per_numberator_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | ${row.pay_per_numberator_1_value == 0 ? '' : row.pay_per_numberator_1_value} | ${row.pay_per_numberator_2_value == 0 ? '' : row.pay_per_numberator_2_value}`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "specific_improvement_active",
                render: function(data, type, row) {
                    if (row.specific_improvement_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | <span class="badge badge-light" style="font-size: 13px">${row.specific_improvement_value}</span>`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "cutpoint_score_active",
                render: function(data, type, row) {
                    if (row.cutpoint_score_active == 1) {
                        return `<span class="badge badge-success"> Active </span> | <span class="badge badge-light" style="font-size: 13px">${row.cutpoint_score_value}</span>`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "OQS_active",
                render: function(data, type, row) {
                    if (row.OQS_active == 1) {
                        return `<span class="badge badge-success"> Active </span>`
                    } else {
                        return `<span class="badge badge-danger"> Inactive </span>`
                    }
                }
            },
            {
                data: "OQS_weight",
                render: function(data, type, row) {
                    if (row.OQS_weight == null || row.OQS_weight == '') {
                        return '';
                    } else {
                        return row.OQS_weight
                    }
                    
                }
            },
            {
                data: "measure_categories",
                render: function(data, type, row) {
                    if (row.measure_categories == null || row.measure_categories == '') {
                        return '';
                    } else {
                        return `<span class="badge badge-light" style="font-size: 13px">${row.measure_categories}</span>`
                    }
                    
                }
            },
            {
                data: "measure_attribution",
                render: function(data, type, row) {
                    if (row.measure_attribution == null || row.measure_attribution == '') {
                        return '';
                    } else {
                        return  `<span class="badge badge-light" style="font-size: 13px">${row.measure_attribution}</span>`
                    }                    
                }
            },
            {   
                data: 'id',
                width: '10%',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top" idkey="`+row.id+`">
                            <button class="btn btn-sm btn-primary badge update_hedis_measure" type="button">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger badge del_hedis_measure" type="button">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    `
                } 
            }           
        ],
    });
    // done
    $('#hedis_measure_search_input').on('keyup', function () {
        quality_program_measure_table.search(this.value).draw();
    });
    // done
    $(document).on("click", "#reload_measure", function() {
        quality_program_measure_table.ajax.reload();
    });    
    // done
    $(document).on("click", "#back_measure", function() {           
        $('#report_part').css('display', 'block');
        $('#measure_part').css('display', 'none');
    });
    // done
    $(document).on("click", "#add_measure", function() {   
        GetIncentiveType((options) => {
            if (options) {        
                $('#incentive_type').select2({
                  data: options,
                  dropdownParent: $('#new_measure_modal .modal-body')
                  
                });         
            }
        });
        GetMeasureCategory((options) => {
            if (options) {        
                $('#measure_categories').select2({
                  data: options,
                  dropdownParent: $('#new_measure_modal .modal-body')
                });         
            }
        });
        GetMeasureAttribute((options) => {
            if (options) {        
                $('#measure_attr').select2({
                  data: options,
                  dropdownParent: $('#new_measure_modal .modal-body')
                });         
            }
        });
        $('#report_id').val($('#hedis_report_builder_report_id').val());      
        $('#new_measure_modal').modal('show');   
    });

    // done
    $(document).on("click", "#save_measure_name", function() {    
        let quality_program_id =  $('#quality_program_id').val();
        let hedis_report_id = $('#report_id').val();
        let select_measure_id = $('#select_measure_id').val();
        let minimum_denominator_active = 0;
        let minimum_denominator_value = 0;
        let dual_improvement_active = 0;
        let patient_incentive_active = 0;
        let patient_incentive_value = 0;
        let OQS_active = 0;
                
        let incentive_type_id = $('#incentive_type').val();
        let measure_categories_id = $('#measure_categories').val();
        let measure_attr_id = $('#measure_attr').val();
        let specific_improvement_active = 0;
        let specific_improvement_value = '';
        let cutpoint_score_active = 0;
        let cutpoint_score_value = '';        
        let OQS_weight = $('#OQS_weight').val();   
        
        let cutpoint_active = 0;
        let cutpoint_1_active = 0;
        let cutpoint_1_value = 0;
        let cutpoint_2_active = 0;
        let cutpoint_2_value = 0;        
        let cutpoint_3_active = 0;
        let cutpoint_3_value = 0;        
        let cutpoint_4_active = 0;
        let cutpoint_4_value = 0;
        let cutpoint_5_active = 0;        
        let cutpoint_5_value = 0;     
        
        let tier_1_active = 0;
        let tier_2_active = 0;
        let tier_3_active = 0;
        let tier_4_active = 0;
        let tier_5_active = 0;

        let pay_score_active = 0;
        let pay_score_1_active = 0;
        let pay_score_1_value = 0;
        let pay_score_2_active = 0;
        let pay_score_2_value = 0;
        let pay_score_3_active = 0;
        let pay_score_3_value = 0;
        let pay_score_4_active = 0;
        let pay_score_4_value = 0;
        let pay_score_5_active = 0;
        let pay_score_5_value = 0;

        let pay_per_numberator_active = 0;
        let pay_per_numberator_1_value = 0;
        let pay_per_numberator_2_value = 0;

        if ($('#minimum_denominator_active').prop('checked')) {
            minimum_denominator_active = 1;
            minimum_denominator_value = $('#minimum_denominator_value').val();
        } 
        
        if ($('#dual_improvement_active').prop('checked')) {
            dual_improvement_active = 1;
        } 

        if ($('#patient_incentive_active').prop('checked')) {
            patient_incentive_active = 1;
            patient_incentive_value = $('#patient_incentive_value').val();
        }

        if ($('#pay_per_num_active').prop('checked')) {
            pay_per_numberator_active = 1;
            pay_per_numberator_1_value = $('#pay_per_num_1_value').val();
            pay_per_numberator_2_value = $('#pay_per_num_2_value').val();
        } 

        if ($('#specific_improvement_active').prop('checked')) {
            specific_improvement_active = 1;
            specific_improvement_value = $('#specific_improvement_value').val();
        } 

        if ($('#cutpoint_score_active').prop('checked')) {
            cutpoint_score_active = 1;
            cutpoint_score_value = $('#cutpoint_score_value').val();
        } 

        if ($('#OQS_active').prop('checked')) {
            OQS_active = 1;
        }

        if ($('#check_cutpoint_active').prop('checked')) {
            cutpoint_active = 1;
        }

        if ($('#tier_1_active').prop('checked')) {
            tier_1_active = 1;
        }
        if ($('#tier_2_active').prop('checked')) {
            tier_2_active = 1;
        }
        if ($('#tier_3_active').prop('checked')) {
            tier_3_active = 1;
        }
        if ($('#tier_4_active').prop('checked')) {
            tier_4_active = 1;
        }
        if ($('#tier_5_active').prop('checked')) {
            tier_5_active = 1;
        }

        if ($('#cutpoint_1_active').prop('checked')) {
            cutpoint_1_active = 1;
            cutpoint_1_value = $('#cutpoint_1_value').val();
        }
        if ($('#cutpoint_2_active').prop('checked')) {
            cutpoint_2_active = 1;
            cutpoint_2_value = $('#cutpoint_2_value').val();
        }
        if ($('#cutpoint_3_active').prop('checked')) {
            cutpoint_3_active = 1;
            cutpoint_3_value = $('#cutpoint_3_value').val();
        }
        if ($('#cutpoint_4_active').prop('checked')) {
            cutpoint_4_active = 1;
            cutpoint_4_value = $('#cutpoint_4_value').val();
        }
        if ($('#cutpoint_5_active').prop('checked')) {
            cutpoint_5_active = 1;
            cutpoint_5_value = $('#cutpoint_5_value').val();
        }

        if ($('#check_payment_active').prop('checked')) {
            pay_score_active = 1;
        }

        if ($('#pay_score_1_active').prop('checked')) {
            pay_score_1_active = 1;
            pay_score_1_value = $('#pay_score_1_value').val();
        }
        if ($('#pay_score_2_active').prop('checked')) {
            pay_score_2_active = 1;
            pay_score_2_value = $('#pay_score_2_value').val();
        }
        if ($('#pay_score_3_active').prop('checked')) {
            pay_score_3_active = 1;
            pay_score_3_value = $('#pay_score_3_value').val();
        }
        if ($('#pay_score_4_active').prop('checked')) {
            pay_score_4_active = 1;
            pay_score_4_value = $('#pay_score_4_value').val();
        }
        if ($('#pay_score_5_active').prop('checked')) {
            pay_score_5_active = 1;
            pay_score_5_value = $('#pay_score_5_value').val();
        }

        if ( select_measure_id == '') {
            toastr.error('Please select Measure Name');    
        } else if ($('#minimum_denominator_active').prop('checked') && $('#minimum_denominator_value').val() == '') {
            toastr.error('Please input Minimum Denominator value');               
        } else if ($('#patient_incentive_active').prop('checked') && $('#patient_incentive_value').val() == '') {
            toastr.error('Please input Patient Incentive Value');               
        } else if ($('#pay_per_num_active').prop('checked') && $('#pay_per_num_1_value').val() == '') {
            toastr.error('Please input Paid Per Numberator Value');               
        } else {
            let params = {
                hedis_report_id: hedis_report_id,
                select_measure_id: select_measure_id,
                minimum_denominator_active: minimum_denominator_active,
                minimum_denominator_value: minimum_denominator_value,
                dual_improvement_active: dual_improvement_active,
                patient_incentive_active: patient_incentive_active,
                patient_incentive_value: patient_incentive_value, 

                incentive_type_id: incentive_type_id,
                measure_categories_id: measure_categories_id,
                measure_attr_id: measure_attr_id,
                specific_improvement_active: specific_improvement_active,
                specific_improvement_value: specific_improvement_value,
                cutpoint_score_active: cutpoint_score_active,
                cutpoint_score_value: cutpoint_score_value,
                OQS_active : OQS_active,
                OQS_weight : OQS_weight,

                pay_per_numberator_active: patient_incentive_active,
                pay_per_numberator_1_value: pay_per_numberator_1_value,
                pay_per_numberator_2_value: pay_per_numberator_2_value,

                tier_1_active: tier_1_active,
                tier_2_active: tier_2_active,
                tier_3_active: tier_3_active,
                tier_4_active: tier_4_active,
                tier_5_active: tier_5_active,

                cutpoint_active: cutpoint_active,
                cutpoint_1_active: cutpoint_1_active,
                cutpoint_1_value: cutpoint_1_value,
                cutpoint_2_active: cutpoint_2_active,
                cutpoint_2_value: cutpoint_2_value,
                cutpoint_3_active: cutpoint_3_active,
                cutpoint_3_value: cutpoint_3_value,
                cutpoint_4_active: cutpoint_4_active,
                cutpoint_4_value: cutpoint_4_value,
                cutpoint_5_active: cutpoint_5_active,
                cutpoint_5_value: cutpoint_5_value,

                pay_score_active: pay_score_active,
                pay_score_1_active: pay_score_1_active,
                pay_score_1_value: pay_score_1_value,
                pay_score_2_active: pay_score_2_active,
                pay_score_2_value: pay_score_2_value,
                pay_score_3_active: pay_score_3_active,
                pay_score_3_value: pay_score_3_value,
                pay_score_4_active: pay_score_4_active,
                pay_score_4_value: pay_score_4_value,
                pay_score_5_active: pay_score_5_active,
                pay_score_5_value: pay_score_5_value,

                quality_program_id: quality_program_id
            }
        
            sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/hedisMeasureItem", (xhr, err) => {
                if (!err) {
                    quality_program_measure_table.ajax.reload();

                    $('#report_id').val('');
                    $('#select_measure_id').val('');

                    $('#select_measure_name').val('');
                    $('#select_measure_quality_id').val('');
                    
                    $('#minimum_denominator_active').prop('checked', false);
                    $('#minimum_denominator_value').prop('disabled', true);
                    $('#minimum_denominator_value').val('');

                    $('#dual_improvement_active').prop('checked', false);

                    $('#patient_incentive_active').prop('checked', false);
                    $('#patient_incentive_value').prop('disabled', true);
                    $('#patient_incentive_value').val('');                    

                    $('#incentive_type_id').val(null).trigger('change');                               
                    $('#measure_categories_id').val(null).trigger('change');   
                    $('#measure_attr_id').val(null).trigger('change');                       

                    $('#specific_improvement_active').prop('checked', false);
                    $('#specific_improvement_value').val('');

                    $('#cutpoint_score_active').prop('checked', false);
                    $('#cutpoint_score_value').val('');

                    $('#OQS_active').prop('checked', false);
                    $('#OQS_weight').val('');

                    $('#check_payment_active').prop('checked', false);

                    $('#pay_score_1_active').prop('checked', false);
                    $('#pay_score_2_active').prop('checked', false);
                    $('#pay_score_3_active').prop('checked', false);
                    $('#pay_score_4_active').prop('checked', false);
                    $('#pay_score_5_active').prop('checked', false);

                    $('#pay_score_1_value').val('');
                    $('#pay_score_2_value').val('');
                    $('#pay_score_3_value').val('');
                    $('#pay_score_4_value').val('');
                    $('#pay_score_5_value').val('');                    

                    $('#check_cutpoint_active').prop('checked', false);

                    $('#cutpoint_1_active').prop('checked', false);
                    $('#cutpoint_2_active').prop('checked', false);
                    $('#cutpoint_3_active').prop('checked', false);
                    $('#cutpoint_4_active').prop('checked', false);
                    $('#cutpoint_5_active').prop('checked', false);

                    $('#cutpoint_1_value').val('');
                    $('#cutpoint_2_value').val('');
                    $('#cutpoint_3_value').val('');
                    $('#cutpoint_4_value').val('');
                    $('#cutpoint_5_value').val('');        

                    $('#tier_1_active').prop('checked', false);
                    $('#tier_2_active').prop('checked', false);
                    $('#tier_3_active').prop('checked', false);
                    $('#tier_4_active').prop('checked', false);
                    $('#tier_5_active').prop('checked', false);                    
                    
                    $('#pay_per_num_active').prop('checked', false);
                    $('#pay_per_num_1_value').val('');
                    $('#pay_per_num_2_value').val('');  

                    $('#new_measure_modal').modal('hide');
                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }

    });
   
    // done
    $(document).on("click", ".del_hedis_measure", function() {
        let row = quality_program_measure_table.row($(this).parents('tr')).data();      

        let entry = {
            id: $(this).parent().attr("idkey"),
            quality_program_id: $('#quality_program_id').val(),
            measure_id: row.measure_id
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/DelHedisMeasureItem", (xhr, err) => {
                if (!err) {                    
                    quality_program_measure_table.ajax.reload();                    
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.update_hedis_measure', function() {    
        
        $('#report_builder_measure_id').val($(this).parent().attr("idkey"));

        let params = {
            measure_id: $(this).parent().attr("idkey"),
        }        
        
        sendRequestWithToken('POST', authToken, params, "reportBuilder/GetHedisMeasureItemById", (xhr, err) => {
            if (!err) {                    
                let result = JSON.parse(xhr.responseText)['data'];                             
                $('#edit_select_measure_name').val(result[0].measure);
                $('#edit_select_measure_quality_id').val(result[0].quality_id);                
                $('#edit_measure_id').val(result[0].id);
                $('#edit_report_id').val(result[0].hedis_reportBuilder_report_id);
                
                $('#edit_select_measure_id').val(result[0].measure_id);

                if (result[0].minimum_denominator_active == 1) {
                    $('#edit_minimum_denominator_active').prop("checked", true);
                    $('#edit_minimum_denominator_value').prop('disabled', false);
                    $('#edit_minimum_denominator_value').val(result[0].minimum_denominator_value);
                } else {
                    $('#edit_minimum_denominator_active').prop("checked", false);
                    $('#edit_minimum_denominator_value').prop('disabled', true);
                    $('#edit_minimum_denominator_value').val('');
                }

                if (result[0].patient_incentive_active == 1) {
                    $('#edit_patient_incentive_active').prop("checked", true);
                    $('#edit_patient_incentive_value').prop('disabled', false);
                    $('#edit_patient_incentive_value').val(result[0].patient_incentive_value);
                } else {
                    $('#edit_patient_incentive_active').prop("checked", false);
                    $('#edit_patient_incentive_value').prop('disabled', true);
                    $('#edit_patient_incentive_value').val('');
                }

                if (result[0].dual_improvement_active == 1) {
                    $('#edit_dual_improvement_active').prop("checked", true);                    
                } else {
                    $('#edit_dual_improvement_active').prop("checked", false);                    
                }
                
                if (result[0].cutpoint_active == 1) {
                    $('#edit_check_cutpoint_active').prop("checked", true);                    
                    
                    if (result[0].tier_1_active == 1) {
                        $('#edit_tier_1_active').prop("checked", true);                                                 
                    }   
                    if (result[0].tier_2_active == 1) {
                        $('#edit_tier_2_active').prop("checked", true);                                                 
                    } 
                    if (result[0].tier_3_active == 1) {
                        $('#edit_tier_3_active').prop("checked", true);                                                 
                    } 
                    if (result[0].tier_4_active == 1) {
                        $('#edit_tier_4_active').prop("checked", true);                                                 
                    } 
                    if (result[0].tier_5_active == 1) {
                        $('#edit_tier_5_active').prop("checked", true);                                                 
                    } 

                    if (result[0].cutpoint_1_active == 1) {
                        $('#edit_cutpoint_1_active').prop("checked", true);                         
                        $('#edit_cutpoint_1_value').val(result[0].cutpoint_1_value); 
                    }
                    if (result[0].cutpoint_2_active == 1) {
                        $('#edit_cutpoint_2_active').prop("checked", true);                         
                        $('#edit_cutpoint_2_value').val(result[0].cutpoint_2_value); 
                    }
                    if (result[0].cutpoint_3_active == 1) {
                        $('#edit_cutpoint_3_active').prop("checked", true);                         
                        $('#edit_cutpoint_3_value').val(result[0].cutpoint_3_value); 
                    }
                    if (result[0].cutpoint_4_active == 1) {
                        $('#edit_cutpoint_4_active').prop("checked", true); 
                        $('#edit_cutpoint_4_value').val(result[0].cutpoint_4_value); 
                    }
                    if (result[0].cutpoint_5_active == 1) {
                        $('#edit_cutpoint_5_active').prop("checked", true);  
                        $('#edit_cutpoint_5_value').val(result[0].cutpoint_5_value); 
                    }
                    $('.edit_cpt').removeClass('d-none'); 
                    $('.edit_cpt').addClass('d-block');
                } else {
                    $('#edit_check_cutpoint_active').prop("checked", false);                                        
                    $('.edit_cpt').removeClass('d-block'); 
                    $('.edit_cpt').addClass('d-none');
                }

                if (result[0].incentive_type_id > 0) {
                    GetIncentiveType((options) => {
                        if (options) {        
                            $('#edit_incentive_type').select2({
                              data: options,
                              dropdownParent: $('#edit_measure_modal .modal-body')                              
                            });         

                            $('#edit_incentive_type').val(result[0].incentive_type_id).trigger('change');                    
                        }
                    });
                    
                } else {
                    $('#edit_incentive_type').val(null).trigger('change');
                }

                if (result[0].pay_per_numberator_active == 1) {
                    $('#edit_pay_per_num_active').prop("checked", true);                    
                    $('#edit_pay_per_num_1_value').val(result[0].pay_per_numberator_1_value);
                    $('#edit_pay_per_num_2_value').val(result[0].pay_per_numberator_2_value);
                } else {
                    $('#edit_pay_per_num_active').prop("checked", false);
                    $('#edit_pay_per_num_1_value').val('');
                    $('#edit_pay_per_num_2_value').val('');
                }

                if (result[0].pay_score_active == 1) {
                    $('#edit_check_payment_active').prop("checked", true);                    
                                       
                    if (result[0].pay_score_1_active == 1) {
                        $('#edit_pay_score_1_active').prop("checked", true); 
                        $('#edit_pay_score_1_value').val(result[0].pay_score_1_value); 
                    }
                    if (result[0].pay_score_2_active == 1) {
                        $('#edit_pay_score_2_active').prop("checked", true);                         
                        $('#edit_pay_score_2_value').val(result[0].pay_score_2_value); 
                    }
                    if (result[0].pay_score_3_active == 1) {
                        $('#edit_pay_score_3_active').prop("checked", true); 
                        $('#edit_pay_score_3_value').val(result[0].pay_score_3_value); 
                    }
                    if (result[0].pay_score_4_active == 1) {
                        $('#edit_pay_score_4_active').prop("checked", true); 
                        $('#edit_pay_score_4_value').val(result[0].pay_score_4_value); 
                    }
                    if (result[0].pay_score_5_active == 1) {
                        $('#edit_pay_score_5_active').prop("checked", true); 
                        $('#edit_pay_score_5_value').val(result[0].pay_score_5_value); 
                    }

                    $('.edit_pay').removeClass('d-none'); 
                    $('.edit_pay').addClass('d-block');                    

                } else {
                    $('#edit_check_payment_active').prop("checked", false);                    
                    $('.edit_pay').removeClass('d-block'); 
                    $('.edit_pay').addClass('d-none');
                }

                if (result[0].specific_improvement_active == 1) {                    
                    $('#edit_specific_improvement_active').prop("checked", true);
                    $('#edit_specific_improvement_value').val(result[0].specific_improvement_value);
                } else {
                    $('#edit_specific_improvement_active').prop("checked", false);
                    $('#edit_specific_improvement_value').val('');
                }

                if (result[0].cutpoint_score_active == 1) {
                    $('#edit_cutpoint_score_active').prop("checked", true);
                    $('#edit_cutpoint_score_value').val(result[0].cutpoint_score_value);
                } else {
                    $('#edit_cutpoint_score_active').prop("checked", false);
                    $('#edit_cutpoint_score_value').val('');
                }

                if (result[0].OQS_active == 1) {
                    $('#edit_OQS_active').prop("checked", true);
                } else {
                    $('#edit_OQS_active').prop("checked", false);
                }

                if (result[0].OQS_weight == null || result[0].OQS_weight == '') {
                    $('#edit_OQS_weight').val('');                    
                } else {
                    $('#edit_OQS_weight').val(result[0].OQS_weight);
                }

                if (result[0].measure_categories_id > 0) {
                    GetMeasureCategory((options) => {
                        if (options) {        
                            $('#edit_measure_categories').select2({
                              data: options,
                              dropdownParent: $('#edit_measure_modal .modal-body')
                            });         
                            
                            $('#edit_measure_categories').val(result[0].measure_categories_id).trigger('change');                    
                        }
                    });
                    
                } else {
                    $('#edit_measure_categories').val(null).trigger('change');
                }

                if (result[0].measure_attr_id > 0) {
                    GetMeasureAttribute((options) => {
                        if (options) {        
                            $('#edit_measure_attr').select2({
                              data: options,
                              dropdownParent: $('#edit_measure_modal .modal-body')
                            });         

                            $('#edit_measure_attr').val(result[0].measure_attr_id).trigger('change');                    
                        }
                    });                    
                } else {
                    $('#edit_measure_attr').val(null).trigger('change');
                }
            } else {
                toastr.error("Action Failed");
            }
        });

        $('#edit_measure_modal').modal('show');
    });
    
     //TODO
    $(document).on("click", "#update_measure", function() {    
        // let quality_program_id =  $('#quality_program_id').val();
        // let hedis_report_id = $('#report_id').val();
        // let select_measure_id = $('#select_measure_id').val();
        let id = $('#report_builder_measure_id').val();
        let minimum_denominator_active = 0;
        let minimum_denominator_value = 0;
        let dual_improvement_active = 0;
        let patient_incentive_active = 0;
        let patient_incentive_value = 0;
        let OQS_active = 0;
                
        let incentive_type_id = $('#edit_incentive_type').val();
        let measure_categories_id = $('#edit_measure_categories').val();
        let measure_attr_id = $('#edit_measure_attr').val();
        let specific_improvement_active = 0;
        let specific_improvement_value = '';
        let cutpoint_score_active = 0;
        let cutpoint_score_value = '';        
        let OQS_weight = $('#edit_OQS_weight').val();   
        
        let cutpoint_active = 0;
        let cutpoint_1_active = 0;
        let cutpoint_1_value = 0;
        let cutpoint_2_active = 0;
        let cutpoint_2_value = 0;        
        let cutpoint_3_active = 0;
        let cutpoint_3_value = 0;        
        let cutpoint_4_active = 0;
        let cutpoint_4_value = 0;
        let cutpoint_5_active = 0;        
        let cutpoint_5_value = 0;     
        
        let tier_1_active = 0;
        let tier_2_active = 0;
        let tier_3_active = 0;
        let tier_4_active = 0;
        let tier_5_active = 0;

        let pay_score_active = 0;
        let pay_score_1_active = 0;
        let pay_score_1_value = 0;
        let pay_score_2_active = 0;
        let pay_score_2_value = 0;
        let pay_score_3_active = 0;
        let pay_score_3_value = 0;
        let pay_score_4_active = 0;
        let pay_score_4_value = 0;
        let pay_score_5_active = 0;
        let pay_score_5_value = 0;

        let pay_per_numberator_active = 0;
        let pay_per_numberator_1_value = 0;
        let pay_per_numberator_2_value = 0;

        if ($('#edit_minimum_denominator_active').prop('checked')) {
            minimum_denominator_active = 1;
            minimum_denominator_value = $('#edit_minimum_denominator_value').val();
        } 
        
        if ($('#edit_dual_improvement_active').prop('checked')) {
            dual_improvement_active = 1;
        } 

        if ($('#edit_patient_incentive_active').prop('checked')) {
            patient_incentive_active = 1;
            patient_incentive_value = $('#edit_patient_incentive_value').val();
        }

        if ($('#edit_pay_per_num_active').prop('checked')) {
            pay_per_numberator_active = 1;
            pay_per_numberator_1_value = $('#edit_pay_per_num_1_value').val();
            pay_per_numberator_2_value = $('#edit_pay_per_num_2_value').val();
        } 

        if ($('#edit_specific_improvement_active').prop('checked')) {
            specific_improvement_active = 1;
            specific_improvement_value = $('#edit_specific_improvement_value').val();
        } 

        if ($('#edit_cutpoint_score_active').prop('checked')) {
            cutpoint_score_active = 1;
            cutpoint_score_value = $('#edit_cutpoint_score_value').val();
        } 

        if ($('#edit_OQS_active').prop('checked')) {
            OQS_active = 1;
        }

        if ($('#edit_check_cutpoint_active').prop('checked')) {
            cutpoint_active = 1;
        }

        if ($('#edit_tier_1_active').prop('checked')) {
            tier_1_active = 1;
        }
        if ($('#edit_tier_2_active').prop('checked')) {
            tier_2_active = 1;
        }
        if ($('#edit_tier_3_active').prop('checked')) {
            tier_3_active = 1;
        }
        if ($('#edit_tier_4_active').prop('checked')) {
            tier_4_active = 1;
        }
        if ($('#edit_tier_5_active').prop('checked')) {
            tier_5_active = 1;
        }

        if ($('#edit_cutpoint_1_active').prop('checked')) {
            cutpoint_1_active = 1;
            cutpoint_1_value = $('#edit_cutpoint_1_value').val();
        }
        if ($('#edit_cutpoint_2_active').prop('checked')) {
            cutpoint_2_active = 1;
            cutpoint_2_value = $('#edit_cutpoint_2_value').val();
        }
        if ($('#edit_cutpoint_3_active').prop('checked')) {
            cutpoint_3_active = 1;
            cutpoint_3_value = $('#edit_cutpoint_3_value').val();
        }
        if ($('#edit_cutpoint_4_active').prop('checked')) {
            cutpoint_4_active = 1;
            cutpoint_4_value = $('#edit_cutpoint_4_value').val();
        }
        if ($('#edit_cutpoint_5_active').prop('checked')) {
            cutpoint_5_active = 1;
            cutpoint_5_value = $('#edit_cutpoint_5_value').val();
        }

        if ($('#edit_check_payment_active').prop('checked')) {
            pay_score_active = 1;
        }

        if ($('#edit_pay_score_1_active').prop('checked')) {
            pay_score_1_active = 1;
            pay_score_1_value = $('#edit_pay_score_1_value').val();
        }
        if ($('#edit_pay_score_2_active').prop('checked')) {
            pay_score_2_active = 1;
            pay_score_2_value = $('#edit_pay_score_2_value').val();
        }
        if ($('#edit_pay_score_3_active').prop('checked')) {
            pay_score_3_active = 1;
            pay_score_3_value = $('#edit_pay_score_3_value').val();
        }
        if ($('#edit_pay_score_4_active').prop('checked')) {
            pay_score_4_active = 1;
            pay_score_4_value = $('#edit_pay_score_4_value').val();
        }
        if ($('#edit_pay_score_5_active').prop('checked')) {
            pay_score_5_active = 1;
            pay_score_5_value = $('#edit_pay_score_5_value').val();
        }

        if ( select_measure_id == '') {
            toastr.error('Please select Measure Name');    
        } else if ($('#edit_minimum_denominator_active').prop('checked') && $('#edit_minimum_denominator_value').val() == '') {
            toastr.error('Please input Minimum Denominator value');               
        } else if ($('#edit_patient_incentive_active').prop('checked') && $('#edit_patient_incentive_value').val() == '') {
            toastr.error('Please input Patient Incentive Value');               
        } else if ($('#edit_pay_per_num_active').prop('checked') && $('#edit_pay_per_num_1_value').val() == '') {
            toastr.error('Please input Paid Per Numberator Value');               
        } else {
            let params = {
                minimum_denominator_active: minimum_denominator_active,
                minimum_denominator_value: minimum_denominator_value,
                dual_improvement_active: dual_improvement_active,
                patient_incentive_active: patient_incentive_active,
                patient_incentive_value: patient_incentive_value, 

                incentive_type_id: incentive_type_id,
                measure_categories_id: measure_categories_id,
                measure_attr_id: measure_attr_id,
                specific_improvement_active: specific_improvement_active,
                specific_improvement_value: specific_improvement_value,
                cutpoint_score_active: cutpoint_score_active,
                cutpoint_score_value: cutpoint_score_value,
                OQS_active : OQS_active,
                OQS_weight : OQS_weight,

                pay_per_numberator_active: patient_incentive_active,
                pay_per_numberator_1_value: pay_per_numberator_1_value,
                pay_per_numberator_2_value: pay_per_numberator_2_value,

                tier_1_active: tier_1_active,
                tier_2_active: tier_2_active,
                tier_3_active: tier_3_active,
                tier_4_active: tier_4_active,
                tier_5_active: tier_5_active,

                cutpoint_active: cutpoint_active,
                cutpoint_1_active: cutpoint_1_active,
                cutpoint_1_value: cutpoint_1_value,
                cutpoint_2_active: cutpoint_2_active,
                cutpoint_2_value: cutpoint_2_value,
                cutpoint_3_active: cutpoint_3_active,
                cutpoint_3_value: cutpoint_3_value,
                cutpoint_4_active: cutpoint_4_active,
                cutpoint_4_value: cutpoint_4_value,
                cutpoint_5_active: cutpoint_5_active,
                cutpoint_5_value: cutpoint_5_value,

                pay_score_active: pay_score_active,
                pay_score_1_active: pay_score_1_active,
                pay_score_1_value: pay_score_1_value,
                pay_score_2_active: pay_score_2_active,
                pay_score_2_value: pay_score_2_value,
                pay_score_3_active: pay_score_3_active,
                pay_score_3_value: pay_score_3_value,
                pay_score_4_active: pay_score_4_active,
                pay_score_4_value: pay_score_4_value,
                pay_score_5_active: pay_score_5_active,
                pay_score_5_value: pay_score_5_value,

                quality_program_id: quality_program_id
            }
        
            sendRequestWithToken('PUT', localStorage.getItem('authToken'), params, `reportBuilder/hedisMeasureItem/${id}`, (xhr, err) => {
                if (!err) {
                    quality_program_measure_table.ajax.reload();

                    $('#report_id').val('');
                    $('#select_measure_id').val('');

                    $('#select_measure_name').val('');
                    $('#select_measure_quality_id').val('');
                    
                    $('#edit_minimum_denominator_active').prop('checked', false);
                    $('#edit_minimum_denominator_value').prop('disabled', true);
                    $('#edit_minimum_denominator_value').val('');

                    $('#edit_dual_improvement_active').prop('checked', false);

                    $('#edit_patient_incentive_active').prop('checked', false);
                    $('#edit_patient_incentive_value').prop('disabled', true);
                    $('#edit_patient_incentive_value').val('');                    

                    $('#edit_incentive_type_id').val(null).trigger('change');                               
                    $('#edit_measure_categories_id').val(null).trigger('change');   
                    $('#edit_measure_attr_id').val(null).trigger('change');                       

                    $('#edit_specific_improvement_active').prop('checked', false);
                    $('#edit_specific_improvement_value').val('');

                    $('#edit_cutpoint_score_active').prop('checked', false);
                    $('#edit_cutpoint_score_value').val('');

                    $('#edit_OQS_active').prop('checked', false);
                    $('#edit_OQS_weight').val('');

                    $('#edit_check_payment_active').prop('checked', false);

                    $('#edit_pay_score_1_active').prop('checked', false);
                    $('#edit_pay_score_2_active').prop('checked', false);
                    $('#edit_pay_score_3_active').prop('checked', false);
                    $('#edit_pay_score_4_active').prop('checked', false);
                    $('#edit_pay_score_5_active').prop('checked', false);

                    $('#edit_pay_score_1_value').val('');
                    $('#edit_pay_score_2_value').val('');
                    $('#edit_pay_score_3_value').val('');
                    $('#edit_pay_score_4_value').val('');
                    $('#edit_pay_score_5_value').val('');                    

                    $('#edit_check_cutpoint_active').prop('checked', false);

                    $('#edit_cutpoint_1_active').prop('checked', false);
                    $('#edit_cutpoint_2_active').prop('checked', false);
                    $('#edit_cutpoint_3_active').prop('checked', false);
                    $('#edit_cutpoint_4_active').prop('checked', false);
                    $('#edit_cutpoint_5_active').prop('checked', false);

                    $('#edit_cutpoint_1_value').val('');
                    $('#edit_cutpoint_2_value').val('');
                    $('#edit_cutpoint_3_value').val('');
                    $('#edit_cutpoint_4_value').val('');
                    $('#edit_cutpoint_5_value').val('');        

                    $('#edit_tier_1_active').prop('checked', false);
                    $('#edit_tier_2_active').prop('checked', false);
                    $('#edit_tier_3_active').prop('checked', false);
                    $('#edit_tier_4_active').prop('checked', false);
                    $('#edit_tier_5_active').prop('checked', false);                    
                    
                    $('#edit_pay_per_num_active').prop('checked', false);
                    $('#edit_pay_per_num_1_value').val('');
                    $('#edit_pay_per_num_2_value').val('');  

                    $('#edit_measure_modal').modal('hide');
                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }

    });

    $(document).on("click", ".show_report", function() {
        let row = quality_program_table.row($(this).parents('tr')).data(); 
        let clinicName = $('#chosen_clinics').find("option:selected").text();
        let clinicId = $('#chosen_clinics').val();

        var currentYear = new Date().getFullYear();

        $('#show_report_title').html(row.insurance + ' | ' + row.name + ' (' +currentYear + ')');
        $('#show_report_id').html(`<h5>${clinicName}: ${clinicId}</h5>` + `<h5>Quality Program ID: ${row.report_id}</h5>`);
        
        console.log($('#chosen_clinics').find("option:selected").text());

        // let entry = {
        //     report_id: row.report_id,
        // }
    
        // sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "reportBuilder/GetInsuranceNameForReport", (xhr, err) => {
        //     if (!err) {
        //         let row = JSON.parse(xhr.responseText)['data']; 
        //         insurance_name = row[0].ins_name;             
               
                
        //     } else {
        //         $('#show_report_title').html(report_name +  '(' + currentYear + ')');
        //     }
        // });

        
        

        let params = {
            report_id: row.id
        }
        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/GetReportMeasure", (xhr, err) => {
            if (!err) {
                let row = JSON.parse(xhr.responseText)['data'];  
                let tr_content = '';
                let category_array = [];

                for(let i = 0; i < row.length; i++) {
                                        
                    tr_content += '<tr>' +
                                        `<td>` + row[i].measure + `</td>` +
                                        `<td>` + (row[i].attribution == null ? '-' : row[i].attribution) + `</td>` +
                                        `<td>` + (row[i].cutpoint_2_value == null || row[i].cutpoint_2_value === 0 ? '-' : row[i].cutpoint_2_value) + `</td>` +
                                        `<td>` + (row[i].cutpoint_3_value == null || row[i].cutpoint_3_value === 0 ? '-' : row[i].cutpoint_3_value) + `</td>` +
                                        `<td>` + (row[i].cutpoint_4_value == null || row[i].cutpoint_4_value === 0? '-' : row[i].cutpoint_4_value) + `</td>` +
                                        `<td>` + (row[i].cutpoint_5_value == null || row[i].cutpoint_5_value === 0? '-' : row[i].cutpoint_5_value) + `</td>` +
                                        `<td>` + row[i].minimum_denominator_value + `</td>` +
                                        `<td>` + (row[i].OQS_active == 1 ? 'Yes' : '-') + `</td>` +
                                        `<td>` + row[i].OQS_weight + `</td>` +
                                        `<td>` + row[i].incentive_type + `</td>` +
                                        `<td>` + (row[i].pay_score_4_value == null || row[i].pay_score_4_value === 0 ? '-' : row[i].pay_score_4_value) + `</td>` +
                                        `<td>` + (row[i].pay_score_5_value == null || row[i].pay_score_5_value === 0? '-' : row[i].pay_score_5_value) + `</td>` +
                                    '</tr>';
                }               

                let content = `
                    <table class="table table-striped table-bordered text-nowrap w-100" id="report_table" style="margin-bottom: 0;">
                        <thead style="text-align: center;">
                            <tr>
                                <th>Measure</th>
                                <th>Attribution</th>
                                <th>2-Score <br /> Cutpoint</th>
                                <th>3-Score <br /> Cutpoint</th>
                                <th>4-Score <br /> Cutpoint</th>
                                <th>5-Score <br /> Cutpoint</th>
                                <th>Minimum <br /> Denominator</th>
                                <th>OQS</th>
                                <th>OQS Weight</th>
                                <th>Incentive Type</th>
                                <th>4-Score <br /> Payment</th>
                                <th>4-Score <br /> Payment</th>                                 
                            </tr>
                        </thead>
                        <tbody> `;                                                        
                    content = content + tr_content + '</tbody>' + '</table>';                   
                    $('#report_table').html(content);
                    
            } else {
                
            }
        });

        $('#show_report_modal').modal('show');
    });
    
    
});


// Function to format the child row content
//  function format(d, row) {
//     console.log(row);
    
//     let tr_content = '';

//     let content = '<table class="childTable table table-striped table-bordered text-nowrap w-100" id="child-' + d.name.replace(/\s+/g, '') + '" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
//                 '<thead>' +
//                     '<tr>' +
//                         '<th>Measure</th>' +
//                         '<th>Quality ID</th>' +
//                         '<th>Minimum Denominator</th>' +
//                         '<th>Minimum Denominator Value</th>' +
//                         '<th>Dual Improvement</th>' +
//                         '<th>Patient Incentive</th>' +
//                         '<th>Patient Incentive Value</th>' +
//                         '<th>Tier Target</th>' +
//                         '<th>Tier Target Level</th>' +
//                         '<th>PAID PER NUMERATOR</th>' +
//                         '<th>PAID PER NUMERATOR Value</th>' +
//                         '<th>Specific Improvement</th>' +
//                         '<th>Specific Improvement Report</th>' +
//                         '<th>CutPoint Score</th>' +
//                         '<th>CutPoint Score Report</th>' +
//                         '<th>Actions</th>' +
//                     '</tr>' +
//                 '</thead>' + 
//             '<tbody>';
    
         
//             for(let i = 0; i < row.length; i++) {
//                 tr_content += '<tr>' +
//                                 `<td>` + row[i].measure + `</td>` +
//                                 `<td>` + row[i].quality_id + `</td>` +
//                                 `<td>` + (row[i].min_den == 1 ? '<span class="badge badge-success"> True </span>' : '<span class="badge badge-danger"> False </span>')  + `</td>` +
//                                 `<td>` + row[i].min_den_val + `</td>` +
//                                 `<td>` + (row[i].dual_improve == 1 ? '<span class="badge badge-success"> True </span>' : '<span class="badge badge-danger"> False </span>')  + `</td>` +
//                                 `<td>` + (row[i].patient_incentive == 1 ? '<span class="badge badge-success"> True </span>' : '<span class="badge badge-danger"> False </span>')  + `</td>` +
//                                 `<td>` + (row[i].patient_incentive_val == null ? '' : row[i].patient_incentive_val)  + `</td>` +
//                                 `<td>` + (row[i].tier_target == 1 ? '<span class="badge badge-success"> True </span>' : '<span class="badge badge-danger"> False </span>')  + `</td>` +
//                                 `<td>` + (row[i].tier_target_level == null ? '' : row[i].tier_target_level)  + `</td>` +
//                                 `<td>` + (row[i].paid_per_num == 1 ? '<span class="badge badge-success"> True </span>' : '<span class="badge badge-danger"> False </span>')  + `</td>` +
//                                 `<td>` + row[i].paid_per_num_val + `</td>` +
//                                 `<td>` + (row[i].spec_improve == 1 ? '<span class="badge badge-success"> True </span>' : '<span class="badge badge-danger"> False </span>')  + `</td>` +
//                                 `<td>` + (row[i].spec_improve_report == null ? '' : row[i].spec_improve_report)  + `</td>` +
//                                 `<td>` + (row[i].cutpoint_score == 1 ? '<span class="badge badge-success"> True </span>' : '<span class="badge badge-danger"> False </span>')  + `</td>` +
//                                 `<td>` + (row[i].cutpoint_score_report == null ? '' : row[i].cutpoint_score_report)  + `</td>` +
                                               
//                                 `<td><div class="btn-group align-top" idkey="`+ row[i].id +`">
//                                     <button class="btn btn-sm btn-primary badge update_hedis_step2" type="button">
//                                         <i class="fa fa-edit"></i>
//                                     </button>
//                                     <button class="btn btn-sm btn-danger badge del_hedis_step2" type="button">
//                                         <i class="fa fa-trash"></i>
//                                     </button>
//                                 </div></td>`+
//                             '</tr>';
//             }
   
//     return content + tr_content + '</tbody>' + '</table>';
// }