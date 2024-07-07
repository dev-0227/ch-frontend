
var _selectLob = 0

function loadInsuranceLob(insid) {
    $('#insurance-add-lob').html('')
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: insid}, 'insurance/getlob', (xhr, err) => {
        var option = ''
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                option += `<option value='${item.id}'>${item.lob}</option>`
            })
            $('#insurance-add-lob').html(option)

            $('#insurance-add-lob').val(_selectLob).trigger('change')
        }
    })
}

$(document).ready(async function() {

    "use strict"

    // Insurance Map begin //
    // Load All clinics
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, "clinic/getByStatus", (xhr, err) => {
        var options = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value=${item.id}>${item.name}</option>`
            })
        }
        $('#insurance-clinics').html(`<option value = '0'>All Clinics</option>` + options)
        $('#insurance-add-clinics').html(options)
    })

    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance/", (xhr, err) => {
        var _id = 0
        var options = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value=${item.id}>${item.insName}</option>`
            })
            if (result.length > 0) _id = result[0].id
        }
        $('#insurance-insurance').html(`<option value = '0'>All Insurances</option>` + options)
        $('#insurance-add-insurance').html(options)
        loadInsuranceLob(_id)
    })

    var insTable = $('#insurance-table').DataTable({
        "ajax": {
            "url": serviceUrl + "setting/map/get",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') },
            "data": function(d) {
                d.clinicid = $('#insurance-clinics').val() ? $('#insurance-clinics').val() : '0'
                d.insid = $('#insurance-insurance').val() ? $('#insurance-insurance').val() : '0'
            }
        },
        "processing": true,
        "autoWidth": false,
        "columns": [
            { data: 'id' },
            { data: 'insName',
                render: (data, type, row) => {
                    return row.lob ? row.insName + ' - ' + row.lobname : row.insName
                }
            },
            { data: 'emrid'},
            { data: 'fhirid'},
            { data: 'clinicname'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top " idkey="`+row.id+`">
                    <button class="btn  btn-primary badge edit-button" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
                    <button class="btn  btn-danger badge delete-button" type="button"><i class="fa fa-trash"></i> Delete</button>
                  </div>
                `
              } 
            }
        ]
    })

    $(document).on('change', '#insurance-clinics', (e) => {
    })

    $(document).on('click', '#insurance-add', () => {
        $("#edit-type").val('1')

        $('#insurance-add-emrid').val('')
        $('#insurance-add-fhirid').val('')

        $("#insurance-add-modal").modal('show')
    })

    $(document).on('click', '#insurance-save', () => {
        var type = $('#edit-type').val()
        var entry = {
            id: $('#chosen_map').val(),
            clinicid: $('#insurance-add-clinics').val(),
            insid: $('#insurance-add-insurance').val(),
            lob: $('#insurance-add-lob').val(),
            emrid: $('#insurance-add-emrid').val(),
            fhirid: $('#insurance-add-fhirid').val(),
        }
        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/map/add', (xhr, err) => {
                if (!err) {
                    toastr.success('Successfully!')
                } else {
                    toastr.error('Action Failed!')
                }
                insTable.ajax.reload()
                $("#insurance-add-modal").modal('hide')
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/map/update', (xhr, err) => {
                if (!err) {
                    toastr.success('Successfully!')
                } else {
                    toastr.error('Action Failed!')
                }
                insTable.ajax.reload()
                $("#insurance-add-modal").modal('hide')
            })
        }
    })

    $(document).on('click', '.edit-button', function() {
        $('#edit-type').val('0')

        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/map/get", (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length) {
                    $('#insurance-add-clinics').val(result[0].clinicid).trigger('change')
                    $('#insurance-add-insurance').val(result[0].insid).trigger('change')
                    _selectLob = result[0].lob
                    $('#insurance-add-emrid').val(result[0].emrid)
                    $('#insurance-add-fhirid').val(result[0].fhirid)

                    $("#insurance-add-modal").modal('show')
                }
            }
        })
    })

    $(document).on('click', '.delete-button', function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/map/delete", (xhr, err) => {
                    if (!err) {
                        toastr.success('Success!')
                        insTable.ajax.reload()
                    } else {
                        toastr.error("Action Failed")
                    }
                })
            }
        })
    })

    $(document).on('change', '#insurance-clinics', () => {
        insTable.ajax.reload()
    })

    $(document).on('change', '#insurance-insurance', () => {
        insTable.ajax.reload()
    })

    $(document).on('change', '#insurance-add-insurance', (e) => {
        loadInsuranceLob(e.target.value)
        insTable.ajax.reload()
    })
    // Insurance Map end //

    // Insurance Lob begin //
    $("#inslobtable").DataTable();
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance/", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            $("#inslist").empty();
            $("#inslist").append(`
                <option value = "0">Select Insurance</option>
            `);
            for(var i = 0; i < result.length; i++){
                $("#inslist").append(`
                    <option value = "`+result[i]['id']+`">`+result[i]['insName']+`</option>
                `);
            }
            let params = {
                user_id:  localStorage.getItem('userid')
            }
            sendRequestWithToken('POST', localStorage.getItem('authToken'), params, "insurance/getDefaultIns", (xhr, err) => {
                if(!err) {
                    let result = JSON.parse(xhr.responseText)['data'];          
                    $("#inslist").val(result[0].ins_id).trigger('change');    
                } 
            });
        } else {
            return $.growl.error({
                message: "Action Failed"
            });
        }
    });

    $("#inslist").change(function(){
        let entry = {
            id:$(this).val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/getlob", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $("#inslobtable tbody").empty();
                for(var i = 0;i < result.length;i++){          
                    if (result[i]['ins_emrid'] == null) result[i]['ins_emrid'] = '';
                    if (result[i]['ins_fhirid'] == null) result[i]['ins_fhirid'] = '';
                    $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td>"+result[i]['ins_emrid']+"</td><td>"+result[i]['ins_fhirid']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
                }
            } else {
                return $.growl.error({
                    message: "Action Failed"
                });
            }
        });
    });

    $(document).on("click",".inslobaddbtn",function(){
        if($("#inslist").val() == 0)
            toastr.error("Please select insurance");      
        else
            $("#inslob-add-modal").modal("show");
        let en = {};
        let content = "";
        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), en, "insurance/gettypeItem", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                result.forEach(r => {                   
                    content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
                }); 
                $('#lobtype').html(content);
                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $("#inslobaddbtn").click(function (e) {
        let entry = {
            insid: document.getElementById('inslist').value,
            name: document.getElementById('lobname').value,
            desc: document.getElementById('lobdesc').value,
            variation: document.getElementById('lobvar').value,
            type: document.getElementById('lobtype').value,
            emrid: document.getElementById('lobemrid').value,
            fhirid: document.getElementById('lobfhirid').value,
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/addlob", (xhr, err) => {
            if (!err) {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
                if (!err) {
                    let result = JSON.parse(xhr.responseText)['data'];
                    $("#inslobtable tbody").empty();
                    for(var i = 0;i < result.length;i++){
                        if (result[i]['ins_emrid'] == null) result[i]['ins_emrid'] = '';
                        if (result[i]['ins_fhirid'] == null) result[i]['ins_fhirid'] = '';
                        $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td>"+result[i]['ins_emrid']+"</td><td>"+result[i]['ins_fhirid']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
                    }
                    $("#inslob-add-modal").modal("hide");
                    $('#lobname').val('');
                    $('#lobdesc').val('');
                    $('#lobvar').val('');
                    $('#lobtype').val('');
                    $('#lobemrid').val('');
                    $('#lobfhirid').val('');

                    } else {
                    return $.growl.error({
                        message: "Action Failed"
                    });
                }
            });
            } else {
                return $.growl.error({
                    message: "Action Failed"
                });
            }
        });
    });

    $(document).on("click",".inslobeditbtn",function(){

        let en = {};
        let content = "";
        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), en, "insurance/gettypeItem", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                result.forEach(r => {                   
                    content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
                }); 
                $('#elobtype').html(content);
                
            } else {
                return toastr.error("Action Failed");
            }
        });

        $("#chosen_inslob").val($(this).parent().parent().parent().attr("id"));
            let entry = {
            id: $(this).parent().parent().parent().attr("id"),
            }
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/chosenlob", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $("#elobname").val(result[0]['lob']);
                $("#elobdesc").val(result[0]['description']);
                $("#elobvar").val(result[0]['variation']);
                $("#elobtype").val(result[0]['type_id']).trigger('change');
                $('#elobemrid').val(result[0]['ins_emrid']);
                $('#elobfhirid').val(result[0]['ins_fhirid']);               

                $("#inslob-edit-modal").modal("show");
            } else {
                return $.growl.error({
                    message: "Action Failed"
                });
            }
        });
    });

    $(document).on("click",".inslobsetbtn",function() {
        
        let entry = {
        ins_id:  $("#inslist").val(),
            user_id: localStorage.getItem('userid')
        }

        if (entry.ins_id == 0) {
            toastr.error("Please select insurance");      
        } else {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/setDefaultIns", (xhr, err) => {
                if (!err) {
                    toastr.info("Set Success");            
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }    
    });   

    $("#inslobeditbtn").click(function (e) {

        let entry = {
            id: document.getElementById('chosen_inslob').value,
            name: document.getElementById('elobname').value,
            desc: document.getElementById('elobdesc').value,
            variation: document.getElementById('elobvar').value,
            type: document.getElementById('elobtype').value,
            emrid: document.getElementById('elobemrid').value,
            fhirid: document.getElementById('elobfhirid').value,
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/updatelob", (xhr, err) => {
            if (!err) {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
                if (!err) {
                    $("#inslob-edit-modal").modal("hide");
                    let result = JSON.parse(xhr.responseText)['data'];
                    $("#inslobtable tbody").empty();
                    for(var i = 0; i < result.length; i++){
                        if (result[i]['ins_emrid'] == null) result[i]['ins_emrid'] = '';
                        if (result[i]['ins_fhirid'] == null) result[i]['ins_fhirid'] = '';

                        $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td>"+result[i]['ins_emrid']+"</td><td>"+result[i]['ins_fhirid']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
                    }

                    } else {
                    return $.growl.error({
                        message: "Action Failed"
                    });
                }
            });
            } else {
                return $.growl.error({
                    message: "Action Failed"
                });
            }
        });
    });

    $(document).on("click",".inslobdeletebtn",function(){
        let entry = {
            id: $(this).parent().parent().parent().attr("id"),
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
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/deletelob", (xhr, err) => {
                if (!err) {
                    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id:document.getElementById('inslist').value}, "insurance/getlob", (xhr, err) => {
                        if (!err) {
                            let result = JSON.parse(xhr.responseText)['data'];
                            $("#inslobtable tbody").empty();
                            for(var i = 0;i < result.length;i++){
                                $("#inslobtable tbody").append("<tr id = '"+result[i]['id']+"'><td>"+result[i]['lob']+"</td><td>"+result[i]['description']+"</td><td>"+result[i]['type']+"</td><td>"+result[i]['variation']+"</td><td><div class='btn-group align-top'><button class='btn btn-sm btn-warning inslobeditbtn'><i class='fa fa-edit'></i></button><button class='btn btn-sm btn-danger inslobdeletebtn'><i class='fa fa-trash'></i></button></div></td>");
                            }
                        } else {
                            return $.growl.error({
                                message: "Action Failed"
                            });
                        }
                    });
                    } else {
                        return $.growl.error({
                            message: "Action Failed"
                        });
                    }
                });
            }
        });
    });
    // Insurance Lob end //

    // Insurance Type begin //
    var ins_type_table = $('#type_table').DataTable({
        "ajax": {
            "url": serviceUrl + "insurance/gettype",
            "type": "GET",
            "data": function(d) {
                d.filter = $('#insurance-type-search').val()
            }
        },
        "pageLength": 10,
        "order": [[0, 'asc']],
        "columns": [
            { data: 'display' },
            { data: 'description' },
            { data: 'id',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top " idkey="${row.id}">
                            <button class="btn btn-primary badge type-edit-btn" data-target="#user-form-modal" data-toggle="modal" type="button" data-type="${row.id}"><i class="fa fa-edit"></i> Edit</button>
                            <button class="btn btn-danger badge type-delete-btn" type="button"><i class="fa fa-trash"></i> Delete</button>
                        </div>
                    `
                } 
            }
        ]
    })

    $('#type-add-btn').click(() => {
        $('#type-edit-type').val('1')
        $('#insurance-type-display').val('')
        $('#insurance-type-desc').val('')

        $('#type-edit-modal').modal('show')
    })

    $(document).on('click', '.type-edit-btn',function() {
        $('#type-edit-type').val('0')
        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/chosentype', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length > 0) {
                    $('#chosen_type').val(result[0].id)
                    $('#insurance-type-display').val(result[0].display)
                    $('#insurance-type-desc').val(result[0].description)

                    $('#type-edit-modal').modal('show')
                }
            } else {
                toastr.error('A problem occurred with the server')
            }
        })
    })

    $('#type-save-btn').click(() => {
        var type = $('#type-edit-type').val()
        var entry = {
            id: $('#chosen_type').val(),
            display: $('#insurance-type-display').val(),
            description: $('#insurance-type-desc').val()
        }

        if (entry.display == '') {
            toastr.warning('Please input display!')
            $('#insurance-type-display').focus()
            return
        }

        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/addtype', (xhr, err) => {
                if (!err) {
                    ins_type_table.ajax.reload()
                    toastr.success('Success!')
                    $('#type-edit-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/updatetype', (xhr, err) => {
                if (!err) {
                    ins_type_table.ajax.reload()
                    toastr.success('Success!')
                    $('#type-edit-modal').modal('hide')
                } else {
                    return toastr.error("Action Failed")
                }
            })
        }
    })

    $(document).on('click', '.type-delete-btn', function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/deletetype", (xhr, err) => {
                    if (!err) {
                        ins_type_table.ajax.reload()
                        toastr.success('Success!')
                    } else {
                        return toastr.error("Action Failed")
                    }
                })
            }
        })
    })

    $("#insurance-type-search").on('keyup', function() {
        ins_type_table.search(this.value).draw();
    })
    // Insurance Type end //

    // Insurance Payment Method begin //
    var pay_method_table = $('#pay_method_table').DataTable({
        "ajax": {
            "url": serviceUrl + "insurance/getPaymentMethod",
            "type": "GET"
        },
        "order": [[0, 'asc']],       
        "columns": [
            { data: 'id'},
            { data: 'display'},
            { 
                data: 'description',
                render: function (data, type, row) {
                    var description = row.description;
                    var formattedDescription = description.match(/.{1,75}/g).join('<br />');
                    return `<span>` + formattedDescription + `</span>`;
                } 
            },
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge pay_method_update" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge pay_method_delete" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#pay_method_search_input').on('keyup', function () {
        pay_method_table.search(this.value).draw();
    });
    
    $(document).on('click', '#addpaymethod', function() {
        $('#pay_method_add_modal').modal('show');
    });

    $(document).on('click', '#save_pay_method', function() {
        var display = $('#add_pay_method_display').val();
        var description = $('#add_pay_method_description').val();

        if ( display == '' || description == '' ) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                display: display, 
                description: description
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/addPaymentMethod", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        pay_method_table.ajax.reload();
                    }, 1000 );
                    $('#add_pay_method_display').val('');
                    $('#add_pay_method_description').val('');
                    $('#pay_method_add_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".pay_method_delete", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/delPaymentMethod", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        pay_method_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.pay_method_update', function() {
        $('#pay_method_edit_modal').modal('show');

        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/getPaymentMethodById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];                
                $('#edit_pay_method_id').val(result[0]['id']);
                $('#edit_pay_method_display').val(result[0]['display']);
                $('#edit_pay_method_description').val(result[0]['description']);               
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#update_pay_method', function() {
        let entry = {
            id: $('#edit_pay_method_id').val(),        
            display: $('#edit_pay_method_display').val(),
            description: $('#edit_pay_method_description').val(),        
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/updatePaymentMethod", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    pay_method_table.ajax.reload();
                }, 1000 );
                $('#edit_pay_method_id').val(''),           
                $('#edit_pay_method_display').val('');
                $('#edit_pay_method_description').val('');            
                $('#pay_method_edit_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });
    // Insurance Payment Method end //
})
