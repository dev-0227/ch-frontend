
// Parameters begin //
var patient_id = 0;

var selected_doctor= "";
var selected_date= "";
var appointments = [];
var specialties = "0";

var calendarEl = document.getElementById('kt_calendar_app');
var todayDate = moment().startOf('day');
var YM = todayDate.format('YYYY-MM');
var YESTERDAY = todayDate.clone().subtract(1, 'day').format('YYYY-MM-DD');
var TODAY = todayDate.format('YYYY-MM-DD');
var TOMORROW = todayDate.clone().add(1, 'day').format('YYYY-MM-DD');

var measure = []
var observation = []
var _externProvider = []

var _oldStatus = ''

let _specialists = []
let _clinics = []

var duration_mins = 0;

let organizations = []

let appointmentType = []

var patient_search_item = "name"

var patients = []

var doctors = []

var specialty = []
// Parameters end //

// utils begin //
function GetFormattedDate(date) {
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day  = ("0" + (date.getDate())).slice(-2);
    var year = date.getFullYear();
    // var hour =  ("0" + (date.getHours())).slice(-2);
    // var min =  ("0" + (date.getMinutes())).slice(-2);
    // var seg = ("0" + (date.getSeconds())).slice(-2);
    return year + "-" + month + "-" + day;
}

function calculateAge(dateString) {
    if(!dateString)return "-";
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function getGender(gender, short=true) {
    var str="-"
    if(gender){
        str = gender;
    }
    return short?str.charAt(0).toUpperCase():str.charAt(0).toUpperCase() + str.slice(1);
}

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
// utils end //

// Data Load begin //
function loadSpecialistProviderByMeasureId(mid) {
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {measureid: mid}, "specialist/getSpecialistByMeasureId", (xhr, err) => {
        if (!err) {
          _externProvider = []
          let result = JSON.parse(xhr.responseText)['data'];
          var options = '';
          for(var i=0; i<result.length; i++) {
            if (result[i]['clinic'].split(',').indexOf(localStorage.getItem('chosen_clinic')) != -1) {
              _externProvider.push(result[i]['id'].toString())
              options += '<option value="'+result[i]['id']+'" >'+result[i]['fname']+' '+result[i]['lname']+'</option>';
            }
          }
          $("#appointment_specialist_provider").html(options);
        }
    });
}

function getSpecialty() {
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {measure_id: $("#appointment_measure").val()}, "referral/appointmentSpecialty/getSpecialtyByMeasure", (xhr, err) => {
        if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                if(result.length>0){
                $("#appointment_specialty").val(result[0]['id']);
            }
        }
    });
}

// For Appointment Form begin //

// Load Measure Data
sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/getMeasureObservation", (xhr, err) => {
    if (!err) {
        observation = JSON.parse(xhr.responseText)['data'];
    }
});

sendRequestWithToken('POST', localStorage.getItem('authToken'), {isSpecialist: $('input[name="appointment_provider"]:checked').val() == '0'? false : true}, "hedissetting/measuresDataForAppointment", (xhr, err) => {
    if (!err) {
      let measure = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<measure.length; i++){ 
        options += '<option value="'+measure[i]['measureId']+'" >'+measure[i]['measureId']+' - '+measure[i]['title']+'</option>';
      }
      $("#appointment_measure").html(options);
      // $("#appointment_measure").val(measure[0]['measureId']).trigger('change');
      if (measure.length > 0) {
        loadSpecialistProviderByMeasureId(measure[0]['measureId'])
      }
    }
});

// Load Clinic
sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id: localStorage.getItem('chosen_clinic')}, "provider/getProviderByClinic", (xhr, err) => {
    if (!err) {
      let doctors = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<doctors.length; i++){
        options += '<option value="'+doctors[i]['id']+'" >'+doctors[i]['fname']+' '+doctors[i]['lname']+'</option>';
      }
      $("#appointment_clinic_provider").html(options);
    }
});

// Load Appointment Type
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

// Load Patient Participate Status
sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/appointmentStatus", (xhr, err) => {
    if (!err) {
        var result = JSON.parse(xhr.responseText)['data'];
        var options = ''
        result.forEach(item => {
            options += `<option value='${item.id}'>${item.display}</option>`
        });
        $("#appointment_status").html(options)
    }
});

// Load Barrier Reason
sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/appointmentBarrier", (xhr, err) => {
    if (!err) {
        var result = JSON.parse(xhr.responseText)['data'];
        var options = ''
        result.forEach(item => {
            options += `<option value='${item.id}'>${item.reason}</option>`
        });
        $("#appointment_barrier_reason").html(options)
    }
});
// For Appointment Form end //


