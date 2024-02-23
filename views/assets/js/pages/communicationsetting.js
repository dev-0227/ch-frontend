
var statusreasontable;
var statuscodetable;
var categorycodetable;
var topiccodetable;
var mediumcodetable;
var priorutycodetable;
var edcategorytable;
var comcategorytable

function editcomvalfunc (tbname,id){
  let entry = {
    id: id ,
  }
  switch (tbname) {
    case 'streason':
      entry.tbname = 'c_statusreason'
      break
    case 'status':
      entry.tbname = 'e_status'
      break
    case 'category':
      entry.tbname = 'c_category'
      break
    case 'topic':
      entry.tbname = 'c_topic'
      break
    case 'medium':
      entry.tbname = 'pmode_medium'
      break
    case 'priority':
      entry.tbname = 'r_priority'
      break
    case 'edcategory':
      entry.tbname = 'r_edu_category'
      break
    case 'comcategory':
      entry.tbname = 'r_com_category'
      break
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/getcomvalbyid", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      console.log(result)
      $("#com_e_code").val(result[0]['code']);
      $("#com_e_disp").val(result[0]['display']);
      $("#com_e_desc").val(result[0]['definition']);
      
      $("#com_e_tb").val(entry.tbname)
      $("#com_e_id").val(result[0]['id'])
      $("#commvalue-edit-modal").modal("show");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
function delcomvalfunc(tbname,id){
  let entry = {
    id: id ,
  }
  switch (tbname) {
    case 'streason':
      entry.tbname = 'c_statusreason'
      break
    case 'status':
      entry.tbname = 'e_status'
      break
    case 'category':
      entry.tbname = 'c_category'
      break
    case 'topic':
      entry.tbname = 'c_topic'
      break
    case 'medium':
      entry.tbname = 'pmode_medium'
      break
    case 'priority':
      entry.tbname = 'r_priority'
      break
    case 'edcategory':
        entry.tbname = 'r_edu_category'
        break
    case 'comcategory':
        entry.tbname = 'r_com_category'
        break
  }

  swal({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }, function(inputValue) {
    if (inputValue) {
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/delcomvalbyid", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Action Successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
    
      switch(entry.tbname) {
        case 'c_statusreason':
          setTimeout( function () {
            statusreasontable.ajax.reload();
          }, 1000 );
          break;
        case 'e_status':
          setTimeout( function () {
            statuscodetable.ajax.reload();
          }, 1000 );
          break;
        case 'c_category':
          setTimeout( function () {
            categorycodetable.ajax.reload();
          }, 1000 );
          break;
        case 'c_topic':
          setTimeout( function () {
            topiccodetable.ajax.reload();
          }, 1000 );
          break;
        case 'pmode_medium':
          setTimeout( function () {
            mediumcodetable.ajax.reload();
          }, 1000 );
          break;
        case 'r_priority':
          setTimeout( function () {
            priorutycodetable.ajax.reload();
          }, 1000 );
          break;
      } 
    }
  });

 

}
$(document).ready(async function () {
  "use strict";
  
  if(localStorage.getItem('usertype') == 0){
    $(".tmpfirstclass").removeClass("active");
  }
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPriceSMS", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length > 0)
        $("#pricevalue").val(result[0]['value']);
      else
        $("#pricevalue").val("0.07");
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
        $("#pricevalue").val(result[0]['value']);
      else
        $("#pricevalue").val("0.07");
      } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });

  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPricecall", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length > 0)
        $("#pricecallvalue").val(result[0]['value']);
      else
        $("#pricecallvalue").val("0.01");
      } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });

  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getAutoAmountSMS", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length > 0){
        $("#repamount").val(result[0]['autoamount']);
        $("#repcounts").val(result[0]['counts']);
      }
      else{
        $("#repamount").val("");
        $("#repcounts").val("");
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getAutopayment", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result[0]['auto'] == 1){
        $("#autopaycheck").prop("checked",true);
      }
      else{
        $("#autopaycheck").prop("checked",false);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getPhone", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result[0]['age'] == 1){
        $("#activatecheck").prop("checked",true);
      }
      else{
        $("#activatecheck").prop("checked",false);
      }
      $("#phonenumber").val(result[0]['name']);
      $("#phoneprice").val(result[0]['desc']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getcallactive", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result[0]['active_call'] == 1){
        $("#activatecallcheck").prop("checked",true);
      }
      else{
        $("#activatecallcheck").prop("checked",false);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  var paymenthistorytable = $('#paymenthistorytable').DataTable({
    "order": [[ 0, 'desc' ]],
    "ajax": {
        "url": serviceUrl + "setting/getcredithistory",
        "type": "POST",
        "data":{clinicid:localStorage.getItem('chosen_clinic')}
    },
    "columns": [
        { data: "date",
          render: function (data, type, row) {
            return new Date(row.date).toLocaleDateString();
          } 
        },
        { data: "rec_id"},
        { data: 'name' },
        { data: 'email'},
        { data: 'amount'},
        { data: 'counts'},
        { data: 'type',
          render: function (data, type, row) {
            if(row.type == 1)
              return "<span class='tag tag-green'>One Time</span>";
            else
              return "<span class='tag tag-info'>Auto</span>";
          } 
        },
    ]
  });

   statusreasontable = $('#statusreasontable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getstatusreason",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('streason',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('streason',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  statuscodetable = $('#statuscodetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getstatuscode",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('status',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('status',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
            </div>
            `
          } 
        }
    ]
  });

  categorycodetable = $('#categorycodetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getcategorycode",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('category',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('category',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
            </div>
            `
          } 
        }
    ]
  });
  topiccodetable = $('#topiccodetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/gettopiccode",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('topic',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('topic',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
            </div>
            `
          } 
        }
    ]
  });

  mediumcodetable = $('#mediumcodetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getmediumcode",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('medium',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('medium',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
            </div>
            `
          } 
        }
    ]
  });
  priorutycodetable = $('#priorutycodetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getprioritycode",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('priority',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('priority',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
            </div>
            `
          } 
        }
    ]
  });

  edcategorytable = $('#edcategprycodetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getedcategorycode",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('edcategory',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('edcategory',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
            </div>
            `
          } 
        }
    ]
  });
  comcategorytable = $('#comcategprycodetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getcomcategorycode",
        "type": "GET"
    },
    "columns": [
        
        { data: 'code'},
        { data: 'display'},
        { data: 'definition'},
        { data: 'id',
          render: function (data, type, row) {
            return `
            <div idkey="`+row.id+`">
            <button class="btn btn-sm btn-primary " onclick="editcomvalfunc('comcategory',`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger " onclick="delcomvalfunc('comcategory',`+row.id+`)"><i class="fa fa-trash"></i> Delete</button>
            </div>
            `
          } 
        }
    ]
  });

  $("#updatepricebtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#pricevalue").val()}, "setting/updatePriceSMS", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  
  $("#updatecallpricebtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#pricecallvalue").val()}, "setting/updatePricecall", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#updaterepamountbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#repamount").val()}, "setting/updateRepAmountSMS", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#updaterepcountsbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#repcounts").val()}, "setting/updateRepCountsSMS", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#updatephonebtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),price:$("#phoneprice").val(),number:$("#phonenumber").val()}, "setting/updatePhone", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#twiliophonebtn").click(function(){
    let entry={
      clid:localStorage.getItem('chosen_clinic')
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/gettwiliosubaccount", (xhr, err) => {
      if (!err) {

        let result = JSON.parse(xhr.responseText)['data'];
        console.log("result")
        console.log(result)
        if(result.length > 0){
         let dgkey = 'roslongenc2023'
          document.getElementById('clisubphone').value = CryptoJS.AES.decrypt(result[0].phone_num, dgkey).toString(CryptoJS.enc.Utf8)
          document.getElementById('clisubsid').value = CryptoJS.AES.decrypt(result[0].phone_sid, dgkey).toString(CryptoJS.enc.Utf8)
          document.getElementById('clisubtoken').value =CryptoJS.AES.decrypt(result[0].phone_token, dgkey) .toString(CryptoJS.enc.Utf8)

          if(result[0].tw_api_key == null){
            document.getElementById('twilioapiKey').value = ''
          }else{
            document.getElementById('twilioapiKey').value = CryptoJS.AES.decrypt(result[0].tw_api_key, dgkey).toString(CryptoJS.enc.Utf8)
          }
          if(result[0].tw_api_key == null){
            document.getElementById('twilioapisecret').value = ''
          }else{
            document.getElementById('twilioapisecret').value = CryptoJS.AES.decrypt(result[0].tw_api_secret, dgkey).toString(CryptoJS.enc.Utf8)
          } 
          if(result[0].tw_api_key == null){
            document.getElementById('applicationsid').value = ''
          }else{
            document.getElementById('applicationsid').value =CryptoJS.AES.decrypt(result[0].tw_app_sid, dgkey) .toString(CryptoJS.enc.Utf8)
          } 
          if(result[0].tw_api_key == null){
            document.getElementById('twidentity').value = ''
          }else{
            document.getElementById('twidentity').value = CryptoJS.AES.decrypt(result[0].tw_identity, dgkey).toString(CryptoJS.enc.Utf8)
          }
          


        }else{
          document.getElementById('clisubphone').value = ""
          document.getElementById('clisubsid').value = ""
          document.getElementById('clisubtoken').value = ""

          document.getElementById('twilioapiKey').value = ""
          document.getElementById('twilioapisecret').value = ""
          document.getElementById('applicationsid').value = ""
          document.getElementById('twidentity').value = ""
        }
        $("#twilio-add-modal").modal("show");
        
      } 
    });
   
  });

 


  $("#subtokenaddbtn").click(function (e) {
    let entry = {
      clid:localStorage.getItem('chosen_clinic'),
      cphone: document.getElementById('clisubphone').value,
      csid: document.getElementById('clisubsid').value,
      ctoken: document.getElementById('clisubtoken').value,
      twapikey: document.getElementById('twilioapiKey').value,
      twapisec: document.getElementById('twilioapisecret').value,
      twappsid: document.getElementById('applicationsid').value,
      identity: document.getElementById('twidentity').value
    }
    console.log(entry)

    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(entry), 'roslong2023').toString();

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {ciphertext : ciphertext}, "setting/addtwiliosubaccount", (xhr, err) => {
        if (!err) {
          $("#twilio-add-modal").modal("hide");
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          $("#twilio-add-modal").modal("hide");
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    
  });

  $("#activatecheck").change(function(){
    var checkvalue = 0;
    if($(this).prop("checked")){
      checkvalue = 1;
    }
    else{
      checkvalue = 0;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:checkvalue}, "setting/updateActivatesms", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#activatecallcheck").change(function(){
    var checkvalue = 0;
    if($(this).prop("checked")){
      checkvalue = 1;
    }
    else{
      checkvalue = 0;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:checkvalue}, "setting/updateActivatecall", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });


  $("#autopaycheck").change(function(){
    var checkvalue = 0;
    if($(this).prop("checked")){
      checkvalue = 1;
    }
    else{
      checkvalue = 0;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:checkvalue}, "setting/updateAutopayment", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successful"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $('#hedis_alert_body').summernote({
		tabsize: 3,
		height: 300
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getLanguage", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedis_alert_language").empty();
      for(var i = 0;i < result.length;i++){
        $("#hedis_alert_language").append("<option value='"+result[i]['id']+"'>"+result[i]['name']+"</option>");
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {type:$("#hedis_alert_type").val(),langid:$("#hedis_alert_language").val()}, "setting/getHedisalerts", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          if(result.length > 0){
            $("#hedis_alert_id").val(result[0]['id']);
            $("#hedis_alert_subject").val(result[0]['name']);
            $("#hedis_alert_body").summernote("code", result[0]['desc']);
          }
          else{
            $("#hedis_alert_id").val(0);
            $("#hedis_alert_subject").val("");
            $("#hedis_alert_body").summernote("code","");
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
  
  $("#hedis_alert_type").change(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {type:$("#hedis_alert_type").val(),langid:$("#hedis_alert_language").val()}, "setting/getHedisalerts", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length > 0){
          $("#hedis_alert_id").val(result[0]['id']);
          $("#hedis_alert_subject").val(result[0]['name']);
          $("#hedis_alert_body").summernote("code", result[0]['desc']);
        }
        else{
          $("#hedis_alert_id").val(0);
          $("#hedis_alert_subject").val("");
          $("#hedis_alert_body").summernote("code","");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#hedis_alert_language").change(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {type:$("#hedis_alert_type").val(),langid:$("#hedis_alert_language").val()}, "setting/getHedisalerts", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length > 0){
          $("#hedis_alert_id").val(result[0]['id']);
          $("#hedis_alert_subject").val(result[0]['name']);
          $("#hedis_alert_body").summernote("code", result[0]['desc']);
        }
        else{
          $("#hedis_alert_id").val(0);
          $("#hedis_alert_subject").val("");
          $("#hedis_alert_body").summernote("code","");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#hedisalertbtn").click(function(){
    let entry = {
      type:$("#hedis_alert_type").val(),
      langid:$("#hedis_alert_language").val(),
      id:$("#hedis_alert_id").val(),
      subject:$("#hedis_alert_subject").val(),
      body:$("#hedis_alert_body").summernote("code")
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/setHedisalerts", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });



  $(document).on("click","#streasonaddbtn",function(){
   
    $("#com-tb").val("c_statusreason")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });
  $(document).on("click","#statusaddbtn",function(){
   
    $("#com-tb").val("e_status")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });
  $(document).on("click","#categoryaddbtn",function(){
   
    $("#com-tb").val("c_category")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });
  $(document).on("click","#topicaddbtn",function(){
   
    $("#com-tb").val("c_topic")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });
  $(document).on("click","#mediumaddbtn",function(){
   
    $("#com-tb").val("pmode_medium")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });
  $(document).on("click","#priorityaddbtn",function(){
   
    $("#com-tb").val("r_priority")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });
  $(document).on("click","#edcateaddbtn",function(){
   
    $("#com-tb").val("r_edu_category")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });
  $(document).on("click","#comcateaddbtn",function(){
   
    $("#com-tb").val("r_com_category")
    $("#com_code").val("")
    $("#com_disp").val("")
    $("#com_desc").val("")
    $("#commvalue-add-modal").modal("show");
  });



  
  $("#com_addbtn").click(function(){

    let entry = {
      tbname:$("#com-tb").val(),
      code:$("#com_code").val(),
      disp:$("#com_disp").val(),
      desc:$("#com_desc").val(),
    }
    
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/setcommunicationitem", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });

    switch(entry.tbname) {
      case 'c_statusreason':
        setTimeout( function () {
          statusreasontable.ajax.reload();
        }, 1000 );
        break;
      case 'e_status':
        setTimeout( function () {
          statuscodetable.ajax.reload();
        }, 1000 );
        break;
      case 'c_category':
        setTimeout( function () {
          categorycodetable.ajax.reload();
        }, 1000 );
        break;
      case 'c_topic':
        setTimeout( function () {
          topiccodetable.ajax.reload();
        }, 1000 );
        break;
      case 'pmode_medium':
        setTimeout( function () {
          mediumcodetable.ajax.reload();
        }, 1000 );
        break;
      case 'r_priority':
        setTimeout( function () {
          priorutycodetable.ajax.reload();
        }, 1000 );
        break;
      case 'r_edu_category':
        setTimeout( function () {
          edcategorytable.ajax.reload();
        }, 1000 );
        break;
      case 'r_com_category':
        setTimeout( function () {
          comcategorytable.ajax.reload();
        }, 1000 );
        break;
    } 

    
  });

  $("#com_editbtn").click(function(){

    let entry = {
      tbname:$("#com_e_tb").val(),
      id:$("#com_e_id").val(),
      code:$("#com_e_code").val(),
      disp:$("#com_e_disp").val(),
      desc:$("#com_e_desc").val(),
    }
    
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updatecommunicationitem", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action Successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });

    switch(entry.tbname) {
      case 'c_statusreason':
        setTimeout( function () {
          statusreasontable.ajax.reload();
        }, 1000 );
        break;
      case 'e_status':
        setTimeout( function () {
          statuscodetable.ajax.reload();
        }, 1000 );
        break;
      case 'c_category':
        setTimeout( function () {
          categorycodetable.ajax.reload();
        }, 1000 );
        break;
      case 'c_topic':
        setTimeout( function () {
          topiccodetable.ajax.reload();
        }, 1000 );
        break;
      case 'pmode_medium':
        setTimeout( function () {
          mediumcodetable.ajax.reload();
        }, 1000 );
        break;
      case 'r_priority':
        setTimeout( function () {
          priorutycodetable.ajax.reload();
        }, 1000 );
        break;
      case 'r_edu_category':
          setTimeout( function () {
            edcategorytable.ajax.reload();
          }, 1000 );
          break;
      case 'r_com_category':
          setTimeout( function () {
            comcategorytable.ajax.reload();
          }, 1000 );
          break;
    } 

    
  });
  
});
