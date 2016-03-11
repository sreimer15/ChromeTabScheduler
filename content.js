// Later this will get the current tab's URL and pass it to background script

chrome.runtime.onMessage.addListener(
  function(request,sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      var firstHref = $("a[href^='http']").eq(0).attr("href");
      console.log(firstHref)

      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});      
    }
  }
);

