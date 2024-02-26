function DateFormat(serial) {
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
	

function deDateFormat(serial) {
  let year = serial.getFullYear();
  let month = serial.getMonth() + 1;
  let dt = serial.getDate();

  if (dt < 10) {
      dt = '0' + dt;
  }
  if (month < 10) {
      month = '0' + month;
  }
  return year+'-'+month+'-'+dt;
}
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
function countOccurences(string, word) {
  return string.split(word).length - 1;
}
var ptdata = [];
let newflag = 0;

var read = false;
var write = false;
var create = false;

function setClinicTotalPatients() {
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "patientlist/getTotal", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data'];
      $(".totalcount").html(data[0]['total'])
    } else {
      return toastr.error('Action Failed');
    }
  });
}
$(document).ready(async function () {
  "use strict";

  
  $(".patient_add_btn").hide();
  $("[data-toggle='tooltip']").tooltip();
  let flagparam = getUrlVars();
  if(flagparam['s'] == 1){
    newflag = 1;
    $(".totalflag").addClass('d-none')
  }
  else{
    newflag = 0;
  }

  
  

  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "patientlist/getLanguages", (xhr, err) => {
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
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".pt-title").html(result['clinic']);
    } else {
      return toastr.error('Action Failed');
    }
  });

  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {permission:'PATIENT_INFO'}, "user/getPermissionsByName", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      read = result.data.charAt(0)=="1"?true:false;
      write = result.data.charAt(1)=="1"?true:false;
      create = result.data.charAt(2)=="1"?true:false;

      console.log(result);

      if(create){
        $(".patient_add_btn").show();
      }else{
        $(".patient_add_btn").hide();
      }

      if(read)loadData(1)
     
    } else {
      return toastr.error('Action Failed');
      
    }
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
    if($("#emr_id").val() == ""){
      $("#emr_id").focus();
      return toastr.info('Please enter EMR ID');
    }
    if($("#dob").val() == ""){
      return toastr.info('Please enter DOB');
    }

  

     
  
    let entry = {
      user_id:localStorage.getItem('userid'),
      clinicid:localStorage.getItem('chosen_clinic'),
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
      city: $("#city option:selected").text(),
      zip: document.getElementById('zip').value,
      state: document.getElementById('state').value,
      race: document.getElementById('race').value,
      marital: document.getElementById('marital').value,
      deceased: $('#deceased').is(":checked")?"1":"0",
      deceased_at: document.getElementById('deceased_at').value,
    }

    sendRequestWithToken('POST', localStorage.getItem('authToken'), { emr_id: document.getElementById('emr_id').value }, "patientlist/get", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length>0){
          return toastr.info('Patient exist');
        }else{
          sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/add", (xhr, err) => {
            if (!err) {
              $("#patient-add-modal").modal("toggle");
              
              loadData(1);
              return toastr.success('patient is added successfully');
            } else {
              return toastr.error('Action Failed');
            }
        });
        }
       
      }
    });

  });
  
});
let changed = function(instance, cell, x, y, value) {
  var cellName = jexcel.getColumnNameFromId([0,y]);
  var id = $('#ptreport').jexcel('getValue',cellName);
  var key = $('#ptreport').jexcel('getHeader',x);
  let entry = {
    user_id:localStorage.getItem('userid'),
    clinicid:localStorage.getItem('chosen_clinic'),
    id:id,
    key:key,
    value:value,
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/setValue", (xhr, err) => {
    if (!err) {
      
    } else {
      return toastr.error('Action Failed');
      
    }
  });
  
}

var total = 1;
var size = 50;
var page = 1;
var pageSize = 0;

