function GetFormattedDate(date) {
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day  = ("0" + (date.getDate())).slice(-2);
    var year = date.getFullYear();
    // var hour =  ("0" + (date.getHours())).slice(-2);
    // var min =  ("0" + (date.getMinutes())).slice(-2);
    // var seg = ("0" + (date.getSeconds())).slice(-2);
    return year + "-" + month + "-" + day;
  }

$(document).ready(async function () {

    var selected_date = new tempusDominus.TempusDominus(document.getElementById("selected_date_picker_button"), {
        //put your config here
    });
    $("#selected_date_picker_value").on("change", function (e) {
        $("#selected_date").html(new Date($(this).val()).toDateString());
        load_data();
      });

    $("#selected_date").html(new Date().toDateString());
    var entry ={
        clinic_id: localStorage.getItem('chosen_clinic'),
    }
    var doctors = []
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/getAllDoctorsByClinic", (xhr, err) => {
        if (!err) {
            doctors = JSON.parse(xhr.responseText)['data'];
            $("#doctor_list").html("");
            for(var i=0;i<doctors.length;i++){
                html = '<label class="form-check form-check-custom form-check-sm form-check-solid mb-3">';
                html += '<input class="form-check-input doctor-check" type="checkbox" checked="checked" data-id="'+doctors[i]['id']+'" >';
                html += '<span class="form-check-label text-gray-600 fw-semibold">';
                html += doctors[i]['fname']+' '+doctors[i]['lname'];
                html += '</span></label>';
                doctors[i]['ch'] = "1";
                $("#doctor_list").append(html);
            }
        }
    });

    

    function load_html(data){
        let startTime = data[0]?new Date(data[0]['approve_date']):new Date();
        startTime.setHours(8, 0, 0, 0); // Set start time to 8:00
        let endTime = data[0]?new Date(data[0]['approve_date']):new Date();
        endTime.setHours(24, 0, 0, 0); // Set end time to 12:00
        let currentTime = new Date(startTime);
       
        var html = "";
        html = '<tr class="h-60px"><td class="w-150px border  ">';
        html += '</td>';
        for(var i=0;i<doctors.length;i++){
            if(doctors[i]['ch']=="1"){
                html += '<td class="border w-250px text-center fw-bold">';
                html += doctors[i]['fname']+' '+doctors[i]['lname'];
                html += '</td>';
            }
            
        }
        html += '</tr>';
        while (currentTime <= endTime) {
            let fromTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + 15); // Increment by 15 minutes
            html += '<tr class=""><td class="text-end border pe-1">';
            html += fromTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            html += '</td>';
            for(var j=0;j<doctors.length;j++){
                if(doctors[j]['ch']=="1"){
                    html += '<td class="border text-center">';
                    for(var i=0; i<data.length; i++){
                        var start_time = new Date(data[i]['approve_date'].split('T')[0]+" "+data[i]['start_date']);
                        if(start_time>=fromTime && start_time<currentTime && data[i]['provider_id']==doctors[j]['id']){
                            html += '<div class="btn btn-primary mx-3 fs-8 fw-bold p-1 appt" data-id="'+data[i]['id']+'">'
                            html += '<div class=""><i class="fa fa-question-circle"></i> '
                            html += data[i]['FNAME']+' '+data[i]['LNAME']+', ';
                            html += new Date(data[i]['DOB']).toLocaleString("en-US").split(" ")[0];
                            html += '<br />'
                            html += data[i]['PHONE']+', '+data[i]['pt_participate_status'];
                            html += "</div></div>"
                        }
                    }
                    html += '</td>';
                }
            }
            html += '</tr>';
        }
        $("#appt_time_line").html(html);
    }
    var appointments = [];
    
    function load_data(){
        var date = $("#selected_date_picker_value").val()?$("#selected_date_picker_value").val(): new Date();
        var entry ={
            date: GetFormattedDate(new Date(date)),
            clinic_id: localStorage.getItem('chosen_clinic'),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/getAppointment", (xhr, err) => {
            if (!err) {
              appointments = JSON.parse(xhr.responseText)['data'];
              
              load_html(appointments);
            }
        });
    }
    load_html([]);
    load_data();

    
    $(document).on("change",".doctor-check",function(){
        for(var i=0;i<doctors.length;i++){
            if(doctors[i]['id']==$(this).data("id")){
                doctors[i]['ch']=$(this).prop("checked")?"1":"0";
            }
        }
        load_html(appointments);
    });

    $(document).on("click",".appt",function(){
        //alert($(this).data("id"));
    });
});

//document.write('<script src="/assets/js/hedis/appointmentModal.js" type="text/javascript"></script>');