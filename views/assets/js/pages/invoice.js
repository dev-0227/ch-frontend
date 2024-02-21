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
var lastday = function(y,m){
  if (m < 10) {
    m = '0' + m;
  }
  return  m+"/"+(new Date(y, m, 0).getDate())+"/"+y;
}
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

$(document).ready(async function () {
    "use strict";
    var phoneprice = 0;
    var smsunit = 0;
    $("#cdate").html(DateFormat(new Date(),1));
    $(".inv-enddate").html(lastday(new Date().getFullYear(),(new Date().getMonth()+1)));
    $(".inv-report-date").html(monthNames[new Date().getMonth()]+" "+new Date().getFullYear());
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText);
          $(".inv-key").html("#INV-"+DateFormat(new Date(),2)+"-"+result['clinic'].replaceAll(" ","-")+"-PQ");
          $("#inv-clinic").html(result['clinic']);
          $("#inv-address").html(result['address']+" "+result['city']+" "+result['state']+" "+result['zip']);
          $("#inv-phone").html(result['phone']);
          $("#inv-email").html(result['email']);
          $("#inv-web").html(result['web']);
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPhone", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          $(".inv-phone").html("+1"+result[0]['name']);
          $(".inv-phone-amount").html("$"+result[0]['desc']);
          phoneprice = result[0]['desc'];
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPriceSMS", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        smsunit = result[0]['value'];
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
  });
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getLogoaddress", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          $("#logo-address").html(result[0]['value']);
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "invoice/getdata", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        var appcnt = 0;
        var hediscnt = 0;
        $(".appt-report").empty();
        $(".hedis-report").empty();
        for(var i = 0;i < result.app.length;i++){
          appcnt += result.app[i]['total'];
          $(".appt-report").append(`
            <tr>
              <td>
                  <p class="font-w600 mb-1">`+result.app[i]['visittype']+`</p>
              </td>
              <td class="text-right">`+result.app[i]['total']+`</td>
            </tr>
          `);
        }
        $(".appt-report").append(`
          <tr>
            <td colspan="1" class="font-weight-bold text-uppercase text-right">Total</td>
            <td class="font-weight-bold text-right h4 inv-app-amount"></td>
          </tr>
        `);
        for(var i = 0;i < result.hedis.length;i++){
          hediscnt += result.hedis[i]['total'];
          if(result.hedis[i]['mid'] != null)
            $(".hedis-report").append(`
              <tr>
                <td>
                    <p class="font-w600 mb-1">`+result.hedis[i]['Rates']+`</p>
                </td>
                <td class="text-right">`+result.hedis[i]['total']+`</td>
              </tr>
            `);
        }
        $(".hedis-report").append(`
          <tr>
            <td colspan="1" class="font-weight-bold text-uppercase text-right">Total</td>
            <td class="font-weight-bold text-right h4 inv-hedis-amount"></td>
          </tr>
        `);
        $(".inv-hedis-cnt").html(hediscnt);
        $(".inv-app-cnt").html(appcnt);
        $(".inv-hedis-amount").html("$"+Math.ceil(hediscnt*smsunit));
        $(".inv-app-amount").html("$"+Math.ceil(appcnt*smsunit));
        $(".inv-total-amount").html("$"+Math.ceil(parseFloat(appcnt*smsunit)+parseFloat(hediscnt*smsunit)+parseFloat(phoneprice)));

      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
  });
});