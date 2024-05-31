
var patient_id = 0;

function calculateAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
}

var appointment_table = $('#appointment_table').DataTable({
  "ajax": {
      "url": serviceUrl + "referral/appointment",
      "type": "POST",
      "headers": { 'Authorization': localStorage.getItem('authToken') },
      "data":function (d) {
        d.clinic_id = localStorage.getItem('chosen_clinic'),
        d.patient_id = patient_id
      },
  },
  "pageLength": 10,
  "order": [],
  "bAutoWidth": false, 
  "columns": [
      { data: "attended",
        render: function (data, type, row) {
          return row.attended=="1"?'<i class="ki-duotone ki-verify fs-1 text-primary"><span class="path1"></span><span class="path2"></span></i>':'';
        } 
      },
      { data: "pcp_id",
        render: function (data, type, row) {
          return '<div class="mx-2">'+row.fname+' '+row.lname+'</div>';
        } 
      },
      { data: "reason",
        render: function (data, type, row) {
          return '<div class="w-450px overflow-hidden " style="white-space: nowrap; text-overflow: ellipsis;" >'+row.reason+'</div>';
        }
      },
      { data: 'status', 
        render: function (data, type, row) {
          return row.status?row.status[0].toUpperCase() + row.status.slice(1).toLowerCase():"";
        }
      },
      { data: 'start_date',
        render: function (data, type, row) {
          return new Date(row.approve_date).toLocaleString().split(',')[0]+" "+row.start_date.substring(0,5);
        } 
      },
      { data: 'id',
        render: function (data, type, row) {
          return `
            <div class="btn-group align-top " >
              <button class="btn  btn-primary badge appt_edit_btn" data-id="`+row.id+`"  data-toggle="modal" type="button"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn  btn-danger badge appt_delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>
            </div>
          `
        } 
      }
  ]
});

$(document).on("click",".apptbtn",function(){
  $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
  $("#appt_pt_mid").val($(this).parent().parent().children().eq(24).html());
  $("#appt_pt_inspcpid").val($(this).parent().parent().children().eq(33).html());
  $("#appt_pt_cyear").val($(this).parent().parent().children().eq(34).html());
  $("#appt_pt_emrid").val($(this).parent().parent().children().eq(3).html());
  $("#appt_pt_mrnid").html($("#appt_pt_emrid").val());
  $("#appt_pt_insurance").val($(this).parent().parent().children().eq(2).html());
  $("#appointment_clinic_id").val(localStorage.getItem('chosen_clinic'));
  $("#appointment_pcp_id").val(localStorage.getItem('userid'));
  $("#appointment_patient_id").val('');
  $("#appointment_emr_id").val('');
  $("#appointment_modal_age").html('');
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $("#chosen_item").val()}, "hedis/getPatient", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length>0){
        $("#appointment_patient_id").val(result[0]['id']);
        $("#appointment_emr_id").val(result[0]['patientid']);
        
        
        $("#appt_pt_gender").html(result[0]['GENDER']);
        $("#appt_pt_name_icon").html(result[0]['FNAME'].substring(0,1)+result[0]['LNAME'].substring(0,1));
        $("#appt_pt_fullname").html(result[0]['FNAME'] + " " + result[0]['LNAME'])
        $("#appt_pt_address").html(result[0]['ADDRESS'] + ", " + result[0]['CITY'])
        $("#appt_pt_dob").html(new Date(result[0]['DOB']).toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'})),
        $("#appt_pt_age").html(calculateAge(result[0]['DOB']));
        
        if(result[0]['PHONE']){
          $("#appt_pt_telephone").parent().parent().removeClass("d-none");
          $("#appt_pt_telephone").html(result[0]['PHONE'])
        }else{
          $("#appt_pt_telephone").parent().parent().addClass("d-none");
        }
        
        if(result[0]['MOBILE']){
          $("#appt_pt_phone").parent().parent().removeClass("d-none");
          $("#appointment_modal_phone").parent().removeClass("d-none");
          $("#appt_pt_phone").html(result[0]['MOBILE'])
        }else{
          $("#appt_pt_phone").parent().parent().addClass("d-none");
          $("#appointment_modal_phone").parent().addClass("d-none");
        }
        $("#appt_pt_email").html(result[0]['EMAIL']);
        if(result[0]['EMAIL']){
          $("#appt_pt_email").parent().parent().removeClass("d-none");
          $("#appointment_modal_email").parent().removeClass("d-none");
        }else{
          $("#appt_pt_email").parent().parent().addClass("d-none");
          $("#appointment_modal_email").parent().addClass("d-none");
        }
        $("#appt_pt_language").html(result[0]['Language']);
        $("#appt_pt_insid").html(result[0]['INS_ID']);
        if(result[0]['INS_ID']){
          $("#appt_pt_insid").parent().parent().removeClass("d-none");
        }else{
          $("#appt_pt_insid").parent().parent().addClass("d-none");
        }
        $("#appointment_modal_fullname").html($("#appt_pt_fullname").html());
        $("#appointment_modal_age").html(calculateAge(result[0]['DOB']));
        $("#appointment_modal_language").html($("#appt_pt_language").html());
        $("#appointment_modal_clinic").html($("#hedis_clinic_name").val());
        $("#appointment_modal_gender").html($("#appt_pt_gender").html());
        $("#appointment_modal_dob").html($("#appt_pt_dob").html());
        $("#appointment_modal_telephone").html($("#appt_pt_telephone").html());
        $("#appointment_modal_phone").html($("#appt_pt_phone").html());
        $("#appointment_modal_email").html($("#appt_pt_email").html());
        patient_id = result[0]['id'];
        appointment_table.ajax.reload();

        $("#appointment_title").html("New Appointment");
        $("#appt_add_btn").click();

        
        
      }
    }
  });
  
});

