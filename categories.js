$(document).ready(function(){
  var storageArea = chrome.storage.sync;
  var userCategoriesObj;
  var userCategories;
  var nameCategoryNumber = 0;

  var errorMessage = [
	'<div class="row">',
        '<div class="col s12 m6">',
          '<div class="card blue-grey darken-1">',
            '<div class="card-content white-text">',
              '<span class="card-title">No Categories Yet!</span>',
              "<p>Sorry! You haven't put in any categories yet</p>",
            '</div>',
          '</div>',
        '</div>',
    '</div>'
  ].join(' ');

  String.prototype.toProperCase = function()  {
	return this.toLowerCase().replace(/^(.)|\s(.)/g, 
		function($1) { return $1.toUpperCase(); });
};


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
						'<span class="secondary-content removeFromCategory">Remove From Category <i class="material-icons">delete</i> </span>',
						'</div>'
			].join(' ');

			$('.switchNeeded' + nameCategoryNumber).append(HTMLtoAdd);
			var linksToIterate = $('.switchNeeded' + nameCategoryNumber);
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

		addUrlItem: function(linkObj, nameCategoryNumber){
			var url = linkObj.url;
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
				    ].join(' ');
			$('ol[name=collection' + nameCategoryNumber + ']').append(categorySection);
		},

		addCategorySection : function(userCategoriesObj) {
			if (!userCategoriesObj){
				$('body').html(errorMessage);
				return
			}
			var userCategoriesArray = Object.keys(userCategoriesObj);
			
			console.log(userCategoriesObj,'User category object');

			userCategoriesArray.forEach(function(userCategory){
			    nameCategoryNumber++;
			    // We need to get a favicon and a url
			    // http://www.google.com/s2/favicons?domain=(INSERT URL HERE) will get you favicon
			    // so <img src="http://www.google.com/s2/favicons?domain=(INSERTURL)>"
			    var arrayOfLinks = userCategoriesObj[userCategory];
			    var container = [
			        '<div class="col s6 container">',
				        '<h3 name=nameCategory' + nameCategoryNumber + ' data-originalName=' + userCategory + '>'+ userCategory.toProperCase() + '</h3>',
				        '<div class="row container">',
				        	'<input placeholder="input link here" class="col s5 inputNewLink"></input>',
				        	'<button class="col offset-s1 s6 btn waves-effect waves-light addNewLink"> <span class="buttonText">Add New Link! </span> <i class="material-icons iconPos"> library_add </i></button>',
				        '</div>',
				        '<ol class="collection" data-categorynumber=' + nameCategoryNumber + ' name=collection' + nameCategoryNumber + '>',
				        '</ol>',
			        '</div>'
			    ].join(' ');

			    $('#categoriesMaster').append(container);

			    arrayOfLinks.forEach(function(linkObj){
			    	categoryUtils.addUrlItem(linkObj, nameCategoryNumber)
			    });

			    categoryUtils.addSwitch(nameCategoryNumber);
			});
		},

		findLinkObjFromLink: function(oldArrayOfLinks, thisUrl){
			return oldArrayOfLinks.find(function(element){
			    if (element.url === thisURL ){
			    	return true;
			    }
			});
		},

		activateBindingFunctions: function(bindingFunctions) {
		    for (var key in bindingFunctions ) {
		        bindingFunctions[key]();
		    }
		}
	};

	var clickFunctionality = function(){

		var bindingFunctions = {

			markAsReadUnread: function(){
			    $(document).on('click', 'input[type=checkbox]', function(){
			        // Probably gonna have to get a name
			        var newValue = $(this).prop('checked');
			        // New Value is a boolean, true for Read False for Unread
			    
			        var dataCategoryNumber = $(this).data('categorynumber');
			        var parentCategory = $('h3[name=nameCategory' + dataCategoryNumber + ']').data('originalname');

			        var thisURL = $(this).parents("a").attr("href");
			    
			        storageArea.get('categories',function(categories){
			            categories = categories.categories;
			            var oldArrayOfLinks = categories[parentCategory];
			        	
			            var linkObjToUpdate = categoryUtils.findLinkObjFromLink(oldArrayOfLinks,thisUrl);
			            // Update LinkObj, because they are held by reference our categories obj is now updated
			            linkObjToUpdate.read = newValue;
			            storageArea.set({ 'categories': categories });
			        
			        });
				});
			},

			removeFromCategory: function(){
				$(document).on('click', '.removeFromCategory', function(){
					storageArea.get('categories', function(categories){
						categories = categories.categories;
						// We need to get parent Category
						var oldArrayOfLinks = categories[parentCategory];
						var linkObjToUpdate = categoryUtils.findLinkObjFromLink(oldArrayOfLinks,thisUrl);
					});
				});
			},

			addNewLink: function(){
				$(document).on('click','.addNewLink', function(){
					var url = $(this).prev('.inputNewLink').val();
					var newLinkObj = {'url': url, 'title': 'we will get this from async process', ' read': false };
					var nameCategoryNumber = $(this).parent().next('ol').data('categorynumber');
					
					categoryUtils.addUrlItem(newLinkObj, nameCategoryNumber)
					// We gotta add the switch

					var parentCategory = $('h3[name=nameCategory' + nameCategoryNumber + ']').data('originalname');
					storageArea.get('categories', function(categories){
						categories = categories.categories;
						var oldArrayOfLinks = categories[parentCategory];
						oldArrayOfLinks.push(newLinkObj)

						storageArea.set({'categories': categories});
					})

				})
			}
		};

		categoryUtils.activateBindingFunctions(bindingFunctions);
		
	};


	storageArea.get(null ,function(items){
		var userCategoriesObj = items.categories;
		// storageArea.set({ "categories": newCategories });
		  // On clicking a link, let us turn property on or off
		// Add to Dom
		console.log(userCategoriesObj,"this is the userCategories obj that can't be converted for soem reason");
		clickFunctionality();
		console.log(items,"This is the items which should have a categories")
		categoryUtils.addCategorySection(userCategoriesObj);

	});

});