// Load Class
sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "valueset/encounterClass", (xhr, err) => {
    if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        var options = '';
        for(var i=0; i<result.length; i++){
            options += '<option value="'+result[i]['id']+'" >'+result[i]['display']+'</option>';
        }
        $("#appointment_class").html(options);
    }
});

// Load Priority
sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/encounterPriority", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['id']+'" >'+result[i]['display']+'</option>';
    }
    $("#appointment_priority").html(options);
  }
});

sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id: localStorage.getItem('chosen_clinic')}, "user/getAllDoctorsByClinic", (xhr, err) => {
    if (!err) {
        doctors = JSON.parse(xhr.responseText)['data'];
        $("#pcp_list").html("");
        $("#specialist_list").html("");
        $("#pcp_select_button").removeClass("d-none");
        $("#specialist_select_button").removeClass("d-none");
        for(var i=0;i<doctors.length;i++){
            html = '<label class="form-check form-check-custom form-check-sm form-check-solid mb-3">';
            html += '<input class="form-check-input doctor-check" type="checkbox" checked="checked" data-id="'+doctors[i]['id']+'" >';
            html += '<span class="form-check-label text-gray-600 fw-semibold">';
            html += doctors[i]['fname']+' '+doctors[i]['lname'];
            if(doctors[i]['type']=="3") html += ' ('+doctors[i]['speciality']+") ";
            html += '</span></label>';
            doctors[i]['ch'] = "1";
            if(doctors[i]['type']=="5") $("#pcp_list").append(html);
            if(doctors[i]['type']=="3") $("#specialist_list").append(html);
        }
        if($("#pcp_list").html()=="")$("#pcp_select_button").addClass("d-none");
        if($("#specialist_list").html()=="")$("#specialist_select_button").addClass("d-none");
    }
});

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentSpecialty", (xhr, err) => {
    if (!err) {
        specialty = JSON.parse(xhr.responseText)['data'];
        var options = '';
        for(var i=0;i<specialty.length;i++){
            html = '<label class="form-check form-check-custom form-check-sm form-check-solid mb-3">';
            html += '<input class="form-check-input specialty-check" type="checkbox" checked="checked" data-id="'+specialty[i]['id']+'" >';
            html += '<span class="form-check-label text-gray-600 fw-semibold">';
            html += specialty[i]['name'];
            html += '</span></label>';
            specialty[i]['ch'] = "1";
            $("#specialty_list").append(html);

            options += '<option value="'+specialty[i]['id']+'" >'+specialty[i]['name']+'</option>';
        }
        $("#appointment_search_specialty").html('<option value="0">All Specialties</option>' + options);
    }
});
// Data Load end //

