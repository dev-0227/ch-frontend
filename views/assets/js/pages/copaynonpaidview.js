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
var dcheck = 0;
var pcheck = 0;
var copay = 0;
var deduct = 0;
var copay_adj = 0;
var deduct_adj = 0;
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
  $(document).on("click",".printletter",function(){
    copay = $(this).parent().parent().children().eq(11).html()==null||$(this).parent().parent().children().eq(11).html()==""?0:parseFloat($(this).parent().parent().children().eq(11).html());
    deduct = $(this).parent().parent().children().eq(12).html()==null||$(this).parent().parent().children().eq(12).html()==""?0:parseFloat($(this).parent().parent().children().eq(12).html());
    copay_adj = 0;
    deduct_adj = 0;
    $("#copay_value").html(copay);
    $("#deduct_value").html(deduct);
    $("#total_value").html((copay+deduct).toFixed(2));
    $("#chosen_id").val($(this).parent().parent().children().eq(1).html());
    $("#chosen_ptid").val($(this).parent().parent().children().eq(3).html());
    $("#copay_adjust").val("");
    $("#deduct_adjust").val("");
    $("#total_per").html(0);
    $("#copayshowcheck").prop("checked",true);
    $("#deductshowcheck").prop("checked",true);
    
    $("#invoice-modal").modal("show");
  });
  $("#copay_adjust").keyup(function(){
    if(parseFloat($(this).val())+deduct_adj>copay+deduct)
      $(this).val(0)
    copay_adj = $(this).val()==""?0:parseFloat($(this).val());
    $("#total_value").html((copay+deduct-copay_adj-deduct_adj).toFixed(2));
    $("#total_per").html(Math.round((copay_adj+deduct_adj)/(copay+deduct)*100));
  });
  $("#deduct_adjust").keyup(function(){
    if(parseFloat($(this).val())+copay_adj>copay+deduct)
      $(this).val(0)
    deduct_adj = $(this).val()==""?0:parseFloat($(this).val());
    $("#total_value").html((copay+deduct-copay_adj-deduct_adj).toFixed(2));
    $("#total_per").html(Math.round((copay_adj+deduct_adj)/(copay+deduct)*100));
  });
  $("#invoicebtn").click(function(){
    if($("#copayshowcheck").prop("checked")){
      var cadjcheck = 1;
    }
    else{
      var cadjcheck = 0;
    }
    if($("#deductshowcheck").prop("checked")){
      var dadjcheck = 1;
    }
    else{
      var dadjcheck = 0;
    }
    $("body").append("<form id = 'copayinvoiceform' action = '../pages/copayinvoice' method = 'POST' target='_blank'><input type='hidden' name='id' value='"+$("#chosen_id").val()+"' /><input type='hidden' name='ptid' value='"+$("#chosen_ptid").val()+"' /><input type='hidden' name='copay' value='"+copay+"' /><input type='hidden' name='deduct' value='"+deduct+"' /><input type='hidden' name='copay_adj' value='"+copay_adj+"' /><input type='hidden' name='deduct_adj' value='"+deduct_adj+"' /><input type='hidden' name='cadjcheck' value='"+cadjcheck+"' /><input type='hidden' name='dadjcheck' value='"+dadjcheck+"' /></form>");
    $("#copayinvoiceform").submit();
    $("#copayinvoiceform").remove();
  })
  $("#deductcheck").click(function(){
    if($(this).prop("checked")){
      dcheck = 1;
    }
    else{
      dcheck = 0;
    }
    loadData()
  })
  $("#paidcheck").click(function(){
    if($(this).prop("checked")){
      pcheck = 1;
    }
    else{
      pcheck = 0;
    }
    loadData()
  });
  $("#ins-area").change(function(){
    loadData()
  });
  $(".addnewbtn").click(function(){
    $("#new-add-modal").modal('show');
  });
  $(document).on("click",".statusbtn",function(){
    $("#chosen_id").val($(this).parent().parent().children().eq(1).html());
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$("#chosen_id").val()}, "ffs/getinvoicestatus", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length == 3){
          $(".markstatus").addClass("ribbon-done");
          $(".markstatus span").html("Generated");
          $(".datestatus1").html(DateFormat(new Date(result[0]['date'])));
          $(".datestatus2").html(DateFormat(new Date(result[1]['date'])));
          $(".datestatus3").html(DateFormat(new Date(result[2]['date'])));
        }
        else if(result.length == 2){
          $(".markstatus").removeClass("ribbon-done");
          $(".markstatus span").html("None");
          $(".markstatus1").addClass("ribbon-done");
          $(".markstatus2").addClass("ribbon-done");
          $(".markstatus1 span").html("Generated");
          $(".markstatus2 span").html("Generated");
          $(".datestatus1").html(DateFormat(new Date(result[0]['date'])));
          $(".datestatus2").html(DateFormat(new Date(result[1]['date'])));
          $(".datestatus3").html("-");
        }
        else if(result.length == 1){
          $(".markstatus").removeClass("ribbon-done");
          $(".markstatus span").html("None");
          $(".markstatus1").addClass("ribbon-done");
          $(".markstatus1 span").html("Generated");
          $(".datestatus1").html(DateFormat(new Date(result[0]['date'])));
          $(".datestatus2").html("-");
          $(".datestatus3").html("-");
        }
        else{
          $(".markstatus").removeClass("ribbon-done");
          $(".markstatus span").html("None");
          $(".datestatus1").html("-");
          $(".datestatus2").html("-");
          $(".datestatus3").html("-");
        }
        $("#status-modal").modal('show');
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  })
});
let changed = function(instance, cell, x, y, value) {
  var cellName = jexcel.getColumnNameFromId([0,y]);
  var cellName1 = jexcel.getColumnNameFromId([1,y]);
  var cellName2 = jexcel.getColumnNameFromId([23,y]);
  var id = $('#hedisreport').jexcel('getValue',cellName);
  var insid = $('#hedisreport').jexcel('getValue',cellName1);
  var measureid = $('#hedisreport').jexcel('getValue',cellName2);
  var key = $('#hedisreport').jexcel('getHeader',x);
  
}
async function loadData(){
  data = [];
  let entry = {
    clinicid:localStorage.getItem('chosen_clinic'),
    ins:$("#ins-area").val(),
    sdate:$("#sdate").html(),
    edate:$("#edate").html(),
    dcheck:dcheck,
    pcheck:pcheck,
  }
  let tmpdate = null;
  $(".progress-load").removeClass("d-none");
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "ffs/getcopaynonpaid", (xhr, err) => {
    if (!err) {
      $(".progress-load").addClass("d-none");
      let result = JSON.parse(xhr.responseText)['data'];
      for(var i=0;i<result.length;i++){
        if(result[i]['date']==""||result[i]['date']==null){
          tmpdate = null;
        }
        else{
          tmpdate = DateFormat(new Date(result[i]['date']));
        }
        if(result[i]['dob']==""||result[i]['dob']==null){
          var dob = null;
        }
        else{
          var dob = DateFormat(new Date(result[i]['dob']));
        }
        var tmpdata = [
          result[i]['id'],
          result[i]['InsName']=="zzzname"?"Unknown":result[i]['InsName'],
          result[i]['PT_ID'],
          result[i]['fname'],
          result[i]['lname'],
          dob, 
          result[i]['phone'], 
          result[i]['CPT'], 
          result[i]['VTYPE'], 
          tmpdate, 
          result[i]['PTCopay'], 
          result[i]['deduct'], 
          result[i]['CPT_PAY'], 
          "<i class='ti-eye statusbtn'></i>", 
          "<i class='ti-receipt printletter'></i>", 
        ];
        data.push(tmpdata);
      }
      // data.push(tmpdata);
      $("#nonpaidreport").empty();
      jexcel(document.getElementById('nonpaidreport'), {
        data:data,
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
            title:'InsName',
            readOnly:true,
            width:200
          },
          {
              type: 'text',
              title:'EMR ID',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'First Name',
              readOnly:true,
              width:150
          },
          {
              type: 'text',
              title:'Last Name',
              readOnly:true,
              width:150
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
              width:100
          },
          {
              type: 'text',
              title:'CPT',
              readOnly:true,
              width:80
          },
          {
              type: 'text',
              title:'VTYPE',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'DOS',
              readOnly:true,
              width:100
          },
          {
              type: 'text',
              title:'Copay',
              readOnly:true,
              width:80
          },
          {
              type: 'text',
              title:'Deductible',
              readOnly:true,
              width:80
          },
          {
              type: 'text',
              title:'PAID',
              readOnly:true,
              width:80
          },
          {
              type: 'html',
              title:'Status',
              readOnly:true,
              width:50
          },
          {
              type: 'html',
              title:'Invoice',
              readOnly:true,
              width:50
          }
        ],
        filters: true,
        allowComments:true,
        updateTable:function(instance, cell, col, row, val, label, cellName) {
          
        },
        onchange: changed
      });
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
