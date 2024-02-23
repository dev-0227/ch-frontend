$(document).ready(async function () {
  "use strict";
  let retro = [];
  var backuptable = $('#backuptable').DataTable({
    "order": [[ 0, 'desc' ]],
    "ajax": {
        "url": serviceUrl + "hedisloader/getbackup",
        "type": "POST",
        "data":{clinicid:localStorage.getItem('chosen_clinic')}
    },
    "columns": [
        { data: "date",
          render: function (data, type, row) {
            return new Date(row.date).toLocaleString();
          } 
        },
        { data: "insName"},
        { data: 'filename', 
          render: function (data, type, row) {
            return `
              <a href="https://pro.conectorhealth.com/backups/hedis/${row.filename}" target="_blank">${row.filename}</a>
            `
          }   
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
                <button class="btn btn-sm btn-success backupbtn" type="button"><i class="fa fa-hdd-o">&nbsp;</i>Restore</button><button class="btn btn-sm btn-danger backupdeletebtn" type="button"><i class="fa fa-trash">&nbsp;</i>Delete</button>
              </div>
            `
          } 
        }
    ]
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getchoseninsurances", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#insforqualityloader").empty();
      for(var i = 0; i < result.length; i++){
        $("#insforqualityloader").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['insName']+`</option>
        `);
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:localStorage.getItem('chosen_clinic')}, "clinic/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result[0]['apcheck'] == 1){
        $(".vaccine-area").remove();
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  
  $("#qualityloadbtn").click(function(){
    $("#inscheckbox").prop("checked",false);
    $("#insurance-validation-text").html($("#insforqualityloader option:checked").text());
    $("#quality-load-modal").modal("show");
  });
  $("#qualitysubmitbtn").click(function(){
    if($("#inscheckbox").prop("checked")){
      if($("#backupcheck").prop("checked"))
        var backupcheck = 1;
      else
        var backupcheck = 0;
      var formData = new FormData();
      formData.append("insid", $("#insforqualityloader option:checked").val());
      formData.append("clinicid", localStorage.getItem('chosen_clinic'));
      formData.append("cyear", $("#hedisdate").val());
      formData.append("backupcheck", backupcheck);
      formData.append("retrospect", $("#activateretro:checked").val());
      var qualityentry = document.getElementById('qualityfile').files.length;
      if (qualityentry != 0) {
        $(".loadfilename").html($("#insforqualityloader option:checked").text()+" Hedis File");
        $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
        $(".hedis-loader").removeClass("d-none");
        for (let i = 0; i < qualityentry; i++) {
            formData.append("qualityfile", document.getElementById('qualityfile').files[i]);
        }
        sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/qualityloader", (xhr, err) => {
            if (!err) {
              let news = JSON.parse(xhr.responseText)['new'];
              let nolonger = JSON.parse(xhr.responseText)['nolonger'];
              let generated = JSON.parse(xhr.responseText)['generated'];
              let reported = JSON.parse(xhr.responseText)['reported'];
              retro = JSON.parse(xhr.responseText)['retro'];
              if($("#activateretro:checked").val() != 1){
                $(".retrolink-area").addClass("d-none");
              }
              $(".newslink").html(news);
              $(".nolongerlink").html(nolonger);
              $(".generatedlink").html(generated);
              $(".reportedlink").html(reported);
              $(".retrolink").html(retro.length);
              $(".resultlink1").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=1");
              $(".resultlink2").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=2");
              $(".resultlink3").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=3");
              $(".resultlink4").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=4");
              $(".hedis-loader").addClass("d-none");
              $("#hedis-load-result-modal").modal("show");
            } else {
              $(".hedis-loader").addClass("d-none");
              return $.growl.warning({
                message: "Action Failed"
              });
            }
        });
      } else {
        return $.growl.warning({
          message: "Please load file"
        });
      }
    }
    else{
      return $.growl.warning({
        message: "Please turn on"
      });
    }
  });
  $(document).on("click",".resultlink5",function(){
    
    $("body").append("<form id = 'retroform' action = '"+serviceUrl+"hedis/outputretro' method = 'POST'><input type='hidden' name='clinicid' value='"+localStorage.getItem('chosen_clinic')+"' /><input type='hidden' name='cyear' value='"+$("#hedisdate").val()+"' /><input type='hidden' name='insid' value='"+$("#insforqualityloader option:checked").val()+"' /><textarea name='retrodata'>"+JSON.stringify(retro)+"</textarea>'</form>");
    $("#retroform").submit();
    $("#retroform").remove();
  })
  $("#qualitydeletebtn").click(function(){
    $("#delete-insurance-title").html($("#insforqualityloader option:checked").text());
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),insid:$("#insforqualityloader option:checked").val()}, "setting/getdatehedisloaded", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#datadate").empty();
        $("#datadate").append("<option value = '0'>Nothing Selected</option>");
        for(var i = 0; i < result.length; i++){
          $("#datadate").append(`
              <option value = "`+result[i]['cyear']+`">`+result[i]['cyear']+`</option>
          `);
        }
      } else {
        return $.growl.error({
        message: "Action Failed"
        });
      }
    });
    $("#quality-delete-modal").modal("show");
  });
  $("#deletedatabtn").click(function(){
    if($("#datadate").val() == 0){
      return $.growl.notice({
        message: "Please select date to delete data"
      });
    }
    else{
      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }, function(inputValue) {
        if (inputValue) {
          sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#datadate").val(),insid:$("#insforqualityloader option:checked").val()}, "hedisloader/deletedata", (xhr, err) => {
            if (!err) {
              location.reload();
            } else {
              return $.growl.error({
              message: "Action Failed"
              });
            }
          });
        }
      });
    }
  });
  $("#encloadbtn").click(function(){
    var formData = new FormData();
    formData.append("clinicid", localStorage.getItem('chosen_clinic'));
    formData.append("userid", localStorage.getItem('userid'));
    formData.append("cyear", $("#hedisdate").val());
    var qualityentry = document.getElementById('encfile').files.length;
    if (qualityentry != 0) {
      $(".loadfilename").html("Enc File");
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      $(".hedis-loader").removeClass("d-none");
      
      for (let i = 0; i < qualityentry; i++) {
          formData.append("encfile", document.getElementById('encfile').files[i]);
      }
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/encloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return $.growl.warning({
              message: "Action Failed"
            });
          }
      });
    } else {
      return $.growl.warning({
        message: "Please load file"
      });
    }
  });
  $("#labloadbtn").click(function(){
    var formData = new FormData();
    formData.append("clinicid", localStorage.getItem('chosen_clinic'));
    formData.append("userid", localStorage.getItem('userid'));
    formData.append("cyear", $("#hedisdate").val());
    var qualityentry = document.getElementById('labfile').files.length;
    if (qualityentry != 0) {
      $(".loadfilename").html("Lab File");
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      $(".hedis-loader").removeClass("d-none");
      for (let i = 0; i < qualityentry; i++) {
          formData.append("labfile", document.getElementById('labfile').files[i]);
      }
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/labloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return $.growl.warning({
              message: "Action Failed"
            });
          }
      });
    } else {
      return $.growl.warning({
        message: "Please load file"
      });
    }
  });
  $("#vaccineloadbtn").click(function(){
    var formData = new FormData();
    formData.append("clinicid", localStorage.getItem('chosen_clinic'));
    formData.append("userid", localStorage.getItem('userid'));
    formData.append("cyear", $("#hedisdate").val());
    var qualityentry = document.getElementById('vaccinefile').files.length;
    if (qualityentry != 0) {
      $(".loadfilename").html("Vaccine File");
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      $(".hedis-loader").removeClass("d-none");
      for (let i = 0; i < qualityentry; i++) {
          formData.append("vaccinefile", document.getElementById('vaccinefile').files[i]);
      }
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/vaccineloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return $.growl.warning({
              message: "Action Failed"
            });
          }
      });
    } else {
      return $.growl.warning({
        message: "Please load file"
      });
    }
  });
  $("#prevnextloadbtn").click(function(){
    var formData = new FormData();
    formData.append("clinicid", localStorage.getItem('chosen_clinic'));
    formData.append("userid", localStorage.getItem('userid'));
    formData.append("cyear", $("#hedisdate").val());
    var qualityentry = document.getElementById('prevnextfile').files.length;
    if (qualityentry != 0) {
      $(".loadfilename").html("Prev and Next File");
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      $(".hedis-loader").removeClass("d-none");
      for (let i = 0; i < qualityentry; i++) {
          formData.append("prevnextfile", document.getElementById('prevnextfile').files[i]);
      }
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/prevnextloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return $.growl.warning({
              message: "Action Failed"
            });
          }
      });
    } else {
      return $.growl.warning({
        message: "Please load file"
      });
    }
  });
  $(document).on("click",".backupdeletebtn",function(){
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedisloader/deletebackup", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              backuptable.ajax.reload();
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
  $(document).on("click",".backupbtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    swal({
			title: "Are you sure?",
      text: "You should delete old hedis data first",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, submit it!",
		}, function(inputValue) {
			if (inputValue) {
        $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
        $(".hedis-loader").removeClass("d-none");
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedisloader/backuphedis", (xhr, err) => {
          if (!err) {
            $(".hedis-loader").addClass("d-none");
            let result = JSON.parse(xhr.responseText)['message'];
            if(result == "OK")
              return $.growl.notice({
                message: "Action Successfully"
              });
            else
              return $.growl.warning({
                message: "You need to delete old data first"
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
  $("#backupfilebtn").click(function(){
    let getinsentry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      cyear:$("#hedisdate").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), getinsentry, "hedis/getinsheislist", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#backupinslist").empty();
        for(var i = 0;i < result.length;i++){
          $("#backupinslist").append(`
            <option value="${result[i]['insid']}">${result[i]['insName']}</option>
          `);
        }
        $("#backup-modal").modal("show");
      } else {
        return $.growl.warning({
          message: "Action Failed"
        });
      }
    });
  });
  $(".backupnowbtn").click(function(){
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      cyear:$("#hedisdate").val(),
      insid:$("#backupinslist").val()
    }
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, submit it!",
		}, function(inputValue) {
			if (inputValue) {
        $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
        $(".hedis-loader").removeClass("d-none");
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedisloader/backupdatafromhedis", (xhr, err) => {
          if (!err) {
            $(".hedis-loader").addClass("d-none");
            setTimeout( function () {
              backuptable.ajax.reload();
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
