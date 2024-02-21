$(document).ready(function () {
  "use strict";
  var insurancetable = $('#insurancetable').DataTable({
    "ajax": {
        "url": serviceUrl + "insurance/",
        "type": "GET"
    },
    "columns": [
        { data: "insName"},
        { data: 'insphone' },
        { data: 'insaddress',
          render: function (data, type, row) {
              return row.insaddress+" "+row.insaddress2;
          } 
        },
        { data: 'Inactive',
          render: function (data, type, row) {
            if(row.Inactive == 0)
              return "<span class='tag tag-green'>Active</span>";
            else
              return "<span class='tag tag-red'>Inactive</span>";
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
  $(document).on("click",".insuranceaddbtn",function(){
    $("#insurance-add-modal").modal("show");
  });
  $("#insaddbtn").click(function (e) {
    let entry = {
      name: document.getElementById('insname').value,
      email: document.getElementById('insemail').value,
      fax: document.getElementById('insfax').value,
      phone: document.getElementById('insphone').value,
      address1: document.getElementById('insaddress1').value,
      address2: document.getElementById('insaddress2').value,
      city: document.getElementById('inscity').value,
      state: document.getElementById('insstate').value,
      zip: document.getElementById('inszip').value,
      status: document.getElementById('insstatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/add", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Insurance is added successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
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
        $("#einsaddress1").val(result[0]['insaddress']);
        $("#einsaddress2").val(result[0]['insaddress2']);
        $("#einscity").val(result[0]['inscity']);
        $("#einsstate").val(result[0]['insstate']);
        $("#einszip").val(result[0]['inszip']);
        $("#einsphone").val(result[0]['insphone']);
        $("#einsfax").val(result[0]['insfax']);
        $("#einsemail").val(result[0]['insemail']);
        $("#einsstatus").val(result[0]['Inactive']);

        $("#insurance-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#inseditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_insurance').value,
      name: document.getElementById('einsname').value,
      email: document.getElementById('einsemail').value,
      fax: document.getElementById('einsfax').value,
      phone: document.getElementById('einsphone').value,
      address1: document.getElementById('einsaddress1').value,
      address2: document.getElementById('einsaddress2').value,
      city: document.getElementById('einscity').value,
      state: document.getElementById('einsstate').value,
      zip: document.getElementById('einszip').value,
      status: document.getElementById('einsstatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "Insurance is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
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
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              insurancetable.ajax.reload();
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
});
