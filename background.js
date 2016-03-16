// Called when the user clicks on the browser action. (Icon in top corner)

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
  function(request,sender,sendResponse){
    if(request.message === "open_new_tab") {
      activeTabsArray.forEach(function(dataPoint){
        scheduleOpening(dataPoint,newWindowId);
      });
    }
  }

);

