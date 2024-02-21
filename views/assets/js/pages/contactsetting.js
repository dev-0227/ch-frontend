$(document).ready(async function () {
  "use strict";
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getconnectiondesc", (xhr, err) => {
    if (!err) {
      let gdesc = JSON.parse(xhr.responseText)['gdesc'];
      let sdesc = JSON.parse(xhr.responseText)['sdesc'];
      if(gdesc.length > 0){
        $("#gdesc").val(gdesc[0]['desc']);
      }
      if(sdesc.length > 0){
        $("#sdesc").val(sdesc[0]['desc']);
        if(sdesc[0]['age'] == 1)
          $(".connectiondesctype").prop("checked",true);
        else
          $(".connectiondesctype").prop("checked",false);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getqrcodetype", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['result'];
      if(result.length > 0){
        if(result[0]['age'] == 1)
          $("#sitetype").prop("checked",true);
        else
          $("#sitetype").prop("checked",false);
        $("#manageremails").val(result[0]['desc']);
        $("#manageremails").tagsinput();
      }
      else{
        $("#sitetype").prop("checked",false);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  var questiontable = $('#questiontable').DataTable({
    "ajax": {
        "url": serviceUrl + "setting/getcontactquestions",
        "type": "GET"
    },
    "columns": [
        { data: "question" },
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
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editqbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deleteqbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  var restable = $('#restable').on('init.dt', function () {
    $("input[id^=a]").tagsinput();
  }).DataTable(
    {
      "ajax": {
          "url": serviceUrl + "setting/getcontactr",
          "type": "GET",
      },
      "columns": [
        { "data": "name"},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-danger deletereskeybtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
      ],
      "aoColumnDefs": [
          {
              "aTargets": [0],
              "mData": "headers",
              "mRender": function (data, type, full) {
                  return '<input class="form-control" type="text" data-role="tagsinput"  id="a' + full.id + '" onchange="changeAlias(' + full.id + ')" value="' + data + '">';
              }
          }
      ]
    }
  );
  var mtable = $('#mtable').DataTable({
    "ajax": {
        "url": serviceUrl + "setting/getcontactm",
        "type": "GET",
    },
    "columns": [
        { data: "name",
          render: function (data, type, row) {
            return "<a href='../pages/generatemodule?id="+row.id+"'>"+row.name+"</a>"
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
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editmodulebtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletemodulebtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  $(document).on("click","#questionaddbtn",function(){
    $("#question-add-modal").modal("show");
  });
  $("#qaddbtn").click(function (e) {
    let entry = {
      question: document.getElementById('question').value,
      status: document.getElementById('qstatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addcontactq", (xhr, err) => {
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
    setTimeout( function () {
      questiontable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editqbtn",function(){
    $("#chosen_q").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_q").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/chosencontactq", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#squestion").val(result[0]['question']);
        $("#eqstatus").val(result[0]['status']);
        $("#question-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#qeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_q').value,
      question: document.getElementById('squestion').value,
      status: document.getElementById('eqstatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updatecontactq", (xhr, err) => {
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
    setTimeout( function () {
      questiontable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deleteqbtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletecontactq", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              questiontable.ajax.reload();
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

  //Response Key Area
  $(document).on("click","#resaddbtn",function(){
    $("#res-add-modal").modal("show");
  });
  $("#reskeyaddbtn").click(function (e) {
    let entry = {
      name: document.getElementById('reskey').value,
      status: document.getElementById('reskeystatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addcontactr", (xhr, err) => {
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
    setTimeout( function () {
      restable.ajax.reload(function(){
        $("#restable input[id^=a]").tagsinput();
      });
    }, 1000 );
  });
  $(document).on("click",".deletereskeybtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletecontactr", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              restable.ajax.reload(function(){
                $("#restable input[id^=a]").tagsinput();
              });
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

  //Module Area
  $(document).on("click","#maddbtn",function(){
    $("#module-add-modal").modal("show");
  });
  $("#moduleaddbtn").click(function (e) {
    let entry = {
      name: document.getElementById('module').value,
      status: document.getElementById('modulestatus').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/addcontactm", (xhr, err) => {
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
    setTimeout( function () {
      mtable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editmodulebtn",function(){
    $("#chosen_m").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_m").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/chosencontactm", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#emodule").val(result[0]['name']);
        $("#emodulestatus").val(result[0]['status']);
        $("#module-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#moduleeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_m').value,
      name: document.getElementById('emodule').value,
      status: document.getElementById('emodulestatus').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updatecontactm", (xhr, err) => {
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
    setTimeout( function () {
      mtable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletemodulebtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/deletecontactm", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              mtable.ajax.reload();
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


  //general 
  $(".connectiondesctype").change(function(){
    var checkvalue = 0;
    if($(this).prop("checked"))
      checkvalue = 1;
    else
      checkvalue = 0;
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:checkvalue}, "setting/updateconnectiondesctype", (xhr, err) => {
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
  $(".updateconnectiondesc").click(function(){
    let entry = {
      gdesc:$("#gdesc").val(),
      sdesc:$("#sdesc").val(),
      clinicid:localStorage.getItem('chosen_clinic')
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/updateconnectiondesc", (xhr, err) => {
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
  $("#sitetype").change(function(){
    var checkvalue = 0;
    if($(this).prop("checked"))
      checkvalue = 1;
    else
      checkvalue = 0;
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:checkvalue}, "setting/updateqrcodevalue", (xhr, err) => {
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
  $("#manageremails").change(function(){
    var source = event.target || event.srcElement;
    if (source.constructor.name !== 'XMLHttpRequest') {
      let value = $(this).val();
      sendRequestWithToken('POST', localStorage.getItem('authToken'), { clinicid:localStorage.getItem('chosen_clinic'), value: value }, "setting/updateqrcodeemails", (xhr, err) => {
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
    }
  });
});
changeAlias = (id) => {
  var source = event.target || event.srcElement;
  if (source.constructor.name !== 'XMLHttpRequest') {
      let value = document.getElementById('a' + id).value;
      sendRequestWithToken('POST', localStorage.getItem('authToken'), { id: id, value: value }, "setting/updatecontactr", (xhr, err) => {
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
  }
}
