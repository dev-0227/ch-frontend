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
    $("#question-add-modal").modal("show");
  });
  $("#sqaddbtn").click(function (e) {
    let entry = {
      question: document.getElementById('question').value,
      status: document.getElementById('sqstatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addsq", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      squestiontable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editsqbtn",function(){
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
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#sqeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_sq').value,
      question: document.getElementById('squestion').value,
      status: document.getElementById('esqstatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updatesq", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
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
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletesq", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              squestiontable.ajax.reload();
            }, 1000 );
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });

  //Validation Key Area
  $(document).on("click","#vkeyadd-btn",function(){
    $("#vkey-add-modal").modal("show");
  });
  $("#vkeyaddbtn").click(function (e) {
    let entry = {
      clinicid: localStorage.getItem('chosen_clinic'),
      name: document.getElementById('vkey').value,
      status: document.getElementById('vkeystatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addvkey", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      vkeytable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editvkeybtn",function(){
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
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#vkeyeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_vkey').value,
      name: document.getElementById('evkey').value,
      status: document.getElementById('evkeystatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updatevkey", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
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
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletevkey", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              vkeytable.ajax.reload();
            }, 1000 );
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });

  //Role Area
  $(document).on("click","#roleadd-btn",function(){
    $("#role-add-modal").modal("show");
  });
  $("#roleaddbtn").click(function (e) {
    let entry = {
      clinicid: localStorage.getItem('chosen_clinic'),
      name: document.getElementById('role').value,
      status: document.getElementById('rolestatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addrole", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      roletable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editrolebtn",function(){
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
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#roleeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_role').value,
      name: document.getElementById('erole').value,
      status: document.getElementById('erolestatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updaterole", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
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
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deleterole", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              roletable.ajax.reload();
            }, 1000 );
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });

  //Work PC Area
  $(document).on("click","#workpcadd-btn",function(){
    $("#workpc-add-modal").modal("show");
  });
  $("#workpcaddbtn").click(function (e) {
    let entry = {
      clinicid: localStorage.getItem('chosen_clinic'),
      name: document.getElementById('workpc').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addworkpc", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
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
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deleteworkpc", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              workpc.ajax.reload();
            }, 1000 );
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });
});
