function DateFormat(serial) {
  let year = serial.getFullYear();
  let month = serial.getMonth() + 1;
  let dt = serial.getDate();

  if (dt < 10) {
      dt = '0' + dt;
  }
  if (month < 10) {
      month = '0' + month;
  }
  return month+'/'+dt+'/'+year;
}
$(document).ready(async function () {
  "use strict";

  sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic')}, "setting/getClinic", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText);
      $(".clinic-title").html(result['clinic']);
      $(".clinic-addr").html(result['address']+" "+result['city']+" "+result['state']+" "+result['zip']+" "+result['phone']);
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  sendRequestWithToken('GET', localStorage.getItem('authToken'), {}, "paid/getdesc", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      $(".paid-desc").html(result[0]['desc']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getpcpview", (xhr, err) => {
    if (!err) {
      let pcptotal = JSON.parse(xhr.responseText)['pcptotal'];
      let pcppts = JSON.parse(xhr.responseText)['pcppts'];
      let pcpdates = JSON.parse(xhr.responseText)['pcpdates'];
      var pcpname = [];
      var amount = [];
      var visitcnt = [];
      var ptcnt = [];
      var datecnt = [];
      var markamountdata = [];
      var markvisitcntdata = [];
      var markptcntdata = [];
      var markdatecntdata = [];
      for(var i = 0;i < pcptotal.length;i++){
        pcpname.push(pcptotal[i]['pcpname'].trim());
        amount.push(pcptotal[i]['amount']);
        visitcnt.push(pcptotal[i]['visitcnt']);
        ptcnt.push(pcppts[i]['ptcnt']);
        datecnt.push(pcpdates[i]['datecnt']);
        markamountdata.push({yAxis:pcptotal[i]['amount'],xAxis:i});
        markvisitcntdata.push({yAxis:pcptotal[i]['visitcnt'],xAxis:i});
        markptcntdata.push({yAxis:pcppts[i]['ptcnt'],xAxis:i});
        markdatecntdata.push({yAxis:pcpdates[i]['datecnt'],xAxis:i});
      }
      var chartdata = [{
        name: 'PCP FFS Productivity',
        type: 'line',
        data: amount,
        smooth: true,
        markPoint: {
          data: markamountdata
        }
      },
      {
        name: 'PCP Visits',
        type: 'bar',
        data: visitcnt,
        barWidth: 30,
        markPoint: {
          data: markvisitcntdata
        }
      },
      {
        name: 'PCP Unique PTs',
        type: 'bar',
        data: ptcnt,
        barWidth: 30,
        markPoint: {
          data: markptcntdata
        }
      },
      {
        name: 'PCP Working Days',
        type: 'bar',
        data: datecnt,
        barWidth: 30,
        markPoint: {
          data: markdatecntdata
        }
      }];
      var chart = document.getElementById('pcpviewarea');
      var barChart = echarts.init(chart);
      var option = {
        legend: {
          data: ['PCP FFS Productivity', 'PCP Visits','PCP Unique PTs', 'PCP Working Days']
        },
        grid: {
          top: '80',
          right: '50',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: pcpname,
          axisLine: {
            lineStyle: {
              color: 'rgba(119, 119, 142, 0.2)'
            }
          },
          axisLabel: {
            fontSize: 10,
            color: '#77778e'
          }
        },
        tooltip: {
          show: true,
          showContent: true,
          alwaysShowContent: true,
          triggerOn: 'mousemove',
          trigger: 'axis',
          axisPointer: {
            label: {
              show: false,
            }
          }
        },
        yAxis: {
          splitLine: {
            lineStyle: {
              color: 'rgba(119, 119, 142, 0.2)'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(119, 119, 142, 0.2)'
            }
          },
          axisLabel: {
            fontSize: 10,
            color: '#77778e'
          },
          type: 'log',
        },
        series: chartdata,
        color: ['#5e2dd8','#d43f8d','#f7b731','#09ad95'],
      };
      barChart.setOption(option);
      
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
});
