$(document).ready(async function () {
  "use strict";

  var appt_type_table = $('#appt_type_table').DataTable({
      "ajax": {
          "url": serviceUrl + "referral/appointmentType",
          "type": "GET",
          "headers": { 'Authorization': localStorage.getItem('authToken') }
      },
      "columns": [
          { data: 'color',
              render: function (data, type, row) {
              return '<div style="background:'+row.color+'" class="w-50px h-30px border "></div>';
              }  
          },
          { data: 'name' },
          { data: 'categoryName'},
          { data: 'visit' },
          { data: 'duration' },
          { data: 'status',
              render: function (data, type, row) {
              var status = "Active";
              var color = "success";
              switch(row.status){
                  case 1: status = "Active"; color="success"; break;
                  case 0: status = "Inactive"; color="danger"; break;
              }
              return '<div class="badge badge-'+color+' fw-bold badge-lg">'+status+'</span>';
              }  
          },
          { data: 'id',
            render: function (data, type, row) {
              return `
                <div idkey="`+row.id+`">
                <button class="btn btn-sm btn-primary editappttypebtn"><i class="fa fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger deleteappttiypebtn"><i class="fa fa-trash"></i> Delete</button>
                </div>
              `
            } 
          }
      ],
  });

  $('#appt_type_table_search_input').on('keyup', function () {
    appt_type_table.search(this.value).draw();
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentCategory", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        var options = '';
        for(var i=0; i<result.length; i++){
          options += '<option value="'+result[i]['id']+'" >'+result[i]['name']+'</option>';
        }
        $("#appt_type_category").html(options);
      }
  });

  $(document).on("click","#appt_type_add_btn",function(){
      $("#appt_type_id").val('');
      $("#appt_type_name").val('');
      $("#appt_type_description").val('');
      $("#appt_type_category").val('1');
      $("#appt_type_visit").val('Physical Visit');
      $("#appt_type_duration").val('15');
      $("#appt_type_status").val('1');
      $("#appt_type_color").val("#cccccc");
      $("#appt_type_modal").modal("show");
  });

  $(document).on("click","#appt_type_create",function(){
      if($("#appt_type_name").val() == ""){
          toastr.info('Please enter Name');
          $("#appt_type_name").focus();
          return;
      }
      if(!$("#appt_type_category").val() || $("#appt_type_category").val() == ""){
          toastr.info('Please select Category');
          $("#appt_type_category").focus();
          return;
      }
      let entry = {}

      $('.form-control').each(function() {
      if($(this).data('field')!==undefined){
          entry[$(this).data('field')] = $(this).val();
      }
      });
      if($("#appt_type_id").val() == ""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentType/create", (xhr, err) => {
          if (!err) {
          $("#appt_type_modal").modal("hide");
          return toastr.success("Action successfully");
          } else {
          return toastr.error("Action Failed");
          }
      });
      }else{
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentType/update", (xhr, err) => {
          if (!err) {
          $("#appt_type_modal").modal("hide");
          return toastr.success("Action successfully");
          } else {
          return toastr.error("Action Failed");
          }
      });
      }
      
      setTimeout( function () {
      appt_type_table.ajax.reload();
      }, 1000 );
  });

  $(document).on("click",".editappttypebtn",function(){
      $("#appt_type_id").val($(this).parent().attr("idkey"));
      let entry = {
        id: $("#appt_type_id").val(),
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentType/chosen", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          $("#appt_type_name").val(result[0]['name']);
          $("#appt_type_description").val(result[0]['description']);
          $("#appt_type_category").val(result[0]['category']);
          $("#appt_type_visit").val(result[0]['visit']);
          $("#appt_type_duration").val(result[0]['duration']);
          $("#appt_type_status").val(result[0]['status']);
          $("#appt_type_color").val(result[0]['color']);
          $("#appt_type_modal").modal("show");
        } else {
          return toastr.error("Action Failed");
        }
      });
  });

  $(document).on("click",".deleteappttiypebtn",function(){
      $("#appt_type_id").val($(this).parent().attr("idkey"));
      let entry = {
        id: $("#appt_type_id").val(),
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
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentType/delete", (xhr, err) => {
              if (!err) {
                setTimeout( function () {
                  appt_type_table.ajax.reload();
                }, 1000 );
              } else {
                toastr.error('Credential is invalid');
              }
            });	
          }
            });
  });

