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
  var vkeytable = $('#vkeytable').DataTable({
    "ajax": {
        "url": serviceUrl + "setting/getallvkey",
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
              <button class="btn btn-sm btn-primary editvkeybtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletevkeybtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  var roletable = $('#roletable').DataTable({
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
  var workpc = $('#workpctable').DataTable({
    "ajax": {
        "url": serviceUrl + "setting/getallworkpc",
        "type": "POST",
        "data":{clinicid:localStorage.getItem('chosen_clinic')}
    },
    "columns": [
        { data: "pc_name" },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-danger deleteworkpcbtn"><i class="fa fa-trash"></i> Delete</button>
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
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
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

  //Validation Key Area
  $(document).on("click","#vkeyadd-btn",function(){
    $("#vkey").val('');
    $("#vkey-add-modal").modal("show");
  });
  $("#vkeyaddbtn").click(function (e) 
  {
    if($("#vkey").val() == ""){
      toastr.info('Please enter Key');
      $("#vkey").focus();
      return;
    }
    let entry = {
      clinicid: localStorage.getItem('chosen_clinic'),
      name: document.getElementById('vkey').value,
      status: document.getElementById('vkeystatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addvkey", (xhr, err) => {
        if (!err) {
          $("#vkey-add-modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      vkeytable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editvkeybtn",function(){
    $("#evkey").val('');
    $("#chosen_vkey").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_vkey").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/chosenvkey", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#evkey").val(result[0]['name']);
        $("#evkeystatus").val(result[0]['status']);
        $("#vkey-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });
  $("#vkeyeditbtn").click(function (e) 
  {
    if($("#evkey").val() == ""){
      toastr.info('Please enter Key');
      $("#evkey").focus();
      return;
    }
    let entry = {
      id: document.getElementById('chosen_vkey').value,
      name: document.getElementById('evkey').value,
      status: document.getElementById('evkeystatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updatevkey", (xhr, err) => {
        if (!err) {
          $("#vkey-edit-modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      vkeytable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletevkeybtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletevkey", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              vkeytable.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});
  });

  //Role Area
  $(document).on("click","#roleadd-btn",function(){
    $("#role").val('');
    $("#role-add-modal").modal("show");
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
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
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

  //Work PC Area
  $(document).on("click","#workpcadd-btn",function(){
    $("#workpc").val('');
    $("#workpc-add-modal").modal("show");
  });
  $("#workpcaddbtn").click(function (e) {
    if($("#workpc").val() == ""){
      toastr.info('Please enter Computer');
      $("#workpc").focus();
      return;
    }
    let entry = {
      clinicid: localStorage.getItem('chosen_clinic'),
      name: document.getElementById('workpc').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addworkpc", (xhr, err) => {
        if (!err) {
          $("#workpc-add-modal").modal("hide");
          return toastr.success("Action successfully");
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      workpc.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".deleteworkpcbtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deleteworkpc", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              workpc.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});
  });
  
});
