var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId,
    deepPopulate = require('mongoose-deep-populate')(mongoose);


var UserSchema = new mongoose.Schema({
  
});


module.exports = mongoose.model('User', UserSchema)