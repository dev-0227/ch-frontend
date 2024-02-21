function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
$(document).ready(function () {
  "use strict";
  let qid = getUrlVars();
  $("#notes-created").html(localStorage.getItem('username')+" : "+new Date().toLocaleString())
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
      loadcharts();
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getavaiuserchosenclinic", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data'];
      $("#notes-assuser").empty();
      $("#notes-assuser").append("<option value='0'>All</option>");
      for(var i = 0; i < data.length;i++){
        $("#notes-assuser").append("<option value='"+data[i]['id']+"'>"+data[i]['fname']+" "+data[i]['lname']+"</option>");
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  loadptinfo();
  loadnotes();
  $("#notes-submit").click(function(){
    let entry = {
      qid:qid['qid'],
      note:$("#notes-text").val(),
      assignuser:$("#notes-assuser").val(),
      status:$(".notes-status:checked").val(),
      createduser:localStorage.getItem('userid'),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/writenotes", (xhr, err) => {
      if (!err) {
        loadnotes();
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
  $(document).on("click",".updatenotebtn",function(){
    $("#notetext").val($(this).parent().parent().parent().find(".notearea").html())
    $("#chosen_note").val($(this).parent().attr("key"));
    $("#update-modal").modal("show");
  });
  $("#updatebtn").click(function(){
    let entry={
      id:$("#chosen_note").val(),
      note:$("#notetext").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/updatenote", (xhr, err) => {
      if (!err) {
        loadnotes();
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".deletenotebtn",function(){
    let entry = {
      id: $(this).parent().attr("key"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/deletenote", (xhr, err) => {
          if (!err) {
            loadnotes();
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
async function loadnotes(){
  let qid = getUrlVars();
  let noteentry = {
    qid:qid['qid'],
    clinicid:localStorage.getItem('chosen_clinic'),
    userid:localStorage.getItem('userid'),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), noteentry, "hedis/getallnotes", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data'];
      $(".allnotes-table").empty();
      for(var i = 0;i< data.length;i++){
        $(".allnotes-table").append(`
          <li class="list-separated-item p-3">
            <div class="row align-items-center">
              <div class="col-auto">
                <img class="avatar brround avatar-md d-block cover-image" src="../assets/images/users/12.jpg">
              </div>
              <div class="col">
                <div>
                  <a href="javascript:void(0)" class="text-inherit" key='${data[i]['id']}'>`+data[i]['fname']+" "+data[i]['lname']+(data[i]['createduser']==localStorage.getItem('userid')?"&nbsp;<i class='fa fa-pencil text-info updatenotebtn'></i>&nbsp;<i class='fa fa-trash text-danger deletenotebtn'></i>":"")+`</a>
                </div>
                <small class="d-block item-except text-sm text-muted h-1x">`+new Date(data[i]['created']).toLocaleString()+`</small>
                <div class='notearea'>`+data[i]['note']+`</div>
              </div>
              <div class="col-auto">
                
              </div>
            </div>
          </li>
        `);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
async function loadcharts(){
  let qid = getUrlVars();
  let entry = {
    qid:qid['qid'],
    clinicid:localStorage.getItem('chosen_clinic'),
    cyear:$("#hedisdate").val(),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getchartforallnotes", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data'];
      $(".completednotemeasure").empty();
      $(".notcompletednotemeasure").empty();
      var completecnt = 0;
      for(var i=0;i<data.length;i++){
        if(data[i]['status'] == 1||data[i]['status'] == 2||data[i]['status'] == 3){
          $(".completednotemeasure").append(`
            <li class="p-1">
              <span class="list-label"></span>`+data[i]['measure']+`
            </li>
          `);
          completecnt++;
        }
        else{
          $(".notcompletednotemeasure").append(`
            <li class="p-1">
              <span class="list-label"></span>`+data[i]['measure']+`
            </li>
          `);
        }
      }
      $(".completedpernote").html(Math.round(completecnt/data.length*100));
      $(".notcompletedpernote").html((100-Math.round(completecnt/data.length*100)));
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}
async function loadptinfo(){
  let qid = getUrlVars();
  let entry = {
    qid:qid['qid'],
    clinicid:localStorage.getItem('chosen_clinic'),
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/getptinfonotes", (xhr, err) => {
    if (!err) {
      let data = JSON.parse(xhr.responseText)['data'];
      $("#notes-modal-name").html(data[0]['ptfname']+" "+data[0]['ptlname']);
      $("#notes-modal-mid").html(data[0]['mid']);
      $("#notes-modal-dob").html(new Date(data[0]['dob']).toLocaleDateString());
      $("#notes-modal-phone").html(data[0]['phone']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}

