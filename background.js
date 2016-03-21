var storageArea = chrome.storage.sync;
var inputtedTabsThreshold = 20;

var handleOpening = function(urlObject,windowId){
  var currentUrl = urlObject.url
  /* We need to set the active property to false, because once we switch tabs
     The create function does not work anymore.
  */ 
  // if we didn't pass in a  window id then just pass in default
  if (!windowId){
      chrome.tabs.create({ url : currentUrl , active : false})
  } else {
      chrome.tabs.create({ url : currentUrl , active : false, windowId: windowId})
  }
};

var handleCategories = function(categories,urlObject){
  var possibleNewCategory = urlObject.category;
  var url = urlObject.url;
  var categoryObject = {"url": url, "read": false}
  if(categories[possibleNewCategory]){
    categories[possibleNewCategory].push(categoryObject)
  } else {
    categories[possibleNewCategory] = [categoryObject];
  }
  return categories
}

var handleTiming = function(previousQueue, newSetOfTabs, timing){
  timing = timing.toString();
  if(previousQueue[timing]){
    previousQueue[timing].push(newSetOfTabs);
  } else {
    previousQueue[timing] = [ newSetOfTabs ]
  }
  return previousQueue;
};

var updateActiveTabs = function(toAddToQueue,timing) {
  storageArea.get(["activeLinkQueue","categories"] , function(items){
    console.log(items);
    // Let's get what is in our queue and add our objects
      // This way saves us the trouble of flattening
    var previousQueue = items.activeLinkQueue;
    var currentCategories = items.categories;
    toAddToQueue.forEach(function(urlObject){
      // urlObject looks like this = {time: time, url: url,  category: category}
      currentCategories = handleCategories(currentCategories,urlObject);
    })
    var newQueue = handleTiming(previousQueue,toAddToQueue,timing);
    console.log(newQueue,'This is when we udpateOur Active Tabs')  
    chrome.alarms.create("activeTabsScheduledOpening" + timing.toString(), {"when": timing})

    var newCategories = currentCategories;
    storageArea.set({ "activeLinkQueue": newQueue });
    storageArea.set({ "categories": newCategories });
  });
};

var updateInputtedTabs = function(toAddToQueue){
  storageArea.get(["inputtedLinkQueue","categories"], function(items){
    console.log(items);
    var previousQueue = items.inputtedLinkQueue;
    var currentCategories = items.categories;
    
    toAddToQueue.forEach(function(urlObject){
      currentCategories = handleCategories(currentCategories,urlObject);
      var currentTime = urlObject.time;
      previousQueue = handleTiming(previousQueue,urlObject,currentTime);
      chrome.alarms.create("inputtedTabsScheduledOpening",{when: currentTime})
    });
    var newCategories = currentCategories;
    var newQueue = previousQueue;

    storageArea.set({ "inputtedLinkQueue": newQueue });
    storageArea.set({ "categories": newCategories });
  });
};

var openActiveLinkTabs = function(activeLinkQueue,triggerTime){
  
  storageArea.get("activeLinkQueue", function(activeLinkQueue){
    console.log(activeLinkQueue)
    activeLinkQueue = activeLinkQueue.activeLinkQueue;
    console.log(activeLinkQueue.triggerTime)
    var linksToOpen = activeLinkQueue[triggerTime];
      linksToOpen.forEach(function(arrayOfTabs){
        // This is an array filled with tabs, if we do have two arrays for a
        // given time we categorize them differently, open them in different windows
        chrome.windows.create({focused : true}, function(newWindow){
          var newWindowId = newWindow.id;
          // tabObject looks like this = {time: time, url: url,  category: category}
          arrayOfTabs.forEach(function(tabObject){
            handleOpening(tabObject,newWindowId)
          });
        });
      });
      // Delete our alarm and update our ActiveLinkQueue
      console.log(alarmName)
      chrome.alarms.clear(alarmName, function(wasCleared){
        // remove from ActiveLinkQueue
        var updatedQueue = activeLinkQueue;
        console.log(updatedQueue,"Prior to Deletion")
        delete updatedQueue[triggerTime.toString()]
        console.log(updatedQueue,"Post Deletion")
        storageArea.set({ "activeLinkQueue": updatedQueue })          
      })
  })
}

