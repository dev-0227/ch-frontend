

$(document).ready(function () {

    var selected_date = new tempusDominus.TempusDominus(document.getElementById("selected_date_picker_button"), {
        //put your config here
    });
    

    $("#selected_date_picker_value").on("change", function (e) {
        $("#selected_date").html(new Date($(this).val()).toDateString());
        load_data();
      });

    $("#selected_date").html(new Date().toDateString());

    

    

    function load_html(data){
        let startTime = data[0]?new Date(data[0]['start_date']):new Date();
        startTime.setHours(8, 0, 0, 0); // Set start time to 8:00
        let endTime = data[0]?new Date(data[0]['start_date']):new Date();
        endTime.setHours(24, 0, 0, 0); // Set end time to 12:00
        let currentTime = new Date(startTime);
        var html = "";
        html = '<div class="row"><div class="col-md-1 border">';
        html += '</div>';
        html += '<div class="col-md-4 border">';
        html += '</div>';
        html += '</div>';
        
        while (currentTime <= endTime) {
            let fromTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + 15); // Increment by 15 minutes
            html += '<div class="row"><div class="col-md-1 border text-end">';
            html += fromTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            html += '</div>';
            html += '<div class="col-md-4 border">';
            for(var i=0; i<data.length; i++){
                var start_time = new Date(data[i]['start_date']);
                if(start_time>=fromTime && start_time<currentTime){
                    html += '<div class="btn btn-primary me-5 fs-7 fw-bold p-1">'
                    html += '<div class=""><i class="fa fa-question-circle"></i> '
                    html += data[i]['FNAME']+' '+data[i]['LNAME']+', ';
                    html += new Date(data[i]['DOB']).toLocaleString("en-US").split(" ")[0];
                    html += '<br />'
                    html += data[i]['PHONE']+', '+data[i]['pt_participate_status'];
                    html += "</div></div>"
                }
            }
            html += '</div>';
            html += '</div>';
        }
        $("#appt_time_line").html(html);
    }
    
    function load_data(){
        var date = $("#selected_date_picker_value").val()?$("#selected_date_picker_value").val(): new Date();
        var entry ={
            date: new Date(date).toISOString().split('T')[0],
            clinic_id: localStorage.getItem('chosen_clinic'),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/encounter/getAppointment", (xhr, err) => {
            if (!err) {
              let result = JSON.parse(xhr.responseText)['data'];
              
              load_html(result);
            }
        });
    }
    load_html([]);
    load_data();

    

});