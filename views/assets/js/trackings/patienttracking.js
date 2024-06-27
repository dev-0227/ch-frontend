
var _month = new Date(Date.now()).toISOString().substr(5, 2)
var _clinicid = -1

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

    // Load Appointment Type
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "referral/appointmentType", (xhr, err) => {
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
    sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "valueset/appointmentStatus", (xhr, err) => {
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
        serverSide: true,
        'pageLength': 10,
        'order': [],
        'columns': [{
            data: 'insuranceid',
            render: (data, type, row) => {
                return ''
            }
        }, {
            data: 'patientid',
            render: (data, type, row)=> {
                return row.patientid
            }
        }, {
            data: 'pfname',
            render: (data, type, row) => {
                return row.pfname + ' ' + row.plname
            }
        }, {
            data: 'pdob',
            render: (data, type, row) => {
                var date =  new Date(row.pdob)
                return date.toLocaleDateString('en-US')
            }
        }, {
            data: 'pphone',
            render: (data, type, row) => {
                return row.pphone
            }
        }, {
            data: 'viewnotes',
            render: (data, type, row) => {
                return `
                <div class='d-flex'>
                    <i class='fa fa-thin text-primary fa-file-lines p-1 cursor-pointer' style='font-size: 1.3rem;'></i>
                    <i class='fa fa-thin text-primary fa-file p-1 cursor-pointer' style='font-size: 1.3rem;'></i>
                    <i class='fa fa-thin text-danger fa-trash-can p-1 cursor-pointer' style='font-size: 1.3rem;'></i>
                </div>
                `
            }
        }, {
            data: 'contact',
            render: (data, type, row) => {
                return `
                    <div class='d-flex'>
                        <i class='fa fa-thin text-primary fa-print p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        <i class='fa fa-thin text-primary fa-envelope p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        <i class='fa fa-thin text-primary fa-mobile-screen p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        <i class='fa fa-thin text-primary fa-phone p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                    </div>
                `
            }
        }, {
            data: 'lob',
            render: (data, type, row) => {
                return ''
            }
        }, {
            data: 'statuslog',
            render: (data, type, row) => {
                return `
                    <div class='d-flex'>
                        <i class='fa fa-thin text-primary fa-regular fa-eye p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                        <i class='fa fa-solid text-primary fa-list p-1 cursor-pointer' style='font-size: 1.2rem;'></i>
                    </div>
                `
            }
        }, {
            data: 'newpttype',
            render: (data, type, row) => {
                return row.newpttype
            }
        }, {
            data: 'ptseen',
            render: (data, type, row) => {
                return row.sdisplay ? `<div class='ms-2 badge badge-light-success fw-bold fs-4'>True</div>` : `<div class='ms-2 badge badge-light-danger fw-bold fs-4'>False</div>`
            }
        }, {
            data: 'visittype',
            render: (data, type, row) => {
                return `
                    <div class='ms-2 fw-bold fs-5 p-1 rounded' style='background-color: ${row.color}10; color: ${row.color}; display: inline-flex; align-items: center;'>${row.visittype  ? row.visittype : ''}</div>
                `
            }
        }, {
            data: 'reason',
            render: (data, type, row) => {
                return row.reason
            }
        }, {
            data: 'visitstatus',
            render: (data, type, row) => {
                return row.visitstatus
            }
        }]
    })

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

                toastr.success(`${entry.year}-${entry.month} patient data is downloaded successfully!`)
            }
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
                d.usertype = localStorage.getItem('usertype')
                d.clinicid = localStorage.getItem('chosen_clinic')
                d.year = $('#calendar-year').val()
            }
        },
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

    $(document).on('click', '#calendar-clinic-name', function() {
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
    // Calendar Table end //
})

