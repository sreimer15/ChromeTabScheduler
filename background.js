// Called when the user clicks on the browser action. (Icon in top corner)

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


chrome.browserAction.onClicked.addListener(function(tab){
  // Send a message to the active tab
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    console.log('testing')
    // This queries your active tab so your tabs parameter is an array of just one tab
    console.log('this is your active tab',tabs[0])
    var activeTab = tabs[0];
    console.log(chrome.tabs.sendMessage, 'This is the sendMessage thing')
    /*
      Sends a single message to the content script(s) in the specified tab, 
      with an optional callback to run when a response is sent back. 
      The runtime.onMessage event is fired in each content script
       running in the specified tab for the current extension.
    */
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"}, function(response){
      console.log('let us see if we got a response from content.js', response)
    });
  });
});

/*
Sends an arbitrary JSON payload to the current tab. 
  Now we need to listen for that message in content.js:

*/

// We can use the chrome.tabs API to open a new tab:
// But chrome.tabs can only be used in background.js

// This will eventually be the user inputted tab based on our date.


chrome.runtime.onMessage.addListener(
  alert('we got here')
  function(request,sender,sendResponse){
    if(request.message === "open_new_tab") {
      alert('request',request)
      activeTabsArray = request.activeTabsArray;
      newWindowId = request.newWindowId;

      activeTabsArray.forEach(function(dataPoint){
        scheduleOpening(dataPoint,newWindowId);
      });
      //       chrome.windows.remove(currentWindowId);

    }
  }
);

