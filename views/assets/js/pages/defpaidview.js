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
  let totalamount = 0;
  let totalvisits = 0;
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
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getInsamount", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var amountdata = [];
      var insNamedata = [];
      for(var i = 0;i < result.length;i++){
        insNamedata.push(result[i]['InsName'] == "zzzname"?"Unknown":result[i]['InsName'].substring(0,10));
        amountdata.push(result[i]['amount']);
        totalamount += result[i]['amount'];
      }
      $("#totalamount").html(totalamount);
      $("#totalins").html(result.length);
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
      var chart = document.getElementById('amountbyins');
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
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getTotalvisitpts", (xhr, err) => {
    if (!err) {
      let visits = JSON.parse(xhr.responseText)['visits'];
      let pts = JSON.parse(xhr.responseText)['pts'];
      $("#totalvisits").html(visits[0]['visitcnt']);
      $("#totalpts").html(pts[0]['ptcnt']);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getVisitsPTs", (xhr, err) => {
    if (!err) {
      let visits = JSON.parse(xhr.responseText)['visits'];
      let pts = JSON.parse(xhr.responseText)['pts'];
      var visitcnt = [];
      var ptcnt = [];
      var insNamedata = [];
      var markvdata = [];
      var markpdata = [];
      for(var i = 0;i < visits.length;i++){
        insNamedata.push(visits[i]['InsName'] == "zzzname"?"Unknown":visits[i]['InsName'].substring(0,10));
        visitcnt.push(visits[i]['visitcnt']);
        ptcnt.push(pts[i]['ptcnt']);
        markvdata.push({yAxis:visits[i]['visitcnt'],xAxis:i});
        markpdata.push({yAxis:pts[i]['ptcnt'],xAxis:i});
        totalvisits += visits[i]['visitcnt'];
        totalpts += pts[i]['ptcnt'];
      }
      var chartdata = [{
        name: 'Visits',
        type: 'line',
        data: visitcnt,
        smooth: true,
        markPoint: {
          data: markvdata
        }
      },
      {
        name: 'Patients',
        type: 'line',
        data: ptcnt,
        smooth: true,
        markPoint: {
          data: markpdata
        }
      }];
      var chart = document.getElementById('countbyvisitandpt');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '40',
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
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getGroupamount", (xhr, err) => {
    if (!err) {
      let groupamount = JSON.parse(xhr.responseText)['groupamount'];
      let groupamountbyins = JSON.parse(xhr.responseText)['groupamountbyins'];
      var amountdata = [];
      var groups = [];
      for (const [key, value] of Object.entries(groupamount)) {
        groups.push(key);
        amountdata.push(value);
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
      var chart = document.getElementById('groupamount');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: groups,
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
      var tmpgroupinscnt = 0;
      for (const [key, value] of Object.entries(groupamountbyins)) {
        tmpgroupinscnt ++;
        $("#groupsbyinsarea").append(`
            <div class="col-md-4 mt-4">
              <h6 class="text-center text-muted">`+key+`</h6>
              <div id="`+tmpgroupinscnt+`_groupbyins" style="width: 100%;height: 200px;"></div>
            </div>
        `);
        var amountdata = [];
        var groupbyins = [];
        for(var i = 0;i < value.length;i++){
          groupbyins.push(value[i]['group']);
          amountdata.push(value[i]['amount']);
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
        var chart = document.getElementById(tmpgroupinscnt+'_groupbyins');
        var barChart = echarts.init(chart);
        var option = {
          grid: {
            top: '20',
            right: '20',
            bottom: '20',
            left: '50',
          },
          xAxis: {
            data: groupbyins,
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
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getsubGroupamount", (xhr, err) => {
    if (!err) {
      let subgroupamount = JSON.parse(xhr.responseText)['data'];
      subgroupsbyinsarea
      var tmpsubgroupcnt = 0;
      for (const [key, value] of Object.entries(subgroupamount)) {
        tmpsubgroupcnt ++;
        $("#subgroupsbyinsarea").append(`
            <div class="col-md-6 mt-4">
              <h6 class="text-center text-muted">`+key+`</h6>
              <div id="`+tmpsubgroupcnt+`_subgroup" style="width: 100%;height: 200px;"></div>
            </div>
        `);
        var amountdata = [];
        var subgroup = [];
        for(var i = 0;i < value.length;i++){
          subgroup.push(value[i]['subgroup']);
          amountdata.push(value[i]['amount']);
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
        var chart = document.getElementById(tmpsubgroupcnt+'_subgroup');
        var barChart = echarts.init(chart);
        var option = {
          grid: {
            top: '20',
            right: '20',
            bottom: '20',
            left: '50',
          },
          xAxis: {
            data: subgroup,
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
      }
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
  await sendRequestWithToken('POST', localStorage.getItem('authToken'), {clinicid:localStorage.getItem('chosen_clinic'),sdate:$("#sdate").html(),edate:$("#edate").html()}, "paid/getBestCPT", (xhr, err) => {
    if (!err) {
      let result = JSON.parse(xhr.responseText)['data'];
      var amountdata = [];
      var cptdata = [];
      for(var i = 0;i < result.length;i++){
        cptdata.push(result[i]['CPT']);
        amountdata.push(result[i]['amount']);
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
      var chart = document.getElementById('bestcptcode');
      var barChart = echarts.init(chart);
      var option = {
        grid: {
          top: '20',
          right: '20',
          bottom: '20',
          left: '50',
        },
        xAxis: {
          data: cptdata,
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
        color: ['#09ad95']
      };
      barChart.setOption(option);
    } else {
      return $.growl.error({
        message: "Action Failed"
      });
    }
  });
});
