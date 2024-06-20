
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

var duration_mins = 0;

let organizations = []

let appointmentType = []

var patient_search_item = "name"

var patients = []

var doctors = []

var specialty = []

var __spec = 0

var _cal_view_setting = 1

var app_calendar = null
var app_timeline = null

var _inactive_items = {
    status: [],
    doctor: [],
    specialist: [],
    specialty: []
}
var _spec_item = []
var _doct_item = []
var _items = new vis.DataSet()
var _groups = new vis.DataSet()
var _options = {
    stack: true,
    editable: false,
    margin: {
        item: 20,
        axis: 20
    },
    horizontalScroll: false,
    verticalScroll: true,
    type: 'box',
    orientation: {
        axis: 'both',
        item: 'top'
    },
    zoomKey: "ctrlKey",
    zoomMax: 1000 * 60 * 60 * 24,
    zoomMin: 1000 * 60 * 15
}
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

function setEndData() {
    let startTime = new Date();
    let start_date = $("#appointment_start_date").val();
    startTime.setHours(start_date.split(":")[0], start_date.split(":")[1], 0, 0);
    let end_date = new Date(startTime);
    end_date.setMinutes(end_date.getMinutes() + duration_mins);
    $("#appointment_end_date").val(checkTime(end_date.getHours())+":"+checkTime(end_date.getMinutes()));
}

const getItemContent = (item) => {
    var el = document.createElement('div')
    var c = ''
    if (item.provider == '1') c = 'text-info'
    else if (item.provider == '0') c = 'text-primary'
    el.innerHTML = `
        <div style="overflow: hidden;">
            <div class="${c} fs-8"><i class="fa fa-duotone fa-stopwatch ${c}"></i> ${item.start_date.substr(0, 5)} ~ ${item.end_date.substr(0, 5)}</div>
            <div class="text-danger fs-6"><i class="fa fa-light fa-thin fa-hospital-user text-danger"></i> ${item.FNAME} ${item.LNAME}</div>
            <div class="fs-8"><i class="fa fa-location-dot"></i> ${item.ADDRESS} ${item.CITY ? item.CITY : ''}</div>
            <div class="fs-8"><i class="fa fa-phone"></i> ${item.PHONE ? item.PHONE : 'no phone'}</div>
        </div>
    `
    return el
}

const getGroupContent = (item) => {
    let el = document.createElement('div')
    el.setAttribute('class', 'row my-2')
    el.setAttribute('style', 'width: 100%; align-items: center;')
    if (item.photo.length == 1) {
        el.innerHTML = `
        <div class="col-md-3">
            <div class="symbol symbol-circle" style="width: 100%;">
                <div class="symbol-label fs-2qx fw-semibold bg-opacity-75 ${item.prov == 0 ? 'bg-primary' : 'bg-info'} text-inverse-primary">${item.photo}</div>
            </div>
        </div>
        <div class="col-md-9">
            <div class="fs-6 ${item.prov == 0 ? 'text-primary' : 'text-info'}"> ${item.name}</div>
            <div class="fs-8"> ${item.prov == 0 ? item.qualification : item.specialty}</div>
        </div>
    `
    } else {
        el.innerHTML = `
        <div class="col-md-3">
            <div class="symbol symbol-circle" style="width: 100%;">
                <div class="symbol-label" style="background-image: url(data:image/png;base64,${item.photo});"></div>
            </div>
        </div>
        <div class="col-md-9">
            <div class="fs-6 ${item.prov == 0 ? 'text-primary' : 'text-info'}"> ${item.name}</div>
            <div class="fs-8"> ${item.prov == 0 ? item.qualification : item.specialty}</div>
        </div>
    `
    }
    return el
}

const getResourceContent = (item) => {
    let el = document.createElement('div')
    el.setAttribute('class', 'row')
    el.setAttribute('style', 'width: 100%; align-items: center;')
    if (item.photo.length == 1) {
        el.innerHTML = `
        <div class="col-md-3">
            <div class="symbol symbol-circle" style="width: 100%;">
                <div class="symbol-label fs-2qx fw-semibold bg-opacity-75 ${item.prov == 0 ? 'bg-primary' : 'bg-info'} text-inverse-primary">${item.photo}</div>
            </div>
        </div>
        <div class="col-md-9">
            <div class="fs- ${item.prov == 0 ? 'text-primary' : 'text-info'}"> ${item.name}</div>
            <div class="fs-8"> ${item.prov == 0 ? item.qualification : item.specialty}</div>
        </div>
    `
    } else {
        el.innerHTML = `
        <div class="col-md-3">
            <div class="symbol symbol-circle" style="width: 100%;">
                <div class="symbol-label" style="background-image: url(data:image/png;base64,${item.photo});"></div>
            </div>
        </div>
        <div class="col-md-9">
            <div class="fs-6 ${item.prov == 0 ? 'text-primary' : 'text-info'}"> ${item.name}</div>
            <div class="fs-8"> ${item.prov == 0 ? item.qualification : item.specialty}</div>
        </div>
    `
    }
    $(".fc-col-header-cell-cushion").addClass('fc-scrollgrid-sync-inner')

    $(".fc-col-header-cell-cushion").removeClass('fc-col-header-cell-cushion')
    return el
}

