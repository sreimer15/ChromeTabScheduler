$(document).ready(function(){
  console.log('this is within the popup.js')
  // Defines what Number to append to name of input tag
  var currentNum = 1;
  var listOfInputtedLinks = [];
  var storageArea = chrome.storage.sync;
  var timeObject = {
                    'minutes': 1000 * 60,
                    'hours': 1000 * 60 * 60,
                    'days': 1000 * 60 * 60 * 24
                   }
  var currentIdentity;

  var testIfNewUser = function(){
    chrome.identity.getProfileUserInfo(function(userInfo){
      currentIdentity = userInfo.id;
      storageArea.get(currentIdentity, function(items){
        if (!items.keys) {
          chrome.runtime.sendMessage({"message": "new_user", "currentIdentity": currentIdentity });
        }
      })
    });
  };
  
  testIfNewUser();


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
  // Should take timing and open at a certain point in time.
  var handleTiming = function(timing){
    var now = Date.now();
    // Now is simply a number so we can just add our timing in miliseconds
    var secondsToWait = now + timing;
    // Send a message to popup.js to handle the timing, if at some point in time this time = now
      // fire event
  }

  // Adds more input tags to add more links
  $("#addMoreButton").on('click', function(){
    currentNum++;
    var linkInput = [ "<input placeholder='Input Link'",
                       "name=link" + currentNum.toString(),
                       "</input>"
                    ]
    var timeInput = [
                  '<input placeholder="How many seconds from now?"',
                  'name=time' + currentNum.toString(),
                  'type="number"></input>'
                    ]

    var timeSpanInput = [
                        '<div class="row" name="timespancategory' + currentNum.toString() + '" data-timespancategory="minutes">',
                            '<a class="waves-effect waves-light btn col s4 timeSpanChanger" data-indexnumber=' + currentNum.toString() + '>Minutes</a>',
                            '<a class="waves-effect waves-light btn col s4 timeSpanChanger" data-indexnumber=' + currentNum.toString() + '>Hours</a>',
                            '<a class="waves-effect waves-light btn col s4 timeSpanChanger" data-indexnumber=' + currentNum.toString() + '>Days</a>',
                        '</div>'
                        ]


    linkInput = linkInput.join(' ')
    timeInput = timeInput.join(' ')
    timeSpanInput = timeSpanInput.join(' ')

    $("#addMoreSection").append(linkInput)
    $("#addMoreSection").append(timeInput)
    $("#addMoreSection").append(timeSpanInput)       
  });

  $(document).on('click', '.timeSpanChanger', function(event){
    // Get the data point
    var timeSpanSelector = $(this).text().toLowerCase();
    // Find the exact link to change
    var dataIndexNumber = $(this).data('indexnumber');
    console.log(dataIndexNumber,'This is from ActiveTabs Category');
    // Update link's time category
    $('div[name=timespancategory' + dataIndexNumber + ']' ).data('timespancategory', timeSpanSelector)
    event.preventDefault();
  })

  // Submits our Form adding time delay to opening our tab+s Opens our 
  $("#linksForm").submit(function(event){
    var formData = [];
    // Let's get formData from all Links including time, into an array
    for (var i = 1; i <= currentNum; i++) {
      // Get the appropriate data from our input tags
      var timeFlag         = $('div[name=timespancategory' + i.toString() + ']' ).data('timespancategory'),
          currentCategory  = $('input[name=inputtedTabCategory' + i.toString() + ']').val() || "uncategorized",
          currentTime      = $('input[name=time' + i.toString() + ']').val() * timeObject[timeFlag] + Date.now(),
          currentUrl       = $('input[name=link' + i.toString() + ']').val();

      var newFormData = {'url': currentUrl, 'time': currentTime, 'category': currentCategory };
      formData.push(newFormData);
    }

    chrome.runtime.sendMessage({"message": "inputted_tabs", activeTabsArray: formData});

    // chrome.windows.create({focused: false}, function(currentWindow){
    //   var windowId = currentWindow.id
    //   formData.forEach(function(dataPoint){
    //     scheduleOpening(dataPoint,windowId);
    //   });
    // }) 
      
    event.preventDefault();
  });

  $('#getCurrentTabsButton').on('click', function(event){
    // get current window in order to close later
    var currentWindowId;
    
    chrome.windows.getCurrent({},function(currentWindow){
      console.log('within currentWindow function')
      console.log(currentWindow.id)
      var activeTabsArray = [];
      currentWindowId = currentWindow.id;

      // get tabs in order to save them
      chrome.tabs.query({currentWindow: true}, function(tabs){
        var timeFlag = timeFlag = $('div[name=timespancategoryActiveTabs]' ).data('timespancategory');
        var tabTime = $('input[name=activeTabsTime]').val() * timeObject[timeFlag] + Date.now() || 3000;
        console.log(tabTime)

        tabs.forEach(function(tab){
          var tabCategory = $('input[name=activeTabCategory]').val() || 'uncategorized'
          var currentObj = {'url': tab.url, time: tabTime, category: tabCategory };
          activeTabsArray.push(currentObj);
        })        
        // {time: time, url: url,  category: category}
          // add an auto fill with categories that already exist

        // Send message to our background
        console.log(activeTabsArray)
        console.log(tabTime)
        chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray, "timing": tabTime});

        // Create a new window for our active tabs array
      // Close the window once we save all of them
      // Current Problem when we close we lose data
      chrome.windows.remove(currentWindowId);
      
      })
    });
    event.preventDefault();
  });

  // var linkObject = {'categories': [], 'timedLinks': activeTabsArray }

  // If we want to use auth Tokens we need to register our app
  // chrome.identity.getAuthToken({interactive: true}, function(token){
  //   console.log(token, "this is the token")
  //   return token
  // })

  $('#testButton').on('click',function(event){
    var activeTabsArray = [{'time': Date.now() + 3000, 'url': 'http://www.reddit.com', 'category': 'distraction'},
                           {'time': Date.now() + 3000, 'url': 'http://www.reddit.com', 'category': 'uncategorized'}
                          ]
    chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray, "timing": Date.now() + 3000 });
    console.log('testButton works')
    event.preventDefault();
  })

  chrome.identity.getProfileUserInfo(function(userInfo){
    console.log(userInfo,'This is the userInfo')
    console.log(userInfo.email)
    console.log(userInfo.id)
    currentIdentity = userInfo.id
  })
  // Add to Timed Tabs

  
  // This should get fromStorageArea
  storageArea.get('identity', function(items){
    console.log('these are the items',items)
  })

  // Add to Category Tabs

  



});

  