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
            var color = "secondary";
            switch(row.type){
              case 0: color = "danger"; break;
              case 1: color = "dark"; break;
              case 2: color = "primary"; break;
              case 3: color = "success"; break;
              case 4: color = "info"; break;
              case 5: color = "warning"; break;
            }
            return '<div class="badge badge-'+color+' fw-bold badge-lg">'+row.role_name+'</span>';
          }  
        },
        { data: 'status',
          render: function (data, type, row) {
            if(row.status == 1)
              return '<div class="badge badge-success fw-bold badge-lg">Active</span>';
            else
              return '<div class="badge badge-danger fw-bold badge-lg">Inactive</span>';
          } 
        },
        
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
              <button class="btn btn-sm btn-info clinicbtn"  type="button" clinickey="`+row.clinic+`" data-toggle="tooltip" title="clinic" ><i class="fa-solid fa-house-medical-circle-check"></i></button>
              <button class="btn btn-sm btn-success permissionbtn" data-role="`+row.type+`" data-more="`+row.permissions+`"  type="button" data-toggle="tooltip" title="permission"><i class="fa fa-tasks"></i></button>
              <button class="btn btn-sm btn-primary usereditbtn" data-target="#user-form-modal" data-toggle="tooltip" type="button" title="edit"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-info userpwdbtn" type="button" data-toggle="tooltip" title="password"><i class="fa fa-key"></i></button>
              <button class="btn btn-sm btn-warning userquestionbtn" type="button" data-toggle="tooltip" title="question"><i class="fa fa-question-circle"></i></button>
              <button class="btn btn-sm btn-danger userdeletebtn" type="button"data-toggle="tooltip" title="delete"><i class="fa fa-trash"></i></button>
              </div>
            `;


            
          } 
        }
    ]
  });


  $('#table_search_input').on('keyup', function () {
    usertable.search(this.value).draw();
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
          <a href="#" class="btn btn-secondary m-1 clinic_toggle " style="border: 2px solid #cccccc;" >
              <input type="checkbox" value="`+result[i].id+`" value="`+result[i]['name']+`" class="clinickey" style="display: none;" >
              <span class="selectgroup-button">`+result[i].name+`</span>
          </a>
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
      var html = '<div class="accordion accordion-icon-toggle" id="kt_accordion_1">';
      var i = 0;
      for (const key in permissions) {
        html += '<div class="mb-5 " style="border: solid 1px #eeeeee;" >';
        html += '<div class="accordion-header py-3 d-flex fw-semibold collapsed" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_item_'+i+'">';
        html += '<span class="accordion-icon"><i class="ki-duotone ki-arrow-right fs-4"><span class="path1"></span><span class="path2"></span></i></span>';
        html += '<h3 class="fs-4 fw-semibold mb-0 ms-4">';
        html += key;
        html += '</h3></div>';
        html += '<div id="kt_accordion_1_item_'+i+'" class="fs-6 collapse ps-10" data-bs-parent="#kt_accordion_1">';
        
        for(var j=0; j<permissions[key].length; j++){
          var row = permissions[key][j];
          html += '<div class="table-responsive">';
          html += '<table  class="table table-striped table-row-bordered gy-5 gs-7">';
          html += '<tbody><tr class="d-flex align-items-center">';
          html += '<td  width="40%">'+row['name']+':</td>';
          html += '<td width="20%" class="d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_1" data-id="'+row['id']+'" data-type="1"></div><div class="px-3">Read</div>';
          html += '</td>';
          html += '<td width="20%" class="d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_2" data-id="'+row['id']+'" data-type="2"></div><div class="px-3">Write</div>';
          html += '</td>';
          html += '<td  width="20%"class="d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_3" data-id="'+row['id']+'" data-type="3"></div><div class="px-3">Create</div>';
          html += '</td></tr></tbody></table></div>';
          
        }
        html += '</div></div>';
        i++;
      }
      html += '</div>';
      $("#accordion").html(html);
    }
  });

  $(document).on("click","#add_btn",function(){
    $("#add_user_modal").modal("show");
  });

  $("#add_user_submit").click(function (e) {
    if($("#fname").val() == ""){
      toastr.info('Please enter First name');
      $("#fname").focus();
      return;
    }
    if($("#lname").val() == ""){
      toastr.info('Please enter Last name');
      $("#lname").focus();
      return;
    }
    if($("#email").val() == ""){
      toastr.info('Please enter Email');
      $("#email").focus();
      return;
    }
    if($("#phone").val() == ""){
      toastr.info('Please enter Phone number');
      $("#phone").focus();
      return;
    }
    if($("#addr").val() == ""){
      toastr.info('Please enter Address');
      $("#addr").focus();
      return;
    }
    if($("#city").val() == ""){
      toastr.info('Please enter City');
      $("#city").focus();
      return;
    }
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
          toastr.success('user is added successfully');
          $("#add_user_modal").modal("hide");
        } else {
          toastr.error('Action Failed');
        }
    });
    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
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
        $("#edit_user_modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $("#edit_btn").click(function (e) {
    if($("#efname").val() == ""){
      toastr.info('Please enter First name');
      $("#efname").focus();
      return;
    }
    if($("#elname").val() == ""){
      toastr.info('Please enter Last name');
      $("#elname").focus();
      return;
    }
    if($("#eemail").val() == ""){
      toastr.info('Please enter Email');
      $("#eemail").focus();
      return;
    }
    if($("#ephone").val() == ""){
      toastr.info('Please enter Phone number');
      $("#ephone").focus();
      return;
    }
    if($("#eaddr").val() == ""){
      toastr.info('Please enter Address');
      $("#eaddr").focus();
      return;
    }
    if($("#ecity").val() == ""){
      toastr.info('Please enter City');
      $("#ecity").focus();
      return;
    }
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
          toastr.success('User is updated successfully');
          $("#edit_user_modal").modal("hide");
        } else {
          toastr.error('Action Failed');
        }
    });
    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
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
        
        $("#user_permission_modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $(document).on("click","#permission_submit",function(){
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
        toastr.success('permission is updated successfully');
        $("#user_permission_modal").modal("hide");
      } else {
        toastr.error('Credential is invalid');
      }
    });

    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".clinic_toggle",function(){
    var checkbox = $(this).children().first();
    if(checkbox.prop('checked')){
      checkbox.prop('checked', false);
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-secondary");
    }else{
      checkbox.prop('checked', true);
      $(this).removeClass("btn-secondary");
      $(this).addClass("btn-primary");
    }
  });

  $(document).on("click",".clinicbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $(".clinickey").prop('checked', false);
    $(".clinic_toggle").removeClass("btn-primary");
    $(".clinic_toggle").addClass("btn-secondary");
    
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
                $(this).parent().removeClass("btn-secondary");
                $(this).parent().addClass("btn-primary");
              };
            }
          });
        }
      
        $("#user_clinic_modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $(document).on("click","#clinic_submit",function(){
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
        toastr.success('Clinic is set successfully');
        $("#user_clinic_modal").modal("hide");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  
  $(document).on("click",".userpwdbtn",function(){
    $("#pwd").val('');
    $("#cpwd").val('');
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $("#user_pwd_modal").modal("show");
  });
  
  
  $("#password_btn").click(function (e) {
    if($("#pwd").val() == ""){
      toastr.info('Please enter Password');
      $("#pwd").focus();
      return;
    }
    if($("#cpwd").val() == ""){
      toastr.info('Please enter Confirm Password');
      $("#cpwd").focus();
      return;
    }
    if($("#pwd").val() === $("#cpwd").val()){
      let entry = {
        id: document.getElementById('chosen_user').value,
        pwd: document.getElementById('pwd').value,
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatepwd", (xhr, err) => {
        if (!err) {
          toastr.success('Password is updated successfully');
          $("#user_pwd_modal").modal("hide");
        } else {
          toastr.error('Action Failed');
        }
      });
    }
    else{
      toastr.info('Please confirm password again.');
      
    }
  });

  $(document).on("click",".userquestionbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $("#answer").val('');
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
        toastr.error('Credential is invalid');
      }
    });
  });

  $("#question_btn").click(function (e) {
    if($("#answer").val() == ""){
      toastr.info('Please enter Answer');
      $("#answer").focus();
      return;
    }
    let entry = {
      id: document.getElementById('chosen_user').value,
      question_id: document.getElementById('question').value,
      answer: document.getElementById('answer').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updateanswer", (xhr, err) => {
      if (!err) {
        toastr.success('Security is updated successfully');
        $("#user-question-modal").modal("hide");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });
  
  $(document).on("click",".userdeletebtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              usertable.ajax.reload();
            }, 1000 );
          } else {
            toastr.error('Credential is invalid');
          }
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
        toastr.success('Action successfully');
      } else {
        toastr.error('Credential is invalid');
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
        toastr.success('Action successfully');
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  
});
