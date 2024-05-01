
$(document).ready(async function () {
  "use strict";

  let sp = []
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentSpecialty", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['id']+'" >'+result[i]['name']+'</option>';
        sp[result[i]['id']] = result[i]['name'];
      }
      $("#specialty_id").html(options);
      // managertable.ajax.reload();
    }
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['id']+'" >'+result[i]['insName']+'</option>';
      }
      $("#insurance_id").html(options);

    }
  });

  var managertable = $('#specialisttable').DataTable({
    "ajax": {
        "url": serviceUrl + "specialist/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "columns": [
        { data: "fname",
          render: function (data, type, row) {
            return row.fname+" "+row.lname;
          } 
        },
        { data: 'specialty_id' ,
          render: function (data, type, row) {
            var str = "";
            if(row.specialty_id){
              var specialties = row.specialty_id.toString().split(",");
              
              for(var i=0; i<specialties.length; i++){
                if(sp[specialties[i]]=="")continue;
                if(i>0) str+= ", ";
                str += sp[specialties[i]];
              }
            }
              
            return str;
          } 
        },
        { data: 'email' },
        { data: 'phone',
          render: function (data, type, row) {
              return row.phone;
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
                <button clinickey="`+row.clinic+`" class="btn btn-sm btn-success managerclinicbtn" type="button"><i class="fa fa-house-medical-circle-check"></i></button>
                <button class="btn btn-sm btn-primary managereditbtn" type="button"><i class="fa fa-edit"></i></button>
                <button class="btn btn-sm btn-info managerpwdbtn" type="button"><i class="fa fa-key"></i></button>
                <button class="btn btn-sm btn-warning managerquestionbtn" type="button"><i class="fa fa-question-circle"></i></button>
                <button class="btn btn-sm btn-danger managerdeletebtn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });

  $('#table_search_input').on('keyup', function () {
    managertable.search(this.value).draw();
  });

  $(document).on("click",".manageraddbtn",function(){
    $('#chosen_manager').val("")
    $("#efname").val("");
    $("#elname").val("");
    $("#emname").val("");
    $("#eplocation").val("");
    $("#especiality").val("");
    $("#enpi").val("");
    $("#elicense").val("");
    $("#eemail").val("");
    $("#etel").val("");
    $("#ecel").val("");
    $("#eaddress").val("");
    $("#efax").val("");
    $("#ecity").val("");
    $("#estate").val("");
    $("#ezip").val("");
    $("#ecname").val("");
    $("#ecemail").val("");
    $("#eccel").val("");
    $("#estatus").val('1');
    $("#specialty_id").val("").trigger('change');
    $("#insurance_id").val("").trigger('change');
    $("#taxonomy").val("");
    
    $("#specialist-edit-modal").modal("show");
  });

  $(document).on("click",".managereditbtn",function(){
    $("#chosen_manager").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#efname").val(result[0]['fname']);
        $("#elname").val(result[0]['lname']);
        $("#emname").val(result[0]['mname']);
        $("#eplocation").val(result[0]['plocation']);
        $("#especiality").val(result[0]['speciality']);
        $("#enpi").val(result[0]['npi']);
        $("#elicense").val(result[0]['license']);
        $("#eemail").val(result[0]['email']);
        $("#etel").val(result[0]['phone']);
        $("#ecel").val(result[0]['cel']);
        $("#eaddress").val(result[0]['address']);
        $("#efax").val(result[0]['fax']);
        $("#ecity").val(result[0]['city']);
        $("#estate").val(result[0]['state']);
        $("#ezip").val(result[0]['zip']);
        $("#ecname").val(result[0]['contactname']);
        $("#ecemail").val(result[0]['contactemail']);
        $("#eccel").val(result[0]['contactcel']);
        $("#estatus").val(result[0]['status']);
        if(result[0]['specialty_id']){
          $("#specialty_id").val(result[0]['specialty_id'].split(",")).trigger('change');
        }else{
          $("#specialty_id").val("").trigger('change');
        }
        if(result[0]['insurance_id']){
          $("#insurance_id").val(result[0]['insurance_id'].split(",")).trigger('change');
        }else{
          $("#insurance_id").val("").trigger('change');
        }
        $("#taxonomy").val(result[0]['taxonomy']);
        
        $("#specialist-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "setting/clinic/getAll", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      for(var i = 0; i < result.length; i++){
        $("#clinic-list-specialist").append(`
          <a href="#" class="btn btn-secondary m-1 clinic_toggle " style="border: 2px solid #cccccc;" >
              <input type="checkbox" value="`+result[i].id+`" value="`+result[i]['name']+`" class="clinickey" style="display: none;" >
              <span class="selectgroup-button">`+result[i].name+`</span>
          </a>
        `);
      }
    }
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
  $(document).on("click",".managerclinicbtn",function(){
    $("#chosen_manager").val($(this).parent().attr("idkey"));
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
      
        $("#specialist-clinic-modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
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
        $("#specialist-question-modal").modal("show");
      } else {
        return toastr.error('Action Failed');
      }
    });
  });
  
  $(document).on("click",".managerdeletebtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              managertable.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error('Action Failed');
          }
        });	
      }
		});

  });
  
  $(document).on("click",".managerpwdbtn",function(){
    $("#chosen_manager").val($(this).parent().attr("idkey"));
    $("#specialist-pwd-modal").modal("show");
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
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/updateclinics", (xhr, err) => {
        if (!err) {
          $("#specialist-clinic-modal").modal("hide");
          return toastr.success('Clinics are updated successfully');
        } else {
          return toastr.error('Action Failed');
        }
    });
    setTimeout( function () {
      managertable.ajax.reload();
    }, 1000 );
  });
  
  $("#meditbtn").click(function (e) {
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
    if($("#etel").val() == ""){
      toastr.info('Please enter Phone number');
      $("#etel").focus();
      return;
    }
    if($("#eemail").val() == ""){
      toastr.info('Please enter Email');
      $("#eemail").focus();
      return;
    }
    if($("#specialty_id").val() == ""){
      toastr.info('Please enter Specialty');
      $("#specialty_id").focus();
      return;
    }
    let entry = {
      id: $('#chosen_manager').val(),
      fname: document.getElementById('efname').value,
      lname: document.getElementById('elname').value,
      mname: document.getElementById('emname').value,
      plocation: document.getElementById('eplocation').value,
      speciality: document.getElementById('especiality').value,
      npi: document.getElementById('enpi').value,
      license: document.getElementById('elicense').value,
      email: document.getElementById('eemail').value,
      tel: document.getElementById('etel').value,
      cel: document.getElementById('ecel').value,
      address: document.getElementById('eaddress').value,
      fax: document.getElementById('efax').value,
      city: document.getElementById('ecity').value,
      state: document.getElementById('estate').value,
      zip: document.getElementById('ezip').value,
      cname: document.getElementById('ecname').value,
      cemail: document.getElementById('ecemail').value,
      ccel: document.getElementById('eccel').value,
      status: document.getElementById('estatus').value,
      specialty_id: $('#specialty_id').val().toString(),
      insurance_id: $('#insurance_id').val().toString(),
      taxonomy: $('#taxonomy').val(),
    }

    if($('#chosen_manager').val()==""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/add", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          if(result == "existed"){
            return toastr.info('This email is already existed so please try with another email');
          }
          else{
            $("#specialist-edit-modal").modal("hide");
            return toastr.success('Specialist is added successfully');
          }
          
        } else {
          return toastr.error('Action Failed');
        }
    });
    }else{
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/update", (xhr, err) => {
        if (!err) {
          $("#specialist-edit-modal").modal("hide");
          return toastr.success('Specialist is updated successfully');
        } else {
          return toastr.error('Action Failed');
        }
    });
    }
    
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/updatepwd", (xhr, err) => {
        if (!err) {
          $("#specialist-pwd-modal").modal("hide");
          return toastr.success('Password is updated successfully');
        } else {
          return toastr.error('Action Failed');
        }
      });
    }
    else{
      return toastr.error('Please confirm password again');
      
    }
  });
  $("#mquestionbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_manager').value,
      question_id: document.getElementById('question').value,
      answer: document.getElementById('answer').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/updateanswer", (xhr, err) => {
      if (!err) {
        $("#specialist-question-modal").modal("hide");
        return toastr.success('Security is updated successfully');
      } else {
        return toastr.error('Action Failed');
      }
    });
  });

  $(document).on("click","#specialist_import_btn",function(){
    $("#specialist_import_modal").modal('show');
  });

  

  
  $(document).on("click","#specialist_import_action",function(){
    var formData = new FormData();
    var specialist_file = document.getElementById('specialist_file').files.length;
    if (specialist_file > 0) {
      formData.append("specialist_file", document.getElementById('specialist_file').files[0]);
      $(".progress-load").removeClass("d-none");
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "specialist/import", (xhr, err) => {
          if (!err) {
            let added = JSON.parse(xhr.responseText)['data'];
            $("#specialist_import_modal").modal("hide");
            $(".progress-load").addClass("d-none");
            setTimeout( function () {
              managertable.ajax.reload();
            }, 1000 );
            return toastr.success(added+ ' Specialist Added');
          } else {
            $(".progress-load").addClass("d-none");
            return toastr.error(err);
          }
      });
    } else {
      return toastr.info('Please load file');
    }
  
  });
});
