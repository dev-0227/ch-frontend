
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
            data: 'patientid',
            render: (data, type, row)=> {
                return row.patientid
            }
        }, {
            data: 'loaddate',
            render: (data, type, row) => {
                return row.loaddate
            }
        }, {
            data: 'loadby',
            render: (data, type, row) => {
                return row.fname + ' ' + row.lname
            }
        }, {
            data: 'loadmethod',
            render: (data, type, row) => {
                return row.loadmethod
            }
        }, {
            data: 'ptseen',
            render: (data, type, row) => {
                return row.sdisplay ? `<div class='ms-2 badge badge-light-success fw-bold fs-4'>True</div>` : `<div class='ms-2 badge badge-light-danger fw-bold fs-4'>False</div>`
            }
        }, {
            data: 'tname',
            render: (data, type, row) => {
                return `
                    <div class='ms-2 fw-bold fs-5 p-1 rounded' style='background-color: ${row.color}10; color: ${row.color}; display: inline-flex; align-items: center;'>${row.tname  ? row.tname : ''}</div>
                `
            }
        }, {
            data: 'reason',
            render: (data, type, row) => {
                return row.reason
            }
        }, {
            data: 'sdisplay',
            render: (data, type, row) => {
                return row.sdisplay
            }
        }, {
            data: 'created_date',
            render: (data, type, row) => {
                return row.created_date ? new Date(row.created_date).toISOString().substr(0, 10) : ''
            }
        }, {
            data: 'newpttype',
            render: (data, type, row) => {
                return row.newpttype
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