$(document).on("click",".appt-list",function(){
  
  $("#appointment_edit_modal").modal("hide");
  $("#appointment_modal").modal("show");
});

function GetFormattedDate(date) {
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day  = ("0" + (date.getDate())).slice(-2);
  var year = date.getFullYear();
  // var hour =  ("0" + (date.getHours())).slice(-2);
  // var min =  ("0" + (date.getMinutes())).slice(-2);
  // var seg = ("0" + (date.getSeconds())).slice(-2);
  return year + "-" + month + "-" + day;
}

$(document).on("click",".appt_edit_btn",function(){

  $("#appointment_id").val($(this).data("id"));
  let entry = {
    id: $(this).data("id"),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];

      $("#appointment_modal_fullname").html(result[0]['FNAME']+" "+result[0]['LNAME']);
      $("#appointment_modal_age").html(calculateAge(result[0]['DOB']));
      $("#appointment_modal_language").html(result[0]['Language']);
      $("#appointment_modal_clinic").html(result[0]['clinic_name']);
      $("#appointment_modal_gender").html(result[0]['GENDER']);
      $("#appointment_modal_dob").html(moment(result[0]['DOB']).format("Do MMM YYYY"));
      $("#appointment_modal_telephone").html(result[0]['PHONE']);
      $("#appointment_modal_phone").html(result[0]['MOBILE']);
      $("#appointment_modal_email").html(result[0]['EMAIL']);
      $("#appointment_patient_id").val(result[0]['patient_id']);
      $("#appointment_emr_id").val(result[0]['emr_id']);
      $("#appointment_clinic_id").val(localStorage.getItem('chosen_clinic'));
      $("#appointment_pcp_id").val(localStorage.getItem('userid'));
      
      $("#appointment_clinic_name").html(result[0]['clinic_name']);
      $("#appointment_participate_status").val(result[0]['pt_participate_status']);
      $("#appointment_approve_date").val(GetFormattedDate(new Date(result[0]['approve_date'])));
      $("#appointment_start_date").val(result[0]['start_date']);
      $("#appointment_end_date").val(result[0]['end_date']);
      $('input[name="appointment_provider"]').filter('[value="0"]').prop("checked", result[0]['provider']=="0"?true:false);
      $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", result[0]['provider']=="1"?true:false);
      $("#appointment_measure").val(result[0]['measure']);
      $("#appointment_assessment").val(result[0]['assessment']);

      if(result[0]['provider']=="0"){
        $("#appointment_specialist_provider").prop("disabled", true);
        $("#appointment_clinic_provider").prop("disabled", false);
        $("#appointment_clinic_provider").val(result[0]['provider_id']);
        $("#appointment_specialist_provider").val("");
      }else{
        $("#appointment_specialist_provider").prop("disabled", false);
        $("#appointment_clinic_provider").prop("disabled", true);
        $("#appointment_clinic_provider").val("");
        $("#appointment_specialist_provider").val(result[0]['provider_id']);
      }
      $("#appointment_attended").prop('checked', result[0]['attended']=="1"?true:false);
      $("#appointment_status").val(result[0]['status']);
      $("#appointment_cancel_reason").val(result[0]['cancel_reason']);
      $("#appointment_class").val(result[0]['class']);
      $("#appointment_service_category").val(result[0]['service_category']);
      $("#appointment_appt_type").val(result[0]['appt_type']);
      $("#appointment_reason").val(result[0]['reason']);
      $("#appointment_priority").val(result[0]['priority']);
      $("#appointment_description").val(result[0]['description']);
      $("#appointment_cancel_date").val(GetFormattedDate(new Date(result[0]['cancel_date'])));
      $("#appointment_notes").val(result[0]['notes']);
      $("#appointment_pt_instruction").val(result[0]['pt_instruction']);
      $("#appointment_edit_modal").modal("show");
      $("#appointment_modal").modal("hide");

    } else {
      return toastr.error("Action Failed");
    }
  });
});

