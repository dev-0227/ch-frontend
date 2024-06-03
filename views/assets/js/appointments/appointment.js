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

$(document).ready(async function () {

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
    

    var app_calendar = new FullCalendar.Calendar(calendarEl, {
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
        events: [
            
        ],
        datesSet: function(){
            selected_date = moment(app_calendar.getDate()).format('YYYY-MM-DD');
            load_data();
        }
    });

    app_calendar.render();

    const handleViewEvent = (data) => {
        // console.log(data.event.id);
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

        $("#appointment_clinic_name").html($("#chosen_clinics option:selected").text());
        $("#appointment_participate_status").val(appointment['pt_participate_status']);
        $("#appointment_approve_date").val(GetFormattedDate(new Date(appointment['approve_date'])));
        $("#appointment_start_date").val(appointment['start_date']);
        $("#appointment_end_date").val(appointment['end_date']);
        $('input[name="appointment_provider"]').filter('[value="0"]').prop("checked", appointment['provider']=="0"?true:false);
        $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", appointment['provider']=="1"?true:false);
        $("#appointment_measure").val(appointment['measure']);
        $("#appointment_assessment").val(appointment['assessment']);
       
        if(appointment['provider']=="0"){
            $("#appointment_specialist_provider").prop("disabled", true);
            $("#appointment_clinic_provider").prop("disabled", false);
            $("#appointment_clinic_provider").val(appointment['provider_id']);
            $("#appointment_specialist_provider").val("");
        }else{
            $("#appointment_specialist_provider").prop("disabled", false);
            $("#appointment_clinic_provider").prop("disabled", true);
            $("#appointment_clinic_provider").val("");
            $("#appointment_specialist_provider").val(appointment['provider_id']);
        }
        $("#appointment_attended").prop('checked', appointment['attended']=="1"?true:false);
        $("#appointment_status").val(appointment['status']);
        $("#appointment_cancel_reason").val(appointment['cancel_reason']);
        $("#appointment_class").val(appointment['class']);
        $("#appointment_service_category").val(appointment['service_category']);
        $("#appointment_appt_type").val(appointment['appt_type']);
        $("#appointment_reason").val(appointment['reason']);
        $("#appointment_priority").val(appointment['priority']);
        $("#appointment_cancel_date").val(GetFormattedDate(new Date(appointment['cancel_date'])));
        $("#appointment_notes").val(appointment['notes']);
        $("#appointment_pt_instruction").val(appointment['pt_instruction']);
        $("#appointment_edit_modal-1").modal("show");
        $("#appointment_modal").modal("hide");


        // startDateMod = moment(data.event.startStr).format('Do MMM, YYYY - h:mm a');
    }

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
        $("#appointment_specialist_provider").val($("#appointment_specialist_provider option:first").val());
        $("#appointment_attended").prop('checked', false);
        $("#appointment_status").val('pending').trigger('change');
        $("#appointment_measure").val($("#appointment_measure option:first").val());
        $("#appointment_reason").val($("#appointment_measure option:selected").text().split(" - ")[1]);
        getSpecialty();
        $("#appointment_cancel_reason").val('');
        $("#appointment_class").val('AMB').trigger('change');
        $("#appointment_service_category").val('7').trigger('change');
        
        $("#appointment_priority").val('R').trigger('change');
        $("#appointment_start_date").val("09:00");
        $("#appointment_end_date").val('09:15');
        $("#appointment_cancel_date").val('');
        $("#appointment_notes").val('');
        $("#appointment_pt_instruction").val('');
        $("#appointment_pt_instruction_date").val('');
        $("#appointment_edit_modal-1").modal("show");
        $("#appointment_modal").modal("hide");
    });

    var patient_search_item = "name";
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
    var patients = []
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
    

    $("#appt_save_btn").click(function (e) {
        setTimeout( function () {
            load_data();
        }, 1000 );
    });

    var entry ={
        clinic_id: localStorage.getItem('chosen_clinic'),
    }
    var doctors = []
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/getAllDoctorsByClinic", (xhr, err) => {
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

    var specialty = []
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentSpecialty", (xhr, err) => {
        if (!err) {
            specialty = JSON.parse(xhr.responseText)['data'];
            for(var i=0;i<specialty.length;i++){
                html = '<label class="form-check form-check-custom form-check-sm form-check-solid mb-3">';
                html += '<input class="form-check-input specialty-check" type="checkbox" checked="checked" data-id="'+specialty[i]['id']+'" >';
                html += '<span class="form-check-label text-gray-600 fw-semibold">';
                html += specialty[i]['name'];
                html += '</span></label>';
                specialty[i]['ch'] = "1";
                $("#specialty_list").append(html);
            }
        }
    });


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

    $(document).on("click",".appt",function(){
        //alert($(this).data("id"));
    });
});

document.write('<script src="/assets/js/appointments/appointmentModal.js" type="text/javascript"></script>');