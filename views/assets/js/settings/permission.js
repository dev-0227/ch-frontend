$(document).ready(function () {
  "use strict";
  load_data();
  function load_data(){
    
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "permission", (xhr, err) => {
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


          var html = '<div class="accordion" id="kt_accordion_1">';
          var i = 0;
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
            for(var n=0; n<permissions[key].length; n++){
              var row = permissions[key][n];
              var str = row.assigned+'';
              var assign = str.split(",");
              var vstr = row.v+'';
              var values = vstr.split(",");
              var assignRoles = "";
              for(var j=0; j<assign.length; j++){
                if(assign[j] != "null"){
                  if(values[j] != '000')
                  assignRoles += '<span class="mx-2 px-2 badge badge-primary badge-square badge-lg" >'+assign[j]+'</span>'
                }
                
              }
              html += '<div class="row p-1 mt-3" style="border-bottom: solid 1px #eeeccc; ">';
              html += '<div class="col-md-4 cursor-pointer" data-bs-toggle="tooltip" data-bs-custom-class="tooltip-inverse" data-bs-placement="top"  title="'+row.description+'">';
              html += row.name;
              html += '</div>';
              html += '<di class="col-md-6">';
              html += assignRoles;
              html += '</di>';
              html += '<div class="col-md-2">';
              html += '<div class="btn-group align-top " idkey="'+row.id+'`">';
              html += '<button class="btn btn-sm  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button"><i class="fa fa-edit"></i> Edit</button>';
              html += '<button class="btn btn-sm  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>';
              html += '</div>'
              html += '</div>';
              html += '</div>';
            }
            html += '</div></div></div>';
            i++;
          }
          html += '</div>';
          $('#accordion').html(html);
        }
    });
  }

  $(document).on("click",".permissionaddbtn",function(){
    $("#aname").val('');
    $("#adescription").val('');
    $("#permission-add-modal").modal("show");
  });

  $("#create_btn").click(function (e) {
    if($("#aname").val() == ""){
      toastr.info('Please enter Permission Name');
      $("#aname").focus();
      return;
    }
    if($("#adescription").val() == ""){
      toastr.info('Please enter Description');
      $("#adescription").focus();
      return;
    }
    let entry = {
      name: document.getElementById('aname').value,
      description: document.getElementById('adescription').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/add", (xhr, err) => {
        if (!err) {
          toastr.success("permission is added successfully");
          $("#permission-add-modal").modal("hide");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      load_data()
    }, 1000 );
  });

  $(document).on("click",".edit_btn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#uname").val(result[0]['name']);
        $("#udescription").val(result[0]['description']);
        $("#permission-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });

  $("#update_btn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_user').value,
      name: document.getElementById('uname').value,
      description: document.getElementById('udescription').value
    }
    if($("#uname").val() == ""){
      toastr.info('Please enter Permission Name');
      $("#uname").focus();
      return;
    }
    if($("#udescription").val() == ""){
      toastr.info('Please enter Description');
      $("#udescription").focus();
      return;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/update", (xhr, err) => {
        if (!err) {
          toastr.success("permission is updated successfully");
          $("#permission-edit-modal").modal("hide");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      load_data()
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              load_data()
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});

    
  });

});