$(document).on("click","#appt_add_btn",function(){
  var t = new Date().toISOString().split('T')[0];
  $("#appointment_id").val('');
  $("#appointment_participate_status").val('needs-action');
  $("#appointment_approve_date").val(t);
  $("#appointment_attended").prop('checked', false);
  $("#appointment_status").val('proposed');
  $("#appointment_measure").val($("#appt_pt_mid").val());
  $("#appointment_reason").val($("#appointment_measure option:selected").text().split(" - ")[1]);
  getSpecialty();
  $("#appointment_cancel_reason").val('');
  $("#appointment_class").val('VR');
  $("#appointment_service_category").val('');
  
  $("#appointment_priority").val('R');
  $("#appointment_description").val('');
  $("#appointment_start_date").val("09:00");
  $("#appointment_end_date").val('09:15');
  $("#appointment_cancel_date").val('');
  $("#appointment_notes").val('');
  $("#appointment_pt_instruction").val('');
  $("#appointment_pt_instruction_date").val('');
  $("#appointment_edit_modal").modal("show");
});

$(document).on("click",".appt_delete_btn",function(){
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/delete", (xhr, err) => {
        if (!err) {
          setTimeout( function () {
            appointment_table.ajax.reload();
          }, 1000 );
        } else {
          return toastr.error("Action Failed");
        }
      });
    }
  });

});

var measure = []
var observation = []

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/getMeasureObservation", (xhr, err) => {
  if (!err) {
    observation = JSON.parse(xhr.responseText)['data'];
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/measuresData", (xhr, err) => {
  if (!err) {
    let measure = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<measure.length; i++){
      options += '<option value="'+measure[i]['measureId']+'" >'+measure[i]['measureId']+' - '+measure[i]['title']+'</option>';
    }
    $("#appointment_measure").html(options);

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {measureid: $("#appointment_specialist_provider").val()}, "specialist/getSpecialistByMeasureId", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        var options = '';
        for(var i=0; i<result.length; i++){
          options += '<option value="'+result[i]['id']+'" >'+result[i]['fname']+' '+result[i]['lname']+'</option>';
        }
        $("#appointment_specialist_provider").html(options);
        if (result.length) $("#appointment_specialist_provider").val(result[0]['id']);
      }
    });
  }
});

sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id: localStorage.getItem('chosen_clinic')}, "user/getDoctorsByClinic", (xhr, err) => {
  if (!err) {
    let doctors = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<doctors.length; i++){
      options += '<option value="'+doctors[i]['id']+'" >'+doctors[i]['fname']+' '+doctors[i]['lname']+'</option>';
    }
    $("#appointment_clinic_provider").html(options);
  }
});

let appointmentType = []

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentType", (xhr, err) => {
  if (!err) {
    appointmentType = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<appointmentType.length; i++){
      options += '<option value="'+appointmentType[i]['id']+'" >'+appointmentType[i]['name']+'</option>';
    }
    $("#appointment_appt_type").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "valueset/encounterClass", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#appointment_class").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterPriority", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#appointment_priority").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterParticipantType", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#appointment_participant_type").html(options);
  }
});

$(document).on("change","#appointment_measure",function(){
  $("#appointment_reason").val($("#appointment_measure option:selected").text().split(" - ")[1]);
  $("#appointment_assessment").html("");
  // getSpecialty();
  for(var i=0; i<observation.length; i++){
    if(observation[i]['m_id'] == $(this).val()){
      try{
        var icd = JSON.parse(observation[i]['ICD']);
        var options = '';
        for(var j=0; j<icd.length; j++){
          options += '<option value="'+icd[j]['value']+'" >'+icd[j]['code']+'</option>';
        }
        $("#appointment_assessment").html(options);

      }catch(e){
        console.log(observation[i]['ICD'])
      }
    }
  }


});

function getSpecialty(){
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {measure_id: $("#appointment_measure").val()}, "referral/appointmentSpecialty/getSpecialtyByMeasure", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length>0){
        $("#appointment_specialty").val(result[0]['id']);
      }
    }
  });
}

var duration_mins = 0;

$(document).on("change","#appointment_appt_type",function(){
  for(var i=0; i<appointmentType.length; i++){
    if(appointmentType[i]['id'] == $(this).val()){
      duration_mins = appointmentType[i]['duration'];
      
      setEndData();
      
    }
  }
});

$(document).on("change","#appointment_start_date",function(){
  setEndData();
});

function checkTime(i) {
  return (i < 10) ? "0" + i : i;
}

function setEndData(){
  let startTime = new Date();
  let start_date = $("#appointment_start_date").val();
  startTime.setHours(start_date.split(":")[0], start_date.split(":")[1], 0, 0);
  let end_date = new Date(startTime);
  end_date.setMinutes(end_date.getMinutes() + duration_mins);
  $("#appointment_end_date").val(checkTime(end_date.getHours())+":"+checkTime(end_date.getMinutes()));
}

$("#appointment_specialist_provider").prop("disabled", true);
$(document).on("change",".provider-radio",function(){
  var value = $('input[name="appointment_provider"]:checked').val();
  if(value=="0"){
    $("#appointment_specialist_provider").val("");
    $("#appointment_specialist_provider").prop("disabled", true);
    $("#appointment_clinic_provider").prop("disabled", false);
    $("#appointment_clinic_provider").val($("#appointment_clinic_provider option:first").val());
  }else{
    $("#appointment_clinic_provider").val("");
    $("#appointment_clinic_provider").prop("disabled", true);
    $("#appointment_specialist_provider").prop("disabled", false);
    $("#appointment_specialist_provider").val($("#appointment_specialist_provider option:first").val());
  }
});

