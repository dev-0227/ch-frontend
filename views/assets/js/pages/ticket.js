var weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
$(document).ready(function () {
  "use strict";
  var contacttable = $('#contacttable').DataTable({
    "order": [[ 0, 'desc' ]],
    "ajax": {
        "url": serviceUrl + "setting/getconnections",
        "type": "POST",
        "data":{clinicid:localStorage.getItem('chosen_clinic')}
    },
    "columns": [
        { data: "date",
          render: function (data, type, row) {
            return new Date(row.date).toLocaleString();
          } 
        },
        { data: "name",
          render: function (data, type, row) {
            return row.fname+" "+row.lname
          } 
        },
        { data: 'dob' },
        { data: 'phone1'},
        { data: 'contacttype',
          render: function (data, type, row) {
            if(row.contacttype == 1)
              return "<span class='tag tag-blue'>Need an Appt</span>";
            else 
              return "<span class='tag tag-blue'>Have a Question</span>";
          }  
        },
        { data: 'pttype',
          render: function (data, type, row) {
            if(row.pttype == 1)
              return "<span class='tag tag-purple'>New Patient</span>";
            else if(row.pttype == 2)
              return "<span class='tag tag-purple'>Returning Patient</span>";
            else 
              return "<span class='tag tag-purple'>Established Patient</span>";
          }  
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
              <button class="btn btn-sm btn-info badge contactviewbtn" type="button"><i class="fa fa-eye"></i></button><button class="btn btn-sm btn-danger badge contactdeletebtn" type="button"><i class="fa fa-trash"></i></button>
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deleteconnections", (xhr, err) => {
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
  $(document).on("click",".contactviewbtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/chosenconnection", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'][0];
        $("#patient-name").html(result['fname']+" "+result['mname']+" "+result['lname']);
        $("#dob").html(result['dob']);
        $("#cel").html(result['phone1']);
        $("#phone").html(result['phone2']);
        $("#email").html(result['email']);
        $("#address").html(result['address1']+" "+result['address2']+" "+result['city']+" "+result['state']+" "+result['zip']);
        $(".pttype").html(result['pttype'] == 1?"New Patient":result['pttype'] == 2?"Returning Patient":"Established Patient")
        $(".contacttype").html(result['contacttype'] == 1?"Need Appointment":"Have a question");
        if(result['contacttype'] == 1){
          var tmpapptdate = result['dates'].split(",");
          var tmpappttime = result['times'].split(",");
          $(".details").empty();
          for(var i = 0;i < tmpapptdate.length;i++){
            var timeitem = tmpappttime[i].split("|");
            for(var j = 1;j < timeitem.length;j++){
              $(".details").append(`
                <div class="col-md-auto">
                  <div class="apptitem">
                    <p class="mb-2 text-bold">${timeitem[j]}</p>
                    <p class="itemweek">${weekday[new Date(tmpapptdate[i]).getDay()]}</p>
                    <p class="itemdate">${new Date(tmpapptdate[i]).getDate()}</p>
                    <p class="mb-0">${months[new Date(tmpapptdate[i]).getMonth()]}</p>
                  </div>
                </div>
              `);
            }
          }
        }
        else{
          $(".details").empty();
          $(".details").append(`
          <div class="col-md-12">
            <p class="mt-2">${result['question']}</p>
          </div>
        `);
        }
        $("#view-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
});
