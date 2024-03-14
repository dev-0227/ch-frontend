function DateFormat(serial) {
  let year = serial.getFullYear();
  let month = serial.getMonth() + 1;
  let dt = serial.getDate();

  if (dt < 10) {
      dt = '0' + dt;
  }
  if (month < 10) {
      month = '0' + month;
  }
  return month+'/'+dt+'/'+year;
}
$(document).ready(function () {
  "use strict";
  
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
      var visittable = $('#visittable').DataTable({
        "ajax": {
            "url": serviceUrl + "hedis/getNcompliant",
            "type": "POST",
            "data":{clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val()}
        },
        "columns": [
            { data: 'insName'},
            { data: 'mid' },
            { data: "fname",
              render: function (data, type, row) {
                return row.ptfname+" "+row.ptlname;
              } 
            },
            { data: 'dob',
              render: function (data, type, row) {
                return DateFormat(new Date(row.dob));
              } 
            },
            { data: 'lastdate',
              render: function (data, type, row) {
                return DateFormat(new Date(row.lastdate));
              } 
            },
            { data: 'measure'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-default badge notesbtn ${row.notecheck != null?"notesavailbtn":""}" type="button"><i class="fa fa-sticky-note-o"></i></button><button class="btn btn-sm btn-info badge viewbtn" type="button"><i class="ti-eye"></i></button>
                  </div>
                `
              } 
            }
        ]
      });
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(".refreshbtn").click(function(){
    location.reload();
  });
  
  $(document).on("click",".printbtn",function(){
    $("#chosen_item").val($(this).parent().parent().children().eq(1).html());
    $("body").append("<form id = 'printncompliantform' action = '"+serviceUrl+"hedis/printncompliant' method = 'POST' target='_blank'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /></form>");
    $("#printncompliantform").submit();
    $("#printncompliantform").remove();
  });
  $(".emailbtn").click(function(){
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#hedisdate").val()}, "hedis/ncompliantemail", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText);
            if(result['message'] == "success")
              return $.growl.notice({
                message: "Sent Successfully"
              });
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });
  $(".exportexcelbtn").click(function(){
    $("body").append("<form id = 'excelexportform' action = '"+serviceUrl+"hedis/exportncompliantexcel' method = 'POST'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /></form>");
    $("#excelexportform").submit();
    $("#excelexportform").remove();
  });
  $("#notes-submit").click(function(){
    let entry = {
      qid:$("#chosen_item").val(),
      note:$("#notes-text").val(),
      assignuser:$("#notes-assuser").val(),
      status:$(".notes-status:checked").val(),
      createduser:localStorage.getItem('userid'),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/writenotes", (xhr, err) => {
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
  $(document).on("click",".notesbtn",function(){
    $("#chosen_item").val($(this).parent().attr("idkey"));
    $("#notes-modal-title").html($(this).parent().parent().parent().children().eq(2).html());
    $("#notes-modal-name").html($(this).parent().parent().parent().children().eq(2).html());
    $("#notes-modal-mid").html($(this).parent().parent().parent().children().eq(1).html());
    $("#notes-modal-dob").html($(this).parent().parent().parent().children().eq(3).html());
    $("#notes-created").html(localStorage.getItem('username')+" : "+new Date().toLocaleString());
    $("#allviewnotes").empty();
    $("#allviewnotes").append('<a href="../pages/notesview?qid='+$("#chosen_item").val()+'" target="_blank" class="form-control-label text-primary">See More</a>');
    let noteentry = {
      mid:$(this).parent().parent().parent().children().eq(1).html(),
      clinicid:localStorage.getItem('chosen_clinic'),
      userid:localStorage.getItem('userid'),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), noteentry, "hedis/getnotes", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $("#token_area").empty();
        for(var i = 0;i< data.length;i++){
          $("#token_area").append("<div><span class='text-primary'>"+data[i]['fname']+" "+data[i]['lname']+" "+new Date(data[i]['created']).toLocaleString()+" > </span>"+data[i]['note']+"</div>")
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
    let entry = {
      mid:$(this).parent().parent().children().eq(2).html(),
      clinicid:localStorage.getItem('chosen_clinic'),
      cyear:$("#hedisdate").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getavaiuserchosenclinic", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $("#notes-assuser").empty();
        $("#notes-assuser").append("<option value='0'>All</option>");
        for(var i = 0; i < data.length;i++){
          $("#notes-assuser").append("<option value='"+data[i]['id']+"'>"+data[i]['fname']+" "+data[i]['lname']+"</option>");
        }
        $("#notes-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".viewbtn",function(){
    $("#chosen_item").val($(this).parent().attr("idkey"));
    $("#view-modal-title").html($(this).parent().parent().parent().children().eq(2).html());
    $("#view-modal-name").html($(this).parent().parent().parent().children().eq(2).html());
    $("#view-modal-mid").html($(this).parent().parent().parent().children().eq(1).html());
    $("#view-modal-dob").html($(this).parent().parent().parent().children().eq(3).html());
    $("#view-modal-ins").html($(this).parent().parent().parent().children().eq(0).html());
    $("#view-modal-measure").html($(this).parent().parent().parent().children().eq(5).html());
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$("#chosen_item").val()}, "hedis/chosenHedisitem", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        // $(".next-date").val(DateFormat(new Date(result[0]['nextdate'])));
        $(".last-date").val(DateFormat(new Date(result[0]['lastdate'])));
        $("#view-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#dateupdatebtn").click(function(){
    let entry = {
      id:$("#chosen_item").val(),
      nextdate:$(".next-date").val(),
      lastdate:$(".last-date").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/updatevisitdate", (xhr, err) => {
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
  
});
