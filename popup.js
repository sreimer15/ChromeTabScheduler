$(document).ready(function(){
  console.log('this is within the popup.js')
  // Defines what Number to append to name of input tag
  var currentNum = 1;
  var activeTabsArray = [];
  var listOfInputtedLinks = [];


  var scheduleOpening = function(urlObject,windowId){
    var currentUrl = urlObject.url
    var relevantTime = urlObject.time

    /* We need to set the active property to false, because once we switch tabs
       The create function does not work anymore.
    */ 

    // if we didn't pass in a  window id then just pass in default
    if (!windowId){
      
      setTimeout(function(){
        chrome.tabs.create({ url : currentUrl , active : false})  
      },relevantTime)  

    } else {
      setTimeout(function(){
        chrome.tabs.create({ url : currentUrl , active : false, windowId: windowId})  
      },relevantTime)  
    }

    

  }

  // Adds more input tags to add more links
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


  // Submits our Form adding time delay to opening our tab+s Opens our 
  $("#linksForm").submit(function(event){
    
    var formData = [];
    
    // Let's get formData from all Links including time, into an array
    
    for (var i = 1; i <= currentNum; i++) {
      newFormData = {'url': $('input[name=link' + i.toString() + ']').val(),
                     'time': $('input[name=time' + i.toString() + ']').val() };

      formData.push(newFormData);
    }

    formData.forEach(function(dataPoint){
      scheduleOpening(dataPoint);
    });
    event.preventDefault();
  });

  $('#getCurrentTabsButton').on('click', function(event){
    chrome.tabs.query({currentWindow: true}, function(tabs){
      console.log('these are your active tabs',tabs)
      console.log('this is the url of the first tab you have', tabs[0].url)

      tabs.forEach(function(tab){
        var tabTime = tab.time || 3000;
        var currentObj = {'url': tab.url, time: tabTime };
        activeTabsArray.push(currentObj);
      })

      // Create a new window for our active tabs array

      chrome.windows.create({focused : true}, function(currentWindow){
        console.log('we made it within the window is',currentWindow);
        console.log('we made it within the currentId of the window is',currentWindow.id);
        var windowId = currentWindow.id;
        activeTabsArray.forEach(function(dataPoint){
          scheduleOpening(dataPoint,windowId);
        });  
          
        
        
      });
      

    });


    event.preventDefault();
  })


});

  