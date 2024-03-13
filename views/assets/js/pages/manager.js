$(document).ready(function () {
  "use strict";
  var managertable = $('#managertable').DataTable({
    "ajax": {
        "url": serviceUrl + "manager/",
        "type": "GET"
    },
    "columns": [
        { data: "fname",
          render: function (data, type, row) {
            return row.fname+" "+row.lname;
          } 
        },
        { data: 'email' },
        { data: 'phone',
          render: function (data, type, row) {
              return row.phone;
          } 
        },
        { data: 'type',
          render: function (data, type, row) {
            if(row.type == 1)
              return "Admin";
            else if(row.type == 2)
              return "Manager";
            else if(row.type == 4)
              return "Staff";
            else if(row.type == 5)
              return "Doctor";
            else
              return "Superadmin";
          }  
        },
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
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input hedisdailycheck" name="hedisdailycheck" value="`+row.id+`" `+(row.hedisdaily==1?"checked":"")+`>
                <span class="tag custom-control-label"></span>
              </label>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input hedisncompliantcheck" name="hedisncompliantcheck" value="`+row.id+`" `+(row.hedisnoncompliant==1?"checked":"")+`>
                <span class="tag custom-control-label"></span>
              </label>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
                <button clinickey="`+row.clinic+`" class="btn btn-sm btn-success badge managerclinicbtn" type="button"><i class="fa fa-hospital-o"></i></button><button class="btn btn-sm btn-primary badge managereditbtn" type="button"><i class="fa fa-edit"></i></button><button class="btn btn-sm btn-info badge managerpwdbtn" type="button"><i class="fa fa-key"></i></button><button class="btn btn-sm btn-warning badge managerquestionbtn" type="button"><i class="fa fa-question-circle"></i></button> <button class="btn btn-sm btn-danger badge managerdeletebtn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });
  $(document).on("click",".managereditbtn",function(){
    $("#chosen_manager").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#efname").val(result[0]['fname']);
        $("#elname").val(result[0]['lname']);
        $("#eemail").val(result[0]['email']);
        $("#ephone").val(result[0]['phone']);
        $("#eaddress").val(result[0]['address']);
        $("#etype").val(result[0]['type']);
        $("#estatus").val(result[0]['status']);
        $("#manager-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".managerclinicbtn",function(){
    $("#chosen_manager").val($(this).parent().attr("idkey"));
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/clinic/getAll", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        let clinics = $(this).attr("clinickey").split(",");
        $("#clinic-list-manager").empty();
        if(clinics.length == 1 && clinics[0] == "0"){
          for(var i = 0; i < result.length; i++){
            $("#clinic-list-manager").append(`
              <label class="selectgroup-item">
                <input type="checkbox" value = "`+result[i]['id']+`" name="clinickey" value="`+result[i]['name']+`" class="selectgroup-input clinickey" checked>
                <span class="selectgroup-button">`+result[i]['name']+`</span>
              </label>
            `);
          }
        }
        else{
          for(var i = 0; i < result.length; i++){
            if(clinics.includes(result[i]['id'].toString())){
              $("#clinic-list-manager").append(`
                <label class="selectgroup-item">
                  <input type="checkbox" value = "`+result[i]['id']+`" name="clinickey" value="`+result[i]['name']+`" class="selectgroup-input clinickey" checked>
                  <span class="selectgroup-button">`+result[i]['name']+`</span>
                </label>
              `);
            }
            else{
              $("#clinic-list-manager").append(`
                <label class="selectgroup-item">
                  <input type="checkbox" value = "`+result[i]['id']+`" name="clinickey" value="`+result[i]['name']+`" class="selectgroup-input clinickey">
                  <span class="selectgroup-button">`+result[i]['name']+`</span>
                </label>
              `);
            }
          }
        }
        $("#manager-clinic-modal").modal("show");
      } else {
        return $.growl.error({
        message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".managerquestionbtn",function(){
    $("#chosen_manager").val($(this).parent().attr("idkey"));
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getquestions", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#question").empty();
        for(var i = 0; i < result.length; i++){
          $("#question").append(`
              <option value = "`+result[i]['id']+`">`+result[i]['question']+`</option>
          `);
        }
        $("#manager-question-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  
  $(document).on("click",".managerdeletebtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              managertable.ajax.reload();
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
  $(document).on("click",".manageraddbtn",function(){
    $("#manager-add-modal").modal("show");
  });
  $(document).on("click",".managerpwdbtn",function(){
    $("#chosen_manager").val($(this).parent().attr("idkey"));
    $("#manager-pwd-modal").modal("show");
  });
  $(document).on("click","#mclinicbtn",function(){
    var clinics = [];
    $('.clinickey:checked').each(function(i){
      clinics[i] = $(this).val();
    });
    let entry = {
      id: document.getElementById('chosen_manager').value,
      clinics: clinics
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/updateclinics", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Clinics are updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      managertable.ajax.reload();
    }, 1000 );
  });
  $("#maddbtn").click(function (e) {
    let entry = {
      fname: document.getElementById('fname').value,
      lname: document.getElementById('lname').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      type: document.getElementById('type').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/add", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          if(result == "existed"){
            return $.growl.notice({
              message: "This email is already existed so please try with another email"
            });
          }
          else{
            return $.growl.notice({
              message: "Manager is added successfully"
            });
          }
          
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      managertable.ajax.reload();
    }, 1000 );
  });
  $("#meditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_manager').value,
      fname: document.getElementById('efname').value,
      lname: document.getElementById('elname').value,
      email: document.getElementById('eemail').value,
      phone: document.getElementById('ephone').value,
      address: document.getElementById('eaddress').value,
      type: document.getElementById('etype').value,
      status: document.getElementById('estatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Manager is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      managertable.ajax.reload();
    }, 1000 );
  });
  $("#mpwdbtn").click(function (e) {
    if($("#pwd").val() === $("#cpwd").val()){
      let entry = {
        id: document.getElementById('chosen_manager').value,
        pwd: document.getElementById('pwd').value,
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/updatepwd", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Password is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
    }
    else{
      return $.growl.error({
        message: "Please confirm password again."
      });
    }
  });
  $("#mquestionbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_manager').value,
      question_id: document.getElementById('question').value,
      answer: document.getElementById('answer').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/updateanswer", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Security is updated successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".hedisdailycheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/updatehedisdaily", (xhr, err) => {
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
  });
  $(document).on("click",".hedisncompliantcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "manager/updatehedisncompliant", (xhr, err) => {
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
  });
});
