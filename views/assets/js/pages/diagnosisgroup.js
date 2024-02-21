$(document).ready(function () {
  "use strict";
  
  var icds_list = [];
  var mctable;
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "diagnosisgroup/ref", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var data = "";
      for(var i=0; i<result.length; i++){
        icds_list[result[i].code.trim()] = result[i].name;
        data += "<div class='list-group-item list-group-item-action icds_item' style='cursor: pointer;' data-code='"+result[i].code+"'>"+result[i].name+"</div>"
      }
      
      $("#icds_ref").html(data);

      mctable = $('#diagnosisgroupstable').DataTable({
        scrollX: false,
        scrollCollapse: true,
        columnDefs: [
          {"className": "dt-center ", "targets": "_all"}
       ],
       "ajax": {
            "url": serviceUrl + "diagnosisgroup/",
            "type": "GET"
        },
        "columns": [
            { data: "name",
              render: function (data, type, row) {
                var data = "<div class='d-flex justify-content-center align-items-center font-weight-bold' >"
                data += row.name;
                data += "</div>"
                return data;
              } 
            },
            { data: "codes",
              render: function (data, type, row) {
                var data = "";
                if(row.codes){
                  var codes = row.codes.split(',');
                  data += "<div class='row d-flex justify-content-center' >"
                  for(var i=0; i<codes.length; i++){
                    data += "<span class='tag  tag-secondary m-1'";
                    if(icds_list[codes[i].trim()] != undefined) data += " title='"+icds_list[codes[i].trim()]+"'";
                    data += ">"+codes[i]+"</span>";
                  }
                  data += "</div>"
                }
                
                return data;
              } 
            },
            
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                  <button class="btn btn-sm btn-green badge mccopybtn" data-codes="`+row.codes+`" type="button"><i class="fa fa-copy"></i></button><button class="btn btn-sm btn-primary badge mceditbtn" type="button"><i class="fa fa-edit"></i></button><button class="btn btn-sm btn-danger badge mcdeletebtn" type="button"><i class="fa fa-trash"></i></button>
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
  $("#icds_tags").show();
  $("#icds_codes").hide();
  var code_view = false;
  
  $(document).on("click",".mceditbtn",function(){
    $("#chosen_mc").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "diagnosisgroup/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#emc_name").val(result[0]['name']);
        
        var data = "";
        var codes = "";
        if(result[0]['codes']){
          var codes = result[0]['codes'].split(',');
          for(var i=0; i<codes.length; i++){
            data += "<span class='tag  tag-info m-1 d-flex justify-content-center align-items-center' id='code_"+codes[i]+"'";
            if(icds_list[codes[i].trim()] != undefined) data += " title='"+icds_list[codes[i].trim()]+"'";
            data += ">"+codes[i]+"<span data-code="+codes[i]+" class='badge badge-pill badge-info ml-2 border-light'><i class='fa fa-close'></i></span></span>";
          }
          codes = result[0]['codes'];
        }
        
        $("#icds_tags").html(data);
        $("#icds_codes").val(codes);

        $("#mc-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  
  $(document).on("click",".codeview",function(){

    if(code_view){
      $("#icds_tags").removeClass('hide');
      $("#icds_codes").hide();
      code_view = false;
    }else{
      $("#icds_tags").addClass('hide');
      $("#icds_codes").show();
      code_view = true;
    }
    
  });


  $(document).on("click",".mccopybtn",function(){

    navigator.clipboard.writeText($(this).data('codes'));
    $.growl.notice({
      message: "Copied ICDS Codes"
    });

  });

  $(document).on("click",".badge-info",function(){
    $(this).parent().attr('class', '')
    $(this).parent().html('');
    asyncCode();

  });

  function asyncCode() {
    var codes = "";
    $(".badge-info").each(function() {
      if(codes!="")codes += ",";
      codes += $(this).data('code');
    });
    $("#icds_codes").val(codes);
  }

  $('#icds_codes').bind('input propertychange', function() {
    var codes = $(this).val().split(',');
    var data = "";
    for(var i=0; i<codes.length; i++){
      data += "<span class='tag  tag-info m-1 d-flex justify-content-center align-items-center' id='code_"+codes[i]+"'";
      if(icds_list[codes[i].trim()] != undefined) data += " title='"+icds_list[codes[i].trim()]+"'";
      data += ">"+codes[i]+"<span data-code="+codes[i]+" class='badge badge-pill badge-info ml-2 border-light'><i class='fa fa-close'></i></span></span>";
    }
    $("#icds_tags").html(data);
    
});

  $(document).on("click","#icds_add",function(){
    var code = $('#new_icds_code').val();
    if(code=="")return;
    var exist = false;
    $(".badge-info").each(function() {
      if($(this).data('code') == code)exist = true;
    });
    if(exist)return;
    var data = "";
    data += "<span class='tag  tag-info m-1 d-flex justify-content-center align-items-center' id='code_"+code+"'>";
    data += code;
    data += "<span data-code="+code+" class='badge badge-pill badge-info ml-2 border-light'><i class='fa fa-close'></i></span></span>";
    $("#icds_tags").append(data);
    asyncCode();
    $('#new_icds_code').val('');
  });

  //dblclick
  $(document).on("click",".icds_item",function(){
    var code = $(this).data('code');
    var exist = false;
    $(".badge-info").each(function() {
      if($(this).data('code') == code)exist = true;
    });
    if(exist)return;
    var data = "";
    data += "<span class='tag  tag-info m-1 d-flex justify-content-center align-items-center' id='code_"+code+"'>";
    data += code;
    data += "<span data-code="+code+" class='badge badge-pill badge-info ml-2 border-light'><i class='fa fa-close'></i></span></span>";
    $("#icds_tags").append(data);
    asyncCode();
  });

  
  
  $(document).on("click",".mcdeletebtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "diagnosisgroup/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              mctable.ajax.reload();
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
  $(document).on("click",".mcaddbtn",function(){
    $("#mc-add-modal").modal("show");
  });
  
  $("#mc-addbtn").click(function (e) {
    if($("#mc_name").val() == ""){
      return $.growl.error({
        message: "Please enter Medical Condition Name"
      });
      
    }
      
    let entry = {
      name: document.getElementById('mc_name').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "diagnosisgroup/add", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          if(result.length==0){
            return $.growl.error({
              message: "Medical Condition is already added"
            });
          }else{
            return $.growl.notice({
              message: "Medical Condition is added successfully"
            });
          }
          
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      mctable.ajax.reload();
    }, 1000 );
  });

  $("#mc-editbtn").click(function (e) {
    var codes = "";
    $(".badge-info").each(function() {
      if(codes != "")codes += ",";
      codes += $(this).data('code');
    });
    let entry = {
      id: document.getElementById('chosen_mc').value,
      name: document.getElementById('emc_name').value,
      codes: codes
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "diagnosisgroup/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "medical condition is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      mctable.ajax.reload();
    }, 1000 );
  });
  
  
  
  
  
  
});
