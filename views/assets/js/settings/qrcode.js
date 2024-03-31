var conector = "";
var website = "";

$(document).ready(async function () {
  "use strict";

  var clinic_info = {}
  var size_slider = document.querySelector("#logo_size_slider");
  noUiSlider.create(size_slider, {
      start: [20],
      connect: true,
      step: 2,
      range: {
          "min": 1,
          "max": 100
      }
  });

  size_slider.noUiSlider.on("update", function (values, handle) {
    if($("#selected_object").val()=="1"){
      $("#logo_size").val(parseInt(Math.round(values[handle])));
    }else{
      $("#qr_size").val(parseInt(Math.round(values[handle])));
    }
      adjust_logo();
  });

  var x_slider = document.querySelector("#logo_x_slider");
  noUiSlider.create(x_slider, {
      start: [5],
      connect: true,
      step: 2,
      range: {
          "min": 1,
          "max": 100
      }
  });

  x_slider.noUiSlider.on("update", function (values, handle) {
    if($("#selected_object").val()=="1"){
      $("#logo_x").val(parseInt(Math.round(values[handle])));
    }else{
      $("#qr_x").val(parseInt(Math.round(values[handle])));
    }
      adjust_logo();
  });

  var y_slider = document.querySelector("#logo_y_slider");
  noUiSlider.create(y_slider, {
      start: [35],
      connect: true,
      // orientation: "vertical",
      step: 2,
      range: {
          "min": 1,
          "max": 100
      }
  });

  y_slider.noUiSlider.on("update", function (values, handle) {
    if($("#selected_object").val()=="1"){
      $("#logo_y").val(parseInt(Math.round(values[handle])));
    }else{
      $("#qr_y").val(parseInt(Math.round(values[handle])));
    }
      adjust_logo();
  });

  $(document).on("change","#selected_object",function(e){
    if($(this).val()=="1"){
      size_slider.noUiSlider.set($("#logo_size").val());
      x_slider.noUiSlider.set($("#logo_x").val());
      y_slider.noUiSlider.set($("#logo_y").val());
    }else{
      size_slider.noUiSlider.set($("#qr_size").val());
      x_slider.noUiSlider.set($("#qr_x").val());
      y_slider.noUiSlider.set($("#qr_y").val());
    }
  });
  
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:localStorage.getItem('chosen_clinic')}, "clinic/chosen", (xhr, err) => {
    if (!err) {
      var result = JSON.parse(xhr.responseText)['data'];
      $(".clinic-name").html(result[0]['name']);
      $(".rccs_clinic_name").html(result[0]['name']);
      $(".rccs_clinic_address").html(result[0]['address1']);
      $(".rccs_clinic_phone").html(result[0]['phone']);
      $(".rccs_clinic_fax").html(result[0]['cel']);
      if(result[0]['cel'].replace(/\s/g, '')==""){
        $(".rccs_clinic_fax").parent().addClass("d-none");
      }else{
        $(".rccs_clinic_fax").parent().removeClass("d-none");
      }
      $(".rccs_clinic_email").html(result[0]['email']);
      if(result[0]['email'].replace(/\s/g, '')==""){
        $(".rccs_clinic_email").parent().addClass("d-none");
      }else{
        $(".rccs_clinic_email").parent().removeClass("d-none");
      }
      $(".rccs_clinic_url").html(result[0]['web']);
      if(result[0]['web'].replace(/\s/g, '')==""){
        $(".rccs_clinic_url").parent().addClass("d-none");
      }else{
        $(".rccs_clinic_url").parent().removeClass("d-none");
      }
      
      
      $(".clinic-address").html(result[0]['address1']+" "+result[0]['city']+" "+result[0]['state']+" "+result[0]['zip']);
      $(".clinic-phone").html(result[0]['phone']);
      website = result['web'];
      conector = window.location.origin+"/connection?t="+btoa(unescape(encodeURIComponent(localStorage.getItem('chosen_clinic'))))+"&n="+btoa(unescape(encodeURIComponent(result[0]['name'])));
      
      clinic_info = result[0];
      // $(".rccs__name").html(clinic_info['name']);
      $("#rccs__number").html('Phone: '+clinic_info['phone']);
      $("#rccs__email").html(clinic_info['email']);
      $("#logo_width").val("0");
      $("#logo_height").val("0");
      $("#selected_bg_color").val(clinic_info['color']);
      $("#selected_bg_pattern").val(clinic_info['pattern']);
      $("#card_layout").val(clinic_info['layout']);
      
      if(result[0]['logo'] && result[0]['logo']!=""){
        var logo_info = result[0]['logo'].split(",");
        $("#selected_logo").val(logo_info[0]);
        $("#logo_width").val(logo_info[1]?logo_info[1]:"120");
        $("#logo_height").val(logo_info[2]?logo_info[2]:"120");
      }
      draw_logo();
      set_layout();
      if(result[0]['logo'] && result[0]['logo']!=""){
        var logo_info = result[0]['logo'].split(",");
        size_slider.noUiSlider.set(logo_info[3]?logo_info[3]:20);
        x_slider.noUiSlider.set(logo_info[4]?logo_info[4]:5);
        y_slider.noUiSlider.set(logo_info[5]?logo_info[5]:35);
        $("#qr_size").val(logo_info[6]?logo_info[6]:80);
        $("#qr_x").val(logo_info[7]?logo_info[7]:60);
        $("#qr_y").val(logo_info[8]?logo_info[8]:22);
      }
      $("#selected_object").val("1");
      adjust_logo();
      set_background();
      makeQRCode();
      
    } else {
      return toastr.error("Action Failed");
    }
  });

  var qrcode = new QRCode(document.getElementById("qr_code"), {
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
    value += "ORG:"+clinic_info['name'];
    value += "\n";
    if(clinic_info['address1'] && clinic_info['address1']!=""){
      value += "ADR:;;"+clinic_info['address1'];
      value += "\n";
    }
    if(clinic_info['phone'] && clinic_info['phone']!=""){
      value += "TEL;WORK:"+clinic_info['phone'].replaceAll("-", "").replaceAll(" ", "");
      value += "\n";
    }
    if(clinic_info['email'] && clinic_info['email']!=""){
      value += "EMAIL:"+clinic_info['email'];
      value += "\n";
    }
    var value1= value;
    if(clinic_info['web'] && clinic_info['web']!=""){
      value += "URL:"+clinic_info['web'];
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

  function hexToRgb(hex) {
    const normal = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (normal) return normal.slice(1).map(e => parseInt(e, 16));
    const shorthand = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (shorthand) return shorthand.slice(1).map(e => 0x11 * parseInt(e, 16));
    return null;
  }

  function rgbToHex(red, green, blue) {
    var d = 50;
    red = (red>128)?red-d:red+d;
    green = (green>128)?green-d:green+d;
    blue = (blue>128)?blue-d:blue+d;
    const rgb = (red << 16) | (green << 8) | (blue << 0);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
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

  $(".colorbtn").click(function(){
    // $(".postheader").css('background-color', $(this).val());
    // $("#wave").css('background-color', $(this).val());
    // document.getElementById("wave").removeAttribute("class");
    // document.getElementById("wave").classList.add($(this).attr("key"));
    // $("#post-main").css('border-color', $(this).val());
    /*****************************************/
    $("#selected_bg_color").val($(this).val())
    set_background()
  });

  $("#custom_color").change(function(){
    $("#selected_bg_color").val($(this).val())
    set_background();
  });

  function set_background(){
    var color = $("#selected_bg_color").val();
    var pattern = $("#selected_bg_pattern").val();
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
    $(".logo-text").css("color", fontColor);
    $("#rccs__number").css("color", fontColor);
    $("#rccs__email").css("color", fontColor);


    $(".clinic-name").css("color", fontColor);
    $(".rccs_clinic_name").css("color", fontColor);
    $(".rccs__expiry_sub_item").css("color", fontColor);

  }

  $(".background-pattern").click(function(){
    $("#selected_bg_pattern").val($(this).attr('style'));
    set_background();
  });

  $(".background-pattern-none").click(function(){
    $("#selected_bg_pattern").val('');
    set_background();
  });

  // $('.downloadqrbtn').click(function () {
  //   var pdf = new jsPDF({
  //     orientation: "landscape",
  //     unit: "mm",
  //     format: [600, 400]
  //   });
  //   let base64Image = $('#qrcode img').attr('src');
  //   pdf.addImage(base64Image, 'png', 200, 100, 200, 200);
    
  //   pdf.save($(".clinic-name").html()+' QR Code.pdf');
  // });

  

 function draw_logo(){
  var logo_file = $("#selected_logo").val();
  var clinic_logo="";
  if(logo_file!=""){
    clinic_logo = '<img height="'+size_slider.noUiSlider.get()+'" src="/uploads/logos/'+logo_file+'" />';
  }else{
    clinic_logo = '<div class="fw-bold logo-text">'+clinic_info['name']+'</div>';
  }
  $(".rccs__issuer").html(clinic_logo);
  
 }

 function adjust_logo(){
  
    var logo_file = $("#selected_logo").val();
    if(logo_file!=""){
      $(".rccs__issuer img").attr("height", $("#logo_size").val());
    }else{
      $(".logo-text").css("font-size", $("#logo_size").val()+'px');
    }
    $(".rccs__issuer").css("left", $("#logo_x").val()+"%")
    $(".rccs__issuer").css("top", $("#logo_y").val()+"%");

    $("#qr_code").css("padding", (parseInt($("#qr_size").val())/10)+"px");
    $("#qr_code img").css("width", $("#qr_size").val()+"px");
    $("#qr_code img").css("height", $("#qr_size").val()+"px");
    $("#qr_code").css("left", $("#qr_x").val()+"%")
    $("#qr_code").css("top", $("#qr_y").val()+"%");

 }

  $(document).on("click","#clinic_setting_save",function(e){
    var logo = $("#selected_logo").val();
    logo += "," + $("#logo_width").val();
    logo += "," + $("#logo_height").val();
    logo += "," + $("#logo_size").val();
    logo += "," + $("#logo_x").val();
    logo += "," + $("#logo_y").val();
    logo += "," + $("#qr_size").val();
    logo += "," + $("#qr_x").val();
    logo += "," + $("#qr_y").val();
    var entry = {
      clinic_id: localStorage.getItem('chosen_clinic'),
      logo: logo,
      color: $("#selected_bg_color").val(),
      pattern: $("#selected_bg_pattern").val(),
      layout: $("#card_layout").val(),
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "clinic/updateVCard", (xhr, err) => {
      if (!err) {
        toastr.success('user is added successfully');
        $("#add_user_modal").modal("hide");
      } else {
        toastr.error('Action Failed');
      }
    });
  });

  $(document).on("click","#layout_left",function(e){
    $("#card_layout").val("0");
    set_layout();
  });

  $(document).on("click","#layout_right",function(e){
    $("#card_layout").val("1");
    set_layout();
  });

  $(document).on("click","#layout_top",function(e){
    $("#card_layout").val("2");
    set_layout();
  });

  $(document).on("click","#layout_bottom",function(e){
    $("#card_layout").val("3");
    set_layout();
  });

  


  function set_layout(){
    var layout = $("#card_layout").val();
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
        $("#qr_x").val("6");
        $("#qr_y").val("25");
        $("#logo_x").val("45");
        $("#logo_y").val("35");
        if($("#selected_object").val()=="1"){
          x_slider.noUiSlider.set(45);
          y_slider.noUiSlider.set(35);
        }else{
          x_slider.noUiSlider.set(6);
          y_slider.noUiSlider.set(25);
        }
        
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
        $("#qr_x").val("60");
        $("#qr_y").val("25");
        $("#logo_x").val("7");
        $("#logo_y").val("35");
        if($("#selected_object").val()=="1"){
          x_slider.noUiSlider.set(7);
          y_slider.noUiSlider.set(35);
        }else{
          x_slider.noUiSlider.set(60);
          y_slider.noUiSlider.set(25);
        }
        break;
      case "2":
        $(".rccs__name").css("top", "35%");
        $(".rccs__name").css("left", "40%");
        $(".rccs__name").css("width", "55%");
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
        $("#qr_x").val("10");
        $("#qr_y").val("35");
        $("#logo_x").val("10");
        $("#logo_y").val("15");
        if($("#selected_object").val()=="1"){
          x_slider.noUiSlider.set(10);
          y_slider.noUiSlider.set(15);
        }else{
          x_slider.noUiSlider.set(10);
          y_slider.noUiSlider.set(35);
        }
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
        $("#qr_x").val("60");
        $("#qr_y").val("35");
        $("#logo_x").val("10");
        $("#logo_y").val("15");
        if($("#selected_object").val()=="1"){
          x_slider.noUiSlider.set(10);
          y_slider.noUiSlider.set(15);
          
        }else{
          x_slider.noUiSlider.set(60);
          y_slider.noUiSlider.set(35);
        }
        break;
    }
    $("#qr_size").val("80");
    $("#qr_code img").css("width", $("#qr_size").val()+"px");
    $("#qr_code img").css("height", $("#qr_size").val()+"px");
    $("#qr_code").css("padding", (parseInt($("#qr_size").val())/10)+"px");
    if($("#selected_object").val()=="2"){
      size_slider.noUiSlider.set(80);
    }

  }

  $(document).on("click","#vcard_pdf",async function(e){
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.canvas.height = 72 * 6;
    pdf.canvas.width = 72 * 4;

    const front=document.querySelector("#vcard_front")
    await html2canvas(front,{allowTaint:true}).then(canvas => {
      var img = canvas.toDataURL("image/png");
      pdf.addImage(img, 'SVG', 20, 40, 290, 182);
    });

    const back=document.querySelector("#vcard_back")
    await html2canvas(back,{allowTaint:true}).then(canvas => {
      var img = canvas.toDataURL("image/png");
      pdf.addImage(img, 'PNG', 20, 240, 290, 182);
    });

    pdf.save($('.rccs_clinic_name').html()+'.pdf');
  });

  $(document).on("click","#qr_pdf",async function(e){
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.canvas.height = 72 * 6;
    pdf.canvas.width = 72 * 4;

    var img = new Image();
    img.src = $(".rccs__qr_code img").attr("src");
    pdf.addImage(img, 'JPEG', 20, 20, 256, 256);
    pdf.save($('.rccs_clinic_name').html()+' QR.pdf');

  });

  $(document).on("click","#selected_font_family",function(e){
    if($("#selected_font_object").val()=="0"){
      $('.logo-text').css("font-family", $(this).val())
    }else if($("#selected_font_object").val()=="1"){
      $('.rccs_clinic_name').css("font-family", $(this).val())
    }else{
      $('.rccs__expiry_sub_item').css("font-family", $(this).val())
    }
    
  });

  


  

});
