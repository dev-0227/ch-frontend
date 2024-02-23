$(document).ready(function () {
  "use strict";


  // var d = new Date($("#edate").val());
  // [d.getFullYear(),d.getMonth()+1, d.getDate()+1, ].join('/')
 
  $('#logtable').DataTable({
    "ajax": {
        "url": serviceUrl + "audit_event/logger",
        "type": "POST",
        "headers": { 'Authorization': localStorage.getItem('authToken') },
        "data": {
          clinicid:localStorage.getItem('chosen_clinic'),
          sdate:$("#sdate").val(),
          edate:$("#edate").val()
        }
    },
    "columns": [
        
      { data: 'u_email' },
      { data: 'pt_fname',
        render: function (data, type, row) {
          return row.pt_fname?row.pt_fname+" "+row.pt_lname:"";
        }  
      },
      { data: "type",
        render: function (data, type, row) {
          return row.description?row.description:row.type+" "+row.subtype;
        } 
      },
      { data: 'outcome',
        render: function (data, type, row) {
          var color = 'primary';
          switch(row.action){
            case 'Create': color = 'warning'; break;
            case 'Update': color = 'primary'; break;
            case 'Execute': color = 'success'; break;
            case 'Read': color = 'info'; break;
            case 'Delete': color = 'danger'; break;
          }
            return "<span class='tag tag-"+color+"'>"+row.action+"</span>";
          
        } 
      },
      { data: 'outcome',
        render: function (data, type, row) {
          var color = 'primary';
          switch(row.outcome){
            case 'success': color = 'green'; break;
            case 'fatal': color = 'primary'; break;
            case 'error': color = 'danger'; break;
            case 'information': color = 'info'; break;
            case 'warning': color = 'warning'; break;
          }
            return "<span class='tag tag-"+color+"'>"+row.outcome+"</span>";
          
        } 
      },
        { data: 'time',
            render: function (data, type, row) {
              if(row.time){
                return row.time.replace('T', ' ').substr(0, 19);
              }else{
                return '';
              }
              
            }  
        }
    ]
  });
  
});
