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

function getBgColorByType(type){
  var color="#ffffff";
  for(var i in referral_status){
    if(referral_status[i]['id']== type){
      var colors = referral_status[i]['color']?referral_status[i]['color'].split(","):[];
      color = colors.length>0?colors[0]:"#ffffff";
    }
  }
  return color;
}
function getTextColorByType(type){
  var color="#000000";
  for(var i in referral_status){
    if(referral_status[i]['id']== type){
      var colors = referral_status[i]['color']?referral_status[i]['color'].split(","):[];
      color = colors.length>1?colors[1]:"#000000";
    }
  }
  return color;
}
// function hexToRgb(hex) {
//   const normal = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
//   if (normal) return normal.slice(1).map(e => parseInt(e, 16));
//   const shorthand = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
//   if (shorthand) return shorthand.slice(1).map(e => 0x11 * parseInt(e, 16));
//   return null;
// }
// function ContrastColor(color)
// {
//     var d = 0;
//     var rgb = hexToRgb(color);
//     if(!rgb)return "#000000";
//     var luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])/255;
//     if (luminance > 0.5)
//        d = "#000000"; // bright colors - black font
//     else
//        d = "#FFFFFF"; // dark colors - white font
//     return  d;
// }

$("#referral_clinic_name").html("")

sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),insid:"0"}, "setting/getClinicins", (xhr, err) => {
  if (!err) {
    let result = JSON.parse(xhr.responseText);
    $("#referral_clinic_name").html(result['clinic']);
}
});

var referral_status = []

sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/referral/status", (xhr, err) => {
  if (!err) {
    referral_status = JSON.parse(xhr.responseText)['data'];
}
});


sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinic_id:localStorage.getItem('chosen_clinic')}, "referral/appointmentSpecialty/getReferralSpecialtyByClinic", (xhr, err) => {
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

  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/referral?"+params, (xhr, err) => {
    if (!err) {
        var data = JSON.parse(xhr.responseText)['data'];
        load_excel(data);
    }
  });
}



function load_excel(data){
   referral_data = [];
  for(var i=0;i<data.length;i++){
    var color = getTextColorByType(data[i]['rt_type'].toString());
    var view = "<i class='fa fa-info-circle referral-patient-info  cursor-pointer' title='Status' style='color: "+color+";' data-id='"+data[i]['patient_id']+"'></i> ";
    view += "<span idkey='"+data[i]['id']+"'><i class='fa fa-eye referral-status  cursor-pointer' title='Status' style='color: "+color+";'></i></span> ";
    view += "<span idkey='"+data[i]['id']+"'>";
    view += "<i class='fa-solid fa-s referral-view cursor-pointer' title='Status Trajectory' style='color: "+color+";'></i></span> ";
    view += data[i]['encounter_id']?"<i class='d-none fa-solid fa-e cursor-pointer"+(data[i]['notecheck'] != null?"":"")+" encounter_edit_btn  ' title='Encounter' style='color: "+color+";' data-id='"+data[i]['encounter_id']+"'></i>":"";
    view += data[i]['appointment_id']?"<i class='d-none fa-solid fa-a appt_edit_btn  cursor-pointer' title='Appointment' style='color: "+color+";' data-id='"+data[i]['appointment_id']+"'></i>":"";
    view += "<span idkey='"+data[i]['id']+"'><i class='fa fa-history referral-log  cursor-pointer' title='log' style='color: "+color+";'></i></span></span> ";
    view += "<span idkey='"+data[i]['id']+"'><i class='fa fa-trash referral-delete  title='delete' style='color: "+color+";'></span>";
    var contact = "<span idkey='"+data[i]['patient_id']+"'><i class='fa fa-print referral-print s cursor-pointer ' style='color: "+color+";'></i> "
    contact += data[i]['pt_email']?"<i class='fa fa-envelope referral-email cursor-pointer' style='color: "+color+";'></i> ":"";
    contact += data[i]['pt_mobile']?"<i class='fa fa-mobile referral-calling cursor-pointer' data-type='mobile' style='color: "+color+";'></i> ":"";
    contact += data[i]['pt_phone']?"<i class='fa fa-phone referral-calling cursor-pointer' data-type='phone' style='color: "+color+";'></i>":"";
    contact += "</span>";

    var anticipated_date = new Date(data[i]['appt_date']);
    anticipated_date.setDate(anticipated_date.getDate() + 30);
    
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
      data[i]['overdue']=="1"?"<i class='fa fa-calendar-times  text-warning cursor-pointer'></i>":"",
      data[i]['rt_type']
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
      },
      {
        type: 'hidden',
        title:'status',
        width:60
      }
    ],
    filters: true,
    allowComments:true,
    updateTable:function(instance, cell, col, row, val, label, cellName) {
      if (col=='20') {
        cell.parentNode.style.color = getTextColorByType(val.toString());
        cell.parentNode.style.backgroundColor = getBgColorByType(val.toString());
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
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/update", (xhr, err) => {
    if (!err) {
      
    } else {
      return toastr.error('Action Failed');
    }
  });
  
}

