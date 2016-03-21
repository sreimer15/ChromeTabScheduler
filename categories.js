$(document).ready(function(){
  console.log("broseph we made it")
  var storageArea = chrome.storage.sync;
  var userCategoriesObj;
  var userCategories;

  var addCategorySection = function(userCategoriesObj){
    var userCategoriesArray = Object.keys(userCategoriesObj);
    userCategoriesArray.forEach(function(userCategory){

      // We need to get a favicon and a url
        // http://www.google.com/s2/favicons?domain=(INSERT URL HERE) will get you favicon
          // so <img src="http://www.google.com/s2/favicons?domain=(INSERTURL)>"
      var arrayOfLinks = userCategoriesObj[userCategory];
      arrayOfLinks.forEach(function(linkObj){
        // We can use chrome.tabs.query
        var url = linkObj
      })

    })
  }

  storageArea.get(null,function(items){
    console.log(items,"These are the items")
    userCategoriesObj = items.categories;
  })
  // nameCategory1
});