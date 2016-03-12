$(document).ready(function(){
  console.log('this is within the popup.js')
  console.log( $('#linksForm').submit );
  $("#linksForm").submit(function(event){
    console.log('let us see if it gets to linksForm' )
    
    // Gets all inputs in an array
    var $inputs = $('#submitLinks :input')
    var formData = {
      'url': $('input[name=firstLink]').val()
    }
    console.log(formData, 'This is the formData')
    event.preventDefault();
  });

});

  