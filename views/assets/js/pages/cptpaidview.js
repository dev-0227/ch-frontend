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
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getcptsbyins", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var tmpcnt = 0;
      var tmpvisit = 0;
      var tmpins = "";
      var tmpamount = "";
      for(var i = 0;i < result.length;i++){
        if(tmpins == result[i]['InsName']){
          if(tmpamount == result[i]['amount']){
            var tmpvisits = result[i]['visittype'].split(",");
            tmpvisits = [...new Set(tmpvisits)];
            var tmptext = "";
            for(var j = 0;j < tmpvisits.length;j++){
              tmptext += "<span class='tag tag-blue'>"+tmpvisits[j].trim()+"</span>";
            }
            $("#"+tmpcnt+"_table tbody td span#"+tmpvisit+"_visits").append(tmptext);
          }
          else{
            tmpvisit++;
            var tmpvisits = result[i]['visittype'].split(",");
            tmpvisits = [...new Set(tmpvisits)];
            var tmptext = "";
            for(var j = 0;j < tmpvisits.length;j++){
              tmptext += "<span class='tag tag-blue'>"+tmpvisits[j].trim()+"</span>";
            }
            $("#"+tmpcnt+"_table tbody").append(`
              <tr>
                <td><span class="blue-color">`+result[i]['CPT']+`</span></td>
                <td>`+result[i]['CPT_DESC']+`</td>
                <td>$`+result[i]['amount']+`</td>
                <td><span id='`+tmpvisit+`_visits'>`+tmptext+`</span></td>
              </tr>
            `);
            tmpamount = result[i]['amount'];
          }
        }
        else{
          tmpcnt++;
          $("#main_area").append(`
            <p class="ins-title">`+(result[i]['InsName']=="zzzname"?"Unknown Ins":result[i]['InsName'])+`</p>
            <table class="table table-striped table-bordered" id="`+tmpcnt+`_table">
              <thead>
                  <th style="width:80px!important;">CPT</th>
                  <th style="width:250px!important;">Description</th>
                  <th style="width:150px!important;">Paid Individual</th>
                  <th>Visit Claim Detail</th>
              </thead>
              <tbody></tbody>
            </table>
          `);
          if(tmpamount == result[i]['amount']){
            var tmpvisits = result[i]['visittype'].split(",");
            tmpvisits = [...new Set(tmpvisits)];
            var tmptext = "";
            for(var j = 0;j < tmpvisits.length;j++){
              tmptext += "<span class='tag tag-blue'>"+tmpvisits[j].trim()+"</span>";
            }
            $("#"+tmpcnt+"_table tbody td span#"+tmpvisit+"_visits").append(tmptext);
          }
          else{
            tmpvisit++;
            var tmpvisits = result[i]['visittype'].split(",");
            tmpvisits = [...new Set(tmpvisits)];
            var tmptext = "";
            for(var j = 0;j < tmpvisits.length;j++){
              tmptext += "<span class='tag tag-blue'>"+tmpvisits[j].trim()+"</span>";
            }
            $("#"+tmpcnt+"_table tbody").append(`
              <tr>
                <td><span class="blue-color">`+result[i]['CPT']+`</span></td>
                <td>`+result[i]['CPT_DESC']+`</td>
                <td>$`+result[i]['amount']+`</td>
                <td><span id='`+tmpvisit+`_visits'>`+tmptext+`</span></td>
              </tr>
            `);
            tmpamount = result[i]['amount'];
          }
          tmpins = result[i]['InsName'];
        }
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(".printbtn").click(function(){
    window.print()
  })
});
