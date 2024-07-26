$(document).ready(function () {
  "use strict";

  // sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'insurance/gettype', (xhr, err) => {
  //   if (!err) {
  //     var result = JSON.parse(xhr.responseText)['data']
  //     var option = ``
  //     result.forEach(item => {
  //       option += `<option value='${item.id}'>${item.display}</option>`
  //     })
  //     $('#einstype').html(option)
  //     $('#instype').html(option)
  //   }
  // })

  // sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'insurance/getPaymentMethod', (xhr, err) => {
  //   if (!err) {
  //     var result = JSON.parse(xhr.responseText)['data']
  //     var option = ``
  //     result.forEach(item => {
  //       option += `<option value='${item.id}'>${item.display}</option>`
  //     })
  //     $('#epaymethod').html(option)
  //     $('#paymethod').html(option)
  //   }
  // })

  var insurancetable = $('#insurancetable').DataTable({
    "ajax": {
        "url": serviceUrl + "insurance/",
        "type": "GET"
    },
    "order": [[3, 'asc']],
    "columns": [
        { data: "id"},
        { data: "insName"},
        { data: 'abbrName' },
        { data: 'insaddress',
          render: function (data, type, row) {
              return row.insaddress+" "+row.insaddress2;
          } 
        },
        { data: 'lob',
          render: function (data, type, row) {
            if(row.lob == 1)
              return "<span class='badge badge-light-success badge-lg px-4'> True </span>";
            else
              return "<span class='badge badge-light-danger badge-lg px-4'> False </span>";
          }
        },
        { data: 'hedis_active',
          render: function (data, type, row) {
            if(row.hedis_active==1)
              return "<span class='badge badge-success badge-lg px-4'> Active </span>";
            else
              return "<span class='badge badge-danger badge-lg px-3'>Inactive</span>";
          } 
        },
        { data: 'Inactive',
          render: function (data, type, row) {
            if(row.Inactive == 0)
              return "<span class='badge badge-success badge-lg px-4'> Active </span>";
            else
              return "<span class='badge badge-danger badge-lg px-3'>Inactive</span>";
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
                <button class="btn btn-sm btn-primary badge insuranceeditbtn" type="button"><i class="fa fa-edit"></i></button><button class="btn btn-sm btn-danger badge insurancedeletebtn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });

  $('#table_search_input').on('keyup', function () {
    insurancetable.search(this.value).draw();
  });
  $(document).on("click",".insuranceaddbtn",function(){
    $("#insname").val('');
    $("#abbrname").val('');
    $("#insaddress1").val('');
    $("#insaddress2").val('');
    $("#inscity").val('');
    $("#insstate").val('');
    $("#inszip").val('');
    $("#insphone").val('');
    $("#insfax").val('');
    $("#insemail").val('');
    $("#hedis").val('');
    $("#insstatus").val('');
    $("#insurance-add-modal").modal("show");
  });
  $("#insaddbtn").click(function (e) {
    if($("#insname").val() == ""){
      toastr.info('Please enter Insurance Name');
      $("#insname").focus();
      return;
    }
    if($("#abbrname").val() == ""){
      toastr.info('Please enter Abbr Name');
      $("#abbrname").focus();
      return;
    }
    if($("#insaddress1").val() == ""){
      toastr.info('Please enter Address');
      $("#insaddress1").focus();
      return;
    }
    let entry = {
      name: document.getElementById('insname').value,
      abbr: document.getElementById('abbrname').value,
      email: document.getElementById('insemail').value,
      fax: document.getElementById('insfax').value,
      phone: document.getElementById('insphone').value,
      address1: document.getElementById('insaddress1').value,
      address2: document.getElementById('insaddress2').value,
      city: document.getElementById('inscity').value,
      state: document.getElementById('insstate').value,
      zip: document.getElementById('inszip').value,
      hedis: document.getElementById('hedis').value,
      status: document.getElementById('insstatus').value,
      lob: $('#inslob').prop('checked') == true ? 1 : 0,
      // instype: $('#instype').val(),
      // payment_method: $('#paymethod').val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/add", (xhr, err) => {
        if (!err) {
          $("#insurance-add-modal").modal("hide");
          toastr.success('Insurance is added successfully');
        } else {
          toastr.error('Action Failed');
        }
    });
    setTimeout( function () {
      insurancetable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".insuranceeditbtn",function(){
    $("#chosen_insurance").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#einsname").val(result[0]['insName']);
        $("#eabbrname").val(result[0]['abbrName']);
        $("#einsaddress1").val(result[0]['insaddress']);
        $("#einsaddress2").val(result[0]['insaddress2']);
        $("#einscity").val(result[0]['inscity']);
        $("#einsstate").val(result[0]['insstate']);
        $("#einszip").val(result[0]['inszip']);
        $("#einsphone").val(result[0]['insphone']);
        $("#einsfax").val(result[0]['insfax']);
        $("#einsemail").val(result[0]['insemail']);
        $("#ehedis").val(result[0]['hedis_active']);
        $("#einsstatus").val(result[0]['Inactive']);
        // $('#einstype').val(result[0]['instype']).trigger('change')
        // $('#epaymethod').val(result[0]['payment_method']).trigger('change')
        result[0]['lob'] == 0 ? $('#einslob').prop('checked', false) : $('#einslob').prop('checked', true)

        $("#insurance-edit-modal").modal("show");
      } else {
        toastr.error('Action Failed');
      }
    });
  });
  $("#inseditbtn").click(function (e) {
    if($("#einsname").val() == ""){
      toastr.info('Please enter Insurance Name');
      $("#einsname").focus();
      return;
    }
    if($("#eabbrname").val() == ""){
      toastr.info('Please enter Abbr Name');
      $("#eabbrname").focus();
      return;
    }
    if($("#einsaddress1").val() == ""){
      toastr.info('Please enter Address');
      $("#einsaddress1").focus();
      return;
    }
    
    let entry = {
      id: document.getElementById('chosen_insurance').value,
      name: document.getElementById('einsname').value,
      abbr: document.getElementById('eabbrname').value,
      email: document.getElementById('einsemail').value,
      fax: document.getElementById('einsfax').value,
      phone: document.getElementById('einsphone').value,
      address1: document.getElementById('einsaddress1').value,
      address2: document.getElementById('einsaddress2').value,
      city: document.getElementById('einscity').value,
      state: document.getElementById('einsstate').value,
      zip: document.getElementById('einszip').value,
      hedis: document.getElementById('ehedis').value,
      status: document.getElementById('einsstatus').value,
      lob: $('#einslob').prop('checked') == true ? 1 : 0,
      // instype: $('#einstype').val(),
      // payment_method: $('#epaymethod').val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/update", (xhr, err) => {
        if (!err) {
          $("#insurance-edit-modal").modal("hide");
          toastr.success('Insurance is updated successfully');
        } else {
          toastr.error('Action Failed');
        }
    });
    setTimeout( function () {
      insurancetable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".insurancedeletebtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              insurancetable.ajax.reload();
            }, 1000 );
          } else {
            toastr.error('Action Failed');
          }
        });
      }
		});

    
  });
});
