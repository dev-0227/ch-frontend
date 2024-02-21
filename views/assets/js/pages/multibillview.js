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
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
function exportTableToExcel(tableID, filename = ''){
  let tableData = document.getElementById(tableID).outerHTML;
    //tableData = tableData.replace(/<img[^>]*>/gi,""); //enable thsi if u dont want images in your table
	tableData = tableData.replace(/<A[^>]*>|<\/A>/g, ""); //remove if u want links in your table
    tableData = tableData.replace(/<input[^>]*>|<\/input>/gi, ""); //remove input params
  let tmptable = `
    <table>
      <thead><th colspan='5'>${filename} Color Description</th></thead>
      <tbody>
        <tr>
          <td bgcolor='#ceeaf5'>Group Name</td>
          <td bgcolor='#dcf9ed'>Subgroup Name</td>
          <td bgcolor='#f39fcb'>Other Clinic CPT Code</td>
          <td bgcolor='#ddf9c6'>Paid By ${filename}</td>
          <td bgcolor='#fbecbc'>Paid By Other Clinics</td>
        </tr>
      </tbody>
    </table>
  `;
	tableData = '<br />'+tmptable+'<br />'+tableData

	//click a hidden link to which will prompt for download.
	let a = document.createElement('a')
	let dataType = 'data:application/vnd.ms-excel';
	a.href = `data:application/vnd.ms-excel, ${encodeURIComponent(tableData)}`
	a.download = filename + '.xls'
	a.click()
}
$(document).ready(function () {
  "use strict";
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".clinic-name").html(result['clinic']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "ffs/getins", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#ins-area").empty();
      $("#ins-area").append("<option value = '0'>All Insurances</option>");
      for(var i = 0; i < result.length; i++){
        $("#ins-area").append(`
            <option value = "`+result[i]['InsName']+`">`+(result[i]['InsName']=="zzzname"?"Unknown":result[i]['InsName'])+`</option>
        `);
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  loadData();
  $(".exportexcelbtn").click(function(){
    exportTableToExcel('multibilltable', $(".clinic-name").html());
  });
});
async function loadData(){
  let entry = {
    clinicid:localStorage.getItem('chosen_clinic'),
    sdate:$("#sdate").html(),
    edate:$("#edate").html(),
  }
  $(".progress-load").removeClass("d-none");
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "ffs/getmultibill", (xhr, err) => {
    if (!err) {
      let ins = JSON.parse(xhr.responseText)['ins'];
      let result = JSON.parse(xhr.responseText)['data'];
      let nogroup = JSON.parse(xhr.responseText)['nogroup'];
      let tmpcode = JSON.parse(xhr.responseText)['tmpcode'];
      var tmpcnt = 0;
      var tmplcnt = 0;
      var tmpname = "";
      var tmpsubname = "";
      var tmpcpt = "";
      $("#multibilltable thead").empty();
      $("#multibilltable thead").append(`<th class="fixed-side" border="1" align="left"><span>Codes</span></th><th border="1" align="left"><span>Description</span></th>`);
      for(var i = 0;i < ins.length;i++){
        $("#multibilltable thead").append(`<th border="1" align="left"><span>${ins[i]=="zzzname"?"Unknown":ins[i]}</span></th>`);
      }
      $("#multibilltable tbody").empty();
      for(var i = 0;i < result.length;i++){
        if(tmpname == result[i]['name']){
          if(tmpsubname == result[i]['subname']){
            if(tmpcpt == result[i]['CPT'].trim()){
              tmplcnt = getKeyByValue(ins,result[i]['InsName']);
              if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
                $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
                $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#ddf9c6");
              }
              else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'].trim())){
                $("#"+tmpcnt+"_tr[class='othercode']").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
                $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#fbecbc");
              }
            }
            else{
              tmpcnt++;
              if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
                var owncode = 1;
              }
              else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'].trim())){
                var owncode = 0;
              }
              else{
                var owncode = 1;
              }
              $("#multibilltable tbody").append(`
                <tr id="${tmpcnt}_tr" class="${owncode==1?"":"othercode"}"><td border="1" align="left" class="fixed-side ${owncode==1?"text-primary":"red-mark"}" ${owncode==1?"":"bgcolor='#f39fcb'"}>${result[i]['CPT'].trim()}</td><td border="1" class="cpt_desc fixed-side2">${result[i]['CPT_DESC']==null?"":result[i]['CPT_DESC']}</td></tr>
              `);
              for(var j = 0;j < ins.length;j++){
                $("#"+tmpcnt+"_tr").append(`<td border="1"><span class="pink-mark"><i class="fa fa-frown-o" aria-hidden="true"></i></span></td>`);
              }
              tmplcnt = getKeyByValue(ins,result[i]['InsName']);
              if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
                $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
                $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#ddf9c6");
              }
              else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'].trim())){
                $("#"+tmpcnt+"_tr[class='othercode']").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
                $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#fbecbc");
              }
              
              tmpcpt = result[i]['CPT'].trim();
            }
          }
          else{
            tmpcnt++;
            $("#multibilltable tbody").append(`
              ${result[i]['subname']==null?"":"<tr class='text-success text-left subgroupname'><td border='1px' bgcolor='#dcf9ed' align='left' colspan='"+(parseInt(ins.length)+2)+"'>"+result[i]['subname']+"</td></tr>"}
            `);
            if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
              var owncode = 1;
            }
            else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'].trim())){
              var owncode = 0;
            }
            else{
              var owncode = 1;
            }
            $("#multibilltable tbody").append(`
              <tr id="${tmpcnt}_tr" class="${owncode==1?"":"othercode"}"><td border='1px' align="left" class="fixed-side ${owncode==1?"text-primary":"red-mark"}" ${owncode==1?"":"bgcolor='#f39fcb'"}>${result[i]['CPT'].trim()}</td><td border='1px' class="cpt_desc fixed-side2">${result[i]['CPT_DESC']==null?"":result[i]['CPT_DESC']}</td></tr>
            `);
            for(var j = 0;j < ins.length;j++){
              $("#"+tmpcnt+"_tr").append(`<td border='1px'><span class="pink-mark"><i class="fa fa-frown-o" aria-hidden="true"></i></span></td>`);
            }
            tmplcnt = getKeyByValue(ins,result[i]['InsName']);
            if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
              $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
              $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#ddf9c6");
            }
            else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'].trim())){
              $("#"+tmpcnt+"_tr[class='othercode']").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
              $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#fbecbc");
            }
            tmpsubname = result[i]['subname'];
            tmpcpt = result[i]['CPT'].trim();
          }
        }
        else{
          tmpcnt++;
          $("#multibilltable tbody").append(`
            <tr class="text-primary text-bold text-left text-upper groupname"><td border='1px' bgcolor="#ceeaf5" align="left" colspan="${parseInt(ins.length)+2}">${result[i]['name']}</td></tr>
            ${result[i]['subname']==null?"":"<tr class='text-success text-left subgroupname'><td border='1px' bgcolor='#dcf9ed' align='left' colspan='"+(parseInt(ins.length)+2)+"'>"+result[i]['subname']+"</td></tr>"}
          `);
          if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
            var owncode = 1;
          }
          else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'].trim())){
            var owncode = 0;
          }
          else{
            var owncode = 1;
          }
          $("#multibilltable tbody").append(`
            <tr id="${tmpcnt}_tr" class="${owncode==1?"":"othercode"}"><td border='1px' align="left" class="fixed-side ${owncode==1?"text-primary":"red-mark"}" ${owncode==1?"":"bgcolor='#f39fcb'"}>${result[i]['CPT'].trim()}</td><td border='1px' class="cpt_desc fixed-side2">${result[i]['CPT_DESC']==null?"":result[i]['CPT_DESC']}</td></tr>
          `);
          for(var j = 0;j < ins.length;j++){
            $("#"+tmpcnt+"_tr").append(`<td border='1px'><span class="pink-mark"><i class="fa fa-frown-o" aria-hidden="true"></i></span></td>`);
          }
          tmplcnt = getKeyByValue(ins,result[i]['InsName']);
          if(result[i]['clinicid']==localStorage.getItem('chosen_clinic')){
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#ddf9c6");
          }
          else if(result[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(result[i]['CPT'].trim())){
            $("#"+tmpcnt+"_tr[class='othercode']").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${result[i]['clinicname']+" "+result[i]['ICD']+" "+result[i]['Mod1']+" "+result[i]['ICD_DESC']}">$${parseFloat(result[i]['max']).toFixed(2)}</span>`);
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#fbecbc");
          }
          tmpname = result[i]['name'];
          tmpsubname = result[i]['subname'];
          tmpcpt = result[i]['CPT'].trim();
        }
      }
      if(nogroup.length>0){
        $("#multibilltable tbody").append(`
          <tr class="text-primary text-bold text-left text-upper groupname"><td border='1px' bgcolor="#ceeaf5" align="left" colspan="${parseInt(ins.length)+2}">Miscellaneous</td></tr>
        `);
      }
      for(var i = 0;i < nogroup.length;i++){
        if(tmpcpt == nogroup[i]['CPT']){
          tmplcnt = getKeyByValue(ins,nogroup[i]['InsName']);
          if(nogroup[i]['clinicid']==localStorage.getItem('chosen_clinic')){
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${nogroup[i]['clinicname']+" "+nogroup[i]['ICD']+" "+nogroup[i]['Mod1']+" "+nogroup[i]['ICD_DESC']}">$${parseFloat(nogroup[i]['max']).toFixed(2)}</span>`);
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#ddf9c6");
          }
          else if(nogroup[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(nogroup[i]['CPT'].trim())){
            $("#"+tmpcnt+"_tr[class='othercode']").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${nogroup[i]['clinicname']+" "+nogroup[i]['ICD']+" "+nogroup[i]['Mod1']+" "+nogroup[i]['ICD_DESC']}">$${parseFloat(nogroup[i]['max']).toFixed(2)}</span>`);
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#fbecbc");
          }
        }
        else{
          tmpcnt++;
          if(nogroup[i]['clinicid']==localStorage.getItem('chosen_clinic')){
            var owncode = 1;
          }
          else if(nogroup[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(nogroup[i]['CPT'])){
            var owncode = 0;
          }
          else{
            var owncode = 1;
          }
          $("#multibilltable tbody").append(`
            <tr id="${tmpcnt}_tr" class="${owncode==1?"":"othercode"}"><td border='1px' align="left" class="fixed-side ${owncode==1?"text-primary":"red-mark"}" ${owncode==1?"":"bgcolor='#f39fcb'"}>${nogroup[i]['CPT']}</td><td border='1px' class="cpt_desc fixed-side2">${nogroup[i]['CPT_DESC']==null?"":nogroup[i]['CPT_DESC']}</td></tr>
          `);
          for(var j = 0;j < ins.length;j++){
            $("#"+tmpcnt+"_tr").append(`<td border='1px'><span class="pink-mark"><i class="fa fa-frown-o" aria-hidden="true"></i></span></td>`);
          }
          tmplcnt = getKeyByValue(ins,nogroup[i]['InsName']);
          if(nogroup[i]['clinicid']==localStorage.getItem('chosen_clinic')){
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${nogroup[i]['clinicname']+" "+nogroup[i]['ICD']+" "+nogroup[i]['Mod1']+" "+nogroup[i]['ICD_DESC']}">$${parseFloat(nogroup[i]['max']).toFixed(2)}</span>`);
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#ddf9c6");
          }
          else if(nogroup[i]['clinicid']!=localStorage.getItem('chosen_clinic')&&!tmpcode.includes(nogroup[i]['CPT'].trim())){
            $("#"+tmpcnt+"_tr[class='othercode']").children().eq(parseInt(tmplcnt)+2).html(`<span class="tooltip-tag tag tag-lime" data-tooltip="${nogroup[i]['clinicname']+" "+nogroup[i]['ICD']+" "+nogroup[i]['Mod1']+" "+nogroup[i]['ICD_DESC']}">$${parseFloat(nogroup[i]['max']).toFixed(2)}</span>`);
            $("#"+tmpcnt+"_tr").children().eq(parseInt(tmplcnt)+2).attr("bgcolor","#fbecbc");
          }
          
          tmpcpt = nogroup[i]['CPT'];
        }
      }
      $(".progress-load").addClass("d-none");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
