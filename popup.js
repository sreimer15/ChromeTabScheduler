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
    // Creates a new window to open the tabs in later
    chrome.windows.create({focused: false}, function(currentWindow){
      var windowId = currentWindow.id
      formData.forEach(function(dataPoint){
        scheduleOpening(dataPoint,windowId);
      });
    }) 
      
    event.preventDefault();
  });

  $('#getCurrentTabsButton').on('click', function(event){
    // get current window in order to close later
    var currentWindowId;
    
    chrome.windows.getCurrent({},function(currentWindow){
      console.log('within currentWindow function')
      console.log(currentWindow.id)
      currentWindowId = currentWindow.id

      // get tabs in order to save them
      chrome.tabs.query({currentWindow: true}, function(tabs){

        tabs.forEach(function(tab){
          var tabTime = tab.time || 3000;
          var tabCategory = $('input[name=activeTabCategory]').val() || 'uncategorized'
          var currentObj = {'url': tab.url, time: tabTime, category: tabCategory };

          console.log(currentObj.category)
          activeTabsArray.push(currentObj);
        })

        // Create a new window for our active tabs array

        chrome.windows.create({focused : true}, function(newWindow){
          var newWindowId = newWindow.id;
          activeTabsArray.forEach(function(dataPoint){
            scheduleOpening(dataPoint,newWindowId);
          });
        });
      });
      event.preventDefault();


      // Close the window once we save all of them
      // Current Problem when we close we lose data
      // chrome.windows.remove(currentWindowId);

    })
    


  })

  console.log('we made it')
  testing = chrome.identity;
  chrome.identity.getAuthToken({interactive: true}, function(token){
    console.log(token, "this is the token")
    return token
  })
  chrome.identity.getProfileUserInfo(function(userInfo){
    console.log(userInfo,'This is the userInfo')
    console.log(userInfo.email)
    console.log(userInfo.id)
  })

  



});

  