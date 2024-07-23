
var _selectLob = 0

function loadInsuranceLob(insid, clinicid) {
    $('#insurance-add-lob').html('')
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {insid: insid, clinicid: clinicid}, 'insurance/getlob', (xhr, err) => {
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
        $('#insurance-lob-clinics').html(`<option value = '0'>All Clinics</option>` + options)
        $('#lob-clinic-filter').html(`<option value = '0'>All Clinics</option>` + options)
        $('#insurance-add-clinics').html(options)
        $('#insurance-lob-add-clinics').html(options)
        $('#lob-clinic').html(options)
    })

    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance/", (xhr, err) => {
        var _id = 0
        var options = ''
        var options_i = ''
        var options_l = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                console.log(item.lob)
                options += `<option value=${item.id}>${item.insName}</option>`
                if (item.lob == 0) options_i += `<option value=${item.id}>${item.insName}</option>`
                else if (item.lob == 1) options_l += `<option value=${item.id}>${item.insName}</option>`
            })
            if (result.length > 0) _id = result[0].id
        }
        $('#insurance-insurance').html(`<option value = '0'>All Insurances</option>` + options)
        $('#insurance-add-insurance').html(options)
        $('#lob-ins-filter').html(`<option value='0'>All Insurances</option>` + options)
        $('#lob-insurance').html(options)
        $('#default_ins_list').html(options)
        loadInsuranceLob(_id)

        //for insurance mapping
        $('#insurance-lob-insurance').html(`<option value = '0'>All Insurances</option>` + options_i)
        $('#insurance-lob-add-insurance').html(options_i)
        $('#insurance-lob-add-lob').html(options_l)
    })

    // var insTable = $('#insurance-table').DataTable({
    //     "ajax": {
    //         "url": serviceUrl + "setting/map/get",
    //         "type": "GET",
    //         "headers": { 'Authorization': localStorage.getItem('authToken') },
    //         "data": function(d) {
    //             d.clinicid = $('#insurance-clinics').val() ? $('#insurance-clinics').val() : '0'
    //             d.insid = $('#insurance-insurance').val() ? $('#insurance-insurance').val() : '0'
    //         }
    //     },
    //     "processing": true,
    //     "autoWidth": false,
    //     "columns": [
    //         { data: 'id' },
    //         { data: 'clinicname'},
    //         { data: 'insName',
    //             render: (data, type, row) => {
    //                 return row.insName
    //             }
    //         },
    //         { data: 'emrid'},
    //         { data: 'fhirid'},
    //         { data: 'lobname' },
    //         { data: 'id',
    //           render: function (data, type, row) {
    //             return `
    //               <div class="btn-group align-top " idkey="`+row.id+`">
    //                 <button class="btn  btn-primary badge edit-button" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
    //                 <button class="btn  btn-danger badge delete-button" type="button"><i class="fa fa-trash"></i> Delete</button>
    //               </div>
    //             `
    //           } 
    //         }
    //     ]
    // })

    // $(document).on('click', '#insurance-add', () => {
    //     $("#edit-type").val('1')

    //     $('#insurance-add-emrid').val('')
    //     $('#insurance-add-fhirid').val('')

    //     $("#insurance-add-modal").modal('show')
    // })

    // $(document).on('click', '#insurance-save', () => {
    //     var type = $('#edit-type').val()
    //     var entry = {
    //         id: $('#chosen_map').val(),
    //         clinicid: $('#insurance-add-clinics').val(),
    //         insid: $('#insurance-add-insurance').val(),
    //         lob: $('#insurance-add-lob').val(),
    //         emrid: $('#insurance-add-emrid').val(),
    //         fhirid: $('#insurance-add-fhirid').val(),
    //     }
    //     if (type == '1') {
    //         sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/map/add', (xhr, err) => {
    //             if (!err) {
    //                 toastr.success('Successfully!')
    //             } else {
    //                 toastr.error('Action Failed!')
    //             }
    //             insTable.ajax.reload()
    //             $("#insurance-add-modal").modal('hide')
    //         })
    //     } else if (type == '0') {
    //         sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'setting/map/update', (xhr, err) => {
    //             if (!err) {
    //                 toastr.success('Successfully!')
    //             } else {
    //                 toastr.error('Action Failed!')
    //             }
    //             insTable.ajax.reload()
    //             $("#insurance-add-modal").modal('hide')
    //         })
    //     }
    // })

    // $(document).on('click', '.edit-button', function() {
    //     $('#edit-type').val('0')

    //     let entry = {
    //         id: $(this).parent().attr("idkey"),
    //     }
    //     $('#chosen_map').val(entry.id)
    //     sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/map/get", (xhr, err) => {
    //         if (!err) {
    //             var result = JSON.parse(xhr.responseText)['data']
    //             if (result.length) {
    //                 $('#insurance-add-clinics').val(result[0].clinicid).trigger('change')
    //                 $('#insurance-add-insurance').val(result[0].insid).trigger('change')
    //                 _selectLob = result[0].lob
    //                 $('#insurance-add-emrid').val(result[0].emrid)
    //                 $('#insurance-add-fhirid').val(result[0].fhirid)

    //                 $("#insurance-add-modal").modal('show')
    //             }
    //         }
    //     })
    // })

    // $(document).on('click', '.delete-button', function() {
    //     let entry = {
    //         id: $(this).parent().attr("idkey"),
    //     }
    //     Swal.fire({
    //         text: "Are you sure you would like to delete?",
    //         icon: "error",
    //         showCancelButton: true,
    //         buttonsStyling: false,
    //         confirmButtonText: "Yes, delete it!",
    //         cancelButtonText: "No, return",
    //         customClass: {
    //             confirmButton: "btn btn-danger",
    //             cancelButton: "btn btn-primary"
    //         }
    //     }).then(function (result) {
    //         if (result.value) {
    //             sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "setting/map/delete", (xhr, err) => {
    //                 if (!err) {
    //                     toastr.success('Success!')
    //                     insTable.ajax.reload()
    //                 } else {
    //                     toastr.error("Action Failed")
    //                 }
    //             })
    //         }
    //     })
    // })

    // $(document).on('change', '#insurance-clinics', () => {
    //     insTable.ajax.reload()
    // })

    // $(document).on('change', '#insurance-insurance', () => {
    //     insTable.ajax.reload()
    // })

    // $(document).on('change', '#insurance-add-insurance', (e) => {
    //     loadInsuranceLob(e.target.value, $('#insurance-add-clinics').val())
    // })

    // $(document).on('change', '#insurance-add-clinics', (e) => {
    //     loadInsuranceLob($('#insurance-add-insrance').val(), e.target.value)
    // })
    // Insurance Map end //
    // Insurance Lob Map begin //
    
    var insLobTable = $('#insurance-lob-table').DataTable({
        "ajax": {
            "url": serviceUrl + "insurance/inslobmap/list",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') },
            "data": function(d) {
                d.clinicid = $('#insurance-lob-clinics').val() ? $('#insurance-lob-clinics').val() : '0'
                d.insid = $('#insurance-lob-insurance').val() ? $('#insurance-lob-insurance').val() : '0'
            }
        },
        "processing": true,
        "autoWidth": false,
        "columns": [
            { data: 'id' },
            { data: 'clinicName' },
            { data: 'insName'},
            { data: 'lobName'},
            { data: 'ecw_insid' },
            { data: 'ecw_loginsid'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top " idkey="`+row.id+`">
                    <button class="btn  btn-primary badge edit-lob-button" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
                    <button class="btn  btn-danger badge delete-lob-button" type="button"><i class="fa fa-trash"></i> Delete</button>
                  </div>
                `
              } 
            }
        ]
    })

    $(document).on('click', '#insurance-lob-add', () => {
        $("#edit-lob-type").val('1')

        $('#insurance-lob-add-name').val('')
        $('#insurance-lob-add-ecwid').val('')
        $('#insurance-lob-add-ecwlogid').val('')

        $("#insurance-lob-add-modal").modal('show')
    })

    $(document).on('click', '#insurance-lob-save', () => {
        var type = $('#edit-lob-type').val()
        var entry = {
            id: $('#chosen_lob_map').val(),
            clinicid: $('#insurance-lob-add-clinics').val(),
            insid: $('#insurance-lob-add-insurance').val(),
            lobid: $('#insurance-lob-add-lob').val(),
            ecw_insid: $('#insurance-lob-add-ecwid').val(),
            ecw_loginsid: $('#insurance-lob-add-ecwlogid').val(),
        }
        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/inslobmap/add', (xhr, err) => {
                if (!err) {
                    toastr.success('Successfully!')
                } else {
                    toastr.error('Action Failed!')
                }
                insLobTable.ajax.reload()
                $("#insurance-lob-add-modal").modal('hide')
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/inslobmap/update', (xhr, err) => {
                if (!err) {
                    toastr.success('Successfully!')
                } else {
                    toastr.error('Action Failed!')
                }
                insLobTable.ajax.reload()
                $("#insurance-lob-add-modal").modal('hide')
            })
        }
    })

    $(document).on('click', '.edit-lob-button', function() {
        $('#edit-lob-type').val('0')

        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        $('#chosen_lob_map').val(entry.id)
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/inslobmap/get", (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length) {
                    $('#insurance-lob-add-clinics').val(result[0].clinicid).trigger('change')
                    $('#insurance-lob-add-insurance').val(result[0].insid).trigger('change')
                    $('#insurance-lob-add-lob').val(result[0].lobid).trigger('change')
                    $('#insurance-lob-add-ecwid').val(result[0].ecw_insid)
                    $('#insurance-lob-add-ecwlogid').val(result[0].ecw_loginsid)
                    _selectLob = result[0].lobid

                    $("#insurance-lob-add-modal").modal('show')
                }
            }
        })
    })

    $(document).on('click', '.delete-lob-button', function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "insurance/inslobmap/delete", (xhr, err) => {
                    if (!err) {
                        toastr.success('Success!')
                        insLobTable.ajax.reload()
                    } else {
                        toastr.error("Action Failed")
                    }
                })
            }
        })
    })

    $(document).on('change', '#insurance-lob-clinics', () => {
        insLobTable.ajax.reload()
    })

    $(document).on('change', '#insurance-lob-insurance', () => {
        insLobTable.ajax.reload()
    })
    // Insurance Lob Map end //

    // Insurance Lob begin //
    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, 'insurance/gettype', (xhr, err) => {
        if (!err) {
            var options = ``
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.display}</option>`
            })
            $('#lob-type').html(options)
            sendRequestWithToken('POST', localStorage.getItem('authToken'), {user_id:  localStorage.getItem('userid')}, "insurance/getDefaultIns", (xhr, err) => {
                if(!err) {
                    let result = JSON.parse(xhr.responseText)['data']
                    $("#default_ins_list").val(result[0].ins_id).trigger('change')
                }      
            })
        }
    })

    var lob_table = $('#lob-table').DataTable({
        "ajax": {
            "url": serviceUrl + "insurance/lob/list",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') },
            "data": function(d) {
                d.insid = $('#lob-ins-filter').val() ? $('#lob-ins-filter').val() : 0
                d.clinicid = $('#lob-clinic-filter').val() ? $('#lob-clinic-filter').val() : 0
                d.filter = $('#lob-search-input').val()
            }
        },
        "pageLength": 10,
        "processing": true,
        "columns": [
            { data: 'insName' },
            { data: 'lob' },
            { data: 'description' },
            { data: 'variation' },
            { data: 'id',
                render: function (data, type, row) {
                    return `
                        <div class="btn-group align-top " idkey="`+row.id+`">
                            <button id='lob-edit-btn' class="btn btn-primary badge" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
                            <button id='lob-delete-btn' class="btn btn-danger badge" type="button"><i class="fa fa-trash"></i> Delete</button>
                        </div>
                    `
                } 
            }
        ]
    })

    $('#lob-add').click(() => {
        $('#lob-modal-type').val('1')

        $('#lob-name').val('')
        $('#lob-desc').val('')
        $('#lob-var').val('')
        // $('#lob-emrid').val('')
        // $('#lob-fhirid').val('')

        $('#inslob-edit-modal').modal('show')
    })

    $(document).on('click', '#lob-edit-btn', function() {
        $('#lob-modal-type').val('0')
        let entry = {
            id: $(this).parent().attr("idkey"),
        }
        $('#chosen-lob').val(entry.id)
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/chosenlob', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                if (result.length > 0) {
                    $('#lob-name').val(result[0].lob)
                    $('#lob-desc').val(result[0].description)
                    $('#lob-variation').val(result[0].variation)
                    // $('#lob-emrid').val(result[0].ins_emrid)
                    // $('#lob-fhirid').val(result[0].ins_fhirid)
                    $('#lob-type').val(result[0].type_id).trigger('change')
                    $('#lob-insurance').val(result[0].insid).trigger('change')
                    // $('#lob-clinic').val(result[0].clinicid).trigger('change')

                    $('#inslob-edit-modal').modal('show')
                }
            }
        })
    })

    $('#lob-save-btn').click(() => {
        var type = $('#lob-modal-type').val()
        
        var entry = {
            id: $('#chosen-lob').val(),
            insid: $('#lob-insurance').val(),
            // clinicid: $('#lob-clinic').val(),
            name: $('#lob-name').val(),
            desc: $('#lob-desc').val(),
            variation: $('#lob-var').val(),
            type: $('#lob-type').val(),
            // emrid: $('#lob-emrid').val(),
            // fhirid: $('#lob-fhirid').val()
        }
        if (type == '1') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/addlob', (xhr, err) => {
                if (!err) {
                    toastr.success('Successful!')
                    lob_table.ajax.reload()
                    $('#inslob-edit-modal').modal('hide')
                } else {
                    toastr.error('Action Failed!')
                }
            })
        } else if (type == '0') {
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/updatelob', (xhr, err) => {
                if (!err) {
                    toastr.success('Successful!')
                    lob_table.ajax.reload()
                    $('#inslob-edit-modal').modal('hide')
                } else {
                    toastr.error('Action Failed!')
                }
            })
        }
    })

    $(document).on('click', '#lob-delete-btn', function() {
        let entry = {
            id: $(this).parent().attr("idkey")
        }
        console.log(entry)
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/deletelob', (xhr, err) => {
                    if (!err) {
                        lob_table.ajax.reload()
                        toastr.success('Successfull!')
                    } else {
                        toastr.error('Action Failed!')
                    }
                })
            }
        })
    })

    $(document).on('change', '#lob-ins-filter', function() {
        lob_table.ajax.reload()
    })

    $(document).on('keyup', '#lob-search-input', function() {
        lob_table.search(this.value).draw()
    })
    // Insurance Lob end //

    // Insurance Lob Default begin //
    $(document).on("click",".inslobsetbtn",function() {
        
        let entry = {
        ins_id:  $("#default_ins_list").val(),
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
    // Insurance Lob Default end //

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
        ins_type_table.search(this.value).draw()
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
