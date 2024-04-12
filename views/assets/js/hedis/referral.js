
$(document).ready(async function () {

    

    $("#selected_date").html(new Date().toDateString());
    var entry ={
        clinic_id: localStorage.getItem('chosen_clinic'),
    }
    var doctors = []
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "user/getDoctorsByClinic", (xhr, err) => {
        if (!err) {
            doctors = JSON.parse(xhr.responseText)['data'];
            $("#doctor_list").html("");
            for(var i=0;i<doctors.length;i++){
                html = '<label class="form-check form-check-custom form-check-sm form-check-solid mb-3">';
                html += '<input class="form-check-input doctor-check" type="checkbox" checked="checked" data-id="'+doctors[i]['id']+'" >';
                html += '<span class="form-check-label text-gray-600 fw-semibold">';
                html += doctors[i]['fname']+' '+doctors[i]['fname'];
                html += '</span></label>';
                doctors[i]['ch'] = "1";
                $("#doctor_list").append(html);
            }
        }
    });

    var referral_tracking_table = $('#referral_tracking_table').DataTable({
        "ajax": {
            "url": serviceUrl + "hedis/referral",
            "type": "GET",
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
                    var date = "";
                    if(row.rt_date){
                        var ds = row.rt_date.split(",");
                        date = ds[0]

                    }
                    return date.substr(0, 16);
                }
            },
            { data: 'rt_type',
                render: function (data, type, row) {
                var color = "success";
                var type = "0";
                if(row.rt_type){
                    var rt = row.rt_type.split(",");
                    type = rt[0];
                }
                
                return '<div class="badge badge-'+getColorBytype(type)+' fw-bold badge-lg">'+row.referral_type+'</span>';
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




});

