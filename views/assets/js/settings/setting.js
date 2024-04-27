$(document).ready(async function () {
  "use strict";
  var squestiontable = $('#squestiontable').DataTable({
    "ajax": {
        "url": serviceUrl + "setting/getallquestions",
        "type": "GET"
    },
    "columns": [
        { data: "question" },
        { data: 'status',
          render: function (data, type, row) {
            if(row.status == 1)
              return "<span class='tag tag-green'>Active</span>";
            else
              return "<span class='tag tag-red'>Inactive</span>";
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editsqbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletesqbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });

  var user_type_table = $('#user_type_table').DataTable({
    "ajax": {
        "url": serviceUrl + "setting/getallrole",
        "type": "POST",
        "data":{clinicid:localStorage.getItem('chosen_clinic')}
    },
    "columns": [
        { data: "name" },
        { data: 'status',
          render: function (data, type, row) {
            if(row.status == 1)
              return "<span class='tag tag-green'>Active</span>";
            else
              return "<span class='tag tag-red'>Inactive</span>";
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editrolebtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deleterolebtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });

  $(document).on("click","#questionaddbtn",function(){
    $("#question").val('');
    $("#question-add-modal").modal("show");
  });
  $("#sqaddbtn").click(function (e) {
    if($("#question").val() == ""){
      toastr.info('Please enter Question');
      $("#question").focus();
      return;
    }
    let entry = {
      question: document.getElementById('question').value,
      status: document.getElementById('sqstatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addsq", (xhr, err) => {
        if (!err) {
          $("#question-add-modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      squestiontable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editsqbtn",function(){
    $("#squestion").val('');
    $("#chosen_sq").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_sq").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/chosensq", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#squestion").val(result[0]['question']);
        $("#esqstatus").val(result[0]['status']);
        $("#question-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });
  $("#sqeditbtn").click(function (e) {
    if($("#squestion").val() == ""){
      toastr.info('Please enter Question');
      $("#squestion").focus();
      return;
    }
    let entry = {
      id: document.getElementById('chosen_sq').value,
      question: document.getElementById('squestion').value,
      status: document.getElementById('esqstatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updatesq", (xhr, err) => {
        if (!err) {
          $("#question-edit-modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      squestiontable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletesqbtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletesq", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              squestiontable.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});
  });

  

  //User Type Area
  $(document).on("click","#user_type_add",function(){
    $("#role").val('');
    $("#user_type_modal").modal("show");
  });
  $("#roleaddbtn").click(function (e) {
    if($("#role").val() == ""){
      toastr.info('Please enter Role');
      $("#role").focus();
      return;
    }
    let entry = {
      clinicid: localStorage.getItem('chosen_clinic'),
      name: document.getElementById('role').value,
      status: document.getElementById('rolestatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addrole", (xhr, err) => {
        if (!err) {
          $("#role-add-modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      roletable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editrolebtn",function(){
    $("#erole").val('');
    $("#chosen_role").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_role").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/chosenrole", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#erole").val(result[0]['name']);
        $("#erolestatus").val(result[0]['status']);
        $("#role-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });
  $("#roleeditbtn").click(function (e) {
    if($("#erole").val() == ""){
      toastr.info('Please enter Role');
      $("#erole").focus();
      return;
    }
    let entry = {
      id: document.getElementById('chosen_role').value,
      name: document.getElementById('erole').value,
      status: document.getElementById('erolestatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updaterole", (xhr, err) => {
        if (!err) {
          $("#role-edit-modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      roletable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deleterolebtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deleterole", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              roletable.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});
  });

  
  
});
