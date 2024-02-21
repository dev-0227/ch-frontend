
$(document).ready(async function () {
  "use strict";
  var group = $('#grouptable').DataTable({
    "ajax": {
        "url": serviceUrl + "paymentsetting/getgroups",
        "type": "GET",
    },
    "columns": [
        { data: "name" },
        { data: "desc" },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editgroupbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletegroupbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  var subgroup = $('#subgrouptable').DataTable({
    "ajax": {
        "url": serviceUrl + "paymentsetting/getsubgroups",
        "type": "GET",
    },
    "columns": [
        { data: "parent" },
        { data: "name" },
        { data: 'desc',
          render: function (data, type, row) {
            return `
              <div style="min-width: 500px;white-space: initial;">
              ${row.desc}
              </div>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editsubgroupbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletesubgroupbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "paymentsetting/getexclusion", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length > 0){
        var value = result[0]['value']
      }
      else{
        var value = 0.02;
      }
      $("#cpt_exclusion").ionRangeSlider({
        type: "double",
        min: 0,
        max: 1,
        step: 0.01,
        from: 0,
        to: value,
        from_fixed: true
      });
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "paid/getgroups", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#group-area").empty();
      $("#pgroup").empty();
      $("#epgroup").empty();
      $("#group-area").append(`<option value='0'>All</option>`);
      for(var i = 0; i < result.length;i++){
        $("#group-area").append(`<option value = '`+result[i]['id']+`'>`+result[i]['name']+`</option>`)
        $("#pgroup").append(`<option value = '`+result[i]['id']+`'>`+result[i]['name']+`</option>`)
        $("#epgroup").append(`<option value = '`+result[i]['id']+`'>`+result[i]['name']+`</option>`)
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "paid/getclinicspec", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#spec-area").empty();
      for(var i = 0; i < result.length;i++){
        $("#spec-area").append(`<option value = '`+result[i]['id']+`'>`+result[i]['name']+`</option>`)
      }
      loadData()
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(".setrangebtn").click(function(){
    var valueArr = $("#cpt_exclusion").val().split(";");
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),value:valueArr[1]}, "paymentsetting/setexclusion", (xhr, err) => {
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
  })
  $(".setsearchbtn").click(function(){
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      spec:$("#spec-area").val(),
      group:$("#group-area").val(),
      type:$(".superbilltype:checked").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/setmultisearchparams", (xhr, err) => {
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

  //Group Area
  $(document).on("click","#groupadd-btn",function(){
    $("#group-add-modal").modal("show");
  });
  $("#groupaddbtn").click(function (e) {
    let entry = {
      name: document.getElementById('group').value,
      desc: document.getElementById('groupdesc').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/addgroup", (xhr, err) => {
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
      group.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editgroupbtn",function(){
    $("#chosen_group").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_group").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/chosengroup", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#egroup").val(result[0]['name']);
        $("#egroupdesc").val(result[0]['desc']);
        $("#group-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#groupeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_group').value,
      name: document.getElementById('egroup').value,
      desc: document.getElementById('egroupdesc').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/updategroup", (xhr, err) => {
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
      group.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletegroupbtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/deletegroup", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              group.ajax.reload();
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

  //Subgroup Area
  $(document).on("click","#subgroupadd-btn",function(){
    $("#subgroup-add-modal").modal("show");
  });
  $("#subgroupaddbtn").click(function (e) {
    let entry = {
      group: document.getElementById('pgroup').value,
      name: document.getElementById('subgroup').value,
      desc: document.getElementById('subgroupdesc').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/addsubgroup", (xhr, err) => {
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
      subgroup.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editsubgroupbtn",function(){
    $("#chosen_subgroup").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_subgroup").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/chosensubgroup", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#epgroup").val(result[0]['agerange']);
        $("#esubgroup").val(result[0]['name']);
        $("#esubgroupdesc").val(result[0]['desc']);
        $("#subgroup-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#subgroupeditbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_subgroup').value,
      group: document.getElementById('epgroup').value,
      name: document.getElementById('esubgroup').value,
      desc: document.getElementById('esubgroupdesc').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/updatesubgroup", (xhr, err) => {
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
      subgroup.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletesubgroupbtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "paymentsetting/deletesubgroup", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              subgroup.ajax.reload();
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
async function loadData(){
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "paymentsetting/getmultisearchparams", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#spec-area").val(JSON.parse(result[0]['desc'])).select2().trigger('change');
      $("#group-area").val(result[0]['agerange']).select2().trigger('change');
      $(".superbilltype[value="+result[0]['age']+"]").prop("checked",true);
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
}
