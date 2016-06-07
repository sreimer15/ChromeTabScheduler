var storageArea = chrome.storage.sync;
var inputtedTabsThreshold = 20;
var oneDay = 1000 * 60 * 60 * 24;
var oneWeek = 1000 * 60 * 60 * 24 * 7;

var periodicTimeObject = {
  "daily": oneDay,
  "weekly": oneWeek
}

 // in our converter it will be if it is none or undefined clear 
  // else pass through this funciton

var backgroundUtils = {

    periodicTimeConverter: function(time, timePeriodString){
        // Time should be milliseconds since epoch
        // We are going to set up and then not clear.
        if (timePeriodString === "daily") {
            return time + oneDay;
        } if (timePeriodString === "weekly") {
            return time + oneWeek;
        } else if (timePeriodString ==="weekdays") {
            // Else our string is daily no weekend
            var newDate = Date(time).getDay();
            var dayOfWeek = newDate.getDay();
            
            if (dayOfWeek === 5){
                // If the day of the week is friday
                // Set up next alarm for two days from now
                return time + (oneDay * 2);
            } else {
                // Set up alarm for tomorrow
                return time + oneDay;
            }
        }
    },

    handleOpening: function(urlObject,windowId){
        var currentUrl = urlObject.url;
        /* We need to set the active property to false, because once we switch tabs
        The create function does not work anymore.
        */ 
        // if we didn't pass in a  window id then just pass in default
        if (!windowId){
            chrome.tabs.create({ url : currentUrl , active : false})
        } else {
            chrome.tabs.create({ url : currentUrl , active : false, windowId: windowId})
        }
    },

    handleCategories: function(categories,urlObject){
        // Checks if category already exists in the user's data.
        var possibleNewCategory = urlObject.category;
        var url = urlObject.url;

        var categoryObject = {"url": url, "read": false, "title": urlObject.title}

        if(categories[possibleNewCategory]){
            categories[possibleNewCategory].push(categoryObject)
        } else {
            categories[possibleNewCategory] = [categoryObject];
        }
        return categories    
    },

    handleTiming: function(previousQueue, newSetOfTabs,timing){
        // Previous Queue is an object with times as keys
        // We pass in our timing as a key, if doesn't exist add to the object
        // We want to return a new queue
        timing = timing.toString();
        if(previousQueue[timing]){
            previousQueue[timing].push(newSetOfTabs);
        } else {
            previousQueue[timing] = [ newSetOfTabs ]
        }
        return previousQueue;
    },

    clearTime: function(linkQueue, alarmName, triggerTime, typeOfQueue){
        // Clears link 
        chrome.alarms.clear(alarmName, function(wasCleared){
            // remove from ActiveLinkQueue
            var updatedQueue = linkQueue;
            console.log(updatedQueue,'Prior to Deletion')

            delete updatedQueue[triggerTime.toString()]
            storageArea.set({ typeOfQueue: updatedQueue })

            storageArea.get(null,function(items){
                console.log(items)
            })
        });
    }

};