function viewAppointment(id) {
    observation_id = null;
    var appointment = appointments[id];
    $("#appointment_id").val(id);
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

    if(appointment['provider']=="0"){
        $("#appointment_specialist_external_provider").prop("disabled", true);
        $("#appointment_clinic_provider").prop("disabled", false);
        $("#appointment_clinic_provider").val(appointment['provider_id']).trigger('change');
        $("#appointment_specialist_external_provider").val("").trigger('change');
    }else{
        $("#appointment_specialist_external_provider").prop("disabled", false);
        $("#appointment_clinic_provider").prop("disabled", true);
        $("#appointment_clinic_provider").val("").trigger('change');
        __spec = appointment['provider_id']
    }

    $("#appointment_measure").val(appointment['measure']).trigger('change');
    $("#appointment_clinic_name").html($("#chosen_clinics option:selected").text());
    $("#appointment_participate_status").val(appointment['pt_participate_status']);
    $("#appointment_approve_date").val(GetFormattedDate(new Date(appointment['approve_date'])));
    $("#appointment_start_date").val(appointment['start_date']);
    $("#appointment_end_date").val(appointment['end_date']);
    $('input[name="appointment_provider"]').filter('[value="0"]').prop("checked", appointment['provider']=="0"?true:false);
    $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", appointment['provider']=="1"?true:false);
    $("#appointment_assessment").val(appointment['assessment']).trigger('change');

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

    $("#appt_spec_organ").val(appointment['sorgans'])
    $("#appt_spec_specialty").val(appointment['sspecialty'])
    $("#appt_spec_npi").val(appointment['npi'])

    $("#appointment_edit_modal-1").modal("show");
    $("#appointment_modal").modal("hide");
}

function debounce(func, wait = 100) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

let groupFocus = (e) => {
    let vGroups = app_timeline.getVisibleGroups();
    let vItems = vGroups.reduce((res, groupId) => {
        let group = app_timeline.itemSet.groups[groupId];
        if (group.items) {
            res = res.concat(Object.keys(group.items));
        }
        return res;
    }, []);
    app_timeline.focus(vItems);
};

function setGroupResource() {
    app_calendar.removeAllEvents();
    //remove all resource
    _doct_item.forEach(item => {
        var r = app_calendar.getResourceById('D_' + item.name)
        if (r !== null && r !== undefined) r.remove()
    })
    _spec_item.forEach(item => {
        var r = app_calendar.getResourceById('S_' + item.name)
        if (r !== null && r !== undefined) r.remove()
    })

    //vis-timeline
    _items = new vis.DataSet()
    _groups = new vis.DataSet()

    _doct_item.forEach(item => {
        if (_inactive_items.doctor.indexOf(item.id.toString()) == -1) {
            _groups.add({
                id: item.name,
                content: getGroupContent(item)
            })
        }
    })
    _spec_item.forEach(item => {
        if (_inactive_items.specialist.indexOf(item.id.toString()) == -1 && _inactive_items.specialty.indexOf(item['specialty']) == -1) {
            _groups.add({
                id: item.name,
                content: getGroupContent(item)
            })
        }
    })

    //resource
    _doct_item.forEach(item => {
        if (_inactive_items.doctor.indexOf(item.id.toString()) == -1) {
            app_calendar.addResource({
                id: 'D_' + item.name,
                title: item.name,
                // Extended Props
                photo: item.photo,
                prov: 0,
                data_id: item.id,
                qualification: item.qualification
            })
        }
    })
    _spec_item.forEach(item => {
        if (_inactive_items.specialist.indexOf(item.id.toString()) == -1 && _inactive_items.specialty.indexOf(item['specialty']) == -1) {
            app_calendar.addResource({
                id: 'S_' + item.name,
                title: item.name,
                // Extended Props
                photo: item.photo,
                prov: 1,
                data_id: item.id,
                specialty: item.specialty
            })
        }
    })
}

