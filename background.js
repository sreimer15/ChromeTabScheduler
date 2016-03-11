// Called when the user clicks on the browser action. (Icon in top corner)

chrome.browserAction.onClicked.addListener(function(tab){
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    console.log('testing')
    console.log('these are your tabs',tabs[0])
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
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
      chrome.tabs.create({"url": request.url});
    }
  }
);

