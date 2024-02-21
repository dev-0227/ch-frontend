function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
var question_arr = [];
let getid = getUrlVars();
$(document).ready(async function () {
  "use strict";
  $( function() {
      $( "#m-area" ).sortable();
      $( "#m-area" ).disableSelection();
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:getid['id']}, "setting/getmodules", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#m-area").empty();
      let tmpres = result['res'].split(",");
      question_arr = result['quiz'].split(",");
      for(var i = 0;i < result['tmpquiz'].length;i++){
        $("#m-area").append(`
            <li class='parent' key = "${result['tmpquiz'][i]['id']}">
                <p>${result['tmpquiz'][i]['question']}</p>
                <i class="fa fa-trash deleteqbtn"></i>
                <div class="${result['tmpquiz'][i]['id']}_response response_area"></div>
            </li>
        `);
      }
      for(var i = 0;i < tmpres.length;i++){
        if(tmpres[i] == 0){
          $("."+result['tmpquiz'][i]['id']+"_response").append(`
            <div reskey="0" id=${result['tmpquiz'][i]['id']+"_0"}_response_item>
              <textarea class="form-control" rows="3" disabled placeholder="General Response"></textarea>
            </div>
          `);
        }
        else{
          let ares = [];
          for(var j = 0;j < result['tmpres'].length;j++){
            if(result['tmpres'][j]['id'] == tmpres[i]){
              ares = result['tmpres'][j];
              break;
            }
          }
          let tmpares = ares['name'].split(",");
          $("."+result['tmpquiz'][i]['id']+"_response").append(`
            <div reskey=${tmpres[i]} id=${result['tmpquiz'][i]['id']+"_"+tmpres[i]}_response_item></div>
          `);
          for(var j = 0;j < tmpares.length;j++){
            $("#"+result['tmpquiz'][i]['id']+"_"+tmpres[i]+"_response_item").append(`
              <div class="form-check form-check-radio form-check-inline">
                  <label class="form-check-label">
                      <input class="form-check-input" type="radio" name="${result['tmpquiz'][i]['id']+"_"+tmpres[i]}_option"> ${tmpares[j]}
                      <span class="circle">
                          <span class="check"></span>
                      </span>
                  </label>
              </div>
            `);
          }
        }
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getcontactquestions", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#q-area").empty();
      for(var i = 0;i < result.length;i++){
        $("#q-area").append(`
          <p class="qitem" key="${result[i]['id']}">${result[i]['question']}</p>
        `);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getcontactr", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $("#r-area").empty();
      $("#r-area").append(`
        <div class="response-item" id="res_0" reskey="0">
          <textarea class="form-control" rows="3" disabled placeholder="General Response"></textarea>
        </div>
      `);

      for(var i = 0; i < result.length;i++){
        var tmpArr = result[i]['name'].split(",");
        if(tmpArr.length > 0){
          $("#r-area").append(`
              <div class="response-item" id="res_${result[i]['id']}" reskey="${result[i]['id']}"></div>
          `);
          for(var j = 0;j < tmpArr.length;j++){
            $("#res_"+result[i]['id']).append(`
              <label class="custom-control custom-radio d-inline-flex">
                <input type="radio" class="custom-control-input" disabled>
                <span class="tag custom-control-label">${tmpArr[j]}</span>
              </label>
            `);
          }
        }
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  $(document).on("click",".qitem",function(){
    if(!question_arr.includes($(this).attr("key"))){
      if($("#m-area li").length > 0 && $("#m-area li:last-child div.response_area div").length == 0){
        return $.growl.error({
          message: "Please add response option before adding new question"
        });  
      }
      else{
        question_arr.push($(this).attr("key"));
        $("#m-area").append(`
            <li class='parent' key = "${$(this).attr("key")}">
                <p>${$(this).html()}</p>
                <i class="fa fa-trash deleteqbtn"></i>
                <div class="${$(this).attr("key")}_response response_area"></div>
            </li>
        `);
      }
    }
    else{
      return $.growl.error({
        message: "This question is already added"
      });  
    }
  });
  $(document).on("click",".deleteqbtn",function(){
    var tmpid = $(this).parent().attr("key");
    const index = question_arr.indexOf(tmpid);
    if (index > -1) {
        question_arr.splice(index, 1);
    }
    $(this).parent().remove();
  });
  $(document).on("click",".response-item",async function(){
    if($(this).attr("reskey") == 0){
      if($("#m-area").children().length == 0){
        return $.growl.error({
          message: "Please add question first"
        });
      }
      else if($("#m-area li:last-child div.response_area div").length == 0){
        $("#m-area li:last-child div.response_area").append(`
          <div reskey="0" id=${$("#m-area li:last-child").attr("key")+"_0"}_response_item>
            <textarea class="form-control" rows="3" disabled placeholder="General Response"></textarea>
          </div>
        `);
      }
      else{
        return $.growl.error({
          message: "Response is already added"
        });
      }
    }
    else{
      await sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:$(this).attr("reskey")}, "setting/chosencontactr", (xhr, err) => {
        if (!err) {
          let result = JSON.parse(xhr.responseText)['data'][0];
          var tmpArr = result['name'].split(",");
          if($("#m-area").children().length == 0){
            return $.growl.error({
              message: "Please add question first"
            });
          }
          else if($("#m-area li:last-child div.response_area div").length == 0){
            $("#m-area li:last-child div.response_area").append(`
              <div reskey=${result['id']} id=${$("#m-area li:last-child").attr("key")+"_"+result['id']}_response_item></div>
            `);
            for(var i = 0;i < tmpArr.length;i++){
              $("#"+$("#m-area li:last-child").attr("key")+"_"+result['id']+"_response_item").append(`
                <div class="form-check form-check-radio form-check-inline">
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="${$("#m-area li:last-child").attr("key")+"_"+result['id']}_option"> ${tmpArr[i]}
                        <span class="circle">
                            <span class="check"></span>
                        </span>
                    </label>
                </div>
              `);
            }
          }
          else{
            return $.growl.error({
              message: "Response is already added"
            });
          }
        } else {
          return $.growl.error({
            message: "Action Failed"
          });
        }
      });
    }
  });
  $(".generatebtn").click(function(){
    var questionArr = [];
    var responseArr = [];
    for(var i = 0;i < $("#m-area li").length;i++){
        questionArr.push($("#m-area").children().eq(i).attr("key"));
        responseArr.push($("#m-area").children().eq(i).find("div.response_area").find("div").attr("reskey"));
    }
    if(questionArr.length == 0){
      return $.growl.error({
        message: "Please add some questions to generate module"
      });  
    }
    else if(responseArr.length == 0){
      return $.growl.error({
        message: "Please add some responses to generate module"
      });  
    }
    else{
      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, save it!",
      }, function(inputValue) {
        if (inputValue) {
          let entry = {
            id:getid['id'],
            quiz:questionArr,
            res:responseArr
          }
          sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/generatemodule", (xhr, err) => {
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
      });
    }
  });
});
