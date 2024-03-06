let globalsmsarr;
let educationlink = ''
let genderlink = ''
let agelink = ''
let langlink ='lang=en'
let glang = 'en'
let glangname = 'English'
function isFloat(n){
  if(Number(n) === n && n % 1 !== 0)
    return true;
  else
    return false;
}
function changeSeparator(tmpname,separator){
  tmpname = tmpname.replace(/[-|_/[\]\\]/g, separator);
  return tmpname;
}

function editeducationfunc (id){
  let entry = {
    id: id
  }
  sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/geteducationcontentbyid", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      console.log(result)
      $("#education_tit1").val(result[0]['subname']);
      $("#education_tit2").val(result[0]['title']);
      $("#education_content").val(result[0]['content']);
      $("#education_link").val(result[0]['link']);
      $("#mtid").val(result[0]['id'])
      $("#edu-category").val(result[0]['category'])

      $("#education-edit-modal").modal("show");
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
}

function inputType(type){
  if(type == 1){
      return "<span style = 'color:#4caf50'>General</span>";
  }
  else if(type == 2){
      return "<span style = 'color:#ff9800'>Date</span>";
  }
  else if(type == 3){
      return "<span style = 'color:#f44336'>Boolean</span>";
  }
  else{

  }
}
function updateEducationField (id,value){
  sendRequestWithToken('POST', localStorage.getItem('authToken'), { id: id, value: value }, "hedissetting/updateeducationfield", (xhr, err) => {
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
function changestatusedumsg(check,id) {
  if (check) {
    updateEducationField(id,  0);
  } else {
    updateEducationField(id,  1);
  }
}
function changeformitems(linkurl){
  let mainurl = linkurl.split("?")
  let paramarr = mainurl[1].split("&")
  educationlink = mainurl[0]+'?lang/gender/age/'
  genderlink = ''
  agelink = ''

  let gendertype = 0
  let addedlang = ''
  let agetype = 0
  let addedminage = 0
  let addedmaxage = 0
  for(let i = 0 ; i < paramarr.length ; i++ ){
    let tmparr = paramarr[i].split('=')
    switch(tmparr[0]) {
      case 'lang':
        addedlang = tmparr[1]
        break;
      case 'sex':{
        if(tmparr[1] == 'f'){
          gendertype = 1
          genderlink = '&sex=f'
        }else{
          gendertype = 2
          genderlink = '&sex=m'
        }
        break;
      }
       
      case 'min_age':{
        agetype = 1
        addedminage = tmparr[1]
        break;
      }
        
      case 'max_age':{
        agetype = 1
        addedmaxage = tmparr[1]
        break;
      }
        
      // default:
    }
  }
  
  $('.gendertype[value="'+gendertype+'"]').prop('checked', true);
  if(agetype == 0){
    $('.agerange[value="0"]').prop('checked', true);
    $('.agerange[value="1"]').prop('checked', false);
    $("#link-min-age").attr('disabled', 'disabled');
    $("#link-max-age").attr('disabled', 'disabled');
    $('#link-min-age').val(0)
    $('#link-max-age').val(0)
    agelink = ''
    
  }else{
    $('.agerange[value="1"]').prop('checked', true);
    $('.agerange[value="0"]').prop('checked', false);
    $("#link-min-age").removeAttr('disabled');
    $("#link-max-age").removeAttr('disabled');
    $('#link-min-age').val(addedminage)
    $('#link-max-age').val(addedmaxage)
    agelink = '&min_age='+addedminage+'&max_age='+addedmaxage
   
  }
}
changeAlias = (id) => {
  var source = event.target || event.srcElement;
  if (source.constructor.name !== 'XMLHttpRequest') {
      let value = document.getElementById('a' + id).value;
      sendRequestWithToken('POST', localStorage.getItem('authToken'), { id: id, value: value }, "hedissetting/updatefilealiases", (xhr, err) => {
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
$( function() {
  // $( "#sortable" ).sortable();
  // $( "#sortable" ).disableSelection();
} );

function jsonToString(data){
  var str = JSON.stringify(data, undefined, 6).replace(/\n( *)/g, function (match, p1) {
    return '<br>' + '&nbsp;'.repeat(p1.length);
  });
  return str;
}


$(document).ready(async function () {
  "use strict";
  // $('#colortcolor').colorpicker();
  // $('#colorbcolor').colorpicker();
  // $('#ecolortcolor').colorpicker();
  // $('#ecolorbcolor').colorpicker();

  var qppmeasuretable;

  load_qpp_table(0);

  function load_qpp_table(type){
    sendFormWithToken('POST', localStorage.getItem('authToken'), {}, "hedissetting/getYearsQppMeasuresData", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        var html = '';
        var selected = '';
        
        for(var i=0; i<result.length; i++){
          selected = '';
          if(type==0){
            if(i == result.length-1){
              selected = ' selected ';
              $('#selected_year').val(result[i]['eyear']);
            }
          }else{
            if($('#selected_year').val()==""){
              selected = ' selected ';
              $('#selected_year').val(result[0]['eyear']);
            }else{
              if($('#selected_year').val()==result[i]['eyear']){
                selected = ' selected ';
              }
            }
          }
          
          html += '<option value="'+result[i]['eyear']+'" '+selected+'>'+result[i]['eyear']+'</option>';
        }
        $("#qpp_years").html(html);
        if(selected_year != ''){
          if(type==0){
            qppmeasuretable = $('#qppmeasuretable').DataTable({
              "ajax": {
                  "url": serviceUrl + "hedissetting/qppMeasuresData?eyear="+$('#selected_year').val(),
                  "type": "GET",
                  "headers": { 'Authorization': localStorage.getItem('authToken') }
              },
              "processing": true,
              "columns": [
                 { data: 'measureId'},
                 { data: 'nqfId'},
                 { data: 'eMeasureId'},
                 { data: 'title'},
                 { data: 'id',
                      render: function (data, type, row) {
                        return `
                          <div idkey="`+row.id+`">
                          <button class="btn btn-sm btn-primary showQppModal"><i class="fa fa-eye"></i> More</button>
                          </div>
                        `
                      } 
                    }
              ]
            });
          }else{
            qppmeasuretable.ajax.url(serviceUrl + "hedissetting/qppMeasuresData?eyear="+$('#selected_year').val()).load()
          }
          
        }
      } else {
        $(".progress-load").addClass("d-none");
        return toastr.error('Action Failed');
      }
    });
  }
  

  
  
  $('#qpp_measure_table_search_input').on('keyup', function () {
    qppmeasuretable.search(this.value).draw();
  });

  $(document).on("click","#qppimportbtn",function(){
    const d = new Date();
    $("#qpp_import_year").val(d.getFullYear());
    $("#qpp-import-modal").modal("show");
  });

  $("#qpp_import_btn").click(function(){
    var formData = new FormData();
    var qppfile = document.getElementById('qppfile').files.length;
    if (qppfile != 0) {
      $('.username').html(localStorage.getItem('username'));
      $(".cdate").html(new Date().toDateString()+" "+new Date().toLocaleTimeString())
      formData.append("year", $("#qpp_import_year").val());
      for (let i = 0; i < qppfile; i++) {
          formData.append("qppfile", document.getElementById('qppfile').files[i]);
      }
      $(".progress-load").removeClass("d-none");
      sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "hedissetting/importQppMeasuresData", (xhr, err) => {
          if (!err) {
            $("#qpp-import-modal").modal("hide");
            $(".progress-load").addClass("d-none");
            load_qpp_table(1);
            return toastr.success('Action successfully');
          } else {
            $(".progress-load").addClass("d-none");
            return toastr.error(err);
          }
      });
    } else {
      return toastr.info('Please load file');
    }
  });

 
  $(document).on("change","#qpp_years",function(){
    $('#selected_year').val($(this).val());
    qppmeasuretable.clear().draw();
    qppmeasuretable.ajax.url(serviceUrl + "hedissetting/qppMeasuresData?eyear="+$('#selected_year').val()).load()
  });
  

  $(document).on("click",".showQppModal",function(){
    $('#qpp_data').html('');
    let entry = {
      id: $(this).parent().attr("idkey")
    }

    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/qppMeasuresDataById", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length>0){
          var data = '';
          var a = result[0];
          for (const [key, value] of Object.entries(result[0])) {
            
            var str = value?value:null;
            if(str){
              if (data !== '') {
                data += '<br>';
              }
              try{
                var obj = JSON.parse(str.replace(/\n/g,"<br>"));
                if(typeof obj==='object' || Array.isArray(obj)){
                  data += '<div><b>'+key+'</b><span>: '+jsonToString(obj)+'</span></div>';
                }else{
                  data += '<div><b>'+key+'</b><span>: '+str+'</span></div>';
                }
                
              }catch(e){
                data += '<div><b>'+key+'</b><span>: '+jsonToString(str)+'</span></div>';
              }
            }
            
          }
          
          $('#qpp_data').html(data);
        }

      }
    });
  
    $("#qpp-measure-modal").modal("show");
  });
  

  var hdomaintable = $('#hdomaintable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/gethdomain",
        "type": "GET",
    },
    "columns": [
        { data: "Organization" },
        { data: 'Measure_Type' },
        { data: 'Health_Care_Domain' },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary edithdomainbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletehdomainbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  });
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/gethdomain", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#measure_domain").empty();
      $("#emeasure_domain").empty();
      for(var i = 0;i < result.length;i++){
        $("#measure_domain").append(`<option value="`+result[i]['id']+`">`+result[i]['Health_Care_Domain']+`</option>`)
        $("#emeasure_domain").append(`<option value="`+result[i]['id']+`">`+result[i]['Health_Care_Domain']+`</option>`)
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });

  $(document).on("click","#hdomainaddbtn",function(){
    $("#hdomain_id").val('');
    $("#hdomain_org").val('');
    $("#hdomain_type").val('');
    $("#hdomain_domain").val('');
    $("#hdomain-modal").modal("show");
  });
  $("#hdomain_addbtn").click(function (e) {
    if($("#hdomain_org").val() == ""){
      toastr.info('Please enter Organization');
      $("#hdomain_org").focus();
      return;
    }
    if($("#hdomain_type").val() == ""){
      toastr.info('Please enter MEASURE TYPE');
      $("#hdomain_type").focus();
      return;
    }
    if($("#hdomain_domain").val() == ""){
      toastr.info('Please enter HEALTH CARE DOMAIN');
      $("#hdomain_domain").focus();
      return;
    }
    let entry = {
      id: document.getElementById('hdomain_id').value,
      org: document.getElementById('hdomain_org').value,
      type: document.getElementById('hdomain_type').value,
      domain: document.getElementById('hdomain_domain').value
    }
    if($("#hdomain_id").val() == ""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addhdomain", (xhr, err) => {
        if (!err) {
          $("#hdomain-modal").modal("hide");
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
    }else{
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatehdomain", (xhr, err) => {
        if (!err) {
          $("#hdomain-modal").modal("hide");
          return $.growl.notice({
            message: "Action successfully"
          });
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
    }
    
    setTimeout( function () {
      hdomaintable.ajax.reload();
    }, 1000 );
    
  });

  $(document).on("click",".edithdomainbtn",function(){
    $("#chosen_hdomain").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_hdomain").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosenhdomain", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#hdomain_id").val(result[0]['id']);
        $("#hdomain_org").val(result[0]['Organization']);
        $("#hdomain_type").val(result[0]['Measure_Type']);
        $("#hdomain_domain").val(result[0]['Health_Care_Domain']);
        $("#hdomain-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  $(document).on("click",".deletehdomainbtn",function(){
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
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
      }
		}).then(function (result) {
      if (result.value) {
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletehdomain", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              hdomaintable.ajax.reload();
            }, 1000 );
          } else {
            toastr.error('Credential is invalid');
          }
        });	
      }
		});

  });

  // await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/languagelist", (xhr, err) => {
  
  //   if (!err) {
  //     let result = JSON.parse(xhr.responseText)['data'];
      
  //     // $("#link-dg-lang").empty();
  //     for(var i = 0;i < result.length;i++){
  //       if(result[i]['code'] != 'en'){
  //         $("#link-dg-lang").append(`<option value="`+result[i]['code']+`" >`+result[i]['English']+`</option>`)
  //       }
        
  //     }
  //   } else {
  //     return $.growl.error({
  //       message: "Action Failed"
  //     });
  //   }
  // });
  // await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/getcomcategorycode", (xhr, err) => {
  
  //   if (!err) {
  //     let result = JSON.parse(xhr.responseText)['data'];
  //     console.log(result)
  //     // $("#link-dg-lang").empty();
  //     for(var i = 0;i < result.length;i++){
  //         $("#link-dg-cate").append(`<option value="`+result[i]['code']+`" >`+result[i]['display']+`</option>`)
  //         $("#edu-category").append(`<option value="`+result[i]['code']+`" >`+result[i]['display']+`</option>`)
  //     }
  //   } else {
  //     return $.growl.error({
  //       message: "Action Failed"
  //     });
  //   }
  // });

