
$(document).ready(async function () {
    var doctors = []
    var data = [];
    var selected_doctor= "";
    var selected_date="";
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

    

    $("#selected_date").html(new Date().toDateString());
    var entry ={
        clinic_id: localStorage.getItem('chosen_clinic'),
    }
    
    

    var referral_tracking_table = await $('#referral_tracking_table').DataTable({
        "ajax": {
            "url": serviceUrl + "hedis/referral",
            "type": "GET",
            "data": {
                clinic_id: localStorage.getItem('chosen_clinic')
            },
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
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
                  <button class="btn btn-sm btn-primary view_referral_btn"><i class="fa fa-eye"></i> view</button>
                  </div>
                `
              } 
            }
        ],
    });
    

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

    function reload_data_table(){
        var base_url = serviceUrl + "hedis/referral?";
        if(selected_doctor!="")base_url += "&doctors="+selected_doctor;
        if(selected_date!="")base_url += "&range="+selected_date;
        referral_tracking_table.ajax.url(base_url).load();

        setTimeout( function () {
            data = referral_tracking_table.rows().data().toArray();
            load_time_line();
        }, 1000 );
        
    }

    function getColorBytype(type){
        var color="primary";
        switch(type){
            case "1": color="success"; break;
            case "2": color="danger"; break;
            case "3": color="primary"; break;
            case "4": color="secondary"; break;
            case "5": color="info"; break;
            case "6": color="danger"; break;
            case "7": color="success"; break;
            default: color="primary"; break;
        }
        return color;
    }

    $(document).on("click",".view_referral_btn",function(){
        $("#referral_id").val($(this).parent().attr("idkey"));
        let entry = {
          id: $("#referral_id").val(),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "hedis/referral/chosen", (xhr, err) => {
          if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#referral_insurance").html(result[0]['insurance']);
            $("#referral_measure").html(result[0]['m_id']);
            $("#referral_patient").html(result[0]['pt_fname']+" "+result[0]['pt_lname']);
            $("#referral_pt_gender").html(result[0]['pt_gender']);
            $("#referral_pt_dob").html(new Date(result[0]['pt_dob']).toISOString().split("T")[0]);
            $("#referral_pt_address").html(result[0]['pt_address']);
            $("#referral_pt_phone").html(result[0]['pt_phone']);
            $("#referral_subscriber").html(result[0]['subscrber_no']);
            $("#referral_specialty").html(result[0]['doctor_specialty']);
            $("#referral_ref_to").html(result[0]['doctor_fname']+" "+result[0]['doctor_lname']);
            $("#referral_spe_npi").html(result[0]['spe_npi']);
            $("#referral_reason").html(result[0]['reason']);
            $("#referral_view_modal").modal("show");
            var html = "";
            $("#referral_history").html("");
            for(var i=0; i<result.length; i++){
                html = '';
                html += '<div class="timeline-item align-items-center mb-7">';
                html += '<div class="timeline-line mt-1 mb-n6 mb-sm-n7"></div>';
                html += '<div class="timeline-icon">';
                html += '<i class="ki-duotone ki-cd fs-2 text-danger"><span class="path1"></span><span class="path2"></span></i>';
                html += '</div><div class="timeline-content m-0">';
                html += '<span class="fs-6 text-gray-500 fw-semibold ">';
                html += result[i]['rt_date']?result[i]['rt_date'].replace("T", " ").substr(0, 16):"";
                html += '</span><div class="ms-3 badge badge-lg badge-'+getColorBytype(result[i]['rt_type'].toString())+' fw-bold my-2 fs-6">';
                html += result[i]['referral_type'];
                html += '</div></div></div>';
                $("#referral_history").append(html);
            }
          } else {
            return toastr.error("Action Failed");
          }
        });
        
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
            $("#view_table").removeClass("d-none");
            $("#view_timeline").addClass("d-none");
        }else{
            $("#view_table").addClass("d-none");
            $("#view_timeline").removeClass("d-none");
            
        }
        $(".menu-sub-dropdown").removeClass("show");

    });

    function load_time_line(){
        var html = "";
        html = '<tr class="h-60px"><td class="w-150px border  ">';
        html += '</td>';
        for(var i=0;i<doctors.length;i++){
            if(doctors[i]['ch']=="1"){
                var bg_color = 'primary';
                if(doctors[i]['type']=="3")bg_color = 'info';
                html += '<td class="border bg-'+bg_color+' w-250px text-center fw-bold text-white">';
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
            html += '<tr class=""><td class="text-end border pe-1">';
            html += currentTime.toLocaleDateString();
            html += '</td>';
            for(var j=0;j<doctors.length;j++){
                if(doctors[j]['ch']=="1"){
                    html += '<td class="border text-center">';
                    for(var i=0; i<data.length; i++){
                        d = data[i]['rt_date'].split(",")[0];
                        if(day==new Date(d).toISOString().split("T")[0] && data[i]['doctor_id']==doctors[j]['id']){
                            html += '<div idkey="'+data[i]['id']+'"><div class="btn btn-'+getColorBytype(data[i]['rt_type'].toString())+' mx-3 fs-8 fw-bold p-1 view_referral_btn m-1" data-id="'+data[i]['id']+'">'
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

    setTimeout( function () {
        data = referral_tracking_table.rows().data().toArray();
        load_time_line();
    }, 1000 );

    


});

