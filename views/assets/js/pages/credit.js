let stripe;
let paramsArr = [];
let price = 1;
let card;
$(document).ready(async function () {
  "use strict";
  // Create an instance of the Stripe object with your publishable API key
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getstripe", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      stripe = Stripe(result);
      const elements = stripe.elements();
      card = elements.create('card');
      card.mount('#card-element');
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPriceSMS", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length > 0)
        price = parseInt(result[0]['value']*100);
      else
        price = 7;
      $("#basiccount").html(getCounts($(".amountoption:checked").val(),price));
      $("#totalamount").html($(".amountoption:checked").val());
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(".submitbtn").click(async function () {
    if($("#fullname").val() == "")
      return $.growl.error({
        message: "Please enter your full name"
      });
    if($("#email").val() == "")
      return $.growl.error({
        message: "Please enter your email"
      });
    $(this).prop("disabled",true);
    if($("#autopaycheck").prop("checked"))
      var autocheck = 1;
    else
      var autocheck = 0;
    await stripe.createToken(card).then(res => {
      if (res.error) console.log(res.error.message);
      else {
        paramsArr = {
          clinicid:localStorage.getItem('chosen_clinic'),
          amount:$(".amountoption:checked").val(),
          counts:getCounts($(".amountoption:checked").val(),price),
          token:res.token,
          fullname:$("#fullname").val(),
          email:$("#email").val(),
          autocheck:autocheck
        }
      }
    })
    mainFun(paramsArr)
  });
  $(".amountoption").click(function () {
    $("#basiccount").html(getCounts($(".amountoption:checked").val(),price));
    $("#totalamount").html($(".amountoption:checked").val());
  });
});
function getCounts(amount,price){
  return Math.floor(parseFloat(parseInt(amount)-parseInt(amount)*2.9/100-0.3)*100/price);
}
function mainFun(paramsArr){
  sendRequestWithToken('POST', localStorage.getItem('authToken'), paramsArr, "hedis/smscredit", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      if(result['status'] == "success")
        window.location.replace("../success_payment_credit?t="+result['counts']);
      else{
        window.location.replace("../cancel_payment");
      }
    } else {
        window.location.replace("../cancel_payment");
    }
  });
}