let selectionActive = function(instance, x1, y1, x2, y2, origin) {
}

$(document).ready(async function () {
  $(".pt_info").addClass("d-none");
  $(document).on("click","#referral_encounter",function(){
    
  });


});


sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/referral/category", (xhr, err) => {
  if (!err) {
    let category = JSON.parse(xhr.responseText)['data'];
      sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/referral/status", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          var html = '';
          for(var i=0; i<category.length; i++){
            if(i>0){
              html += '<span class="fs-4 text-gray-500 fw-bolder pe-2">';
              html += category[i]['display'];
              html += '</span>';
            }
            for(var j=0; j<result.length; j++){
              if(category[i]['id']==result[j]['category']){
                html += '<label class="form-check form-check-sm form-check-custom form-check-solid m-3">';
                html += '<input class="form-check-input provider-radio" type="radio" name="referral_status" ';
                html += 'value='+result[j]['id'];
                html += j==0?' checked="checked"':'';
                html += ' data-category="0">';
                html += '<span class="form-check-label text-gray-600" >';
                html += result[j]['display'];
                html += '</span></label>';
              }
            }
            
          }
          
          $("#referral_status_list").html(html);
        }
      });
  }
});



$(document).on("click",".referral-patient-info",function(){
  
  $("#appointment_pt_info").data("id", $(this).data("id"));
  $("#appointment_pt_info").trigger("click");
  $("#patient-add-modal").addClass("d-none");
  $(this).siblings(".appt_edit_btn").trigger("click");
  $(this).siblings(".encounter_edit_btn").trigger("click");

  $("#patient-referral-modal").modal("show");
  setTimeout( function () {
    $("#patient-add-modal").modal("hide");
    $("#patient-add-modal").removeClass("d-none");
  }, 2000 );
  
});

$(document).on("click",".referral-view",function(){
  $("#referral_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#referral_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/chosen", (xhr, err) => {
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
          html += '</span><div class="ms-3 badge badge-lg  fw-bold my-2 fs-6" style="background-color: '+getBgColorByType(result[i]['rt_type'].toString())+'; color:'+getTextColorByType(result[i]['rt_type'].toString())+' "> ';
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
          $("#referral_status_date").val(moment(result[i]['rt_date']).format("YYYY-MM-DD"));
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

$(document).on("click",".referral-email",function(){
  var pt_id = $(this).parent().attr("idkey");
  var emr_id = "";
  var type = $(this).data("type");
  open_email_modal(pt_id, emr_id, type);

})

$(document).on("click",".referral-status",function(){

  $("#referral_id").val($(this).parent().attr("idkey"));
  let entry = {
    id: $("#referral_id").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/chosen", (xhr, err) => {
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
          $("#referral_status_date").val(moment(result[i]['rt_date']).format("YYYY-MM-DD"));
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
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/chosen", (xhr, err) => {
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
        html += result[i]['rt_date']?moment(result[i]['rt_date']).format("LLL"):"";
        html += '</span><div class="ms-3 badge badge-lg  fw-bold my-2 fs-6" style="background-color: '+getBgColorByType(result[i]['rt_type'].toString())+'; color:'+getTextColorByType(result[i]['rt_type'].toString())+' "> ';
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
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/delete", (xhr, err) => {
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

$(document).on("click",".referral-pt-info-tab",function(){
  $(".referral-pt-info-title").html($(this).data("details"));
  
});



document.write('<script src="/assets/js/hedis/encounterModal.js" type="text/javascript"></script>');
document.write('<script src="/assets/js/hedis/appointmentModal.js" type="text/javascript"></script>');


