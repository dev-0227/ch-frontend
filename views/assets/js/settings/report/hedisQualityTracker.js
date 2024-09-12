$(document).ready(function() {

    "use strict";
  
    let quality_program_table = $('#quality_program_table').DataTable({
        ordering: false,
        ajax: {
            url: serviceUrl + 'reportBuilder/qualityPrograms',
            type: 'GET'
        },
        processing: true,        
        order: [[0, 'asc']],
        columns: [
            { data: 'ins_name' },
            { data: 'name' },
            {   
                data: 'id',
                width: '6%',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top" idkey="${row.id}">     
                            <button class="btn btn-sm btn-primary badge quality_program_measure_view" type="button">
                                <i class="far fa-eye"></i>
                            </button>                         
                            <button class="btn btn-sm btn-primary badge quality_program_measure" type="button">
                                <i class="fa fa-pencil"></i>
                            </button>                            
                        </div>
                    `
                } 
            }           
        ]
    });


    $('#quality_program_search').on('keyup', function () {
        quality_program_table.search(this.value).draw();
    });

    $(document).on("click", "#reolad_quality_program", function() {
        quality_program_table.ajax.reload();
      
      
        // console.log(localStorage.getItem('chosen_clinic'));
    });  

    function calculateMissing() {
        var num = parseFloat($('#num').val()) || 0;
        var den = parseFloat($('#den').val()) || 0;
        
        var missing = den - num;       
        
        $('#missing').val(missing);
    }

    $('#num, #den').on('input', calculateMissing);

    let quality_program_measure_table = $('#quality_program_measure_table').DataTable({
        createdRow: function(row, data, dataIndex) {
            $('td:eq(6)', row).css('background-color', 'yellow');             
            if (data.score == 1 || data.score == 2) {  
                $(row).css('--bs-table-color', 'red');
                $(row).css('--bs-table-striped-color', 'red');
            }      
            if (data.score == 3) {
                $(row).css('--bs-table-color', 'orange');
                $(row).css('--bs-table-striped-color', 'orange');
            }      
        
            if (data.score == 4) {
                $(row).css('--bs-table-color', 'green');
                $(row).css('--bs-table-striped-color', 'green');
            }
            
            if (data.score == 5) {
                $(row).css('--bs-table-color', 'blue');
                $(row).css('--bs-table-striped-color', 'blue');
            }

            if (data.status == 1) {
                $(row).css('background-color', 'gray');
            }
            
        },
        stripeClasses: [],
        paging: false,
        ordering: false,
        responsive: true,
        processing: true,
        columnDefs: [
            { "className": "text-center", "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }            
        ],
        ajax: {
            url : serviceUrl + "reportBuilder/qualityProgramMeasures",            
            type : "POST",
            data : function () {
                return {
                    quality_program_id : $('#quality_program_id').val(),      
                    clinic_id: localStorage.getItem('chosen_clinic')   
                };
            }          
        },
        order: [[9, 'desc']],        
        columns: [
            { 
                data : "measures"
            },
            {
                data: "rate",
                render: function(data, type, row) {
                    // if (row.rate > 0) {
                    //     return row.rate + '%';
                    // } else {
                    //     return '';
                    // }
                    return `<span class="editable" data-column="rate">${data > 0 ? data + '%' : ''}</span>`;
                }
            },
            {
                data: "score",
                render: function(data, type, row) {
                    if (row.score > 0) {
                        return row.score.toFixed(1);
                    } else {
                        return '';
                    }
                   
                }
            },
            {
                data: "trend",
                render: function(data, type, row) {
                    if (row.trend == 1) {
                        return `<span class="badge badge-primary">↑</span> `
                    } else if (row.trend == 0){
                        return `<span class="badge badge-success">=</span>`;
                    } else if (row.trend == -1) {
                        return `<span class="badge badge-danger">↓</span>`;
                    } else if (row.trend == null) {
                        return '';
                    }
                }
            },
            {
                data: "num"
            },
            {
                data: "den"
            },
            {
                data: "missing"               
            },
            {
                data: "ins_avg"
            },
            {
                data: "tier_1"
            },
            {
                data: "tier_2"
            },
            {
                data: "Q1_target"
            },
            {
                data: "Q2_target"
            },
            {   
                data: 'id',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top" idkey="`+row.id+`">
                            <button class="btn btn-sm btn-primary badge update_quality_program_measure" type="button">
                                <i class="fa fa-edit"></i>
                            </button>
                        </div>
                    `
                } 
            }           
        ],
    });

    $('#quality_program_measure_table').on('click', '.editable', function() {
        let $span = $(this);
        let currentText = $span.text().replace('%', '');
        let columnName = $span.data('column');
        let $input = $('<input>', {
            type: 'text',
            value: currentText,
            class: 'form-control editable-input'
        });

        $span.replaceWith($input);
        $input.focus();
    });

    $('#quality_program_measure_table').on('blur', '.editable-input', function() {
        let $input = $(this);
        let newValue = $input.val();
        let $span = $('<span>', {
            class: 'editable',
            text: newValue,
            'data-column': $input.data('column')
        });

        let row = $input.closest('tr');
        let rowData = quality_program_measure_table.row(row).data();
        let columnName = $input.data('column');

        // Update the row data with the new value
        rowData[columnName] = newValue;

        // Send updated data to server
        // $.ajax({
        //     url: 'yourServerUpdateUrl',
        //     method: 'POST',
        //     data: {
        //         id: rowData.id,
        //         [columnName]: newValue
        //     },
        //     success: function(response) {
        //         // Handle server response if needed
        //     }
        // });

        // Replace input with span and update the table
        $input.replaceWith($span);
        quality_program_measure_table.row(row).data(rowData).draw();
    });

    
    let quality_program_measure_view_table = $('#quality_program_measure_view_table').DataTable({
        createdRow: function(row, data, dataIndex) {
            $('td:eq(6)', row).css('background-color', 'yellow');             
            if (data.score == 1 || data.score == 2) {  
                $(row).css('--bs-table-color', 'red');
                $(row).css('--bs-table-striped-color', 'red');
            }      
            if (data.score == 3) {
                $(row).css('--bs-table-color', 'orange');
                $(row).css('--bs-table-striped-color', 'orange');
            }      
        
            if (data.score == 4) {
                $(row).css('--bs-table-color', 'green');
                $(row).css('--bs-table-striped-color', 'green');
            }
            
            if (data.score == 5) {
                $(row).css('--bs-table-color', 'blue');
                $(row).css('--bs-table-striped-color', 'blue');
            }

            if (data.status == 1) {
                $(row).css('background-color', 'gray');
            }
            
        },
        stripeClasses: [],
        paging: false,
        ordering: false,
        responsive: true,
        columnDefs: [
            { "className": "text-center", "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }            
        ],
        ajax: {
            url : serviceUrl + "reportBuilder/qualityProgramMeasures",            
            type : "POST",
            data : function () {
                return {
                    quality_program_id : $('#quality_program_view_id').val(),      
                    clinic_id: localStorage.getItem('chosen_clinic')   
                };
            }          
        },
        // order: [[9, 'desc']],        
        columns: [
            { 
                data : "measures"
            },
            {
                data: "rate",
                render: function(data, type, row) {
                    if (row.rate > 0) {
                        return row.rate + '%';
                    } else {
                        return '';
                    }
                   
                }
            },
            {
                data: "score",
                render: function(data, type, row) {
                    if (row.score > 0) {
                        return row.score.toFixed(1);
                    } else {
                        return '';
                    }
                   
                }
            },
            {
                data: "trend",
                render: function(data, type, row) {
                    if (row.trend == 1) {
                        return `<span class="badge badge-primary">↑</span> `
                    } else if (row.trend == 0){
                        return `<span class="badge badge-success">=</span>`;
                    } else if (row.trend == -1) {
                        return `<span class="badge badge-danger">↓</span>`;
                    } else if (row.trend == null) {
                        return '';
                    }
                }
            },
            {
                data: "num"
            },
            {
                data: "den"
            },
            {
                data: "missing"               
            },
            {
                data: "ins_avg"
            },
            {
                data: "tier_1"
            },
            {
                data: "tier_2"
            },
            {
                data: "Q1_target"
            },
            {
                data: "Q2_target"
            }          
        ],
    });

    $(document).on("click", ".quality_program_measure_view", function() {
        
        let row = quality_program_table.row($(this).parents('tr')).data();      
        let fullName = `${row.ins_name} | ${row.name}`;    
        // $('#quality_program_ins_name').html(row.ins_name);
        // $('#quality_program_report_name').html(row.name);
        let clinicName = $('#chosen_clinics').find("option:selected").text();
        let clinic_id = localStorage.getItem('chosen_clinic');
        let fullClinic = `${clinicName} : ${clinic_id}`;
        let fullReport = `Quality Program ID : ${row.report_id}`;
        console.log(row);
        let params = {
            clinic_id: clinic_id,
            hedis_reportBulder_report_id: row.id
        }        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, `reportBuilder/insertTracker`, (xhr, err) => {
            if (!err) {
                $('#quality_program_view_id').val(row.id);                 
                $('#quality_program_view_name').html(fullName);
                $('#show_clinic_info').html(fullClinic);
                $('#show_report_id').html(fullReport);
                quality_program_measure_view_table.ajax.reload();        
                $('#quality_program_measure_view_modal').modal('show');                                  
            } else {
        
            }
        }); 
    });  
    
    $(document).on("click", "#reolad_quality_program_measure_view", function() {
        $('#loadingModal').modal('show');
        quality_program_measure_view_table.ajax.reload();
        setTimeout(function() {
            $('#loadingModal').modal('hide');
        }, 300);
    });    
    
    $('#quality_program_measure_view_search').on('keyup', function () {
        quality_program_measure_view_table.search(this.value).draw();
    });
    
    $('#quality_program_measure_search').on('keyup', function () {
        quality_program_measure_table.search(this.value).draw();
    });

    $(document).on("click", "#reolad_quality_program_measure", function() {
        quality_program_measure_table.ajax.reload();
    });    

    $(document).on("click", "#back_quality_program", function() {
        quality_program_table.ajax.reload();
        $('#quality_program_list').removeClass('d-none');
        $('#quality_program_list').addClass('d-block');
        $('#quality_program_measure_list').removeClass('d-block');
        $('#quality_program_measure_list').addClass('d-none');        
    });    
    

    $(document).on("click", ".quality_program_measure", function() {
        let row = quality_program_table.row($(this).parents('tr')).data();        
        console.log(row);

          
        let params = {
            clinic_id: localStorage.getItem('chosen_clinic'),
            hedis_reportBulder_report_id: row.id
        }        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, `reportBuilder/insertTracker`, (xhr, err) => {
            if (!err) {
                $('#quality_program_id').val(row.id); 
                quality_program_measure_table.ajax.reload();                                          
            } else {
        
            }
        });        

        $('#report_id').val(row.quality_program_id); 
        $('#quality_program_name').html(row.name);
        $('#quality_program_list').removeClass('d-block');
        $('#quality_program_list').addClass('d-none');
        $('#quality_program_measure_list').removeClass('d-none');
        $('#quality_program_measure_list').addClass('d-block');        
    });  

    $(document).on("click", ".update_quality_program_measure", function() {
       

        let row = quality_program_measure_table.row($(this).parents('tr')).data();                
        $('#hedis_quality_tracker_id').val(row.id);        
        
        let params = {
            clinic_id: localStorage.getItem('chosen_clinic')
        }        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, `reportBuilder/clinicName`, (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                                    
                $('#clinic_name').val(result[0].name);                
                // toastr.success('Action Success');
            } else {
                // return toastr.error("Action Failed");
            }
        });        
        
        $('#measures_name').val(row.measures);                
        $('#measures_id').val(row.mid); 
        $('#current_rate').val(row.rate);    
        $('#current_score').val(row.score);    
        $('#trend').val(row.trend).trigger('change');    
        $('#num').val(row.num);    
        $('#den').val(row.den);    
        $('#missing').val(row.missing);
        $('#hf_avg').val(row.ins_avg);    
        $('#tier_1').val(row.tier_1);    
        $('#tier_2').val(row.tier_2);    
        $('#Q1_target').val(row.Q1_target);    
        $('#Q2_target').val(row.Q2_target);    

        $('#status').val(row.status).trigger('change');    

        let den = $('#den').val();
        let num = $('#num').val();
        let tier_3 = 0;
        let tier_4 = 0;
        let tier_5 = 0;

        let entry = {
            measure_id:  $('#measures_id').val(),
            quality_program_id: $('#quality_program_id').val()
        }        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, `reportBuilder/cutpoint`, (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];      

                if (result[0].tier_3_active == 1) {
                    tier_3 = (den * result[0].cutpoint_3_value / 100) - num;
                    $('#tier_3_value').val(tier_3);
                } else {
                    $('#tier_3_value').val(0);
                }
                if (result[0].tier_4_active == 1) {
                    tier_4 = (den * result[0].cutpoint_4_value / 100) - num;
                    $('#tier_2_value').val(tier_4);
                } else {
                    $('#tier_2_value').val(0);
                }
                if (result[0].tier_5_active == 1) {
                    tier_5 = (den * result[0].cutpoint_5_value / 100) - num;
                    $('#tier_1_value').val(tier_5);
                } else {
                    $('#tier_1_value').val(0);
                }
                
            } else {
                
            }
        });     

        $('#quality_program_measure_modal').modal('show');
    });  

   
    $('#tier_count').on('change', function () {
  
      
                         
          

    });

    $(document).on("click", "#update_quality_program_measure", function() {
        let id = $('#hedis_quality_tracker_id').val();
        let rate = $('#current_rate').val();        
        let score = $('#current_score').val();
        let trend = $('#trend').val();
        let num = $('#num').val();
        let den = $('#den').val();
        let missing = $('#missing').val();
        let hf_avg = $('#hf_avg').val();
        let tier_1 = 0;
        let tier_2 = 0;
        let tier_3 = 0;

        tier_1 = $('#tier_1_value').val();
        tier_2 = $('#tier_2_value').val();
        tier_3 = $('#tier_3_value').val();
       

        let Q1_target = $('#Q1_target').val();
        let Q2_target = $('#Q2_target').val();
        let status = $('#status').val();

        if (rate == '') {
            toastr.error('Please Input Current Rate');    
        } else if (score == '') {
            toastr.error('Please Input Current Score');    
        } else if (trend == null) {
            toastr.error('Please Select Rating Trend');    
        } else if (num == '') {
            toastr.error('Please Input Num');    
        } else if (den == '') {
            toastr.error('Please Input Den');    
        } else if (hf_avg == '') {
            toastr.error('Please Input HF avg');    
        } else if (Q1_target == '') {
            toastr.error('Please Input Q1 target');    
        } else if (Q2_target == '') {
            toastr.error('Please Input Q2 target');    
        } else if (status == null) {
            toastr.error('Please Select Status');    
        } else {
            let params = {               
                rate: rate,
                score: score,
                trend: trend,
                num: num,
                den: den,
                missing: missing,
                hf_avg: hf_avg,
                tier_1: tier_1,
                tier_2: tier_2,
                tier_3: tier_3,
                Q1_target: Q1_target,
                Q2_target: Q2_target,
                status: status
            }
            
            sendRequestWithToken('POST', localStorage.getItem('authToken'), params, `reportBuilder/qualityProgramTracker/${id}`, (xhr, err) => {
                if (!err) {
                    quality_program_measure_table.ajax.reload();
                    $('#quality_program_measure_modal').modal('hide');
                    toastr.success('Action Success');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });     
    
});
