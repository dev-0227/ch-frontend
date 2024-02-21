function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
let stripe;
let paramsArr = [];
$(document).ready(async function () {
  "use strict";
  let params = getUrlVars();
  if(params['t']==""||params['t']==null){
    window.location.replace("../404");
  }
  else{
    var tmparr = atob(params['t']).split("||");
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:tmparr[5]}, "ffs/checksid", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#global-loader").removeClass("loading-pedding");
        if(result.length > 0){
          window.location.replace("../404");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
    paramsArr = {
      clinicid:tmparr[4],
      id:tmparr[5],
      copay: tmparr[0],
      deduct: tmparr[1],
      copay_adj: tmparr[2],
      deduct_adj: tmparr[3]
    }
    $("#total_value").html((parseFloat(paramsArr.copay)+parseFloat(paramsArr.deduct)-parseFloat(paramsArr.copay_adj)-parseFloat(paramsArr.deduct_adj)).toFixed(2))
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:tmparr[4]}, "setting/getClinic", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText);
        $("#clinic_name").html(result['clinic'])
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  }
  // Create an instance of the Stripe object with your publishable API key
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getstripe", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      stripe = Stripe(result);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  var checkoutButton = document.getElementById("checkout-button");
  checkoutButton.addEventListener("click", function () {
    
    fetch(serviceUrl+"ffs/payments", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paramsArr),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (session) {
        return stripe.redirectToCheckout({ sessionId: session.id });
      })
      .then(function (result) {
        if (result.error) {
          alert(result.error.message);
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  });
});
