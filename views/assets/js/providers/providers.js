
$(document).ready(async function () {
    "use strict";

    await sendRequest('https://restcountries.com/v3.1/all', (xhr, res) => {
        const uniqueLanguages = new Set();
        let flags = new Array();
        JSON.parse(xhr.responseText).forEach(country => {
            flags.push({
                countryName: country.name.common,
                val: country.cca2,
                flagUrl: country.flags.svg,
                id: country.area
            });
            
            const countryLanguages = country.languages;
            if (countryLanguages) {
                Object.values(countryLanguages).map(language => {
                uniqueLanguages.add(language);
            })
            }
        });

        const allLanguages = Array.from(uniqueLanguages);
        allLanguages.sort();
        allLanguages.forEach(lang => {
            if (lang == 'English') $("#elanguage").append(`<option value='${lang}' selected='' data-select2-id='${lang}'>${lang}</option>`);
            else $("#elanguage").append(`<option value='${lang}' data-select2-id='${lang}'>${lang}</option>`);
        });

        flags.sort(function(a, b) {
            let x = a.countryName.toLowerCase();
            let y = b.countryName.toLowerCase();
            if (x < y) return -1;
            if (x > y) return 1;
            return 0;
        });
        flags.forEach(flag => {
            $("#kt_docs_select2_country").append(`<option value='${flag.val}' data-kt-select2-country='${flag.flagUrl}' data-select2-id='${flag.id}'>${flag.countryName}</option>`);
        })
    })

    let filesize = 0
    let sp = []
    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentSpecialty", (xhr, err) => {
        if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                var options = '';
                for(var i=0; i<result.length; i++){
                options += '<option value="'+result[i]['id']+'" >'+result[i]['name']+'</option>';
                sp[result[i]['id']] = result[i]['name'];
            }
            $("#especialty").html(options);
            $("#fspecialty").html('<option value="0">All Specialties</option>' + options);
        }
    });

    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance", (xhr, err) => {
        if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                var options = '';
                for(var i=0; i<result.length; i++){
                options += '<option value="'+result[i]['id']+'" >'+result[i]['insName']+'</option>';
            }
            $("#insurance_id").html(options);
        }
    });

    let _defQual = -1
    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "qualification", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            result.sort(function(a, b) {
                let x = a['display'].toLowerCase();
                let y = b['display'].toLowerCase();
                if (x < y) return -1;
                if (x > y) return 1;
                return 0;
            });
            var options = '';
            for(var i=0; i<result.length; i++){
                options += '<option value="'+result[i]['id']+'" >'+result[i]['display']+'</option>';
                if (result[i]['code'] == 'MD') _defQual = result[i]['id'];
            }
            // select Doctor of Medicine
            $("#equalification").html(options);
        }
    });

    var managertable = $('#providertable').DataTable({
        "ajax": {
            "url": serviceUrl + "provider/",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        serverSide: true,
        "pageLength": 10,
        "order": [],
        "columns": [{
            data: 'photo',
            render: function(data, type, row) {
                if (row.photo.length == 1) {
                return `
                    <center>
                        <div class="symbol symbol-60px symbol-circle">
                            <div class="symbol-label fs-3qx fw-semibold bg-primary text-inverse-primary">` + row.photo + `</div>
                        </div>
                    </center>
                `
                }
                else {
                return `
                    <center>
                        <div class="symbol symbol-60px symbol-circle">
                        <div class="symbol-label" style="background-image: url(data:image/png;base64,${row.photo});"></div>
                        </div>
                    </center>
                `
                }
            }
        }, { data: "fname",
            render: function (data, type, row) {
                return row.fname+" "+row.lname;
            } 
        }, {
            data: 'address',
            render: function (data, type, row) {
                return row.address;
            }
        }, { data: 'specialty',
            render: function (data, type, row) {
                return row.sname;
            } 
        }, { data: 'email',
            render: function(data, type, row) {
                return row.email;
            }
        }, { data: 'phone',
            render: function (data, type, row) {
                return row.phone;
            } 
        }, { data: 'status',
            render: function (data, type, row) {
                if(row.status == 1)
                    return '<div class="badge badge-success fw-bold badge-lg">Active</span>';
                else
                    return '<div class="badge badge-danger fw-bold badge-lg">Inactive</span>';
            } 
        }, { data: 'id',
            render: function (data, type, row) {
                return `
                    <div class="btn-group align-top" idkey="`+row.id+`">
                        <button class="btn btn-sm btn-primary managereditbtn" type="button"><i class="fa fa-edit"></i></button>
                        <button clinickey="`+row.clinic+`" class="btn btn-sm btn-success managerclinicbtn" type="button"><i class="fa fa-house-medical-circle-check"></i></button>
                        <button clinickey="`+row.clinic+`" class="btn btn-sm btn-warning managerpcpbtn" type="button"><i class="bi bi-controller"></i></button>
                        <button class="btn btn-sm btn-danger managerdeletebtn" type="button"><i class="fa fa-trash"></i></button>
                    </div>
                `
            } 
        }],
        "clinicid": $("#chosen_clinics").val(),
    });

    $('#table_search_input').on('keyup', function () {
        managertable.search(this.value).draw();
    });

    $(document).on("click",".manageraddbtn",function() {
        $('#chosen_manager').val("");
        $("#egender").val(1).trigger('change');
        $("#equalification").val(_defQual).trigger('change');
        $("#edob").val('');
        $("#efname").val("");
        $("#elname").val("");
        $("#emname").val("");
        $("#enpi").val("");
        $("#elicense").val("");
        $("#eemail").val("");
        $("#ephone").val("");
        $("#eaddress").val("");
        $("#eaddress2").val("");
        $("#ecity").val("");
        $("#ezip").val("");
        $("#estatus").val('1');
        $("#especialty").val("").trigger('change');
        $("#estate").val('NY').trigger('change');
        $("#kt_docs_select2_country").val("US").trigger('change');

        document.getElementById('providerPhoto').style.backgroundImage = `url(/assets/media/svg/avatars/blank.svg)`;
        $("#photoname").val('none');
        
        $("#provider-edit-modal").modal("show");
    });

    $(document).on("click",".managereditbtn",function() {
        $("#chosen_manager").val($(this).parent().attr("idkey"));
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/chosen", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $("#efname").val(result[0]['fname']);
                $("#edob").val(result[0]['dob']);
                $("#equalification").val(result[0]['qualification']).trigger('change');
                $("#egender").val(result[0]['gender']).trigger('change');
                $("#elname").val(result[0]['lname']);
                $("#emname").val(result[0]['mname']);
                $("#enpi").val(result[0]['npi']);
                $("#elicense").val(result[0]['license']);
                $("#eemail").val(result[0]['email']);
                $("#ephone").val(result[0]['phone']);
                $("#eaddress").val(result[0]['address']);
                $("#eaddress2").val(result[0]['address2']);
                $("#ecity").val(result[0]['city']);
                $("#estate").val(result[0]['state']).trigger('change');
                $("#ezip").val(result[0]['zip']);
                $("#estatus").val(result[0]['status']).trigger('change');
                $("#kt_docs_select2_country").val(result[0]['country']).trigger('change');
                if(result[0]['specialty']){
                    $("#especialty").val(result[0]['specialty'].split(",")).trigger('change');
                }else{
                    $("#specialty").val("").trigger('change');
                }
                
                if (result[0]['photo'] != '') {
                    document.getElementById('providerPhoto').style.backgroundImage = `url(data:image/png;base64,${result[0]['photo']})`;
                    $("#photo_remove_btn").show();
                    $("#photo_cancel_btn").show();
                }
                else if (result[0]['photo'] == '') {
                    document.getElementById('providerPhoto').style.backgroundImage = `url(/assets/media/svg/avatars/blank.svg)`;
                    $("#photo_remove_btn").hide();
                    $("#photo_cancel_btn").hide();
                }
                $("#photoname").val('none');

                $("#provider-edit-modal").modal("show");
                } else {
                return $.growl.error({
                    message: "Action Failed"
                });
            }
        });
    });

    let lock = false
    let _clinics = []
    let _pcp = []
    let _doctorid = 0
    $(document).on("click",".managerclinicbtn",function() {
        //set title
        $("#clinic_title").html('Set Clinics for ' + $(this).parent().parent().parent()[0].childNodes[1].innerHTML);

        $("#chosen_manager").val($(this).parent().attr('idkey'));
        $(".clinickey").prop('checked', false);
        $(".clinic_toggle").removeClass("btn-primary");
        $(".clinic_toggle").addClass("btn-secondary");

        _clinics = []
        lock = true;
        $(".check-clinic").prop('checked', false);
        lock = false;
        
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/chosen", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                if(result.length > 0) {
                    if(result[0]['clinic']) {
                        var clinics = result[0]['clinic'].split(',');

                        _clinics = clinics;
                    
                        // check
                        lock = true
                        $(".check-clinic").each(function() {
                            if (_clinics.indexOf($(this).val().toString()) !== -1) {
                                $(this).prop('checked', true)
                            }
                        })
                        lock = false
                    }
                }
                $("#provider-clinic-modal").modal("show");
            } else {
                toastr.error('Credential is invalid');
            }
        });
    });
    
    $(document).on('click', '.managerpcpbtn', function() {
        $("#pcp-form").html('')
        _pcp = []
        _doctorid = $(this).parent().attr('idkey')
        var entry = {
            id: _doctorid
        }
        // get emrid and pcpfhirid
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {doctorid: entry.id}, 'provider/getPCPInfo', (xhr1, err1) => {
            if (!err1) {
                var result1 = JSON.parse(xhr1.responseText)['data']
                result1.forEach(item => {
                    _pcp[item['clinicid']] = item
                })
            }
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'provider/getClinic', (xhr, err) => {
                if (!err) {
                    var result = JSON.parse(xhr.responseText)['data'];
                    if (result.length > 0) {
                        var comoponent = ''
                        result.forEach(item => {
                            comoponent += `
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="text-primary fs-3">${item.name}</div>
                                        <div class="fs-8"><i class="fa fa-location-dot"></i> ${item.address} ${item.city} ${item.zip} | <i class="fa fa-phone"></i> ${item.phone}</div>
                                    </div>
                                    <div class="col-md-3">
                                        <input type="text" class="form-control mb-3 mb-lg-0 pcp-emrid" key="${item.id}" value="${_pcp[item.id] === undefined ? '' : _pcp[item.id].emrid}" placeholder="EMR User ID" />
                                    </div>
                                    <div class="col-md-3">
                                        <input type="text" class="form-control mb-3 mb-lg-0 pcp-pcpfhirid"  key="${item.id}" value="${_pcp[item.id] === undefined ? '' : _pcp[item.id].doctorfhirid}" placeholder="PCP FHIR ID" />
                                    </div>
                                </div>
                                <div class="separator separator-content border-gray-600 my-5"></div>
                            `
                        });
                        $("#pcp-form").html(comoponent)
                    }
                }
            })
        })
        $("#provider-pcp-modal").modal('show');
    });

    $(document).on("click",".managerquestionbtn",function(){
        $("#chosen_manager").val($(this).parent().attr("idkey"));
        sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "setting/getquestions", (xhr, err) => {
            if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#question").empty();
            for(var i = 0; i < result.length; i++){
                $("#question").append(`
                    <option value = "`+result[i]['id']+`">`+result[i]['question']+`</option>
                `);
            }
            $("#provider-question-modal").modal("show");
            } else {
            return toastr.error('Action Failed');
            }
        });
    });
    
    $(document).on("click",".managerdeletebtn",function(){
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        Swal.fire({
            text: "Are you sure you would like to delete?",
            icon: "error",
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, return",
            customClass: {
                confirmButton: "btn btn-danger",
                cancelButton: "btn btn-primary"
            }
        }).then(function (result) {
            if (result.value) {
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/delete", (xhr, err) => {
                    if (!err) {
                        setTimeout( function () {
                            managertable.ajax.reload();
                        }, 1000 );
                        toastr.success('The clinic provider is deleted successfully!');
                    } else {
                        return toastr.error('Action Failed');
                    }
                });	
            }
        });
    });
        
    $(document).on("click",".managerpwdbtn",function(){
        $("#chosen_manager").val($(this).parent().attr("idkey"));
        $("#provider-pwd-modal").modal("show");
    });

    $("#meditbtn").click(function (e) {
        if($("#efname").val() == ""){
            toastr.warning('Please enter First name');
            $("#efname").focus();
            return;
        }
        if($("#elname").val() == ""){
            toastr.warning('Please enter Last name');
            $("#elname").focus();
            return;
        }
        if($("#ephone").val() == ""){
            toastr.warning('Please enter Phone number');
            $("#ephone").focus();
            return;
        }
        if($("#especialty").val() == ""){
            toastr.warning('Please enter Specialty');
            $("#especialty").focus();
            return;
        }
        if (filesize > 1024*30) {
            toastr.warning('Your image is too large. Image size is smaller than 30KB.');
            return;
        }

        if ($("#photoname").val() != 'update') {
            let entry = {
                id: $('#chosen_manager').val(),
                fname: document.getElementById('efname').value,
                lname: document.getElementById('elname').value,
                mname: document.getElementById('emname').value,
                dob: document.getElementById('edob').value,
                qualification: document.getElementById('equalification').value,
                gender: document.getElementById('egender').value,
                npi: document.getElementById('enpi').value,
                license: document.getElementById('elicense').value,
                email: document.getElementById('eemail').value,
                phone: document.getElementById('ephone').value,
                phone2: '',
                address: document.getElementById('eaddress').value,
                address2: document.getElementById('eaddress2').value,
                city: document.getElementById('ecity').value,
                state: document.getElementById('estate').value,
                country: document.getElementById('kt_docs_select2_country').value,
                zip: document.getElementById('ezip').value,
                status: document.getElementById('estatus').value,
                specialty: $('#especialty').val().toString(),
                type: 0,
                photo: '',
                photostate: $("#photoname").val(),
                user: localStorage.getItem('userid')
            }

            if($('#chosen_manager').val()==""){
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/add", (xhr, err) => {
                    if (!err) {
                        let result = JSON.parse(xhr.responseText)['data'];
                    if(result == "existed"){
                        return toastr.info('This email is already existed so please try with another email');
                    }
                    else{
                        $("#provider-edit-modal").modal("hide");
                        return toastr.success('Clinic Provider is added successfully');
                    }
                    
                    } else {
                        return toastr.error('Action Failed');
                    }
                });
            }else{
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/update", (xhr, err) => {
                    if (!err) {
                        $("#provider-edit-modal").modal("hide");
                        return toastr.success('Clinic Provider is updated successfully');
                    } else {
                        return toastr.error('Action Failed');
                    }
                });
            }
            
            setTimeout( function () {
                managertable.ajax.reload();
            }, 1000);
        } else {
            //upload image
            var filename = '';
            var formData = new FormData();
            formData.append("ephoto", document.getElementById('ephoto').files[0]);
            sendFormWithToken('POST', localStorage.getItem('authToken'), formData, "provider/uploadimage", (xhr, err) => {
                if (!err) {
                    if (JSON.parse(xhr.responseText)['data'] === undefined) filename = '';
                    else filename = JSON.parse(xhr.responseText)['data'].filename;
        
                    let entry = {
                        id: $('#chosen_manager').val(),
                        fname: document.getElementById('efname').value,
                        lname: document.getElementById('elname').value,
                        mname: document.getElementById('emname').value,
                        dob: document.getElementById('edob').value,
                        qualification: document.getElementById('equalification').value,
                        gender: document.getElementById('egender').value,
                        npi: document.getElementById('enpi').value,
                        license: document.getElementById('elicense').value,
                        email: document.getElementById('eemail').value,
                        phone: document.getElementById('ephone').value,
                        phone2: '',
                        address: document.getElementById('eaddress').value,
                        address2: document.getElementById('eaddress2').value,
                        city: document.getElementById('ecity').value,
                        state: document.getElementById('estate').value,
                        country: document.getElementById('kt_docs_select2_country').value,
                        zip: document.getElementById('ezip').value,
                        status: document.getElementById('estatus').value,
                        specialty: $('#especialty').val().toString(),
                        type: 0,
                        photo: filename,
                        photostate: $("#photoname").val(),
                        user: localStorage.getItem('userid')
                    }
                
                    if($('#chosen_manager').val()=="") {
                        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/add", (xhr, err) => {
                            if (!err) {
                                let result = JSON.parse(xhr.responseText)['data'];
                            if(result == "existed"){
                                return toastr.info('This data is already existed so please try with another email');
                            }
                            else{
                                    $("#provider-edit-modal").modal("hide");
                                    return toastr.success('Clinic Provider is added successfully');
                            }
                            
                            } else {
                                return toastr.error('Action Failed');
                            }
                        });
                    } else {
                    sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/update", (xhr, err) => {
                        if (!err) {
                            $("#provider-edit-modal").modal("hide");
                            return toastr.success('Clinic Provider is updated successfully');
                        } else {
                            return toastr.error('Action Failed');
                        }
                    });
                    }
                    
                    setTimeout( function () {
                        managertable.ajax.reload();
                    }, 1000 );
                }
            });
        }
    });

    $("#mpwdbtn").click(function (e) {
        if($("#pwd").val() === $("#cpwd").val()){
                let entry = {
                id: document.getElementById('chosen_manager').value,
                pwd: document.getElementById('pwd').value,
            }
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/updatepwd", (xhr, err) => {
            if (!err) {
                $("#provider-pwd-modal").modal("hide");
                return toastr.success('Password is updated successfully');
            } else {
                return toastr.error('Action Failed');
            }
            });
        }
        else{
            return toastr.error('Please confirm password again');
            
        }
    });

    $("#mquestionbtn").click(function (e) {
        let entry = {
            id: document.getElementById('chosen_manager').value,
            question_id: document.getElementById('question').value,
            answer: document.getElementById('answer').value,
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "provider/updateanswer", (xhr, err) => {
            if (!err) {
                $("#provider-question-modal").modal("hide");
                return toastr.success('Security is updated successfully');
            } else {
                return toastr.error('Action Failed');
            }
        });
    });

    $("#ephoto").on('change', function(e) {
        if (e.target.value != '') {
            $("#photoname").val('update');
            filesize = e.target.files[0].size;
        }
        $("#photo_remove_btn").show();
        $("#photo_cancel_btn").show();
    });

    $("#photo_remove_btn").click(function() {
        document.getElementById('providerPhoto').style.backgroundImage = `url(/assets/media/svg/avatars/blank.svg)`;
        $("#photoname").val('update');
        $("#photo_remove_btn").hide();
        $("#photo_cancel_btn").hide();
        filesize = 0;
    });

    // clinic
    var clinicTable = $('#clinic_table').DataTable({
        "ajax": {
            "url": serviceUrl + "clinic/listforsearch",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        serverSide: true,
        processing: true,
        "pageLength": 10,
        "order": [],
        "columns": [{
            data: 'id',
            render: function(data, type, row) {
            return `
                <center>
                    <div class="form-check form-check-sm form-check-custom form-check-lg">
                        <input id="check-clinic" class="form-check-input check-clinic" class="form-check-input" type="checkbox" value='${row.id}' />
                    </div>
                </center>
            `
            }
        },
        {
            data: 'name',
            render: function(data, type, row) {
            return `
                <div class="form-check-label px-3 d-block">
                    <div class="text-primary fs-3">${row.name}</div>
                    <div class="fs-8"><i class="fa fa-location-dot"></i> ${row.address1} | <i class="fa fa-phone"></i> ${row.phone}</div>
                </div>
            `
            }
        },
        {
            data: 'web',
            render: function(data, rype, row) {
                return `
                    <a href="${row.web}" class="btn btn-link btn-color-primary btn-active-color-danger" target="blank" style="margin: -5px;">${row.web}</a>
                `
            }
        }]
    });

    $("#clinic_search_input").on('keyup', function() {
        clinicTable.search(this.value).draw();
    })

    clinicTable.on('draw.dt', function(e) {

        setTimeout(() => {
          lock = true;
          $(".check-clinic").prop('checked', false);
    
          //set value
        $(".check-clinic").each(function() {
            if (_clinics.indexOf($(this).val().toString()) !== -1) {
                $(this).prop('checked', true)
            }
        })
          lock = false;
        }, 50);
    });

    $(document).on('change', '.check-clinic', function(e) {
        if (lock === true) return;
        if (e.target.checked == true) {
            if (_clinics.indexOf(e.target.value.toString()) === -1) {
                _clinics.push(e.target.value.toString());
            }
        } else if (e.target.checked == false) {
            var index = _clinics.indexOf(e.target.value.toString());
            if (index !== -1) {
                _clinics.splice(index, 1);
            }
        }
    });

    $("#clinic-save").on('click', () => {
        var entry = {
            id: $("#chosen_manager").val(),
            clinics: _clinics
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'provider/updateclinic', (xhr, err) => {
            if (!err) {
                $("#provider-clinic-modal").modal('hide')
                toastr.success('Clinics are updated successfully!')
            } else {
                toastr.error('Action Failed!');
            }
        })
    });

    $("#pcp-save").on('click', () => {
        _pcp = []
        $(".pcp-emrid").each(function() {
            _pcp[$(this).attr('key')] = {
                doctorid: _doctorid,
                emrid: $(this).val(),
                pcpfhirid: '',
                clinicid: $(this).attr('key'),
                usertypeid: localStorage.getItem('usertype'),
                pcpid: '',
                insuranceid: '',
                doctorinsid: '',
                user: localStorage.getItem('userid')
            }
        });
        $(".pcp-pcpfhirid").each(function() {
            _pcp[$(this).attr('key')].pcpfhirid = $(this).val()
        });

        sendRequestWithToken('POST', localStorage.getItem('authToken'), {doctorid: _doctorid, pcp: _pcp}, 'provider/setPCPInfo', (xhr, err) => {
            if (!err) {
                toastr.success('Emr IDs and PCP FHIR IDs are added successfully!');
                $("#provider-pcp-modal").modal('hide');
            } else {
                toastr.error('Action failed!');
            }
        });
    });
});
