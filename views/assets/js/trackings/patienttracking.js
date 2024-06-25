
$(document).ready(async function() {
    'use strict'

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: localStorage.getItem('chosen_clinic')}, "clinic/chosen", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            if (result.length) {
                $("#clinic-name").html(result[0].name)
            }
        }
    });

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

    var patientTable = $("#tracking_patient_table").DataTable({
        'ajax': {
            'url': serviceUrl + 'tracking/patient/all',
            'type': 'GET',
            'headers': {'Authorization': localStorage.getItem('authToken')},
            'data': (d) => {
                d.clinicid = localStorage.getItem('chosen_clinic'),
                d.visittype = $("#search_type").val(),
                d.visitstatus = $('#search_status').val(),
                d.ptseen = $('#search_seen').prop('checked'),
                d.all = $('#search_all').val()
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
                return new Date(row.pdob).toISOString().substr(0, 10)
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
                    <i class='fa fa-thin text-primary  fa-file-lines p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
                    <i class='fa fa-thin text-primary fa-file p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
                    <i class='fa fa-thin text-danger fa-trash-can p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
                </div>
                `
            }
        }, {
            data: 'contact',
            render: (data, type, row) => {
                return `
                    <div class='d-flex'>
                        <i class='fa fa-thin text-primary fa-print p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
                        <i class='fa fa-thin text-primary fa-envelope p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
                        <i class='fa fa-thin text-primary fa-mobile-screen p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
                        <i class='fa fa-thin text-primary fa-phone p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
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
                        <i class='fa fa-thin text-primary fa-regular fa-eye p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
                        <i class='fa fa-solid text-primary fa-list p-1 cursor-pointer' style='font-size: 1.4rem;'></i>
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

    // Search begin //
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
    // Search end //
})
