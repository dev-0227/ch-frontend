function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
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
function deDateFormat(serial) {
    let year = serial.getFullYear();
    let month = serial.getMonth() + 1;
    let dt = serial.getDate();
  
    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }
    return year+'-'+month+'-'+dt;
}

$(document).ready(async function () {
    var doctors = []
    
    var selected_doctor= "";
    var selected_date="";
    // $("#kt_body").attr("data-kt-aside-minimize", "on");
    // $(".content").addClass("p-2");
    // $(".container-xxl").addClass("mw-100");
    // $(".container-xxl").addClass("p-4");
    const date_picker = document.querySelector('#referral_flatpickr');
    flatpickr = $(date_picker).flatpickr({
        altInput: true,
        altFormat: "d/m/Y",
        dateFormat: "Y-m-d",
        mode: "range",
        onChange: function (selectedDates, dateStr, instance) {
            if(selectedDates.length==2){
                selected_date = new Date(selectedDates[0]).toISOString().split("T")[0];
                selected_date += ",";
                selected_date += new Date(selectedDates[1]).toISOString().split("T")[0];
                reload_data_table();
            }
        },
    });

    $(document).on("click","#referral_flatpickr_clear",function(){
        flatpickr.clear();
        selected_date="";
        reload_data_table();
    });

    function refresh_data(data){
        load_excel(data);
        load_time_line(data);
    }
    
    $("#referral_status_date").val(moment().format("YYYY-MM-DD"));

    $("#selected_date").html(new Date().toDateString());
    var entry ={
        clinic_id: localStorage.getItem('chosen_clinic'),
    }
    
    var referral_tracking_table = await $('#referral_tracking_table').DataTable({
        "ajax": {
            "url": serviceUrl + "referral/referral",
            "type": "GET",
            "data": {
                clinic_id: localStorage.getItem('chosen_clinic')
            },
            "headers": { 'Authorization': localStorage.getItem('authToken') },
            "dataSrc": function ( json ) {
                refresh_data(json.data);
                return json.data;
            }  
        },
        "buttons": [
            {extend: "pdf",
               "className": "d-none",
               "title":    function () { return 'Referral Tracking - '+$("#chosen_clinics option:selected").text(); },
               "filename": function () { return 'Referral Tracking '+$("#chosen_clinics option:selected").text(); }
            },
            { extend: 'excel',
                text: 'Export Current Page',
                exportOptions: {
                    modifier: {
                        page: 'current'
                    }
                },
                customize: function (xlsx)
                {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    var loop = 0;
                    $('row', sheet).each(function () {
                        if (loop % 2 == 0 && loop > 1) {
                            $(this).find("c").attr('s', '5');
                        }
                        loop++;
                    });
                }
            }
        ],
        "columns": [
            { data: 'insurance' },
            { data: 'patient_id',
                render: function (data, type, row) {
                    return row.pt_fname+' '+row.pt_lname;
                }
            },
            { data: 'ref_to',
                render: function (data, type, row) {
                    return row.doctor_fname+' '+row.doctor_lname;
                }
            },
            { data: 'm_id' },
            { data: 'rt_date',
                render: function (data, type, row) {
                    return row.rt_date.replace("T", " ").substr(0, 16);
                }
            },
            { data: 'rt_type',
                render: function (data, type, row) {
                return '<div class="badge badge-'+getColorBytype(row.rt_type.toString())+' fw-bold badge-lg">'+row.referral_type+'</span>';
                }  
            },
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div idkey="`+row.id+`">
                  <button class="btn btn-sm btn-primary referral-view"><i class="fa fa-eye"></i> view</button>
                  </div>
                `
              } 
            }
        ],
    });

    await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/getAllDoctorsByClinic", (xhr, err) => {
        if (!err) {
            doctors = JSON.parse(xhr.responseText)['data'];
            $("#pcp_list").html("");
            $("#specialist_list").html("");
            $("#pcp_select_button").removeClass("d-none");
            $("#specialist_select_button").removeClass("d-none");
            for(var i=0;i<doctors.length;i++){
                html = '<label class="form-check form-check-custom form-check-sm form-check-solid mb-3">';
                html += '<input class="form-check-input doctor-check" type="checkbox" checked="checked" data-id="'+doctors[i]['id']+'" >';
                html += '<span class="form-check-label text-gray-600 fw-semibold">';
                html += doctors[i]['fname']+' '+doctors[i]['lname'];
                if(doctors[i]['type']=="3") html += ' ('+doctors[i]['speciality']+") ";
                html += '</span></label>';
                doctors[i]['ch'] = "1";
                if(doctors[i]['type']=="5") $("#pcp_list").append(html);
                if(doctors[i]['type']=="3") $("#specialist_list").append(html);
            }
            if($("#pcp_list").html()=="")$("#pcp_select_button").addClass("d-none");
            if($("#specialist_list").html()=="")$("#specialist_select_button").addClass("d-none");
        }
    });

    function reload_data_table(){
        var base_url = serviceUrl + "referral/referral?";
        if(selected_doctor!="")base_url += "&doctors="+selected_doctor;
        if(selected_date!="")base_url += "&range="+selected_date;
        referral_tracking_table.ajax.url(base_url).load();
    }

    $("#export_pdf").on("click", function() {
        referral_tracking_table.button( '.buttons-pdf' ).trigger();
    }); 
    
    $('#referral_table_search_input').on('keyup', function () {
    referral_tracking_table.search(this.value).draw();
    });

    $(document).on("change",".doctor-check",function(){
        selected_doctor= "";
        for(var i=0;i<doctors.length;i++){
            if(doctors[i]['id']==$(this).data("id")){
                doctors[i]['ch']=$(this).prop("checked")?"1":"0";
            }
            if(doctors[i]['ch']=="1"){
                if(selected_doctor!="")selected_doctor += ","
                selected_doctor += doctors[i]['id'];
            }
        }
        if(selected_doctor=="")selected_doctor="0";
        reload_data_table();
        
    });

    $(document).on("change",".view-radio",function(){
        var value = $('input[name="referral_view"]:checked').val();
        if(value=="0"){
            $("#view_excel").removeClass("d-none");
            $("#view_timeline").addClass("d-none");
            $("#view_table").addClass("d-none");
        }else if(value=="1"){
            $("#view_excel").addClass("d-none");
            $("#view_table").removeClass("d-none");
            $("#view_timeline").addClass("d-none");
        }else{
            $("#view_excel").addClass("d-none");
            $("#view_table").addClass("d-none");
            $("#view_timeline").removeClass("d-none");
        }
        $(".menu-sub-dropdown").removeClass("show");
    });

    function load_time_line(data){
        var html = "";
        html = '<tr class="h-60px"><td class="bg-primary w-150px border  ">';
        html += '</td>';
        for(var i=0;i<doctors.length;i++){
            if(doctors[i]['ch']=="1"){
                var bg_color = 'primary';
                if(doctors[i]['type']=="3")bg_color = 'info';
                html += '<td class="border bg-'+bg_color+' w-200px text-center fw-bold text-white">';
                html += doctors[i]['fname']+' '+doctors[i]['lname'];
                html += '</td>';
            }
            
        }
        html += '</tr>';
        var min_date='';
        var max_date='';
        for(var i=0;i<data.length;i++){
            var d = data[i]['rt_date'];
            if(i==0){
                min_date=d;
                max_date=d;
            }else{
                if(new Date(min_date) > new Date(d)){
                    min_date=d;
                }
                if(new Date(max_date) < new Date(d)){
                    max_date=d;
                }
            }
        }
        let currentTime = new Date(min_date.split("T")[0]+" 00:00:00");
        while (currentTime <= new Date(max_date)) {
            var day = currentTime.toISOString().split("T")[0];
            html += '<tr class=""><td class="text-end border pe-1 border-primary">';
            html += currentTime.toLocaleDateString();
            html += '</td>';
            for(var j=0;j<doctors.length;j++){
                if(doctors[j]['ch']=="1"){
                    bg_color = 'primary';
                    if(doctors[j]['type']=="3")bg_color = 'info';
                    html += '<td class="border bg-light-'+bg_color+' text-center border-primary bg-light-success">';
                    for(var i=0; i<data.length; i++){
                        d = data[i]['rt_date'].split(",")[0];
                        if(day==new Date(d).toISOString().split("T")[0] && data[i]['doctor_id']==doctors[j]['id']){
                            html += '<div idkey="'+data[i]['id']+'"><div class="btn btn-'+getColorBytype(data[i]['rt_type'].toString())+' mx-3 fs-8 fw-bold p-1 referral-view m-1" data-id="'+data[i]['id']+'">'
                            html += '<div class="w-100px fs-9" style="white-space: nowrap; text-overflow: ellipsis;"> '
                            html += data[i]['pt_fname']+' '+data[i]['pt_lname']+' ';
                            html += "</div><div>"
                            html += data[i]['insurance'];
                            html += "</div></div></div>"
                        }
                    }
                    html += '</td>';
                }
            }
            html += '</tr>';
            currentTime.setHours(currentTime.getHours() + 24);
        }

        
        $("#referral_time_line").html(html);
    }

    $(document).on("click","#referral_tracking_create",function(){
        var entry = {
            referral_id: $("#referral_id").val(),
            referral_type_id: $('input[name="referral_status"]:checked').val(),
            referral_category_id: $('input[name="referral_status"]:checked').data('category'),
            date: $("#referral_status_date").val()+" 15:00:00"
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "referral/referral/tracking/create", (xhr, err) => {
            if (!err) {
                $("#referral_view_modal").modal("hide");
                toastr.success("Referral Status is updated successfully");
                setTimeout( function () {
                    referral_tracking_table.ajax.reload();
                }, 1000 );
            } else {
              return toastr.error("Action Failed");
            }
          });
        
    });
});

document.write('<script src="/assets/js/hedis/referralExcel.js" type="text/javascript"></script>');
