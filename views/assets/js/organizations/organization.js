$(document).ready(function () {
  "use strict";

  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "organization/type", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['id']+'" >'+result[i]['display']+'</option>';
      }
      $("#utype").html(options);
      $("#atype").html(options);
    }
  });

  var organization_table = $('#organization_table').DataTable({
    "ajax": {
      "url": serviceUrl + "organization/",
      "type": "GET",
      "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    serverSide: true,
    "pageLength": 10,
    "order": [],
    "columns": [
        { data: 'name' ,
            render: function(data, type, row) {
                return row.name;
            }
        },
        { data: 'alias',
          render: function (data, type, row) {
            return row.alias;
          } 
        },
        { data: 'display', 
            render: function(data, type, row) {
                return row.display;
            }
          },
          { data: 'email',
            render: function (data, type, row) {
              return row.email;
            }  
        },
        { data: 'address1',
            render: function (data, type, row) {
              return row.address1;
            }  
        },
        { data: 'phone1',
            render: function (data, type, row) {
              return row.phone1;
            }  
        },
        { data: 'statusid',
            render: function (data, type, row) {
              if(row.statusid == 1)
                return '<div class="badge badge-success fw-bold badge-lg">Active</span>';
              else
                return '<div class="badge badge-danger fw-bold badge-lg">Inactive</span>';
            }  
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top " idkey="`+row.id+`">
                <button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i></button>
                <button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });

  $('#table_search_input').on('keyup', function () {
    organization_table.search(this.value).draw();
  });

  $(document).on("click",".organizationaddbtn",function(){
    $("#chosen_organization").val('');
    $("#aname").val('');
    $("#atype").val('').trigger('change');
    $("#aalias").val('');
    $("#amode").val('');
    $("#aaddress1").val('');
    $("#aaddress2").val('');
    $("#acity").val('');
    $("#astate").val('New York').trigger('change');
    $("#aphone1").val('');
    $("#aphone2").val('');
    $("#aphone3").val('');
    $("#amobile").val('');
    $("#afax").val('');
    $("#aemail").val('');
    $("#adescription").val('');
    $("#acharacteristic").val('');
    $("#organization-add-modal").modal("show");
    $("#azip").val('');
    $("#astatus").val(1).trigger('change');
  });

  $("#create_btn").click(function (e) {
    if($("#aname").val() == ""){
      toastr.info('Please enter Organization Name');
      $("#aname").focus();
      return;
    }
    if($("#atype").val() === null){
      toastr.info('Please enter Organization Type');
      $("#atype").focus();
      return;
    }
    if($("#aaddress1").val() == ""){
      toastr.info('Please enter an Address');
      $("#aaaddress1").focus();
      return;
    }
    if($("#aphone1").val() == ""){
      toastr.info('Please enter a Phone');
      $("#aphone1").focus();
      return;
    }
    let entry = {
      status: document.getElementById('astatus').value,
      name: document.getElementById('aname').value,
      type: document.getElementById('atype').value,
      alias: document.getElementById('aalias').value,
      mode: document.getElementById('amode').value,
      address1: document.getElementById('aaddress1').value,
      address2: document.getElementById('aaddress2').value,
      address3: '',
      city: document.getElementById('acity').value,
      state: document.getElementById('astate').value,
      phone1: document.getElementById('aphone1').value,
      phone2: document.getElementById('aphone2').value,
      phone3: document.getElementById('aphone3').value,
      mobile: document.getElementById('amobile').value,
      fax: document.getElementById('afax').value,
      email: document.getElementById('aemail').value,
      description: document.getElementById('adescription').value,
      characteristic: document.getElementById('acharacteristic').value,
      longitude: '',
      latitude: '',
      altitude: '',
      daysoperation: '',
      hoursoperation:'',
      virticalservice: '',
      endpoint: '',
      map: '',
      zip: document.getElementById('azip').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/add", (xhr, err) => {
        if (!err) {
          if (JSON.parse(xhr.responseText)['msg'] == 'exist')
            toastr.warning('The organization is already exist!');
          else {
            toastr.success("organization is added successfully");
            $("#organization-add-modal").modal("hide");
          }
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      organization_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".edit_btn",function(){
    $("#chosen_organization").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#uname").val(result[0]['name']);
        $("#utype").val(result[0]['typeid']).trigger('change');
        $("#ualias").val(result[0]['alias']);
        $("#umode").val(result[0]['modeid']);
        $("#uaddress1").val(result[0]['address1']);
        $("#uaddress2").val(result[0]['address2']);
        $("#ucity").val(result[0]['city']);
        $("#ustate").val(result[0]['state']).trigger('change');
        $("#uphone1").val(result[0]['phone1']);
        $("#uphone2").val(result[0]['phone2']);
        $("#uphone3").val(result[0]['phone3']);
        $("#umobile").val(result[0]['mobile']);
        $("#ufax").val(result[0]['fax']);
        $("#uemail").val(result[0]['email']);
        $("#udescription").val(result[0]['description']);
        $("#ucharacteristic").val(result[0]['characteristic']);
        $("#uzip").val(result[0]['zip']);
        $("#ustatus").val(result[0]['statusid']).trigger('change');
        $("#organization-edit-modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });

  $("#update_btn").click(function (e) {
    if($("#uname").val() == ""){
      toastr.info('Please enter Organization Name');
      $("#uname").focus();
      return;
    }
    if($("#utype").val() === null){
      toastr.info('Please enter Organization Type');
      $("#utype").focus();
      return;
    }
    if($("#uaddress1").val() == ""){
      toastr.info('Please enter an Address');
      $("#uaaddress1").focus();
      return;
    }
    if($("#uphone1").val() == ""){
      toastr.info('Please enter a Phone');
      $("#uphone1").focus();
      return;
    }
    let entry = {
      id: $("#chosen_organization").val(),
      status: $("#ustatus").val(),
      name: document.getElementById('uname').value,
      type: document.getElementById('utype').value,
      alias: document.getElementById('ualias').value,
      mode: document.getElementById('umode').value,
      address1: document.getElementById('uaddress1').value,
      address2: document.getElementById('uaddress2').value,
      address3: '',
      city: document.getElementById('ucity').value,
      state: document.getElementById('ustate').value,
      phone1: document.getElementById('uphone1').value,
      phone2: document.getElementById('uphone2').value,
      phone3: document.getElementById('uphone3').value,
      mobile: document.getElementById('umobile').value,
      fax: document.getElementById('ufax').value,
      email: document.getElementById('uemail').value,
      description: document.getElementById('udescription').value,
      characteristic: document.getElementById('ucharacteristic').value,
      longitude: '',
      latitude: '',
      altitude: '',
      daysoperation: '',
      hoursoperation:'',
      virticalservice: '',
      endpoint: '',
      map: '',
      zip: document.getElementById('uzip').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/update", (xhr, err) => {
        if (!err) {
          if (JSON.parse(xhr.responseText)['msg'] == 'exist')
            toastr.warning('The organization is already exist!');
          else {
            toastr.success("organization is updated successfully");
            $("#organization-edit-modal").modal("hide");
          }
        } else {
          return toastr.error("Action Failed");
        }
    });
    setTimeout( function () {
      organization_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".delete_btn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    Swal.fire({
      text: "Are you sure you would like to delete?",
      icon: "error",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, return",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-primary"
      }
    }).then(function (result) {
      if (result.value) {
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "organization/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              organization_table.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
    });
  });
});
