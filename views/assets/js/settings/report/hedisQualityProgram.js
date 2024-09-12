function GetInsurance(callback) {
  const authToken = localStorage.getItem('authToken');
  const requestData = {};
  const apiUrl = 'reportBuilder/getInsuranceList';

  sendRequestWithToken('GET', authToken, requestData, apiUrl, (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];  
      let resArr = [{id: '', text: 'Select Insurance'}];
      // let content = '<option value="" selected></option>';                             
      result.forEach(r => {                                         
          // content += `<option value="${r.id}">${r.insName}</option>`;                                        
          resArr.push({ id: r.id, text: r.insName });
      }); 
        // callback(content);          
        callback(resArr);        
    } else {  
        toastr.error("Get Insurances Failed");
        callback(null);
    }
  });
}

function GetInsuranceLOB(id, callback) {
  const authToken = localStorage.getItem('authToken');
  const requestData = { id: id }; 
  const apiUrl = 'reportBuilder/insuranceLob';

  sendRequestWithToken('POST', authToken, requestData, apiUrl, (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];    
      let content = "";          
      content += '<option value=""></option>';
      // let resArr = [{id: '', text: 'Select InsuranceLOB'}];
      result.forEach(r => {                   
        // resArr.push({ id: r.id, text: r.lob });
          content += '<option value='+ r.id +'>' + r.lob + '</option>';                                        
      }); 
      callback(content);      
      // callback(resArr);      
    } else {  
      toastr.error("Get InsuranceLOB Failed");
      callback(null);
    }
  });
}

