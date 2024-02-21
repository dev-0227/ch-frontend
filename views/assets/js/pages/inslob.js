$(document).ready(async function () {
  "use strict";
  $("#inslobtable").DataTable();
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance/", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#inslist").empty();
      $("#inslist").append(`
            <option value = "0">Select Insurance</option>
        `);
      for(var i = 0; i < result.length; i++){
        $("#inslist").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['insName']+`</option>
        `);
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  $("#inslist").change(function(){
    let entry = {
      id:$(this).val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/getlob", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#inslobtable tbody").empty();
        for(var i = 0;i < result.length;i++){
          $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".inslobaddbtn",function(){
    if($("#inslist").val() == 0)
      return $.growl.notice({
        message: "Please select insurance"
      });
    else
      $("#inslob-add-modal").modal("show");
  });
  $("#inslobaddbtn").click(function (e) {
    let entry = {
      insid: document.getElementById('inslist').value,
      name: document.getElementById('lobname').value,
      desc: document.getElementById('lobdesc').value,
      variation: document.getElementById('lobvar').value,
      type: document.getElementById('lobtype').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/addlob", (xhr, err) => {
        if (!err) {
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
            if (!err) {
              let result = JSON.parse(xhr.responseText)['data'];
              $("#inslobtable tbody").empty();
              for(var i = 0;i < result.length;i++){
                $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
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
  });
  $(document).on("click",".inslobeditbtn",function(){
    $("#chosen_inslob").val($(this).parent().parent().parent().attr("id"));
    let entry = {
      id: $(this).parent().parent().parent().attr("id"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/chosenlob", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#elobname").val(result[0]['lob']);
        $("#elobdesc").val(result[0]['description']);
        $("#elobvar").val(result[0]['variation']);
        $("#elobtype").val(result[0]['type']);

        $("#inslob-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#inslobeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_inslob').value,
      name: document.getElementById('elobname').value,
      desc: document.getElementById('elobdesc').value,
      variation: document.getElementById('elobvar').value,
      type: document.getElementById('elobtype').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/updatelob", (xhr, err) => {
        if (!err) {
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
            if (!err) {
              let result = JSON.parse(xhr.responseText)['data'];
              $("#inslobtable tbody").empty();
              for(var i = 0;i < result.length;i++){
                $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
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
  });
  $(document).on("click",".inslobdeletebtn",function(){
    let entry = {
      id: $(this).parent().parent().parent().attr("id"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/deletelob", (xhr, err) => {
          if (!err) {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
              if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $("#inslobtable tbody").empty();
                for(var i = 0;i < result.length;i++){
                  $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
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
			}
		});
  });
});
