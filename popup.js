$(document).ready(function(){
  console.log('this is within the popup.js')
  // Defines what Number to append to name of input tag
  var currentNum = 1;
  var activeTabsArray = [];
  var listOfInputtedLinks = [];


  $("#addMoreButton").on('click', function(){
    currentNum++;
    console.log(currentNum)
    var linkInput = [ "<input placeholder='Input Link'",
                       "name=link" + currentNum.toString(),
                       "</input>"
                     ]
  var timeInput = [
                  '<input placeholder="How many seconds from now?"',
                  'name=time' + currentNum.toString(),
                  'type="number"></input>'
                  ]

  linkInput = linkInput.join(' ')
  timeInput = timeInput.join(' ')

  $("#addMoreSection").append(linkInput)
  $("#addMoreSection").append(timeInput)
     
  });

  $("#linksForm").submit(function(event){
    
    var formData = [];
    
    // Let's get formData from all Links including time, into an array
    
    for (var i = 1; i <= currentNum; i++) {
      newFormData = {'url': $('input[name=link' + i.toString() + ']').val(),
                     'time': $('input[name=time' + i.toString() + ']').val() };

      formData.push(newFormData);
    }  
   
    
    var scheduleOpening = function(urlObject){
      console.log(urlObject);
      var currentUrl = urlObject.url
      var relevantTime = urlObject.time

      /* We need to set the active property to false, because once we switch tabs
         The create function does not work anymore.
      */ 
      setTimeout(function(){
        chrome.tabs.create({ url : currentUrl , active : false})  
      },relevantTime)

    }

    formData.forEach(function(dataPoint){
      scheduleOpening(dataPoint);
    });  

   

    event.preventDefault();
  });

});

  