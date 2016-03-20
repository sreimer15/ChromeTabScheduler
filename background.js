var storageArea = chrome.storage.sync;

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
    });
    var newCategories = currentCategories;
    var newQueue = previousQueue;

    storageArea.set({ "inputtedLinkQueue": newQueue });
    storageArea.set({ "categories": newCategories });
  });
};

// For the Individual Tabs, they will just share a windowId although they have different times.

chrome.runtime.onMessage.addListener(
  function(request,sender,sendResponse){
    console.log('We are in background.js')
    if(request.message === "new_user"){
      console.log(sender)
      var currentIdentity = request.currentIdentity
      storageArea.set({"activeLinkQueue": {}, "categories": { "uncategorized": [] },
                       "currentIdentity": currentIdentity, "inputtedLinkQueue": {} } );
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
      var toAddToQueue = request.activeTabsArray;
      updateInputtedTabs(toAddToQueue);
    }

  }
);