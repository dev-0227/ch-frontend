
var patient_id = 0;

var appointment_table = $('#appointment_table').DataTable({
  "ajax": {
      "url": serviceUrl + "hedis/encounter/appointment",
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
      { data: "pcp_id",
        render: function (data, type, row) {
          return row.fname+" "+row.lname;
        } 
      },
      { data: "reason"},
      { data: 'pt_participate_status' },
      { data: 'start_date',
        render: function (data, type, row) {
          return new Date(row.start_date).toLocaleString();;
        } 
      },
      { data: 'id',
        render: function (data, type, row) {
          return `
            <div class="btn-group align-top " idkey="`+row.id+`">
              <button class="btn  btn-primary badge appt_edit_btn"  data-toggle="modal" type="button"><i class="fa fa-edit"></i> Edit</button>
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
  $("#appt_pt_emrid").val($(this).parent().parent().children().eq(3).html());
  $("#appt_pt_insurance").val($(this).parent().parent().children().eq(2).html());
  $("#appointment_clinic_id").val(localStorage.getItem('chosen_clinic'));
  $("#appointment_pcp_id").val(localStorage.getItem('userid'));
  $("#appointment_patient_id").val('');
  $("#appointment_emr_id").val('');
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
        $("#appt_pt_telephone").html(result[0]['PHONE'])
        if(result[0]['PHONE']){
          $("#appt_pt_telephone").parent().parent().removeClass("d-none");
        }else{
          $("#appt_pt_telephone").parent().parent().addClass("d-none");
        }
        $("#appt_pt_phone").html(result[0]['MOBILE'])
        if(result[0]['MOBILE']){
          $("#appt_pt_phone").parent().parent().removeClass("d-none");
          $("#appointment_modal_phone").parent().removeClass("d-none");
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
        $("#appointment_modal_language").html($("#appt_pt_language").html());
        $("#appointment_modal_clinic").html($("#hedis_clinic_name").val());
        $("#appointment_modal_gender").html($("#appt_pt_gender").html());
        $("#appointment_modal_dob").html($("#appt_pt_dob").html());
        $("#appointment_modal_telephone").html($("#appt_pt_telephone").html());
        $("#appointment_modal_phone").html($("#appt_pt_phone").html());
        $("#appointment_modal_email").html($("#appt_pt_email").html());
        patient_id = result[0]['id'];
        appointment_table.ajax.reload();
        $("#appointment_modal").modal("show");
      }
    }
  });
  
});

function GetFormattedDate(date) {
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day  = ("0" + (date.getDate())).slice(-2);
  var year = date.getFullYear();
  var hour =  ("0" + (date.getHours())).slice(-2);
  var min =  ("0" + (date.getMinutes())).slice(-2);
  // var seg = ("0" + (date.getSeconds())).slice(-2);
  return year + "-" + month + "-" + day + " " + hour + ":" +  min;
}

$(document).on("click",".appt_edit_btn",function(){
  observation_id = null;
  $("#appointment_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#appointment_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/chosenAppointment", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      
      var options = {
       year: "numeric",
        month: "2-digit",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false
      };
      $("#appointment_participate_status").val(result[0]['pt_participate_status']);
      $("#appointment_approve_date").val(GetFormattedDate(new Date(result[0]['pt_part_approve_date'])));
      $("#appointment_status").val(result[0]['status']);
      $("#appointment_cancel_reason").val(result[0]['cancel_reason']);
      $("#appointment_class").val(result[0]['class']);
      $("#appointment_service_category").val(result[0]['service_category']);
      $("#appointment_appt_type").val(result[0]['appt_type']);
      $("#appointment_reason").val(result[0]['reason']);
      $("#appointment_priority").val(result[0]['priority']);
      $("#appointment_description").val(result[0]['description']);
      $("#appointment_start_date").val(GetFormattedDate(new Date(result[0]['start_date'])));
      $("#appointment_end_date").val(GetFormattedDate(new Date(result[0]['end_date'])));
      $("#appointment_cancel_date").val(GetFormattedDate(new Date(result[0]['cancel_date'])));
      $("#appointment_notes").val(result[0]['notes']);
      $("#appointment_pt_instruction").val(result[0]['pt_instruction']);
      $("#appointment_pt_instruction_date").val(result[0]['pt_instruction_date'].split('T')[0]);

      $("#appointment_edit_modal").modal("show");
    } else {
      return toastr.error("Action Failed");
    }
  });
});

$(document).on("click","#appt_add_btn",function(){
  var t = new Date().toISOString().split('T')[0];
  $("#appointment_id").val('');
  $("#appointment_participate_status").val('needs-action');
  $("#appointment_approve_date").val('');
  $("#appointment_status").val('');
  $("#appointment_cancel_reason").val('');
  $("#appointment_class").val('');
  $("#appointment_service_category").val('');
  $("#appointment_appt_type").val('');
  $("#appointment_reason").val('');
  $("#appointment_priority").val('');
  $("#appointment_description").val('');
  $("#appointment_start_date").val(t+" 09:00");
  $("#appointment_end_date").val('');
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/deleteAppointment", (xhr, err) => {
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


sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterClass", (xhr, err) => {
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


$("#appt_save_btn").click(function (e) {
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
  if($("#appointment_id").val()==""){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/createAppointment", (xhr, err) => {
      if (!err) {
        $("#appointment_edit_modal").modal("hide");
        toastr.success("Appointment is added successfully");
      } else {
        return toastr.error("Action Failed");
      }
    });
  }else{
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/updateAppointment", (xhr, err) => {
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