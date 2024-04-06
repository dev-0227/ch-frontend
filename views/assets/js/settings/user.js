// const { jsPDF } = require("jspdf");
// import { jsPDF } from "jspdf";

$(document).ready(function () {
  "use strict";
  $("body").tooltip({ selector: '[data-toggle=tooltip]' });


  var usertable = $('#usertable').DataTable({
    "ajax": {
        "url": serviceUrl + "user/",
        "type": "GET",
        "headers": { 'Authorization': localStorage.getItem('authToken') }
    },
    "columns": [
        { data: "fname",
          render: function (data, type, row) {
            return row.fname+" "+row.lname;
          } 
        },
        { data: 'email' },
        { data: 'phone' },
        { data: 'type',
          render: function (data, type, row) {
            var color = "secondary";
            switch(row.type){
              case 0: color = "danger"; break;
              case 1: color = "dark"; break;
              case 2: color = "primary"; break;
              case 3: color = "success"; break;
              case 4: color = "info"; break;
              case 5: color = "warning"; break;
            }
            return '<div class="badge badge-'+color+' fw-bold badge-lg">'+row.role_name+'</span>';
          }  
        },
        { data: 'status',
          render: function (data, type, row) {
            if(row.status == 1)
              return '<div class="badge badge-success fw-bold badge-lg">Active</span>';
            else
              return '<div class="badge badge-danger fw-bold badge-lg">Inactive</span>';
          } 
        },
        
        { data: 'id',
          render: function (data, type, row) {
            return `
              <div class="btn-group align-top" idkey="`+row.id+`">
              <button class="btn btn-sm btn-info clinicbtn"  type="button" clinickey="`+row.clinic+`" data-toggle="tooltip" title="clinic" ><i class="fa-solid fa-house-medical-circle-check"></i></button>
              <button class="btn btn-sm btn-success permissionbtn" data-role="`+row.type+`" data-more="`+row.permissions+`"  type="button" data-toggle="tooltip" title="permission"><i class="fa fa-tasks"></i></button>
              <button class="btn btn-sm btn-primary usereditbtn" data-target="#user-form-modal" data-toggle="tooltip" type="button" title="edit"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-info userpwdbtn" type="button" data-toggle="tooltip" title="password"><i class="fa fa-key"></i></button>
              <button class="btn btn-sm btn-warning userquestionbtn" type="button" data-toggle="tooltip" title="question"><i class="fa fa-question-circle"></i></button>
              <button class="btn btn-sm btn-danger userdeletebtn" type="button"data-toggle="tooltip" title="delete"><i class="fa fa-trash"></i></button>
              </div>
            `;
          } 
        }
    ]
  });


  $('#table_search_input').on('keyup', function () {
    usertable.search(this.value).draw();
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "role", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var data = "";
      for(var i = 0; i < result.length; i++){
        data += '<option value="'+result[i].id+'">'+result[i].name+'</option>';
      }
      $(".role_list").html(data);
    }
  });

  var clinics = [];

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "clinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var index = 0;
      var data = "";
      for(var i = 0; i < result.length; i++){
        if(i==0)index = result[i].id;
        data += '<option value="'+result[i].id+'">'+result[i].name+'</option>';
        clinics[result[i].id] = result[i];
      }
    }
  });

  sendRequestWithToken('GET', localStorage.getItem('authToken'), [], "setting/clinic/getAll", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      for(var i = 0; i < result.length; i++){
        $("#clinic-list").append(`
          <a href="#" class="btn btn-secondary m-1 clinic_toggle " style="border: 2px solid #cccccc;" >
              <input type="checkbox" value="`+result[i].id+`" value="`+result[i]['name']+`" class="clinickey" style="display: none;" >
              <span class="selectgroup-button">`+result[i].name+`</span>
          </a>
        `);
      }
    }
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
      var html = '<div class="accordion accordion-icon-toggle" id="kt_accordion_1">';
      var i = 0;
      for (const key in permissions) {
        html += '<div class="mb-5 " style="border: solid 1px #eeeeee;" >';
        html += '<div class="accordion-header py-3 d-flex fw-semibold collapsed" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_item_'+i+'">';
        html += '<span class="accordion-icon"><i class="ki-duotone ki-arrow-right fs-4"><span class="path1"></span><span class="path2"></span></i></span>';
        html += '<h3 class="fs-4 fw-semibold mb-0 ms-4">';
        html += key;
        html += '</h3></div>';
        html += '<div id="kt_accordion_1_item_'+i+'" class="fs-6 collapse ps-10" data-bs-parent="#kt_accordion_1">';
        
        for(var j=0; j<permissions[key].length; j++){
          var row = permissions[key][j];
          html += '<div class="table-responsive">';
          html += '<table  class="table table-striped table-row-bordered gy-5 gs-7">';
          html += '<tbody><tr class="d-flex align-items-center">';
          html += '<td  width="40%">'+row['name']+':</td>';
          html += '<td width="20%" class="d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_1" data-id="'+row['id']+'" data-type="1"></div><div class="px-3">Read</div>';
          html += '</td>';
          html += '<td width="20%" class="d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_2" data-id="'+row['id']+'" data-type="2"></div><div class="px-3">Write</div>';
          html += '</td>';
          html += '<td  width="20%"class="d-flex align-items-center">';
          html += '<div><input type="checkbox" class="form-check-input ch_permission" id="ch_'+row['id']+'_3" data-id="'+row['id']+'" data-type="3"></div><div class="px-3">Create</div>';
          html += '</td></tr></tbody></table></div>';
          
        }
        html += '</div></div>';
        i++;
      }
      html += '</div>';
      $("#accordion").html(html);
    }
  });

  $(document).on("click","#add_btn",function(){
    $("#chosen_user").val('');
    $("#efname").val('');
    $("#elname").val('');
    $("#eemail").val('');
    $("#ephone").val('');
    $("#eaddr").val('');
    $("#emrid").val('');
    $("#ecity").val('');
    $("#estate").val('');
    $("#ezip").val('');
    $("#etype").val('');
    $("#estatus").val('');
    $(".rccs__name").html('');
    $("#rccs_phone_number").html('');
    $(".rccs__number").addClass('d-none');
    $("#rccs__email").html('');
    $("#eclinic").html('');
    vcard_clinic_fill(-1);
    makeQRCode();
    $("#edit_user_modal").modal("show");
  });

  
  $(document).on("click",".usereditbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#efname").val(result[0]['fname']);
        $("#elname").val(result[0]['lname']);
        $("#eemail").val(result[0]['email']);
        $("#ephone").val(result[0]['phone']);
        $("#eext").val(result[0]['ext']);
        $("#eaddr").val(result[0]['address']);
        $("#emrid").val(result[0]['emrid']);
        $("#qr_phone").prop('checked', result[0]['qr_phone']=="1"?true:false);
        $("#ecity").val(result[0]['city']);
        $("#estate").val(result[0]['state']);
        $("#ezip").val(result[0]['zip']);
        $("#etype").val(result[0]['type']);
        var data = "";
        var index = "";
        if(result[0]['clinic']){
          var user_clinics = result[0]['clinic'].split(",");
          for(var i = 0; i < user_clinics.length; i++){
            if(i==0)index = clinics[user_clinics[i]].id;
            if(clinics[user_clinics[i]])
              data += '<option value="'+clinics[user_clinics[i]].id+'">'+clinics[user_clinics[i]].name+'</option>';
          }
        }
        $(".clinic_list").html(data);
        if(result[0]['clinic1']){
          $("#eclinic").val(result[0]['clinic1']);
          index = result[0]['clinic1'];
        }
        $("#estatus").val(result[0]['status']);
        $(".rccs__name").html($("#efname").val() +" "+$("#elname").val());
        var personal_phone_number = $("#ephone").val();
        if($("#eext").val().trim() != "")personal_phone_number += " ("+$("#eext").val()+")"
        if(personal_phone_number==""){
          $(".rccs__number").addClass('d-none');
        }else{
          $(".rccs__number").removeClass('d-none');
          $("#rccs_phone_number").html(personal_phone_number);
        }
        
        
        $("#rccs__email").html($("#eemail").val());
        vcard_clinic_fill(index);
        makeQRCode();
        var website = result[0]['web'];
        var conector = window.location.origin+"/connection?t="+btoa(unescape(encodeURIComponent(localStorage.getItem('chosen_clinic'))))+"&n="+btoa(unescape(encodeURIComponent(result[0]['name'])));
        if(website == "" || website == null){
          clinic_qrcode.makeCode(conector);
          clinic_back_qrcode.makeCode(conector);
        }else{
          clinic_qrcode.makeCode(website);
          clinic_back_qrcode.makeCode(website);
        }

        $("#edit_user_modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $(document).on("click",".rccs__card",function(){
    if($(this).data('type')=="0"){
      $(this).data('type', "1");
      $(".rccs__card").addClass('rccs__card--flipped');
    }else{
      $(this).data('type', "0");
      $(".rccs__card").removeClass('rccs__card--flipped');
    }
    
  });

  $(document).on("click",".card-back",function(){
    $(".rccs__card").data('type', "1");
    $(".rccs__card").addClass('rccs__card--flipped');
  });

  $(document).on("click",".card-front",function(){
    $(".rccs__card").data('type', "0");
    $(".rccs__card").removeClass('rccs__card--flipped');
  });

  var qrcode = new QRCode(document.getElementById("qrcode"), {
    width : 256,
    height : 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L
  });

  var clinic_qrcode = new QRCode(document.getElementById("clinic_web_qr"), {
    width : 256,
    height : 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L
  });

  var clinic_back_qrcode = new QRCode(document.getElementById("clinic_web_qr_back"), {
    width : 256,
    height : 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L
  });


  function makeQRCode () {
    var value = "";
    value += "BEGIN:VCARD";
    value += "\n";
    // value += "VERSION:3.0";
    // value += "\n";
    var value1= value;
    value += "N:"+$(".rccs__name").html()+" - "+$(".rccs_clinic_name").html();
    value += "\n";
    // value += "ORG:"+$(".rccs_clinic_name").html();
    // value += "\n";
    
    if($(".rccs_clinic_address").html().trim()!=""){
      value += "ADR:;;"+$(".rccs_clinic_address").html();
      value += "\n";
    }
    
    if($(".rccs_clinic_phone").html().trim()!=""){
      value += "TEL;WORK:"+$(".rccs_clinic_phone").html().replaceAll("-", "").replaceAll(" ", "");
      value += "\n";
    }
    
    if($("#rccs__email").html().trim()!=""){
      value += "EMAIL:"+$("#rccs__email").html();
      value += "\n";
    }
    
    if($("#qr_phone").prop("checked")){
      if($("#rccs_phone_number").html().trim()!=""){
        value += "TEL;CELL:"+$("#rccs_phone_number").html().replaceAll("-", "").replaceAll(" ", "");
        value += "\n";
      }
    }
    if($(".rccs_clinic_url").html().trim()!=""){
      value += "URL:"+$(".rccs_clinic_url").html();
      value += "\n";
    }
    value += "END:VCARD";
    qrcode.clear();
    try{
      qrcode.makeCode(value);
    }catch{
      value = value1
      value += "END:VCARD";
      qrcode.makeCode(value);
    }
    
  }

  $(document).on("keyup",".card-name",function(e){
    $(".rccs__name").html($("#efname").val() +" "+$("#elname").val());
    makeQRCode();
  });

  $(document).on("keyup",".card-phone",function(e){
    var personal_phone_number = $("#ephone").val();
    if($("#eext").val().trim() !="")personal_phone_number += " ("+$("#eext").val()+")"
    if(personal_phone_number==""){
      $(".rccs__number").addClass('d-none');
    }else{
      $(".rccs__number").removeClass('d-none');
      $("#rccs_phone_number").html(personal_phone_number);
    }
    makeQRCode();
  });
  
  $(document).on("keyup",".card-email",function(e){
    $("#rccs__email").html($(this).val());
    makeQRCode();
  });

  $(document).on("change","#qr_phone",function(e){
    makeQRCode();
  });

  function vcard_clinic_fill(index){
    if(clinics[index]){
      var clinic_logo = ""
     
      var logo_info = clinics[index]['logo'].split(",");
      var logo_size = logo_info[3]?logo_info[3]:"20";
      if(logo_info[0]!=""){         
        clinic_logo = '<img height="'+logo_size+'" src="/uploads/logos/'+logo_info[0]+'" />';
      }else{
        clinic_logo = '<div class="fw-bold logo-text">'+clinics[index]['name']+'</div>';
      }
      var logo_x = logo_info[4]?logo_info[4]:"5";
      var logo_y = (logo_info[5] && logo_info[5]!="")?logo_info[5]:"35";
      var qr_size = logo_info[6]?logo_info[6]:"0";
      var qr_x = logo_info[7]?logo_info[7]:"0";
      var qr_y = logo_info[8]?logo_info[8]:"0";
      
      var bg_color = clinics[index]['color']?clinics[index]['color']:"#eeeeee";
      var bg_pattern = clinics[index]['pattern']?clinics[index]['pattern']:"";

      var fonts = clinics[index]['fonts'].split(",");
      if(fonts[0]){
        if(fonts[0]=="0"){
          $(".rccs_clinic_web_qr").addClass("d-none");
        }else{
          $(".rccs_clinic_web_qr").removeClass("d-none");
        }
      }
      $(".rccs_clinic_web_qr img").css("width", "60px");
      $(".rccs_clinic_web_qr img").css("height", "60px");
      $('.logo-text').css("font-family", 'auto');
      $('.rccs_clinic_name').css("font-family", 'auto');
      $('.rccs__expiry_sub_item').css("font-family", 'auto');
      if(fonts[1])$('.logo-text').css("font-family", fonts[1]);
      if(fonts[2])$('.rccs_clinic_name').css("font-family", fonts[2]);
      if(fonts[3])$('.rccs__expiry_sub_item').css("font-family", fonts[3]);

      $(".rccs__issuer").html(clinic_logo);
      var layout = clinics[index]['layout'].toString();
      set_layout(layout);

      if(logo_info[0]!=""){
        $(".rccs__issuer img").attr("height", logo_size);
      }else{
        $(".logo-text").css("font-size", logo_size+'px');
      }
      $(".rccs__issuer").css("left", logo_x+'%');
      $(".rccs__issuer").css("top", logo_y+'%');

      if(parseInt(qr_size)>0){
        $("#qrcode img").css("width", qr_size+'px');
        $("#qrcode img").css("height", qr_size+'px');
        $("#qrcode").css("padding", (parseInt(qr_size)/10)+"px");
        $("#qrcode").css("left", qr_x+'%');
        $("#qrcode").css("top", qr_y+'%');
      }
      
      
      $(".rccs_clinic_name").html(clinics[index]['name']);
      $(".rccs_clinic_address").html(clinics[index]['address1']);
      if(clinics[index]['email'].trim()==""){
        $(".rccs_clinic_email").parent().addClass("d-none");
        $(".rccs_clinic_email").html("");
      }else{
        $(".rccs_clinic_email").parent().removeClass("d-none");
        $(".rccs_clinic_email").html(clinics[index]['email']);
      }

      if(clinics[index]['cel'].replace(/\s/g, '')==""){
        $(".rccs_clinic_fax").parent().addClass("d-none");
        $(".rccs_clinic_fax").html("");
      }else{
        $(".rccs_clinic_fax").parent().removeClass("d-none");
        $(".rccs_clinic_fax").html(clinics[index]['cel']);
      }

      if(clinics[index]['web'].replace(/\s/g, '')==""){
        $(".rccs_clinic_url").parent().addClass("d-none");
        $(".rccs_clinic_url").html("");
      }else{
        $(".rccs_clinic_url").parent().removeClass("d-none");
        $(".rccs_clinic_url").html(clinics[index]['web']);
      }

      if(clinics[index]['phone'].replace(/\s/g, '')==""){
        $(".rccs_clinic_phone").parent().addClass("d-none");
        $(".rccs_clinic_phone").html("");
      }else{
        $(".rccs_clinic_phone").parent().removeClass("d-none");
        $(".rccs_clinic_phone").html(clinics[index]['phone']);
      }
      set_background(bg_color, bg_pattern);
      
    }else{
      $(".rccs__issuer").html('');
      $(".rccs_clinic_name").html("");
      $(".rccs_clinic_address").html("");
      $(".rccs_clinic_url").html("");
      $(".rccs_clinic_phone").html("");
      $(".rccs__expiry__valid").addClass("d-none");
      $(".rccs__expiry__value").addClass("d-none");
      set_background("#eeeeee", "");
      set_layout("0");
    }
  }

  function hexToRgb(hex) {
    const normal = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (normal) return normal.slice(1).map(e => parseInt(e, 16));
    const shorthand = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (shorthand) return shorthand.slice(1).map(e => 0x11 * parseInt(e, 16));
    return null;
  }

  function alterColor(rgb, type, percent) {
    var red = $.trim(rgb[0]);
    var green = $.trim(rgb[1]);
    var blue = $.trim(rgb[2]);
    if (red == 0 && green == 0 && blue == 0) {
      red = 100;
      green = 100;
      blue = 100;
    }
    if (type === "darken") {
      red = parseInt(red * (100 - percent) / 100, 10);
      green = parseInt(green * (100 - percent) / 100, 10);
      blue = parseInt(blue * (100 - percent) / 100, 10);
    } else {
      red = parseInt(red * (100 + percent) / 100, 10);
      green = parseInt(green * (100 + percent) / 100, 10);
      blue = parseInt(blue * (100 + percent) / 100, 10);
    }
    rgb = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    return rgb;
  }

  function ContrastColor(rgb)
  {
      var d = 0;
      var luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])/255;
      if (luminance > 0.5)
         d = "#000000"; // bright colors - black font
      else
         d = "#FFFFFF"; // dark colors - white font
      return  d;
  }

  function set_background(color, pattern){
    if(color=="")return;
    var rgb = hexToRgb(color);
    var darkerColor = alterColor(rgb, 'darken', 30);
    var lighterColor = alterColor(rgb, 'lighten', 50);
    var fontColor = ContrastColor(rgb);
    
    if(pattern==""){
      $(".rccs__card__background").attr("style", '');
      $(".rccs__card__background").css("background-image", "linear-gradient(25deg, "+color+", "+lighterColor+")");
      $(".rccs__card__background").css("background-color", color);
    }else{
      var pattern = pattern.replaceAll("#ffffff", color);
      pattern = pattern.replaceAll("#cccccc", darkerColor);
      fontColor = "#FFFFFF";
      $(".rccs__card__background").attr("style", '');
      $(".rccs__card__background").attr("style", pattern);
      $(".rccs__card__background").css("background-color", color);
    }
    
    $(".rccs__name").css("color", fontColor);
    $(".rccs_front_expiry_sub_item").css("color", fontColor);
    $(".rccs_clinic_name").css("color", fontColor);
    $(".rccs__expiry_sub_item").css("color", fontColor);
    $(".logo-text").css("color", fontColor);
  }

  function set_layout(layout){
    switch(layout){
      case "0":
        $(".rccs__name").css("top", "10%");
        $(".rccs__name").css("left", "10%");
        $(".rccs__name").css("width", "80%");
        $(".rccs__name").css("text-align", "left");
        $(".rccs__issuer").css("left", "45%");
        $(".rccs__issuer").css("top", "35%");
        $(".rccs__issuer").css("width", "50%");
        $(".logo-text").css("text-align", "left");
        $(".rccs__qr_code").css("left", "6%");
        $(".rccs__qr_code").css("top", "25%");
        $(".rccs_front_expiry_sub_item").css("text-align", "right");
        $(".rccs_front_expiry").css("left", "10%");
        $(".rccs_front_expiry").css("width", "80%");
        break;
      case "1":
        $(".rccs__name").css("top", "10%");
        $(".rccs__name").css("left", "10%");
        $(".rccs__name").css("width", "80%");
        $(".rccs__name").css("text-align", "left");
        $(".rccs__issuer").css("left", "7%");
        $(".rccs__issuer").css("top", "35%");
        $(".rccs__issuer").css("width", "50%");
        $(".logo-text").css("text-align", "right");
        $(".rccs__qr_code").css("left", "60%");
        $(".rccs__qr_code").css("top", "25%");
        $(".rccs_front_expiry_sub_item").css("text-align", "left");
        $(".rccs_front_expiry").css("left", "10%");
        $(".rccs_front_expiry").css("width", "80%");
        break;
      case "2":
        $(".rccs__name").css("top", "35%");
        $(".rccs__name").css("left", "45%");
        $(".rccs__name").css("width", "50%");
        $(".rccs__name").css("text-align", "right");
        $(".rccs__issuer").css("left", "10%");
        $(".rccs__issuer").css("top", "15%");
        $(".rccs__issuer").css("width", "80%");
        $(".logo-text").css("text-align", "left");
        $(".rccs__qr_code").css("left", "10%");
        $(".rccs__qr_code").css("top", "35%");
        $(".rccs_front_expiry_sub_item").css("text-align", "left");
        $(".rccs_front_expiry").css("left", "45%");
        $(".rccs_front_expiry").css("width", "50%");
        break;
      case "3":
        $(".rccs__name").css("top", "35%");
        $(".rccs__name").css("left", "7%");
        $(".rccs__name").css("width", "50%");
        $(".rccs__name").css("text-align", "left");
        $(".rccs__issuer").css("left", "10%");
        $(".rccs__issuer").css("top", "15%");
        $(".rccs__issuer").css("width", "80%");
        $(".logo-text").css("text-align", "right");
        $(".rccs__qr_code").css("left", "60%");
        $(".rccs__qr_code").css("top", "35%");
        $(".rccs_front_expiry_sub_item").css("text-align", "left");
        $(".rccs_front_expiry").css("left", "10%");
        $(".rccs_front_expiry").css("width", "50%");
        break;
    }
    $(".rccs__qr_code img").css("width", "80px");
    $(".rccs__qr_code img").css("height", "80px");
    $(".rccs__qr_code").css("padding", "8px");

  }

  $(document).on("click",".clinic_list",function(){
    vcard_clinic_fill($(this).val());
    makeQRCode();
  });

  $(document).on("click","#vcard_pdf",async function(e){
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.canvas.height = 72 * 6;
    pdf.canvas.width = 72 * 4;

    $(".rccs__card").removeClass('rccs__card--flipped')
    const front=document.querySelector(".rccs__card--front")
    await html2canvas(front,{allowTaint:true, scale:4}).then(canvas => {
      var img = canvas.toDataURL("image/png");
      pdf.addImage(img, 'SVG', 20, 40, 290, 182);
    });

    const back=document.querySelector(".rccs_card_back")
    await html2canvas(back,{allowTaint:true, scale:4}).then(canvas => {
      var img = canvas.toDataURL("image/png");
      pdf.addImage(img, 'PNG', 20, 240, 290, 182);
    });

    pdf.save($('.rccs__name').html()+' VCard.pdf');
  });

  $(document).on("click","#qr_pdf",async function(e){
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.canvas.height = 72 * 6;
    pdf.canvas.width = 72 * 4;

    $(".rccs__card").removeClass('rccs__card--flipped');
    var img = new Image();
    img.src = $(".rccs__qr_code img").attr("src");
    pdf.addImage(img, 'JPEG', 20, 20, 256, 256);


    const front=document.querySelector(".rccs__qr_code")
    await html2canvas(front,{allowTaint:true}).then(canvas => {
      var img = canvas.toDataURL("image/png");
      pdf.addImage(img, 'SVG', 20, 20, 256, 256);
    });
    pdf.save($('.rccs__name').html()+' QR.pdf');

  });

  $("#edit_btn").click(function (e) {
    if($("#efname").val() == ""){
      toastr.info('Please enter First name');
      $("#efname").focus();
      return;
    }
    if($("#elname").val() == ""){
      toastr.info('Please enter Last name');
      $("#elname").focus();
      return;
    }
    if($("#eemail").val() == ""){
      toastr.info('Please enter Email');
      $("#eemail").focus();
      return;
    }
    if($("#ephone").val() == ""){
      toastr.info('Please enter Phone number');
      $("#ephone").focus();
      return;
    }
    if($("#eaddr").val() == ""){
      toastr.info('Please enter Address');
      $("#eaddr").focus();
      return;
    }
    if($("#ecity").val() == ""){
      toastr.info('Please enter City');
      $("#ecity").focus();
      return;
    }
    let entry = {
      id: document.getElementById('chosen_user').value,
      fname: document.getElementById('efname').value,
      lname: document.getElementById('elname').value,
      email: document.getElementById('eemail').value,
      phone: document.getElementById('ephone').value,
      addr: document.getElementById('eaddr').value,
      emrid: document.getElementById('emrid').value,
      city: document.getElementById('ecity').value,
      state: document.getElementById('estate').value,
      zip: document.getElementById('ezip').value,
      type: document.getElementById('etype').value,
      status: document.getElementById('estatus').value,
      ext: document.getElementById('eext').value,
      qr_phone: $('#qr_phone').prop('checked')?"1":"0",
      clinic: document.getElementById('eclinic').value,
    }
    if(document.getElementById('chosen_user').value == ""){
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/add", (xhr, err) => {
        if (!err) {
          toastr.success('user is added successfully');
          $("#add_user_modal").modal("hide");
        } else {
          toastr.error('Action Failed');
        }
      });
    }else{
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/update", (xhr, err) => {
        if (!err) {
          toastr.success('User is updated successfully');
          $("#edit_user_modal").modal("hide");
        } else {
          toastr.error('Action Failed');
        }
      });
    }

    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".permissionbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    let more = $(this).data('more');
    let entry = {
      id: $(this).data("role"),
    }
    $(".ch_permission").prop('checked', false);
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "role/getPermission", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        let p = '';
        for(var i=0; i<result.length; i++){
          $('#ch_'+result[i].perm_id+'_1').prop('checked', result[i].value.charAt(0)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_2').prop('checked', result[i].value.charAt(1)=="1"?true:false);
          $('#ch_'+result[i].perm_id+'_3').prop('checked', result[i].value.charAt(2)=="1"?true:false);

          if(p!="")p += ",";
          p += result[i].perm_id+'_'+result[i].value;
        }
        $("#role-values").val(p);
        if(more){
          var diff = more.split(",");
          for(var j=0; j<diff.length; j++){
            let diff_data = diff[j].split('_');
            if(diff_data.length>1){
              $('#ch_'+diff_data[0]+'_1').prop('checked', diff_data[1].charAt(0)=="1"?true:false);
              $('#ch_'+diff_data[0]+'_2').prop('checked', diff_data[1].charAt(1)=="1"?true:false);
              $('#ch_'+diff_data[0]+'_3').prop('checked', diff_data[1].charAt(2)=="1"?true:false);
            }
            
          }
        }
        
        $("#user_permission_modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $(document).on("click","#permission_submit",function(){
    var p = '';
    $(".ch_permission").each(function() {
      if(p!="")p += ',';
      p += $(this).data('id')+'_'+$(this).data('type')+'_';
      p += $(this).prop('checked')?'1':'0';
    });
    let entry = {
      id: $("#chosen_user").val(),
      permissions: p,
      role_values: $("#role-values").val()
    }

    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatepermissions", (xhr, err) => {
      if (!err) {
        toastr.success('permission is updated successfully');
        $("#user_permission_modal").modal("hide");
      } else {
        toastr.error('Credential is invalid');
      }
    });

    setTimeout( function () {
      usertable.ajax.reload();
    }, 1000 );
  });

  $(document).on("click",".clinic_toggle",function(){
    var checkbox = $(this).children().first();
    if(checkbox.prop('checked')){
      checkbox.prop('checked', false);
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-secondary");
    }else{
      checkbox.prop('checked', true);
      $(this).removeClass("btn-secondary");
      $(this).addClass("btn-primary");
    }
  });

  $(document).on("click",".clinicbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $(".clinickey").prop('checked', false);
    $(".clinic_toggle").removeClass("btn-primary");
    $(".clinic_toggle").addClass("btn-secondary");
    
    let entry = {
      id: $(this).parent().attr("idkey"),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/chosen", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        if(result.length > 0)
          if(result[0]['clinic']){
          var clinics = result[0]['clinic'].split(',');
        
          $('.clinickey').each(function(i){
              for(var i = 0; i < clinics.length; i++){
              if(clinics[i] == $(this).val()){
                $(this).prop('checked', true);
                $(this).parent().removeClass("btn-secondary");
                $(this).parent().addClass("btn-primary");
              };
            }
          });
        }
      
        $("#user_clinic_modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $(document).on("click","#clinic_submit",function(){
    var clinics = [];
    $('.clinickey:checked').each(function(i){
      clinics[i] = $(this).val();
    });
    let entry = {
      id: document.getElementById('chosen_user').value,
      clinics: clinics
    }

    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updateclinics", (xhr, err) => {
      if (!err) {
        toastr.success('Clinic is set successfully');
        $("#user_clinic_modal").modal("hide");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  

  
  $(document).on("click",".userpwdbtn",function(){
    $("#pwd").val('');
    $("#cpwd").val('');
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $("#user_pwd_modal").modal("show");
  });
  
  
  $("#password_btn").click(function (e) {
    if($("#pwd").val() == ""){
      toastr.info('Please enter Password');
      $("#pwd").focus();
      return;
    }
    if($("#cpwd").val() == ""){
      toastr.info('Please enter Confirm Password');
      $("#cpwd").focus();
      return;
    }
    if($("#pwd").val() === $("#cpwd").val()){
      let entry = {
        id: document.getElementById('chosen_user').value,
        pwd: document.getElementById('pwd').value,
      }
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatepwd", (xhr, err) => {
        if (!err) {
          toastr.success('Password is updated successfully');
          $("#user_pwd_modal").modal("hide");
        } else {
          toastr.error('Action Failed');
        }
      });
    }
    else{
      toastr.info('Please confirm password again.');
      
    }
  });

  $(document).on("click",".userquestionbtn",function(){
    $("#chosen_user").val($(this).parent().attr("idkey"));
    $("#answer").val('');
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getquestions", (xhr, err) => {
      if (!err) {
        let result = JSON.parse(xhr.responseText)['data'];
        $("#question").empty();
        for(var i = 0; i < result.length; i++){
          $("#question").append(`
              <option value = "`+result[i]['id']+`">`+result[i]['question']+`</option>
          `);
        }
        $("#user-question-modal").modal("show");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $("#question_btn").click(function (e) {
    if($("#answer").val() == ""){
      toastr.info('Please enter Answer');
      $("#answer").focus();
      return;
    }
    let entry = {
      id: document.getElementById('chosen_user').value,
      question_id: document.getElementById('question').value,
      answer: document.getElementById('answer').value,
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updateanswer", (xhr, err) => {
      if (!err) {
        toastr.success('Security is updated successfully');
        $("#user-question-modal").modal("hide");
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });
  
  $(document).on("click",".userdeletebtn",function(){
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/delete", (xhr, err) => {
          if (!err) {
            setTimeout( function () {
              usertable.ajax.reload();
            }, 1000 );
          } else {
            toastr.error('Credential is invalid');
          }
        });	
      }
		});
  });

  

  $(document).on("click",".hedisdailycheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatehedisdaily", (xhr, err) => {
      if (!err) {
        toastr.success('Action successfully');
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });
  $(document).on("click",".hedisncompliantcheck",function(){
    if($(this).prop("checked"))
      var tmpcheck = 1
    else
      var tmpcheck = 0
    var entry = {
      id:$(this).val(),
      value:tmpcheck
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/updatehedisncompliant", (xhr, err) => {
      if (!err) {
        toastr.success('Action successfully');
      } else {
        toastr.error('Credential is invalid');
      }
    });
  });

  
});