$("#appt_save_btn").click(function (e) {
  if($("#appointment_patient_id").val() == ""){
    toastr.info('Please select Patient');
    return;
  }
  if($("#appointment_reason").val() == ""){
    toastr.info('Please enter Reason');
    $("#appointment_reason").focus();
    return;
  }
  if($("#appointment_start_date").val() == ""){
    toastr.info('Please enter Start Date');
    $("#appointment_start_date").focus();
    return;
  }
  let entry = {}

  $('.form-control').each(function() {
    if($(this).data('field')!==undefined){
        
        if($(this).attr('type')=='checkbox'){
          entry[$(this).data('field')] = $(this).prop("checked")?"1":"0";
        }else{
          entry[$(this).data('field')] = $(this).val();
        }
    }
  });
  entry['provider'] = $('input[name="appointment_provider"]:checked').val();
  entry['ins_id'] = $("#appt_pt_insurance").val();
  entry['subscrber_no'] = $("#appt_pt_inspcpid").val();
  entry['year'] = $("#appt_pt_cyear").val();

  
  if($("#appointment_id").val()==""){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/create", (xhr, err) => {
      if (!err) {
        if(JSON.parse(xhr.responseText)['message']=="exist"){
          toastr.info("Appointment is exist");
        }else{
          $("#appointment_edit_modal").modal("hide");
          toastr.success("Appointment is added successfully");
        }
        
      } else {
        return toastr.error("Action Failed");
      }
    });
  }else{
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/update", (xhr, err) => {
      if (!err) {
        $("#appointment_edit_modal").modal("hide");
        toastr.success("Appointment is updated successfully");
      } else {
        return toastr.error("Action Failed");
      }
    });
  }
  
  setTimeout( function () {
    appointment_table.ajax.reload();
  }, 1000 );
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "patientlist/getLanguages", (xhr, err) => {
  if (!err) {
    let data = JSON.parse(xhr.responseText)['data'];
    $("#language").empty();
      for(var i = 0; i < data.length; i++){
        var selected = (data[i]['code']=='en')?`selected`:``
        $("#language").append(`
            <option value = "`+data[i]['english']+`" `+selected+` >`+data[i]['english']+`</option>
        `);
      }
    
  } else {
    return toastr.error('Action Failed');
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "patientlist/getRace", (xhr, err) => {
  if (!err) {
    let data = JSON.parse(xhr.responseText)['data'];
    $("#race").empty();
    $("#race").append(`<option value=""></option>`);
    for(var i = 0; i < data.length; i++){
      var selected = (data[i]['code']=='en')?`selected`:``
      $("#race").append(`
          <option value = "`+data[i]['display']+`" `+selected+` >`+data[i]['display']+`</option>
      `);
    }
    
  } else {
    return toastr.error('Action Failed');
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "patientlist/getEthnicity", (xhr, err) => {
  if (!err) {
    let data = JSON.parse(xhr.responseText)['data'];
    $("#ethnicity").empty();
    $("#ethnicity").append(`<option value=""></option>`);
    for(var i = 0; i < data.length; i++){
      $("#ethnicity").append(`
          <option value = "`+data[i]['code'].replace(/\&nbsp;/g, '')+`" >`+data[i]['display']+`</option>
      `);
    }
    
  } else {
    return toastr.error('Action Failed');
  }
});

 sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "patientlist/getMarital", (xhr, err) => {
  if (!err) {
    let data = JSON.parse(xhr.responseText)['data'];
    $("#marital").empty();
    for(var i = 0; i < data.length; i++){
      var selected = (data[i]['code']=='A')?`selected`:``
        $("#marital").append(`
            <option value = "`+data[i]['id']+`" `+selected+` >`+data[i]['display']+`</option>
        `);
    }
    
  } else {
    return toastr.error('Action Failed');
  }
});

$(".pt_info").click(function (e) {
  if($(this).data("id"))$("#appointment_patient_id").val($(this).data("id"));
  let entry = {
    pt_id: $("#appointment_patient_id").val(),
    emr_id:$("#appt_pt_emrid").val()
  }

  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/get", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length>0){
        $("#appointment_patient_id").val(result[0]['id']);
        $("#fname").val(result[0]['FNAME']);
        $("#mname").val(result[0]['MNAME']);
        $("#lname").val(result[0]['LNAME']);
        $("#emr_id").val(result[0]['patientid']);
        $("#gender").val(result[0]['GENDER'].toLocaleLowerCase());
        $("#email").val(result[0]['EMAIL']);
        if(result[0]['DOB'])
          $("#dob").val(result[0]['DOB'].split("T")[0]);
        $("#phone").val(result[0]['PHONE']);
        $("#mobile").val(result[0]['MOBILE']);
        $("#address").val(result[0]['ADDRESS']);
        $("#address2").val(result[0]['ADDRESS2']);
        $("#zip").val(result[0]['ZIP']);
        $("#city").val(result[0]['CITY']);
        $("#state").val(result[0]['State']);
        $("#race").val(result[0]['race']);
        $("#ethnicity").val(result[0]['ethnicity_CDC']);
        $("#marital").val(result[0]['marital_status']);
        if(result[0]['Deceased_at'])
          $("#deceased_at").val(result[0]['Deceased_at'].split("T")[0]);
        $('#deceased').prop('checked', result[0]['Deceased_at']=="1"?true:false);
        if(result[0]['Deceased_at']=="1"){
          $("#deceased_at").prop("disabled", false);
        }else{
          $("#deceased_at").prop("disabled", true);
        }
        $("#patient-add-modal").modal("show");
        $("#appointment_edit_modal").modal("hide");
      }else{
        
      }
      
    }
  });
  
});

