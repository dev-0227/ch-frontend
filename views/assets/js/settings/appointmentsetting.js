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
    
/******************************* Specialty Type *************************************************** */

var appt_specialty_table = $('#appt_specialty_table').DataTable({
  "ajax": {
      "url": serviceUrl + "referral/appointmentSpecialty",
      "type": "GET",
      "headers": { 'Authorization': localStorage.getItem('authToken') }
  },
  "columns": [
      { data: 'name' },
      { data: 'mid',
        render: function (data, type, row) {
          return row.mid.replace(",", ", ");
        } 
     },
      { data: 'description' },
      { data: 'id',
        render: function (data, type, row) {
          return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary edit_appt_specialty_btn"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger delete_appt_specialty_btn"><i class="fa fa-trash"></i> Delete</button>
            </div>
          `
        } 
      }
  ],
});

$('#specialty_table_search_input').on('keyup', function () {
  appt_specialty_table.search(this.value).draw();
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/measuresData", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['measureId']+'" >'+result[i]['measureId']+' - '+result[i]['title']+'</option>';
    }
    $("#appt_specialty_measures").html(options);
  }
});


$(document).on("click","#appt_specialty_add_btn",function(){
  $("#appt_specialty_id").val('');
  $("#appt_specialty_name").val('');
  $("#appt_specialty_description").val('');
  $("#appt_specialty_measures").val('');
  $("#appt_specialty_modal").modal("show");
});

$(document).on("click","#appt_specialty_create",function(){
  if($("#appt_specialty_name").val() == ""){
      toastr.info('Please enter Name');
      $("#appt_specialty_name").focus();
      return;
  }
  let entry = {
      id: $('#appt_specialty_id').val(),
      name: $('#appt_specialty_name').val(),
      description: $('#appt_specialty_description').val(),
      mid: $('#appt_specialty_measures').val().toString(),
    }

  if($("#appt_specialty_id").val() == ""){
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentSpecialty/create", (xhr, err) => {
      if (!err) {
      $("#appt_specialty_modal").modal("hide");
      return toastr.success("Action successfully");
      } else {
      return toastr.error("Action Failed");
      }
  });
  }else{
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentSpecialty/update", (xhr, err) => {
      if (!err) {
      $("#appt_specialty_modal").modal("hide");
      return toastr.success("Action successfully");
      } else {
      return toastr.error("Action Failed");
      }
  });
  }
  
  setTimeout( function () {
  appt_specialty_table.ajax.reload();
  }, 1000 );
});

$(document).on("click",".edit_appt_specialty_btn",function(){
  $("#appt_specialty_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#appt_specialty_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentSpecialty/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#appt_specialty_name").val(result[0]['name']);
      $("#appt_specialty_description").val(result[0]['description']);
      $("#appt_specialty_measures").val(result[0]['mid'].split(",")).trigger('change');
      $("#appt_specialty_modal").modal("show");
    } else {
      return toastr.error("Action Failed");
    }
  });
});





$(document).on("click",".delete_appt_specialty_btn",function(){
  $("#appt_specialty_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#appt_specialty_id").val(),
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointmentSpecialty/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              appt_specialty_table.ajax.reload();
            }, 1000 );
          } else {
            toastr.error('Credential is invalid');
          }
        });	
      }
  });
});

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
    
});