const handleNewEvent = (data) => {
    __spec = 0
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

    $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", true);
    $("#appointment_clinic_provider").prop('disabled', true)
    $("#appointment_specialist_external_provider").prop('disabled', false)

    $("#appointment_id").val('');
    $("#appointment_participate_status").val('needs-action');
    //check clinic provider or specialist
    if (data.resource != null && data.resource._resource.id.substr(0, 2) == 'D_') {
        $('input[name="appointment_provider"]').filter('[value="0"]').prop("checked", true);
        $("#appointment_clinic_provider").prop('disabled', false)
        $("#appointment_specialist_external_provider").prop('disabled', true)
        $("#appointment_clinic_provider").val(data.resource._resource.extendedProps.data_id).trigger('change')
    } else if (data.resource != null && data.resource._resource.id.substr(0, 2) == 'S_') {
        $('input[name="appointment_provider"]').filter('[value="1"]').prop("checked", true);
        $("#appointment_clinic_provider").prop('disabled', true)
        $("#appointment_specialist_external_provider").prop('disabled', false)
        $("#appointment_specialist_external_provider").val(data.resource._resource.extendedProps.data_id).trigger('change')
    }
    $("#appointment_attended").prop('checked', false);
    $("#appointment_status").val('2').trigger('change');
    $("#appointment_reason").val('')
    $("#appointment_barrier_reason").val('');
    $("#appointment_class").val('2').trigger('change');
    $("#appointment_service_category").val('7').trigger('change');
    
    $("#appointment_priority").val('7').trigger('change');

    var startTime = data.startStr.split("T")[1]
    var endTime = data.endStr.split("T")[1]
    if (startTime === null || startTime === undefined || startTime === '') $("#appointment_start_date").val('09:00');
    else $("#appointment_start_date").val(startTime.substr(0, 5));
    if (endTime === undefined || endTime === null || endTime === '') endTime = $("#appointment_end_date").val('09:30');
    else $("#appointment_end_date").val(endTime.substr(0, 5));
    $("#appointment_approve_date").val(data.startStr.substr(0, 10));

    $("#appointment_notes").val('');
    $("#appointment_pt_instruction").val('');
    $("#appointment_pt_instruction_date").val('');
    $("#appointment_edit_modal-1").modal("show");
}

const handleViewEvent = (data) => {
    viewAppointment(data.event.id)
}

function renderTimeline() {
    _options['maxHeight'] = $("#appointment_vistimeline").height()
    var t = new Date(Date.now())
    _options['start'] = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 8, 0, 0)
    _options['end'] = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 18, 0, 0)
    app_timeline = new vis.Timeline(document.getElementById('appointment_vistimeline'), _items, _groups, _options)

    app_timeline.on("scroll", debounce(groupFocus, 200));
    app_timeline.on('select', (props) => {
        if (props.items.length) {
            viewAppointment(props.items[0])
        }
    })
}

function createCalendar(view_setting) {
    if (app_calendar) app_calendar.destroy()

    app_calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: view_setting.length ? view_setting[0] : 'unknown',
        headerToolbar: {
            left: 'prev,next,today',
            center: 'title',
            right: view_setting.join(',')
        },
        views: {
            hTimelineDay: {
                buttonText: 'timeline',
                content: function(props) {
                    return {
                        html: `<div id="appointment_vistimeline" style="height: 100%; max-height: 100%;"></div>`
                    }
                },
                didMount: () => {
                    renderTimeline()
                }
            },
            unknown: {
                buttonText: 'unknown',
                content: function(props) {
                    return {
                        html: `<div></div>`
                    }
                }
            }
        },
        dayMinWidth: 225,
        expandRows: true,
        initialDate: TODAY,
        navLinks: true,
        selectable: true,
        selectMirror: true,
        slotDuration: {minutes: 5},
        scrollTime: '09:00:00',
        allDaySlot: false,
        editable: false,
        dayMaxEvents: true,
        nowIndicator: true,
        select: function (arg) {
            handleNewEvent(arg);
        },
        eventClick: function (arg) {
            handleViewEvent(arg);
        },
        eventContent: function(arg) {
            var icon = ''
            let el = document.createElement('div')
            el.setAttribute('style', 'height: 100%;')
            if (arg.event.extendedProps.provider === 1) {
                icon = 'fa-user-doctor'
            } else if (arg.event.extendedProps.provider === 0) {
                icon = 'fa-house-medical'
            }
            el.innerHTML = `
                <div style="overflow: hidden;">
                    <div class="text-white fs-6"><i class="fa fa-light fa-thin ${icon} text-white"></i> ${arg.event.title}</div>
                    <div class="fs-8"><i class="fa fa-location-dot text-white"></i> ${arg.event.extendedProps.address ? arg.event.extendedProps.address : ''} ${arg.event.extendedProps.city ? arg.event.extendedProps.city : ''}</div>
                    <div class="fs-8"><i class="fa fa-phone text-white"></i> ${arg.event.extendedProps.phone ? arg.event.extendedProps.phone : ''}</div>
                </div>
            `
            return {
                domNodes: [el]
            }
        },
        // Resource
        resourceLabelContent: function(props) {
            return {
                domNodes: [getResourceContent({
                    id: props.resource.id,
                    name: props.resource.title,
                    prov: props.resource._resource.extendedProps.prov,
                    photo: props.resource._resource.extendedProps.photo,
                    qualification: props.resource._resource.extendedProps.qualification,
                    specialty: props.resource._resource.extendedProps.specialty
                })]
            }
        },
        resourceOrder: 'sort',
        datesSet: function(){
            selected_date = moment(app_calendar.getDate()).format('YYYY-MM-DD');
            load_data();
        },
    });
    app_calendar.render();

    $(".fc-license-message").hide()
}
// utils end //

