
$(document).ready(function () {
  "use strict";
  var managertable = $('#specialisttable').DataTable({
    "ajax": {
        "url": serviceUrl + "specialist/",
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
        $("#specialist-edit-modal").modal("show");
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
        $("#clinic-list-specialist").empty();
        if(clinics.length == 1 && clinics[0] == "0"){
          for(var i = 0; i < result.length; i++){
            $("#clinic-list-specialist").append(`
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
              $("#clinic-list-specialist").append(`
                <label class="selectgroup-item">
                  <input type="checkbox" value = "`+result[i]['id']+`" name="clinickey" value="`+result[i]['name']+`" class="selectgroup-input clinickey" checked>
                  <span class="selectgroup-button">`+result[i]['name']+`</span>
                </label>
              `);
            }
            else{
              $("#clinic-list-specialist").append(`
                <label class="selectgroup-item">
                  <input type="checkbox" value = "`+result[i]['id']+`" name="clinickey" value="`+result[i]['name']+`" class="selectgroup-input clinickey">
                  <span class="selectgroup-button">`+result[i]['name']+`</span>
                </label>
              `);
            }
          }
        }
        $("#specialist-clinic-modal").modal("show");
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
        $("#specialist-question-modal").modal("show");
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/delete", (xhr, err) => {
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
    $("#specialist-add-modal").modal("show");
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
      mname: document.getElementById('mname').value,
      plocation: document.getElementById('plocation').value,
      speciality: document.getElementById('speciality').value,
      npi: document.getElementById('npi').value,
      license: document.getElementById('license').value,
      email: document.getElementById('email').value,
      tel: document.getElementById('tel').value,
      cel: document.getElementById('cel').value,
      address: document.getElementById('address').value,
      fax: document.getElementById('fax').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value,
      cname: document.getElementById('cname').value,
      cemail: document.getElementById('cemail').value,
      ccel: document.getElementById('ccel').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/add", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          if(result == "existed"){
            return $.growl.notice({
              message: "This email is already existed so please try with another email"
            });
          }
          else{
            return $.growl.notice({
              message: "Specialist is added successfully"
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
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Specialist is updated successfully"
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/updatepwd", (xhr, err) => {
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
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/updateanswer", (xhr, err) => {
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
});
