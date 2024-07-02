
var _selectedid = 0

$(document).ready(async function() {
  'use strict'

  await sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "insurance/", (xhr, err) => {
    var options = ''
    if (!err) {
        let result = JSON.parse(xhr.responseText)['data']
        result.forEach(item => {
            options += `<option value=${item.id}>${item.insName}</option>`
        })
    }
    $('#lob-insurance').html(options)
    $('#lob-insurance').val(0).trigger('change')
  })

  var lobTable = $('#lob-table').DataTable({
    'ajax': {
      'url': serviceUrl + 'insurance/lob/list',
      'type': 'GET',
      'headers': { 'Authorization': localStorage.getItem('authToken') },
      'data': function(d) {
        d.insid = $('#lob-insurance').val()
      }
    },
    'order': [[3, 'asc']],
    'columns': [{
      data: 'lob'
    }, {
      data: 'description'
    }, {
      data: 'type'
    }, {
      data: 'variation'
    }, {
      data: 'id',
      render: function (data, type, row) {
        return `
          <div class="btn-group align-top " idkey="`+row.id+`">
            <button class="btn  btn-primary badge edit-button" data-toggle="modal" type="button" data-type="`+row.id+`"><i class="fa fa-edit"></i> Edit</button>
            <button class="btn  btn-danger badge delete-button" type="button"><i class="fa fa-trash"></i> Delete</button>
          </div>
        `
      } 
    }]
  })

  $(document).on('change', '#lob-insurance', () => {
    lobTable.ajax.reload()
  })

  $('#lob-add-button').click(() => {
    if ($('#lob-insurance').val() == null) return

    $('#lob-edit-type').val('1')

    $('#lob-add-title').text('Add New Insurance Lob')

    $('#lob-add-name').val('')
    $('#lob-add-desc').val('')
    $('#lob-add-type').val(0).trigger('change')
    $('#lob-add-var').val('')

    $('#lob-add-modal').modal('show')
  })

  $(document).on('click', '.edit-button', function() {
    $('#lob-edit-type').val('0')

    $('#lob-add-title').text('Edit Insurance Lob')

    _selectedid = $(this).parent().attr('idkey')
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: _selectedid}, 'insurance/chosenlob', (xhr, err) => {
      if (!err) {
        var result = JSON.parse(xhr.responseText)['data']
        if (result.length) {
          $('#lob-add-name').val(result[0].lob)
          $('#lob-add-desc').val(result[0].description)
          $('#lob-add-type').val(result[0].type).trigger('change')
          $('#lob-add-var').val(result[0].variation)

          $('#lob-add-modal').modal('show')
        }
      }
    })
  })

  $('#lob-add-save').click(() => {
    var type = $('#lob-edit-type').val()
    var entry = {
      id: _selectedid,
      insid: $('#lob-insurance').val(),
      name: $('#lob-add-name').val(),
      desc: $('#lob-add-desc').val(),
      type: $('#lob-add-type').val(),
      variation: $('#lob-add-var').val()
    }
    if (entry.type == null || entry.type == '0') {
      toastr.warning('Please Select Type')
      return
    }

    if (type == '1') {
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/addlob', (xhr, err) => {
        if (!err) {
          toastr.success('Success!')
        } else {
          toastr.error('Action failed!')
        }
        $('#lob-add-modal').modal('hide')
        lobTable.ajax.reload()
      })
    } else if (type = '0') {
      sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, 'insurance/updatelob', (xhr, err) => {
        if (!err) {
          toastr.success('Success!')
        } else {
          toastr.error('Action failed!')
        }
        $('#lob-add-modal').modal('hide')
        lobTable.ajax.reload()
      })
    }
  })

  $(document).on('click', '.delete-button', function() {
    var id = $(this).parent().attr('idkey')
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
        sendRequestWithToken('POST', localStorage.getItem('authToken'), {id: id}, 'insurance/deletelob', (xhr, err) => {
          if (!err) {
            toastr.success('Success!')
          } else {
            toastr.error('Action Failed!')
          }
          lobTable.ajax.reload()
        })
      }
    })
  })
})
