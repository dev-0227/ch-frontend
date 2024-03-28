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
      $(".rccs__issuer img").attr("height", Math.round(values[handle]))
      if (handle) {
          $(".rccs__issuer img").attr("height", Math.round(values[handle]))
      }
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
      $(".rccs__issuer").css("left", Math.round(values[handle])+'%')
      if (handle) {
        $(".rccs__issuer").css("left", Math.round(values[handle])+'%')
      }
  });

  var y_slider = document.querySelector("#logo_y_slider");
  noUiSlider.create(y_slider, {
      start: [35],
      connect: true,
      step: 2,
      range: {
          "min": 1,
          "max": 100
      }
  });

  y_slider.noUiSlider.on("update", function (values, handle) {
      $(".rccs__issuer").css("top", Math.round(values[handle])+'%')
      if (handle) {
        $(".rccs__issuer").css("top", Math.round(values[handle])+'%')
      }
  });
  
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:localStorage.getItem('chosen_clinic')}, "clinic/chosen", (xhr, err) => {
    if (!err) {
      var result = JSON.parse(xhr.responseText)['data'];
      $(".clinic-name").html(result[0]['name']);
      $(".clinic-address").html(result[0]['address1']+" "+result[0]['city']+" "+result[0]['state']+" "+result[0]['zip']);
      $(".clinic-phone").html(result[0]['phone']);
      website = result['web'];
      conector = window.location.origin+"/connection?t="+btoa(unescape(encodeURIComponent(localStorage.getItem('chosen_clinic'))))+"&n="+btoa(unescape(encodeURIComponent(result[0]['name'])));

      clinic_info = result[0];
      
      $(".rccs__name").html(clinic_info['name']);
      $(".rccs__number").html('Phone: '+clinic_info['phone']);
      $(".rccs__email").html(clinic_info['email']);
      $('#clinic_logo')[0].dropzone.removeAllFiles();
      $("#logo_width").val("0");
      $("#logo_height").val("0");
      $("#selected_bg_color").val(clinic_info['color']);
      $("#selected_bg_pattern").val(clinic_info['pattern']);
      if(result[0]['logo'] && result[0]['logo']!=""){
        var logo_info = result[0]['logo'].split(",");
        $("#selected_logo").val(logo_info[0]);
        $("#logo_dropzone").addClass("d-none");
        $("#logo_image").removeClass("d-none");
        $("#logo_image_src").attr("src", "/uploads/logos/"+logo_info[0]);
        $("#logo_width").val(logo_info[1]?logo_info[1]:"120");
        $("#logo_height").val(logo_info[2]?logo_info[2]:"120");
        size_slider.noUiSlider.set(logo_info[3]?logo_info[3]:20);
        x_slider.noUiSlider.set(logo_info[4]?logo_info[4]:5);
        y_slider.noUiSlider.set(logo_info[5]?logo_info[5]:35);
        var rate = parseInt($("#logo_width").val())/parseInt($("#logo_height").val());
        if(rate>1.5){
          $("#logo_image_src").css("width", '200px');
        }else{
          $("#logo_image_src").css("width", '120px');
        }
      }else{
        $("#logo_dropzone").removeClass("d-none");
        $("#logo_image").addClass("d-none");
      }
      
      draw_logo();
      set_background();
    } else {
      return toastr.error("Action Failed");
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getqrcodetype", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['result'];
      if(result.length > 0){
        if(result[0]['age'] == 1)
          new QRCode(document.getElementById("qr_code"), conector);
        else if(website == "" || website == null)
          new QRCode(document.getElementById("qr_code"), conector);
        else
          new QRCode(document.getElementById("qr_code"), website);
      }
      else{
        if(website == "" || website == null)
          new QRCode(document.getElementById("qr_code"), conector);
        else
          new QRCode(document.getElementById("qr_code"), website);
      }
    } else {
      return toastr.error("Action Failed");
    }
  });

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
    $(".rccs__number").css("color", fontColor);
    $(".rccs__email").css("color", fontColor);
  }

  $(".background-pattern").click(function(){
    $("#selected_bg_pattern").val($(this).attr('style'));
    set_background();
  });

  $(".background-pattern-none").click(function(){
    $("#selected_bg_pattern").val('');
    set_background();
  });

  $('.downloadqrbtn').click(function () {
    var pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [600, 400]
    });
    let base64Image = $('#qrcode img').attr('src');
    pdf.addImage(base64Image, 'png', 200, 100, 200, 200);
    
    pdf.save($(".clinic-name").html()+' QR Code.pdf');
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

 function draw_logo(){
  var logo_file = $("#selected_logo").val()
  if(logo_file!=""){
    clinic_logo = '<img height="'+size_slider.noUiSlider.get()+'" src="/uploads/logos/'+logo_file+'" />';
  }else{
    var acronym = clinic_info['acronym'];
    if(!clinic_info['acronym']){
      var names = clinic_info['name'].split(" ");
      var acronym = "";
      for(var i=0; i<names.length; i++){
        acronym += names[i].substr(0,1);
      }
      if(names.length == 1){
        acronym = clinic_info['name'].substr(0, 4);
      }
    }
    clinic_logo = '<div class="fs-2hx fw-bold text-primary">'+acronym+'</div>';
  }
  $(".rccs__issuer").html(clinic_logo);
  
 }

 clinic_logo.on("addedfile", function(file, xhr) {
    var fr;
    fr = new FileReader;
    fr.onload = function() {
      var img;
      img = new Image;
      img.onload = function() {
        var min_width = 200;
        var rate = parseInt(img.width)/parseInt(img.height);
        if(rate>1.5){
          $(".dz-image img").css("height", min_width/rate+'px');
        }else{
          $(".dz-image img").css("width", '120px');
        }
        $("#logo_width").val(img.width);
        $("#logo_height").val(img.height);

        var formData = new FormData();
        var clinic_logo_file = $('#clinic_logo')[0].dropzone.getAcceptedFiles();
        if (clinic_logo_file.length > 0) {
          formData.append("logo", clinic_logo_file[0]);
          formData.append("id", $('#chosen_clinic').value);
          formData.append("filename", $(".dz-filename span").html());
          sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "clinic/uploadlogo", (xhr, err) => {
            var entry = {}
            var filename = JSON.parse(xhr.responseText)['data'];
            if (!err && filename) {
              var f = filename.split("/");
              var fname = ""
              if(f.length>1){
                fname = f[f.length-1];
              }else{
                f = filename.split("\\");
                fname = f[f.length-1];
              }
              $("#selected_logo").val(fname);
              draw_logo();
            }
          });
        }
      };
      return img.src = fr.result;
    };
    return fr.readAsDataURL(file);
  });

  $(document).on("click","#logo_delete",function(){
    $("#logo_image_src").attr("src", "")
    $("#logo_width").val("0");
    $("#logo_height").val("0");
    $("#selected_logo").val("");
    $("#logo_dropzone").removeClass("d-none");
    $("#logo_image").addClass("d-none");
    draw_logo();
  });


  $(document).on("click","#clinic_setting_save",function(e){
    var logo = $("#selected_logo").val();
    logo += "," + $("#logo_width").val();
    logo += "," + $("#logo_height").val();
    logo += "," + parseInt(size_slider.noUiSlider.get());
    logo += "," + parseInt(x_slider.noUiSlider.get());
    logo += "," + parseInt(y_slider.noUiSlider.get());
    if($("#selected_logo").val()=="")logo="";
    var entry = {
      clinic_id: localStorage.getItem('chosen_clinic'),
      logo: logo,
      color: $("#selected_bg_color").val(),
      pattern: $("#selected_bg_pattern").val(),
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

});
