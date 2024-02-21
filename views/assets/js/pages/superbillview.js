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
$(document).ready(async function () {
  "use strict";

  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".clinic-title").html(result['clinic']);
      $(".clinic-addr").html(result['address']+" "+result['city']+" "+result['state']+" "+result['zip']+" "+result['phone']);
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "paid/getdesc", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".paid-desc").html(result[0]['desc']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(".printbtn").click(function(){
    window.print()
  })
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html(),ins:$("#ins").val(),spec:$("#spec").val(),type:$("#type").val()}, "paid/getsuperbill", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      let nogroup = JSON.parse(xhr.responseText)['nogroup'];
      let tmpcode = JSON.parse(xhr.responseText)['tmpcode'];
      var tmpname = "";
      var tmpsubname = "";
      var tmpcpt = "";
      var tmpmiscpt = "";
      var tmpcnt = 0;
      for(var i = 0;i < result.length;i++){
        if(tmpname == result[i]['name']){
          if(tmpsubname == result[i]['subname']){
            if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
              $("#"+tmpcnt+"_description").append(`
                <p class="cpt-desc"><span class='blue-color'>${result[i]['CPT']}</span> - ${result[i]['CPT_DESC']} - ${result[i]['ICD']} - $${result[i]['max']}</p>
              `);
            }
            else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'])){
              $("#"+tmpcnt+"_description").append(`
                <p class="cpt-desc"><span class='red-color'>${result[i]['CPT']}</span> - ${result[i]['CPT_DESC']} - ${result[i]['ICD']} - $${result[i]['max']} <span class='red-color'>`+result[i]['clinicname']+`</span></p>
              `);
            }
          }
          else{
            $("#"+tmpcnt+"_description").append(`
              <h6 class="card-subtitle mb-2 text-green">`+(result[i]['subname']==null?"":result[i]['subname'])+`</h6>
            `);
            if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
              $("#"+tmpcnt+"_description").append(`
                <p class="cpt-desc"><span class='blue-color'>${result[i]['CPT']}</span> - ${result[i]['CPT_DESC']} - ${result[i]['ICD']} - $${result[i]['max']}</p>
              `);
            }
            else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'])){
              $("#"+tmpcnt+"_description").append(`
                <p class="cpt-desc"><span class='red-color'>${result[i]['CPT']}</span> - ${result[i]['CPT_DESC']} - ${result[i]['ICD']} - $${result[i]['max']} <span class='red-color'>`+result[i]['clinicname']+`</span></p>
              `);
            }
            tmpsubname = result[i]['subname'];
          }
        }
        else{
          tmpcnt++;
          $("#main_area").append(`
            <div class="item grid-item">
              <h5 class="card-title">`+result[i]['name']+`</h5>
              <h6 class="card-subtitle mb-2 text-green">`+(result[i]['subname']==null?"":result[i]['subname'])+`</h6>
              <p class="card-text" id="`+tmpcnt+`_description"></p>
            </div>
          `);
          if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
            $("#"+tmpcnt+"_description").append(`
              <p class="cpt-desc"><span class='blue-color'>${result[i]['CPT']}</span> - ${result[i]['CPT_DESC']} - ${result[i]['ICD']} - $${result[i]['max']}</p>
            `);
          }
          else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'])){
            $("#"+tmpcnt+"_description").append(`
              <p class="cpt-desc"><span class='red-color'>${result[i]['CPT']}</span> - ${result[i]['CPT_DESC']} - ${result[i]['ICD']} - $${result[i]['max']} <span class='red-color'>${result[i]['clinicname']}</span></p>
            `);
          }
          tmpname = result[i]['name'];
          tmpsubname = result[i]['subname'];
          tmpcpt = result[i]['CPT'];
        }
      }
      if(nogroup.length > 0){
        $("#main_area").append(`
          <div class="item grid-item">
              <h5 class="card-title">Miscellaneous</h5>
              <p class="card-text" id="mis_description"></p>
          </div>
        `);
        for(var i = 0;i < nogroup.length;i++){
          if(nogroup[i]['clinicid']==localStorage.getItem('chosen_clinic')){
            $("#mis_description").append(`
              <p class="cpt-desc"><span class='blue-color'>${nogroup[i]['CPT']}</span> - ${nogroup[i]['CPT_DESC']} - ${nogroup[i]['ICD']} - $${nogroup[i]['max']}</p>
            `);
          }
          else if(nogroup[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(nogroup[i]['CPT'])){
            $("#mis_description").append(`
              <p class="cpt-desc"><span class='red-color'>`+nogroup[i]['CPT']+`</span> - ${nogroup[i]['CPT_DESC']} - ${nogroup[i]['ICD']} - $${nogroup[i]['max']} <span class='red-color'>`+nogroup[i]['clinicname']+`</span></p>
            `);
          }
        }
      }
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
});
