let ptidArr = [];
let measureArr = ['MAMMO','COLON','GI','PAP','CERVICAL','GYN','DEXA','BONE','densitometry','Ophthalmology','Ophth','eye','spiro'];

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
   element.style.display = 'none';
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
}
function DateFormat(serial) {
    let year = serial.getFullYear();
    let month = serial.getMonth() + 1;
    let dt = serial.getDate();
  
    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }
    return month+'/'+dt+'/'+year;
}
$(document).ready(function () {
    "use strict";
    $.each(measureArr, function(index, value) {
        $('#measurename').tagsinput('add', value);
    });
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),measureArr:measureArr}, "hedis/getPTsbyquery", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#ptlist").empty();
            for(var i = 0;i < result.length;i++){
                $("#ptlist").append(`<option value = "${result[i]['emr_id']}">${result[i]['emr_id']}-${result[i]['ptfname']} ${result[i]['ptlname']}(${DateFormat(new Date(result[i]['dob']))})</option>`);
            }
            $("#ptlist").multipleSelect();
        } else {
            return $.growl.error({
            message: "Action Failed"
            });
        }
    });
    let tmpbracket = true;
    let result = "BASE.customName like '%MAMMO%' OR BASE.customName like '%COLON%' OR BASE.customName like '%GI%' OR BASE.customName like '%PAP%' OR BASE.customName like '%CERVICAL%' OR BASE.customName like '%GYN%' OR BASE.customName like '%DEXA%' OR BASE.customName like '%BONE%' OR BASE.customName like '%densitometry%' OR BASE.customName like '%Ophthalmology%' OR BASE.customName like '%Ophth%' OR BASE.customName like '%eye%' OR BASE.customName like '%spiro%'";
    $("#queryresult").val(result);
    $("#ptlist").change(function(){
        ptidArr = $(this).val();
        var tmp = ptidArr.join(",");
        $("#queryresult").val("");
        var result = "";
        if(ptidArr.length > 0)
            result = "enc.pt IN ("+tmp+")";
        if(measureArr.length > 0){
            if(ptidArr.length > 0)
                result += " AND (";
            for(var i = 0;i < measureArr.length;i++){
                if(i == 0)
                    result += "BASE.customName like '%"+measureArr[i]+"%'";
                else
                    result += " OR BASE.customName like '%"+measureArr[i]+"%'";
            }
            if(ptidArr.length > 0)
                result += ")";
        }
        $("#queryresult").val(result);
    });
    $("#measurename").change(function(){
        var tmp = $(this).val();
        measureArr = tmp.split(",");
        if(tmp === ""){
            $("#ptlist").empty();
            $("#ptlist").multipleSelect();
            $("#queryresult").val("");
            ptidArr = [];
            return;
        }
        if($(this).val() !== ""){
            sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),measureArr:measureArr}, "hedis/getPTsbyquery", (xhr, err) => {
                if (!err) {
                    let result = JSON.parse(xhr.responseText)['data'];
                    $("#ptlist").empty();
                    for(var i = 0;i < result.length;i++){
                        $("#ptlist").append(`<option value = "${result[i]['emr_id']}">${result[i]['emr_id']}-${result[i]['ptfname']} ${result[i]['ptlname']}(${DateFormat(new Date(result[i]['dob']))})</option>`);
                    }
                    $("#ptlist").multipleSelect();
                } else {
                  return $.growl.error({
                    message: "Action Failed"
                  });
                }
              });
        }
        $("#queryresult").val("");
        var result = "";
        if(ptidArr.length > 0){
            result += "enc.pt IN (";
            for(var i = 0;i < ptidArr.length;i++){
                result += ptidArr[i];
            }
            result += ")";
            result += " AND (";
            for(var i = 0;i < measureArr.length;i++){
                if(i == 0)
                    result += "BASE.customName like '%"+measureArr[i]+"%'";
                else
                    result += " OR BASE.customName like '%"+measureArr[i]+"%'";
            }
            result += ")";
        }
        else{
            for(var i = 0;i < measureArr.length;i++){
                if(i == 0)
                    result += "BASE.customName like '%"+measureArr[i]+"%'";
                else
                    result += " OR BASE.customName like '%"+measureArr[i]+"%'";
            }
        }
        $("#queryresult").val(result);
    });
    $(".clearquery").click(function(){
        $("#measurename").val("");
        $("#measurename").tagsinput('removeAll');
        $("#ptlist").empty();
        $("#ptlist").multipleSelect();
        ptidArr = [];
        measureArr = [];
        setTimeout(function() {
            $("#queryresult").val("");
        },100);
        
    });
    $(".copyquery").click(function(){
        $("#queryresult").select();
        document.execCommand('copy');
    });
    $(".downloadquery").click(function(){
        var text = document.getElementById("queryresult").value;
        var filename = "query.txt";
        download(filename, text);
    });
    $(".andbtn").click(function(){
        $("#queryresult").val($("#queryresult").val()+" AND ");
    });
    $(".orbtn").click(function(){
        $("#queryresult").val($("#queryresult").val()+" OR ");
    });
    $(".inbtn").click(function(){
        $("#queryresult").val($("#queryresult").val()+" IN ");
    });
    $(".likebtn").click(function(){
        $("#queryresult").val($("#queryresult").val()+" LIKE ");
    });
    $(".bracketbtn").click(function(){
        if(tmpbracket){
            $("#queryresult").val($("#queryresult").val()+" ( ");
            tmpbracket = false;
        }
        else{
            $("#queryresult").val($("#queryresult").val()+" ) ");
            tmpbracket = true;
        }
    });
});
  