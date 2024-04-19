
var patient_id = 0;

var encounter_table = $('#encounter_table').DataTable({
  "ajax": {
      "url": serviceUrl + "hedis/encounter",
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

      { data: "completed",
        render: function (data, type, row) {
          return row.completed=="1"?'<i class="ki-duotone ki-verify fs-1 text-primary"><span class="path1"></span><span class="path2"></span></i>':'';
        } 
      },
      { data: "reason"},
      { data: "enc_type"},
      { data: 'status' },
      { data: 'enc_start',
        render: function (data, type, row) {
          return new Date(row.enc_start).toLocaleString();;
        } 
      },
      { data: 'total_mins' },
      { data: 'id',
        render: function (data, type, row) {
          return `
            <div class="btn-group align-top " idkey="`+row.id+`">
              <button class="btn  btn-primary badge encounter_edit_btn"  data-toggle="modal" type="button"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>
            </div>
          `
        } 
      }
  ]
});

$(document).on("click",".notesbtn",function(){
  $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
  $("#pt_mid").val($(this).parent().parent().children().eq(24).html());
  $("#pt_emrid").val($(this).parent().parent().children().eq(3).html());
  $("#pt_insurance").val($(this).parent().parent().children().eq(2).html());
  $("#encounter_clinic_id").val(localStorage.getItem('chosen_clinic'));
  $("#encounter_pcp_id").val(localStorage.getItem('userid'));
  $("#encounter_patient_id").val('');
  $("#encounter_emr_id").val('');
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: $("#chosen_item").val()}, "hedis/getPatient", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length>0){
        $("#encounter_patient_id").val(result[0]['id']);
        $("#encounter_emr_id").val(result[0]['patientid']);
        
        $("#pt_gender").html(result[0]['GENDER']);
        $("#pt_name_icon").html(result[0]['FNAME'].substring(0,1)+result[0]['LNAME'].substring(0,1));
        $("#pt_fullname").html(result[0]['FNAME'] + " " + result[0]['LNAME'])
        $("#pt_address").html(result[0]['ADDRESS'] + ", " + result[0]['CITY'])
        $("#pt_dob").html(new Date(result[0]['DOB']).toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'})),
        $("#pt_telephone").html(result[0]['PHONE'])
        if(result[0]['PHONE']){
          $("#pt_telephone").parent().parent().removeClass("d-none");
        }else{
          $("#pt_telephone").parent().parent().addClass("d-none");
        }
        $("#pt_phone").html(result[0]['MOBILE'])
        if(result[0]['MOBILE']){
          $("#pt_phone").parent().parent().removeClass("d-none");
          $("#encounter_modal_phone").parent().removeClass("d-none");
        }else{
          $("#pt_phone").parent().parent().addClass("d-none");
          $("#encounter_modal_phone").parent().addClass("d-none");
        }
        $("#pt_email").html(result[0]['EMAIL']);
        if(result[0]['EMAIL']){
          $("#pt_email").parent().parent().removeClass("d-none");
          $("#encounter_modal_email").parent().removeClass("d-none");
        }else{
          $("#pt_email").parent().parent().addClass("d-none");
          $("#encounter_modal_email").parent().addClass("d-none");
        }
        $("#pt_language").html(result[0]['Language']);
        $("#pt_insid").html(result[0]['INS_ID']);
        if(result[0]['INS_ID']){
          $("#pt_insid").parent().parent().removeClass("d-none");
        }else{
          $("#pt_insid").parent().parent().addClass("d-none");
        }
        $("#encounter_modal_fullname").html($("#pt_fullname").html());
        $("#encounter_modal_language").html($("#pt_language").html());
        $("#encounter_modal_clinic").html($("#hedis_clinic_name").val());
        $("#encounter_modal_gender").html($("#pt_gender").html());
        $("#encounter_modal_dob").html($("#pt_dob").html());
        $("#encounter_modal_telephone").html($("#pt_telephone").html());
        $("#encounter_modal_phone").html($("#pt_phone").html());
        $("#encounter_modal_email").html($("#pt_email").html());
        patient_id = result[0]['id'];
        encounter_table.ajax.reload();
        $("#encounter_modal").modal("show");
      }
    }
  });
  
});