var handleTabInteractions = {

    updateActiveTabs: function(toAddToQueue,timing){
        storageArea.get(["activeLinkQueue","categories"] , function(items){
            // Let's get what is in our queue and add our objects
            // This way saves us the trouble of flattening
            var previousQueue = items.activeLinkQueue;
            var currentCategories = items.categories;
            
            toAddToQueue.forEach(function(urlObject){
                // urlObject looks like this = {time: time, url: url,  category: category}
                currentCategories = backgroundUtils.handleCategories(currentCategories,urlObject);
            });
            var newQueue = backgroundUtils.handleTiming(previousQueue,toAddToQueue,timing);
            chrome.alarms.create("activeTabsScheduledOpening" + timing.toString(), {"when": timing})
            var newCategories = currentCategories;
            storageArea.set({ "activeLinkQueue": newQueue });
            storageArea.set({ "categories": newCategories });

        });
    },

    openActiveLinkTabs : function(triggerTime, alarmName) {
        storageArea.get("activeLinkQueue", function(activeLinkQueue){
            activeLinkQueue = activeLinkQueue.activeLinkQueue;

            var linksToOpen = activeLinkQueue[triggerTime];
            // I made the links nested gotta check if I should still be doing that.
            console.log(linksToOpen,'These are where we get index 0 let us see if they can still be nested links')
            var periodicInterval =  linksToOpen[0][0].periodicInterval;


            linksToOpen.forEach(function(arrayOfTabs){
                // This is an array filled with tabs, if we do have two arrays for a
                // given time we categorize them differently, open them in different windows
                chrome.windows.create({focused : true}, function(newWindow){
                    var newWindowId = newWindow.id;
                    // tabObject looks like this = {time: time, url: url,  category: category}
                    arrayOfTabs.forEach(function(tabObject){
                        backgroundUtils.handleOpening(tabObject,newWindowId)
                    });
                });
            });

            console.log(periodicInterval,"This is right before we check to see if we create a new alarm")
            // Delete our alarm and update our ActiveLinkQueue
            if (periodicInterval === "none" || !periodicInterval){
                backgroundUtils.clearTime(activeLinkQueue, alarmName, triggerTime, "activeLinkQueue");
            } else {
                // Clearing the time is redundant but I like the readability
                backgroundUtils.clearTime(activeLinkQueue, alarmName, triggerTime, "activeLinkQueue");

                var newTime = backgroundUtils.periodicTimeConverter(triggerTime,periodicInterval);
                
                chrome.alarms.create("activeTabsScheduledOpening" + newTime.toString(), {"when": newTime});
                var newQueue = backgroundUtils.handleTiming(activeLinkQueue,linksToOpen,newTime);
                // We are adding the same set of tabs to the activeLinkQueue at the new time
                storageArea.set("activeLinkQueue": newQueue);
                // clear old tabs
                backgroundUtils.clearTime(activeLinkQueue, alarmName, triggerTime, "activeLinkQueue");
                console.log(newTime,"This is the new time after our periodic converter")
                
            }
        });
    },

    updateInputtedTabs: function(toAddToQueue) {
        storageArea.get(["inputtedLinkQueue","categories"], function(items){
            var previousQueue = items.inputtedLinkQueue;
            var currentCategories = items.categories;

            toAddToQueue.forEach(function(urlObject){
                currentCategories = backgroundUtils.handleCategories(currentCategories,urlObject);
                var currentTime = urlObject.time;
                previousQueue = backgroundUtils.handleTiming(previousQueue,urlObject,currentTime);
                chrome.alarms.create("inputtedTabsScheduledOpening" + currentTime.toString(),{when: currentTime})
            });
            var newCategories = currentCategories;
            var newQueue = previousQueue;

            storageArea.set({ "inputtedLinkQueue": newQueue });
            storageArea.set({ "categories": newCategories });
        });
    },

    openInputtedLinkTabs: function(triggerTime,alarmTime){
        // if it is add the triggered tab to that window
        // Else create new tab set as new PassiveTab.
        // Create Passive Tab Window add triggered tab to that window
        storageArea.get(["inputtedLinkQueue","inputtedTabWindow"],function(items){
            var windowId = items.inputtedTabWindow;
            var previousInputtedLinkQueue = items.inputtedLinkQueue;
            var linksToOpen = previousInputtedLinkQueue[triggerTime];
            var periodicInterval =  linksToOpen[0][0].periodicInterval;
            // First check if there is a passiveTab window
            if(windowId){
                // If there is check if the tab lenght is less than inputtedTabsThreshold
                chrome.windows.get(windowId,{populate: true},function(windowObj){
                    var oldWindowId = windowObj.id;
                    var numberOfTabs = windowObj.tabs.length;
                    if (numberOfTabs >= inputtedTabsThreshold ){
                        // Create a new Window and Open our tabs there
                        chrome.windows.create(function(newWindowObj){
                            var newWindowId = newWindowObj.id
                            linksToOpen.forEach(function(tabObject){
                                // tabObject looks like this = {time: time, url: url,  category: category}
                                backgroundUtils.handleOpening(tabObject,newWindowId)
                            });
                            storageArea.set({"inputtedTabWindow": newWindowId })
                        });
                    } else {
                        // Different behavior to open the inputted Tabs
                        linksToOpen.forEach(function(tabObject){
                            backgroundUtils.handleOpening(tabObject,oldWindowId)
                        });
                    }
                })
            } else{
                // There is no WindowId make a new one
                chrome.windows.create(function(newWindowObj){
                    var newWindowId = newWindowObj.id
                    linksToOpen.forEach(function(tabObject){
                        // tabObject looks like this = {time: time, url: url,  category: category}
                        backgroundUtils.handleOpening(tabObject,newWindowId)
                    });
                    storageArea.set({"inputtedTabWindow": newWindowId })
                });
            }
            // Let us update our alarm
            if (periodicInterval === "none" || !periodicInterval){
                backgroundUtils.clearTime(previousInputtedLinkQueue, alarmName, triggerTime, "inputtedLinkQueue")
            } else {
                backgroundUtils.clearTime(previousInputtedLinkQueue, alarmName, triggerTime, "inputtedLinkQueue")
                var newTime = backgroundUtils.periodicTimeConverter(time,periodicInterval)
                chrome.alarms.create("inputtedTabsScheduledOpening" + newTime.toString(), {"when": newTime})    
            }
        });
    }

}


