var conector = "";
var website = "";

$(document).ready(async function () {
  "use strict";
  
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".clinic-name").html(result['clinic']);
      $(".clinic-address").html(result['address']+" "+result['city']+" "+result['state']+" "+result['zip']);
      $(".clinic-phone").html(result['phone']);
      website = result['web'];
      conector = window.location.origin+"/connection?t="+btoa(unescape(encodeURIComponent(localStorage.getItem('chosen_clinic'))))+"&n="+btoa(unescape(encodeURIComponent(result['clinic'])));
    } else {
      return toastr.error("Action Failed");
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getqrcodetype", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['result'];
      if(result.length > 0){
        if(result[0]['age'] == 1)
          new QRCode(document.getElementById("qrcode"), conector);
        else if(website == "" || website == null)
          new QRCode(document.getElementById("qrcode"), conector);
        else
          new QRCode(document.getElementById("qrcode"), website);
      }
      else{
        if(website == "" || website == null)
          new QRCode(document.getElementById("qrcode"), conector);
        else
          new QRCode(document.getElementById("qrcode"), website);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(".colorbtn").click(function(){
    $(".postheader").css('background-color', $(this).val());
    $("#wave").css('background-color', $(this).val());
    document.getElementById("wave").removeAttribute("class");
    document.getElementById("wave").classList.add($(this).attr("key"));
    $("#post-main").css('border-color', $(this).val());
  });
  $('.downloadqrbtn').click(function () {
    var pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [600, 400]
    });
    let base64Image = $('#qrcode img').attr('src');
    pdf.addImage(base64Image, 'png', 200, 100, 200, 200);
    
    pdf.save($(".clinic-name").html()+' QR Code.pdf');
  });
});
