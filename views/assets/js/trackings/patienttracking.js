
var _month = new Date(Date.now()).toISOString().substr(5, 2)
var _clinicid = -1
var _selectedClinics = ''

function showLoading(text) {
    const loadingEl = document.createElement("div")
    document.body.prepend(loadingEl)
    loadingEl.classList.add("page-loader")
    loadingEl.classList.add("flex-column")
    loadingEl.classList.add("bg-dark")
    loadingEl.classList.add("bg-opacity-50")
    loadingEl.innerHTML = `
        <span class="spinner-border text-primary" role="status"></span>
        <span class="text-gray-200 fs-1 fw-semibold mt-5">${text}</span>
    `

    // Show page loading
    KTApp.showPageLoading()
}

function hideLoading() {
    KTApp.hidePageLoading()
}

$(document).ready(async function() {
    'use strict'

    if (localStorage.getItem('usertype') > 1) {
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: localStorage.getItem('chosen_clinic')}, "clinic/chosen", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data']
                if (result.length) {
                    $("#clinic-name").html(`| ${result[0].name}`)
                }
            }
        });
    }

    renderYearSelect2()
    function renderYearSelect2() {
        var year = new Date(Date.now()).getFullYear()
        var options = ``
        for (var i = 2000; i <= 2099; i ++) {
            options += `<option value='${i}'>${i}</option>`
        }
        $('#calendar-year').html(options)
        $('#calendar-year').val(year).trigger('change')
        $('#clinic-year').html(year)
    }

    // Load All clinics
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, "clinic/getByStatus", (xhr, err) => {
        var options = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value=${item.id}>${item.name}</option>`
            })
        }
        $('#calendar-clinics').html(options)
    });

    // Load Appointment Type
    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentType", (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data'];
            var options = `<option value='0'>All Visit Type</option>`
            result.forEach(item => {
                options += `<option value=${item.id}>${item.name}</option>`
            })
            $("#search_type").html(options)
        }
    });

    // Load Patient Participate Status
    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "valueset/appointmentStatus", (xhr, err) => {
        if (!err) {
            var result = JSON.parse(xhr.responseText)['data'];
            var options = `<option value='0'>All Visit Status</option>`
            result.forEach(item => {
                options += `<option value='${item.id}'>${item.display}</option>`
            });
            $("#search_status").html(options)
        }
    });

    // Patient table begin //
    var patientTable = $("#tracking_patient_table").DataTable({
        'ajax': {
            'url': serviceUrl + 'tracking/patient/all',
            'type': 'GET',
            'headers': {'Authorization': localStorage.getItem('authToken')},
            'data': (d) => {
                d.clinicid = _clinicid,
                d.visittype = $("#search_type").val(),
                d.visitstatus = $('#search_status').val(),
                d.ptseen = $('#search_seen').prop('checked'),
                d.all = $('#search_all').val(),
                d.year = $('#calendar-year').val(),
                d.month = _month
            }
        },
        processing: true,
        serverSide: true,
        'pageLength': 10,
        'order': [],
        'columns': [{
            data: 'insuranceid',
            render: (data, type, row) => {
                return `
                    <div><span class='text-primary'>${row.pinsname ? row.pinsname : (row.pinsnamel ? row.pinsnamel : '')}</span></div>
                    <div><span>${!row.psub || row.psub != '0' ? row.psub : ''}</span></div>
                `
            }
        }, {
            data: 'lob',
            render: (data, type, row) => {
                return `
                    <div><span class='text-primary'>${row.plobname ? row.plobname : (row.plobnamel ? row.plobnamel : '')}</span></div>
                `
            }
        }, {
            data: 'patientid',
            render: (data, type, row)=> {
                return `
                    <div class='text-center'>${row.patientid ? row.patientid : ''}</div>
                `
            }
        }, {
            data: 'pfname',
            render: (data, type, row) => {
                return `
                    <div class='text-center'>${row.pfname ? row.pfname : ''} ${row.plname ? row.plname : ''}</div>
                `
            }
        }, {
            data: 'pdob',
            render: (data, type, row) => {
                var date =  new Date(row.pdob)
                return `
                    <div class='text-center'>${date.toLocaleDateString('en-US')}</div>
                `
            }
        }, {
            data: 'pphone',
            render: (data, type, row) => {
                return `
                    <div class='text-center'>${row.pphone ? row.pphone : ''}</div>
                `
            }
        }, {
            data: 'viewnotes',
            render: (data, type, row) => {
                return `
                <div class='d-flex text-center mx-auto'>
                    <i class='fa fa-thin text-primary fa-file-lines p-1 cursor-pointer' style='font-size: 1.3rem;'></i>
                    <i class='fa fa-thin text-primary fa-file p-1 cursor-pointer' style='font-size: 1.3rem;'></i>
                    <i class='fa fa-thin text-danger fa-trash-can p-1 cursor-pointer' style='font-size: 1.3rem;'></i>
                </div>
                `
            }
        }, {
            data: 'contact',
            render: (data, type, row) => {
                var html = `
                    <div class='d-flex text-center mx-auto'>
                        <i class='fa fa-thin text-primary fa-print p-1 cursor-pointer' style='font-size: 1.2rem;'></i>`
                        row.email ? html += `<a href='#' class='btn-active-color-primary' id='pt-ins-email' data='${row.id}' email='${row.email}'>
                            <i class='fa fa-thin text-primary fa-envelope p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        </a>` : html += ``
                        html += `<i class='fa fa-thin text-primary fa-mobile-screen p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        <i class='fa fa-thin text-primary fa-phone p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                    </div>
                `
                return html
            }
        }, {
            data: 'statuslog',
            render: (data, type, row) => {
                return `
                    <div class='d-flex text-center mx-auto'>
                        <i class='fa fa-thin text-primary fa-regular fa-eye p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        <i class='fa fa-solid text-primary fa-list p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        <a href='#' class='btn-active-color-primary' id='pt-ins-tracking' data='${row.id}'>
                            <i class='fa fa-thin text-primary fa-clock-rotate-left p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        </a>
                    </div>
                `
            }
        }, {
            data: 'newpttype',
            render: (data, type, row) => {
                return `
                    <div class='text-center'>${row.newpttype ? row.newpttype : ''}</div>
                `
            }
        }, {
            data: 'ptseen',
            render: (data, type, row) => {
                return row.sdisplay ? `<div class='ms-2 badge badge-light-success fw-bold fs-4 text-center'>True</div>` : `<div class='ms-2 badge badge-light-danger fw-bold fs-4 text-center'>False</div>`
            }
        },{
            data: 'dos',
            render: (data, type, row) => {
                return `
                    <div class='text-center'></div>
                `
            }
        }, {
            data: 'visittype',
            render: (data, type, row) => {
                return `
                    <div class='ms-2 fw-bold fs-5 p-1 rounded text-center' style='background-color: ${row.color}10; color: ${row.color}; display: inline-flex; align-items: center;'>${row.visittype  ? row.visittype : ''}</div>
                `
            }
        }, {
            data: 'reason',
            render: (data, type, row) => {
                return `
                    <div class='text-center'>${row.reason ? row.reason : ''}</div>
                `
            }
        }, {
            data: 'visitstatus',
            render: (data, type, row) => {
                return `    
                    <div class='text-center'>${row.visitstatus ? row.visitstatus : ''}</div>
                `
            }
        }, {
            data: 'insuranceid',
            render: (data, type, row) => {
                return `
                    <div>1</div>
                `
            }
        }]
    })

    $(document).on('click', '#pt-ins-tracking', (e) => {
        e.preventDefault()
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid: _clinicid, patientid: e.currentTarget.attributes['data'].value}, 'tracking/patient/byptid', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText)['data']
                console.log(result)
                var html = ''
                if (result.length > 0) {
                    html += `
                        <div class='fs-2 my-2 modal-text'><span class='fs-2 text-primary'>Patient ID :</span>&nbsp;<span class='fs-2 text-primary'>${result[0].ptemrid}</span></div>
                        <div class='fs-2 my-2'><span class='fs-2 text-primary'>Name :</span>&nbsp;<span class='fs-2 text-primary'>${result[0].fname} ${result[0].lname}</span></div>
                        <div class='fs-2 my-2'><span class='fs-2 text-primary'>DOB :</span>&nbsp;<span class='fs-2 text-primary'>${new Date(result[0].dob).toLocaleDateString('en-US')}</span></div>
                        <div class='fs-2 my-2'><span class='fs-2 text-primary'>Sex :</span>&nbsp;<span class='fs-2 text-primary'>${result[0].gender}</span></div>
                        <div class='separator border border-dashed my-4'></div>
                    `
                    var i = 0
                    result.forEach(item => {
                        html += `
                            <div class='fs-2 my-2 modal-text'>
                                <span class='fs-2'>Date :</span>&nbsp;<span class='fs-2'>${item.loaddate ? new Date(item.loaddate).toLocaleDateString('en-US') : ''}</span>
                                <span>&nbsp;&nbsp;&nbsp;&nbsp;${i == 0 ? `<div class='ms-2 badge badge-light-danger fw-bold fs-4 text-center'>Primary</div>` : ''}</span>
                            </div>
                            <div class='fs-2 my-2 modal-text'><span class='fs-2'>Insurance Name :</span>&nbsp;<span class='fs-2'>${item.pinsname ? item.pinsname : (item.pinsnamel ? item.pinsnamel : '')}</span></div>
                            <div class='fs-2 my-2 modal-text'><span class='fs-2'>Lob Name :</span>&nbsp;<span class='fs-2'>${item.plobname ? item.plobname : (item.plobnamel ? item.plobnamel : '')}</span></div>
                            <div class='fs-2 my-2 modal-text'><span class='fs-2'>Subscriber ID :</span>&nbsp;<span class='fs-2'>${item.subscriberno ? item.subscriberno : ''}</span></div>
                            <div class='separator border border-dashed my-3'></div>
                        `
                        i ++
                    })
                }
                $('#modal-body-tracking').html(html)
                $('#patient-insurance-tracking').modal('show')
            }
        })
    })

    // Email begin //
    $(document).on('click', '#pt-ins-email', (e) => {
        e.preventDefault()
        $('#patient-email-patient').val(e.currentTarget.attributes.email.value)
        $('#patient-email-pcp').val(localStorage.getItem('email'))
        $('#patient-insurance-email').modal('show')
    })

    $(document).on('keyup', '.email-validation', function(e) {
        if (e.target.value.length > 0) {
            $(this).removeClass('is-invalid')
            $(this).addClass('is-valid')
            $('#patient-email-button').prop('disabled', false)
        } else {
            $(this).removeClass('is-valid')
            $(this).addClass('is-invalid')
            $('#patient-email-button').prop('disabled', true)
        }
    })

    $('#patient-email-button').click(() => {
        $('#patient-insurance-email').modal('hide')

        Email.send({
            SecureToken: 'b5a369b3ddcca8ec63d8a4b32e7c21c8-2b91eb47-51ea34e1',
            To: $('#patient-email-patient').val(),
            From: $('#patient-email-pcp').val(),
            Subject: $('#patient-email-subject').val(),
            Body: $('#patient-email-comment').val()
        }).then((message) => {
            console.log(message)
            alert('mail sent successfully!')
        })
    })
    // Email end //

    // Patient Search begin //
    $(document).on('keyup', '#search_all', (e) => {
        patientTable.search(e.target.value).draw()
    })

    $('#search_seen').on('change', (e) => {
        patientTable.search(e.target.value).draw()
    })

    $(document).on('change', '#search_type', e => {
        patientTable.search(e.target.value).draw()
    })

    $(document).on('change', '#search_status', e => {
        patientTable.search(e.target.value).draw()
    })

    $('#patient-export').click(() => {
        showLoading('Preparing Download...')
        let entry = {
            name: $('#clinic-name').text(),
            clinicid: _clinicid,
            month: _month,
            year: $('#calendar-year').val()
        }
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'patientlist/export', (xhr, err) => {
            if (!err) {
                var result = JSON.parse(xhr.responseText).data
                var tag = document.createElement('a')
                document.body.appendChild(tag)
                tag.href = serviceUrl + result.url + '/' + result.filename
                tag.download = result.filename
                tag.click()
                document.body.removeChild(tag)

                toastr.success(`${entry.year}-${entry.month} patient data is being downloaded successfully!`)
            }
            hideLoading()
        })
    })
    // Patient Search end //
    // Patient table end //

    // Calendar Table begin //
    var calendarTable = $('#tracking_calendar_table').DataTable({
        'ajax': {
            'url': serviceUrl + 'patientlist/statistic',
            'type': 'GET',
            'headers': {'Authorization': localStorage.getItem('authToken')},
            'data': (d) => {
                d.clinics = _selectedClinics,
                d.usertype = localStorage.getItem('usertype'),
                d.clinicid = localStorage.getItem('chosen_clinic'),
                d.year = $('#calendar-year').val()
            }
        },
        processing: true,
        serverSide: true,
        'pageLength': 10,
        'order': [],
        'columns': [{
            data: 'clinicname',
            render: (data, type, row) => {
                return `
                    <a href='#' class='btn btn-link btn-color-gray-700 btn-active-color-primary' id='calendar-clinic-name' data-id='${row.id}'>${row.clinicname}</a>
                `
            }
        }, {
            data: 'jan',
            render: (data, type, row) => {
                if (row.s[0].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[0].month}'><span class='fs-1'>${row.s[0].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'feb',
            render: (data, type, row) => {
                if (row.s[1].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[1].month}'><span class='fs-1'>${row.s[1].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'mar',
            render: (data, type, row) => {
                if (row.s[2].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[2].month}'><span class='fs-1'>${row.s[2].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'apr',
            render: (data, type, row) => {
                if (row.s[3].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[3].month}'><span class='fs-1'>${row.s[3].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'may',
            render: (data, type, row) => {
                if (row.s[4].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[4].month}'><span class='fs-1'>${row.s[4].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'jun',
            render: (data, type, row) => {
                if (row.s[5].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[5].month}'><span class='fs-1'>${row.s[5].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'jul',
            render: (data, type, row) => {
                if (row.s[6].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[6].month}'><span class='fs-1'>${row.s[6].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'aug',
            render: (data, type, row) => {
                if (row.s[7].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[7].month}'><span class='fs-1'>${row.s[7].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'sep',
            render: (data, type, row) => {
                if (row.s[8].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[8].month}'><span class='fs-1'>${row.s[8].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'oct',
            render: (data, type, row) => {
                if (row.s[9].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[9].month}'><span class='fs-1'>${row.s[9].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'nov',
            render: (data, type, row) => {
                if (row.s[10].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[10].month}'><span class='fs-1'>${row.s[10].count}</span></a>
                        </div>
                    `
                }
            }
        }, {
            data: 'dec',
            render: (data, type, row) => {
                if (row.s[11].count < 1) {
                    return `
                        <div class='text-center'>
                            <i class="ki-duotone ki-cross text-danger fs-2tx">
                                <span class='path1'></span>
                                <span class='path2'></span>
                            </i>
                        </div>
                    `
                } else {
                    return `
                        <div class='text-center'>
                            <a href='#card-patient' id='calendar-patient-count' class='btn btn-link btn-color-gray-700 btn-active-color-primary' data-kt-scroll-toggle clinic-id='${row.id}' month-id='${row.s[11].month}'><span class='fs-1'>${row.s[11].count}</span></a>
                        </div>
                    `
                }
            }
        }]
    })

    $('#calendar-year').on('change', e => {
        calendarTable.search('').draw()
        $('#clinic-year').html(e.target.value)
        patientTable.search($('#search_all').val()).draw()
    })

    $(document).on('click', '#calendar-patient-count', function() {
        _month = $(this).attr('month-id')
        _clinicid = $(this).attr('clinic-id')

        patientTable.search($('#search_all').val()).draw()

        $('#clinic-name').html($(this).parent().parent().parent().children(0).children(0)[0].text)
    })

    $('#calendar-clinics').on('change', () => {
        _selectedClinics = $('#calendar-clinics').val().join(',')
        calendarTable.search('').draw()
    })
    // Calendar Table end //
})
