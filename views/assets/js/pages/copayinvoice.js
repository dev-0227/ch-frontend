function DateFormat(serial,type) {
  let year = serial.getFullYear();
  let month = serial.getMonth() + 1;
  let dt = serial.getDate();
  if (dt < 10) {
      dt = '0' + dt;
  }
  if (month < 10) {
      month = '0' + month;
  }
  if(type == 1)
      return month+'/'+dt+'/'+year;
  if(type == 2)
      return month+'-'+dt+'-'+year;
  
}
const oneDay = 24 * 60 * 60 * 1000;
new QRCode(document.getElementById("qrcode"), "Precision Quality");
$(document).ready(async function () {
  "use strict";
  $(".cdate").html(DateFormat(new Date(),1));
  if($("#adjcheck").val() == 0){
    $(".adj_area").addClass("d-none");
  }
  if(parseFloat($("#copay_adj").val())+parseFloat($("#deduct_adj").val()) == 0)
      $(".total-area3").remove();
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".clinic-name").html(result['clinic']);
      $(".clinic-address").html(result['address']);
      $(".clinic-city").html(result['city']+" "+result['state']+" "+result['zip']);
      $(".clinic-phone").html(result['phone']);
      $(".clinic-ex").html(result['ex']!=null&&result['ex']!=""?" ext "+result['ex']:"");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  }); 
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),ptid:$("#chosen_ptid").val()}, "setting/getptinfo", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".pt-name").html(result[0]['FNAME']+" "+result[0]['LNAME']);
      $(".pt-address").html(result[0]['ADDRESS']);
      $(".pt-city").html(result[0]['CITY']+" "+result[0]['State']+" "+result[0]['ZIP']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),id:$("#chosen_id").val()}, "ffs/getinvoicedata", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".inv-key").html("#INV-"+result[0]['ENC_ID']+"-"+DateFormat(new Date(),2));
      $(".ins-name").html(result[0]['InsName']=="zzzname"?"Unknown":result[0]['InsName'])
      $(".invoice-detail-table tbody").empty();
      if($("#cadjcheck").val() == 1){
        $(".invoice-detail-table tbody").append(`
          <tr>
            <td class="text-center">${DateFormat(new Date(result[0]['date']),1)}</td>
            <td>
              <div style="width: 130px!important;white-space: break-spaces;">${$(".clinic-address").html()}</div>
            </td>
            <td class="text-left">
              <div class="text-bold text-bold mb-1 tb-desc">${result[0]['CPT']} ${result[0]['CPT_DESC']==null?"":result[0]['CPT_DESC']}</div>
              <div class="text-muted tb-desc">${result[0]['VTYPE']}</div>
            </td>
            <td class="text-right">$${parseFloat($("#copay").val()).toFixed(2)}</td>
            ${$("#adjcheck").val() == 0?"":"<td class='text-right'>$"+parseFloat($("#copay_adj").val()).toFixed(2)+"</td>"}
            <td class="text-right">Copay : $${parseFloat($("#copay").val()-$("#copay_adj").val()).toFixed(2)}</td>
            <td class="text-right">40</td>
          </tr>
          
        `);
      }
      if($("#dadjcheck").val() == 1){
        $(".invoice-detail-table tbody").append(`
          <tr>
            <td class="text-center">${DateFormat(new Date(result[0]['date']),1)}</td>
            <td>
              <div style="width: 130px!important;white-space: break-spaces;">${$(".clinic-address").html()}</div>
            </td>
            <td class="text-left">
              <div class="text-bold text-bold mb-1 tb-desc">${result[0]['CPT']} ${result[0]['CPT_DESC']==null?"":result[0]['CPT_DESC']}</div>
              <div class="text-muted tb-desc">${result[0]['VTYPE']}</div>
            </td>
            <td class="text-right">$${parseFloat($("#deduct").val()).toFixed(2)}</td>
            ${$("#adjcheck").val() == 0?"":"<td class='text-right'>$"+parseFloat($("#deduct_adj").val()).toFixed(2)+"</td>"}
            <td class="text-right">Deductible : $${parseFloat($("#deduct").val()-$("#deduct_adj").val()).toFixed(2)}</td>
            <td class="text-right">40</td>
          </tr>
        `);
      }
      const firstDate = new Date(result[0]['date']);
      const secondDate = new Date();
      var diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
      if(diffDays < 30){
        $("#30_days").addClass("totalamount");
      }
      else if(diffDays >=30 && diffDays < 60){
        $("#60_days").addClass("totalamount");
      }
      else if(diffDays >=60 && diffDays < 90){
        $("#90_days").addClass("totalamount");
      }
      else if(diffDays >=90 && diffDays < 120){
        $("#120_days").addClass("totalamount");
      }
      else{
        $("#over_days").addClass("totalamount");
      }
      $(".totalamount").html((parseFloat($("#copay").val())+parseFloat($("#deduct").val())-parseFloat($("#copay_adj").val())-parseFloat($("#deduct_adj").val())).toFixed(2));
      $(".discountper").html(Math.round((parseFloat($("#copay_adj").val())+parseFloat($("#deduct_adj").val()))/(parseFloat($("#copay").val())+parseFloat($("#deduct").val()))*100));
      $(".oriamount").html((parseFloat($("#copay").val())+parseFloat($("#deduct").val())).toFixed(2));
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $("#sendemailbtn").click(function(){
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),id:$("#chosen_id").val(),copay:parseFloat($("#copay").val()),deduct:parseFloat($("#deduct").val()),copay_adj:parseFloat($("#copay_adj").val()),deduct_adj:parseFloat($("#deduct_adj").val())}, "ffs/sendinvoiceemail", (xhr, err) => {
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
  $("#sendsmsbtn").click(function(){
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),id:$("#chosen_id").val(),copay:parseFloat($("#copay").val()),deduct:parseFloat($("#deduct").val()),copay_adj:parseFloat($("#copay_adj").val()),deduct_adj:parseFloat($("#deduct_adj").val())}, "ffs/sendinvoicesms", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText);
            if(result['message'] == "pending")
              return $.growl.notice({
                message: "Need to purchase Phone number"
              });
            else if(result['message'] == "success")
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