$(document).ready(function() {
  "use strict";

  // $('#select_ins').select2({
  //   dropdownParent: $('#create_modal')
  // });

  $('#add_quality_program_ins_lob').select2({
    dropdownParent: $('#create_modal')
  });

  $('#edit_select_ins').select2({
    dropdownParent: $('#edit_modal')
  });

  $('#edit_quality_program_ins_lob').select2({
    dropdownParent: $('#edit_modal'),
    multiple: true
  });
  
  let hedis_quality_program_table = $('#hedis_quality_program_table').DataTable({
    ajax: {
        url: serviceUrl + "reportBuilder/qualityProgram",
        type: "GET",
    },
    processing: true,
    responsive: {
      details: {
          renderer: function (api, rowIdx, columns) {
              var data = $.map(columns, function (col, i) {
                  return col.hidden ?
                      '<tr data-dt-row="'+ col.rowIndex +'" data-dt-column="'+ col.columnIndex +'">'+
                          '<td style="width:10%; padding: 10px;"><strong>'+ col.title +'</strong></td>'+
                          '<td style="border-left: 1px solid #F1F1F4; text-align:center;">'+ col.data +'</td>'+
                      '</tr>' : '';
              }).join(''); 

              return data ? $('<table/>').append(data) : false;
          }
      }
    },  
    paging: false,
    stripeClasses: [],    
    columns: [
      { data: 'insurance'},
      { data: 'name'},
      { data: 'display'},      
      { data: 'description'},
      { data: 'program_date'},
      { data: 'lob', 
        render: function (data, type, row) { 
          let lobItems = row.lob.split(',');
          return lobItems.map(item => `<span class="badge badge-light" style="font-size: 13px">${item.trim()}</span>`).join(' ');        
        } 
      },
      { data: 'id',
        render: function (data, type, row) {
          return `
            <div class="btn-group align-top" idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary badge update_btn" type="button">
                  <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger badge del_btn" type="button">
                  <i class="fa fa-trash"></i>
              </button>
            </div>
          `
        } 
      }
    ]
  });

  $(document).on("click", "#create_btn", function() {
    GetInsurance((options) => {
      if (options) {
          // $('#select_ins').html(options);          
          $('#select_ins').select2({
            data: options,
            dropdownParent: $('#create_modal')
          });         
      }
    });
    $('#create_modal').modal('show');
  });
   
  $(document).on("change", "#select_ins", function() {    
    $('#add_quality_program_ins_lob').val(null).trigger('change'); 
    // let id = $(this).val();
    GetInsuranceLOB($(this).val(), (options) => {
      if (options) {        
          $('#add_quality_program_ins_lob').html(options);          
      }
    });      
  });
  
  $(document).on("change", "#edit_select_ins", function() {
    $('#edit_quality_program_ins_lob').val(null).trigger('change');
    let id = $(this).val();
    GetInsuranceLOB(id, (options) => {
      if (options) {
          $('#edit_quality_program_ins_lob').html(options);          
      }
    });
  });
  
  $(document).on("keyup", "#search_input", function() {
    hedis_quality_program_table.search(this.value).draw();
  });
  
  $(document).on("click", "#reload_btn", function() {
    hedis_quality_program_table.ajax.reload();      
  });

  $(document).on('click', '#save_btn', function() {
    let ins_id = $('#select_ins').val();
    let ins_lob_id = $('#add_quality_program_ins_lob').val();    
    let name = $('#add_quality_program_name').val();
    let display = $('#add_quality_program_display').val();
    let description = $('#add_quality_program_description').val();
    let program_date = $('#add_quality_program_date').val();
        
    if (ins_id == '' || ins_lob_id == '') {
      toastr.error("Please select Insurance or LOB");
    } else if (name == '' || display == '' || description == '' || program_date == '') {
        toastr.error("Please enter complete information");
    } else {
        let params = {
          ins_id : ins_id,
          ins_lob_id: ins_lob_id,
          name: name,
          display: display,
          description: description,
          program_date: program_date
        }    
        sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "reportBuilder/qualityProgram", (xhr, err) => {
            if (!err) {
              hedis_quality_program_table.ajax.reload();              

              $('#select_ins').val(null).trigger('change');    
              $('#add_quality_program_ins_lob').val(null).trigger('change');            
              $('#add_quality_program_name').val('');
              $('#add_quality_program_display').val('');
              $('#add_quality_program_description').val('');
              $('#add_quality_program_date').val('');

              $('#create_modal').modal('hide');
              toastr.success("Action Success");
            } else {
                return toastr.error("Action Failed");
            }
        });
    }        
  });

  $(document).on("click", ".del_btn", function() {
    let id =$(this).parent().attr("idkey");     
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
            sendRequestWithToken('DELETE', localStorage.getItem('authToken'), {}, `reportBuilder/qualityProgram/${id}`, (xhr, err) => {
            if (!err) {
              hedis_quality_program_table.ajax.reload();                
              toastr.success("Action Success");
            } else {
                return toastr.error("Action Failed");
            }
            });
        }
    });
  });
  
  $(document).on('click', '.update_btn', function() {
    let row = hedis_quality_program_table.row($(this).parents('tr')).data();  
    
    GetInsurance((options) => {
      if (options) {
        $('#edit_select_ins').select2({
          data: options,
          dropdownParent: $('#edit_modal')
        });   
        // $('#edit_select_ins').html(options);    
        $('#edit_select_ins').val(row.ins_id).trigger('change');             
      }
    });    

    
    GetInsuranceLOB(row.ins_id, (options) => {
      if (options) {
          $('#edit_quality_program_ins_lob').html(options); 

          setTimeout( function () {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, `reportBuilder/insuranceLob/${row.id}`, (xhr, err) => {
              if (!err) {
                let d = JSON.parse(xhr.responseText)['data'];                 
                if (!Array.isArray(d)) {
                  d = [d]; 
                }  
                $('#edit_quality_program_ins_lob').val(d).trigger('change');      
              }
            });   
          }, 150 );         
      }
    });
        
    $('#hedis_quality_program_id').val(row.id);
    $('#edit_quality_program_name').val(row.name);
    $('#edit_quality_program_display').val(row.display);
    $('#edit_quality_program_description').val(row.description);
    $('#edit_quality_program_date').val(row.program_date);
    $('#edit_modal').modal('show');
  });

  $(document).on('click', '#update_btn', function() {    
    let id = $('#hedis_quality_program_id').val();
    let ins_id = $('#edit_select_ins').val();
    let ins_lob_id = $('#edit_quality_program_ins_lob').val();
    let name = $('#edit_quality_program_name').val();
    let display = $('#edit_quality_program_display').val();
    let description = $('#edit_quality_program_description').val();
    let program_date = $('#edit_quality_program_date').val();
    
    if (ins_id == '' || ins_lob_id == 'Select LOB') {
      toastr.error("Please select Insurance or LOB");
    } else if (name == '' || display == '' || description == '' || program_date == '') {
        toastr.error("Please enter complete information");
    } else {
        let entry = {
          ins_id : ins_id,
          ins_lob_id: ins_lob_id,
          name: name,
          display: display,
          description: description,
          program_date: program_date
        }    
        sendRequestWithToken('PUT', localStorage.getItem('authToken'), entry, `reportBuilder/qualityProgram/${id}`, (xhr, err) => {
            if (!err) {                
                hedis_quality_program_table.ajax.reload();
                $('#hedis_quality_program_id').val('');
                // $('#edit_select_ins').val(null).trigger('change');
                // $('#edit_quality_program_ins_lob').val(null).trigger('change');
                $('#edit_quality_program_name').val('');
                $('#edit_quality_program_display').val('');
                $('#edit_quality_program_description').val('');
                $('#edit_quality_program_date').val('');
                $('#edit_modal').modal('hide');
                toastr.success("Action Success");
            } else {
                return toastr.error("Action Failed");
            }
        });
      }        
  });
});