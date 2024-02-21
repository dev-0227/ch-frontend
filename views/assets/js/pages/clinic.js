$(document).ready(function () {
  "use strict";
  var clinictable = $('#clinictable').DataTable({
    "ajax": {
        "url": serviceUrl + "clinic/",
        "type": "GET"
    },
    "columns": [
        { data: "name"},
        { data: "address1",
          render: function (data, type, row) {
            return (row.address1==null?"":row.address1)+" "+(row.address2==null?"":row.address2);
          } 
        },
        { data: 'city' },
        { data: 'phone'},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input apcheck" name="apcheck" value="`+row.id+`" `+(row.apcheck==1?"checked":"")+`>
                <span class="tag custom-control-label"></span>
              </label>
            `
          } 
        },
        { data: 'status',
          render: function (data, type, row) {
            if(row.status == 1)
              return "<span class='tag tag-green'>Active</span>";
            else
              return "<span class='tag tag-red'>Inactive</span>";
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
                <button class="btn btn-sm btn-info badge clinicmanagerbtn" type="button"><i class="fa fa-user"></i></button><button class="btn btn-sm btn-primary badge cliniceditbtn" type="button"><i class="fa fa-edit"></i></button><button class="btn btn-sm btn-danger badge clinicdeletebtn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });
  $(document).on("click",".cliniceditbtn",function(){
    $("#chosen_clinic").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#eclinic_name").val(result[0]['name']);
        $("#eclinic_acronym").val(result[0]['acronym']);
        $("#eclinic_address1").val(result[0]['address1']);
        $("#eclinic_address2").val(result[0]['address2']);
        $("#eclinic_city").val(result[0]['city']);
        $("#eclinic_state").val(result[0]['state']);
        $("#eclinic_zip").val(result[0]['zip']);
        $("#eclinic_country").val(result[0]['country']);
        $("#eclinic_tel").val(result[0]['phone']);
        $("#eclinic_fax").val(result[0]['cel']);
        $("#eclinic_email").val(result[0]['email']);
        $("#eclinic_web").val(result[0]['web']);
        $("#eclinic_portal").val(result[0]['portal']);
        $("#eclinic_pos").val(result[0]['placeservice']);
        $("#eclinic_status").val(result[0]['status']);
        $("#eclinic_c_name").val(result[0]['contact_name']);
        $("#eclinic_c_email").val(result[0]['contact_email']);
        $("#eclinic_c_tel").val(result[0]['contact_tel']);
        $("#eclinic_c_cel").val(result[0]['contact_cel']);
        $("#eclinic_c_ex").val(result[0]['ex']);
        $("#eclinic_c_web").val(result[0]['contact_web']);
        if(result[0]['checkweb'] == 1)
          $("#webcheck").prop("checked",true);
        else
          $("#webcheck").prop("checked",false);
        if(result[0]['checkportal'] == 1)
          $("#portalcheck").prop("checked",true);
        else
          $("#portalcheck").prop("checked",false);
        if(result[0]['checkcontact'] == 1)
          $("#contactcheck").prop("checked",true);
        else
          $("#contactcheck").prop("checked",false);

        $("#clinic-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  
  $(document).on("click",".clinicdeletebtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              clinictable.ajax.reload();
            }, 1000 );
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });
  $(document).on("click",".clinicaddbtn",function(){
    $("#clinic-add-modal").modal("show");
  });
  $("#clinic-addbtn").click(function (e) {
    let entry = {
      name: document.getElementById('clinic_name').value,
      acronym: document.getElementById('clinic_acronym').value,
      address1: document.getElementById('clinic_address1').value,
      address2: document.getElementById('clinic_address2').value,
      city: document.getElementById('clinic_city').value,
      state: document.getElementById('clinic_state').value,
      zip: document.getElementById('clinic_zip').value,
      country: document.getElementById('clinic_country').value,
      tel: document.getElementById('clinic_tel').value,
      fax: document.getElementById('clinic_fax').value,
      email: document.getElementById('clinic_email').value,
      web: document.getElementById('clinic_web').value,
      portal: document.getElementById('clinic_portal').value,
      pos: document.getElementById('clinic_pos').value,
      status: document.getElementById('clinic_status').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/add", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "clinic is added successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      clinictable.ajax.reload();
    }, 1000 );
  });
  $("#clinic-editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_clinic').value,
      name: document.getElementById('eclinic_name').value,
      acronym: document.getElementById('eclinic_acronym').value,
      address1: document.getElementById('eclinic_address1').value,
      address2: document.getElementById('eclinic_address2').value,
      city: document.getElementById('eclinic_city').value,
      state: document.getElementById('eclinic_state').value,
      zip: document.getElementById('eclinic_zip').value,
      country: document.getElementById('eclinic_country').value,
      tel: document.getElementById('eclinic_tel').value,
      fax: document.getElementById('eclinic_fax').value,
      email: document.getElementById('eclinic_email').value,
      web: document.getElementById('eclinic_web').value,
      portal: document.getElementById('eclinic_portal').value,
      pos: document.getElementById('eclinic_pos').value,
      status: document.getElementById('eclinic_status').value,
      cname: document.getElementById('eclinic_c_name').value,
      cemail: document.getElementById('eclinic_c_email').value,
      ctel: document.getElementById('eclinic_c_tel').value,
      ccel: document.getElementById('eclinic_c_cel').value,
      cex: document.getElementById('eclinic_c_ex').value,
      cweb: document.getElementById('eclinic_c_web').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "clinic is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      clinictable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click","#webcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$("#chosen_clinic").val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updatewebcheck", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click","#portalcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$("#chosen_clinic").val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updateportalcheck", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click","#contactcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$("#chosen_clinic").val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updatecontactcheck", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".apcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updateapcheck", (xhr, err) => {
      if (!err) {
        return $.growl.notice({
          message: "Action successfully"
        });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".clinicmanagerbtn",function(){
    $("#chosen_clinic").val($(this).parent().attr("idkey"));
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:document.getElementById('chosen_clinic').value}, "clinic/getclinicmanagers", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['managers'];
        $("#clinicmanagers").empty();
        for(var i = 0;i < result.length;i++){
          $("#clinicmanagers").append(`
              <option value = "`+result[i]['id']+`">${result[i]['fname']+" "+result[i]['lname']}</option>
          `);
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:document.getElementById('chosen_clinic').value}, "clinic/chosenclinicmanagers", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            if(result.length > 0)
              $("#clinicmanagers").val(result[0]['manager']).trigger('change');
            $("#clinic-manager-modal").modal("show");
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
  });
  $(document).on("click","#clinic-managerbtn",function(){
    let entry={
      manager:$("#clinicmanagers").val(),
      clinicid:document.getElementById('chosen_clinic').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/addclinicmanagers", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['message'];
        if(result == "OK")
          return $.growl.notice({
            message: "Action Successfully"
          });
        else
          return $.growl.error({
            message: "Action Failed"
          });
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
});
