$(document).ready(function(){
  console.log("broseph we made it")
  var storageArea = chrome.storage.sync;
  var userCategoriesObj;
  var userCategories;

  var addCategorySection = function(userCategoriesObj){
    var userCategoriesArray = Object.keys(userCategoriesObj);
    console.log('this is a userCategoriesArray', userCategoriesArray)
    userCategoriesArray.forEach(function(userCategory){
      console.log(userCategory)
      // We need to get a favicon and a url
        // http://www.google.com/s2/favicons?domain=(INSERT URL HERE) will get you favicon
          // so <img src="http://www.google.com/s2/favicons?domain=(INSERTURL)>"
      var arrayOfLinks = userCategoriesObj[userCategory];
      console.log(arrayOfLinks,'These are the array of links')
      arrayOfLinks.forEach(function(linkObj){
        // We can use chrome.tabs.query
        var url = linkObj.url
        console.log(url,"this is the url")
        var title = linkObj.title;
        var faviconQueryString = '<img src="http://www.google.com/s2/favicons?domain=' + url + '>';
        var categorySection = [
                                '<div class="col s6 container">',
                                  '<h3 name=nameCategory1>Uncategorized</h3>',
                                    '<ol>',
                                      '<li>',
                                        faviconQueryString,
                                        '<span>' + title + '</span>',
                                      '</li>',
                                    '</ol>',
                                '</div>'
                              ]
        var categoryHTML = categorySection.join(' ');
        $('#categoriesMaster').append(categoryHTML);
      })

    })
  }

  storageArea.get(null,function(items){
    console.log(items,"These are the items")
    userCategoriesObj = items.categories;
    // Add to Dom
    addCategorySection(userCategoriesObj);
  })
  
});