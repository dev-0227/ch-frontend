function DateFormat(date) {
  var serial = new Date(date);
  let year = serial.getFullYear();
  let month = serial.getMonth() + 1;
  let dt = serial.getDate();

  if (dt < 10) {
      dt = '0' + dt;
  }
  if (month < 10) {
      month = '0' + month;
  }
  return month+'/'+dt+'/'+year;
}

function getColorBytype(type){
  var color="primary";
  switch(type){
      case "1": color="secondary"; break;
      case "2": color="danger"; break;
      case "3": color="primary"; break;
      case "4": color="success"; break;
      case "5": color="info"; break;
      case "6": color="danger"; break;
      case "7": color="success"; break;
      case "8": color="info"; break;
      case "9": color="success"; break;
      default: color="primary"; break;
  }
  return color;
}
$("#referral_clinic_name").html("")

sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),insid:"0"}, "setting/getClinicins", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText);
    $("#referral_clinic_name").html(result['clinic']);
    
}
});


sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id:localStorage.getItem('chosen_clinic')}, "hedis/appointmentSpecialty/getReferralSpecialtyByClinic", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText)['data'];
    for(var i in result){
      var html='<li class="nav-item mt-2 mh-30px">';
      html+= ' <a class="nav-link text-active-primary ms-0 me-10 py-5 referral-specialty-tab cursor-pointer';
      if(i==0){
        $("#referral_selected_specialty").val(result[i]['id']);
        html+= ' active';
      }
      html+= '" data-id="'+result[i]['id']+'">';
      html+= result[i]['name'];
      html+= '</a></li>';
      $("#referral_specialty_tabs").append(html)
    }
    reload_referral();

}
});

function reload_referral(){
  var params = "clinic_id="+localStorage.getItem('chosen_clinic');
  params += "&specialty="+$("#referral_selected_specialty").val();

  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedis/referral?"+params, (xhr, err) => {
    if (!err) {
        var data = JSON.parse(xhr.responseText)['data'];
        load_excel(data);
    }
  });
}



