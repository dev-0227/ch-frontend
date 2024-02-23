$(document).ready(function () {
  "use strict";
  $('#calendar2').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    defaultDate: new Date(),
    // navLinks: true, // can click day/week names to navigate views
    // businessHours: true, // display business hours
    // editable: true,
    events: [
      {
        title: 'Access',
        start: '2021-06-16',
        end: '2021-06-23',
        color: '#22c865'
      },
      {
        title: 'Documents',
        start: '2021-06-16',
        end: '2021-06-23',
        color: '#5e2dd8'
      },
      {
        title: 'Program Notes',
        start: '2021-06-16',
        end: '2021-06-23',
        color: '#f35e90'
      },
      {
        title: 'Tel',
        start: '2021-06-16',
        end: '2021-06-23',
        color: '#e67e22'
      },
      {
        title: 'Demographics',
        start: '2021-06-16',
        end: '2021-06-23',
        color: '#4453fb'
      },
      {
        title: 'Lab',
        start: '2021-06-16',
        end: '2021-06-23',
        color: '#f44336'
      },
    ]
  });
});
