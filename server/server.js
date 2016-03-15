var express = require('express'),
    mongoose = require('mongoose')

// overwrite some of mongoose's promise libraries
mongoose.Promise = require('bluebird');

var app = express();
var port = process.env.PORT || 3000;
var database = process.env.MONGOLAB_URI || "mongodb://localhost/chromeTabScheduler";


mongoose.connect(database);

require('./middleware.js')(app, express);
require('./router.js'    )(app, express);


app.listen(port, function(){
  console.log('APP IS RUNNING ON', port);
});

module.exports = {
  app: app
}