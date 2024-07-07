$(document).ready(function() {
    "use strict";
    /* 
    * Payment Method Table
    */
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
});