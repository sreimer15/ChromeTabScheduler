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
            var timeFlag = $('div[name=timespancategoryActiveTabs]' ).data('timespancategory');
            var tabTime = $('input[name=activeTabsTime]').val() * timeObject[timeFlag] + Date.now() || 3000;
            $('#clock').html( moment(tabTime).format('MMMM Do YYYY, h:mm:ss A'));
        },

        activateBindingFunctions: function(bindingFunctions) {
            for (var key in bindingFunctions ) {
                bindingFunctions[key]();
            }
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
                    $('div[name=timespancategory' + dataIndexNumber + ']' ).data('timespancategory', timeSpanSelector)
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

    