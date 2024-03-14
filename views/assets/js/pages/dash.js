$(document).ready(function () {
  "use strict";
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
      let getinsentry = {
        clinicid:localStorage.getItem('chosen_clinic'),
        cyear:$("#hedisdate").val(),
      }
      // sendRequestWithToken('POST', localStorage.getItem('authToken'), getinsentry, "hedis/getinsheislist", (xhr, err) => {
      //   if (!err) {
      //     let result = JSON.parse(xhr.responseText)['data'];
      //     $(".insurance_tab_list").empty();
      //     $("#tmpinsid").val(result[0]['insid']);
      //     for(var i = 0;i < result.length;i++){
      //       $(".insurance_tab_list").append(`
      //         <li inskey = "`+result[i]['insid']+`"><a href="#`+result[i]['insName'].replaceAll(" ","_")+`_tab" class="`+(i==0?"active":"")+`" data-toggle="tab">`+result[i]['insName']+`</a></li>
      //       `);
      //     }
      //     loadinschart();
      //   } else {
      //     return $.growl.warning({
      //       message: "Action Failed"
      //     });
      //   }
      // });
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(document).on("click",".insurance_tab_list li",function(){
    $("#tmpinsid").val($(this).attr("inskey"));
    loadinschart();
  });
});
async function loadinschart(){
  let getdata = {
    clinicid:localStorage.getItem('chosen_clinic'),
    cyear:$("#hedisdate").val(),
    insid:$("#tmpinsid").val()
  }
  $("#global-loader").css({"display":"block"});
  sendRequestWithToken('POST', localStorage.getItem('authToken'), getdata, "hedis/gethedisdashdata", (xhr, err) => {
    if (!err) {
      $("#global-loader").css({"display":"none"});
      let result = JSON.parse(xhr.responseText)['data'];
      $("#chart_area").empty();
      let tmpcnt = 0;
      for (const [key, value] of Object.entries(result)) {
        tmpcnt++;
        $("#chart_area").append(`
          <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">`+key+`</h3>
                </div>
                <div class="card-body p-6" id="domain`+tmpcnt+`">
                    
                </div>
            </div>
          </div>
        `);
        let tmpcnt1 = 0;
        for (const [key1, value] of Object.entries(result[key])) {
          tmpcnt1++;
          $("#domain"+tmpcnt).append(`
            <div class="row">
              <div class="col-md-4" style="display:flex;align-items:center">`+key1+`</div>
              <div class="col-md-4">
                  <a href="../pages/hedisreport?insid=${$("#tmpinsid").val()}&m=${btoa(unescape(encodeURIComponent(key1)))}&check=2" target="_blank"><div class="mt-3 text-center">
                      <div class="completedbarlengthnote chart-circle mx-auto chart-dropshadow-success `+tmpcnt+`_done`+tmpcnt1+`" data-value="" data-thickness="7" data-color="#33ce7b"><div class="chart-circle-value"><div class="font-weight-normal fs-20">`+(Math.round(result[key][key1].done/(result[key][key1].done+result[key][key1].notdone)*100)+"%")+`</div></div></div>
                  </div></a>
              </div>
              <div class="col-md-4">
                  <a href="../pages/hedisreport?insid=${$("#tmpinsid").val()}&m=${btoa(unescape(encodeURIComponent(key1)))}&check=3" target="_blank"><div class="mt-3 text-center">
                      <div class="notcompletedbarlengthnote chart-circle mx-auto chart-dropshadow-info `+tmpcnt+`_notdone`+tmpcnt1+`" data-value="" data-thickness="7" data-color="#f82649"><div class="chart-circle-value"><div class="font-weight-normal fs-20">`+(Math.round(result[key][key1].notdone/(result[key][key1].done+result[key][key1].notdone)*100)+"%")+`</div></div></div>
                  </div></a>
              </div>
            </div>
          `);
          $("."+tmpcnt+"_done"+tmpcnt1).circleProgress({value: (Math.round(result[key][key1].done/(result[key][key1].done+result[key][key1].notdone)*100)/100),fill: {color: ["#33ce7b"]},startAngle: -Math.PI / 4 * 2,lineCap: 'round'});
          $("."+tmpcnt+"_notdone"+tmpcnt1).circleProgress({value: ((1-Math.round(result[key][key1].done/(result[key][key1].done+result[key][key1].notdone)*100)/100)),fill: {color: ["#f82649"]},startAngle: -Math.PI / 4 * 2,lineCap: 'round'});
        };
      };
    } else {
      return $.growl.warning({
        message: "Action Failed"
      });
    }
  });
}