$(document).on("click",".encounter_edit_btn",function(){
  observation_id = null;
  $("#encounter_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#encounter_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];

      $("#encounter_modal_fullname").html(result[0]['FNAME']+" "+result[0]['LNAME']);
      $("#encounter_modal_language").html(result[0]['Language']);
      $("#encounter_modal_clinic").html(result[0]['clinic_name']);
      $("#encounter_modal_gender").html(result[0]['GENDER']);
      $("#encounter_modal_dob").html(moment(result[0]['DOB']).format("Do MMM YYYY"));
      $("#encounter_modal_telephone").html(result[0]['PHONE']);
      $("#encounter_modal_phone").html(result[0]['MOBILE']);
      $("#encounter_modal_email").html(result[0]['EMAIL']);

      $("#encounter_patient_id").val(result[0]['patient_id']);
      $("#encounter_emr_id").val(result[0]['patientid']);
      $("#encounter_clinic_id").val(localStorage.getItem('chosen_clinic'));
      $("#encounter_pcp_id").val(localStorage.getItem('userid'));

      $("#encounter_completed").prop("checked", result[0]['completed']);
      $("#encounter_enc_type").val(result[0]['enc_type']);
      $("#encounter_status").val(result[0]['status']);
      $("#encounter_team_member").val(result[0]['team_member']);
      $("#encounter_assigned").val(result[0]['assigned']);
      $("#encounter_enc_start").val(new Date(result[0]['enc_start']));
      $("#encounter_total_mins").val(result[0]['total_mins']);
      $("#encounter_notes").val(result[0]['notes']);
      $("#encounter_action_taken").val(result[0]['action_taken']);
      $("#encounter_class").val(result[0]['class']);
      $("#encounter_priority").val(result[0]['priority']);
      $("#encounter_service_type").val(result[0]['service_type']);
      $("#encounter_participant_type").val(result[0]['participant_type']);
      $("#encounter_reason").val(result[0]['reason']);
      $("#encounter_reason_use").val(result[0]['reason_use']);
      $("#encounter_reason_codes").val(result[0]['reason_codes']);
      $("#encounter_edit_modal").modal("show");
      $("#encounter_modal").modal("hide");
    } else {
      return toastr.error("Action Failed");
    }
  });
});



$(document).on("click","#add_btn",function(){
  // $("#encounter_id").val('');
  // $("#encounter_completed").prop("checked", false);
  // $("#encounter_enc_type").val('phone call');
  // $("#encounter_status").val('in-progress');
  // $("#encounter_team_member").val(localStorage.getItem('username'));
  // $("#encounter_assigned").val('');
  // $("#encounter_total_mins").val('1');
  // $("#encounter_notes").val('');
  // $("#encounter_action_taken").val('');
  // $("#encounter_enc_start").val(new Date().toLocaleString());
  // $("#encounter_reason").val('');
  // $("#encounter_participant_type").val('CALLBCK');
  // $("#encounter_service_type").val('Medical Service');
  // $("#encounter_reason_use").val('HM');
  // $("#timer_diplay").html("00 : 00");
  

  // $("#encounter_edit_modal").modal("show");
});

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

var timer;
var timer_start = 0;
var timer_diff = 0
$(document).on("click","#timer_start",function(){
  timer_start = new Date().getTime()
  $("#encounter_total_mins").val("1");
  timer = setInterval( function () {
    timer_diff= parseInt((new Date().getTime() - timer_start)/1000);
    $("#timer_diplay").html(pad(parseInt(timer_diff / 60))+" : "+pad(timer_diff % 60));
    $("#encounter_timer").val(timer_diff);
  }, 1000 );
});