$(document).ready(async function() {
    // Appointment dashboad begin //

    function add_event(){
        app_calendar.removeAllEvents();
        for(var i in appointments){
            var s = new Date(appointments[i]['approve_date'].substr(0, 10)+' '+appointments[i]['start_date']);
            var e = new Date(appointments[i]['approve_date'].substr(0, 10)+' '+appointments[i]['end_date']);
            var bg = 'info'
            if(appointments[i]['attended']=="1")bg = 'success';
            events = {
                id: appointments[i]['id'],
                title: appointments[i]['doctor_fname']+' '+appointments[i]['doctor_lname'],
                start: s,
                end: e,
                className: "border border-danger border-0 bg-"+bg+" text-inverse-primary",
            }
            app_calendar.addEvent(events);
        }
       
    }
    
    function load_data(){
        var entry ={
            date: selected_date,
            clinic_id: localStorage.getItem('chosen_clinic'),
            specialties: specialties
        }
        if(selected_doctor!="")entry['doctors'] = selected_doctor;
        appointments = []
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/get", (xhr, err) => {
            if (!err) {
              var result = JSON.parse(xhr.responseText)['data'];
              for(var i=0; i<result.length; i++){
                appointments[result[i]['id']] = result[i];
              }
              
              add_event();
            }
        });
    }

    // Calendar begin //
    var app_calendar = new FullCalendar.Calendar(calendarEl, {
        // plugins: [ 'interaction', 'dayGrid', 'timeGrid' ],
        initialView: 'timeGridDay',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialDate: TODAY,
        navLinks: true,
        selectable: true,
        selectMirror: true,
        select: function (arg) {
            handleNewEvent(arg);
        },

        eventClick: function (arg) {
            handleViewEvent(arg);
        },

        editable: false,
        dayMaxEvents: true,
        datesSet: function(){
            selected_date = moment(app_calendar.getDate()).format('YYYY-MM-DD');
            load_data();
        }
    });
    app_calendar.render();

    const handleNewEvent = (data) => {
        $(".appt-list").addClass('d-none');
        $("#appointment_patient_info").addClass('d-none');
        $("#appointment_patient_find").removeClass('d-none');
        $("#appointment_patient_id").val("");
        $("#appointment_emr_id").val("");
        $("#appointment_modal_fullname").html("");
        $("#appointment_modal_language").html("");
        $("#appointment_modal_language").parent().removeClass("d-none");
        $("#appointment_modal_clinic").html("");
        $("#appointment_modal_gender").html("");
        $("#appointment_modal_dob").html("");
        $("#appointment_modal_dob").parent().removeClass("d-none");
        $("#appointment_modal_age").html("");
        $("#appointment_modal_age").parent().removeClass("d-none");
        $("#appointment_modal_telephone").html("");
        $("#appointment_modal_telephone").parent().removeClass("d-none");
        $("#appointment_modal_phone").html("");
        $("#appointment_modal_phone").parent().removeClass("d-none");
        $("#appointment_modal_email").html("");
        $("#appointment_modal_email").parent().removeClass("d-none");
        $("#appointment_clinic_name").html($("#chosen_clinics option:selected").text());
        $("#appointment_clinic").html(' | ' + $("#chosen_clinics option:selected").text());

        // var t = new Date().toISOString().split('T')[0];
        $("#appointment_id").val('');
        $("#appointment_participate_status").val('needs-action');
        $("#appointment_approve_date").val(data.startStr);
        $('input[name="appointment_provider"]').filter('[value="0"]').prop("checked", false);
        $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", true);
        $("#appointment_specialist_provider").prop("disabled", false);
        $("#appointment_clinic_provider").prop("disabled", true);
        $("#appointment_clinic_provider").val("");
        // $("#appointment_specialist_provider").val($("#appointment_specialist_provider option:first").val());
        $("#appointment_attended").prop('checked', false);
        $("#appointment_status").val('2').trigger('change');
        // $("#appointment_measure").val($("#appointment_measure option:first").val());
        // $("#appointment_reason").val($("#appointment_measure option:selected").text().split(" - ")[1]);
        getSpecialty();
        // $("#appointment_cancel_reason").val('');
        $("#appointment_barrier_reason").val('');
        $("#appointment_class").val('2').trigger('change');
        $("#appointment_service_category").val('7').trigger('change');
        
        $("#appointment_priority").val('7').trigger('change');
        $("#appointment_start_date").val("10:00");
        $("#appointment_end_date").val('10:30');
        // $("#appointment_barrier_date").val('');
        $("#appointment_notes").val('');
        $("#appointment_pt_instruction").val('');
        $("#appointment_pt_instruction_date").val('');
        $("#appointment_edit_modal-1").modal("show");
        // $("#appointment_modal").modal("show");
    }

    const handleViewEvent = (data) => {
        observation_id = null;
        var appointment = appointments[data.event.id];
        $("#appointment_id").val(data.event.id);
        $("#appointment_clinic_id").val(appointment['clinic_id']);
        $("#appointment_patient_id").val(appointment['patient_id']);
        $("#appointment_emr_id").val(appointment['emr_id']);
        $("#appointment_pcp_id").val(appointment['pcp_id']);

        $("#appointment_modal_fullname").html(appointment['FNAME']+" "+appointment['LNAME']);
        $("#appointment_modal_age").html(calculateAge(appointment['DOB']));
        $("#appointment_modal_language").html(appointment['Language']);
        $("#appointment_modal_clinic").html($("#chosen_clinics option:selected").text());
        $("#appointment_modal_gender").html(appointment['GENDER'].charAt(0).toUpperCase() + appointment['GENDER'].slice(1));
        $("#appointment_modal_dob").html(moment(appointment['DOB']).format('Do MMM, YYYY'));
        if(appointment['PHONE']){
            $("#appointment_modal_telephone").html(appointment['PHONE']);
            $("#appointment_modal_telephone").parent().removeClass("d-none");
        }else{
            $("#appointment_modal_telephone").parent().addClass("d-none");
        }

        if(appointment['MOBILE']){
            $("#appointment_modal_phone").html(appointment['MOBILE']);
            $("#appointment_modal_phone").parent().removeClass("d-none");
        }else{
            $("#appointment_modal_phone").parent().addClass("d-none");
        }

        if(appointment['EMAIL']){
            $("#appointment_modal_email").html(appointment['EMAIL']);
            $("#appointment_modal_email").parent().removeClass("d-none");
        }else{
            $("#appointment_modal_email").parent().addClass("d-none");
        }
       
        
        $(".appt-list").addClass('d-none');
        $("#appointment_patient_info").removeClass('d-none');
        $("#appointment_patient_find").addClass('d-none');
        $("#appointment_measure").val(appointment['measure']).trigger('change');
        $("#appointment_clinic_name").html($("#chosen_clinics option:selected").text());
        $("#appointment_participate_status").val(appointment['pt_participate_status']);
        $("#appointment_approve_date").val(GetFormattedDate(new Date(appointment['approve_date'])));
        $("#appointment_start_date").val(appointment['start_date']);
        $("#appointment_end_date").val(appointment['end_date']);
        $('input[name="appointment_provider"]').filter('[value="0"]').prop("checked", appointment['provider']=="0"?true:false);
        $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", appointment['provider']=="1"?true:false);
        $("#appointment_assessment").val(appointment['assessment']).trigger('change');
       
        if(appointment['provider']=="0"){
            $("#appointment_specialist_provider").prop("disabled", true);
            $("#appointment_clinic_provider").prop("disabled", false);
            $("#appointment_clinic_provider").val(appointment['provider_id']).trigger('change');
            $("#appointment_specialist_provider").val("").trigger('change');
        }else{
            $("#appointment_specialist_provider").prop("disabled", false);
            $("#appointment_clinic_provider").prop("disabled", true);
            $("#appointment_clinic_provider").val("").trigger('change');
            $("#appointment_specialist_provider").val(appointment['provider_id']).trigger('change');
        }
        $("#appointment_attended").prop('checked', appointment['attended']=="1"?true:false);
        $("#appointment_status").val(appointment['status']).trigger('change');
        // $("#appointment_cancel_reason").val(appointment['cancel_reason']);
        if (appointment['cancel_reason'] != null) $("#appointment_barrier_reason").val(appointment['cancel_reason'].split(',')).trigger('change');
        $("#appointment_class").val(appointment['class']).trigger('change').trigger('change');
        $("#appointment_service_category").val(appointment['service_category']).trigger('change');
        $("#appointment_appt_type").val(appointment['appt_type']).trigger('change');
        $("#appointment_reason").val(appointment['reason']);
        $("#appointment_priority").val(appointment['priority']).trigger('change');
        // $("#appointment_cancel_date").val(GetFormattedDate(new Date(appointment['cancel_date'])));
        // $("#appointment_barrier_date").val(GetFormattedDate(new Date(appointment['cancel_date'])));
        $("#appointment_notes").val(appointment['notes']);
        $("#appointment_pt_instruction").val(appointment['pt_instruction']);
        $("#appointment_edit_modal-1").modal("show");
        $("#appointment_modal").modal("hide");


        // startDateMod = moment(data.event.startStr).format('Do MMM, YYYY - h:mm a');
    }
    // Calendar end //

    // Appointment dashboad end //

    // Appointment Form begin //

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
          // add new
          entry['pt_participate_status'] = $("#appointment_participate_status").val()
          entry['status'] = $("#appointment_status").val()
          entry['class'] = $("#appointment_class").val()
          entry['service_category'] = $("#appointment_service_category").val()
          entry['priority'] = $("#appointment_priority").val()
          entry['appt_type'] = $("#appointment_appt_type").val()
          entry['measure'] = $("#appointment_measure").val()
          entry['specialist_provider'] = $("#appointment_specialist_provider").val()
          entry['clinic_provider'] = $("#appointment_clinic_provider").val()
          entry['cancel_reason'] = $("#appointment_barrier_reason").val().join(',')
        
          if($("#appointment_id").val()==""){
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/create", (xhr, err) => {
              if (!err) {
                if(JSON.parse(xhr.responseText)['message']=="exist"){
                  toastr.info("Appointment is exist");
                }else{
                  $("#appointment_edit_modal-1").modal("hide");
                  toastr.success("Appointment is added successfully");
                }
                
              } else {
                return toastr.error("Action Failed");
              }
            });
          }else{
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/update", (xhr, err) => {
              if (!err) {
                $("#appointment_edit_modal-1").modal("hide");
                toastr.success("Appointment is updated successfully");
              } else {
                return toastr.error("Action Failed");
              }
            });
          }

        setTimeout( function () {
            load_data();
        }, 1000 );
    });

    // Patient Search begin //
    $(".menu-item").click(function (e) {
        patient_search_item = $(this).children().data("item");
        $("#pt_search_item").html($(this).children().html());
        $("#search_patient").val("");
        $(".menu-sub-dropdown").removeClass("show");
    });

    $(document).on("click","#search_patient",function(){
        $("#searched_patient_list").removeClass("show");
    }) 

    $(document).on("click",".search-reset",function(){
        $("#searched_patient_list").removeClass("show");
        $("#appointment_patient_info").addClass('d-none');
        $("#searched_patient_list").html("");
        $("#search_patient").val("");
    }) 
  
    $(document).on("keyup","#search_patient",function(){
        $("#searched_patient_list").removeClass("show");
        $("#appointment_patient_info").addClass('d-none');
        if($(this).val().length > 2){
            $("#searched_patient_list").addClass("show");
            var entry = {
                text: $(this).val(),
                item: patient_search_item,
                clinic_id: localStorage.getItem('chosen_clinic')
            }
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/search", (xhr, err) => {
                if (!err) {
                    patients = JSON.parse(xhr.responseText)['data'];
                    $("#searched_patient_list").empty();
                    for(var i = 0; i < patients.length; i++){
                    var html = '<div class="menu-item px-3 pt-info " data-id="'+patients[i]['id']+'">';
                    html += '<div class="menu-link px-3 py-1 d-block">';
                    html += '<div class="text-primary">'
                    html += patients[i]['FNAME']+" "+patients[i]['LNAME']+" (";
                    html += patients[i]['DOB']?calculateAge(patients[i]['DOB'])+"Y":" - ";
                    html += getGender(patients[i]['GENDER'])==""?"":", "+getGender(patients[i]['GENDER']);
                    html += ')</div>';
                    html += '<div class="p-1 fs-7">A/C No: '
                    html += patients[i]['patientid'];
                    if(patients[i]['PHONE']){
                        html += ' | <i class="fa fa-phone"></i> '
                        html += patients[i]['PHONE'];
                    }
                    if(patients[i]['DOB']){
                        html += ' | DOB: '
                        html += moment(patients[i]['DOB']).format("MM/DD/YYYY");
                    }
                    html += '</div>';
                    html += '</div></div>';
                    $("#searched_patient_list").append(html);
                    }
                }
            });
        }
    });

    $(document).on("click",".pt-info",function(){
        for(var i = 0; i<patients.length; i++){
            if(patients[i]['id']==$(this).data("id")){
                $("#appointment_patient_id").val(patients[i]['id']);
                $("#appointment_emr_id").val(patients[i]['patientid']);
                $("#appt_pt_emrid").val(patients[i]['patientid']);
                $("#appointment_clinic_id").val(localStorage.getItem('chosen_clinic'));
                $("#appointment_pcp_id").val(localStorage.getItem('userid'));
                $("#appointment_modal_fullname").html(patients[i]['FNAME']+" "+patients[i]['LNAME']);
                $("#appointment_modal_age").html(calculateAge(patients[i]['DOB']));
                $("#appt_pt_insurance").val();
                if(patients[i]['Language']){
                    $("#appointment_modal_language").html(patients[i]['Language']);
                    $("#appointment_modal_language").parent().removeClass("d-none");
                }else{
                    $("#appointment_modal_language").parent().addClass("d-none");
                }
                $("#appointment_modal_clinic").html($("#chosen_clinics option:selected").text());
                $("#appointment_modal_gender").html(patients[i]['GENDER'].charAt(0).toUpperCase() + patients[i]['GENDER'].slice(1));
                if(patients[i]['DOB']){
                    $("#appointment_modal_dob").html(moment(patients[i]['DOB']).format('Do MMM, YYYY'));
                    $("#appointment_modal_dob").parent().removeClass("d-none");
                    $("#appointment_modal_age").html(calculateAge(patients[i]['DOB']));
                    $("#appointment_modal_age").parent().removeClass("d-none");
                }else{
                    $("#appointment_modal_dob").parent().addClass("d-none");
                    $("#appointment_modal_age").parent().addClass("d-none");
                }
                if(patients[i]['PHONE']){
                    $("#appointment_modal_telephone").html(patients[i]['PHONE']);
                    $("#appointment_modal_telephone").parent().removeClass("d-none");
                }else{
                    $("#appointment_modal_telephone").parent().addClass("d-none");
                }

                if(patients[i]['MOBILE']){
                    $("#appointment_modal_phone").html(patients[i]['MOBILE']);
                    $("#appointment_modal_phone").parent().removeClass("d-none");
                }else{
                    $("#appointment_modal_phone").parent().addClass("d-none");
                }

                if(patients[i]['EMAIL']){
                    $("#appointment_modal_email").html(patients[i]['EMAIL']);
                    $("#appointment_modal_email").parent().removeClass("d-none");
                }else{
                    $("#appointment_modal_email").parent().addClass("d-none");
                }
                $("#search_patient").val("");
            }
        }
        $("#appointment_patient_info").removeClass('d-none');
    });
    // Patient Search end //

    // event begin //
    $("#appointment_attended").on('change', (e) => {
        if (e.target.checked === true) {
            _oldStatus = $("#appointment_status").val()
            $("#appointment_status").val('11').trigger('change');
        } else if (e.target.checked === false) {
            if (_oldStatus !== '') {
                $("#appointment_status").val(_oldStatus).trigger('change');
            }
        }
    })
    
    $("#appointment_status").on('change', (e) => {
        if (e.target.value === '7' || e.target.value === '11' || e.target.value === '12') {
            $("#appointment_barrier_reason").prop('disabled', false)
            // $("#appointment_barrier_date").prop('disabled', false)
        } else {
            $("#appointment_barrier_reason").prop('disabled', true)
            // $("#appointment_barrier_date").prop('disabled', true)
        }
    })

    $("#appointment_measure").on('change', (e) => {
        $("#appointment_reason").val($("#appointment_measure option:selected").text().split(" - ")[1]);
        $("#appointment_assessment").html("");
        for(var i=0; i<observation.length; i++){
            if(observation[i]['m_id'] == e.target.val){
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
        let entry = {
            measureid: parseInt(e.target.value)
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'specialist/getSpecialistByMeasureId', (xhr, err) => {
            if (!err) {
                _externProvider = []
                var result = JSON.parse(xhr.responseText)['data'];
                var options = '';
                result.forEach(item => {
                    if (item['clinic'] !== null) {
                        item['clinic'].split(',').forEach(value => {
                            if (value == localStorage.getItem('chosen_clinic')) {
                                _externProvider.push(item['id'].toString())
                                options += '<option value="' + item['id'] + '" >' + item['fname'] + ' ' + item['lname'] + '</option>';
                            }
                        })
                    }
                });
                $("#appointment_specialist_provider").html(options);
                $("#appointment_specialist_provider").val(result[0]['id']).trigger('change')
            }
        });
    });

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

    $('.toggle-measure').on('change', () => {
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {isSpecialist: $('input[name="appointment_provider"]:checked').val() == '0'? false : true}, "hedissetting/measuresDataForAppointment", (xhr, err) => {
            if (!err) {
                    let measure = JSON.parse(xhr.responseText)['data'];
                    var options = '';
                    for(var i=0; i<measure.length; i++){ 
                    options += '<option value="'+measure[i]['measureId']+'" >'+measure[i]['measureId']+' - '+measure[i]['title']+'</option>';
                }
                $("#appointment_measure").html(options);
                if (measure.length > 0) {
                    loadSpecialistProviderByMeasureId(measure[0]['measureId'])
                }
            }
        });
    })
    
    $(document).on('change', '#appointment_specialist_provider', (e) => {
        var entry = {
            specialistid: e.target.value,
            clinicid: localStorage.getItem('chosen_clinic')
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/relationship/getOrganizationNames', (xhr, err) => {
            if (!err) {
                var result = organizations = JSON.parse(xhr.responseText)['data'];
                var options = '';
                if (result.length) {
                options = `<div value='${result[0].id}'>
                    <div class="form-check-label px-3 d-block">
                    <div class="text-primary fs-4">${result[0].name}</div>
                    <div class="fs-7 py-2"><i class="fa fa-location-dot"></i> ${result[0].address1} ${result[0].city} ${result[0].state} ${result[0].zip}</div>
                    <div class="fs-7 py-1"><i class="fa fa-phone"></i> ${result[0].phone1}</div>
                    <div class="fs-7 py-1"><i class="fa fa-phone"></i> ${result[0].phone2}</div>
                    </div>
                </div>`;
                $("#appointment-org-val").val(0);
                }
                if (result.length > 1) $("#appointment_org_buttons").html(`
                <div class="d-flex flex-end">
                    <a href="#" class="btn btn-link btn-color-muted btn-active-color-primary" id="appointment-org-prev-click">&lt;&lt;&nbsp;&nbsp;</a>
                    <a href="#" class="btn btn-link btn-color-muted btn-active-color-primary" id="appointment-org-next-click">&nbsp;&nbsp;&gt;&gt;</a>
                </div>`);
                else $("#appointment_org_buttons").html(``);
                $("#appointment_organization").html(options);
            }
        });
    });

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

    $(document).on('click', '#appointment-org-next-click', () => {
        var i = $("#appointment-org-val").val();
        if (i == organizations.length -1) return;
        else {
            i ++;
            var options = `<div value='${organizations[i].id}'>
            <div class="form-check-label px-3 d-block">
                <div class="text-primary fs-4">${organizations[i].name}</div>
                <div class="fs-7 py-2"><i class="fa fa-location-dot"></i> ${organizations[i].address1} ${organizations[0].city} ${organizations[0].state} ${organizations[0].zip}</div>
                <div class="fs-7 py-1"><i class="fa fa-phone"></i> ${organizations[i].phone1}</div>
            </div>
            </div>`;
            $("#appointment-org-val").val(i);
            $("#appointment_organization").html(options);
        }
    });
        
    $(document).on('click', '#appointment-org-prev-click', () => {
        var i = $("#appointment-org-val").val();
        if (i == 0) return;
        else {
            i --;
            var options = `<div value='${organizations[i].id}'>
            <div class="form-check-label px-3 d-block">
                <div class="text-primary fs-4">${organizations[i].name}</div>
                <div class="fs-7 py-2"><i class="fa fa-location-dot"></i> ${organizations[i].address1} ${organizations[0].city} ${organizations[0].state} ${organizations[0].zip}</div>
                <div class="fs-7 py-1"><i class="fa fa-phone"></i> ${organizations[i].phone1}</div>
            </div>
            </div>`;
            $("#appointment-org-val").val(i);
            $("#appointment_organization").html(options);
        }
    });
    // event end //

    $("#appt_new_button").click(function (e) {

        $(".appt-list").addClass('d-none');
        $("#appointment_patient_info").addClass('d-none');
        $("#appointment_patient_find").removeClass('d-none');
        $("#appointment_patient_id").val("");
        $("#appointment_emr_id").val("");
        $("#appointment_modal_fullname").html("");
        $("#appointment_modal_language").html("");
        $("#appointment_modal_language").parent().removeClass("d-none");
        $("#appointment_modal_clinic").html("");
        $("#appointment_modal_gender").html("");
        $("#appointment_modal_dob").html("");
        $("#appointment_modal_dob").parent().removeClass("d-none");
        $("#appointment_modal_age").html("");
        $("#appointment_modal_age").parent().removeClass("d-none");
        $("#appointment_modal_telephone").html("");
        $("#appointment_modal_telephone").parent().removeClass("d-none");
        $("#appointment_modal_phone").html("");
        $("#appointment_modal_phone").parent().removeClass("d-none");
        $("#appointment_modal_email").html("");
        $("#appointment_modal_email").parent().removeClass("d-none");
        $("#appointment_clinic_name").html($("#chosen_clinics option:selected").text());
        $("#appointment_clinic").html(' | ' + $("#chosen_clinics option:selected").text());

        var t = new Date().toISOString().split('T')[0];
        $("#appointment_id").val('');
        $("#appointment_participate_status").val('needs-action');
        $("#appointment_approve_date").val(t);
        $('input[name="appointment_provider"]').filter('[value="0"]').prop("checked", false);
        $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", true);
        $("#appointment_specialist_provider").prop("disabled", false);
        $("#appointment_clinic_provider").prop("disabled", true);
        $("#appointment_clinic_provider").val("");
        $("#appointment_attended").prop('checked', false);
        $("#appointment_status").val('2').trigger('change');
        getSpecialty();
        $("#appointment_barrier_reason").val('');
        $("#appointment_class").val('2').trigger('change');
        $("#appointment_service_category").val('7').trigger('change');
        
        $("#appointment_priority").val('7').trigger('change');
        $("#appointment_start_date").val("10:00");
        $("#appointment_end_date").val('10:30');
        $("#appointment_notes").val('');
        $("#appointment_pt_instruction").val('');
        $("#appointment_pt_instruction_date").val('');
        $("#appointment_edit_modal-1").modal("show");
    });

    // Appointment Search Form begin //
    var appt_search_table = $("#appointment_specialist_table").DataTable({
    "ajax": {
        "url": serviceUrl + "specialist/listBymeasureID",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') },
        "data":function (d) {
        d.measureid = $("#appointment_measure").val(),
        d.specialty = $("#appointment_search_specialty").val(),
        d.zip = $("#appointment_search_zip").val(),
        d.all = $("#appointment_search_all").prop('checked')
        },
    },
    serverSide: true,
    "pageLength": 10,
    "columns": [
        {
        data: 'fname',
        render: function(data, type, row) {
            _specialists[row.id] = row;
            return `
            <div class="form-check-label px-3 d-block">
                <a id="appointment_search_ext_select" data="${row.id}" href="#" class="text-primary fs-4">${row.fname} ${row.lname}</a>
                <div class="fs-8"><i class="fa fa-location-dot"></i> ${row.address} ${row.city} | <i class="fa fa-phone"></i> ${row.phone}</div>
            </div>
            `
        }
        },
        {
        data: 'specialty_id',
        render: function(data, type, row) {
            return `
            <div class="text-primary fs-5">${row.sname}</div>
            `
        }
        },
        {
        data: 'city',
        render: function(data, type, row) {
            return `
            <div>${row.city}</div>
            `
        }
        },
        {
        data: 'zip',
        render: function(data, type, row) {
            return `
            <div>${row.zip}</div>
            `
        }
        }
    ]
    });

    $(document).on('click', '#appointment-specialist-search', () => {
        // clear
        _specialists = []
        //load specialist realted to clinic selected and measure selected.
        appt_search_table.ajax.reload(null, false);
        _clinics = []
        $("#appointment-edit-modal-2").modal('show');
    });

    $("#appointment_specialist_search_input").on('keyup', function() {
        // clear
        _specialists = []
        appt_search_table.search(this.value).draw();
    });
    
    $("#appointment_search_zip").on('keyup', function() {
        // clear
        _specialists = []
        
        appt_search_table.search($("#appointment_specialist_search_input").val()).draw();
    });

    $(document).on('change', '#appointment_search_specialty', (e) => {
        // clear
        _specialists = []
      
        appt_search_table.search($("#appointment_specialist_search_input").val()).draw();
    })
    
    $(document).on('change', '#appointment_search_all', (e) => {
        // clear
        _specialists = []
    
        appt_search_table.search($("#appointment_specialist_search_input").val()).draw();
    })
    
    $(document).on('click', '#appointment_search_ext_select', (e) => {
        if (_externProvider.indexOf(e.target.attributes['data'].value) > -1) {
            toastr.warning("Specialist is already added in the External Provider List!");
            return;
        }
        var option = '<option value="'+e.target.attributes['data'].value+'" >'+_specialists[e.target.attributes['data'].value].fname + ' ' + _specialists[e.target.attributes['data'].value].lname + '</option>';
        $("#appointment_specialist_provider").append(option);
        $("#appointment_specialist_provider").val(e.target.attributes['data'].value).trigger('change');
        
        _externProvider.push(e.target.attributes['data'].value)
        
        toastr.success("Specialist is added in the External Provider List successfully!");
    })
    // Appointment Search Form end //
    $(document).on("change",".specialty-check",function(){
        if($(this).data("id")=="0"){
            $(".specialty-check").prop("checked", $(this).prop("checked"));
        }
        if(!$(this).prop("checked"))$("#specialty_check_all").prop("checked", false);
        var specialty = $(".specialty-check").map(function() {
            if($(this).prop("checked")){
                return $(this).data("id")
            }
        }).get();
        specialties = specialty.join();
        specialties = specialties.split(",")[0]=="0"?"0":specialties;
        load_data()
        
    });

    $(document).on("change",".doctor-check",function(){
        selected_doctor= "";
        for(var i=0;i<doctors.length;i++){
            if(doctors[i]['id']==$(this).data("id")){
                doctors[i]['ch']=$(this).prop("checked")?"1":"0";
            }
            if(doctors[i]['ch']=="1"){
                if(selected_doctor!="")selected_doctor += ","
                selected_doctor += doctors[i]['id'];
            }
        }
        if(selected_doctor=="")selected_doctor="0";
        
        load_data()
        // load_html(appointments);
    });
    // Appointment Form end //
})
