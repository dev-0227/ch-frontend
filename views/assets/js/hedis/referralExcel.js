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
function load_excel(data){
  console.log(data);
  referral_data = [];
  let more_class = "";
  for(var i=0;i<data.length;i++){
    var view="<span idkey='"+data[i]['id']+"'>";
    view += "<i class='fa fa-file-text text-success referral-view cursor-pointer"+more_class+"'></i></span> ";
    view += data[i]['encounter_id']?"<span idkey='"+data[i]['encounter_id']+"'><i class='fa fa-sticky-note text-primary cursor-pointer"+(data[i]['notecheck'] != null?"":"")+" encounter_edit_btn "+more_class+" '></i></span> ":"";
    view += data[i]['appointment_id']?"<span idkey='"+data[i]['appointment_id']+"'><i class='fa-solid fa-a appt_edit_btn text-info cursor-pointer'></i></span> ":"";
    view += "<span idkey='"+data[i]['id']+"'><i class='fa fa-trash referral-delete text-danger' ></span>";
    var contact = "<i class='fa fa-print referral-print text-success cursor-pointer "+more_class+"'></i> "
    contact += data[i]['pt_email']?"<i class='fa fa-envelope referral-mail "+more_class+" text-warning cursor-pointer'></i> ":"";
    contact += data[i]['pt_mobile']?"<i class='fa fa-mobile referral-mobile "+more_class+" text-info cursor-pointer' ></i> ":"";
    contact += data[i]['pt_phone']?"<i class='fa fa-phone referral-phone text-primary cursor-pointer' aria-hidden='true' value = 'dragon' style='cursor: pointer;'></i>":"";
    var status = "<i class='fa fa-eye referral-status text-success cursor-pointer'></i>&nbsp;<i class='fa fa-history referral-log text-primary cursor-pointer'></i>";
    var tmp = [
      data[i]['id'],
      data[i]['insurance'],
      data[i]['patient_id'],
      (data[i]['emr_id']!=0&&data[i]['emr_id']!="")?data[i]['emr_id']:null, 
      data[i]['subscrber_no'],
      data[i]['pt_fname']+" "+data[i]['pt_lname'], 
      data[i]['pt_phone'], 
      view, 
      contact, 
      status,
      "<div class='text-truncate'>"+data[i]['m_id'] + " "+ data[i]['measure']+"</div>",
      "<div class='text-truncate'>"+data[i]['specialty_name']?data[i]['specialty_name']:""+"</div>",
      data[i]['doctor_fname']+" "+data[i]['doctor_lname'],
      data[i]['initiated'],
      data[i]['appt_date']?moment(data[i]['appt_date']).format("YYYY-MM-DD"):"",
      data[i]['received_date']?moment(data[i]['received_date']).format("YYYY-MM-DD"):"",
      data[i]['dos']?moment(data[i]['dos']).format("YYYY-MM-DD"):"",
      data[i]['anticipated'],
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
        type: 'hidden',
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
          title:'Patient Name',
          readOnly:true,
          width:200
      },
      {
          type: 'hidden',
          title:'Phone',
          readOnly:true,
          width:100
      },
    
      {
          type: 'html',
          title:'View & Notes',
          readOnly:true,
          width:80
      },
      {
          type: 'html',
          title:'Contact',
          readOnly:true,
          width:80
      },
      {
          type: 'html',
          title:'Status & Log',
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
          type: 'html',
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
        title:'Received Date',
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
        type: 'text',
        title:'Anticipated',
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

$(document).ready(function () {

  $(document).on("click","#referral_encounter",function(){
    
  });

  $(document).on("click",".appt_edit_btn",function(){
    $(".appt-list").addClass("d-none");
  });

});


document.write('<script src="/assets/plugins/jexcel/jexcel.js"></script>');
document.write('<script src="/assets/plugins/jexcel/jsuites.js"></script>');

