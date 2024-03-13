$(document).ready(function () {
  "use strict";
  var data_table = $('#diagnostic_procedure_table').DataTable({
    "ajax": {
        "url": serviceUrl + "setting/diagnosticprocedures/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') },
        "error": function (xhr, error, code) {
          window.location.replace("./login");
        }
    },
    "pageLength": 10,
    "order": [],
    "bAutoWidth": false, 
    "columns": [
        { data: "mid"},
        { data: 'name' },
        { data: 'description'},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top " idkey="`+row.id+`">
                <button class="btn  btn-primary badge edit_btn" data-target="#user-form-modal" data-toggle="modal" type="button"><i class="fa fa-edit"></i> Edit</button>
                <button class="btn  btn-danger badge delete_btn" type="button"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });

  let measures = []
  sendFormWithToken('GET', localStorage.getItem('authToken'), [], "hedissetting/measuresData", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      for(var i=0; i<result.length; i++){
        measures[result[i]['measureId']] = result[i];
      }
    }
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/diagnosticRepStatus", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
      }
      $("#d_procedure_status").html(options);
    }
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/diagnosticSerSect", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
      }
      $("#d_procedure_category").html(options);
    }
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/reportCodes", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
      }
      $("#d_procedure_snomed").html(options);
    }
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "valueset/specimenType", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var options = '';
      for(var i=0; i<result.length; i++){
        options += '<option value="'+result[i]['code']+'" >'+result[i]['display']+'</option>';
      }
      $("#d_procedure_specimen").html(options);
    }
  });

  $(document).on("keyup","#d_procedure_mid",function(e){
    measureid_change($(this).val())
  });

  $(document).on("change","#d_procedure_mid",function(e){
    measureid_change($(this).val())
  });

  var observations = []

  function measureid_change(value){
    $('#d_procedure_measure').addClass('d-none');
    $("#d_procedure_obsid").html('');
    observations = [];
    if(measures[value]){
      $('#d_procedure_measure_name').html(measures[value]['title']);
      $('#d_procedure_measure').removeClass('d-none');
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:value}, "hedissetting/getMeasureObservationByMeasure", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'];
          
          var options = '';
          
          for(var i=0; i<result.length; i++){
            var selected = '';
            observations[result[i]['id']]= result[i]['specimen_type'];
            if(observation_id == result[i]['id'])selected = ' selected ';
            options += '<option value="'+result[i]['id']+'" '+selected+'>'+result[i]['name']+'</option>';
          }
          $("#d_procedure_obsid").html(options);
          if(!observation_id && result[0])
            if(observations[result[0]['id']])
              $("#d_procedure_specimen").val(observations[result[0]['id']]);
        }
      });
    }
  }

  $(document).on("change","#d_procedure_obsid",function(){
    $("#d_procedure_specimen").val(observations[$(this).val()]);
  });

  $(document).on("click","#add_btn",function(){
    $('.form-control').each(function() {
      if($(this).attr('type')=='checkbox'){
        $(this).prop('checked', false);
      }else{
        $(this).val('');
      }
    });
    $('#d_procedure_measure').addClass('d-none');
    $("#diagnostic_procedure_modal").modal("show");
  });

  $("#create_btn").click(function (e) {
    if($("#d_procedure_mid").val() == ""){
      toastr.info('Please enter Measure ID');
      $("#d_procedure_mid").focus();
      return;
    }
    if($("#d_procedure_name").val() == ""){
      toastr.info('Please enter Name');
      $("#d_procedure_name").focus();
      return;
    }
    let entry = {}

    $('.form-control').each(function() {
      if($(this).data('field')!==undefined){
        if($(this).attr('type')=='checkbox'){
          //$(this).prop('checked', false);
        }else{
          entry[$(this).data('field')] = $(this).val();
        }
      }
    });

    if($("#d_procedure_id").val()==""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/diagnosticprocedures/create", (xhr, err) => {
        if (!err) {
          $("#diagnostic_procedure_modal").modal("hide");
          toastr.success("Diagnostic Report is added successfully");
        } else {
          return toastr.error("Action Failed");
        }
      });
    }else{
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/diagnosticprocedures/update", (xhr, err) => {
        if (!err) {
          $("#diagnostic_procedure_modal").modal("hide");
          toastr.success("Diagnostic Report is updated successfully");
        } else {
          return toastr.error("Action Failed");
        }
      });
    }
    
    setTimeout( function () {
      data_table.ajax.reload();
    }, 1000 );
  });

  var observation_id = null;

  $(document).on("click",".edit_btn",function(){
    observation_id = null;
    $("#d_procedure_id").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#d_procedure_id").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/diagnosticprocedures/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#d_procedure_mid").val(result[0]['mid']);
        measureid_change(result[0]['mid']);
        observation_id = result[0]['obsid'];
        $("#d_procedure_name").val(result[0]['name']);
        $("#d_procedure_description").val(result[0]['description']);
        $("#d_procedure_type").val(result[0]['type']);
        $("#d_procedure_status").val(result[0]['status']);
        $("#d_procedure_category").val(result[0]['category']);
        $("#d_procedure_snomed").val(result[0]['snomed']);
        $("#d_procedure_locin").val(result[0]['locin']);
        $("#d_procedure_specimen").val(result[0]['specimen']);
        $("#diagnostic_procedure_modal").modal("show");
      } else {
        return toastr.error("Action Failed");
      }
    });
  });

  $(document).on("click",".delete_btn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/diagnosticprocedures/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              data_table.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error("Action Failed");
          }
        });
      }
		});

  });

});