/******************************* Appointment Category Type *************************************************** */
  var appt_category_table = $('#appt_category_table').DataTable({
      "ajax": {
          "url": serviceUrl + "referral/appointmentCategory",
          "type": "GET",
          "headers": { 'Authorization': localStorage.getItem('authToken') }
      },
      "columns": [
          { data: 'name' },
          { data: 'description' },
          { data: 'id',
            render: function (data, type, row) {
              return `
                <div idkey="`+row.id+`">
                <button class="btn btn-sm btn-primary edit_appt_category_btn"><i class="fa fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger delete_appt_category_btn"><i class="fa fa-trash"></i> Delete</button>
                </div>
              `
            } 
          }
      ],
  });

  $(document).on("click","#appt_category_add_btn",function(){
      $("#appt_category_id").val('');
      $("#appt_category_name").val('');
      $("#appt_category_description").val('');
      $("#appt_category_modal").modal("show");
  });

  $(document).on("click","#appt_category_create",function(){
      if($("#appt_category_name").val() == ""){
          toastr.info('Please enter Name');
          $("#appt_category_name").focus();
          return;
      }
      let entry = {
          id: $('#appt_category_id').val(),
          name: $('#appt_category_name').val(),
          description: $('#appt_category_description').val(),
        }

      if($("#appt_category_id").val() == ""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentCategory/create", (xhr, err) => {
          if (!err) {
          $("#appt_category_modal").modal("hide");
          return toastr.success("Action successfully");
          } else {
          return toastr.error("Action Failed");
          }
      });
      }else{
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentCategory/update", (xhr, err) => {
          if (!err) {
          $("#appt_category_modal").modal("hide");
          return toastr.success("Action successfully");
          } else {
          return toastr.error("Action Failed");
          }
      });
      }
      
      setTimeout( function () {
      appt_category_table.ajax.reload();
      }, 1000 );
  });

  $(document).on("click",".edit_appt_category_btn",function(){
      $("#appt_category_id").val($(this).parent().attr("idkey"));
      let entry = {
        id: $("#appt_category_id").val(),
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentCategory/chosen", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          $("#appt_category_name").val(result[0]['name']);
          $("#appt_category_description").val(result[0]['description']);
          $("#appt_category_modal").modal("show");
        } else {
          return toastr.error("Action Failed");
        }
      });
  });

  $(document).on("click",".delete_appt_category_btn",function(){
      $("#appt_category_id").val($(this).parent().attr("idkey"));
      let entry = {
        id: $("#appt_category_id").val(),
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
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentCategory/delete", (xhr, err) => {
              if (!err) {
                setTimeout( function () {
                  appt_category_table.ajax.reload();
                }, 1000 );
              } else {
                toastr.error('Credential is invalid');
              }
            });	
          }
      });
  });
    
  /******************************* Calendar Type *************************************************** */
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, "setting/appointment/doctor/type", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      for(var i=0; i<result.length; i++){
        $("#appointment_calendar_"+result[i]['item']).prop('checked', result[i]['value']==""?false:true)
      }
    } else {
      toastr.error('Credential is invalid');
    }
  });	

  $(document).on("change",".calendar-view",function(){
    var entry={
      item: $(this).data("type"),
      value: $(this).prop("checked")?$(this).data("value"):""
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/appointment/doctor/type/set", (xhr, err) => {
      if (!err) {
        
      } else {
        toastr.error('Credential is invalid');
      }
    });	

  });

  /******************************* Appointment Status *************************************************** */
  var appt_status_table = $('#appt_status_table').DataTable({
    "ajax": {
        "url": serviceUrl + "referral/appointmentStatus",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "fixedColumns": {
      right: 1
    },
    "columns": [
        { data: 'code' },
        { data: 'system',
          render: function(data, type, row) {
            return `<a href="` + row.system + `" class="btn btn-link btn-color-primary btn-active-color-danger" target="blank" style="margin: -5px;">` + row.system + `</a>`
          }
        },
        { data: 'display' },
        { data: 'definition' },
        { data: 'canonical' },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary edit_appt_status_btn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger delete_appt_status_btn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  });

  $(document).on("click","#appt_status_add_btn",function(){
    $("#appt_status_id").val('');
    $("#appt_status_code").val('');
    $("#appt_status_system").val('');
    $("#appt_status_display").val('');
    $("#appt_status_definition").val('');
    $("#appt_status_canonical").val('');
    $("#appt_status_modal").modal("show");
  });

  $(document).on("click","#appt_status_create",function(){
    if($("#appt_status_code").val() == ""){
      toastr.info('Please Enter Code');
      $("#appt_status_code").focus();
      return;
    }
    if($("#appt_status_display").val() == ""){
      toastr.info('Please Enter Display');
      $("#appt_status_display").focus();
      return;
    }
    let entry = {
        id: $('#appt_status_id').val(),
        code: $('#appt_status_code').val(),
        system: $('#appt_status_system').val(),
        display: $('#appt_status_display').val(),
        definition: $('#appt_status_definition').val(),
        canonical: $('#appt_status_canonical').val(),
      }

    if($("#appt_status_id").val() == ""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentStatus/create", (xhr, err) => {
        if (!err) {
          $("#appt_status_modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
      });
    }else{
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentStatus/update", (xhr, err) => {
        if (!err) {
          $("#appt_status_modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    }
    
    setTimeout( function () {
      appt_status_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".edit_appt_status_btn",function(){
    $("#appt_status_id").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#appt_status_id").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentStatus/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#appt_status_code").val(result[0]['code']);
        $("#appt_status_system").val(result[0]['system']);
        $("#appt_status_display").val(result[0]['display']);
        $("#appt_status_definition").val(result[0]['definition']);
        $("#appt_status_canonical").val(result[0]['canonical']);
        $("#appt_status_modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });

  $(document).on("click",".delete_appt_status_btn",function(){
    $("#appt_status_id").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#appt_status_id").val(),
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentStatus/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              appt_status_table.ajax.reload();
            }, 1000 );
          } else {
            toastr.error('Credential is invalid');
          }
        });	
      }
    });
  });

  /******************************* Appointment Barrier *************************************************** */
  var appt_barrier_table = $('#appt_barrier_table').DataTable({
    "ajax": {
        "url": serviceUrl + "referral/appointmentBarrier",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "fixedColumns": {
      right: 1
    },
    "columns": [
      { data: 'code' },
        { data: 'reason' },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary edit_appt_barrier_btn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger delete_appt_barrier_btn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  });

  $(document).on("click","#appt_barrier_add_btn",function(){
    $("#appt_barrier_id").val('');
    $("#appt_barrier_reason").val('');
    $("#appt_barrier_code").val('');
    $("#appt_barrier_modal").modal("show");
  });

  $(document).on("click","#appt_barrier_create",function(){
    if($("#appt_barrier_code").val() == ""){
      toastr.info('Please Enter Code');
      $("#appt_barrier_code").focus();
      return;
    }
    if($("#appt_barrier_reason").val() == ""){
      toastr.info('Please Enter Reason');
      $("#appt_barrier_reason").focus();
      return;
    }
    let entry = {
        id: $('#appt_barrier_id').val(),
        code: $("#appt_barrier_code").val(),
        reason: $('#appt_barrier_reason').val(),
      }

    if($("#appt_barrier_id").val() == ""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentBarrier/create", (xhr, err) => {
        if (!err) {
          $("#appt_barrier_modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
      });
    }else{
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentBarrier/update", (xhr, err) => {
        if (!err) {
          $("#appt_barrier_modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    }
    
    setTimeout( function () {
      appt_barrier_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".edit_appt_barrier_btn",function(){
    $("#appt_barrier_id").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#appt_barrier_id").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentBarrier/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#appt_barrier_code").val(result[0]['code']);
        $("#appt_barrier_reason").val(result[0]['reason']);
        $("#appt_barrier_modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });

  $(document).on("click",".delete_appt_barrier_btn",function(){
    $("#appt_barrier_id").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#appt_barrier_id").val(),
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentBarrier/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              appt_barrier_table.ajax.reload();
            }, 1000 );
          } else {
            toastr.error('Credential is invalid');
          }
        });	
      }
    });
  });
});
