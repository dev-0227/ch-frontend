$(document).ready(function () {
  "use strict";
  var vital_table = $('#vital_table').DataTable({
    "ajax": {
        "url": serviceUrl + "vital/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "pageLength": 10,
    "order": [],
    "columns": [
        { data: "vname"},
        { data: 'vdescription' },
        { data: 'LOINC',
          render: function (data, type, row) {
            return '<div title="'+row.LOINC_Name+'">'+row.LOINC+'</div>';
          } 
        },
        { data: 'UCUM_Units',
          render: function (data, type, row) {
            return row.UCUM_Units?row.UCUM_Units:'-';
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top " idkey="`+row.id+`">
                <button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button"><i class="fa fa-edit"></i> Edit</button>
                <button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });


  $(document).on("click","#add_btn",function(){
    $("#aname").val('');
    $("#adescription").val('');
    $("#acode").val('');
    $("#acomment").val('');
    $("#aunit").val('');
    $("#asnomed").val('');
    $("#aecl").val('');
    $("#vital-add-modal").modal("show");
  });

  $("#create_btn").click(function (e) {
    if($("#aname").val() == ""){
      toastr.info('Please enter Profile Name');
      $("#aname").focus();
      return;
    }
    if($("#adescription").val() == ""){
      toastr.info('Please enter Description');
      $("#adescription").focus();
      return;
    }
    if($("#acode").val() == ""){
      toastr.info('Please enter LOINC Code');
      $("#acode").focus();
      return;
    }
    if($("#acomment").val() == ""){
      toastr.info('Please enter LOINC Name and Comments');
      $("#acomment").focus();
      return;
    }
    let entry = {
      name: document.getElementById('aname').value,
      description: document.getElementById('adescription').value,
      code: document.getElementById('acode').value,
      unit: document.getElementById('aunit').value,
      comment: document.getElementById('acomment').value,
      snomed: document.getElementById('asnomed').value,
      ecl: document.getElementById('aecl').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "vital/add", (xhr, err) => {
        if (!err) {
          $("#vital-add-modal").modal("hide");
          toastr.success("Vital is added successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      vital_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".edit_btn",function(){
    
    $("#chosen_vital").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "vital/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#uname").val(result[0]['vname']);
        $("#udescription").val(result[0]['vdescription']);
        $("#ucode").val(result[0]['LOINC']);
        $("#ucomment").val(result[0]['LOINC_Name']);
        $("#uunit").val(result[0]['UCUM_Units']);
        $("#usnomed").val(result[0]['SNOMED']);
        $("#uecl").val(result[0]['ECL']);
        $("#vital-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });

    
  });

  $("#update_btn").click(function (e) {
    if($("#uname").val() == ""){
      toastr.info('Please enter Profile Name');
      $("#uname").focus();
      return;
    }
    if($("#udescription").val() == ""){
      toastr.info('Please enter Description');
      $("#udescription").focus();
      return;
    }
    if($("#ucode").val() == ""){
      toastr.info('Please enter LOINC Code');
      $("#ucode").focus();
      return;
    }
    if($("#ucomment").val() == ""){
      toastr.info('Please enter LOINC Name and Comments');
      $("#ucomment").focus();
      return;
    }
    let entry = {
      id: document.getElementById('chosen_vital').value,
      name: document.getElementById('uname').value,
      description: document.getElementById('udescription').value,
      code: document.getElementById('ucode').value,
      unit: document.getElementById('uunit').value,
      comment: document.getElementById('ucomment').value,
      snomed: document.getElementById('usnomed').value,
      ecl: document.getElementById('uecl').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "vital/update", (xhr, err) => {
        if (!err) {
          $("#vital-edit-modal").modal("hide");
          toastr.success("Vital is updated successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      vital_table.ajax.reload();
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
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
      }
		}).then(function (result) {
      if (result.value) {
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "vital/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              vital_table.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});

  });

});
