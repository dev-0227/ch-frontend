$(document).ready(async function () {
    "use strict";

    var appt_type_table = $('#appt_type_table').DataTable({
        "ajax": {
            "url": serviceUrl + "hedis/appointmentType",
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
            { data: 'category',
              render: function (data, type, row) {
                var category = "PCP";
                var color = "primary";
                switch(row.category){
                  case 1: category = "PCP"; color="primary"; break;
                  case 2: category = "Specialty"; color="info"; break;
                }
                return '<div class="badge badge-'+color+' fw-bold badge-lg">'+category+'</span>';
              }  
            },
            { data: 'visit' },
            { data: 'obgyn',
                render: function (data, type, row) {
                return row.obgyn=="0"?"No":"Yes";
              }  
            },
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

    $(document).on("click","#appt_type_add_btn",function(){
        $("#appt_type_id").val('');
        $("#appt_type_name").val('');
        $("#appt_type_description").val('');
        $("#appt_type_category").val('1');
        $("#appt_type_visit").val('Physical Visit');
        $("#appt_type_obgyn").val('0');
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
        let entry = {}

        $('.form-control').each(function() {
        if($(this).data('field')!==undefined){
            entry[$(this).data('field')] = $(this).val();
        }
        });
        if($("#appt_type_id").val() == ""){
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/appointmentType/create", (xhr, err) => {
            if (!err) {
            $("#appt_type_modal").modal("hide");
            return toastr.success("Action successfully");
            } else {
            return toastr.error("Action Failed");
            }
        });
        }else{
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/appointmentType/update", (xhr, err) => {
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/appointmentType/chosen", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#appt_type_name").val(result[0]['name']);
            $("#appt_type_description").val(result[0]['description']);
            $("#appt_type_category").val(result[0]['category']);
            $("#appt_type_visit").val(result[0]['visit']);
            $("#appt_type_obgyn").val(result[0]['obgyn']);
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
              sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/appointmentType/delete", (xhr, err) => {
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
    

    
});