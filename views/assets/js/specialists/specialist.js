
$(document).ready(async function () {
  "use strict";

  await sendRequest('https://restcountries.com/v3.1/all', (xhr, res) => {
    const uniqueLanguages = new Set();
    let flags = new Array();
    JSON.parse(xhr.responseText).forEach(country => {
      flags.push({
        countryName: country.name.common,
        val: country.cca2,
        flagUrl: country.flags.svg,
        id: country.area
      });
      
      const countryLanguages = country.languages;
      if (countryLanguages) {
        Object.values(countryLanguages).map(language => {
          uniqueLanguages.add(language);
        })
      }
    });

    const allLanguages = Array.from(uniqueLanguages);
    allLanguages.sort();
    allLanguages.forEach(lang => {
      if (lang == 'English') $("#elanguage").append(`<option value='${lang}' selected='' data-select2-id='${lang}'>${lang}</option>`);
      else $("#elanguage").append(`<option value='${lang}' data-select2-id='${lang}'>${lang}</option>`);
    });

    flags.sort(function(a, b) {
      let x = a.countryName.toLowerCase();
      let y = b.countryName.toLowerCase();
      if (x < y) return -1;
      if (x > y) return 1;
      return 0;
    });
    flags.forEach(flag => {
      $("#kt_docs_select2_country").append(`<option value='${flag.val}' data-kt-select2-country='${flag.flagUrl}' data-select2-id='${flag.id}'>${flag.countryName}</option>`);
    })
  })

  let filesize = 0
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
      $("#fspecialty").html('<option value="0">All Specialties</option>' + options);
    }
  });

  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['id']+'" >'+result[i]['insName']+'</option>';
      }
      $("#insurance_id").html(options);
    }
  });

  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "qualification", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      result.sort(function(a, b) {
        let x = a['display'].toLowerCase();
        let y = b['display'].toLowerCase();
        if (x < y) return -1;
        if (x > y) return 1;
        return 0;
      });
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['id']+'" >'+result[i]['display']+'</option>';
      }
      // select Doctor of Medicine
      $("#equalification").html(options);
    }
  });

  let specialistid = 0;
  let clinics = []
  let organizations = []
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/clinic/getAll", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      for(var i = 0; i < result.length; i++){
        $("#clinic-list-specialist").append(`
          <a href="#" class="btn btn-secondary m-1 clinic_toggle " style="border: 2px solid #cccccc;" >
              <input type="checkbox" value="`+result[i].id+`" value="`+result[i]['name']+`" class="clinickey" style="display: none;" >
              <span class="selectgroup-button">`+result[i].name+`</span>
          </a>
        `);
        clinics[result[i].id] = result[i];
        organizations[result[i].id] = {
          clinicid: result[i].id,
          specialistid: 0,
          organizationid: []
        };
      }
      if (!result.length) {
        $("#mclinicbtn").hide();
      }
    }
  });

  var managertable = $('#specialisttable').DataTable({
    "ajax": {
        "url": serviceUrl + "specialist/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    serverSide: true,
    "pageLength": 10,
    "order": [],
    "columns": [
      { data: 'photo',
        render: function(data, type, row) {
          if (row.photo.length == 1) {
            return `
            <center>
              <div class="symbol symbol-60px symbol-circle">
                  <div class="symbol-label fs-3qx fw-semibold bg-primary text-inverse-primary">` + row.photo + `</div>
              </div>
            </center>
            `
          }
          else {
            return `
            <center>
              <div class="symbol symbol-60px symbol-circle">
                <div class="symbol-label" style="background-image: url(data:image/png;base64,${row.photo});"></div>
              </div>
            </center>
            `
          }
        }
      },
      { data: "fname",
        render: function (data, type, row) {
          return row.fname+" "+row.lname;
        } 
      },
      { data: 'specialty_id' ,
        render: function (data, type, row) {
          return row.sname;
        } 
      },
      { data: 'email',
        render: function(data, type, row) {
          return row.email;
        }
        },
      { data: 'phone',
        render: function (data, type, row) {
            return row.phone;
        } 
      },
      { data: 'city',
        render: function (data, type, row) {
            return row.city;
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
              <button organizationkey="`+row.oragnization+`" class="btn btn-sm btn-warning managerorganizationbtn" type="button"><i class="fa fa-solid fa-hotel">
                <span class="path1"></span>
                <span class="path2"></span>
              </i></button>
              <button class="btn btn-sm btn-primary managereditbtn" type="button"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-danger managerdeletebtn" type="button"><i class="fa fa-trash"></i></button>
            </div>
          `
        } 
      }
    ],
    "clinicid": $("#chosen_clinics").val(),
  });

  // organization table //
  var managertable_org = $('#kt_sidebar_nav').DataTable({
    "ajax": {
        "url": serviceUrl + "organization/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    serverSide: true,
    processing: true,
    "pageLength": 10,
    "order": [],
    "columns": [
      { data: 'id',
        render: function(data, type, row) {
          return `
            <center>
              <div class="form-check form-check-sm form-check-custom form-check-lg">
                <input id="checkOrgan" class="form-check-input changeOrganID" class="form-check-input" type="checkbox" value='${row.id}' />
              </div>
            </center>
          `
        }
      },
      { data: 'name',
        render: function(data, type, row) {
          return `
            <div class="form-check-label px-3 d-block">
              <div class="text-primary fs-2">${row.name}</div>
              <div class="fs-8"><i class="fa fa-location-dot"></i> ${row.address1} | <i class="fa fa-phone"></i> ${row.phone1}</div>
            </div>
          `
        }
      },
    ]
  });

  $('#table_search_input').on('keyup', function () {
    managertable.search(this.value).draw();
  });

  $(document).on("click",".manageraddbtn",function() {
    $('#chosen_manager').val("");
    $("#egender").val(1).trigger('change');
    $("#equalification").val(151).trigger('change');
    $("#edob").val('');
    $("#elanguage").val('English').trigger('change');
    $("#efname").val("");
    $("#elname").val("");
    $("#emname").val("");
    $("#enpi").val("");
    $("#elicense").val("");
    $("#eemail").val("");
    $("#etel").val("");
    $("#ecel").val("");
    $("#eaddress").val("");
    $("#eaddress2").val("");
    $("#efax").val("");
    $("#ecity").val("");
    $("#estate").val("");
    $("#eweb").val("");
    $("#ezip").val("");
    $("#ecname").val("");
    $("#ecemail").val("");
    $("#eccel").val("");
    $("#estatus").val('1');
    $("#specialty_id").val("").trigger('change');
    $("#insurance_id").val("").trigger('change');
    $("#taxonomy").val("");
    $("#kt_docs_select2_country").val("US").trigger('change');

    document.getElementById('specialistPhoto').style.backgroundImage = `url(/assets/media/svg/avatars/blank.svg)`;
    $("#photoname").val('none');
    
    $("#specialist-edit-modal").modal("show");
  });

  $(document).on("click",".managereditbtn",function() {
    $("#chosen_manager").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#efname").val(result[0]['fname']);
        $("#edob").val(result[0]['dob']);
        $("#equalification").val(result[0]['qualification']).trigger('change');
        $("#egender").val(result[0]['gender']).trigger('change');
        $("#elname").val(result[0]['lname']);
        $("#emname").val(result[0]['mname']);
        $("#enpi").val(result[0]['npi']);
        $("#eweb").val(result[0]['web']);
        $("#elicense").val(result[0]['license']);
        $("#eemail").val(result[0]['email']);
        $("#etel").val(result[0]['phone']);
        $("#ecel").val(result[0]['cel']);
        $("#eaddress").val(result[0]['address']);
        $("#eaddress2").val(result[0]['address2']);
        $("#efax").val(result[0]['fax']);
        $("#ecity").val(result[0]['city']);
        $("#estate").val(result[0]['state']).trigger('change');
        $("#ezip").val(result[0]['zip']);
        $("#ecname").val(result[0]['contactname']);
        $("#ecemail").val(result[0]['contactemail']);
        $("#eccel").val(result[0]['contactcel']);
        $("#estatus").val(result[0]['status']).trigger('change');
        $("#kt_docs_select2_country").val(result[0]['country']).trigger('change');
        
        if (result[0]['photo'] != '') {
          document.getElementById('specialistPhoto').style.backgroundImage = `url(data:image/png;base64,${result[0]['photo']})`;
          $("#photo_remove_btn").show();
          $("#photo_cancel_btn").show();
        }
        else if (result[0]['photo'] == '') {
          document.getElementById('specialistPhoto').style.backgroundImage = `url(/assets/media/svg/avatars/blank.svg)`;
          $("#photo_remove_btn").hide();
          $("#photo_cancel_btn").hide();
        }
        $("#photoname").val('none');


        if(result[0]['language']){
          $("#elanguage").val(result[0]['language'].split(",")).trigger('change');
        }else{
          $("#elanguage").val("").trigger('change');
        }
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
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/chosen", (xhr, err) => {
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
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/updateclinics", (xhr1, err1) => {
        if (!err1) {
          $("#specialist-clinic-modal").modal("hide");
          toastr.success('Clinics are updated successfully');
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
      toastr.warning('Please enter First name');
      $("#efname").focus();
      return;
    }
    if($("#elname").val() == ""){
      toastr.warning('Please enter Last name');
      $("#elname").focus();
      return;
    }
    if($("#etel").val() == ""){
      toastr.warning('Please enter Phone number');
      $("#etel").focus();
      return;
    }
    if($("#specialty_id").val() == ""){
      toastr.warning('Please enter Specialty');
      $("#specialty_id").focus();
      return;
    }
    if ($("#elanguage").val() == '') {
      toastr.warning('Please select languages');
      return;
    }
    if (filesize > 1024*30) {
      toastr.warning('Your image is too large. Image size is smaller than 30KB.');
      return;
    }

    if ($("#photoname").val() != 'update') {
      let entry = {
        id: $('#chosen_manager').val(),
        fname: document.getElementById('efname').value,
        lname: document.getElementById('elname').value,
        mname: document.getElementById('emname').value,
        dob: document.getElementById('edob').value,
        qualification: document.getElementById('equalification').value,
        gender: document.getElementById('egender').value,
        language: $("#elanguage").val().toString(),
        web: document.getElementById('eweb').value,
        npi: document.getElementById('enpi').value,
        license: document.getElementById('elicense').value,
        email: document.getElementById('eemail').value,
        tel: document.getElementById('etel').value,
        cel: document.getElementById('ecel').value,
        address: document.getElementById('eaddress').value,
        address2: document.getElementById('eaddress2').value,
        fax: document.getElementById('efax').value,
        city: document.getElementById('ecity').value,
        state: document.getElementById('estate').value,
        country: document.getElementById('kt_docs_select2_country').value,
        zip: document.getElementById('ezip').value,
        cname: document.getElementById('ecname').value,
        cemail: document.getElementById('ecemail').value,
        ccel: document.getElementById('eccel').value,
        status: document.getElementById('estatus').value,
        specialty_id: $('#specialty_id').val().toString(),
        insurance_id: $('#insurance_id').val().toString(),
        taxonomy: $('#taxonomy').val(),
        photo: '',
        photostate: $("#photoname").val()
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
    } else {
      //upload image
      var filename = '';
      var formData = new FormData();
      formData.append("ephoto", document.getElementById('ephoto').files[0]);
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "specialist/uploadimage", (xhr, err) => {
        if (!err) {
          if (JSON.parse(xhr.responseText)['data'] === undefined) filename = '';
          else filename = JSON.parse(xhr.responseText)['data'].filename;

          let entry = {
            id: $('#chosen_manager').val(),
            fname: document.getElementById('efname').value,
            lname: document.getElementById('elname').value,
            mname: document.getElementById('emname').value,
            qualification: document.getElementById('equalification').value,
            dob: document.getElementById('edob').value,
            gender: document.getElementById('egender').value,
            language: $("#elanguage").val().toString(),
            web: document.getElementById('eweb').value,
            npi: document.getElementById('enpi').value,
            license: document.getElementById('elicense').value,
            email: document.getElementById('eemail').value,
            tel: document.getElementById('etel').value,
            cel: document.getElementById('ecel').value,
            address: document.getElementById('eaddress').value,
            address2: document.getElementById('eaddress2').value,
            fax: document.getElementById('efax').value,
            city: document.getElementById('ecity').value,
            state: document.getElementById('estate').value,
            country: document.getElementById('kt_docs_select2_country').value,
            zip: document.getElementById('ezip').value,
            cname: document.getElementById('ecname').value,
            cemail: document.getElementById('ecemail').value,
            ccel: document.getElementById('eccel').value,
            status: document.getElementById('estatus').value,
            specialty_id: $('#specialty_id').val().toString(),
            insurance_id: $('#insurance_id').val().toString(),
            taxonomy: $('#taxonomy').val(),
            photo: filename,
            photostate: $("#photoname").val()
          }
      
          if($('#chosen_manager').val()==""){
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "specialist/add", (xhr, err) => {
              if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                if(result == "existed"){
                  return toastr.info('This data is already existed so please try with another email');
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
        }
      });
    }
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

  $("#ephoto").on('change', function(e) {
    if (e.target.value != '') {
      $("#photoname").val('update');
      filesize = e.target.files[0].size;
    }
    $("#photo_remove_btn").show();
    $("#photo_cancel_btn").show();
  })

  $("#photo_remove_btn").click(function() {
    document.getElementById('specialistPhoto').style.backgroundImage = `url(/assets/media/svg/avatars/blank.svg)`;
    $("#photoname").val('update');
    $("#photo_remove_btn").hide();
    $("#photo_cancel_btn").hide();
    filesize = 0;
  })

  $("#fspecialty").on('change', function(e) {
    if (e.target.value == '0') managertable.search('').draw();
    else managertable.search(sp[e.target.value]).draw();
  });

   // ### organization ### begin //
   var lock = false;
  $(document).on('click', '.managerorganizationbtn', function() {
    // get specialist id, organizations, clinics
    specialistid = $(this).parent().attr('idkey');
    var clinic = '';
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: specialistid}, "specialist/getClinics", (xhr, err) => {
      if (!err) {
        clinic = JSON.parse(xhr.responseText)['data'][0].clinic;

        if (!clinic || clinic == '') {
          lock = true;
          $(".changeOrganID").prop('checked', false);
          lock = false;

          $("#morganizationbtn").hide();
          $("#specialist-organization-modal").modal('show');

          //init clinic
          $("#rel_clinics").html('');
        } else {
          $("#morganizationbtn").show();
          //set title
          $("#org_title").html('Set Organizations for ' + $(this).parent().parent().parent()[0].childNodes[1].innerHTML);

          //init clinic
          $("#rel_clinics").html('');

          var available = clinic.split(',');
          var options = '';
          for(var i = 0; i < available.length; i ++) options += `<option value = "`+clinics[available[i]]['id']+`" >`+clinics[available[i]]['name']+`</option>`;
          $("#rel_clinics").html(options);

          //
          // read relationship data by using specialistid
          $(".changeOrganID").prop('checked', false);
          organizations = [];
          available.forEach(item => {
            organizations[item] = {
              clinicid: item,
              specialistid: specialistid,
              organizationid: []
            }
          });
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {specialistid: specialistid}, 'setting/relationship/getOrganizationBySpecialist', (xhr, err) => {
            if (!err) {
              //store in organizaions array.
              let result = JSON.parse(xhr.responseText)['data'];
              result.forEach(item => {
                organizations[item.clinicid] = {
                  clinicid: item.clinicid,
                  specialistid: specialistid,
                  organizationid: item.organizationid.split(',')
                }

                //
                lock = true;
                $(".changeOrganID").prop('checked', false);

                //set value
                var l = $(".changeOrganID").children().prevObject.length;
                for (var i = 0; i < l; i ++) {
                  if (organizations[$("#rel_clinics").val()]['organizationid'].indexOf($(".changeOrganID").children().prevObject[i].value) !== -1)
                    $(".changeOrganID").children().prevObject[i].checked = true;
                }
                lock = false;
              });
              $("#specialist-organization-modal").modal('show');
              //
            }
          });
        }
      }
    });
  });

  $(document).on("change", ".changeOrganID",  function(e) {
    if (!organizations.length) return;
    if (lock === false) {
      if (e.target.checked === true) {
        organizations[$("#rel_clinics").val()]['specialistid'] = specialistid;
        organizations[$("#rel_clinics").val()]['organizationid'].push(e.target.value);
      } else if (e.target.checked === false) {
        var index = organizations[$("#rel_clinics").val()]['organizationid'].indexOf(e.target.value);
        if (index !== -1) {
          organizations[$("#rel_clinics").val()]['organizationid'].splice(index, 1);
        }
      }
    }
  });

  $(document).on("change", "#rel_clinics", function(e) {
    lock = true;
    $(".changeOrganID").prop('checked', false);

    //set value
    var l = $(".changeOrganID").children().prevObject.length;
    for (var i = 0; i < l; i ++) {
      if (organizations[e.target.value]['organizationid'].indexOf($(".changeOrganID").children().prevObject[i].value) !== -1)
        $(".changeOrganID").children().prevObject[i].checked = true;
    }
    lock = false;
  });

  managertable_org.on('draw.dt', function(e) {

    setTimeout(() => {
      lock = true;
      $(".changeOrganID").prop('checked', false);

      //set value
      var l = $(".changeOrganID").children().prevObject.length;
      for (var i = 0; i < l; i ++) {
        if (organizations[$("#rel_clinics").val()] !== undefined) {
          if (organizations[$("#rel_clinics").val()]['organizationid'].indexOf($(".changeOrganID").children().prevObject[i].value) !== -1)
            $(".changeOrganID").children().prevObject[i].checked = true;
        }
      }
      lock = false;
    }, 50);
  });

  $("#morganizationbtn").on('click', () => {
    let entry = {
      organizationid: organizations,
      specialistid: specialistid
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/relationship/set", (xhr, err) => {
      if (!err) {
        $("#specialist-organization-modal").modal('hide');
        toastr.success('Organizations are updated successfully!');
      } else {
        toastr.error('Action Failed!');
      }
    });
  });

  $("#org_search_input").on('keyup', function() {
    managertable_org.search(this.value).draw();
  })

  // ### organization ### end //
});