// For the Individual Tabs, they will just share a windowId although they have different times.

chrome.runtime.onMessage.addListener(
  function(request,sender,sendResponse){
    console.log('We are in background.js')
    if(request.message === "new_user"){
      console.log(sender)
      var currentIdentity = request.currentIdentity
      storageArea.set({"activeLinkQueue": {}, "categories": { "uncategorized": [] },
                       "currentIdentity": currentIdentity, "inputtedLinkQueue": {},
                       "inputtedTabWindow": undefined });
    }
    // We want to associate by the message not time, the message defines what window they exist in
      // Let's have an object with times as keys and an array as the value
        // The array is an array of arrays, the inner arrays are the collection of tabs 
        // If we get something at the same time  push into array

    if (request.message === "new_tabs"){
      console.log(request.activeTabsArray);      
      var toAddToQueue = request.activeTabsArray;
      var timing = request.timing;
      updateActiveTabs(toAddToQueue,timing);
    }

    if (request.message === "inputted_tabs"){
      // Inputted tabs are unordered, since they all want ot be opened at seperate times.
      // Since we haven't grouped them, tehn let's just add htem to a new windowId
      // If a windowId already exists add to that one until we get to 20
      console.log("WE GOT A message to inputted tabs")
      var toAddToQueue = request.activeTabsArray;
      updateInputtedTabs(toAddToQueue);
    }
  }
);

//  now we have to set up an async process to listen to the time. When the time = the time in one of those areas open
  // If the trigger is in active Tab open a new window open all of those tabs in that window

chrome.alarms.onAlarm.addListener(function(alarm){
  console.log(alarm,"Please have data that I want")
  var triggerTime = alarm.scheduledTime,
      alarmName = alarm.name,
      activeTabsStringLength = "activeTabsScheduledOpening".length,
      inputtedTabsStringLength = "inputtedTabsScheduledOpening".length,
      activeTabAlarm = alarmName.substring(0,activeTabsStringLength) == "activeTabsScheduledOpening",
      inputtedTabAlarm = alarmName.substring(0,inputtedTabsStringLength) == "inputtedTabsScheduledOpening";

  if(activeTabAlarm){
    console.log(triggerTime)
    openActiveLinkTabs(activeLinkQueue,triggerTime)
  }
  else if(inputtedTabAlarm){
          // if it is add the triggered tab to that window
        // Else create new tab set as new PassiveTab.
      // Create Passive Tab Window add triggered tab to that window
    storageArea.get(["inputtedLinkQueue","inputtedTabWindow"],function(items){
      console.log(items,"inputtedTabAlarm situation")
      var windowId = items.inputtedTabWindow;
      var previousInputtedLinkQueue = items.inputtedLinkQueue;
      var linksToOpen = previousInputtedLinkQueue[triggerTime];
      // First check if there is a passiveTab window
      if(windowId){
        // If there is check if the tab lenght is less than inputtedTabsThreshold
        chrome.windows.get(windowId,{populate: true},function(windowObj){
          console.log(windowObj);
          var oldWindowId = windowObj.id;
          var numberOfTabs = windowObj.tabs.length;
          if (numberOfTabs >= inputtedTabsThreshold ){
            // Create a new Window and Open our tabs there
            console.log("We are over our threshold somehow")
            chrome.windows.create(function(newWindowObj){
              var newWindowId = newWindowObj.id
              linksToOpen.forEach(function(tabObject){
                // tabObject looks like this = {time: time, url: url,  category: category}
                handleOpening(tabObject,newWindowId)
              });
              storageArea.set({"inputtedTabWindow": newWindowId })
            });
          }
          else {
            // Different behavior to open the inputted Tabs
            console.log(linksToOpen,'These are the linksToOpen')
            linksToOpen.forEach(function(tabObject){
              handleOpening(tabObject,oldWindowId)
            });
          }
        })
      } else{
        // There is no WindowId make a new one
        chrome.windows.create(function(newWindowObj){
          var newWindowId = newWindowObj.id
          linksToOpen.forEach(function(tabObject){
            // tabObject looks like this = {time: time, url: url,  category: category}
            handleOpening(tabObject,newWindowId)
          });
          storageArea.set({"inputtedTabWindow": newWindowId })
        });
      }
    })
  } else {
    alert("This is an error")  
  }
})