// Data Load begin //
function loadSpecialistProviderByMeasureId(mid) {
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {measureid: mid, clinicid: localStorage.getItem('chosen_clinic')}, "specialist/getSpecialistByMeasureId", (xhr, err) => {
        if (!err) {
            _externProvider = []
            let result = JSON.parse(xhr.responseText)['data'];
            var options = '';
            for(var i=0; i<result.length; i++) {
                options += `<option value='${result[i]['id']}'>${result[i]['fname']} ${result[i]['lname']}</option>`
                _externProvider.push(result[i]['id'].toString())
          }
          $("#appointment_specialist_external_provider").html(options);
          if (result.length) {
                $("#appointment_specialist_external_provider").val(__spec).trigger('change')
            }
        }
    });
}

function add_event(){
    setGroupResource()

    let events = {}

    for(var i in appointments){
        var s = new Date(appointments[i]['approve_date'].substr(0, 10)+' '+appointments[i]['start_date']);
        var e = new Date(appointments[i]['approve_date'].substr(0, 10)+' '+appointments[i]['end_date']);
        var bg = ''
        if (appointments[i]['provider'] === '0') bg = 'info'
        else if (appointments[i]['provider'] === '1') bg = 'primary'
        if(appointments[i]['attended']=="1") bg = 'success';

        // Month
        if (_inactive_items.status.indexOf(appointments[i]['status']) == -1 && _inactive_items.specialty.indexOf(appointments[i]['sspecialty']) == -1) {
            if (appointments[i]['provider'] == '0') {
                // for month
                events = {
                    id: appointments[i]['id'],
                    title: appointments[i]['doctor_fname']+' '+appointments[i]['doctor_lname'],
                    resourceId: 'D_' + appointments[i]['doctor_fname']+' '+appointments[i]['doctor_lname'],
                    start: s,
                    end: e,
                    className: "border border-danger border-0 bg-opacity-75 bg-"+bg+" text-inverse-primary",
                    // Extended Props
                    address: appointments[i]['daddress'],
                    phone: appointments[i]['dphone'],
                    city: appointments[i]['dcity'],
                    zip: appointments[i]['dzip'],
                    provider: 0,
                    data_id: appointments[i]['id'],
                    sort: 'D_' + appointments[i]['doctor_fname']+' '+appointments[i]['doctor_lname']
                }
            } else if (appointments[i]['provider'] === '1') {
                // for month
                events = {
                    id: appointments[i]['id'],
                    title: appointments[i]['spec_fname']+' '+appointments[i]['spec_lname'],
                    resourceId: 'S_' + appointments[i]['spec_fname']+' '+appointments[i]['spec_lname'],
                    start: s,
                    end: e,
                    className: "border border-danger border-0 bg-opacity-75 bg-"+bg+" text-inverse-primary",
                    // Extended Props
                    address: appointments[i]['saddress'],
                    phone: appointments[i]['sphone'],
                    city: appointments[i]['scity'],
                    zip: appointments[i]['szip'],
                    provider: 1,
                    data_id: appointments[i]['id'],
                    sort: 'S_' + appointments[i]['spec_fname']+' '+appointments[i]['spec_lname']
                }
            }
            app_calendar.addEvent(events);
        }

        // For Day
        if (_inactive_items.status.indexOf(appointments[i]['status']) == -1 && _inactive_items.specialty.indexOf(appointments[i]['sspecialty']) == -1) {
            _items.add({
                id: appointments[i].id,
                group: appointments[i].provider == '0' ? appointments[i].doctor_fname + ' ' + appointments[i].doctor_lname : appointments[i].spec_fname + ' ' + appointments[i].spec_lname,
                start: s,
                end: e,
                style: appointments[i].attended == 0 ? 'background-color: #87CEFA40;' : 'background-color: #98FB9890;',
                content: getItemContent(appointments[i])
            })
        }
    }

    if (app_timeline != null) {
        app_timeline.setGroups(_groups)
        app_timeline.setItems(_items)

        $(".vis-inner").css('width', '100%')
        $(".vis-inner").removeClass('vis-inner')
    }
}

