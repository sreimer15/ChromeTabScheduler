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

  var addSwitch = function(nameCategoryNumber){
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

  }

  $(document).on('click', 'input[type=checkbox]', function(){
    // Probably gonna have to get a name
    var newValue = $(this).prop('checked')
    console.log($(this).data())
    var dataCategoryNumber = $(this).data('categorynumber')
    var parentCategory = $('h3[name=nameCategory' + dataCategoryNumber + ']').text();
    console.log(parentCategory)

    storageArea.get('categories',function(categories){
      categories = categories.categories
      var oldArrayOfLinks = categories[parentCategory.toLowerCase()];
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
      var arrayOfLinks = userCategoriesObj[userCategory] || [{'url':'whatever','title':'lel'}];
      arrayOfLinks = [{'url':'https://www.reddit.com','title':'lel'}];
      console.log(arrayOfLinks,'These are the array of links')
      arrayOfLinks.forEach(function(linkObj){
        // We can use chrome.tabs.query
        var url = linkObj.url

        console.log(url,"this is the url")
        var title = linkObj.title;

        // Gonna have to differentiate switchNeeded
        // WE NEED HTTPS://WWW.REDDIT.COM

        var faviconQueryString = '<img src="http://www.google.com/s2/favicons?domain=' + url + '">';
        var categorySection = [
                              '<div class="col s6 container">',
                                '<h3 name=nameCategory' + nameCategoryNumber + '>'+ userCategory.toProperCase() + '</h3>',
                                  '<ol class="collection">',
                                    '<li class="collection-item">',
                                    '<a href='+ url + '>',
                                     faviconQueryString,
                                      '<span class="switchNeeded'+ nameCategoryNumber + '">' + title + '</span>',
                                      '</a>',
                                    '</li>',
                                  '</ol>',
                              '</div>'
                              ]

        var categoryHTML = categorySection.join(' ');
        console.log(categoryHTML)
        $('#categoriesMaster').append(categoryHTML);
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