function load_excel(data){
   referral_data = [];
  let more_class = "";
  for(var i=0;i<data.length;i++){
    var view = "<span idkey='"+data[i]['id']+"'><i class='fa fa-eye referral-status text-success cursor-pointer' title='Status'></i></span> ";
    view += "<span idkey='"+data[i]['id']+"'>";
    view += "<i class='fa-solid fa-s text-info referral-view cursor-pointer"+more_class+"' title='Status Trajectory'></i></span> ";
    view += data[i]['encounter_id']?"<span idkey='"+data[i]['encounter_id']+"'><i class='fa-solid fa-e text-primary cursor-pointer"+(data[i]['notecheck'] != null?"":"")+" encounter_edit_btn "+more_class+" ' title='Encounter'></i></span> ":"";
    view += data[i]['appointment_id']?"<span idkey='"+data[i]['appointment_id']+"'><i class='fa-solid fa-a appt_edit_btn text-info cursor-pointer' title='Appointment'></i></span> ":"";
    view += "<span idkey='"+data[i]['id']+"'><i class='fa fa-history referral-log text-primary cursor-pointer' title='log'></i></span></span> ";
    view += "<span idkey='"+data[i]['id']+"'><i class='fa fa-trash referral-delete text-danger' title='delete'></span>";
    var contact = "<span idkey='"+data[i]['patient_id']+"'><i class='fa fa-print referral-print text-success cursor-pointer "+more_class+"'></i> "
    contact += data[i]['pt_email']?"<i class='fa fa-envelope referral-mail "+more_class+" text-warning cursor-pointer' ></i> ":"";
    contact += data[i]['pt_mobile']?"<i class='fa fa-mobile referral-calling "+more_class+" text-info cursor-pointer' data-type='mobile'></i> ":"";
    contact += data[i]['pt_phone']?"<i class='fa fa-phone referral-calling text-primary cursor-pointer' data-type='phone' ></i>":"";
    contact += "</span>";

    var anticipated_date = new Date(data[i]['appt_date']);
    anticipated_date.setDate(anticipated_date.getDate() + 30)
    var tmp = [
      data[i]['id'],
      data[i]['ins_id'],
      data[i]['patient_id'],
      (data[i]['emr_id']!=0&&data[i]['emr_id']!="")?data[i]['emr_id']:null, 
      data[i]['subscrber_no'],
      data[i]['pt_fname'], 
      data[i]['pt_lname'], 
      data[i]['pt_dob']?moment(data[i]['pt_dob']).format("MM/DD/YYYY"):"",
      data[i]['pt_phone'], 
      view, 
      contact, 
      "<div class='text-truncate'>"+data[i]['m_id'] + " "+ data[i]['measure']+"</div>",
      "<div class='text-truncate'>"+data[i]['specialty_name']?data[i]['specialty_name']:""+"</div>",
      data[i]['doctor_fname']+" "+data[i]['doctor_lname'],
      data[i]['initiated'],
      data[i]['appt_date']?moment(data[i]['appt_date']).format("MM/DD/YYYY"):"",
      data[i]['received_date']?moment(data[i]['received_date']).format("YYYY-MM-DD"):"",
      data[i]['dos']?moment(data[i]['dos']).format("YYYY-MM-DD"):"",
      data[i]['anticipated']?moment(data[i]['anticipated']).format("YYYY-MM-DD"):data[i]['appt_date']?moment(anticipated_date).format("YYYY-MM-DD"):"",
      data[i]['overdue']=="1"?"<i class='fa fa-calendar-times  text-warning cursor-pointer'></i>":""
    ];
    referral_data.push(tmp);

  }
  $("#referral_excel").empty();
    mySpreadsheet = jexcel(document.getElementById('referral_excel'), {
    data: referral_data,
    search:true,
    pagination: 50,
    paginationOptions: [10,25,50,100],
    columns: [
      {
          type: 'hidden',
          title:'ID',
          readOnly:true,
          width:0
      },
      {
        type: 'text',
        title:'INS ID',
        readOnly:true,
        width:100
      },
      {
          type: 'hidden',
          title:'Patient ID',
          readOnly:true,
          width:100
      },
      {
        type: 'text',
        title:'EMR ID',
        readOnly:true,
        width:100
      },
      {
        type: 'hidden',
        title:'Subscriber No',
        readOnly:true,
        width:100
      },
      {
        type: 'text',
        title:'First Name',
        readOnly:true,
        width:100
      },
      {
        type: 'text',
        title:'Last Name',
        readOnly:true,
        width:100
      },
      {
        type: 'text',
        title:'DOB',
        readOnly:true,
        width:100
      },
      {
          type: 'text',
          title:'Phone',
          readOnly:true,
          width:120
      },
    
      {
          type: 'html',
          title:'Actions',
          readOnly:true,
          width:120
      },
      {
          type: 'html',
          title:'Contact',
          readOnly:true,
          width:80
      },
      {
          type: 'html',
          title:'Measure',
          readOnly:true,
          width:200
      },
      {
          type: 'hidden',
          title:'Specialty',
          readOnly:true,
          width:150
      },
      {
          type: 'text',
          title:'Referral To',
          readOnly:true,
          width:200
      },
      {
          type: 'calendar',
          title:'Initiated',
          options: {format:'MM/DD/YYYY'},
          width:100
      },
      {
          type: 'text',
          title:'Appt Date',
          readOnly:true,
          width:100
      },
      {
        type: 'calendar',
        title:'Received',
        options: {format:'MM/DD/YYYY'},
        width:100
      },
      {
        type: 'calendar',
        title:'DOS',
        options: {format:'MM/DD/YYYY'},
        width:100
      },
      {
        type: 'calendar',
        title:'Anticipated',
        options: {format:'MM/DD/YYYY'},
        width:100
      },
      {
          type: 'html',
          title:'Overdue',
          width:60
      }
    ],
    filters: true,
    allowComments:true,
    updateTable:function(instance, cell, col, row, val, label, cellName) {
      if (cell.innerHTML == 'notesflag') {
          cell.parentNode.childNodes[8].classList.add("notesflag");
      }
      if (cell.innerHTML == 'FileG') {
        cell.parentNode.style.color = tmpcolor[12]["tcolor"];
        cell.parentNode.style.backgroundColor = tmpcolor[12]["bcolor"];
      }
      
    },
    onchange: changed,
    onselection: selectionActive
  });
}
var editable=true
let changed = function(instance, cell, x, y, value) {
  if(!editable) {
    return false;
  }
  
  var f_id = jexcel.getColumnNameFromId([0,y]);
  var id = $('#referral_excel').jexcel('getValue',f_id);
  var key = $('#referral_excel').jexcel('getHeader',x);
  var entry = {
    id:id,
    key:key.replace(" ", "_").toLowerCase(),
    value:value,
    clinic_id:localStorage.getItem('chosen_clinic')
  };
  console.log(entry);
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/referral/update", (xhr, err) => {
    if (!err) {
      
    } else {
      return toastr.error('Action Failed');
    }
  });
  
}

let selectionActive = function(instance, x1, y1, x2, y2, origin) {
}

