$(document).ready(function () {
    "use strict";
    var organization_table = $('#organization_table').DataTable({
        "ajax": {
            "url": serviceUrl + "organization/type/",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        "fixedColumns": {
            right: 1
        },
        "pageLength": 10,
        "order": [],
        "columns": [
            { data: 'code' ,
                render: function(data, type, row) {
                    return row.code;
                }
            },
            { data: 'system',
              render: function (data, type, row) {
                return `<a href="` + row.system + `" class="btn btn-link btn-color-primary btn-active-color-danger" target="blank" style="margin: -5px;">` + row.system + `</a>`;
              } 
            },
            { data: 'display', 
                render: function(data, type, row) {
                    return row.display;
                }
             },
            { data: 'definition',
                render: function (data, type, row) {
                  return row.definition;
                }  
            },
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top " idkey="`+row.id+`">
                    <button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
                    <button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>
                  </div>
                `
              } 
            }
        ]
      });

    $(document).on("click",".organizationaddbtn",function(){
      $("#acode").val('');
      $("#asystem").val('');
      $("#adisplay").val('');
      $("#adefinition").val('');
      $("#organization-add-modal").modal("show");
    });
  
    $("#create_btn").click(function (e) {
      if($("#acode").val() == ""){
        toastr.info('Please enter Organization Code');
        $("#acode").focus();
        return;
      }
      if($("#asystem").val() == ""){
        toastr.info('Please enter System');
        $("#asystem").focus();
        return;
      }
      if($("#adisplay").val() == ""){
        toastr.info('Please enter Display');
        $("#adisplay").focus();
        return;
      }
      let entry = {
        code: document.getElementById('acode').value,
        system: document.getElementById('asystem').value,
        display: document.getElementById('adisplay').value,
        definition: document.getElementById('adefinition').value
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/type/add", (xhr, err) => {
          if (!err) {
            toastr.success("organization is added successfully");
            $("#organization-add-modal").modal("hide");
          } else {
            return toastr.error("Action Failed");
          }
      });
      setTimeout( function () {
        organization_table.ajax.reload();
      }, 1000 );
    });
  
    $(document).on("click",".edit_btn",function(){
      let entry = {
        id: $(this).parent().attr("idkey"),
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/type/chosen", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          $("#ucode").val(result[0]['code']);
          $("#usystem").val(result[0]['system']);
          $("#udisplay").val(result[0]['display']);
          $("#udefinition").val(result[0]['definition']);
          $("#organization-edit-modal").modal("show");
        } else {
          return toastr.error("Action Failed");
        }
      });
    });
  
    $("#update_btn").click(function (e) {
      if($("#ucode").val() == ""){
        toastr.info('Please enter Organization Code');
        $("#ucode").focus();
        return;
      }
      if($("#usystem").val() == ""){
        toastr.info('Please enter System');
        $("#usystem").focus();
        return;
      }
      if($("#udisplay").val() == ""){
        toastr.info('Please enter System');
        $("#udisplay").focus();
        return;
      }
      let entry = {
        id: $(".edit_btn").parent().attr("idkey"),
        code: document.getElementById('ucode').value,
        system: document.getElementById('usystem').value,
        display: document.getElementById('udisplay').value,
        definition: document.getElementById('udefinition').value
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/type/update", (xhr, err) => {
          if (!err) {
            toastr.success("organization is updated successfully");
            $("#organization-edit-modal").modal("hide");
          } else {
            return toastr.error("Action Failed");
          }
      });
      setTimeout( function () {
        organization_table.ajax.reload();
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
          sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/type/delete", (xhr, err) => {
            if (!err) {
              setTimeout( function () {
                organization_table.ajax.reload();
              }, 1000 );
            } else {
              return toastr.error("Action Failed");
            }
          });
        }
          });
  
      
    });
  
  });
  