function load_data(){
    var entry ={
        date: selected_date,
        clinic_id: localStorage.getItem('chosen_clinic'),
        specialties: specialties
    }
    if(selected_doctor!="") entry['doctors'] = selected_doctor;
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

function fillReferralDocument(data) {
    //header
    $("#referral_title").html(data.aprovider == '1' ? data.sspecialty : data.dspecialty)
    var now = new Date(Date.now())
    $("#referral_date").html(`${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`)
    $("#header_name").html(data.pfname + ' ' + data.plname)
    var pdob = new Date(data.pdob)
    $("#header_dob").html(`${pdob.getMonth()}/${pdob.getDate()}/${pdob.getFullYear()}`)
    $("#header_gender").html(data.pgender)
    $("#header_language").html(data.planguage)
    $("#header_clinic_name").html(data.cname)
    $("#header_clinic_address").html(data.caddress)
    $("#header_clinic_state").html(data.cstate)
    $("#header_clinic_city").html(data.ccity)
    $("#header_clinic_zip").html(data.czip)
    $("#header_clinic_phone").html(data.cphone)
    $("#header_clinic_fax").html(data.cfax)
    // specialist
    $("#specialist_name").html(data.aprovider == '1' ? data.sfname + ' ' + data.slname : data.dfname + ' ' + data.dlname)
    $("#specialist_specialty").html(data.aprovider == '1' ? data.sspecialty : data.dspecialty)
    $("#specialist_npi").html(data.aprovider == '1' ? data.snpi : data.dnpi)
    $("#specialist_address").html(data.aprovider == '1' ? data.saddress : data.daddress)
    $("#specialist_location").html(data.aprovider == '1' ? data.scity + ' ' + data.sstate + ' ' + data.szip : data.dcity + ' ' + data.dstate + ' ' + data.dzip)
    $("#specialist_phone").html(data.aprovider == '1' ? data.sphone : data.dphone)
    $("#specialist_fax").html(data.aprovider == '1' ? data.sfax : '')
    $("#specialist_email").html(data.aprovider == '1' ? data.semail : data.demail)
    $("#specialist_web").html(data.aprovider == '1' ? data.sweb : '')
    // clinic provider
    $("#referral_clinic_name").html(data.cname)
    $("#pcp_name").html(data.mfname + ' ' + data.mlname)
    $("#pcp_npi").html(data.cnpi)
    $("#pcp_address").html(data.caddress)
    $("#pcp_location").html(data.ccity + ' ' + data.cstate + ' ' + data.czip)
    $("#pcp_phone").html(data.cphone)
    $("#pcp_fax").html(data.cfax)
    $("#pcp_email").html(data.cemail)
    $("#pcp_web").html(data.cweb)
    // referral reason
    $("#referral_reason").html(data.areason)
    $("#referral_note").html(data.anote)
    $("#referral_status").html(data.a_sdisplay)
    $("#referral_priority").html(data.a_pdisplay)
    $("#referral_start_date").html(data.astartd)
    $("#referral_end_date").html(data.aendd)
    $("#referral_auth_no").html('')
    $("#referral_auth_type").html('')
    $("#referral_spec_note").html('')
    // patient info
    $("#patient_name").html(data.pfname + ' ' + data.plname)
    $("#patient_dob").html(`${pdob.getMonth()}/${pdob.getDate()}/${pdob.getFullYear()}`)
    $("#patient_gender").html(data.pgender)
    $("#patient_language").html(data.planguage)
    $("#patient_address").html(data.paddress)
    $("#patient_phone").html(data.pphone)
    $("#patient_email").html(data.pemail)
    $("#insurance").html(data.iname)
    $("#insurance_no").html('')
    $("#communication_need").html('')
    //provider
    $("#provider_npi").html(data.mnpi)
    $("#provider_name").html(data.mfname + ' ' + data.mlname)
    $("#referral_create_date").html(`${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`)
    $("#referral_create_time").html(`${now.getHours()}:${now.getMinutes()}`)

    return data.mfname + ' ' + data.mlname
}

function generateDocument(filename) {
    setTimeout( function () {
        // Make Referral Document
        function filter (node) {
            return (node.tagName !== 'i');
        }
        var hti = window.htmlToImage
        let el = $(".document-page")
        new Promise((resolve, reject) => {
            var images = []
            var val = 0
            for (var i = 0; i < el.length; i ++) {
                hti.toJpeg(el[i], {filter: filter}).then(image => {
                    val ++
                    images.push({
                        id: val,
                        image: image
                    })
                    if (val == el.length) resolve(images.reverse())
                })
            }
        }).then(resolve => {
            var pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'letter',
                pagesplit: true
            })
            pdf.output('datauri')
            for (var i = 0; i < resolve.length; i ++) {
                if (i > 0) pdf.addPage('letter', 'portrait')
                pdf.addImage(resolve[i].image, 'JPEG', 0, 0)
            }
            pdf.save(filename + '.pdf')
            hideLoading()
            $("#referral-document-modal").modal('hide')
        }).then(reject => {
            console.log(reject)
            $("#referral-document-modal").modal('hide')
        })
    }, 500 );
}

function showLoading(text) {
    const loadingEl = document.createElement("div")
    document.body.prepend(loadingEl)
    loadingEl.classList.add("page-loader")
    loadingEl.classList.add("flex-column")
    loadingEl.classList.add("bg-dark")
    loadingEl.classList.add("bg-opacity-50")
    loadingEl.innerHTML = `
        <span class="spinner-border text-primary" role="status"></span>
        <span class="text-gray-200 fs-1 fw-semibold mt-5">${text}</span>
    `

    // Show page loading
    KTApp.showPageLoading()
}

