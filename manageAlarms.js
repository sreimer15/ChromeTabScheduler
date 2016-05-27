$(document).ready(function(){
  var storageArea = chrome.storage.sync;
  var activeLinkAlarmsObj;
  var userAlarms;
  var nameAlarmNumber = 0;



  function addAlarmsSection(activeLinkAlarmsObj,inputtedLinkAlarmsObj){
    var activeLinkAlarms = Object.keys(activeLinkAlarmsObj);
    activeLinkAlarms.forEach(function(alarmTime){
      nameAlarmNumber++;
      alarmTime = parseInt(alarmTime);
      
      var convertedAlarmTime = moment(alarmTime).format('MMMM Do YYYY, h:mm:ss A');
      console.log(convertedAlarmTime);
      var container = [
          '<div class="col s6 container">',
            '<h3 id=alarmCategory' + nameAlarmNumber + '></h3>',
            '<h4 name=nameAlarm' + nameAlarmNumber + '>'+ convertedAlarmTime + '</h4>',
              '<button class="deleteAlarm btn waves-effect waves-light" data-alarmname='+ alarmTime.toString() +'>Delete Alarm</button>',
              '<ol class="collection" name=collection' + nameAlarmNumber + '>',
                  '</ol>',
              '</div>'
          ].join(' ');
          // console.log(container,'this is the container')
      $('#activeLinkAlarms').append(container);
      var links = activeLinkAlarmsObj[alarmTime] || [];

      links.forEach(function(linkArray){
        // console.log(linkArray,'this is the linkArray')
        linkArray.forEach(function(link,index){
          if (index === 0){
            var linkCategory = link.category;
            $('#alarmCategory' + nameAlarmNumber).text(linkCategory)  
          }
          var url = link.url;
          var linkDiv = [
                          '<li class="collection-item">',
                          '<a href="'+ url + '">' + url,
                          '</a>',
                          '</li>'
                                ].join(' ')
          // console.log($('ol[name=collection' + nameAlarmNumber + ']'))
          $('ol[name=collection' + nameAlarmNumber + ']').append(linkDiv)
        });
      });    
    });
  };


  storageArea.get(null,function(items){
    // Need to go to our active and inputted Link Queue
    console.log(items,'These are all the items');

    activeLinkAlarmsObj = items.activeLinkQueue;
    inputtedLinkAlarmsObj = items.inputtedLinkQueue;
    console.log('activeLinkAlarmsObj',activeLinkAlarmsObj)

    $('body').on('click','.deleteAlarm', function(event){
      
      var alarmTimeToDelete = $(this).data('alarmname');
      var containerToDelete = $(this).parent();

      storageArea.get('activeLinkQueue', function(items){
        var activeLinkQueue = items.activeLinkQueue;
        delete activeLinkQueue[alarmTimeToDelete];
        storageArea.set({'activeLinkQueue': activeLinkQueue});
        containerToDelete.remove();
        
      })
      
    })

    addAlarmsSection(activeLinkAlarmsObj,inputtedLinkAlarmsObj);
  })

});