$(document).ready(function(){
  console.log("broseph we made it")
  var storageArea = chrome.storage.sync;
  var userCategoriesObj;
  var userCategories;
  var nameCategoryNumber = 0;

  String.prototype.toProperCase = function()
  {
    return this.toLowerCase().replace(/^(.)|\s(.)/g, 
        function($1) { return $1.toUpperCase(); });
  }

  var addSwitch = function(nameCategoryNumber,readOrUnread){

    var HTMLtoAdd = [
    '<div class="switch">',
      '<label>',
        'Unread',
        '<input type="checkbox" data-categorynumber=' + nameCategoryNumber +'>',
        '<span class="lever"></span>',
        'Read',
    '</label>',
    '</div>'
    ].join(' ')

    $('.switchNeeded' + nameCategoryNumber).append(HTMLtoAdd)
    var linksToIterate = $('.switchNeeded' + nameCategoryNumber)
    linksToIterate.each(function(index){
      console.log($(this).data('read'))
      var switchFlag = $(this).data('read');
      if(switchFlag){
        console.log('we made it')
        var inputToChange = $(this).find('input');
        console.log(inputToChange)
        inputToChange.prop('checked', true);
      };
    });

  }

  $(document).on('click', 'input[type=checkbox]', function(){
    // Probably gonna have to get a name
    var newValue = $(this).prop('checked')
    // New Value is a boolean, true for Read False for Unread
    
    var dataCategoryNumber = $(this).data('categorynumber')
    var parentCategory = $('h3[name=nameCategory' + dataCategoryNumber + ']').text();
    
    var thisURL = $(this).parents("a").attr("href");
    console.log(thisURL)

    storageArea.get('categories',function(categories){
      categories = categories.categories;
      console.log(categories)
      var oldArrayOfLinks = categories[parentCategory];
      console.log(oldArrayOfLinks);
      var indexOfMatch;

      var linkObjToUpdate = oldArrayOfLinks.find(function(element,index){
        if (element.url === thisURL ){
          indexOfMatch = index;
          return true;
        }
      })
      // Update LinkObj, because they are held by reference our categories obj is now updated
      linkObjToUpdate.read = newValue;

      // oldArrayOfLinks[indexOfMatch] = linkObjToUpdate;
      // var updatedObject = categories[parentCategory];
      

      storageArea.set({ 'categories': categories });

      // Use our index of match to update and re-set our categories Obj with new Prop

      // find the urls that you are updating
      
    })


  })

  var addCategorySection = function(userCategoriesObj){
    var userCategoriesArray = Object.keys(userCategoriesObj);
    console.log('this is a userCategoriesArray', userCategoriesArray)
    userCategoriesArray.forEach(function(userCategory){
      nameCategoryNumber++;
      console.log(userCategory)
      // We need to get a favicon and a url
        // http://www.google.com/s2/favicons?domain=(INSERT URL HERE) will get you favicon
          // so <img src="http://www.google.com/s2/favicons?domain=(INSERTURL)>"
      var arrayOfLinks = userCategoriesObj[userCategory];
      
      console.log(arrayOfLinks,'These are the array of links')
      var container = [
      '<div class="col s6 container">',
        '<h3 name=nameCategory' + nameCategoryNumber + '>'+ userCategory.toProperCase() + '</h3>',
          '<ol class="collection" name=collection' + nameCategoryNumber + '>',
              '</ol>',
          '</div>'
      ].join(' ');
      $('#categoriesMaster').append(container);
      
      arrayOfLinks.forEach(function(linkObj){
        // We can use chrome.tabs.query
        var url = linkObj.url

        var title = linkObj.title;
        var read = linkObj.read;

        // Gonna have to differentiate switchNeeded
        // WE NEED HTTPS://WWW.REDDIT.COM


        var faviconQueryString = '<img src="http://www.google.com/s2/favicons?domain=' + url + '">';
        var categorySection = [
                                    '<li class="collection-item">',
                                    '<a href="'+ url + '">',
                                     faviconQueryString,
                                     // Need to get parent of input which should be span
                                     // Then parent of span which should be a tag 
                                      // Worst Case Scenario we create a linkNumber
                                      '<span class="switchNeeded'+ nameCategoryNumber + '" data-read=' + read + '>' + title + '</span>',
                                      '</a>',
                                    '</li>'
                              ]

        var categoryHTML = categorySection.join(' ');
        $('ol[name=collection' + nameCategoryNumber + ']').append(categoryHTML);
      })

      addSwitch(nameCategoryNumber);

    })
  }

  storageArea.get(null,function(items){
    console.log(items,"These are the items")
    userCategoriesObj = items.categories;
    // storageArea.set({ "categories": newCategories });
      // On clicking a link, let us turn property on or off
    // Add to Dom
    addCategorySection(userCategoriesObj);
  })
  
});