//   await sendRequestWithToken('post', localStorage.getItem('authToken'), {stoken:'baresinother-F-6l1ZiHHCbbFwCtxmwlcTUfhT1yEazFIy4HDhsmNwDXOiOkSPYgxXukKw'}, "setting/getconectorcliniclist", (xhr, err) => {
//     if (!err) { let result = JSON.parse(xhr.responseText);
//     console.log("result")
//     console.log(result)
//     } else {
//       return $.growl.error({
//         message: "Action Failed"
//       });
//     }
// });

  

  
  $(document).on("click",".editeducationbtn",function(){
    $("#chosen_hdomain").val($(this).parent().attr("idkey"));
    
  });

 

  
  $("#hdomain_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_hdomain').value,
      org: document.getElementById('ehdomain_org').value,
      type: document.getElementById('ehdomain_type').value,
      domain: document.getElementById('ehdomain_domain').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatehdomain", (xhr, err) => {
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
      hdomaintable.ajax.reload();
    }, 1000 );
  });

  $("#educ_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('mtid').value,
      tit1: document.getElementById('education_tit1').value,
      tit2: document.getElementById('education_tit2').value,
      content: document.getElementById('education_content').value,
      link: document.getElementById('education_link').value,
      category : $("#edu-category").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updateeducationbyid", (xhr, err) => {
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
      educationtable.ajax.reload();
    }, 1000 );
  });


  

  //measure area
  var measuretable = $('#measuretable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getmeasure",
        "type": "GET"
    },
    "columns": [
        { data: "id" },
        { data: 'domain',
          render: function (data, type, row) {
            return `
              <span class="reduce_text">`+row.domain+`</span>
            `
          } 
        },
        { data: 'Measure',
          render: function (data, type, row) {
            return `
              <span class="reduce_text">`+row.Measure+`</span>
            `
          } 
        },
        { data: 'Rates',
          render: function (data, type, row) {
            return `
              <span class="reduce_text">`+row.Rates+`</span>
            `
          } 
        },
        { data: 'Description',
          render: function (data, type, row) {
            return `
              <span class="reduce_text">`+row.Description+`</span>
            `
          } 
        },
        { data: 'Age_Int'},
        { data: 'Age_end'},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input measureoutcomecheck" name="measureoutcomecheck" value="`+row.id+`" `+(row.outcomecheck==1?"checked":"")+`>
                <span class="tag custom-control-label"></span>
              </label>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input measureyearlycheck" name="measureyearlycheck" value="`+row.id+`" `+(row.yearlycheck==1?"checked":"")+`>
                <span class="tag custom-control-label"></span>
              </label>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-info editoutcomebtn" `+(row.outcomecheck != 1?"disabled":"")+`><i class="fa fa-edit"></i> Outcome</button>
              <button class="btn btn-sm btn-primary editmeasurebtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletemeasurebtn"><i class="fa fa-trash"></i> Delete</button>
              <button class="btn btn-sm btn-success linkmeasurebtn"><i class="fa fa-link" aria-hidden="true"></i> Link</button>
              </div>
            `
          } 
        }
    ]
  });
  var definemeasuretable = $('#definemeasuretable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getmeasure",
        "type": "GET"
    },
    "columns": [
        { data: "id" },
        { data: 'Measure',
          render: function (data, type, row) {
            return `
              <span class="reduce_text_2">`+row.Measure+`</span>
            `
          } 
        },
        { data: 'Rates',
          render: function (data, type, row) {
            return `
              <span class="reduce_text_2">`+row.Rates+`</span>
            `
          } 
        },
    ]
  });
  
  $(document).on("click","#measureaddbtn",function(){
    $("#measure-add-modal").modal("show");
  });
  $("#measure_addbtn").click(function (e) {
    let entry = {
      domain: document.getElementById('measure_domain').value,
      acronym: document.getElementById('measure_acronym').value,
      measure: document.getElementById('measure_measure').value,
      rate: document.getElementById('measure_rate').value,
      percentage: document.getElementById('measure_percentage').value,
      gender: document.getElementById('measure_gender').value,
      quantity: document.getElementById('measure_quantity').value,
      description: document.getElementById('measure_description').value,
      age_int: document.getElementById('measure_age_int').value,
      age_end: document.getElementById('measure_age_end').value,
      test_span: document.getElementById('measure_test_span').value,
      time_frame: document.getElementById('measure_time_frame').value,
      date_type: document.getElementById('emeasure_date_type').value,
      time_duration: document.getElementById('emeasure_time_duration').value,
      clinic_items: document.getElementById('measure_clinic_items').value,
      variables: document.getElementById('measure_variables').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addmeasure", (xhr, err) => {
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
      measuretable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editmeasurebtn",function(){
    $("#chosen_measure").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_measure").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosenmeasure", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#emeasure_domain").val(result[0]['D_ID']);
        $("#emeasure_acronym").val(result[0]['acronym']);
        $("#emeasure_measure").val(result[0]['Measure']);
        $("#emeasure_rate").val(result[0]['Rates']);
        $("#emeasure_percentage").val(result[0]['Percentage']);
        $("#emeasure_gender").val(result[0]['Gender']);
        $("#emeasure_quantity").val(result[0]['quantity']);
        $("#emeasure_description").val(result[0]['Description']);
        $("#emeasure_age_int").val(result[0]['Age_Int']);
        $("#emeasure_age_end").val(result[0]['Age_end']);
        $("#emeasure_test_span").val(result[0]['Test_Span']);
        $("#emeasure_time_frame").val(result[0]['Time_Frame']);
        $("#emeasure_date_type").val(result[0]['date_type']);
        $("#emeasure_time_duration").val(result[0]['Time_duration']);
        $("#emeasure_clinic_items").val(result[0]['Clinical_items']);
        $("#emeasure_variables").val(result[0]['keywords']);
        $("#measure-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#measure_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_measure').value,
      domain: document.getElementById('emeasure_domain').value,
      acronym: document.getElementById('emeasure_acronym').value,
      measure: document.getElementById('emeasure_measure').value,
      rate: document.getElementById('emeasure_rate').value,
      percentage: document.getElementById('emeasure_percentage').value,
      gender: document.getElementById('emeasure_gender').value,
      quantity: document.getElementById('emeasure_quantity').value,
      description: document.getElementById('emeasure_description').value,
      age_int: document.getElementById('emeasure_age_int').value,
      age_end: document.getElementById('emeasure_age_end').value,
      test_span: document.getElementById('emeasure_test_span').value,
      time_frame: document.getElementById('emeasure_time_frame').value,
      date_type: document.getElementById('emeasure_date_type').value,
      time_duration: document.getElementById('emeasure_time_duration').value,
      clinic_items: document.getElementById('emeasure_clinic_items').value,
      variables: document.getElementById('emeasure_variables').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatemeasure", (xhr, err) => {
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
      measuretable.ajax.reload();
    }, 1000 );
  });
  
  $(document).on("click",".linkmeasurebtn",function(){
    let entry = {
      measureid: $(this).parent().attr("idkey"),
      name:$(this).parent().parent().parent().children().eq(2).text(),
      langid : 'en'
    }
    $('#ms-dg-id').text(entry.measureid)
    $('#ms-dg-name').text(entry.name)
    
    $('#sameiddiv').hide()
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/getsmslinklang", (xhr, err) => {
        if (!err) {
          globalsmsarr = JSON.parse(xhr.responseText)['data'];
      
          console.log("globalsmsarr")
          console.log(globalsmsarr)
          if(globalsmsarr.length > 0 ){
            $("#link-dg-sublist").empty();
            for(var i = 0;i < globalsmsarr.length;i++){
              $("#link-dg-sublist").append(`<option value="`+globalsmsarr[i]['id']+`">`+globalsmsarr[i]['subname']+`</option>`)
              if(i==0){
                $("#edu_sms_desc").val(globalsmsarr[i].content);
                $("#link-url").val(globalsmsarr[i].link);
                $("#link-dg-title").val(globalsmsarr[i].title)
                $("#link-dg-mid").val(globalsmsarr[i].subname)
                $(".addlinkbtn").val(globalsmsarr[i].id)
                changeformitems(globalsmsarr[i].link)
              }
            }
          }else{
              $("#edu_sms_desc").val("");
              $("#link-url").val("");
              $("#link-dg-title").val("")
              $("#link-dg-mid").val("")
          }
         
          $("#link-set-modal").modal("show");
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
    

   
  });


  $(document).on("click",".deletemeasurebtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletemeasure", (xhr, err) => {
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
  });
  $(document).on("click",".measureoutcomecheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updateoutcome", (xhr, err) => {
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
  });
  $(document).on("click",".measureyearlycheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatemeasureyearly", (xhr, err) => {
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
  });
  
  $(document).on("click",".editoutcomebtn",function(){
    $("#chosen_measure").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    $(".mh_table_range tbody").empty();
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/getoutranges", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        for(var i = 0;i < result.length;i++){
          $(".mh_table_range tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['name']+"</td><td>"+result[i]['v1']+"</td><td>"+result[i]['v2']+"</td><td><button class='btn btn-sm btn-danger mh_range_delete'><i class='fa fa-trash'></i></button></td>");
        }
        $("#mh_out_range_modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(".addoutrange").click(function(){
    $(".mh_table_range tbody").empty();
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$("#chosen_measure").val(),name:$("#outrangename").val(),v1:$("#outrangev1").val(),v2:$("#outrangev2").val()}, "hedissetting/addoutrangevalue", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        for(var i = 0;i < result.length;i++){
          $(".mh_table_range tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['name']+"</td><td>"+result[i]['v1']+"</td><td>"+result[i]['v2']+"</td><td><button class='btn btn-sm btn-danger mh_range_delete'><i class='fa fa-trash'></i></button></td>");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  }); 
  
  $(document).on("click",".mh_range_delete",function(){
    let entry = {
      id: $(this).parent().parent().attr("id"),
    }
    var tmp = $(this).parent().parent();
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deleteoutrangevalue", (xhr, err) => {
          if (!err) {
            tmp.remove()
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });


  //CPT ICD MAP area
  var cimtable = $('#cimtable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getcim",
        "type": "GET"
    },
    "columns": [
        { data: "M_ID" },
        { data: 'Measure',
          render: function (data, type, row) {
            return `
              <span class="reduce_text">`+row.Measure+`</span>
            `
          } 
        },
        { data: 'Des',
          render: function (data, type, row) {
            return `
              <span class="reduce_text">`+row.Des+`</span>
            `
          } 
        },
        { data: 'Map source',
          render: function (data, type, row) {
            return `All`
          } 
        },
        { data: 'Age_Int',
          render: function (data, type, row) {
            return row.age_from!=null?row.age_from:row.Age_Int
          }
        },
        { data: 'Age_end',
          render: function (data, type, row) {
            return row.age_to!=null?row.age_to:row.Age_end
          }
        },
        { data: "Value",
          render: function (data, type, row) {
            return isFloat(parseFloat(row.Value))?(Math.round(row.Value * 10) / 10):row.Value
          }
        },
        { data: "CPT_1" },
        { data: "ICD_10" },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input cimrangecheck" name="cimrangecheck" value="`+row.id+`" `+(row.rangecheck==1?"checked":"")+`>
                <span class="tag custom-control-label"></span>
              </label>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-info editcimrangebtn" `+(row.rangecheck != 1?"disabled":"")+`><i class="fa fa-edit"></i> Range</button>
              <button class="btn btn-sm btn-primary editcimbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletecimbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  $(document).on("click","#cimaddbtn",function(){
    $("#cim-add-modal").modal("show");
  });
  $("#cim_addbtn").click(function (e) {
    let entry = {
      m_id: document.getElementById('cim_m_id').value,
      it_id: document.getElementById('cim_it_id').value,
      desc: document.getElementById('cim_desc').value,
      value: document.getElementById('cim_value').value,
      gender: document.getElementById('cim_gender').value,
      age_from: document.getElementById('cim_age_int').value,
      age_to: document.getElementById('cim_age_end').value,
      cpt1: document.getElementById('cim_cpt1').value,
      cpt2: document.getElementById('cim_cpt2').value,
      icd1: document.getElementById('cim_icd_1').value,
      icd2: document.getElementById('cim_icd_2').value,
      icd3: document.getElementById('cim_icd_3').value,
      icd4: document.getElementById('cim_icd_4').value,
      icd5: document.getElementById('cim_icd_5').value,
      locin1: document.getElementById('cim_locin_1').value,
      locin2: document.getElementById('cim_locin_2').value,
      locin3: document.getElementById('cim_locin_3').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addcim", (xhr, err) => {
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
      cimtable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editcimbtn",function(){
    $("#chosen_cim").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_cim").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosencim", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#ecim_m_id").val(result[0]['M_ID']);
        $("#ecim_it_id").val(result[0]['it_id']);
        $("#ecim_desc").val(result[0]['Des']);
        $("#ecim_value").val(result[0]['Value']);
        $("#ecim_gender").val(result[0]['sex']);
        $("#ecim_age_int").val(result[0]['age_from']);
        $("#ecim_age_end").val(result[0]['age_to']);
        $("#ecim_cpt1").val(result[0]['CPT_1']);
        $("#ecim_cpt2").val(result[0]['CPT_2']);
        $("#ecim_icd_1").val(result[0]['ICD_10']);
        $("#ecim_icd_2").val(result[0]['ICD_10_2']);
        $("#ecim_icd_3").val(result[0]['ICD_10_3']);
        $("#ecim_icd_4").val(result[0]['ICD_10_4']);
        $("#ecim_icd_5").val(result[0]['ICD_9']);
        $("#ecim_locin_1").val(result[0]['LOCIN']);
        $("#ecim_locin_2").val(result[0]['LOCIN2']);
        $("#ecim_locin_3").val(result[0]['LOCIN3']);
        $("#cim-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#cim_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_cim').value,
      m_id: document.getElementById('ecim_m_id').value,
      it_id: document.getElementById('ecim_it_id').value,
      desc: document.getElementById('ecim_desc').value,
      value: document.getElementById('ecim_value').value,
      gender: document.getElementById('ecim_gender').value,
      age_from: document.getElementById('ecim_age_int').value,
      age_to: document.getElementById('ecim_age_end').value,
      cpt1: document.getElementById('ecim_cpt1').value,
      cpt2: document.getElementById('ecim_cpt2').value,
      icd1: document.getElementById('ecim_icd_1').value,
      icd2: document.getElementById('ecim_icd_2').value,
      icd3: document.getElementById('ecim_icd_3').value,
      icd4: document.getElementById('ecim_icd_4').value,
      icd5: document.getElementById('ecim_icd_5').value,
      locin1: document.getElementById('ecim_locin_1').value,
      locin2: document.getElementById('ecim_locin_2').value,
      locin3: document.getElementById('ecim_locin_3').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatecim", (xhr, err) => {
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
      cimtable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletecimbtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    var tmp = $(this).parent().parent().parent()
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletecim", (xhr, err) => {
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
  });
  
  $(document).on("click",".cimrangecheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatecimrange", (xhr, err) => {
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
  });
  
  $(document).on("click",".editcimrangebtn",function(){
    $("#chosen_cim").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    $(".cim_table_range tbody").empty();
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/getcimranges", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        for(var i = 0;i < result.length;i++){
          $(".cim_table_range tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['icd']+"</td><td>"+result[i]['v1']+"</td><td>"+result[i]['v2']+"</td><td><button class='btn btn-sm btn-danger cim_range_delete'><i class='fa fa-trash'></i></button></td>");
        }
        $("#cim_range_modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(".addcimrange").click(function(){
    $(".cim_table_range tbody").empty();
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$("#chosen_cim").val(),name:$("#cimicd").val(),v1:$("#cimrangev1").val(),v2:$("#cimrangev2").val()}, "hedissetting/addcimrangevalue", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        for(var i = 0;i < result.length;i++){
          $(".cim_table_range tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['icd']+"</td><td>"+result[i]['v1']+"</td><td>"+result[i]['v2']+"</td><td><button class='btn btn-sm btn-danger cim_range_delete'><i class='fa fa-trash'></i></button></td>");
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  }); 
  
  $(document).on("click",".cim_range_delete",function(){
    let entry = {
      id: $(this).parent().parent().attr("id"),
    }
    var tmp = $(this).parent().parent();
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletecimrangevalue", (xhr, err) => {
          if (!err) {
            tmp.remove()
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });

  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/gethdate", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      if(result.length>0){
        $("#hedisdate").val(new Date(result[0]['idate']).getFullYear());
      }
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $("#updatehdate").click(function(){
    let entry = {
      date:$("#hedisdate").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatehdate", (xhr, err) => {
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
  });

  //Color Theme area
  var colortable = $('#colortable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getcolor",
        "type": "GET"
    },
    "columns": [
        { data: 'scheck'},
        { data: "type",
          render: function (data, type, row) {
            return (row.type == 0?"All":(row.type == 1?"Manual":(row.type == 2?"Loaded":"API")))
          } 
        },
        { data: 'name'},
        { data: 'acronym'},
        { data: 'description',
          render: function (data, type, row) {
            return `
              <span class="reduce_text">`+row.description+`</span>
            `
          } 
        },
        { data: 'status',
          render: function (data, type, row) {
            return (row.status == 1?"Compliant":(row.status == 2?"In-Play":(row.status == 3?"Non-Compliant":"Not Controlled")))
          } 
        },
        { data: 'tcolor',
          render: function (data, type, row) {
            return `
              <span class="color-box" style="background-color:`+row.tcolor+`">`+row.tcolor+`</span>
            `
          } 
        },
        { data: 'bcolor',
          render: function (data, type, row) {
            return `
              <span class="color-box" style="background-color:`+row.bcolor+`">`+row.bcolor+`</span>
            `
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editcolorbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletecolorbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });
  
  $("#coloraddbtn").click(function(){
    $("#color-add-modal").modal("show");
  });
  $(".addcoloritem").click(function(){
    let entry = {
      name: document.getElementById('colorname').value,
      acronym: document.getElementById('coloracronym').value,
      desc: document.getElementById('colordesc').value,
      type: document.getElementById('colortype').value,
      cat: document.getElementById('colorcat').value,
      status: document.getElementById('colorstatus').value,
      tcolor: document.getElementById('colortcolor').value,
      bcolor: document.getElementById('colorbcolor').value,
      check: document.getElementById('colorcheck').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addcolor", (xhr, err) => {
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
      colortable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editcolorbtn",function(){
    $("#chosen_color").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_color").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosencolor", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#ecolortype").val(result[0]['type']);
        $("#ecolorcat").val(result[0]['category']);
        $("#ecolorname").val(result[0]['name']);
        $("#ecoloracronym").val(result[0]['acronym']);
        $("#ecolordesc").val(result[0]['description']);
        $("#ecolorstatus").val(result[0]['status']);
        $("#ecolortcolor").val(result[0]['tcolor']);
        $("#ecolorbcolor").val(result[0]['bcolor']);
        $("#ecolorcheck").val(result[0]['scheck']);
        $("#color-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(".editcoloritem").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_color').value,
      name: document.getElementById('ecolorname').value,
      acronym: document.getElementById('ecoloracronym').value,
      desc: document.getElementById('ecolordesc').value,
      type: document.getElementById('ecolortype').value,
      cat: document.getElementById('ecolorcat').value,
      status: document.getElementById('ecolorstatus').value,
      tcolor: document.getElementById('ecolortcolor').value,
      bcolor: document.getElementById('ecolorbcolor').value,
      check: document.getElementById('ecolorcheck').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatecolor", (xhr, err) => {
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
      colortable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletecolorbtn",function(){
    var tmp = $(this).parent().parent().parent();
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletecolor", (xhr, err) => {
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
  });

  //Ignore Measure
  var imeasuretable = $('#imeasuretable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getimeasure",
        "type": "GET",
    },
    "columns": [
        { data: "name" },
        { data: 'desc' },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editimeasurebtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deleteimeasurebtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  });
  $(document).on("click","#imeasureaddbtn",function(){
    $("#imeasure-add-modal").modal("show");
  });
  $("#imeasure_addbtn").click(function (e) {
    let entry = {
      name: document.getElementById('imeasure_name').value,
      desc: document.getElementById('imeasure_desc').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addimeasure", (xhr, err) => {
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
      imeasuretable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editimeasurebtn",function(){
    $("#chosen_imeasure").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_imeasure").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosenimeasure", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#eimeasure_name").val(result[0]['name']);
        $("#eimeasure_desc").val(result[0]['desc']);
        $("#imeasure-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#imeasure_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_imeasure').value,
      name: document.getElementById('eimeasure_name').value,
      desc: document.getElementById('eimeasure_desc').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updateimeasure", (xhr, err) => {
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
      imeasuretable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deleteimeasurebtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deleteimeasure", (xhr, err) => {
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
  });

  //Measure Not Identified
  var nmeasuretable = $('#nmeasuretable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getnmeasure",
        "type": "GET",
    },
    "columns": [
        { data: "measure" },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.measure+`">
              <button class="btn btn-sm btn-primary editnmeasurebtn"><i class="fa fa-edit"></i> Define</button>
              <button class="btn btn-sm btn-danger deletenmeasurebtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  });
  $(document).on("click",".deletenmeasurebtn",function(){
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
  });
  $(document).on("click",".editnmeasurebtn",function(){
    $("#chosen-define-measure").html($(this).parent().parent().parent().children().eq(0).html())
    $("#measure-define-modal").modal("show");
  });
  $(document).on("click","#definemeasuretable tr",function(){
    let entry = {
      variable:$("#chosen-define-measure").html(),
      id:$(this).children().eq(0).html()
    }
    swal({
			title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, apply it!",
		}, function(inputValue) {
			if (inputValue) {
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/applymeasure", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              nmeasuretable.ajax.reload();
            }, 1000 );
            $("#measure-define-modal").modal("hide");
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
			}
		});
  });

  //Measure Time Frame
  var mtimetable = $('#mtimetable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getmtime",
        "type": "GET",
    },
    "columns": [
        { data: "name" },
        { data: 'description' },
        { data: 'type',
          render: function (data, type, row) {
            if(row.type == 1)
              return "Year";
            else if(row.type == 2)
              return "Month";
          }  
        },
        { data: 'range' },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editmtimebtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletemtimebtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  });
  $(document).on("click","#mtimeaddbtn",function(){
    $("#mtime-add-modal").modal("show");
  });
  $("#mtime_addbtn").click(function (e) {
    let entry = {
      name: document.getElementById('mtime_name').value,
      desc: document.getElementById('mtime_desc').value,
      type: document.getElementById('mtime_type').value,
      range: document.getElementById('mtime_range').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addmtime", (xhr, err) => {
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
      mtimetable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editmtimebtn",function(){
    $("#chosen_mtime").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_mtime").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosenmtime", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#emtime_name").val(result[0]['name']);
        $("#emtime_desc").val(result[0]['description']);
        $("#emtime_type").val(result[0]['type']);
        $("#emtime_range").val(result[0]['range']);
        $("#mtime-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#mtime_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_mtime').value,
      name: document.getElementById('emtime_name').value,
      desc: document.getElementById('emtime_desc').value,
      type: document.getElementById('emtime_type').value,
      range: document.getElementById('emtime_range').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatemtime", (xhr, err) => {
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
      mtimetable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deletemtimebtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletemtime", (xhr, err) => {
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
  });
  
  //Constructor
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getchoseninsurances", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#fileinsid").empty();
      $("#fileinsid").append("<option value = '0'>Nothing Selected</option>");
      for(var i = 0; i < result.length; i++){
        $("#fileinsid").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['insName']+`</option>
        `);
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "hedissetting/getfilenames", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#filenameid").empty();
      $("#filenameid").append("<option value = '0'>Nothing Selected</option>");
      for(var i = 0; i < result.length; i++){
        $("#filenameid").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['insName']+":"+result[i]['name']+`</option>
        `);
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  var filenametable = $('#filenametable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getfilenames",
        "type": "GET",
    },
    "columns": [
        { data: "insName" },
        { data: 'filedefinition',
          render: function (data, type, row) {
            return row.filedefinition==1?"ENC File":(row.filedefinition==2?"LAB File":"ESD File")
          }
        },
        { data: 'name' },
        { data: 'filetype',
          render: function (data, type, row) {
            return row.filetype==1?"CSV":(row.filetype==2?"XLSX":"TXT")
          }
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editfilenamebtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deletefilenamebtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ],
  });
  var separator = "_";
  var tmpname = "";
  $("#filename").change(function(){
      tmpname = $(this).val();
  });
  $("#separator").change(function(){
      separator = $(this).val();
      tmpname = changeSeparator(tmpname,$(this).val());
      $("#filename").val(tmpname);
  });
  $("#prefix").change(function(){
      if($(this).val()!=0){
          tmpname = tmpname+(tmpname==""?"":separator)+($(this).find("option:selected")).text();
          $("#filename").val(tmpname);
      }
  });
  $("#state").change(function(){
      if($(this).val()!=0){
          tmpname = tmpname+(tmpname==""?"":separator)+($(this).find("option:selected")).val();
          $("#filename").val(tmpname);
      }
  });
  $("#fileinsid").change(function(){
    if($(this).val()!=0){
        $(".generatefilenamebtn").prop("disabled",false);
    }
    else{
        $(".generatefilenamebtn").prop("disabled",true);
    }
  });
  $(".generatefilenamebtn").click(function(){
    if($("#filedefinition").val() == 0){
      return $.growl.notice({
        message: "Please choose File Definition"
      });
    }
    else if($("#filename").val() == ""){
      return $.growl.notice({
        message: "Please generate file name"
      });
    }
    else{
      let entry = {
        insid:$("#fileinsid").val(),
        value:$("#filename").val(),
        filetype:$("#filetype").val(),
        filedefinition:$("#filedefinition").val()
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addfilename", (xhr, err) => {
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
      setTimeout( function () {
        filenametable.ajax.reload();
      }, 1000 );
    }
  });
  $(document).on("click",".deletefilenamebtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletefilename", (xhr, err) => {
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
  });
  $(document).on("click",".editfilenamebtn",function(){
    $("#chosen_filename").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_filename").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosenfilename", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#efilename").val(result[0]['name']);
        $("#efiletype").val(result[0]['filetype']);
        $("#efiledefinition").val(result[0]['filedefinition']);
        $("#filename-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $("#filename_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_filename').value,
      value:$("#efilename").val(),
      filetype:$("#efiletype").val(),
      filedefinition:$("#efiledefinition").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updatefilename", (xhr, err) => {
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
      filenametable.ajax.reload();
    }, 1000 );
  });
  $("#filenameid").change(function(){
      if($(this).val()!=0){
        $('.field_ul').empty();
        $(".fieldnamebtn").prop("disabled",false);
        $(".setPosbtn").prop("disabled",false);
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {filename:$("#filenameid").val()}, "hedissetting/getfieldlists", (xhr, err) => {
          if (!err) {
            let data = JSON.parse(xhr.responseText)['data'];
            $('.field_ul').empty();
            for(var i = 0; i < data.length; i++){
                $('.field_ul').append("<li class='ui-state-default "+(data[i]['required']==1?"required_item":"")+"' id = "+data[i]['id']+"><div class = 'row'><div class = 'col-auto'>"+data[i]['order']+" "+data[i]['fieldname']+"</div><div class = 'col'>"+inputType(data[i]['fieldtype'])+"<i class='fa fa-edit editfield'>&nbsp;</i><i class='fa fa-trash deletefield'></i></div></div></li>");   
            }
          } else {
            return $.growl.error({
              message: "Action Failed"
            });
          }
        });
      }
      else{
        $(".fieldnamebtn").prop("disabled",true);
        $(".setPosbtn").prop("disabled",true);
        $('.field_ul').empty();
      }
  });
  $(".fieldnamebtn").click(function(){
    if($("#fieldname").val() == ""){
      return $.growl.notice({
        message: "Please enter field name"
      });
    }
    else{
      $("#field_define_modal").modal('show');
    }
  });
  $(".fieldtypeitem").change(function(){
      if($(this).val()==2){
          $(".fieldformatsection").removeClass("d-none");
      }
      else{
          $(".fieldformatsection").addClass("d-none");
      }
  });
  $(".efieldtypeitem").change(function(){
      if($(this).val()==2){
          $(".efieldformatsection").removeClass("d-none");
      }
      else{
          $(".efieldformatsection").addClass("d-none");
      }
  });
  $(".addfieldbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {filename:$("#filenameid").val(),fieldname:$("#fieldname").val(),fieldtype:$(".fieldtypeitem:checked").val(),fieldformat:$("#dateformat").val(),required:$("#requireditem:checked").val()}, "hedissetting/addfield", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $('.field_ul').empty();
        for(var i = 0; i < data.length; i++){
            $('.field_ul').append("<li class='ui-state-default "+(data[i]['required']==1?"required_item":"")+"' id = "+data[i]['id']+"><div class = 'row'><div class = 'col-auto'>"+data[i]['order']+" "+data[i]['fieldname']+"</div><div class = 'col'>"+inputType(data[i]['fieldtype'])+"<i class='fa fa-edit editfield'>&nbsp;</i><i class='fa fa-trash deletefield'></i></div></div></li>");    
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });
  $(".setPosbtn").click(function(){
      var field_idarray = [];
      for(var i = 0; i < $(".field_ul").children().length; i++){
          field_idarray[i] = $(".field_ul").children().eq(i).attr('id');
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {field_idarray:field_idarray}, "hedissetting/setPosfield", (xhr, err) => {
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
  $(document).on("click",".deletefield",function(){
    var tmp = $(this).parent().parent().parent();
    let entry = {
      id: $(this).parent().parent().parent().attr("id"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deletefield", (xhr, err) => {
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
  });
  $(document).on("click",".editfield",function(){
      $("#chosenfield").val($(this).parent().parent().parent().attr("id"));
      sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$(this).parent().parent().parent().attr("id")}, "hedissetting/editfield", (xhr, err) => {
        if (!err) {
          let data = JSON.parse(xhr.responseText)['data'];
          $("#efieldname").val(data[0]['fieldname']);
          if(data[0]['required'] == 1)
              $("#erequireditem").prop("checked",true);
          else
              $("#erequireditem").prop("checked",false);

          $(".efieldtypeitem[value='"+data[0]['fieldtype']+"']").prop("checked",true);
          if(data[0]['fieldtype']==2){
              $(".efieldformatsection").removeClass("d-none");
              $("#edateformat").val(data[0]['fieldformat']);
          }
          else{
              $(".efieldformatsection").addClass("d-none");
          }
          $(".mapfields").empty();
          $(".mapfields").append(`
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="clinic_name">
              <span class="tag custom-control-label">Clinic Name</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="facility_id">
              <span class="tag custom-control-label">Facility ID</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="facility_npi">
              <span class="tag custom-control-label">Facility NPI</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="pos">
              <span class="tag custom-control-label">POS</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="filetype">
              <span class="tag custom-control-label">File Type</span>
            </label>
            <div class="divider"></div>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="prov_npi">
              <span class="tag custom-control-label">Prov NPI</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="pcp_speciality">
              <span class="tag custom-control-label">PCP Speciality</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="ins_pcp_id">
              <span class="tag custom-control-label">Ins PCP ID</span>
            </label>
            <div class="divider"></div>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="emr_id">
              <span class="tag custom-control-label">EMR ID</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="ptfname">
              <span class="tag custom-control-label">PT FNAME</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="ptlname">
              <span class="tag custom-control-label">PT LNAME</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="dob">
              <span class="tag custom-control-label">PT DOB</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="phone">
              <span class="tag custom-control-label">PT Phone</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="email">
              <span class="tag custom-control-label">PT Email</span>
            </label>
            <div class="divider"></div>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="mid">
              <span class="tag custom-control-label">Ins ID</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="mlob">
              <span class="tag custom-control-label">LOB</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="measure">
              <span class="tag custom-control-label">Measure</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="acronym">
              <span class="tag custom-control-label">Measure Acronym</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="dos">
              <span class="tag custom-control-label">DOS</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="value1">
              <span class="tag custom-control-label">Value1</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="value2">
              <span class="tag custom-control-label">Value2</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="cpt1">
              <span class="tag custom-control-label">CPT1</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="cpt2">
              <span class="tag custom-control-label">CPT2</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="icd1">
              <span class="tag custom-control-label">ICD1</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="icd2">
              <span class="tag custom-control-label">ICD2</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="icdv1">
              <span class="tag custom-control-label">ICD V1</span>
            </label>
            <label class="custom-control custom-radio d-inline-flex">
              <input type="radio" class="custom-control-input mapfieldvalue" name="mapfieldvalue" value="icdv2">
              <span class="tag custom-control-label">ICD V2</span>
            </label>
          `);
          $(".mapfieldvalue[value='"+data[0]['mapfield']+"']").prop("checked",true);
          $("#field_edit_modal").modal("show");
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
  });
  $(".editfieldbtn").click(function(){
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$("#chosenfield").val(),filename:$("#filenameid").val(),fieldname:$("#efieldname").val(),fieldtype:$(".efieldtypeitem:checked").val(),fieldformat:$("#edateformat").val(),required:$("#erequireditem:checked").val(),mapfield:$(".mapfieldvalue:checked").val()}, "hedissetting/updatefield", (xhr, err) => {
      if (!err) {
        let data = JSON.parse(xhr.responseText)['data'];
        $('.field_ul').empty();
        for(var i = 0; i < data.length; i++){
            $('.field_ul').append("<li class='ui-state-default "+(data[i]['required']==1?"required_item":"")+"' id = "+data[i]['id']+"><div class = 'row'><div class = 'col-auto'>"+data[i]['order']+" "+data[i]['fieldname']+"</div><div class = 'col'>"+inputType(data[i]['fieldtype'])+"<i class='fa fa-edit editfield'>&nbsp;</i><i class='fa fa-trash deletefield'></i></div></div></li>");    
        }
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  //Hedis file aliases
  

  // Datatables   
  // var filealiastable = $('#filealiastable').on('init.dt', function () {
  //     $("input[id^=a]").tagsinput();
  // }).DataTable(
  //   {
  //     "ajax": {
  //         "url": serviceUrl + "hedissetting/getfilealiases",
  //         "type": "GET",
  //     },
  //     "columns": [
  //         { "data": "fields", "width": "20%" },
  //         { "data": "variables"},

  //     ],
  //     "aoColumnDefs": [
  //         {
  //             "aTargets": [1],
  //             "mData": "headers",
  //             "mRender": function (data, type, full) {
  //                 return '<input class="form-control" type="text" data-role="tagsinput"  id="a' + full.id + '" onchange="changeAlias(' + full.id + ')" value="' + data + '">';
  //             }
  //         }
  //     ]
  //   }
  // );

  

  //ins domain
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getchoseninsurances", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#idomain_ins").empty();
      $("#eidomain_ins").empty();
      for(var i = 0; i < result.length; i++){
        $("#idomain_ins").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['insName']+`</option>
        `);
        $("#eidomain_ins").append(`
            <option value = "`+result[i]['id']+`">`+result[i]['insName']+`</option>
        `);
      }
    } else {
      return $.growl.error({
      message: "Action Failed"
      });
    }
  });
  var idomaintable = $('#idomaintable').DataTable({
    "ajax": {
        "url": serviceUrl + "hedissetting/getidomain",
        "type": "GET"
    },
    "columns": [
        { data: 'insName'},
        { data: 'domain'},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div idkey="`+row.id+`">
              <button class="btn btn-sm btn-primary editidomainbtn"><i class="fa fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger deleteidomainbtn"><i class="fa fa-trash"></i> Delete</button>
              </div>
            `
          } 
        }
    ]
  });

  // var educationtable = $('#educationtable').DataTable({
  //   "ajax": {
  //       "url": serviceUrl + "hedissetting/geteducation",
  //       "type": "GET"
  //   },
  //   "columns": [
  //       { data: 'id',
  //         render: function (data, type, row) {
  //           if(row.active == 0){
  //             return `
  //             <div idkey="`+row.id+`">
  //               <label class="custom-control custom-checkbox">
  //                 <input type="checkbox" class="custom-control-input" id="educheck`+row.id+`" onclick="changestatusedumsg(this.checked,`+row.id+`) " checked>
  //                 <span class="custom-control-label"></span>
  //               </label>
  //             </div>
  //           `
  //           }else{
  //             return `
  //             <div idkey="`+row.id+`">
  //               <label class="custom-control custom-checkbox">
  //                 <input type="checkbox" class="custom-control-input" id="educheck`+row.id+`" onclick="changestatusedumsg(this.checked,`+row.id+`)">
  //                 <span class="custom-control-label"></span>
  //               </label>
  //             </div>
  //           `
  //           }
            
  //         } 
  //       },
  //       { data: 'Measure'},
  //       { data: 'lang_name'},
  //       { data: 'subname'},
  //       { data: 'title'},
  //       { data: 'content'},
  //       { data: 'link'},
  //       { data: 'id',
  //         render: function (data, type, row) {
  //           return `
  //             <div idkey="`+row.id+`">
  //             <button class="btn btn-sm btn-primary editeducationbtn" onclick="editeducationfunc(`+row.id+`)"><i class="fa fa-edit"></i> Edit</button>
  //             <button class="btn btn-sm btn-danger deleteeducationbtn"><i class="fa fa-trash"></i> Delete</button>
  //             </div>
  //           `
  //         } 
  //       }
  //   ]
  // });

  

  $(document).on("click","#idomainaddbtn",function(){
    $("#idomain-add-modal").modal("show");
  });
  $("#idomain_addbtn").click(function (e) {
    let entry = {
      insid: document.getElementById('idomain_ins').value,
      domain: document.getElementById('idomain_domain').value,
      desc: document.getElementById('idomain_desc').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/addidomain", (xhr, err) => {
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
      idomaintable.ajax.reload();
    }, 1000 );
    
  });
  $(document).on("click",".editidomainbtn",function(){
    $("#chosen_idomain").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_idomain").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/chosenidomain", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#eidomain_ins").val(result[0]['insid']);
        $("#eidomain_domain").val(result[0]['domain']);
        $("#eidomain_desc").val(result[0]['description']);
        $("#eidomain_ins").trigger('change');;
        $("#idomain-edit-modal").modal("show");
      } else {
        return $.growl.error({
          message: "Action Failed"
        });
      }
    });
  });

  $(".gendertype").click(function(){
    
    if($(this).val() == 0){
      genderlink = ''
    }
    if($(this).val() == 1){
      genderlink = '&sex=f'

    }
    if($(this).val() == 2){
      genderlink = '&sex=m'
    }
    let tlink = educationlink.replace('gender/',genderlink)
    tlink = tlink.replace('lang/',langlink)
    tlink = tlink.replace('age/',agelink)
    // $('#education-link').html(tlink)
    $('#link-url').val(tlink)
  });
  $(".agerange").click(function(){
    if($(this).val() == 0){
      agelink = ''
      $('#link-min-age').val("0")
      $('#link-max-age').val("0")
      $("#link-min-age").attr('disabled', 'disabled');
      $("#link-max-age").attr('disabled', 'disabled');
      let tlink = educationlink.replace('gender/',genderlink)
      tlink = tlink.replace('lang/',langlink)
      tlink = tlink.replace('age/',agelink)
      // $('#education-link').html(tlink)
      $('#link-url').val(tlink)
    }
    if($(this).val() == 1){
      $("#link-min-age").removeAttr('disabled');
      $("#link-max-age").removeAttr('disabled');
      let tlink = educationlink.replace('gender/',genderlink)
      tlink = tlink.replace('lang/',langlink)
      agelink = '&min_age=1&max_age=10'
      tlink = tlink.replace('age/',agelink)
      // $('#education-link').html(tlink)
      $('#link-url').val(tlink)
    }
   
    
  });
  $("#link-min-age").change(function(){
    let maxage = $('#link-max-age').val()
    agelink = '&min_age='+$(this).val()+'&max_age='+maxage
    let tlink = educationlink.replace('gender/',genderlink)
    tlink = tlink.replace('lang/',langlink)
    tlink = tlink.replace('age/',agelink)
    // $('#education-link').html(tlink)
    $('#link-url').val(tlink)

  });
  $("#link-max-age").change(function(){
    let minage = $('#link-min-age').val()
    agelink = '&min_age='+minage+'&max_age='+$(this).val()
    let tlink = educationlink.replace('gender/',genderlink)
    tlink = tlink.replace('lang/',langlink)
    tlink = tlink.replace('age/',agelink)
    // $('#education-link').html(tlink)
    $('#link-url').val(tlink)
  });


  $("#edu-link-save").click(function (e) {
    let tmpids = $("#same-id-input").val()
    let idarr = []
    if(tmpids != ''){
      idarr = tmpids.split(",")
    }
    idarr.push($('#ms-dg-id').text())
    let entry = {
      measureid: idarr,
      langid: glang,
      langname : glangname,
      content: document.getElementById('edu_sms_desc').value,
      subname:$("#link-dg-mid").val(),
      subid:$(".addlinkbtn").val(),
      title:$("#link-dg-title").val(),
      link: $("#link-url").val(),
      category : $("#link-dg-cate").val()

    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/savesmslinklang", (xhr, err) => {
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
  
  });

  $("#link-url").change(function(){
    let linkurl = $(this).val()
    changeformitems(linkurl)
  })
  $("#link-dg-sublist").change(function(){
    let selectedid = $(this).val()
    for(let i=0 ; i < globalsmsarr.length ; i++){
      if(globalsmsarr[i].id == selectedid){
        $("#edu_sms_desc").val(globalsmsarr[i].content);
        $("#link-url").val(globalsmsarr[i].link);
        $("#link-dg-title").val(globalsmsarr[i].title)
        $("#link-dg-mid").val(globalsmsarr[i].subname)
        $(".addlinkbtn").val(selectedid)

        changeformitems(globalsmsarr[i].link)
        break
      }
    }
   
  })
  $("#link-dg-lang").change(function(){
    
    glang = $("#link-dg-lang option:selected").val()
    glangname = $("#link-dg-lang option:selected").text()
    langlink = 'lang='+glang
    let entry = {
      measureid :$('#ms-dg-id').text(),
      langid:$("#link-dg-lang option:selected").val()
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/getsmslinklang", (xhr, err) => {
        if (!err) {
          globalsmsarr = JSON.parse(xhr.responseText)['data'];
          $("#link-dg-sublist").empty();
          if(globalsmsarr.length > 0 ){
            
            for(var i = 0;i < globalsmsarr.length;i++){
              $("#link-dg-sublist").append(`<option value="`+globalsmsarr[i]['id']+`">`+globalsmsarr[i]['subname']+`</option>`)
              if(i==0){
                $("#edu_sms_desc").val(globalsmsarr[i].content);
                $("#link-url").val(globalsmsarr[i].link);
                $("#link-dg-title").val(globalsmsarr[i].title)
                $("#link-dg-mid").val(globalsmsarr[i].subname)
                $(".addlinkbtn").val(globalsmsarr[i].id)
                changeformitems(globalsmsarr[i].link)
              }
            }
          }else{
            
            
              $("#edu_sms_desc").val("");
              $("#link-url").val("");
              $("#link-dg-title").val("")
              $("#link-dg-mid").val("")
              $(".addlinkbtn").val(0)
          }
        
         
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
    });
  });

  
  $(".addlinkbtn").click(function (e) {
    let linkcount = $(this).val(0) 
    $("#edu_sms_desc").val("");
    $("#link-url").val("");
    $("#link-dg-title").val("")
    $("#link-dg-mid").val("")
    
  })

  $(".addsamelinkbtn").click(function (e) {
    let linkcount = $(this).val(0) 
    $("#same-id-input").val("");
    $("#sameiddiv").toggle()
  })
  

  $("#idomain_editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_idomain').value,
      insid: document.getElementById('eidomain_ins').value,
      domain: document.getElementById('eidomain_domain').value,
      desc: document.getElementById('eidomain_desc').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/updateidomain", (xhr, err) => {
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
      idomaintable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click",".deleteidomainbtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deleteidomain", (xhr, err) => {
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
  });

  $(document).on("click",".deleteeducationbtn",function(){
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    console.log(entry.id)
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
				sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedissetting/deleteducation", (xhr, err) => {
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
  });

  
});