// For the Individual Tabs, they will just share a windowId although they have different times.

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    if(request.message === "new_user"){
        var currentIdentity = request.currentIdentity
        storageArea.set({"activeLinkQueue": {}, "categories": { "uncategorized": [] },
        "currentIdentity": currentIdentity, "inputtedLinkQueue": {},
        "inputtedTabWindow": undefined });
    }
    // We want to associate by the message not time, the message defines what window they exist in
    // Let's have an object with times as keys and an array as the value
    // The array is an array of arrays, the inner arrays are the collection of tabs 
    // If we get something at the same time  push into array
    var toAddtoQueue;
    if (request.message === "new_tabs"){
        toAddToQueue = request.activeTabsArray;
        var timing = request.timing;        
        handleTabInteractions.updateActiveTabs(toAddToQueue,timing);
    }

    if (request.message === "inputted_tabs"){
        // Inputted tabs are unordered, since they all want ot be opened at seperate times.
        // Since we haven't grouped them, tehn let's just add htem to a new windowId
        // If a windowId already exists add to that one until we get to 20
        toAddToQueue = request.activeTabsArray;
        handleTabInteractions.updateInputtedTabs(toAddToQueue);
    }
});

//  now we have to set up an async process to listen to the time. When the time = the time in one of those areas open
  // If the trigger is in active Tab open a new window open all of those tabs in that window

chrome.alarms.onAlarm.addListener(function(alarm){
    var triggerTime = alarm.scheduledTime,
        alarmName = alarm.name,
        activeTabsStringLength = "activeTabsScheduledOpening".length,
        inputtedTabsStringLength = "inputtedTabsScheduledOpening".length,
        activeTabAlarm = alarmName.substring(0,activeTabsStringLength) == "activeTabsScheduledOpening",
        inputtedTabAlarm = alarmName.substring(0,inputtedTabsStringLength) == "inputtedTabsScheduledOpening";

    if(activeTabAlarm){
        handleTabInteractions.openActiveLinkTabs(triggerTime,alarmName);
    }
    else if(inputtedTabAlarm){
        handleTabInteractions.openInputtedLinkTabs(triggerTime,alarmName);
    } else {
        alert("This is an error")  
    }
});