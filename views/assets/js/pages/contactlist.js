$(document).ready(function () {
  "use strict";
  var contacttable = $('#contacttable').DataTable({
    "order": [[ 0, 'desc' ]],
    "ajax": {
        "url": serviceUrl + "setting/getcontacts",
        "type": "GET"
    },
    "columns": [
        { data: "date",
          render: function (data, type, row) {
            return new Date(row.date).toLocaleString();
          } 
        },
        { data: "name"},
        { data: 'email' },
        { data: 'phone'},
        { data: 'message',
          render: function (data, type, row) {
            return `
              <div class="messagearea">
              `+row.message+`
              </div>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
                <button class="btn btn-sm btn-danger badge contactdeletebtn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });
  
  $(document).on("click",".contactdeletebtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletecontact", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              contacttable.ajax.reload();
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
