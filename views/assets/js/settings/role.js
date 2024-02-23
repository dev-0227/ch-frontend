$(document).ready(function () {
  "use strict";
  var role_table = $('#role_table').DataTable({
    "ajax": {
        "url": serviceUrl + "role/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "pageLength": 10,
    "order": [],
    "columns": [
        { data: "fname",
          render: function (data, type, row) {
            return row.name;
          } 
        },
        { data: 'description' },
        { data: 'createdAt',
            render: function (data, type, row) {
              return row.createdAt.replace('T', ' ').substr(0, 19);
            }  
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top " idkey="`+row.id+`">
                <button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button"><i class="fa fa-edit"></i></button><button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "permission", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var permissions = []
      for(var i=0; i<result.length;i++){
        var names = result[i]['name'].split('_');
        permissions[names[0]]=[];

      }
      for(var i=0; i<result.length;i++){
        var names = result[i]['name'].split('_');
        permissions[names[0]].push(result[i]);

      }
      var html = '';
      for (const key in permissions) {
        var collapse = "";
        if(html=="")collapse = "show";
        html += '<div class="panel panel-default" style="border-bottom:1pt solid #cccccc;">';
        html += '<div class="panel-heading">';
        html += '<h4 class="panel-title" >';
        html += '<a data-toggle="collapse" data-parent="#accordion" href="#collapse'+key+'"  style="padding: 12px; color: black;" >';
        html += ' <span class="glyphicon glyphicon-chevron-right"></span> ';
        html += key;
        html += '</a></h4></div>';
        html += '<div id="collapse'+key+'" class="panel-collapse collapse '+collapse+'" ">';
        html += '<div class="panel-body p-1" ><table style="width: 100%">';
        for(var i=0; i<permissions[key].length; i++){
          var row = permissions[key][i];
          html += '<div class="row mx-2" style="border-bottom:1pt dashed #cccccc;">';
          html += '<div class="col-md-4 d-flex mr-2 " style="justify-content: right;">'+row['name']+':</div>';
          html += '<div class="col-md-2 d-flex align-self-center">';
          html += '<input type="checkbox" class="ch_permission" id="ch_'+row['id']+'_1" data-id="'+row['id']+'" data-type="1"><span class="pl-1">Read</span>';
          html += '</div>';
          html += '<div class="col-md-2 d-flex align-self-center">';
          html += '<input type="checkbox" class="ch_permission" id="ch_'+row['id']+'_2" data-id="'+row['id']+'" data-type="2"><span class="pl-1">Write</span>';
          html += '</div>';
          html += '<div class="col-md-2 d-flex align-self-center">';
          html += '<input type="checkbox" class="ch_permission" id="ch_'+row['id']+'_3" data-id="'+row['id']+'" data-type="3"><span class="pl-1">Create</span>';
          html += '</div></div>';
          
        }
        html += '</table></div></div></div>';
      }
      $("#accordion").html(html);
      
    }
  });

  $(document).on("click","#ch_all",function(){
    $('.ch_permission').prop('checked', $(this).prop('checked'));
  });

  $(document).on("click",".add_btn",function(){
    $("#aname").val('');
    $("#adescription").val('');
    $("#role-add-modal").modal("show");
  });

  $("#create_btn").click(function (e) {
    let entry = {
      name: document.getElementById('aname').value,
      description: document.getElementById('adescription').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/add", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "role is added successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      role_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".edit_btn",function(){
    $('#ch_all').prop('checked', false);
    $(".ch_permission").each(function() {
      $(this).prop('checked', false);
    });
    $("#chosen_user").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#uname").val(result[0]['name']);
        $("#udescription").val(result[0]['description']);
        $("#role-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });

    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/getPermission", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        for(var i=0; i<result.length; i++){
          $('#ch_'+result[i].perm_id+'_1').prop('checked', result[i].value.charAt(0)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_2').prop('checked', result[i].value.charAt(1)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_3').prop('checked', result[i].value.charAt(2)=="1"?true:false);
        }
        $("#role-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  $("#update_btn").click(function (e) {
    var p = '';
    $(".ch_permission").each(function() {
      if(p!="")p += ',';
      p += $(this).data('id')+'_'+$(this).data('type')+'_';
      p += $(this).prop('checked')?'1':'0';
    });
    let entry = {
      id: document.getElementById('chosen_user').value,
      name: document.getElementById('uname').value,
      description: document.getElementById('udescription').value,
      permission: p
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "role is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      role_table.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".delete_btn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              role_table.ajax.reload();
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
