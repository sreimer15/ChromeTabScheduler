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
  var handleTiming = function(timing,url){
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
      timeFlag = $('div[name=timespancategory' + i.toString() + ']' ).data('timespancategory');
      console.log(timeFlag)
      newFormData = {'url': $('input[name=link' + i.toString() + ']').val(),
                     'time': $('input[name=time' + i.toString() + ']').val() * timeObject[timeFlag] };
      formData.push(newFormData);
    }
    // Our scheduling is now in minutes.
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
      var activeTabsArray = [];
      currentWindowId = currentWindow.id;

      // get tabs in order to save them
      chrome.tabs.query({currentWindow: true}, function(tabs){
        tabs.forEach(function(tab){
          var tabTime = $('input[name=timespancategoryActiveTabs]').val() || 3000;
          console.log(tabTime)
          var tabCategory = $('input[name=activeTabCategory]').val() || 'uncategorized'
          var currentObj = {'url': tab.url, time: tabTime, category: tabCategory };
          console.log(currentIdentity,'This should have scope')

          activeTabsArray.push(currentObj);

        })        
        // {time: time, url: url,  category: category}
          // add an auto fill with categories that already exist

        // Send message to our background
        chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray});



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
  });

  // var linkObject = {'categories': [], 'timedLinks': activeTabsArray }

  // If we want to use auth Tokens we need to register our app
  // chrome.identity.getAuthToken({interactive: true}, function(token){
  //   console.log(token, "this is the token")
  //   return token
  // })

  $('#testButton').on('click',function(event){
    var activeTabsArray = [{'time': 3000, 'url': 'http://www.reddit.com', 'category': 'distraction'},
                           {'time': 3000, 'url': 'http://www.reddit.com', 'category': 'uncategorized'}
                          ]
    chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray });
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

  