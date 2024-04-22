$(document).ready(async function () {
    "use strict";

    var referral_type_table = $('#referral_type_table').DataTable({
        "ajax": {
            "url": serviceUrl + "referral/referral/status",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        "columns": [
            { data: 'id', visible: false},
            { data: 'categoryName'},
            { data: 'display' },
            { data: 'color',
                render: function (data, type, row) {
                var color = row.color?row.color:"#ffffff";
                return '<div style="background:'+color+'" class="w-50px h-30px border "></div>';
                }  
            },
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div idkey="`+row.id+`">
                  <button class="btn btn-sm btn-primary edit-referral"><i class="fa fa-edit"></i> Edit</button>
                  <button class="btn btn-sm btn-danger delete-referral"><i class="fa fa-trash"></i> Delete</button>
                  </div>
                `
              } 
            }
        ],
    });

    $('#referral_type_table_search_input').on('keyup', function () {
      referral_type_table.search(this.value).draw();
    });

    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/referral/category", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          var options = '';
          for(var i=0; i<result.length; i++){
            options += '<option value="'+result[i]['id']+'" >'+result[i]['display']+'</option>';
          }
          $("#referral_type_category").html(options);
        }
      });

    $(document).on("click","#referral_type_add_btn",function(){
        $("#referral_type_id").val('');
        $("#referral_type_display").val('');
        $("#referral_type_color").val("#ffffff");
        $("#referral_type_modal").modal("show");
    });

    $(document).on("click","#referral_type_create",function(){
        if($("#referral_type_display").val() == ""){
            toastr.info('Please enter Status');
            $("#referral_type_display").focus();
            return;
        }
        if(!$("#referral_type_category").val() || $("#referral_type_category").val() == ""){
            toastr.info('Please select Category');
            $("#referral_type_category").focus();
            return;
        }
        
        let entry = {
          id: $('#referral_type_id').val(),
          category: $('#referral_type_category').val(),
          display: $('#referral_type_display').val(),
          color: $('#referral_type_color').val()
        }
        if($("#referral_type_id").val() == ""){
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/status/create", (xhr, err) => {
            if (!err) {
            $("#referral_type_modal").modal("hide");
            return toastr.success("Action successfully");
            } else {
            return toastr.error("Action Failed");
            }
        });
        }else{
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/status/update", (xhr, err) => {
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

    $(document).on("click",".edit-referral",function(){
        $("#referral_type_id").val($(this).parent().attr("idkey"));
        let entry = {
          id: $("#referral_type_id").val(),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/status/chosen", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#referral_type_display").val(result[0]['display']);
            $("#referral_type_category").val(result[0]['category']);
            $("#referral_type_color").val(result[0]['color']);
            $("#referral_type_modal").modal("show");
          } else {
            return toastr.error("Action Failed");
          }
        });
    });

    $(document).on("click",".delete-referral",function(){
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
              sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/status/delete", (xhr, err) => {
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
            "url": serviceUrl + "referral/referral/category",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        "columns": [
            { data: 'id', visible: false},
            { data: 'display' },
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
        $("#referral_category_code").val('');
        $("#referral_category_display").val('');
        $("#referral_category_modal").modal("show");
    });

    $(document).on("click","#referral_category_create",function(){
        if($("#referral_category_display").val() == ""){
          toastr.info('Please enter Display');
          $("#referral_category_display").focus();
          return;
      }
        let entry = {
            id: $('#referral_category_id').val(),
            display: $('#referral_category_display').val(),
          }

        if($("#referral_category_id").val() == ""){
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/category/create", (xhr, err) => {
            if (!err) {
            $("#referral_category_modal").modal("hide");
            return toastr.success("Action successfully");
            } else {
            return toastr.error("Action Failed");
            }
        });
        }else{
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/category/update", (xhr, err) => {
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/category/chosen", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#referral_category_display").val(result[0]['display']);
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
              sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/category/delete", (xhr, err) => {
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