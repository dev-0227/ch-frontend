$(document).ready(function () {
  "use strict";
  $("body").tooltip({ selector: '[data-toggle=tooltip]' });
  var usertable = $('#usertable').DataTable({
    "ajax": {
        "url": serviceUrl + "user/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "columns": [
        { data: "fname",
          render: function (data, type, row) {
            return row.fname+" "+row.lname;
          } 
        },
        { data: 'email' },
        { data: 'phone' },
        { data: 'type',
          render: function (data, type, row) {
            return row.role_name;
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
              <div class="btn-group align-top" idkey="`+row.id+`">
              <button class="btn btn-sm btn-info badge clinicbtn"  type="button" clinickey="`+row.clinic+`" data-toggle="tooltip" title="clinic" ><i class="fa-solid fa-house-medical-circle-check"></i></button>
              <button class="btn btn-sm btn-orange permissionbtn" data-role="`+row.type+`" data-more="`+row.permissions+`"  type="button" data-toggle="tooltip" title="permission"><i class="fa fa-tasks"></i></button>
              <button class="btn btn-sm btn-primary badge usereditbtn" data-target="#user-form-modal" data-toggle="tooltip" type="button" title="edit"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-green badge userpwdbtn" type="button" data-toggle="tooltip" title="password"><i class="fa fa-key"></i></button>
              <button class="btn btn-sm btn-warning badge userquestionbtn" type="button" data-toggle="tooltip" title="question"><i class="fa fa-question-circle"></i></button>
              <button class="btn btn-sm btn-danger badge userdeletebtn" type="button"data-toggle="tooltip" title="delete"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "role", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var data = "";
      for(var i = 0; i < result.length; i++){
        data += '<option value="'+result[i].id+'">'+result[i].name+'</option>';
      }
      $(".role_list").html(data);
    }
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "setting/getchosenclinics", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      for(var i = 0; i < result.length; i++){
        $("#clinic-list").append(`
          <label class="selectgroup-item">
              <input type="checkbox" value="`+result[i].id+`" name="clinickey" value="`+result[i]['name']+`" class="selectgroup-input clinickey" >
              <span class="selectgroup-button">`+result[i].name+`</span>
          </label>
        `);
      }
    }
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
      var html = '';
      for (const key in permissions) {
        var collapse = "";
        if(html=="")collapse = "show";
        html += '<div class="panel panel-default" style="border-bottom:1pt solid #cccccc;">';
        html += '<div class="panel-heading">';
        html += '<h4 class="panel-title" >';
        html += '<a data-toggle="collapse" data-parent="#accordion" href="#collapse'+key+'"  style="padding: 12px; color: black;" >';
        html += ' <span class="glyphicon glyphicon-chevron-right"></span> ';
        html += key;
        html += '</a></h4></div>';
        html += '<div id="collapse'+key+'" class="panel-collapse collapse '+collapse+'" ">';
        html += '<div class="panel-body p-1" ><table style="width: 100%">';
        for(var i=0; i<permissions[key].length; i++){
          var row = permissions[key][i];
          html += '<div class="row mx-2" style="border-bottom:1pt dashed #cccccc;">';
          html += '<div class="col-md-4 d-flex mr-2 " style="justify-content: right;">'+row['name']+':</div>';
          html += '<div class="col-md-2 d-flex align-self-center">';
          html += '<input type="checkbox" class="ch_permission" id="ch_'+row['id']+'_1" data-id="'+row['id']+'" data-type="1"><span class="pl-1">Read</span>';
          html += '</div>';
          html += '<div class="col-md-2 d-flex align-self-center">';
          html += '<input type="checkbox" class="ch_permission" id="ch_'+row['id']+'_2" data-id="'+row['id']+'" data-type="2"><span class="pl-1">Write</span>';
          html += '</div>';
          html += '<div class="col-md-2 d-flex align-self-center">';
          html += '<input type="checkbox" class="ch_permission" id="ch_'+row['id']+'_3" data-id="'+row['id']+'" data-type="3"><span class="pl-1">Create</span>';
          html += '</div></div>';
          
        }
        html += '</table></div></div></div>';
      }
      $("#accordion").html(html);
      // for(var i = 0; i < result.length; i++){
      //   $("#permission-list").append(`
      //       <div class="col-md-12 row"><div class="col-md-4 d-flex align-self-center">`+result[i]['name']+`</div>
      //       <div class="col-md-2 d-flex align-self-center">
      //       <input type="checkbox" class="ch_permission" id="ch_`+result[i]['id']+`_1" data-id="`+result[i]['id']+`" data-type="1"><span class="pl-1">Read</span>
      //       </div>
      //       <div class="col-md-2 d-flex align-self-center">
      //       <input type="checkbox" class="ch_permission" id="ch_`+result[i]['id']+`_2" data-id="`+result[i]['id']+`" data-type="2"><span class="pl-1">Write</span>
      //       </div>
      //       <div class="col-md-2 d-flex align-self-center">
      //       <input type="checkbox" class="ch_permission" id="ch_`+result[i]['id']+`_3" data-id="`+result[i]['id']+`" data-type="3"><span class="pl-1">Create</span>
      //       </div>
      //   </div>
      //   `);
      // }
    }
  });


  $(document).on("click",".usereditbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#efname").val(result[0]['fname']);
        $("#elname").val(result[0]['lname']);
        $("#eemail").val(result[0]['email']);
        $("#ephone").val(result[0]['phone']);
        $("#eaddr").val(result[0]['address']);
        $("#ecity").val(result[0]['city']);
        $("#estate").val(result[0]['state']);
        $("#ezip").val(result[0]['zip']);
        $("#etype").val(result[0]['type']);
        $("#estatus").val(result[0]['status']);
        $("#user-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  $(document).on("click",".permissionbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    let more = $(this).data('more');
    let entry = {
      id: $(this).data("role"),
    }
    $(".ch_permission").prop('checked', false);
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/getPermission", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        let p = '';
        for(var i=0; i<result.length; i++){
          $('#ch_'+result[i].perm_id+'_1').prop('checked', result[i].value.charAt(0)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_2').prop('checked', result[i].value.charAt(1)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_3').prop('checked', result[i].value.charAt(2)=="1"?true:false);

          if(p!="")p += ",";
          p += result[i].perm_id+'_'+result[i].value;
        }
        $("#role-values").val(p);
        if(more){
          var diff = more.split(",");
          for(var j=0; j<diff.length; j++){
            let diff_data = diff[j].split('_');
            if(diff_data.length>1){
              $('#ch_'+diff_data[0]+'_1').prop('checked', diff_data[1].charAt(0)=="1"?true:false);
              $('#ch_'+diff_data[0]+'_2').prop('checked', diff_data[1].charAt(1)=="1"?true:false);
              $('#ch_'+diff_data[0]+'_3').prop('checked', diff_data[1].charAt(2)=="1"?true:false);
            }
            
          }
        }
        
        $("#permission-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  $(document).on("click","#update_permission",function(){
    var p = '';
    $(".ch_permission").each(function() {
      if(p!="")p += ',';
      p += $(this).data('id')+'_'+$(this).data('type')+'_';
      p += $(this).prop('checked')?'1':'0';
    });
    let entry = {
      id: $("#chosen_user").val(),
      permissions: p,
      role_values: $("#role-values").val()
    }

    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatepermissions", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "permission is updated successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });

    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
  });

  
  $(document).on("click",".userquestionbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getquestions", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#question").empty();
        for(var i = 0; i < result.length; i++){
          $("#question").append(`
              <option value = "`+result[i]['id']+`">`+result[i]['question']+`</option>
          `);
        }
        $("#user-question-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  
  $(document).on("click",".userdeletebtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              usertable.ajax.reload();
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
  $(document).on("click",".useraddbtn",function(){
    $("#user-add-modal").modal("show");
  });
  $(document).on("click",".clinicbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $(".clinickey").prop('checked', false);
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length > 0)
          if(result[0]['clinic']){
          var clinics = result[0]['clinic'].split(',');
        
          $('.clinickey').each(function(i){
              for(var i = 0; i < clinics.length; i++){
              if(clinics[i] == $(this).val()){
                $(this).prop('checked', true);
              };
            }
          });
        }
      
        $("#clinic-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  


  $(document).on("click",".userpwdbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $("#user-pwd-modal").modal("show");
  });
  $("#maddbtn").click(function (e) {
    let entry = {
      fname: document.getElementById('fname').value,
      lname: document.getElementById('lname').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      addr: document.getElementById('addr').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value,
      type: document.getElementById('type').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/add", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "user is added successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
  });
  $("#meditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_user').value,
      fname: document.getElementById('efname').value,
      lname: document.getElementById('elname').value,
      email: document.getElementById('eemail').value,
      phone: document.getElementById('ephone').value,
      addr: document.getElementById('eaddr').value,
      city: document.getElementById('ecity').value,
      state: document.getElementById('estate').value,
      zip: document.getElementById('ezip').value,
      type: document.getElementById('etype').value,
      status: document.getElementById('estatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "user is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
  });
  $("#mpwdbtn").click(function (e) {
    if($("#pwd").val() === $("#cpwd").val()){
      let entry = {
        id: document.getElementById('chosen_user').value,
        pwd: document.getElementById('pwd').value,
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatepwd", (xhr, err) => {
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
      id: document.getElementById('chosen_user').value,
      question_id: document.getElementById('question').value,
      answer: document.getElementById('answer').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updateanswer", (xhr, err) => {
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
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatehedisdaily", (xhr, err) => {
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
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatehedisncompliant", (xhr, err) => {
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

  $(document).on("click","#clinicbtn",function(){
    var clinics = [];
    $('.clinickey:checked').each(function(i){
      clinics[i] = $(this).val();
    });
    let entry = {
      id: document.getElementById('chosen_user').value,
      clinics: clinics
    }

    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updateclinics", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Clinic is set successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
});
