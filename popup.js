$(document).ready(function(){
  console.log('this is within the popup.js')
  // Defines what Number to append to name of input tag
  var currentNum = 1;

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
    
    var formData = {};
    var listOfLinks =[];
    // Let's get formData from all Links including time
    

    var formData = {
      'url': $('input[name=link' + "1" +']').val(),
      'time': $('input[name=time' + "1" +']').val()
    }
    
    var scheduleOpening = function(urlObject){
      console.log(urlObject);
      var currentUrl = urlObject.url
      var relevantTime = urlObject.time

    setTimeout(function(){
      chrome.tabs.create({ url : currentUrl})  
    },relevantTime)

    }

   scheduleOpening(formData);

    event.preventDefault();
  });

});

  