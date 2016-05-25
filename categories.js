$(document).ready(function(){
  var storageArea = chrome.storage.sync;
  var userCategoriesObj;
  var userCategories;
  var nameCategoryNumber = 0;

  String.prototype.toProperCase = function()
  {
	return this.toLowerCase().replace(/^(.)|\s(.)/g, 
		function($1) { return $1.toUpperCase(); });
}


	var categoryUtils = {

		addSwitch : function(nameCategoryNumber,readOrUnread){

			var HTMLtoAdd = [
						'<div class="switch">',
						'<label>',
						'Unread',
						'<input type="checkbox" data-categorynumber=' + nameCategoryNumber +'>',
						'<span class="lever"></span>',
						'Read',
						'</label>',
						'<span class="secondary-content">Remove From Category <i class="material-icons removeFromCategory">delete</i> </span>',
						'</div>'
			].join(' ')

			$('.switchNeeded' + nameCategoryNumber).append(HTMLtoAdd)
			var linksToIterate = $('.switchNeeded' + nameCategoryNumber)
			// Goes through all of the links and sees if they have been read or not and updates
			  // the display
			linksToIterate.each(function(index){
				var switchFlag = $(this).data('read');
				if(switchFlag){
					var inputToChange = $(this).find('input');
					inputToChange.prop('checked', true);
				}
			});
		},

		addCategorySection : function(userCategoriesObj) {
			var userCategoriesArray = Object.keys(userCategoriesObj);
			console.log(userCategoriesObj,'User category object')

			userCategoriesArray.forEach(function(userCategory){
			    nameCategoryNumber++;
			    // We need to get a favicon and a url
			    // http://www.google.com/s2/favicons?domain=(INSERT URL HERE) will get you favicon
			    // so <img src="http://www.google.com/s2/favicons?domain=(INSERTURL)>"
			    var arrayOfLinks = userCategoriesObj[userCategory];
			    var container = [
			        '<div class="col s6 container">',
			        '<h3 name=nameCategory' + nameCategoryNumber + ' data-originalName=' + userCategory + '>'+ userCategory.toProperCase() + '</h3>',
			        '<ol class="collection" name=collection' + nameCategoryNumber + '>',
			        '</ol>',
			        '</div>'
			    ].join(' ');

			    $('#categoriesMaster').append(container);

			    arrayOfLinks.forEach(function(linkObj){
			        // We can use chrome.tabs.query
			        var url = linkObj.url
			        // replace http with https
			        url = url.replace(/^http:\/\//i, 'https://');


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
			            '<span class="switchNeeded'+ nameCategoryNumber + '" data-read=' + read + '>' + title + ' </a> </span>',
			            '</li>'
			        ]

			        var categoryHTML = categorySection.join(' ');
			        $('ol[name=collection' + nameCategoryNumber + ']').append(categoryHTML);
			    })

			    categoryUtils.addSwitch(nameCategoryNumber);
			})
		},

		activateBindingFunctions: function(bindingFunctions) {
		    for (var key in bindingFunctions ) {
		        bindingFunctions[key]();
		    }
		}
	}

	var clickFunctionality = function(){

		var bindingFunctions = {

			markAsReadUnread: function(){
			    $(document).on('click', 'input[type=checkbox]', function(){
			        // Probably gonna have to get a name
			        var newValue = $(this).prop('checked')
			        // New Value is a boolean, true for Read False for Unread
			    
			        var dataCategoryNumber = $(this).data('categorynumber')
			        var parentCategory = $('h3[name=nameCategory' + dataCategoryNumber + ']').data('originalname');

			        var thisURL = $(this).parents("a").attr("href");
			    
			        storageArea.get('categories',function(categories){
			            categories = categories.categories;
			            var oldArrayOfLinks = categories[parentCategory];
			            var indexOfMatch;
			        	
			            var linkObjToUpdate = oldArrayOfLinks.find(function(element,index){
			                if (element.url === thisURL ){
			                indexOfMatch = index;
			                return true;
			                }
			            })
			            // Update LinkObj, because they are held by reference our categories obj is now updated
			            linkObjToUpdate.read = newValue;
			            storageArea.set({ 'categories': categories });
			        
			        });
				});
			}
		}

		categoryUtils.activateBindingFunctions(bindingFunctions)
		
	}


	storageArea.get(null ,function(items){
		var userCategoriesObj = items.categories;
		// storageArea.set({ "categories": newCategories });
		  // On clicking a link, let us turn property on or off
		// Add to Dom
		console.log(userCategoriesObj,"this is the userCategories obj that can't be converted for soem reason")
		clickFunctionality();
		categoryUtils.addCategorySection(userCategoriesObj);

	})

});