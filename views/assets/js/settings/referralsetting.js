$(document).ready(async function () {
    "use strict";

    var referral_type_table = $('#referral_type_table').DataTable({
        "ajax": {
            "url": serviceUrl + "referral/referralType",
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

    $('#referral_type_table_search_input').on('keyup', function () {
      referral_type_table.search(this.value).draw();
    });

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/referralCategory", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          var options = '';
          for(var i=0; i<result.length; i++){
            options += '<option value="'+result[i]['id']+'" >'+result[i]['name']+'</option>';
          }
          $("#referral_type_category").html(options);
        }
      });

    $(document).on("click","#referral_type_add_btn",function(){
        $("#referral_type_id").val('');
        $("#referral_type_name").val('');
        $("#referral_type_description").val('');
        $("#referral_type_category").val('1');
        $("#referral_type_visit").val('Physical Visit');
        $("#referral_type_duration").val('15');
        $("#referral_type_status").val('1');
        $("#referral_type_color").val("#cccccc");
        $("#referral_type_modal").modal("show");
    });

    $(document).on("click","#referral_type_create",function(){
        if($("#referral_type_name").val() == ""){
            toastr.info('Please enter Name');
            $("#referral_type_name").focus();
            return;
        }
        if(!$("#referral_type_category").val() || $("#referral_type_category").val() == ""){
            toastr.info('Please select Category');
            $("#referral_type_category").focus();
            return;
        }
        let entry = {}

        $('.form-control').each(function() {
        if($(this).data('field')!==undefined){
            entry[$(this).data('field')] = $(this).val();
        }
        });
        if($("#referral_type_id").val() == ""){
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralType/create", (xhr, err) => {
            if (!err) {
            $("#referral_type_modal").modal("hide");
            return toastr.success("Action successfully");
            } else {
            return toastr.error("Action Failed");
            }
        });
        }else{
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralType/update", (xhr, err) => {
            if (!err) {
            $("#referral_type_modal").modal("hide");
            return toastr.success("Action successfully");
            } else {
            return toastr.error("Action Failed");
            }
        });
        }
        
        setTimeout( function () {
        referral_type_table.ajax.reload();
        }, 1000 );
    });

    $(document).on("click",".editappttypebtn",function(){
        $("#referral_type_id").val($(this).parent().attr("idkey"));
        let entry = {
          id: $("#referral_type_id").val(),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralType/chosen", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#referral_type_name").val(result[0]['name']);
            $("#referral_type_description").val(result[0]['description']);
            $("#referral_type_category").val(result[0]['category']);
            $("#referral_type_visit").val(result[0]['visit']);
            $("#referral_type_duration").val(result[0]['duration']);
            $("#referral_type_status").val(result[0]['status']);
            $("#referral_type_color").val(result[0]['color']);
            $("#referral_type_modal").modal("show");
          } else {
            return toastr.error("Action Failed");
          }
        });
    });

    $(document).on("click",".deleteappttiypebtn",function(){
        $("#referral_type_id").val($(this).parent().attr("idkey"));
        let entry = {
          id: $("#referral_type_id").val(),
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
              sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralType/delete", (xhr, err) => {
                if (!err) {
                  setTimeout( function () {
                    referral_type_table.ajax.reload();
                  }, 1000 );
                } else {
                  toastr.error('Credential is invalid');
                }
              });	
            }
              });
    });


/******************************* Referral Category Type *************************************************** */

    var referral_category_table = $('#referral_category_table').DataTable({
        "ajax": {
            "url": serviceUrl + "referral/referralCategory",
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
                  <button class="btn btn-sm btn-primary edit_referral_category_btn"><i class="fa fa-edit"></i> Edit</button>
                  <button class="btn btn-sm btn-danger delete_referral_category_btn"><i class="fa fa-trash"></i> Delete</button>
                  </div>
                `
              } 
            }
        ],
    });


    $(document).on("click","#referral_category_add_btn",function(){
        $("#referral_category_id").val('');
        $("#referral_category_name").val('');
        $("#referral_category_description").val('');
        $("#referral_category_modal").modal("show");
    });

    $(document).on("click","#referral_category_create",function(){
        if($("#referral_category_name").val() == ""){
            toastr.info('Please enter Name');
            $("#referral_category_name").focus();
            return;
        }
        let entry = {
            id: $('#referral_category_id').val(),
            name: $('#referral_category_name').val(),
            description: $('#referral_category_description').val(),
          }

        if($("#referral_category_id").val() == ""){
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralCategory/create", (xhr, err) => {
            if (!err) {
            $("#referral_category_modal").modal("hide");
            return toastr.success("Action successfully");
            } else {
            return toastr.error("Action Failed");
            }
        });
        }else{
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralCategory/update", (xhr, err) => {
            if (!err) {
            $("#referral_category_modal").modal("hide");
            return toastr.success("Action successfully");
            } else {
            return toastr.error("Action Failed");
            }
        });
        }
        
        setTimeout( function () {
        referral_category_table.ajax.reload();
        }, 1000 );
    });

    $(document).on("click",".edit_referral_category_btn",function(){
        $("#referral_category_id").val($(this).parent().attr("idkey"));
        let entry = {
          id: $("#referral_category_id").val(),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralCategory/chosen", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#referral_category_name").val(result[0]['name']);
            $("#referral_category_description").val(result[0]['description']);
            $("#referral_category_modal").modal("show");
          } else {
            return toastr.error("Action Failed");
          }
        });
    });

    $(document).on("click",".delete_referral_category_btn",function(){
        $("#referral_category_id").val($(this).parent().attr("idkey"));
        let entry = {
          id: $("#referral_category_id").val(),
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
              sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referralCategory/delete", (xhr, err) => {
                if (!err) {
                  setTimeout( function () {
                    referral_category_table.ajax.reload();
                  }, 1000 );
                } else {
                  toastr.error('Credential is invalid');
                }
              });	
            }
        });
    });
    

    
});