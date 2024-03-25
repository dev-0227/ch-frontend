$(document).ready(function () {
  "use strict";
  var clinictable = $('#clinictable').DataTable({
    "ajax": {
        "url": serviceUrl + "clinic/",
        "type": "GET"
    },
    "columns": [
        { data: "name"},
        { data: "address1",
          render: function (data, type, row) {
            return (row.address1==null?"":row.address1)+" "+(row.address2==null?"":row.address2);
          } 
        },
        { data: 'phone'},
        { data: 'id',
          render: function (data, type, row) {
            return `
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input apcheck" name="apcheck" value="`+row.id+`" `+(row.apcheck==1?"checked":"")+`>
                <span class="tag custom-control-label"></span>
              </label>
            `
          } 
        },
        { data: 'status',
          render: function (data, type, row) {
            if(row.status == 1)
              return "<span class='tag tag-green'>Active</span>";
            else
              return "<span class='tag tag-red'>Inactive</span>";
          } 
        },
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
                <button class="btn btn-sm btn-info badge clinicmanagerbtn" type="button"><i class="fa fa-user"></i></button><button class="btn btn-sm btn-primary badge cliniceditbtn" type="button"><i class="fa fa-edit"></i></button><button class="btn btn-sm btn-danger badge clinicdeletebtn" type="button"><i class="fa fa-trash"></i></button>
              </div>
            `
          } 
        }
    ]
  });

  $('#table_search_input').on('keyup', function () {
    clinictable.search(this.value).draw();
  });

  var clinic_logo = new Dropzone("#clinic_logo", {
    url: "https://ch.precisionq.com/scripts/void.php", // Set the url for your upload script location
    paramName: "svg", // The name that will be used to transfer the file
    maxFiles: 1,
    maxFilesize: 10, // MB
    addRemoveLinks: true,
    maxfilesexceeded: function(file) {
      this.removeAllFiles();
      this.addFile(file);
    },
    accept: function(file, done) {
        if (file.name == "wow.jpg") {
            done("Naha, you don't.");
            
        } else {
          $(".dz-image").addClass("d-flex");
          $(".dz-image").addClass("justify-content-center");
          $(".dz-image").addClass("align-items-center");
          $(".dz-error-message").addClass("d-none");
          $(".dz-progress").addClass("d-none");
          $(".dz-success-mark").addClass("d-none");
          //$(".dz-details").addClass("d-none");
          $(".dz-error-mark").addClass("d-none");
          done();
        }
    }
 });

 clinic_logo.on("addedfile", function(file, xhr) {
    var fr;
    fr = new FileReader;
    fr.onload = function() {
      var img;
      img = new Image;
      img.onload = function() {
        var min_width = 300;
        if(parseInt(img.width)>min_width){
          var rate = parseInt(img.width)/parseInt(img.height);
          $(".dz-image img").css("height", min_width/rate+'px');
          
        }
        
        
        
      };
      return img.src = fr.result;
    };
    return fr.readAsDataURL(file);
  });


  $(document).on("click",".cliniceditbtn",function(){
    $("#chosen_clinic").val($(this).parent().attr("idkey"));
    let entry = {
      id: $("#chosen_clinic").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#eclinic_name").val(result[0]['name']);
        $("#eclinic_acronym").val(result[0]['acronym']);
        $("#eclinic_address1").val(result[0]['address1']);
        $("#eclinic_address2").val(result[0]['address2']);
        $("#eclinic_city").val(result[0]['city']);
        $("#eclinic_state").val(result[0]['state']);
        $("#eclinic_zip").val(result[0]['zip']);
        $("#eclinic_country").val(result[0]['country']);
        $("#eclinic_tel").val(result[0]['phone']);
        $("#eclinic_fax").val(result[0]['cel']);
        $("#eclinic_email").val(result[0]['email']);
        $("#eclinic_web").val(result[0]['web']);
        $("#eclinic_portal").val(result[0]['portal']);
        $("#eclinic_pos").val(result[0]['placeservice']);
        $("#eclinic_status").val(result[0]['status']);
        $("#eclinic_c_name").val(result[0]['contact_name']);
        $("#eclinic_c_email").val(result[0]['contact_email']);
        $("#eclinic_c_tel").val(result[0]['contact_tel']);
        $("#eclinic_c_cel").val(result[0]['contact_cel']);
        $("#eclinic_c_ex").val(result[0]['ex']);
        $("#eclinic_c_web").val(result[0]['contact_web']);
        if(result[0]['checkweb'] == 1)
          $("#webcheck").prop("checked",true);
        else
          $("#webcheck").prop("checked",false);
        if(result[0]['checkportal'] == 1)
          $("#portalcheck").prop("checked",true);
        else
          $("#portalcheck").prop("checked",false);
        if(result[0]['checkcontact'] == 1)
          $("#contactcheck").prop("checked",true);
        else
          $("#contactcheck").prop("checked",false);
        $("#contact_area").removeClass("d-none");
        $("#logo_area").removeClass("d-none");
        $('#clinic_logo')[0].dropzone.removeAllFiles();  
        if(result[0]['logo']){
          $("#logo_dropzone").addClass("d-none");
          $("#logo_image").removeClass("d-none");
          $("#logo_image_src").attr("src", "/uploads/logos/"+result[0]['logo'])
          
        }else{
          $("#logo_dropzone").removeClass("d-none");
          $("#logo_image").addClass("d-none");
        }
        
        $("#clinic-edit-modal").modal("show");
      } else {
        return toastr.error('Action Failed');
      }
    });
  });
  
  $(document).on("click",".clinicdeletebtn",function(){
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
    }).then(function (result) {
      if (result.value) {
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              clinictable.ajax.reload();
            }, 1000 );
          } else {
            return toastr.error('Action Failed');
          }
        });
      }
    });

    
  });
  $(document).on("click",".clinicaddbtn",function(){
      $("#chosen_clinic").val("");
      $("#eclinic_name").val("");
      $("#eclinic_acronym").val("");
      $("#eclinic_address1").val("");
      $("#eclinic_address2").val("");
      $("#eclinic_city").val("");
      $("#eclinic_state").val("");
      $("#eclinic_zip").val("");
      $("#eclinic_country").val("");
      $("#eclinic_tel").val("");
      $("#eclinic_fax").val("");
      $("#eclinic_email").val("");
      $("#eclinic_web").val("");
      $("#eclinic_portal").val("");
      $("#eclinic_pos").val("");
      $("#eclinic_status").val("");
      $("#eclinic_c_name").val("");
      $("#eclinic_c_email").val("");
      $("#eclinic_c_tel").val("");
      $("#eclinic_c_cel").val("");
      $("#eclinic_c_ex").val("");
      $("#eclinic_c_web").val("");
      $("#portalcheck").prop("checked", false);
      $("#contactcheck").prop("checked", false);
      $("#contact_area").addClass("d-none");
      $("#logo_area").addClass("d-none");
      $("#clinic-edit-modal").modal("show");
  });
  
  $("#clinic-editbtn").click(function (e) {
    let entry = {
      id: document.getElementById('chosen_clinic').value,
      name: document.getElementById('eclinic_name').value,
      acronym: document.getElementById('eclinic_acronym').value,
      address1: document.getElementById('eclinic_address1').value,
      address2: document.getElementById('eclinic_address2').value,
      city: document.getElementById('eclinic_city').value,
      state: document.getElementById('eclinic_state').value,
      zip: document.getElementById('eclinic_zip').value,
      country: document.getElementById('eclinic_country').value,
      tel: document.getElementById('eclinic_tel').value,
      fax: document.getElementById('eclinic_fax').value,
      email: document.getElementById('eclinic_email').value,
      web: document.getElementById('eclinic_web').value,
      portal: document.getElementById('eclinic_portal').value,
      pos: document.getElementById('eclinic_pos').value,
      status: document.getElementById('eclinic_status').value,
      cname: document.getElementById('eclinic_c_name').value,
      cemail: document.getElementById('eclinic_c_email').value,
      ctel: document.getElementById('eclinic_c_tel').value,
      ccel: document.getElementById('eclinic_c_cel').value,
      cex: document.getElementById('eclinic_c_ex').value,
      cweb: document.getElementById('eclinic_c_web').value,
      
    }

    if($("chosen_clinic").val==""){
      
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/add", (xhr, err) => {
            if (!err) {
              return toastr.success('Action Successfully');
            } else {
              return toastr.error('Action Failed');
            }
        });
    }else{
      var formData = new FormData();
      var clinic_logo_file = $('#clinic_logo')[0].dropzone.getAcceptedFiles();
      if (clinic_logo_file.length > 0) {
        formData.append("logo", clinic_logo_file[0]);
        formData.append("id", document.getElementById('chosen_clinic').value);
        formData.append("filename", $(".dz-filename span").html());
        sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "clinic/uploadlogo", (xhr, err) => {
          var filename = JSON.parse(xhr.responseText)['data'];
          if (!err && filename) {
            var f = filename.split("\\");
            entry.logo = f[f.length-1];
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/update", (xhr, err) => {
              if (!err) {
                $("#clinic-edit-modal").modal("show");
                return toastr.success('Clinic is updated successfully');
                
              } else {
                return toastr.error('Action Failed');
              }
            });
          }
        });
      }
    }
    
    setTimeout( function () {
      clinictable.ajax.reload();
    }, 1000 );
  });
  $(document).on("click","#webcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$("#chosen_clinic").val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updatewebcheck", (xhr, err) => {
      if (!err) {
        return toastr.success('Action successfully');
      } else {
        return toastr.error('Action Failed');
      }
    });
  });

  $(document).on("click","#portalcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$("#chosen_clinic").val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updateportalcheck", (xhr, err) => {
      if (!err) {
        return toastr.success('Action successfully');
      } else {
        return toastr.error('Action Failed');
      }
    });
  });
  $(document).on("click","#contactcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$("#chosen_clinic").val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updatecontactcheck", (xhr, err) => {
      if (!err) {
        return toastr.success('Action successfully');
      } else {
        return toastr.error('Action Failed');
      }
    });
  });
  $(document).on("click",".apcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updateapcheck", (xhr, err) => {
      if (!err) {
        return toastr.success('Action successfully');
      } else {
        return toastr.error('Action Failed');
      }
    });
  });
  $(document).on("click",".clinicmanagerbtn",function(){
    $("#chosen_clinic").val($(this).parent().attr("idkey"));
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:document.getElementById('chosen_clinic').value}, "clinic/getclinicmanagers", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['managers'];
        $("#clinicmanagers").empty();
        for(var i = 0;i < result.length;i++){
          $("#clinicmanagers").append(`
              <option value = "`+result[i]['id']+`">${result[i]['fname']+" "+result[i]['lname']}</option>
          `);
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:document.getElementById('chosen_clinic').value}, "clinic/chosenclinicmanagers", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            if(result.length > 0)
              $("#clinicmanagers").val(result[0]['manager']).trigger('change');
            $("#clinic-manager-modal").modal("show");
          } else {
            return toastr.error('Action Failed');
          }
        });
      } else {
        return toastr.error('Action Failed');
      }
    });
  });
  $(document).on("click","#clinic-managerbtn",function(){
    let entry={
      manager:$("#clinicmanagers").val(),
      clinicid:document.getElementById('chosen_clinic').value
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/addclinicmanagers", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['message'];
        if(result == "OK")
          return toastr.error('Action Successfully');
        else
          return toastr.error('Action Failed');
      } else {
        return toastr.error('Action Failed');
      }
    });
  });
});
