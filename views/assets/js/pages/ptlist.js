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
$(document).ready(async function () {
  "use strict";
  let flagparam = getUrlVars();
  if(flagparam['s'] == 1){
    newflag = 1;
    $(".totalflag").addClass('d-none')
  }
  else{
    newflag = 0;
  }
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "patientlist/getTotal", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data'];
      $(".totalcount").html(data[0]['total'])
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".pt-title").html(result['clinic']+" | "+(newflag == 1?"New ":"")+" Patient List");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  loadData()
});
let changed = function(instance, cell, x, y, value) {
  var cellName = jexcel.getColumnNameFromId([0,y]);
  var id = $('#ptreport').jexcel('getValue',cellName);
  var key = $('#ptreport').jexcel('getHeader',x);
  let entry = {
    id:id,
    key:key,
    value:value,
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/setValue", (xhr, err) => {
    if (!err) {
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  
}
async function loadData(){
  ptdata = [];
  let entry = {
    clinicid:localStorage.getItem('chosen_clinic'),
    flag:newflag,
  }
  let tmpdate = null;
  $(".progress-load").removeClass("d-none");
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "patientlist/getData", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data'];
      let tmpgender =''
      for(var i=0;i<data.length;i++){
        if(data[i]['DOB']==""||data[i]['DOB']==null){
          tmpdate = null;
        }
        else{
          tmpdate = deDateFormat(new Date(data[i]['DOB']));
        }
        if(data[i]['GENDER'] == null){
          tmpgender = ''
        }else{
          tmpgender = (data[i]['GENDER'].toLowerCase()=="male")?"Male":(data[i]['GENDER'].toLowerCase()=="female"?"Female":"")
        }
        var tmpdata = [
          data[i]['id'],
          (data[i]['patientid']!=0&&data[i]['patientid']!="")?data[i]['patientid']:null, 
          data[i]['FNAME'],
          data[i]['LNAME'], 
          tmpgender, 
          tmpdate, 
          data[i]['PHONE'], 
          data[i]['MOBILE'], 
          data[i]['EMAIL'], 
          data[i]['ADDRESS'], 
          data[i]['CITY'], 
          data[i]['ZIP'], 
          "<i class='fa fa-trash deletebtn'></i>"
        ];
        ptdata.push(tmpdata);
      }
      $("#ptreport").empty();
      jexcel(document.getElementById('ptreport'), {
        data:ptdata,
        search:true,
        pagination: 50,
        paginationOptions: [10,25,50,100],
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
              width:100
          },
          {
              type: 'text',
              title:'LNAME',
              width:100
          },
          {
              type: 'dropdown',
              title:'GENDER',
              width:100,
              source:[
                  "Male",
                  "Female",
              ]
          },
          {
              type: 'calendar',
              title:'DOB',
              options: { format:'MM/DD/YYYY'},
              width:100
          },
          {
              type: 'text',
              title:'PHONE',
              width:100
          },
          {
              type: 'text',
              title:'MOBILE',
              width:80
          },
          {
              type: 'text',
              title:'EMAIL',
              width:100
          },
          
          {
              type: 'text',
              title:'ADDRESS',
              width:150
          },
          {
              type: 'text',
              title:'CITY',
              width:100
          },
          {
              type: 'text',
              title:'ZIP',
              width:100
          },
          {
              type: 'html',
              title:'Action',
              readOnly:true,
              width:50
          }
        ],
        filters: true,
        allowComments:true,
        onchange: changed
      });
      $(".progress-load").addClass("d-none");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
