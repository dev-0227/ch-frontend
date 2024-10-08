$(document).ready(async function () {
  "use strict";
  let retro = [];
  let insuranceid = 0;
  var backuptable = $('#backuptable').DataTable({
    "order": [[ 0, 'desc' ]],
    "ajax": {
        "url": serviceUrl + "hedisloader/getbackup",
        "type": "POST",
        "data":function (d) {
                  d.clinicid = localStorage.getItem('chosen_clinic'),
                  d.insuranceid = insuranceid
              },
    },
    "bAutoWidth": false, 
    "columns": [
        { data: "date",
          render: function (data, type, row) {
            return new Date(row.date).toLocaleString();
          } 
        },
        { data: "num"},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
                <button class="btn btn-sm btn-success backupbtn" type="button"><i class="fa fa-hdd">&nbsp;</i>Restore</button>
                <button class="btn btn-sm btn-danger backupdeletebtn" type="button"><i class="fa fa-trash">&nbsp;</i>Delete</button>
              </div>
            `
          } 
        }
    ]
  });

  async function loadQualityProgram() {
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {ins_id: $('#insforqualityloader').val()}, 'reportBuilder/getQualityProgramList', (xhr, err) => {
      if (!err) {
        var html = ``
        var result = JSON.parse(xhr.responseText)['data']
        result.forEach(item => {
          html += `<option value='${item.id}'>${item.name}</option>`
        })
        $('#qualityprogramloader').html(html)
      }
    })
  }

  //setting/getchoseninsurances
  // Hedis Setting begin //
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "insurance/getHedisList", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#insforqualityloader").empty();
      for(var i = 0; i < result.length; i++){
        $("#insforqualityloader").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['insName']+`</option>
        `);
        if(i==0)insuranceid = result[i]['id'];
      }
      backuptable.ajax.reload();
      getHedisDataCount();
      loadQualityProgram()
    }
  })

  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/gethedisyear", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length>0)
      $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
    } else {
      toastr.error('Action Failed');
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:localStorage.getItem('chosen_clinic')}, "clinic/chosen", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result[0]['apcheck'] == 1){
        $(".vaccine-area").remove();
      }
    } else {
      toastr.error('Action Failed');
    }
  });

  async function getHedisDataCount(){
    var entry = {
      id:localStorage.getItem('chosen_clinic'),
      insid: insuranceid
    }
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedisloader/checkhedisdata", (xhr, err) => {
      if (!err) {
        let total = JSON.parse(xhr.responseText)['data'];
        $("#patient_count").html(total);
        
      } else {
        toastr.error('Action Failed');
      }
    });
  }
  
  $("#qualityloadbtn").click(async function(){
    if($("#qualityfile").val() == ""){
      toastr.info('Please Drag and drop a file');
      $("#qualityfile").focus();
      return;
    }
    $('#clinic_name').html($("#chosen_clinics option:selected").text());
    $("#inscheckbox").prop("checked",false);
    $("#backupcheck").prop("checked", false);
    $("#retrospectcheck").prop("checked", $("#activateretro").prop("checked"));
    $("#insurance-validation-text").html($("#insforqualityloader option:checked").text());
    $("#quality-load-modal").modal("show");
  });

  $("#qualitysubmitbtn").click(async function(){
    if($("#inscheckbox").prop("checked")){

      var formData = new FormData();
      formData.append("insid", $("#insforqualityloader option:checked").val());
      formData.append("clinicid", localStorage.getItem('chosen_clinic'));
      formData.append("cyear", $("#hedisdate").val());
      formData.append("backupcheck", $("#backupcheck").prop("checked")?"1":"0");
      formData.append("retrospect", $("#activateretro").prop("checked")?"1":"0");
      formData.append('qpid', $('#qualityprogramloader').val());
      var qualityentry = document.getElementById('qualityfile').files.length;
      if (qualityentry != 0) {
        $(".loadfilename").html($("#insforqualityloader option:checked").text()+" Hedis File");
        $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
        $(".hedis-loader").removeClass("d-none");
        for (let i = 0; i < qualityentry; i++) {
            formData.append("qualityfile", document.getElementById('qualityfile').files[i]);
        }
        await sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/qualityloader", (xhr, err) => {
            if (!err) {
              $("#quality-load-modal").modal("hide");
              let news = JSON.parse(xhr.responseText)['new'];
              let measures = JSON.parse(xhr.responseText)['measures'];
              let matched = JSON.parse(xhr.responseText)['matched'];
              let notmatched = JSON.parse(xhr.responseText)['notmatched'];
              let nolonger = JSON.parse(xhr.responseText)['nolonger'];
              let generated = JSON.parse(xhr.responseText)['generated'];
              let reported = JSON.parse(xhr.responseText)['reported'];
              retro = JSON.parse(xhr.responseText)['retro'];
              if($("#activateretro:checked").val() != 1){
                $(".retrolink-area").addClass("d-none");
              }
              $(".newslink").html(news);
              $('.measureslink').html(measures);
              $(".nolongerlink").html(nolonger);
              $('.matchedlink').html(matched);
              $('.notmatchedlink').html(notmatched);
              $(".generatedlink").html(generated);
              $(".reportedlink").html(reported);
              $(".retrolink").html(retro.length);
              // $(".resultlink1").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=1");
              // $(".resultlink2").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=2");
              // $(".resultlink3").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=3");
              // $(".resultlink4").prop("href","../pages/hedisreport?insid="+$("#insforqualityloader option:checked").val()+"&ls=4");
              $(".hedis-loader").addClass("d-none");
              $("#hedis-load-result-modal").modal("show");
              backuptable.ajax.reload();
              getHedisDataCount();
            } else {
              $(".hedis-loader").addClass("d-none");
              return toastr.error('Action Failed');
            }
        });
      } else {
        return toastr.info('Please load a file');
      }
    }
    else{
      return toastr.info('Please turn on the Insurance');
    }
  });
  
  $(document).on("change","#insforqualityloader",async function(){
    insuranceid = $(this).val();
    backuptable.ajax.reload();
    getHedisDataCount();
    loadQualityProgram()
  })

  $(document).on("click",".resultlink5",async function(){
    $("body").append(`
      <form id = 'retroform' action = '${serviceUrl}hedis/outputretro' method = 'POST'>
        <input type='hidden' name='clinicid' value='${localStorage.getItem('chosen_clinic')}' />
        <input type='hidden' name='cyear' value='${$("#hedisdate").val()}' />
        <input type='hidden' name='insid' value='${$("#insforqualityloader option:checked").val()}' />
        <textarea name='retrodata'>${JSON.stringify(retro)}</textarea>
      </form>`);

    $("#retroform").submit();
    $("#retroform").remove();
  })
  $(document).on('click', '.resultlink', async function(e) {
    e.preventDefault()

    $("body").append(`
      <form id = 'result_form' action = '${serviceUrl}hedis/exportresult' method = 'POST'>
        <input type='hidden' name='clinicid' value='${localStorage.getItem('chosen_clinic')}' />
        <input type='hidden' name='cyear' value='${$("#hedisdate").val()}' />
        <input type='hidden' name='insid' value='${$("#insforqualityloader option:checked").val()}' />
        <input type='hidden' name='l_status' value='${this.attr('data')}' />
        <input type='hidden' name='count' value='${e.target.firstChild}' />
      </form>`)

    $("#result_form").submit()
    $("#result_form").remove()
  })
  $("#qualitydeletebtn").click(async function(){
    $("#delete-insurance-title").html($("#insforqualityloader option:checked").text());
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),insid:$("#insforqualityloader option:checked").val()}, "setting/getdatehedisloaded", (xhr, err) => {
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
        return toastr.error('Action Failed');
      }
    });
    $("#quality-delete-modal").modal("show");
  });
  // Hedis Setting end //

  $("#deletedatabtn").click(async function(){
    if($("#datadate").val() == 0){
      return toastr.info('Please select date to delete data');
      
    }
    else{
      Swal.fire({
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, return",
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-primary"
        }
      }).then(async function (result) {
        if (result.value) {
          await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),cyear:$("#datadate").val(),insid:$("#insforqualityloader option:checked").val()}, "hedisloader/deletedata", (xhr, err) => {
            if (!err) {
              location.reload();
            } else {
              return toastr.error('Action Failed');
            }
          });
        }
      });
      
    }
  });
  $("#encloadbtn").click(async function(){
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
      await sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/encloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return toastr.error('Action Failed');
          }
      });
    } else {
      return toastr.info('Please load file');
      
    }
  });
  $("#labloadbtn").click(async function(){
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
      await sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/labloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return toastr.error('Action Failed');
          }
      });
    } else {
      return toastr.info('Please load file');
    }
  });
  $("#vaccineloadbtn").click(async function(){
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
      await sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/vaccineloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return toastr.error('Action Failed');
          }
      });
    } else {
      return toastr.info('Please load file');
    }
  });
  $("#prevnextloadbtn").click(async function(){
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
      await sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/prevnextloader", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $(".newentries").html(result);
            $(".hedis-loader").addClass("d-none");
            $("#load-result-modal").modal("show");
          } else {
            return toastr.error('Action Failed');
          }
      });
    } else {
      return toastr.info('Please load file');
    }
  });
  $(document).on("click",".backupdeletebtn",async function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    Swal.fire({
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, return",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-primary"
      }
    }).then(async function (result) {
      if (result.value) {
        await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedisloader/deletebackup", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              backuptable.ajax.reload();
              getHedisDataCount();
            }, 1000 );
          } else {
            return toastr.error('Action Failed');
          }
        });
      }
    });
    
  });
  $(document).on("click",".backupbtn",async function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    Swal.fire({
      text: "You should delete old hedis data first",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, return",
      customClass: {
        confirmButton: "btn btn-info",
        cancelButton: "btn btn-primary"
      }
		}).then(async function (result) {
      if (result.value) {
          $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
          $(".hedis-loader").removeClass("d-none");
          await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedisloader/backuphedis", (xhr, err) => {
            if (!err) {
              $(".hedis-loader").addClass("d-none");
              let result = JSON.parse(xhr.responseText)['message'];
              if(result == "OK")
                return toastr.success('Action Successfully');
              else
                return toastr.info('You need to delete old data first');
            } else {
              return toastr.error('Action Failed');
            }
          });
      }
		});

    
  });
  $("#backupfilebtn").click(async function(){
    let getinsentry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      cyear:$("#hedisdate").val(),
    }
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), getinsentry, "hedis/getinsheislist", (xhr, err) => {
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
        return toastr.error('Action Failed');
      }
    });
  });
  $("#backupnowbtn").click(async function(){
    let entry = {
      clinicid:localStorage.getItem('chosen_clinic'),
      cyear:$("#hedisdate").val(),
      insid:$("#backupinslist").val()
    }
    Swal.fire({
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, return",
      customClass: {
        confirmButton: "btn btn-info",
        cancelButton: "btn btn-primary"
      }
		}).then(async function (result) {
      if (result.value) {
        $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
        $(".hedis-loader").removeClass("d-none");
				await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedisloader/backupdatafromhedis", (xhr, err) => {
          if (!err) {
            $(".hedis-loader").addClass("d-none");
            $("#backup-modal").modal("hide");
            setTimeout( function () {
              backuptable.ajax.reload();
              getHedisDataCount();
            }, 1000 );
          } else {
            return toastr.error('Action Failed');
          }
        });
      }
		});
    
    
  });

  // Measure Not Matched
  var notMatchedTable = $('#hedis-not-matched-table').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getnmeasure",
        "type": "GET",
    },
    serverSide: true,
    "columns": [
        { data: "measure" },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="${row.id}" data='${row.measure}'>
              <button class="btn btn-sm btn-primary hedis-edit-measure"><i class="fa fa-edit"></i> Define</button>
              <button class="btn btn-sm btn-danger hedis-delete-nmeasure"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  })

  $(document).on("click",".hedis-delete-nmeasure",function(){
    let entry = {
      measure: $(this).parent().attr("idkey"),
    }
    var tmp = $(this).parent().parent().parent();
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletenmeasure", (xhr, err) => {
          if (!err) {
            tmp.remove();
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  })

  $(document).on("click",".hedis-edit-measure",function(){
    $("#define-measure-name").html($(this).parent().attr("data"))
    $('#chosen-hedis-measure').val($(this).parent().attr("idkey"))

    $("#hedis-measure-define").modal("show")
  })

  $('#hedis-define').click(() => {
    let entry = {
      id: $('#chosen-hedis-measure').val(),
      measure: $('#define-measure-name').html(),
      measure_id: $('#hedis-define-measure').val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'hedissetting/definemeasure', (xhr, err) => {
      if (!err) {
        toastr.success('Action Succeeded!')
        $("#hedis-measure-define").modal("hide")
        notMatchedTable.ajax.reload()
      } else {
        toastr.error('Action Failed!')
        $("#hedis-measure-define").modal("hide")
        notMatchedTable.ajax.reload()
      }
    })
  })

  $('#hedissetting-match-measure').click(async () => {
    var formData = new FormData()

    formData.append("insid", $("#insforqualityloader option:checked").val())
    formData.append("clinicid", localStorage.getItem('chosen_clinic'))
    formData.append("cyear", $("#hedisdate").val())
    formData.append('qpid', $('#qualityprogramloader').val())

    var qualityentry = document.getElementById('qualityfile').files.length

    if (qualityentry != 0) {
      for (let i = 0; i < qualityentry; i++) {
        formData.append("qualityfile", document.getElementById('qualityfile').files[i])
      }

      let entry = {
        current: true,
        clinicid: localStorage.getItem('chosen_clinic'),
        qpid: $('#qualityprogramloader').val(),
        insid: $("#insforqualityloader option:checked").val()
      }
      await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'hedissetting/measurecurrent', (xhr, err) => {
        if (!err) {
          var option = ``
          var result = JSON.parse(xhr.responseText)['data']
          result.forEach(item => {
            option += `<option value='${item.id}'>${item.title}</option>`
          })
          $('#hedis-define-measure').html(option)
        }
      })

      await sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedisloader/checkmeasure", (xhr, err) => {
        if (!err) {
          var result = JSON.parse(xhr.responseText)['data']
          if (!result.length) {
            toastr.success('All measures are matched!')
          } else {
            $('#hedis-load-not-matched').modal('show')
          }
          notMatchedTable.ajax.reload()
        } else {
          toastr.error('Action Failed')
        }
      })
    } else {
      return toastr.info('Please load a file')
    }
  })
})
