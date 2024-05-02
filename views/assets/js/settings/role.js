$(document).ready(function () {
  "use strict";
  var role_table = $('#role_table').DataTable({
    "ajax": {
        "url": serviceUrl + "role/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "pageLength": 10,
    "order": [],
    "columns": [
        { data: 'code' },
        { data: "name",
          render: function (data, type, row) {
            return row.name;
          } 
        },
        { data: 'description' },
        { data: 'createdAt',
            render: function (data, type, row) {
              return row.createdAt.replace('T', ' ').substr(0, 19);
            }  
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top " idkey="`+row.id+`">
                <button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button" data-type="`+row.code+`"><i class="fa fa-edit"></i> Edit</button>
                <button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "permission", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var permissions = []
      for(var i=0; i<result.length;i++){
        var names = result[i]['name'].split('_');
        permissions[names[0]]=[];

      }
      for(var i=0; i<result.length;i++){
        var names = result[i]['name'].split('_');
        permissions[names[0]].push(result[i]);

      }
      var i=0;
      var html = '<div class="accordion" id="kt_accordion_1">';
      for (const key in permissions) {
        var collapse = "";
        if(i==0)collapse = "show";
        html += '<div class="accordion-item">';
        html += '<h2 class="accordion-header" id="kt_accordion_1_header_'+i+'">';
        html += '<button class="accordion-button fs-4 fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_body_'+i+'" aria-expanded="true" aria-controls="kt_accordion_1_body_'+i+'">';
        html += key;
        html += '</button></h2>';
        html += '<div id="kt_accordion_1_body_'+i+'" class="accordion-collapse collapse '+collapse+'" aria-labelledby="kt_accordion_1_header_'+i+'" data-bs-parent="#kt_accordion_1">';
        html += '<div class="accordion-body">';
        for(var j=0; j<permissions[key].length; j++){
          var row = permissions[key][j];
          html += '<div class="row p-2" style="border-bottom:1pt dashed #cccccc;">';
          html += '<div class="col-md-6 d-flex mr-2 " style="justify-content: right;">'+row['name']+':</div>';
          html += '<div class="col-md-2 d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_1" data-id="'+row['id']+'" data-type="1"></div><div class="px-3">Read</div>';
          html += '</div>';
          html += '<div class="col-md-2 d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_2" data-id="'+row['id']+'" data-type="2"></div><div class="px-3">Write</div>';
          html += '</div>';
          html += '<div class="col-md-2 d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_3" data-id="'+row['id']+'" data-type="3"></div><div class="px-3">Create</div>';
          html += '</div></div>';
          
        }
        html += '</div></div></div>';
        i++;
      }
      html += '</div>';
      $("#accordion").html(html);
      
    }
  });

  $(document).on("click","#ch_all",function(){
    $('.ch_permission').prop('checked', $(this).prop('checked'));
  });

  $(document).on("click","#add_btn",function(){
    $("#aname").val('');
    $("#adescription").val('');
    $("#role-add-modal").modal("show");
  });

  $("#create_btn").click(function (e) {
    if($("#acode").val() == ""){
      toastr.info('Please enter Code');
      $("#acode").focus();
      return;
    }
    if($("#aname").val() == ""){
      toastr.info('Please enter Role Name');
      $("#aname").focus();
      return;
    }
    if($("#adescription").val() == ""){
      toastr.info('Please enter Description');
      $("#adescription").focus();
      return;
    }
    let entry = {
      code: document.getElementById('acode').value,
      name: document.getElementById('aname').value,
      description: document.getElementById('adescription').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/add", (xhr, err) => {
        if (!err) {
          $("#role-add-modal").modal("hide");
          toastr.success("role is added successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      role_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".edit_btn",function(){
    $('#ch_all').prop('checked', false);
    $(".ch_permission").each(function() {
      $(this).prop('checked', false);
    });
    $("#chosen_role").val($(this).data("type"));

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $(this).parent().attr("idkey")}, "role/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#ucode").val(result[0]['code']);
        $("#uname").val(result[0]['name']);
        $("#udescription").val(result[0]['description']);
        $("#role-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $(this).data("type")}, "role/getPermission", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        for(var i=0; i<result.length; i++){
          $('#ch_'+result[i].perm_id+'_1').prop('checked', result[i].value.charAt(0)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_2').prop('checked', result[i].value.charAt(1)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_3').prop('checked', result[i].value.charAt(2)=="1"?true:false);
        }
        $("#role-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");;
      }
    });
  });

  $("#update_btn").click(function (e) {
    if($("#ucode").val() == ""){
      toastr.info('Please enter Code');
      $("#ucode").focus();
      return;
    }
    if($("#uname").val() == ""){
      toastr.info('Please enter Role Name');
      $("#uname").focus();
      return;
    }
    if($("#udescription").val() == ""){
      toastr.info('Please enter Description');
      $("#udescription").focus();
      return;
    }
    var p = '';
    $(".ch_permission").each(function() {
      if(p!="")p += ',';
      p += $(this).data('id')+'_'+$(this).data('type')+'_';
      p += $(this).prop('checked')?'1':'0';
    });
    let entry = {
      id: document.getElementById('chosen_role').value,
      code: document.getElementById('ucode').value,
      name: document.getElementById('uname').value,
      description: document.getElementById('udescription').value,
      permission: p
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/update", (xhr, err) => {
        if (!err) {
          $("#role-edit-modal").modal("hide");
          toastr.success("role is updated successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      role_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".delete_btn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              role_table.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});

  });

});
