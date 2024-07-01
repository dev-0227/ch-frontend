
$(document).ready(async function() {

    "use strict"

    // Load All clinics
    await sendRequestWithToken('POST', localStorage.getItem('authToken'), {}, "clinic/getByStatus", (xhr, err) => {
        var options = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value=${item.id}>${item.name}</option>`
            })
        }
        $('#insurance-clinics').html(options)
    })

    await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance/getHedisList", (xhr, err) => {
        var options = ''
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data']
            result.forEach(item => {
                options += `<option value=${item.id}>${item.insName}</option>`
            })
        }
        $('#insurance-insurance').html(options)
    })

    var insTable = $('#insurance-table').DataTable({
        "ajax": {
            "url": serviceUrl + "setting/map/get",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        "processing": true,
        "autoWidth": false,
        "columns": [
           { data: 'insid'},
           { data: 'emrid'},
           { data: 'fhirid'},
           { data: 'clinicid'},
        ]
    })

    $(document).on('change', '#insurance-clinics', (e) => {
        console.log(e.target.value)
    })
})
