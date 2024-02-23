$(document).ready(function () {
  "use strict";
  // var permission_table = $('#permission_table').DataTable({
  //   "ajax": {
  //       "url": serviceUrl + "permission/",
  //       "type": "GET",
  //       "headers": { 'Authorization': localStorage.getItem('authToken') }
  //   },
  //   "pageLength": 100,
  //   "order": [],
  //   "columns": [
  //       { data: "name",
  //         render: function (data, type, row) {
  //           return '<span title="'+row.description+'">'+row.name+'</span>';
  //         } 
  //       },
  //       { data: 'assigned',
  //         render: function (data, type, row) {
  //           var str = row.assigned+'';
  //           var assign = str.split(",");
  //           var vstr = row.v+'';
  //           var values = vstr.split(",");
  //           var returnStr = "";
  //           for(var i=0; i<assign.length; i++){
  //             if(assign[i] != "null"){
  //               if(values[i] != '000')
  //               returnStr += '<span class="ml-2 tag tag-blue" >'+assign[i]+'</span>'
  //             }
              
  //           }
  //           return returnStr;
  //         } 
  //       },
  //       { data: 'createdAt',
  //           render: function (data, type, row) {
  //             return row.createdAt.replace('T', ' ').substr(0, 19);
  //           }  
  //       },
  //       { data: 'id',
  //         render: function (data, type, row) {
  //           return `
  //             <div class="btn-group align-top " idkey="`+row.id+`">
  //               <button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button"><i class="fa fa-edit"></i></button><button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i></button>
  //             </div>
  //           `
  //         } 
  //       }
  //   ]
  // });

  load_data();


  function load_data(){
    
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "permission", (xhr, err) => {
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
            html += '<h4 class="panel-title">';
            html += '<a data-toggle="collapse" data-parent="#accordion" href="#collapse'+key+'" aria-expanded="true" style="color: black;" >';
            html += ' <span class="glyphicon glyphicon-chevron-right"></span> ';
            html += key;
            html += '</a></h4></div>';
            html += '<div id="collapse'+key+'" class="panel-collapse collapse '+collapse+'">';
            html += '<div class="panel-body p-1" ><table style="width: 100%">';
            for(var i=0; i<permissions[key].length; i++){
              var row = permissions[key][i];
              var str = row.assigned+'';
              var assign = str.split(",");
              var vstr = row.v+'';
              var values = vstr.split(",");
              var assignRoles = "";
              for(var j=0; j<assign.length; j++){
                if(assign[j] != "null"){
                  if(values[j] != '000')
                  assignRoles += '<span class="ml-2 tag tag-blue" >'+assign[j]+'</span>'
                }
                
              }
              html += '<tr class="row m-1" style="border-bottom:1pt dashed #cccccc;">';
              html += '<td class="col-md-2">';
              html += row.name;
              html += '</td>';
              html += '<td class="col-md-4">';
              html += row.description;
              html += '</td>';
              html += '<td class="col-md-5">';
              html += assignRoles;
              html += '</td>';
              html += '<td class="col-md-1">';
              html += '<div class="btn-group align-top " idkey="'+row.id+'`">';
              html += '<button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button"><i class="fa fa-edit"></i></button>';
              html += '<button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i></button>';
              html += '</div>'
              html += '</td>';
              html += '</tr>';
            }
            html += '</table></div></div></div>';

          }

          $('#accordion').html(html);
          
          
        }
    });
  }

  $(document).on("click",".permissionaddbtn",function(){
    $("#aname").val('');
    $("#adescription").val('');
    $("#permission-add-modal").modal("show");
  });

  $("#create_btn").click(function (e) {
    let entry = {
      name: document.getElementById('aname').value,
      description: document.getElementById('adescription').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/add", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "permission is added successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      load_data()
    }, 1000 );
  });

  $(document).on("click",".edit_btn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#uname").val(result[0]['name']);
        $("#udescription").val(result[0]['description']);
        $("#permission-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  $("#update_btn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_user').value,
      name: document.getElementById('uname').value,
      description: document.getElementById('udescription').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/update", (xhr, err) => {
        if (!err) {
          return $.growl.notice({
            message: "permission is updated successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    setTimeout( function () {
      load_data()
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "permission/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              load_data()
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
