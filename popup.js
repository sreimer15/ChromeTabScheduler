$(document).ready(function(){
  $('.modal-trigger').leanModal();
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
  var periodicInterval;

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
  
  // testIfNewUser();


  var getTitleFromUrl = function(currentUrl,cb){
    // For this we need to parse out the http:// part
    // But we want https:// for our urls
    // So we want to make sure we are using https:// on inputted links
    // And we want to take out the https:// before it gets here
    $.ajax({
          url: "http://textance.herokuapp.com/title/" + currentUrl,
          complete: function(data) {
            var title = data.responseText;
            cb(title);
          }
    });
  }

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
    var linkInput = [ "<input placeholder='Input Link'",
                       "name=link" + currentNum.toString(),
                       "</input>"
                    ]
    var timeInput = [
                  '<input placeholder="When to Open? (Buttons Change Time Unit)"',
                  'name=time' + currentNum.toString(),
                  'type="number"></input>'
                    ]

    var categoryInput = [
                        '<input placeholder="Add a Category" ',
                        'name="inputtedTabCategory' + currentNum.toString() + '"></input>'
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
    categoryInput = categoryInput.join(' ')
    timeSpanInput = timeSpanInput.join(' ')


    $("#addMoreSection").append(linkInput)
    $("#addMoreSection").append(timeInput)
    $("#addMoreSection").append(categoryInput)
    $("#addMoreSection").append(timeSpanInput)       
  });

  $(document).on('click', '.timeSpanChanger', function(event){
    // Get the data point
    var timeSpanSelector = $(this).text().toLowerCase();
    // Find the exact link to change
    var dataIndexNumber = $(this).data('indexnumber');
    // Update link's time category
    $('div[name=timespancategory' + dataIndexNumber + ']' ).data('timespancategory', timeSpanSelector)
    event.preventDefault();
  })

  // Submits our Form adding time delay to opening our tab+s Opens our 
  $("#linksForm").submit(function(event){
    $('#schedulingModal').openModal();
    
    $(".modalButton").on('click',function(event){
      var periodicInterval;
      var formData = [];
      periodicInterval = $(this).data('interval');

      // Let's get formData from all Links including time, into an array
      for (var i = 1; i <= currentNum; i++) {
        // Get the appropriate data from our input tags
        var timeFlag         = $('div[name=timespancategory' + i.toString() + ']' ).data('timespancategory'),
            currentCategory  = $('input[name=inputtedTabCategory' + i.toString() + ']').val() || "uncategorized",
            currentTime      = $('input[name=time' + i.toString() + ']').val() * timeObject[timeFlag] + Date.now(),
            currentUrl       = $('input[name=link' + i.toString() + ']').val();

        // We should convert to HTTPS
        var urlToGetTitle = currentUrl.replace(/.*?:\/\//g, "");

        getTitleFromUrl(urlToGetTitle, function(title){
          var newFormData = {'url': currentUrl, 'time': currentTime, 'category': currentCategory, 'title': title, 'periodicInterval': periodicInterval };
          formData.push(newFormData);
        })  

      }

    $('#schedulingModal').closeModal();
    Materialize.toast('Tabs Saved', 2000)
    chrome.runtime.sendMessage({"message": "inputted_tabs", activeTabsArray: formData});

    })

    
    // chrome.runtime.sendMessage is an async process so our data is correct even though scoping
    // Would imply that formData wouldn't have meaning yet
    
    
    event.preventDefault();
  });

  $('#getCurrentTabsButton').on('click', function(event){
    // get current window in order to close later
    var currentWindowId;
    
    chrome.windows.getCurrent({},function(currentWindow){
      var activeTabsArray = [];
      currentWindowId = currentWindow.id;
      
      $('#schedulingModal').openModal();

      $(".modalButton").on('click',function(event){
        periodicInterval = $(this).data('interval');

        // Probably want a toast here
        // get tabs in order to save them
        chrome.tabs.query({currentWindow: true}, function(tabs){
          var timeFlag = timeFlag = $('div[name=timespancategoryActiveTabs]' ).data('timespancategory');
          var tabTime = $('input[name=activeTabsTime]').val() * timeObject[timeFlag] + Date.now() || 3000;

          tabs.forEach(function(tab){
            var tabCategory = $('input[name=activeTabCategory]').val() || 'uncategorized';

            var currentObj = {'url': tab.url, time: tabTime, category: tabCategory, 'title': tab.title, 'periodicInterval': periodicInterval };
            activeTabsArray.push(currentObj);
          })        
          // {time: time, url: url,  category: category}
            // add an auto fill with categories that already exist

          // Send message to our background
          chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray, "timing": tabTime});

          // Create a new window for our active tabs array
        // Close the window once we save all of them
        // Current Problem when we close we lose data
        
        // Bind the modalButtons

         Materialize.toast('Tabs Saved', 1000) 
        $('#schedulingModal').closeModal();
        chrome.windows.remove(currentWindowId);
      })

      })
    });
    event.preventDefault();
  });

  // var linkObject = {'categories': [], 'timedLinks': activeTabsArray }

  // If we want to use auth Tokens we need to register our app
  // chrome.identity.getAuthToken({interactive: true}, function(token){
  //
  //   return token
  // })

  // $('#testButton').on('click',function(event){
  //   var activeTabsArray = [{'time': Date.now() + 3000, 'url': 'http://www.reddit.com', 'category': 'distraction'},
  //                          {'time': Date.now() + 3000, 'url': 'http://www.reddit.com', 'category': 'uncategorized'}
  //                         ]
  //   chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray, "timing": Date.now() + 3000 });
  //   event.preventDefault();
  // })

  $("#categoriesViewButton").on('click',function(event){
    categoriesPage = chrome.extension.getURL("categories.html")
    chrome.tabs.create({'url': categoriesPage},function(tab){
    })
    event.preventDefault();
  })

  $("#alarmsViewButton").on('click',function(event){
    alarmsPage = chrome.extension.getURL("manageAlarms.html")
    chrome.tabs.create({'url': alarmsPage},function(tab){
    })
    event.preventDefault();
  })

  $("#clearAllPeriodicAlarms").on('click', function(event){
    // Bad practice or not we are only getting the first link's periodic element so we can just remove hte first one
    storageArea.get('activeLinkQueue', function(activeLinkQueue){
      activeLinkQueue = activeLinkQueue.activeLinkQueue;
      var copy = activeLinkQueue;
      copy[0][0].periodicInterval = "none";
      storageArea.set({"activeLinkQueue": copy })
    })
  })
  // Set up the modalButton
  

  chrome.identity.getProfileUserInfo(function(userInfo){
    currentIdentity = userInfo.id
  })
  // Add to Timed Tabs

  
  // This should get fromStorageArea
  storageArea.get('identity', function(items){
  })


  function update() {
    var timeFlag = timeFlag = $('div[name=timespancategoryActiveTabs]' ).data('timespancategory');
    var tabTime = $('input[name=activeTabsTime]').val() * timeObject[timeFlag] + Date.now() || 3000;
    console.log(tabTime);

    $('#clock').html( moment(tabTime).format('MMMM Do YYYY, h:mm:ss A'));

  }

  setInterval(update, 1000);

  $('')


  

});

  