function hideLoading() {
    KTApp.hidePageLoading()
}

// For Appointment Form begin //

// Load Clinic Provider

sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id: localStorage.getItem('chosen_clinic')}, "provider/getProviderByClinic", (xhr, err) => {
    if (!err) {

        _doct_item = []

        doctors = JSON.parse(xhr.responseText)['data'];
        $("#pcp_list").html("");
        $("#pcp_select_button").removeClass("d-none");

        var c = checked="checked"
        var html = ''
        var options = '';
        doctors.forEach(doctor => {
            _doct_item.push({
                id: doctor.id,
                name: doctor.fname + ' ' + doctor.lname,
                address: doctor.address,
                phone: doctor.phone,
                photo: doctor.photo,
                qualification: doctor.qualification,
                prov: 0
            })

            html += `
                <label class="form-check form-check-custom form-check-sm form-check-solid mb-3">
                    <input class="form-check-input doctor-check" type="checkbox" checked data-id="${doctor['id']}" >
                    <span class="form-check-label text-gray-600 fw-semibold">${doctor['fname']} ${doctor['lname']}</span>
                </label>
            `
            options += '<option value="'+doctor['id']+'" >'+doctor['fname']+' '+doctor['lname']+'</option>';
        })
        $("#pcp_list").html(html)

        $("#appointment_clinic_provider").html(options);
        $("#appointment_clinic_provider").val(doctors[0]['id'])

        if (app_calendar) createCalendar(app_calendar.getOption('headerToolbar').right.split(','))
    }
});

// Load Specialist
sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id: localStorage.getItem('chosen_clinic')}, 'specialist/getSpecialistByClinic', (xhr, err) => {
    if (!err) {

        _spec_item = []

        $("#specialist_list").html("");
        $("#specialist_select_button").removeClass("d-none");

        specialists = JSON.parse(xhr.responseText)['data']
        
        var c = 'checked="checked"'
        var html = ''
        specialists.forEach(specialist => {
            _spec_item.push({
                id: specialist.id,
                name: specialist.fname + ' ' + specialist.lname,
                address: specialist.address,
                phone: specialist.phone,
                photo: specialist.photo,
                specialty: specialist.specialty,
                prov: 1
            })

            html += `
                <label class="form-check form-check-custom form-check-sm form-check-solid mb-3">
                    <input class="form-check-input specialist-check" type="checkbox" checked data-id="${specialist['id']}" >
                    <span class="form-check-label text-gray-600 fw-semibold">${specialist['fname']} ${specialist['lname']}</span>
                </label>
            `
        })
        $("#specialist_list").html(html)

        if (app_calendar) createCalendar(app_calendar.getOption('headerToolbar').right.split(','))
    }
});

// Load Specialty
sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id: localStorage.getItem('chosen_clinic')}, "referral/getAppointmentSpecialtyByClinic", (xhr, err) => {
    if (!err) {
        specialty = JSON.parse(xhr.responseText)['data'];
        var options = '';
        for(var i=0;i<specialty.length;i++){
            html = '<label class="form-check form-check-custom form-check-sm form-check-solid mb-3">';
            html += '<input class="form-check-input specialty-check" type="checkbox" value="' + specialty[i]['name'] + '" checked="checked" data-id="'+specialty[i]['id']+'" >';
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

// Load Measure Data
sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/getMeasureObservation", (xhr, err) => {
    if (!err) {
        observation = JSON.parse(xhr.responseText)['data'];
        if (observation.length) {
            var m = $("#appointment_measure").val()
            observation.forEach(o => {
                if (o.m_id == m) {
                    var icds = JSON.parse(o.ICD)
                    var options = ''
                    icds.forEach(icd => {
                        options += '<option value="'+icd.value+'" >'+icd.code+'</option>'
                    })
                    $("#appointment_assessment").html(options)
                }
            })
        }
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
      if (measure.length > 0) {
        loadSpecialistProviderByMeasureId(measure[0]['measureId'])
        $("#appointment_measure").val(measure[0].measureId).trigger('change')
      }
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
sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "valueset/appointmentStatus", (xhr, err) => {
    if (!err) {
        var result = JSON.parse(xhr.responseText)['data'];
        var options = ''
        var html = ''

        $("#status_list").html("");

        result.forEach(item => {
            options += `<option value='${item.id}'>${item.display}</option>`
            html += `
                <label class="form-check form-check-custom form-check-sm form-check-solid mb-3">
                    <input class="form-check-input status-check" type="checkbox" checked data-id="${item['id']}" >
                    <span class="form-check-label text-gray-600 fw-semibold">${item['display']}</span>
                </label>
            `
        });
        $("#appointment_status").html(options)
        $("#status_list").html(html)
    }
});

// Load Barrier Reason
sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "valueset/appointmentBarrier", (xhr, err) => {
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
sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "valueset/encounterPriority", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    var options = '';
    for(var i=0; i<result.length; i++){
      options += '<option value="'+result[i]['id']+'" >'+result[i]['display']+'</option>';
    }
    $("#appointment_priority").html(options);
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
            // $("#specialty_list").append(html);

            options += '<option value="'+specialty[i]['id']+'" >'+specialty[i]['name']+'</option>';
        }
        $("#appointment_search_specialty").html('<option value="0">All Specialties</option>' + options);
    }
});

