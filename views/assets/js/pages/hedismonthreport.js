$(document).ready(function () {
  "use strict";
  $(".cmonthtitle").html(new Date().toLocaleString('default', { month: 'long' })+" "+new Date().getFullYear())
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val()}, "hedis/setmonthdata", (xhr, err) => {
        if (!err) {
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val()}, "hedis/getmonthdata", (xhr, err) => {
            if (!err) {
              let result = JSON.parse(xhr.responseText)['data'];
              var tmpinsname = "",tmpdomain = "",tmpmeasure = "",tmpcnttb = 0;
              for(var i = 0;i < result.length;i++){
                if(tmpinsname != result[i].insName){ 
                  tmpcnttb++;
                  $("#report_tb").append(`<div class="col-md-6 table-responsive">
                  <h4 style="margin-bottom:10px;margin-top:10px;">`+result[i]['insName']+" - " +new Date().toLocaleString('default', { month: 'long' })+" "+new Date().getFullYear()+`</h4>
                  <table class="table table-bordered" id="`+tmpcnttb+`_tb">
                      <thead>
                          <tr class="">
                              <th>Measure</th>
                              <th>Denominator</th>
                              <th>Numerator</th>
                              <th>Missing</th>
                              <th>Completed</th>
                          </tr>
                      </thead>
                      <tbody></tbody></table></div>
                      `);
                  tmpinsname = result[i].insName
                }
                if(tmpdomain == result[i].domain){
                    if(tmpmeasure == result[i].measure){
                      $("#"+tmpcnttb+"_tb tbody").append(`
                        <tr>
                          <td class="gray-color" style = "width:400px;text-align: right;">`+new Date(result[i].created).toLocaleString('default', { month: 'long' })+` `+new Date(result[i].created).getFullYear()+`</td>
                          <td class="gray-color">${result[i]['denominator']}</td>
                          <td class="gray-color">${result[i]['numerator']}</td>
                          <td class="gray-color">${result[i]['missing']}</td>
                          <td class="gray-color">${result[i]['percentage']}%</td>
                        </tr>
                        `);
                    }else{
                      $("#"+tmpcnttb+"_tb tbody").append(`
                        <tr class="current-data">
                          <td>${result[i]['measure']}</td>
                          <td><a href='../pages/hedisreport?insid=${result[i]['insid']}&m=${btoa(unescape(encodeURIComponent(result[i]['measure'])))}&check=1' target='_blank'>${result[i]['denominator']}</a></td>
                          <td><a href='../pages/hedisreport?insid=${result[i]['insid']}&m=${btoa(unescape(encodeURIComponent(result[i]['measure'])))}&check=2' target='_blank'>${result[i]['numerator']}</a></td>
                          <td><a href='../pages/hedisreport?insid=${result[i]['insid']}&m=${btoa(unescape(encodeURIComponent(result[i]['measure'])))}&check=3' target='_blank'>${result[i]['missing']}</a></td>
                          <td>${result[i]['percentage']}%</td>
                        </tr>
                      `);
                      tmpmeasure = result[i].measure
                    }
                }else{
                  $("#"+tmpcnttb+"_tb tbody").append(`
                    <tr>
                      <td class="domain-title">`+result[i]['domain']+`</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr class="current-data">
                        <td>${result[i]['measure']}</td>
                        <td><a href='../pages/hedisreport?insid=${result[i]['insid']}&m=${btoa(unescape(encodeURIComponent(result[i]['measure'])))}&check=1' target='_blank'>${result[i]['denominator']}</a></td>
                        <td><a href='../pages/hedisreport?insid=${result[i]['insid']}&m=${btoa(unescape(encodeURIComponent(result[i]['measure'])))}&check=2' target='_blank'>${result[i]['numerator']}</a></td>
                        <td><a href='../pages/hedisreport?insid=${result[i]['insid']}&m=${btoa(unescape(encodeURIComponent(result[i]['measure'])))}&check=3' target='_blank'>${result[i]['missing']}</a></td>
                        <td>${result[i]['percentage']}%</td>
                    </tr>`);
                  tmpdomain = result[i].domain
                  tmpmeasure = result[i].measure
                }
              }
            } else {
              return $.growl.error({
                message: "Action Failed"
              });
            }
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val()}, "hedis/setmonthdataptstatus", (xhr, err) => {
        if (!err) {
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val()}, "hedis/getmonthdataptstatus", (xhr, err) => {
            if (!err) {
              let result = JSON.parse(xhr.responseText)['data'];
              var tmpins = "";
              var tmpcnt = 0;
              $("#status_tb tbody").empty();
              for(var i = 0;i < result.length;i++){
                if(tmpins == result[i]['insName']){
                  if(result[i]['status'] == 5) $("#"+tmpcnt+"_tr").children().eq(1).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 7) $("#"+tmpcnt+"_tr").children().eq(2).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 4) $("#"+tmpcnt+"_tr").children().eq(3).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 6) $("#"+tmpcnt+"_tr").children().eq(4).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 10) $("#"+tmpcnt+"_tr").children().eq(5).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                }
                else{
                  tmpcnt++;
                  $("#status_tb tbody").append(`
                    <tr id='${tmpcnt}_tr'>
                      <td>${result[i]['insName']}</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                  `);
                  if(result[i]['status'] == 5) $("#"+tmpcnt+"_tr").children().eq(1).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 7) $("#"+tmpcnt+"_tr").children().eq(2).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 4) $("#"+tmpcnt+"_tr").children().eq(3).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 6) $("#"+tmpcnt+"_tr").children().eq(4).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  if(result[i]['status'] == 10) $("#"+tmpcnt+"_tr").children().eq(5).html("<a href='../pages/hedisreport?insid="+result[i]['insid']+"&status="+result[i]['status']+"' target='_blank'>"+result[i]['count']+"</a>")
                  tmpins = result[i]['insName'];
                }
              }
            } else {
              return $.growl.error({
                message: "Action Failed"
              });
            }
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(document).on("click",".monthreportbtn",function(){
    $("body").append("<form id = 'monthreportform' action = '"+serviceUrl+"hedis/monthreport' method = 'POST' target='_blank'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /></form>");
    $("#monthreportform").submit();
    $("#monthreportform").remove();
  });
  $(document).on("click",".monthemailbtn",function(){
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val()}, "hedis/monthemail", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText);
            if(result['message'] == "success")
              return $.growl.notice({
                message: "Sent Successfully"
              });
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });
});