$(document).on("click","#timer_end",function(){
  clearInterval(timer)
  $("#encounter_total_mins").val(Math.ceil(timer_diff/60));
});

$(document).on("click",".delete_btn",function(){
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/delete", (xhr, err) => {
        if (!err) {
          setTimeout( function () {
            encounter_table.ajax.reload();
          }, 1000 );
        } else {
          return toastr.error("Action Failed");
        }
      });
    }
  });

});

sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id: localStorage.getItem('chosen_clinic')}, "user/getAllDoctorsByClinic", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    options += '<option value="" ></option>';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['id']+'" >'+result[i]['fname'] +' '+result[i]['lname']+'</option>';
    }
    $("#encounter_assigned").html(options);
  }
});



sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterStatus", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_status").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterClass", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_class").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterPriority", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_priority").html(options);
  }
});

// sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterType", (xhr, err) => {
//   if (!err) {
//     let result = JSON.parse(xhr.responseText)['data'];
//     var options = '';
//     for(var i=0; i<result.length; i++){
//       options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
//     }
//     $("#encounter_enc_type").html(options);
//   }
// });

// sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterServiceType", (xhr, err) => {
//   if (!err) {
//     let result = JSON.parse(xhr.responseText)['data'];
//     var options = '';
//     for(var i=0; i<result.length; i++){
//       options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
//     }
//     $("#encounter_service_type").html(options);
//   }
// });

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterSubjectStatus", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_subject_status").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterParticipantType", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_participant_type").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterReasonUse", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_reason_use").html(options);
  }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterReasonCodes", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    options += '<option value="" ></option>';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
    }
    $("#encounter_reason_codes").html(options);
  }
});

new tempusDominus.TempusDominus(document.getElementById("encounter_enc_start"), {
  
});


$("#encounter_update_btn").click(function (e) {
  if($("#encounter_enc_start").val() == ""){
    toastr.info('Please enter Start Time');
    $("#encounter_enc_start").focus();
    return;
  }
  if($("#encounter_total_mins").val() == ""){
    toastr.info('Please enter correctly Total Mins');
    $("#encounter_total_mins").focus();
    return;
  }
  let entry = {}

  entry["id"] = $("#encounter_id").val();
  entry["clinic_id"] = $("#encounter_clinic_id").val();
  entry["patient_id"] = $("#encounter_patient_id").val();
  entry["emr_id"] = $("#encounter_emr_id").val();
  entry["pcp_id"] = $("#encounter_pcp_id").val();

  entry["reason"] = $("#encounter_reason").val();
  entry["team_member"] = $("#encounter_team_member").val();
  entry["status"] = $("#encounter_status").val();
  entry["assigned"] = $("#encounter_assigned").val();
  entry["reason_use"] = $("#encounter_reason_use").val();
  entry["service_type"] = $("#encounter_service_type").val();
  entry["participant_type"] = $("#encounter_participant_type").val();
  entry["priority"] = $("#encounter_priority").val();
  entry["class"] = $("#encounter_class").val();
  entry["enc_type"] = $("#encounter_enc_type").val();
  entry["enc_start"] = $("#encounter_enc_start").val();
  entry["total_mins"] = $("#encounter_total_mins").val();
  entry["notes"] = $("#encounter_notes").val();
  entry["action_taken"] = $("#encounter_action_taken").val();
  entry["completed"] = $("#encounter_completed").prop("checked")?"1":"0";

  if($("#encounter_id").val()==""){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/create", (xhr, err) => {
      if (!err) {
        $("#encounter_edit_modal").modal("hide");
        toastr.success("Encounter is added successfully");
      } else {
        return toastr.error("Action Failed");
      }
    });
  }else{
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/update", (xhr, err) => {
      if (!err) {
        $("#encounter_edit_modal").modal("hide");
        toastr.success("Encounter is updated successfully");
      } else {
        return toastr.error("Action Failed");
      }
    });
  }
  
  setTimeout( function () {
    encounter_table.ajax.reload();
  }, 1000 );
});