// Data Load end //

$(document).ready(async function() {
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
        if ($('input[name="appointment_provider"]:checked').val() == '1') {
            if ($("#appointment_specialist_external_provider").val() == null || $("#appointment_specialist_external_provider").val() < 1) {
                toastr.info('Plelase select External Medical Provider')
                return;
            }
        } else if ($('input[name="appointment_provider"]:checked').val() == '0') {
            if ($("#appointment_clinic_provider").val() == null || $("#appointment_clinic_provider").val() < 1) {
                toastr.info('Plelase select External Medical Provider')
                return;
            }
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
        entry['specialist_provider'] = $("#appointment_specialist_external_provider").val()
        entry['clinic_provider'] = $("#appointment_clinic_provider").val()
        entry['cancel_reason'] = $("#appointment_barrier_reason").val().join(',')
        entry['organization'] = $("#appt_spec_organ").val()
        entry['specialty'] = $("#appt_spec_specialty").val()
        entry['npi'] = $("#appt_spec_npi").val()
        entry['assessment'] = $("#appointment_assessment").val()

        var filename = 'document'

        if($("#appointment_id").val()==""){
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/create", (xhr, err) => {
                if (!err) {
                    var result = JSON.parse(xhr.responseText)['data']
                    if(result['message'] == "exist") {
                        toastr.info("Appointment is exist");
                    } else {
                        $("#appointment_edit_modal-1").modal("hide");
                        toastr.success("Appointment is added successfully!");

                        console.log({id: result['insertId'], userid: localStorage.getItem('userid')})
                        sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: result['insertId'], userid: localStorage.getItem('userid')}, 'referral/appointment/referraldoc', (xhr, err) => {
                            if (!err) {
                                var datas = JSON.parse(xhr.responseText)['data']

                                filename = fillReferralDocument(datas[0])

                                $("#referral-document-modal").modal('show')

                                showLoading('Generating Document...')
                                generateDocument(filename)
                            }
                        })
                    }
                } else {
                    return toastr.error("Action Failed");
                }
            });
        } else {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/appointment/update", (xhr, err) => {
                if (!err) {
                    $("#appointment_edit_modal-1").modal("hide");
                    toastr.success("Appointment is updated successfully!");

                    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: entry.id, userid: localStorage.getItem('userid')}, 'referral/appointment/referraldoc', (xhr, err) => {
                        if (!err) {
                            var result = JSON.parse(xhr.responseText)['data']
                            
                            filename = fillReferralDocument(result[0])

                            $("#referral-document-modal").modal('show')

                            showLoading('Generating Document...')
                            generateDocument(filename)
                        }
                    })
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }

        setTimeout(() => {
            load_data()
        }, 1000)
    });

    $(document).on('change', '.status-check', function(e) {
        if (e.target.checked === false)
            _inactive_items.status.push($(this).attr('data-id'))
        else {
            var i = _inactive_items.status.indexOf($(this).attr('data-id'))
            _inactive_items.status.splice(i, 1)
        }

        load_data()
    })

    $(document).on('change', '.doctor-check', function(e) {
        if (e.target.checked === false)
            if ($(this).attr('data-id') != '0') {
                _inactive_items.doctor.push($(this).attr('data-id'))
            } else {
                _inactive_items.doctor = []
                $('.doctor-check').each(function() {
                    _inactive_items.doctor.push($(this).attr('data-id'))
                })
                $("#pcp_select_button").hide()
            }
        else {
            if ($(this).attr('data-id') != '0') {
                var i = _inactive_items.doctor.indexOf($(this).attr('data-id'))
                _inactive_items.doctor.splice(i, 1)
            } else {
                _inactive_items.doctor = []
                $("#pcp_select_button").show()
            }
        }

        load_data()
    })

    $(document).on('change', '.specialist-check', function(e) {
        if (e.target.checked === false)
            if ($(this).attr('data-id') != '0') {
                _inactive_items.specialist.push($(this).attr('data-id'))
            } else {
                _inactive_items.specialist = []
                $('.specialist-check').each(function() {
                    _inactive_items.specialist.push($(this).attr('data-id'))
                })
                $("#specialist_select_button").hide()
                $("#specialty_select_button").hide()
            }
        else {
            if ($(this).attr('data-id') != '0') {
                var i = _inactive_items.specialist.indexOf($(this).attr('data-id'))
                _inactive_items.specialist.splice(i, 1)
            } else {
                _inactive_items.specialist = []
                $("#specialist_select_button").show()
                $("#specialty_select_button").show()
            }
        }

        load_data()
    })

    $(document).on("change",".specialty-check",function(){
        _inactive_items.specialty = []
        if($(this).data("id")=="0"){
            $(".specialty-check").prop("checked", $(this).prop("checked"));
        }
        if(!$(this).prop("checked"))$("#specialty_check_all").prop("checked", false);
        var specialty = $(".specialty-check").map(function() {
            if($(this).prop("checked")){
                return $(this).data("id")
            } else {
                _inactive_items.specialty.push($(this).val())
            }
        }).get();
        specialties = specialty.join();
        specialties = specialties.split(",")[0]=="0"?"0":specialties;
        console.log(_inactive_items.specialty)
        load_data()
        
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
        if (e.target.value == '6' || e.target.value === '7' || e.target.value === '11' || e.target.value === '12') {
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
            if(observation[i]['m_id'] == e.target.value){
                var options = '';
                try{
                    var icd = JSON.parse(observation[i]['ICD']);
                    for(var j=0; j<icd.length; j++){
                        options += '<option value="'+icd[j]['value']+'" >'+icd[j]['code']+'</option>';
                    }
                    $("#appointment_assessment").html(options);
                }catch(e){
                    console.log(observation[i]['ICD'])
                }
            }
        }
        loadSpecialistProviderByMeasureId(e.target.value)
    });

    $(document).on("change",".provider-radio",function(){
        var value = $('input[name="appointment_provider"]:checked').val();
        if(value=="0"){
            $("#appointment_specialist_external_provider").prop("disabled", true);
            $("#appointment_clinic_provider").prop("disabled", false);
            $("#appointment_clinic_provider").val($("#appointment_clinic_provider option:first").val());
        }else{
            $("#appointment_clinic_provider").prop("disabled", true);
            $("#appointment_specialist_external_provider").prop("disabled", false);
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
        }
    });

    $(document).on('change', '#appointment_specialist_external_provider', (e) => {
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
        $("#appointment_specialist_external_provider").prop("disabled", false);
        $("#appointment_clinic_provider").prop("disabled", true);
        $("#appointment_clinic_provider").val("");
        $("#appointment_attended").prop('checked', false);
        $("#appointment_status").val('2').trigger('change');
        $("#appointment_reason").val('')

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
        // $("#referral-document-modal").modal('show')
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
        $("#appointment_specialist_external_provider").append(option);
        $("#appointment_specialist_external_provider").val(e.target.attributes['data'].value).trigger('change');
        
        _externProvider.push(e.target.attributes['data'].value)
        
        toastr.success("Specialist is added in the External Provider List successfully!");
    })
    
    // Appointment Search Form end //

    // Patient Management Modal begin //
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
                    $("#appointment_edit_modal-1").modal("hide");
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
                $("#appointment_edit_modal-1").modal("hide");
                $("#appointment_modal").modal("hide");
                return toastr.success('Patient is added successfully');
            } else {
                return toastr.error('Action Failed');
            }
        });
    });
    // Patient Management Modal end //

    // Appointment Form end //

    //
    addEventListener('resize', (e) => {
        _options['maxHeight'] = $("#appointment_vistimeline").height()
        if (app_timeline) app_timeline.setOptions(_options)
    })
    //
    // Appointment dashboad begin //
    // Calendar begin //

    // Load Calendar View Setting Information AND create calendar
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {userid: localStorage.getItem('userid')}, 'manager/getapptview', (xhr, err) => {
        if (!err) {
            var _view_list = []
            var result = JSON.parse(xhr.responseText)['data']
            if (result.length) {
                _cal_view_setting = result[0].appt_view_setting
            }
            if (_cal_view_setting % 2 === 0) {
                $("#cal_view_month").prop('checked', true)
                _view_list.push('dayGridMonth')
            }
            if (_cal_view_setting % 3 === 0) {
                $("#cal_view_day").prop('checked', true)
                _view_list.push('resourceTimeGridDay')
            }
            if (_cal_view_setting % 5 === 0) {
                $("#cal_view_timeline").prop('checked', true)
                _view_list.push('hTimelineDay')
            }
            createCalendar(_view_list)
        }
    })

    $(document).on('change', '.setting-check', (e) => {
        if (e.target.checked === true) {
            _cal_view_setting *= e.target.value
        } else {
            _cal_view_setting /= e.target.value
        }

        _buttons = []
        $('.setting-check').each(function() {
            if ($(this)[0].checked == true)
                _buttons.push($(this).attr('data-id'))
        })
        app_calendar.setOption('headerToolbar', {
            left: 'prev,next,today',
            center: 'title',
            right: _buttons.join(',')
        })
        createCalendar(_buttons)
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {view: _cal_view_setting, userid: localStorage.getItem('userid')}, 'manager/setapptview', (xhr, err) => {
            if (!err) {
            }
        })
    })

    // Calendar end //

    // Appointment dashboad end //
})
