var points = [],
  velocity2 = 3, // velocity squared
  canvas = document.getElementById('container'),
  context = canvas.getContext('2d'),
  radius = 6,
  boundaryX = 800,
  boundaryY = 600,
  numberOfPoints = 30;

init();

function init() {
  // create points
  for (var i = 0; i<numberOfPoints; i++) {
    createPoint();
  }
  // create connections
  for (var i = 0, l=points.length; i<l; i++) {
    var point = points[i];
    if(i == 0) {
      points[i].buddy = points[points.length-1];
    } else {
      points[i].buddy = points[i-1];
    }
  }
  
  // animate
  animate();
}

function createPoint() {
  var point = {}, vx2, vy2;
  point.x = Math.random()*boundaryX;
  point.y = Math.random()*boundaryY;
  // random vx 
  point.vx = (Math.floor(Math.random())*2-1)*Math.random();
  vx2 = Math.pow(point.vx, 2);
  // vy^2 = velocity^2 - vx^2
  vy2 = velocity2 - vx2;
  point.vy = Math.sqrt(vy2) * (Math.random()*2-1);
  points.push(point);
}

function resetVelocity(point, axis, dir) {
  var vx, vy;
  if(axis == 'x') {
    point.vx = dir*Math.random();  
    vx2 = Math.pow(point.vx, 2);
  // vy^2 = velocity^2 - vx^2
  vy2 = velocity2 - vx2;
  point.vy = Math.sqrt(vy2) * (Math.random()*2-1);
  } else {
    point.vy = dir*Math.random();  
    vy2 = Math.pow(point.vy, 2);
  // vy^2 = velocity^2 - vx^2
  vx2 = velocity2 - vy2;
  point.vx = Math.sqrt(vx2) * (Math.random()*2-1);
  }
}


function drawCircle(i, x, y) {
  const ins = ["Self Paid", "Surescripts", "Americhoice", "1199 NATIONAL BENEFIT FOUND", "ABC HEALTH PLAN", "AETNA",
           "AFFINITY HEALTH PLAN MEDICAID", "AMALGAMATED LIFE", "AMERIGROUP HEALTHPLUS", "ATLANTIS HEALTH PLAN", "BAKERY AND CONFECTIONERY UNION",
           "CIGNA", "DC 1707 LOCAL 389", "FIDELIS", "GHI", "GREAT WEST HEALTHCARE", "HEALTHFIRST", "AMERIGROUP HEALTHPLUS PHSP",
           "HEALTHNET ACS", "HIP", "INTERNATIONAL BENEFITS ADM", "LIBERTY HEALTH ADVANTAGE", "LOCAL 272 WELLFARE FUND", "MAGNACARE",
           "MEDICAID", "MEDICARE", "NATIONAL ASSOCAITION OF LETTER", "NATIONAL HEALTH PLAN", "NEIGHBORHOOD DO NOT USE THIS INS", "BROCKERAGE CONCEPTS INC"]

  context.beginPath();
  context.arc(x, y, 1, 0, 2 * Math.PI, false);
  context.fillStyle = '#ffffff';
  context.fill();
  var textString = ins[i],
  textWidth = context.measureText(textString ).width;
  var xx = x - textWidth/2;
  var yy = y - 3
  context.beginPath();
  context.rect(xx-3, yy+3, textWidth+6, -20);
  context.stroke();
  // context.fill();
  context.font = "16px Arial";
  context.fillText(textString, xx, yy );

}

function drawLine(x1, y1, x2, y2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = '#ffffff'
  context.stroke();
}  

function draw() {
  for(var i =0, l=points.length; i<l; i++) {
    // circles
    var point = points[i];
    point.x += point.vx;
    point.y += point.vy;
    drawCircle(i, point.x, point.y);
    // lines
    drawLine(point.x, point.y, point.buddy.x, point.buddy.y);
    // check for edge
    if(point.x < 0+radius) {
      resetVelocity(point, 'x', 1);
    } else if(point.x > boundaryX-radius) {
      resetVelocity(point, 'x', -1);
    } else if(point.y < 0+radius) {
      resetVelocity(point, 'y', 1);
    } else if(point.y > boundaryY-radius) {
      resetVelocity(point, 'y', -1);
    } 
  }
}

function animate() {
  context.clearRect ( 0 , 0 , boundaryX , boundaryY );
  draw();
  requestAnimationFrame(animate);
}


var textWrapper = document.querySelector('.ml1 .letters');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: true})
  .add({
    targets: '.ml1 .letter',
    scale: [0.3,1],
    opacity: [0,1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 600,
    delay: (el, i) => 70 * (i+1)
  }).add({
    targets: '.ml1 .line',
    scaleX: [0,1],
    opacity: [0.5,1],
    easing: "easeOutExpo",
    duration: 700,
    offset: '-=875',
    delay: (el, i, l) => 80 * (l - i)
  }).add({
    targets: '.ml1',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000
  });
  
$(document).ready(function () {
  "use strict";
  $('#email').keypress(function(e){
    if (e.which === 13) {
      $('#password').focus();
    }
  })

  $('#password').keypress(function(e){
    if (e.which === 13) {
      $("#login").trigger("click");
    }
  })

  $('#email').focus();
  $("#login").click(function(){
    let entry = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    }
    if(entry.email == ""){
      toastr.info('Please enter your email');
      $("#email").focus();
      return;
    }
    if(entry.password == ""){
      toastr.info('Please enter your password');
      $("#password").focus();
      return;
    }
    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "login/login", (xhr, err) => {
      let result = JSON.parse(xhr.responseText);
      if (!err) {
        if(result.status == "success"){
          localStorage.setItem('userid', result.userid);
          localStorage.setItem('usertype', result.type);
          localStorage.setItem('username', result.fname+" "+result.lname);
          localStorage.setItem('email', result.email);
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('redirectkey', $("#redirectkey").val());
          window.location.replace("./security");
        }
        else if(result.status == "approve"){
          toastr.info('You are not approved by system. Please wait for some time');
        }
        else{
          toastr.error('Credential is invalid');
        }
        
      }
      else {
        toastr.error('Credential is invalid');
      }
    });
  });

  $('#password-addon').click(function(){
    if ($("#password").data("view")=="0") {
      $("#password").attr("type", "text");
      $("#password").data("view", "1");
      $(".eye-icon").removeClass("ki-eye");
      $(".eye-icon").addClass("ki-eye-slash");
    }else{
      $("#password").attr("type", "password");
      $("#password").data("view", "0");
      $(".eye-icon").addClass("ki-eye");
      $(".eye-icon").removeClass("ki-eye-slash");
    }
  })
});
