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
      let params = {
        user_id:  localStorage.getItem('userid')
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "insurance/getDefaultIns", (xhr, err) => {
        if(!err) {
          let result = JSON.parse(xhr.responseText)['data'];          
          $("#inslist").val(result[0].ins_id).trigger('change');    
        }      
        
      });
      
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
          if (result[i]['ins_emrid'] == null) result[i]['ins_emrid'] = '';
          if (result[i]['ins_fhirid'] == null) result[i]['ins_fhirid'] = '';
          $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td>"+result[i]['ins_emrid']+"</td><td>"+result[i]['ins_fhirid']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
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
      toastr.error("Please select insurance");      
    else
      $("#inslob-add-modal").modal("show");
      let en = {};
      let content = "";
      
      sendRequestWithToken('POST', localStorage.getItem('authToken'), en, "insurance/gettypeItem", (xhr, err) => {
          if (!err) {
              let result = JSON.parse(xhr.responseText)['data'];    
              result.forEach(r => {                   
                  content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
              }); 
              $('#lobtype').html(content);
              
          } else {
              return toastr.error("Action Failed");
          }
      });
  });

  $("#inslobaddbtn").click(function (e) {
    let entry = {
      insid: document.getElementById('inslist').value,
      name: document.getElementById('lobname').value,
      desc: document.getElementById('lobdesc').value,
      variation: document.getElementById('lobvar').value,
      type: document.getElementById('lobtype').value,
      emrid: document.getElementById('lobemrid').value,
      fhirid: document.getElementById('lobfhirid').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/addlob", (xhr, err) => {
        if (!err) {
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
            if (!err) {
              let result = JSON.parse(xhr.responseText)['data'];
              $("#inslobtable tbody").empty();
              for(var i = 0;i < result.length;i++){
                if (result[i]['ins_emrid'] == null) result[i]['ins_emrid'] = '';
                if (result[i]['ins_fhirid'] == null) result[i]['ins_fhirid'] = '';
                $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td>"+result[i]['ins_emrid']+"</td><td>"+result[i]['ins_fhirid']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
              }
              $("#inslob-add-modal").modal("hide");
              $('#lobname').val('');
              $('#lobdesc').val('');
              $('#lobvar').val('');
              $('#lobtype').val('');
              $('#lobemrid').val('');
              $('#lobfhirid').val('');

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

    let en = {};
    let content = "";
    
    sendRequestWithToken('POST', localStorage.getItem('authToken'), en, "insurance/gettypeItem", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];    
            result.forEach(r => {                   
                content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
            }); 
            $('#elobtype').html(content);
            
        } else {
            return toastr.error("Action Failed");
        }
    });

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
        $("#elobtype").val(result[0]['type_id']).trigger('change');
        $('#elobemrid').val(result[0]['ins_emrid']);
        $('#elobfhirid').val(result[0]['ins_fhirid']);               

        $("#inslob-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(document).on("click",".inslobsetbtn",function() {
    
    let entry = {
      ins_id:  $("#inslist").val(),
      user_id: localStorage.getItem('userid')
    }

    if (entry.ins_id == 0) {
      toastr.error("Please select insurance");      
    } else {
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/setDefaultIns", (xhr, err) => {
        if (!err) {
            toastr.info("Set Success");            
        } else {
            return toastr.error("Action Failed");
        }
      });
    }    
  });   

  $("#inslobeditbtn").click(function (e) {  

    let entry = {
      id: document.getElementById('chosen_inslob').value,
      name: document.getElementById('elobname').value,
      desc: document.getElementById('elobdesc').value,
      variation: document.getElementById('elobvar').value,
      type: document.getElementById('elobtype').value,
      emrid: document.getElementById('elobemrid').value,
      fhirid: document.getElementById('elobfhirid').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/updatelob", (xhr, err) => {
        if (!err) {
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
            if (!err) {
              $("#inslob-edit-modal").modal("hide");
              let result = JSON.parse(xhr.responseText)['data'];
              $("#inslobtable tbody").empty();
              for(var i = 0; i < result.length; i++){
                if (result[i]['ins_emrid'] == null) result[i]['ins_emrid'] = '';
                if (result[i]['ins_fhirid'] == null) result[i]['ins_fhirid'] = '';

                $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td>"+result[i]['ins_emrid']+"</td><td>"+result[i]['ins_fhirid']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
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