$(document).ready(async function () {

    $(document).on("click","#referral_encounter",function(){
    
  });

  $(document).on("click",".appt_edit_btn",function(){
    $(".appt-list").addClass("d-none");
  });

});

$(document).on("click",".referral-view",function(){
  $("#referral_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#referral_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/referral/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#referral_insurance").html(result[0]['insurance']);
      $("#referral_measure").html(result[0]['m_id']);
      $("#referral_patient").html(result[0]['pt_fname']+" "+result[0]['pt_lname']);
      $("#referral_pt_gender").html(result[0]['pt_gender'].charAt(0).toUpperCase() + result[0]['pt_gender'].slice(1));
      $("#referral_pt_dob").html(moment(result[0]['pt_dob']).format('Do MMM, YYYY'));
      $("#referral_pt_age").html(calculateAge(result[0]['pt_dob']));
      $("#referral_pt_address").html(result[0]['pt_address']);
      $("#referral_pt_phone").html(result[0]['pt_phone']);
      $("#referral_subscriber").html(result[0]['subscrber_no']);
      $("#referral_specialty").html(result[0]['doctor_specialty']);
      $("#referral_ref_to").html(result[0]['doctor_fname']+" "+result[0]['doctor_lname']);
      $("#referral_spe_npi").html(result[0]['spe_npi']);
      $("#referral_reason").html(result[0]['reason']);

      $(".pt_info").data("id", result[0]['patient_id']);
      $("#referral_view_modal").modal("show");
      var html = "";
      $("#referral_history").html("");
      for(var i=0; i<result.length; i++){
          html = '';
          html += '<div class="timeline-item align-items-center mb-7">';
          html += '<div class="timeline-line mt-1 mb-n6 mb-sm-n7"></div>';
          html += '<div class="timeline-icon">';
          html += '<i class="ki-duotone ki-cd fs-2 text-danger"><span class="path1"></span><span class="path2"></span></i>';
          html += '</div><div class="timeline-content m-0">';
          html += '<span class="fs-6 text-gray-500 fw-semibold ">';
          html += result[i]['rt_date']?moment(result[i]['rt_date']).format("LLL"):"";
          html += '</span><div class="ms-3 badge badge-lg badge-'+getColorBytype(result[i]['rt_type'].toString())+' fw-bold my-2 fs-6">';
          html += result[i]['referral_type'];
          html += '</div></div></div>';
          $("#referral_history").append(html);
          $('input[name="referral_status"]').filter('[value="0"]').prop("checked", result[i]['rt_type']=="0"?true:false);
          $('input[name="referral_status"]').filter('[value="1"]').prop("checked", result[i]['rt_type']=="1"?true:false);
          $('input[name="referral_status"]').filter('[value="2"]').prop("checked", result[i]['rt_type']=="2"?true:false);
          $('input[name="referral_status"]').filter('[value="3"]').prop("checked", result[i]['rt_type']=="3"?true:false);
          $('input[name="referral_status"]').filter('[value="4"]').prop("checked", result[i]['rt_type']=="4"?true:false);
          $('input[name="referral_status"]').filter('[value="5"]').prop("checked", result[i]['rt_type']=="5"?true:false);
          $('input[name="referral_status"]').filter('[value="6"]').prop("checked", result[i]['rt_type']=="6"?true:false);
          $('input[name="referral_status"]').filter('[value="7"]').prop("checked", result[i]['rt_type']=="7"?true:false);
          $('input[name="referral_status"]').filter('[value="8"]').prop("checked", result[i]['rt_type']=="8"?true:false);
          $('input[name="referral_status"]').filter('[value="9"]').prop("checked", result[i]['rt_type']=="9"?true:false);
      }

      $("#referral_info").removeClass("d-none");
      $("#referral_history_area").removeClass("d-none");
      $("#referral_status_area").removeClass("d-none");
      $("#referral_history_area").addClass("col-md-7");
      $("#referral_history_area").removeClass("col-md-12");
      $("#referral_status_area").addClass("col-md-5");
      $("#referral_status_area").removeClass("col-md-12");
      $("#referral_view_modal").children().addClass("modal-lg");
      $("#referral_view_modal_footer").removeClass("d-none");
      
    } else {
      return toastr.error("Action Failed");
    }
  });
  
});


$(document).on("click",".referral-calling",function(){
  var pt_id = $(this).parent().attr("idkey");
  var emr_id = "";
  var type = $(this).data("type");
  open_calling_modal(pt_id, emr_id, type);

})

