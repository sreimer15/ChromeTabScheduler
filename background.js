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

chrome.runtime.onMessage.addListener(
  function(request,sender,sendResponse){
    console.log('We are in background.js')
    if(request.message === "new_user"){
      console.log(sender)
      var currentIdentity = request.currentIdentity
      storageArea.set({"linkQueue": [], "categories": { "uncategorized": [] }, "currentIdentity": currentIdentity });
    }

    if (request.message === "new_tabs"){
      console.log('new_tabs message has been sent')
      console.log(request.activeTabsArray);
      var toAddToQueue = request.activeTabsArray;
      storageArea.get(["linkQueue","categories"] , function(items){
        console.log(items,'These are the items you get when you pass an array');
        // Let's get what is in our queue and add our objects
          // This way saves us the trouble of flattening
          var previousQueue = items.linkQueue;
          var currentCategories = items.categories;
        toAddToQueue.forEach(function(urlObject){
          // urlObject looks like this = {time: time, url: url,  category: category}
          currentCategories = handleCategories(currentCategories,urlObject);
          previousQueue.push(urlObject)
        })
        var newQueue = previousQueue;
        var newCategories = currentCategories;
        console.log('We are about to set new linkQueue')
        console.log(newQueue)
        console.log(newCategories)
        storageArea.set({ "linkQueue": newQueue });
        storageArea.set({ "categories": newCategories });
      })
    }

  }
);