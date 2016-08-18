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
                    };
    var currentIdentity;
    var periodicInterval;

    $('#pick-a-time').lolliclock({autoclose:true});

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    $('#inputtedLinkHide').children().hide();
    $('#specificTimeHide').children().hide();

    var utils = {

        testIfNewUser : function(){
            chrome.identity.getProfileUserInfo(function(userInfo){
                currentIdentity = userInfo.id;
                storageArea.get("currentIdentity", function(items){
                    // If there is no currentIdentity set yet
                    if (!items.currentIdentity) {
                        chrome.runtime.sendMessage({"message": "new_user", "currentIdentity": currentIdentity });
                    }
                });
            });
        },
        
        update: function() {
            var timeFlag = $('ul[name=timespancategoryActiveTabs]' ).data('timespancategory');
            var tabTime = $('input[name=activeTabsTime]').val() * timeObject[timeFlag] + Date.now() || 3000;
            $('#clock').html( moment(tabTime).format('MMMM Do YYYY, h:mm:ss A'));
        },

        activateBindingFunctions: function(bindingFunctions) {
            for (var key in bindingFunctions ) {
                bindingFunctions[key]();
            }
        },
        parseTimeString: function(time){
            //time looks like 7:37 PM
            
            var newTime = time.split(":");
            var hour = parseInt(newTime[0]) * timeObject.hours;
            var minutesArray = newTime[1].split(" ");
            var amOrPM = minutesArray[1];
            var minutes = parseInt(minutesArray[0]) * timeObject.minutes;
            var modifier = 0;
            if (amOrPM == "PM") {
                modifier = 12 * timeObject.hours;
            }
            var finalTime = hour + minutes + modifier;
            return finalTime;
        }
    };

    var activateForms =  function(){

        var privateFunctions = {

            handleModalBinding : function(){
                // Set up the modalButton
                $(".modalButton").on('click',function(event){
                    var periodicInterval;
                    var formData = [];
                    periodicInterval = $(this).data('interval');

                    // Let's get formData from all Links including time, into an array
                    for (var i = 1; i <= currentNum; i++) {
                        // Get the appropriate data from our input tags
                        var timeFlag         = $('ul[name=timespancategory' + i.toString() + ']' ).data('timespancategory'),
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
            }
        }

        var bindingFunctions = {

           linksFormBinding: function() {
                $("#linksForm").submit(function(event){
                 // Submits our Form adding time delay to opening our tabs
                    console.log('we got to the linksFormBinding')
                    $('#schedulingModal').openModal();
                    privateFunctions.handleModalBinding();
                    event.preventDefault();
                });
           },

           handleHiddenSections: function(){

               $('.showSection').on('click', function(){
                   var sectionToReveal = $(this).data('section');
                   var isHidden = $(this).data('hidden');
                   $(sectionToReveal).children().show();

                   if( isHidden === true ){
                       $(sectionToReveal).children().show();  
                       $(this).data('hidden', false)
                   } else {
                       $(sectionToReveal).children().hide();  
                       $(this).data('hidden', true)
                   }
               });
           }
        }

        utils.activateBindingFunctions(bindingFunctions);
    }

    var sendToNewPages = function() {

        var views = {
            manageCategoriesBinding: function(){
                $("#categoriesViewButton").on('click',function(event){
                    categoriesPage = chrome.extension.getURL("categories.html")
                    chrome.tabs.create({'url': categoriesPage},function(tab){
                    })
                    event.preventDefault();
                })                
            },
            manageAlarmsBinding: function(){

                $("#alarmsViewButton").on('click',function(event){
                    alarmsPage = chrome.extension.getURL("manageAlarms.html")
                    chrome.tabs.create({'url': alarmsPage},function(tab){
                    })
                    event.preventDefault();
                })
            }
        }

        utils.activateBindingFunctions(views); 
    }

    var handleClickEvents = function(){

        // var linkObject = {'categories': [], 'timedLinks': activeTabsArray }

        // If we want to use auth Tokens we need to register our app
        // chrome.identity.getAuthToken({interactive: true}, function(token){
        //
        //   return token
        // })

        var events = {

            getInputtedTabs: function() {
                // <button class="red darken-4 btn getCurrentTabsButton" id="saveAndClose">Save and Close Tabs</button>
                $('#saveAndCloseInputted').on('click', function(event){
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
                                // gotta get the appropriate data from our inputs
                                var dateInFuture = $('input[name=inputtedSpecificDate]').val()
                                var parsedDate = moment(dateInFuture).unix();
                                // parse string into unix is what I need
                                    //
                                // moment(dateInFutureUnix).unix();
                                    // will give me the time since unix epoch 
                                // Date looks like this "16 August, 2016"
                                // console.log(dateInFuture,"What does the date in the future come out as")
                                var timeOnThatDate = $('#pick-a-time').val()
                                console.log(parsedDate,"This is the parsedDate added withParsedTime should give us something good")
                                var parsedTime = utils.parseTimeString(timeOnThatDate);
                                console.log(parsedTime,"This is the parseTime added with parsedDate should give us something good")
                                var finalDateTime = parsedTime + parsedDate;
                                // Time looks like this"8:11 PM" need to parse


                                tabs.forEach(function(tab){
                                    var tabCategory = $('input[name=activeTabCategory]').val() || 'uncategorized';

                                    var currentObj = {'url': tab.url, time: finalDateTime, category: tabCategory, 'title': tab.title, 'periodicInterval': periodicInterval };
                                    activeTabsArray.push(currentObj);
                                });
                                // {time: time, url: url,  category: category}
                                    // add an auto fill with categories that already exist

                                // Send message to our background
                                chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray, "timing": finalDateTime});

                                // Create a new window for our active tabs array
                            // Close the window once we save all of them
                            // Current Problem when we close we lose data
                            
                            // Bind the modalButtons

                            Materialize.toast('Tabs Saved', 1000) ;
                            $('#schedulingModal').closeModal();
                            
                            // IN this case we are closing
                            chrome.windows.remove(currentWindowId);
                        });

                        });
                    });
                    event.preventDefault();
                });
            },
            getCurrentTabs : function(){
                $('.getCurrentTabsButton').on('click', function(event){
                    // get current window in order to close later
                    var currentWindowId;
                    var originalButtonId = this.id;
                    
                    chrome.windows.getCurrent({},function(currentWindow){
                        var activeTabsArray = [];
                        currentWindowId = currentWindow.id;
                        
                        $('#schedulingModal').openModal();

                        $(".modalButton").on('click',function(event){
                            periodicInterval = $(this).data('interval');

                            // Probably want a toast here
                            // get tabs in order to save them
                            chrome.tabs.query({currentWindow: true}, function(tabs){
                                var timeFlag = $('div[name=timespancategoryActiveTabs]' ).data('timespancategory');
                                var tabTime = $('input[name=activeTabsTime]').val() * timeObject[timeFlag] + Date.now() || 3000;

                                tabs.forEach(function(tab){
                                    var tabCategory = $('input[name=activeTabCategory]').val() || 'uncategorized';

                                    var currentObj = {'url': tab.url, time: tabTime, category: tabCategory, 'title': tab.title, 'periodicInterval': periodicInterval };
                                    activeTabsArray.push(currentObj);
                                });
                                // {time: time, url: url,  category: category}
                                    // add an auto fill with categories that already exist

                                // Send message to our background
                                chrome.runtime.sendMessage({"message": "new_tabs", activeTabsArray: activeTabsArray, "timing": tabTime});

                                // Create a new window for our active tabs array
                            // Close the window once we save all of them
                            // Current Problem when we close we lose data
                            
                            // Bind the modalButtons

                            Materialize.toast('Tabs Saved', 1000) ;
                            $('#schedulingModal').closeModal();

                            if (originalButtonId === 'saveAndClose') {
                            chrome.windows.remove(currentWindowId);
                            }
                        });

                        });
                    });
                    event.preventDefault();
                });
            },

            clearAllTabs: function(){

                // When you click on a button called timeSpanChanger, actually make the appropriate minute or hour 
                // or day be what the form understands when you submit the information

                $("#clearAllPeriodicAlarms").on('click', function(event){
                    // Bad practice or not we are only getting the first link's periodic element so we can just remove hte first one
                    storageArea.get('activeLinkQueue', function(activeLinkQueue){
                        activeLinkQueue = activeLinkQueue.activeLinkQueue;
                        var copy = activeLinkQueue;
                        copy[0][0].periodicInterval = "none";
                        storageArea.set({"activeLinkQueue": copy })
                    })
                })
            },

            changeTimeUnitToBeSaved : function(){

                $(document).on('click', '.timeSpanChanger', function(event){
                    // Get the data point
                    var timeSpanSelector = $(this).text().toLowerCase();
                    // Find the exact link to change
                    var dataIndexNumber = $(this).data('indexnumber');
                    // Update link's time category
                    $('ul[name=timespancategory' + dataIndexNumber + ']' ).data('timespancategory', timeSpanSelector)
                    event.preventDefault();
                })
            }

        }

        utils.activateBindingFunctions(events);
    }
    utils.testIfNewUser();
    activateForms();
    sendToNewPages();
    handleClickEvents();
    setInterval(utils.update, 1000);
});

    