$(document).on("click","#save_patient_btn",function(){
  
  if($("#fname").val() == ""){
    $("#fname").focus();
    return toastr.info('Please enter First Name');
  }
  if($("#lname").val() == ""){
    $("#lname").focus();
    return toastr.info('Please enter Last Name');
  }
  if($("#dob").val() == ""){
    return toastr.info('Please enter DOB');
  }

  let entry = {
    user_id:localStorage.getItem('userid'),
    id: $("#appointment_patient_id").val(),
    fname: document.getElementById('fname').value,
    mname: document.getElementById('mname').value,
    lname: document.getElementById('lname').value,
    gender: document.getElementById('gender').value,
    emr_id: document.getElementById('emr_id').value,
    email: document.getElementById('email').value,
    dob: document.getElementById('dob').value,
    phone: document.getElementById('phone').value,
    mobile: document.getElementById('mobile').value,
    language: document.getElementById('language').value,
    address: document.getElementById('address').value,
    address2: document.getElementById('address2').value,
    city: document.getElementById('city').value,
    zip: document.getElementById('zip').value,
    state: document.getElementById('state').value,
    race: document.getElementById('race').value,
    ethnicity: document.getElementById('ethnicity').value,
    marital: document.getElementById('marital').value,
    deceased: $('#deceased').is(":checked")?"1":"0",
    deceased_at: document.getElementById('deceased_at').value,
  }

  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/update", (xhr, err) => {
    if (!err) {
      $("#patient-add-modal").modal("hide");
      $("#appointment_edit_modal").modal("hide");
      $("#appointment_modal").modal("hide");
      return toastr.success('patient is added successfully');
    } else {
      return toastr.error('Action Failed');
    }
});

});

// ### //
$("#appointment_measure").on('change', (e) => {
  let entry = {
    measureid: e.target.value
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'specialist/getSpecialistByMeasureId', (xhr, err) => {
    if (!err) {
      var result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      result.forEach(item => {
        item['clinic'].split(',').forEach(value => {
          if (value == localStorage.getItem('chosen_clinic')) {
            options += '<option value="' + item['id'] + '" >' + item['fname'] + ' ' + item['lname'] + '</option>';
          }
        })
      });
      $("#appointment_specialist_provider").html(options);
    }
  });
});
