$(document).ready(function() {
    "use strict";
    // ICD10 Disability Table
    var icd10_disability_table = $('#icd10_disability_table').DataTable({
        "ajax": {
            "url": serviceUrl + "barriers/getICD10",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        "order": [[0, 'asc']],
        "columns": [
            { data: 'id'},
            { data: 'disability_category_id'},
            { data: 'icd10'},
            { data: 'description_short'},
            { data: 'description_long'},
            { data: 'id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge icd10_edit_btn" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge icd10_del_btn" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#icd10_disability_search_input').on('keyup', function () {
        icd10_disability_table.search(this.value).draw();
    });
    
    $(document).on('click', '#add_icd10_btn', function() {
        $('#icd10_add_modal').modal('show');
        
        let entry = {};
        let content = "";
        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/getDisabilityCategoryItem", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                result.forEach(r => {                   
                    content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
                }); 
                console.log(content);  
                $('#select_category').html(content);
                
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#save_icd10_btn', function() {
        var id = $('#add_icd10_id').val();
        var category_id = $('#select_category').val();
        var icd10 = $('#add_icd10_icd10').val();
        var short = $('#add_icd10_short').val();
        var long = $('#add_icd10_long').val();

        if (id == '' ||icd10 == '' || short == '' || long == '') {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                id: id,
                category_id: category_id,
                icd10: icd10, 
                short: short,
                long: long
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/addICD10", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        icd10_disability_table.ajax.reload();
                    }, 1000 );
                    $('#add_icd10_id').val('');
                    $('#add_icd10_icd10').val('');
                    $('#add_icd10_short').val('');
                    $('#add_icd10_long').val('');
                    $('#icd10_add_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".icd10_del_btn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/delICD10", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        icd10_disability_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.icd10_edit_btn', function() {

        $('#icd10_edit_modal').modal('show');
        
        let en = {};
        let content = "";
        
        sendRequestWithToken('POST', localStorage.getItem('authToken'), en, "barriers/getDisabilityCategoryItem", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];    
                result.forEach(r => {                   
                    content += '<option value="'+ r.id +'">' + r.display + '</option>';                                        
                }); 
                console.log(content);  
                $('#edit_select_category').html(content);
                
            } else {
                return toastr.error("Action Failed");
            }
        });
        

        let entry = {
            id: $(this).parent().attr("idkey"),
        }
       

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/getICD10ById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_icd10_id').val(result[0]['id']);                
                $('#edit_select_category').val(result[0]['disability_category_id']).trigger('change');                
                $('#edit_icd10_icd10').val(result[0]['icd10']);
                $('#edit_icd10_short').val(result[0]['description_short']);               
                $('#edit_icd10_long').val(result[0]['description_long']);    
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#update_icd10_btn', function() {      
        let entry = {
            
            id: $('#edit_icd10_id').val(),          
            category_id: $('#edit_select_category').val(),
            icd10: $('#edit_icd10_icd10').val(),
            short: $('#edit_icd10_short').val(),        
            long: $('#edit_icd10_long').val(),   
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/updateICD10ById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    icd10_disability_table.ajax.reload();
                }, 1000 );
                $('#edit_select_category').val(''),
                $('#edit_icd10_id').val(''),           
                $('#edit_icd10_icd10').val('');
                $('#edit_icd10_short').val('');            
                $('#edit_icd10_long').val('');
                $('#icd10_edit_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });  

    // Disability Category Table
    var disability_category_table = $('#disability_category_table').DataTable({
        "ajax": {
            "url": serviceUrl + "barriers/getDisabilityCategory",
            "type": "GET",
            "headers": { 'Authorization': localStorage.getItem('authToken') }
        },
        "order": [[0, 'asc']],
        "columns": [
            { data: 'id'},
            { data: 'display'},
            { data: '_id',
              render: function (data, type, row) {
                return `
                  <div class="btn-group align-top" idkey="`+row.id+`">
                    <button class="btn btn-sm btn-primary badge category_edit_btn" type="button">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger badge category_del_btn" type="button">
                        <i class="fa fa-trash"></i>
                    </button>
                  </div>
                `
              } 
            }
        ]
    });

    $('#disability_category_search_input').on('keyup', function () {
        disability_category_table.search(this.value).draw();
    });
    
    $(document).on('click', '#addDisabilityCategoryBtn', function() {
        $('#disability_category_add_modal').modal('show');
    });

    $(document).on('click', '#save_category_btn', function() {
        
        var display = $('#add_category_display').val();

        if ( display == '' ) {
            toastr.error("Please enter complete information");
        } else {
            let entry = {
                display: display
            }    
            sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/addDisabilityCategory", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        disability_category_table.ajax.reload();
                    }, 1000 );
                    $('#add_category_display').val('');
                    $('#disability_category_add_modal').modal('hide');
                } else {
                    return toastr.error("Action Failed");
                }
            });
        }        
    });

    $(document).on("click", ".category_del_btn", function() {
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
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/delDisabilityCategory", (xhr, err) => {
                if (!err) {
                    setTimeout( function () {
                        disability_category_table.ajax.reload();
                    }, 1000 );
                } else {
                    return toastr.error("Action Failed");
                }
                });
            }
        });
    });

    $(document).on('click', '.category_edit_btn', function() {
        $('#disability_category_edit_modal').modal('show');

        let entry = {
            id: $(this).parent().attr("idkey"),
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/getDisabilityCategoryById", (xhr, err) => {
            if (!err) {
                let result = JSON.parse(xhr.responseText)['data'];
                $('#edit_category_id').val(result[0]['id']);
                $('#edit_category_display').val(result[0]['display']);               
            } else {
                return toastr.error("Action Failed");
            }
        });
    });

    $(document).on('click', '#update_category_btn', function() {      
        let entry = {       
            id: $('#edit_category_id').val(),
            display: $('#edit_category_display').val(),        
        }

        sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "barriers/updateDisabilityCategoryById", (xhr, err) => {
            if (!err) {
                setTimeout( function () {
                    disability_category_table.ajax.reload();
                }, 1000 );      
                $('#edit_category_id').val('');
                $('#edit_category_display').val('');            
                $('#disability_category_edit_modal').modal('hide');
            } else {
                return toastr.error("Action Failed");
            }
        });
    });  
    
});