$(document).on("click",".referral-status",function(){

  $("#referral_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#referral_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/referral/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];

      $("#referral_patient").html(result[0]['pt_fname']+" "+result[0]['pt_lname']);
      $("#referral_status_date").val(moment().format("YYYY-MM-DD"));
      $("#referral_info").addClass("d-none");
      $("#referral_history_area").addClass("d-none");
      $("#referral_status_area").removeClass("d-none");
      $("#referral_status_area").removeClass("col-md-5");
      $("#referral_status_area").addClass("col-md-12");
      $("#referral_view_modal").children().removeClass("modal-lg");
      $("#referral_view_modal_footer").removeClass("d-none");

      for(var i=0; i<result.length; i++){
          $('input[name="referral_status"]').filter('[value="0"]').prop("checked", result[i]['rt_type']=="0"?true:false);
          $('input[name="referral_status"]').filter('[value="1"]').prop("checked", result[i]['rt_type']=="1"?true:false);
          $('input[name="referral_status"]').filter('[value="2"]').prop("checked", result[i]['rt_type']=="2"?true:false);
          $('input[name="referral_status"]').filter('[value="3"]').prop("checked", result[i]['rt_type']=="3"?true:false);
          $('input[name="referral_status"]').filter('[value="4"]').prop("checked", result[i]['rt_type']=="4"?true:false);
          $('input[name="referral_status"]').filter('[value="5"]').prop("checked", result[i]['rt_type']=="5"?true:false);
          $('input[name="referral_status"]').filter('[value="6"]').prop("checked", result[i]['rt_type']=="6"?true:false);
          $('input[name="referral_status"]').filter('[value="7"]').prop("checked", result[i]['rt_type']=="7"?true:false);
          $('input[name="referral_status"]').filter('[value="8"]').prop("checked", result[i]['rt_type']=="8"?true:false);
          $('input[name="referral_status"]').filter('[value="9"]').prop("checked", result[i]['rt_type']=="9"?true:false);
      }
      $(".pt_info").data("id", result[0]['patient_id']);
      $("#referral_view_modal").modal("show");
    }
  });
  

})

$(document).on("click",".referral-log",function(){

  $("#referral_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#referral_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/referral/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];

      $("#referral_patient").html(result[0]['pt_fname']+" "+result[0]['pt_lname']);
      $("#referral_status_date").val(moment().format("YYYY-MM-DD"));
      $("#referral_info").addClass("d-none");
      $("#referral_history_area").removeClass("d-none");
      $("#referral_status_area").addClass("d-none");
      $("#referral_history_area").removeClass("col-md-7");
      $("#referral_history_area").addClass("col-md-12");
      $("#referral_view_modal").children().removeClass("modal-lg");
      $("#referral_view_modal_footer").addClass("d-none");
      
      
      $("#referral_history").html("");
      for(var i=0; i<result.length; i++){
        var html = '';
        html += '<div class="timeline-item align-items-center mb-7">';
        html += '<div class="timeline-line mt-1 mb-n6 mb-sm-n7"></div>';
        html += '<div class="timeline-icon">';
        html += '<i class="ki-duotone ki-cd fs-2 text-danger"><span class="path1"></span><span class="path2"></span></i>';
        html += '</div><div class="timeline-content m-0">';
        html += '<span class="fs-6 text-gray-500 fw-semibold ">';
        html += result[i]['rt_date']?result[i]['rt_date'].replace("T", " ").substr(0, 16):"";
        html += '</span><div class="ms-3 badge badge-lg badge-'+getColorBytype(result[i]['rt_type'].toString())+' fw-bold my-2 fs-6">';
        html += result[i]['referral_type'];
        html += '</div></div></div>';
        $("#referral_history").append(html);
      }
      $(".pt_info").data("id", result[0]['patient_id']);
      $("#referral_view_modal").modal("show");
    }
  });
  

})

$(document).on("click",".referral-delete",function(){
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/referral/delete", (xhr, err) => {
        if (!err) {
          setTimeout( function () {
            reload_referral();
          }, 1000 );
        } else {
          return toastr.error("Action Failed");
        }
      });
    }
  });

});

$(document).on("click",".referral-specialty-tab",function(){

  $('.referral-specialty-tab').removeClass('active');
  $(this).addClass('active');
  $("#referral_selected_specialty").val($(this).data("id"));
  reload_referral()

})

$(".pt_info").click(function (e) {
  $("#referral_view_modal").modal("hide");
});

document.write('<script src="/assets/js/hedis/encounterModal.js" type="text/javascript"></script>');
document.write('<script src="/assets/js/hedis/appointmentModal.js" type="text/javascript"></script>');


