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
  var totalamount = 0;
  var totalvisitcnt = 0;
  let totalpts = 0;

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
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/gettopins", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var amountdata = [];
      var insNamedata = [];
      for(var i = 0;i < result.length;i++){
        totalamount += result[i]['amount'];
      }
      for(var i = 0;i < 10;i++){
        insNamedata.push(result[i]['InsName'] == "zzzname"?"Unknown":result[i]['InsName']);
        amountdata.push(Math.round(result[i]['amount']/totalamount*100));
      }
      var chartdata = [{
        name: 'Percentage',
        type: 'bar',
        data: amountdata,
        barWidth: 20,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      }];
      var chart = document.getElementById('topinslist');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: insNamedata,
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
          }
        },
        series: chartdata,
        color: ['#3274f8']
      };
      barChart.setOption(option);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/gettopinsclaim", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var amountdata = [];
      var insNamedata = [];
      for(var i = 0;i < result.length;i++){
        totalvisitcnt += result[i]['visitcnt'];
      }
      for(var i = 0;i < 10;i++){
        insNamedata.push(result[i]['InsName'] == "zzzname"?"Unknown":result[i]['InsName']);
        amountdata.push(Math.round(result[i]['visitcnt']/totalvisitcnt*100));
      }
      var chartdata = [{
        name: 'Percentage',
        type: 'bar',
        data: amountdata,
        barWidth: 20,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      }];
      var chart = document.getElementById('topinsclaimlist');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: insNamedata,
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
          }
        },
        series: chartdata,
        color: ['#d43f8d']
      };
      barChart.setOption(option);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/gettopinspts", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      let pts = JSON.parse(xhr.responseText)['total'];
      totalpts = pts[0]["ptcnt"];
      var amountdata = [];
      var insNamedata = [];
      for(var i = 0;i < 20;i++){
        insNamedata.push(result[i]['InsName'] == "zzzname"?"Unknown":result[i]['InsName']);
        amountdata.push(Math.round(result[i]['ptcnt']/totalpts*100)==0?1:Math.round(result[i]['ptcnt']/totalpts*100));
      }
      var chartdata = [{
        name: 'Percentage',
        type: 'bar',
        data: amountdata,
        barWidth: 20,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      }];
      var chart = document.getElementById('topinsptlist');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: insNamedata,
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
          }
        },
        series: chartdata,
        color: ['#5e2dd8']
      };
      barChart.setOption(option);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getavgpcppayment", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var amountdata = [];
      var pcpnamedata = [];
      var avgamountdata = [];
      var avgvisitdata = [];
      for(var i = 0;i < result.length;i++){
        pcpnamedata.push(result[i]['pcpname'].trim());
        amountdata.push(Math.round(result[i]['amount']/result[i]['visitcnt'])==0?1:Math.round(result[i]['amount']/result[i]['visitcnt']));
        avgamountdata.push(Math.round(result[i]['amount']/totalamount*100)==0?1:Math.round(result[i]['amount']/totalamount*100));
        avgvisitdata.push(Math.round(result[i]['visitcnt']/totalvisitcnt*100)==0?1:Math.round(result[i]['visitcnt']/totalvisitcnt*100));
      }
      var chartdata = [{
        name: 'Average PCP Payment Per Visit',
        type: 'bar',
        data: amountdata,
        barWidth: 20,
        label: {
          normal: {
            formatter: '${c}',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      }];
      var chart = document.getElementById('avgpcppayment');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: pcpnamedata,
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
          }
        },
        series: chartdata,
        color: ['#f7b731']
      };
      barChart.setOption(option);


      var chartdata = [{
        name: 'Percentage Reimbursement',
        type: 'bar',
        barWidth: 20,
        data: avgamountdata,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      },
      {
        name: 'Percentage Visits',
        type: 'bar',
        barWidth: 20,
        data: avgvisitdata,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      }];
      var chart = document.getElementById('pcpreimvisit');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: pcpnamedata,
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
          type: 'log'
        },
        series: chartdata,
        color: ['#5e2dd8','#d43f8d','#f7b731'],
      };
      barChart.setOption(option);

    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getpcppts", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      let pts = JSON.parse(xhr.responseText)['total'];
      totalpts = pts[0]["ptcnt"];
      var amountdata = [];
      var pcpnamedata = [];
      for(var i = 0;i < result.length;i++){
        pcpnamedata.push(result[i]['fullname'].trim());
        amountdata.push(Math.round(result[i]['ptcnt']/totalpts*100)==0?1:Math.round(result[i]['ptcnt']/totalpts*100));
      }
      var chartdata = [{
        name: 'Percentage',
        type: 'bar',
        data: amountdata,
        barWidth: 20,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      }];
      var chart = document.getElementById('pcppts');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: pcpnamedata,
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
          }
        },
        series: chartdata,
        color: ['#5e2dd8']
      };
      barChart.setOption(option);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getprenpvisits", (xhr, err) => {
    if (!err) {
      let pcpannnptotal = JSON.parse(xhr.responseText)['pcpannnptotal'];
      let pcpnptotal = JSON.parse(xhr.responseText)['pcpnptotal'];
      var pcpnamedata = [];
      var npdata = [];
      var anndata = [];
      var totalnpvisitbypcp = 0;
      for(var i = 0;i < pcpannnptotal.length;i++){
        totalnpvisitbypcp +=pcpannnptotal[i]['visitcnt'];
        pcpnamedata.push(pcpannnptotal[i]['pcpname'].trim());
      }
      for(var i = 0;i < pcpnptotal.length;i++){
        totalnpvisitbypcp +=pcpnptotal[i]['visitcnt'];
      }
      for(var i = 0;i < pcpannnptotal.length;i++){
        npdata.push(Math.round((pcpannnptotal[i]['visitcnt']+pcpnptotal[i]['visitcnt'])/totalnpvisitbypcp*100)==0?1:Math.round((pcpannnptotal[i]['visitcnt']+pcpnptotal[i]['visitcnt'])/totalnpvisitbypcp*100));
        anndata.push(Math.round(pcpannnptotal[i]['visitcnt']/totalnpvisitbypcp*100)==0?1:Math.round(pcpannnptotal[i]['visitcnt']/totalnpvisitbypcp*100));
      }
      
      var chartdata = [{
        name: 'Percentage NP Visits By PCP',
        type: 'bar',
        barWidth: 20,
        data: npdata,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      },
      {
        name: 'Percentage ANN/Wellness Visits By PCP',
        type: 'bar',
        barWidth: 20,
        data: anndata,
        label: {
          normal: {
            formatter: '{c}%',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                  fontWeight: 500
              }
            }
          }
        },
      }];
      var chart = document.getElementById('pcpprenpvisit');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: pcpnamedata,
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
          type: 'log'
        },
        series: chartdata,
        color: ['#5e2dd8','#d43f8d','#f7b731'],
      };
      barChart.setOption(option);

    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getinsbypcp", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var tmppcpcnt = 0;
      for (const [key, value] of Object.entries(result)) {
        tmppcpcnt ++;
        $("#topinsbypcp").append(`
            <div class="col-md-12 mt-4">
              <h6 class="text-center text-muted">Top 10 Ins Reinbursment `+key+`</h6>
              <div id="`+tmppcpcnt+`_topinsbypcp" style="width: 100%;height: 200px;"></div>
            </div>
        `);
        var amountdata = [];
        var insname = [];
        var totalpcpamount = 0;
        for(var i = 0;i < value.length;i++){
          totalpcpamount += value[i]['amount'];
        }
        for(var i = 0;i < 10;i++){
          insname.push(value[i]['InsName'] == "zzzname"?"Unknown":value[i]['InsName']);
          amountdata.push(Math.round(value[i]['amount']/totalpcpamount*100)==0?1:Math.round(value[i]['amount']/totalpcpamount*100));
        }
        var chartdata = [{
          name: 'Amount',
          type: 'bar',
          data: amountdata,
          barWidth: 20,
          label: {
            normal: {
              formatter: '{c}%',
              show: true,
            },
          },
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'top',
                textStyle: {
                    fontWeight: 500
                }
              }
            }
          },
        }];
        var chart = document.getElementById(tmppcpcnt+'_topinsbypcp');
        var barChart = echarts.init(chart);
        var option = {
          grid: {
            top: '20',
            right: '20',
            bottom: '20',
            left: '50',
          },
          xAxis: {
            data: insname,
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
            }
          },
          series: chartdata,
          color: ['#5e2dd8']
        };
        barChart.setOption(option);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/gettoppatients", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var tmpptcnt = 0;
      for (const [key, value] of Object.entries(result)) {
        tmpptcnt ++;
        $("#top10patients").append(`
            <div class="col-md-6 mt-4">
              <h6 class="text-center text-muted">`+key+`</h6>
              <div id="`+tmpptcnt+`_topinsbypt" style="width: 100%;height: 200px;"></div>
            </div>
        `);
        var amountdata = [];
        var insname = [];
        for(var i = 0;i < value.length;i++){
          insname.push(value[i]['InsName'] == "zzzname"?"Unknown":value[i]['InsName']);
          amountdata.push(Math.round(value[i]['amount']));
        }
        var chartdata = [{
          name: 'Amount',
          type: 'bar',
          data: amountdata,
          barWidth: 20,
          label: {
            normal: {
              formatter: '${c}',
              show: true,
            },
          },
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'top',
                textStyle: {
                    fontWeight: 500
                }
              }
            }
          },
        }];
        var chart = document.getElementById(tmpptcnt+'_topinsbypt');
        var barChart = echarts.init(chart);
        var option = {
          grid: {
            top: '20',
            right: '20',
            bottom: '20',
            left: '50',
          },
          xAxis: {
            data: insname,
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
            }
          },
          series: chartdata,
          color: ['#d43f8d']
        };
        barChart.setOption(option);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getbestinsareas", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var tmpareacnt = 0;
      for (const [key, value] of Object.entries(result)) {
        tmpareacnt ++;
        $("#bestinsareas").append(`
            <div class="col-md-6 mt-4">
              <h6 class="text-center text-muted">`+key+`</h6>
              <div id="`+tmpareacnt+`_topinsbyarea" style="width: 100%;height: 200px;"></div>
            </div>
        `);
        var amountdata = [];
        var insname = [];
        var totalamount = 0;
        for(var i = 0;i < value.length;i++){
          totalamount += value[i]['amount'];
        }
        for(var i = 0;i < value.length;i++){
          insname.push(value[i]['InsName'] == "zzzname"?"Unknown":value[i]['InsName']);
          amountdata.push((Math.round(value[i]['amount']/totalamount*100))==0?1:(Math.round(value[i]['amount']/totalamount*100)));
        }
        var chartdata = [{
          name: 'Amount',
          type: 'bar',
          data: amountdata,
          barWidth: 20,
          label: {
            normal: {
              formatter: '{c}%',
              show: true,
            },
          },
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'top',
                textStyle: {
                    fontWeight: 500
                }
              }
            }
          },
        }];
        var chart = document.getElementById(tmpareacnt+'_topinsbyarea');
        var barChart = echarts.init(chart);
        var option = {
          grid: {
            top: '20',
            right: '20',
            bottom: '20',
            left: '50',
          },
          xAxis: {
            data: insname,
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
            }
          },
          series: chartdata,
          color: ['#3274f8']
        };
        barChart.setOption(option);
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
});
