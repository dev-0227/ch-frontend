$(document).ready(function () {
    "use strict";

    function format(inputDate) {
        let date, month, year;
      
        date = inputDate.getDate();
        month = inputDate.getMonth() + 1;
        year = inputDate.getFullYear();
      
          date = date
              .toString()
              .padStart(2, '0');
      
          month = month
              .toString()
              .padStart(2, '0');
      
        return `${date}/${month}/${year}`;
    }

    sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),tname:'diversitylog'}, "ncqapcmh/getrangdateinfobycid", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            let minday = format(new Date(result[0]["MIN(date)"]));
            let maxday = format(new Date(result[0]["MAX(date)"]));
            document.getElementById('range-text').innerText = "Data is loaded from "+minday+" to "+maxday
        } else {
            return $.growl.error({
                message: "Action Failed"
            });
        }
    });
    sendRequestWithToken('POST', localStorage.getItem('authToken'), {tval:'15'}, "ncqapcmh/getdescbycval", (xhr, err) => {
        if (!err) {
            let result = JSON.parse(xhr.responseText)['data'];
            console.log(result)
           
            document.getElementById('gdesc').textContent = result[0].desc
            document.getElementById('f-reportdesc').textContent = result[0].desc
            
        } else {
            return $.growl.error({
                message: "Action Failed"
            });
        }
    });

    var form = $("#example-form");

    form.steps({
        headerTag: "h6",
        bodyTag: "section",
        transitionEffect: "fade",
        titleTemplate: '<span class="step">#index#</span> #title#',
        onInit: function (event, currentIndex, newIndex) {
            // Remove hasDatepicker class from initialized elements and remove the button next to datepicker input
            $('.hasDatepicker').removeClass('hasDatepicker').siblings('.ui-datepicker-trigger').remove();
        
             // reinitialize datepicker, offcourse replace .datepickerfields with your specific datepicker identifier
             $('.start-date').datepicker();
             $('.last-date').datepicker();
             $('.from-date').datepicker();
             $('.to-date').datepicker();
             
        },

        onStepChanging: function(e, currentIndex, newIndex) {
            if(currentIndex == 1){
                $('#diver-tb-body').empty()
                let entry={
                    fromdate: $('.from-date').val(),
                    todate:$('.to-date').val(),
                    gdesc:$('#gdesc').val(),
                    logoch:$('#checklogoaddress').val(),
                    clinicid:localStorage.getItem('chosen_clinic'),
                    tbname:'diversitylog',
                    reptype:$("input[name='repstyle']:checked").val()
                }
                console.log(entry)
                sendRequestWithToken('POST', localStorage.getItem('authToken'), entry, "ncqapcmh/getdiverresultbycid", (xhr, err) => {
                    if (!err) {
                        let result = JSON.parse(xhr.responseText)['data'];
                        console.log(result)
                        document.getElementById('fieldname').innerText = entry.reptype.toUpperCase()
                        for(let i = 0 ; i <result["val1"].length ; i++){
                           
                            $('#diver-tb-body').append("<tr><td>"+result["val1"][i][entry.reptype]+"</td><td>"+result["val1"][i].total
                            +"</td><td>"+(result["val1"][i].total * 100 / result["val2"][0].total).toFixed(2)+"% </td> </tr>")
                        }
                    }
                })
            }
            return true;
        },

        onFinished: function(e, currentIndex) {
            var doc = new jsPDF();          
            var elementHandler = {
                '#ignorePDF': function (element, renderer) {
                    return true;
                }
            };
            var source = document.getElementById("table-div");
            doc.fromHTML(
                source,  15,15,
                {
                    'width': 700,
                    'elementHandlers': elementHandler
                });

                doc.save('sample_file.pdf');
        }
    });

    
   
})