async function loadData(page){
  ptdata = [];
  let entry = {
    clinicid:localStorage.getItem('chosen_clinic'),
    flag:newflag,
    page: page,
    size: size,
    searchText: $("#search_jexcel").val()
  }
  let tmpdate = null;
  $(".progress-load").removeClass("d-none");
  setClinicTotalPatients();

  await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/getDataByPage", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data']['data'];
      total = JSON.parse(xhr.responseText)['data']['total'];
      pageSize = parseInt(total/size)+1;
      for(var i=0;i<data.length;i++){
        if(data[i]['DOB']==""||data[i]['DOB']==null){
          tmpdate = null;
        }
        else{
          tmpdate = deDateFormat(new Date(data[i]['DOB']));
        }
        if(data[i]['Deceased_at']==""||data[i]['Deceased_at']==null){
          deceasedDate = null;
        }
        else{
          deceasedDate = deDateFormat(new Date(data[i]['Deceased_at']));
        }
        var tmpdata = [
          data[i]['id'],
          (data[i]['patientid']!=0&&data[i]['patientid']!="")?data[i]['patientid']:null, 
          data[i]['FNAME'],
          data[i]['LNAME'], 
          (data[i]['GENDER']==null?"":(data[i]['GENDER'].toLowerCase()=="male")?"Male":(data[i]['GENDER'].toLowerCase()=="female"?"Female":"")), 
          tmpdate, 
          data[i]['PHONE'], 
          data[i]['MOBILE'], 
          data[i]['EMAIL'], 
          data[i]['ADDRESS'], 
          data[i]['CITY'], 
          data[i]['ZIP'], 
          data[i]['Language'], 
          deceasedDate, 
          // "<i class='fa fa-trash  deletebtn' style='color:red' data-index='"+i+"' data-id='"+data[i]['id']+"'  data-toggle='tooltip' title='delete'></i>"
        ];
        ptdata.push(tmpdata);
      }
      $("#ptreport").empty();
      jexcel(document.getElementById('ptreport'), {
        data:ptdata,
        // search: true,
        columns: [
          {
            type: 'hidden',
            title:'ID',
            width:50
          },
          {
              type: 'text',
              title:'EMR ID',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'FNAME',
              readOnly:write?false:true,
              width:100
          },
          {
              type: 'text',
              title:'LNAME',
              readOnly:write?false:true,
              width:100
          },
          {
              type: 'dropdown',
              title:'GENDER',
              readOnly:write?false:true,
              width:100,
              source:[
                  "Male",
                  "Female",
              ]
          },
          {
              type: 'calendar',
              title:'DOB',
              readOnly:write?false:true,
              options: { format:'MM/DD/YYYY'},
              width:100
          },
          {
              type: 'text',
              title:'PHONE',
              readOnly:write?false:true,
              width:100
          },
          {
              type: 'text',
              title:'MOBILE',
              readOnly:write?false:true,
              width:80
          },
          {
              type: 'text',
              title:'EMAIL',
              readOnly:write?false:true,
              width:100
          },
          
          {
              type: 'text',
              title:'ADDRESS',
              readOnly:write?false:true,
              width:150
          },
          {
              type: 'text',
              title:'CITY',
              readOnly:write?false:true,
              width:100
          },
          {
              type: 'text',
              title:'ZIP',
              readOnly:write?false:true,
              width:100
          },
          {
            type: 'text',
            title:'LANGUAGE',
            readOnly:write?false:true,
              width:80
          },
          {
            type: 'calendar',
            readOnly:true,
            title:'DECEASED',
            options: { format:'MM/DD/YYYY', popover: true},
            width:80
          },
          // {
          //     type: 'html',
          //     title:'Action',
          //     readOnly:true,
          //     width:50
          // }
        ],
        filters: true,
        allowComments:true,
        onchange: changed
      });
      $(".progress-load").addClass("d-none");
      
      Pagination.Init(document.getElementById('pagination'), {
          size: pageSize, // pages size
          page: page,  // selected page
          step: 3   // pages before and after current
      });
      var end = (page-1)*size+50;
      if(end > total ) end = total;
      $("#jexcel_details").html("Showing "+((page-1)*size+1)+" to "+end+"  of "+total+" records");
    
    } else {
      return toastr.error('Action Failed');
    }
  });
}


$(document).on("click",".page-link",function(){
  if($(this).data('page')=='prev'){
    page = parseInt(page)-1;
    if(page<1)page=1;
    loadData(page)
  }else if($(this).data('page')=='next'){
    page = parseInt(page)+1;
    if(page>pageSize)page=pageSize;
    loadData(page)
  }else{
    page = $(this).data('page');
    loadData(page)
  }
  
});

var last_time = new Date().getTime();
function debounce(func, timeout = 1000){
  var timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

$(document).on("keyup","#search_jexcel",function(){
  var now = new Date().getTime();
  if(now>last_time+1000){
    last_time = new Date().getTime();
    debounce(loadData(1));
  }
  
});


$(document).on("click",".patient_add_btn",function(){

    $("#fname").val('');
    $("#mname").val('');
    $("#lname").val('');
    $("#emr_id").val('');
    $("#dob").val('');
    $("#phone").val('');
    $("#mobile").val('');
    $("#address").val('');
    $("#zip").val('');
    $("#state").val('');
    $("#race").val('');
    $("#marital").val('');
    $('#deceased').prop('checked', false);
    $("#deceased_at").prop("disabled", true);
    $("#patient-add-modal").modal("show");

});





$(document).on("click","#deceased",function(){
  if($(this).is(":checked")){
    $("#deceased_at").prop("disabled", false);
  }else{
    $("#deceased_at").prop("disabled", true);
  }
});



$(document).on("click",".deletebtn",function(){
  let entry = {
    id: $(this).data("id"),
    
  }
  var index = $(this).parent().data("y")
  swal({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }, function(inputValue) {

      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/delete", (xhr, err) => {
        if (!err) {
          console.log(index);
          $('#ptreport').jexcel('deleteRow', index);
        } else {
          return toastr.error('Action Failed');
        }
      });

  });
});
