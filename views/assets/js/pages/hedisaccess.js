function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " Hr, " : " Hrs, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " Min, " : " Mins ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay; 
}
$(document).ready(async function () {
  "use strict";
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").val(),edate:$("#edate").val()}, "hedis/gethedisreport", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      let total = JSON.parse(xhr.responseText)['total'];
      let notes = JSON.parse(xhr.responseText)['notes'];
      let sms = JSON.parse(xhr.responseText)['sms'];
      var itemid = "";
      $("#accordion").empty();
      for(var i = 0;i < result.length;i++){
        if(typeof result[i-1] != "undefined" && result[i]['userid'] == result[i-1]['userid']){
          if(result[i]['insid'] == result[i-1]['insid']){
            $("#"+result[i]['userid']+"_item_"+result[i]['insid']+"_ins").append(`
              <p class="mb-0 text-muted">${result[i]['name']} (${result[i]['total']})</p>
            `);
          }
          else{
            $("#"+result[i]['userid']+"_item").append(`
              <div class="col-auto ">
                <div class="card-body h-100 p-2">
                    <h4 class="mb-1 mt-2 number-font text-primary"><span class="counter">${result[i]['insName']}</span></h4>
                    <div id="${result[i]['userid']}_item_${result[i]['insid']}_ins" >
                      <p class="mb-0 text-muted">${result[i]['name']} (${result[i]['total']})</p>
                    </div>
                    <div class="mt-3 text-primary border-top total-area pt-3">
                      <p class="mb-0">Notes: <span id="${result[i]['userid']}_${result[i]['insid']}_notes">0</span></p>
                      <p class="mb-0">SMS: <span id="${result[i]['userid']}_${result[i]['insid']}_sms">0</span></p>
                    </div>
                </div>
              </div>
            `);
          }
        }
        else{
          itemid = result[i]['userid']+"_item";
          $("#accordion").append(`
            <div class="panel panel-default">
              <div class="panel-heading" role="tab" id="headingOne${i}">
                  <h4 class="panel-title">
                      <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne${i}" aria-expanded="false" aria-controls="collapseOne" class="collapsed">${result[i]['fname']} ${result[i]['lname']} (${secondsToHms(result[i]['totaltime'])})</a>
                  </h4>
              </div>
              <div id="collapseOne${i}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne${i}">
                  <div class="panel-body">
                      <div class="row" id="${itemid}">
                          <div class="col-auto ">
                              <div class="card-body h-100 p-2">
                                  <h4 class="mb-1 mt-2 number-font text-primary"><span class="counter">${result[i]['insName']}</span></h4>
                                  <div id="${itemid}_${result[i]['insid']}_ins" >
                                    <p class="mb-0 text-muted">${result[i]['name']} (${result[i]['total']})</p>
                                  </div>
                                  <div class="mt-3 text-primary border-top total-area pt-3">
                                    <p class="mb-0">Notes: <span id="${result[i]['userid']}_${result[i]['insid']}_notes">0</span></p>
                                    <p class="mb-0">SMS: <span id="${result[i]['userid']}_${result[i]['insid']}_sms">0</span></p>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <button class="btn btn-sm btn-primary viewaccessbtn" key="${result[i]['userid']}">View Detail</button>
                  </div>
              </div>
            </div>
          `);
        }
      }
      Object.entries(total).forEach(([key, value]) => {
        $("#"+key+"_item").prepend(`
          <div class="col-auto ">
            <div class="card-body h-100 p-2">
                <h4 class="mb-1 mt-2 number-font text-primary"><span class="counter">Totals</span></h4>
                <div id="${key}_total" >
                </div>
                <div class="mt-3 text-primary border-top total-area pt-3">
                  <p class="mb-0">Notes: <span id="${key}_notes">0</span></p>
                  <p class="mb-0">SMS: <span id="${key}_sms">0</span></p>
                </div>
            </div>
          </div>
        `);
        Object.entries(value).forEach(([key1, value1]) => {
          $("#"+key+"_total").append(`
            <p class="mb-0 text-success">${key1} (${value1})</p>
          `);
        });
      });
      let tmpnotes = {};
      let tmpsms = {};
      for(var i = 0;i < notes.length;i++){
        if(typeof notes[i-1] != "undefined" && notes[i]['userid'] == notes[i-1]['userid']){
          tmpnotes[notes[i]['userid']] += notes[i]['total'];
        }
        else{
          tmpnotes[notes[i]['userid']] = notes[i]['total'];
        }
        $("#"+notes[i]['userid']+"_"+notes[i]['insid']+"_notes").html(notes[i]['total']);
      }
      for(var i = 0;i < sms.length;i++){
        if(typeof sms[i-1] != "undefined" && sms[i]['userid'] == sms[i-1]['userid']){
          tmpsms[sms[i]['userid']] += sms[i]['total'];
        }
        else{
          tmpsms[sms[i]['userid']] = sms[i]['total'];
        }
        $("#"+sms[i]['userid']+"_"+sms[i]['insid']+"_sms").html(sms[i]['total']);
      }
      Object.entries(tmpnotes).forEach(([key, value]) => {
        $("#"+key+"_notes").html(value);
      });
      Object.entries(tmpsms).forEach(([key, value]) => {
        $("#"+key+"_sms").html(value);
      });
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(document).on("click",".viewaccessbtn",function(){
    $("body").append("<form id = 'hedisaccessdetailform' action = '../pages/accessdetail' method = 'POST' target='_blank'><input type='hidden' name='userid' value='"+$(this).attr("key")+"' /><input type='hidden' name='sdate' value='"+$("#sdate").val()+"' /><input type='hidden' name='edate' value='"+$("#edate").val()+"' /></form>");
    $("#hedisaccessdetailform").submit();
    $("#hedisaccessdetailform").remove();
  });
});
